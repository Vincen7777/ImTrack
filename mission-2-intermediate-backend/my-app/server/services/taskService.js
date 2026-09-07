import { HttpError } from '../errors/httpError.js';

const TASK_SELECT = `
  SELECT
    CAST(t.task_id AS CHAR) AS id,
    t.title,
    t.priority,
    t.status,
    t.due_date AS due,
    t.category AS cat,
    t.is_recurring AS isRecurring,
    r.recurrence_type AS recurrenceType,
    (
      SELECT JSON_ARRAYAGG(tags.name)
      FROM task_tags
      INNER JOIN tags ON tags.tag_id = task_tags.tag_id
      WHERE task_tags.task_id = t.task_id
    ) AS tags
  FROM tasks AS t
  LEFT JOIN recurrences AS r ON r.recurrence_id = t.recurrence_id
`;

function parseTags(value) {
  if (Array.isArray(value)) return value;
  if (Buffer.isBuffer(value)) value = value.toString('utf8');
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return [];
    }
  }
  return [];
}

function mapTask(row) {
  return {
    id: String(row.id),
    title: row.title,
    priority: row.priority,
    status: row.status,
    due: row.due,
    tags: parseTags(row.tags),
    cat: row.cat ?? '',
    isRecurring: Boolean(row.isRecurring),
    ...(row.recurrenceType ? { recurrenceType: row.recurrenceType } : {}),
  };
}

const today = () => new Date().toISOString().slice(0, 10);

async function inTransaction(pool, callback) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function findTask(executor, taskId, userId) {
  const [rows] = await executor.execute(
    `${TASK_SELECT} WHERE t.task_id = ? AND t.user_id = ? AND t.deleted_at IS NULL`,
    [taskId, userId],
  );
  return rows[0] ? mapTask(rows[0]) : null;
}

async function getTaskMetadata(executor, taskId, userId) {
  const [rows] = await executor.execute(
    `SELECT recurrence_id, is_recurring
     FROM tasks
     WHERE task_id = ? AND user_id = ? AND deleted_at IS NULL
     FOR UPDATE`,
    [taskId, userId],
  );
  return rows[0] ?? null;
}

async function syncTags(connection, taskId, userId, tags) {
  await connection.execute('DELETE FROM task_tags WHERE task_id = ?', [taskId]);

  for (const name of tags) {
    const [result] = await connection.execute(
      `INSERT INTO tags (user_id, name)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE tag_id = LAST_INSERT_ID(tag_id)`,
      [userId, name],
    );
    await connection.execute(
      'INSERT INTO task_tags (task_id, tag_id) VALUES (?, ?)',
      [taskId, result.insertId],
    );
  }
}

export function createTaskService(pool) {
  return {
    async getAll(userId) {
      const [rows] = await pool.execute(
        `${TASK_SELECT} WHERE t.user_id = ? AND t.deleted_at IS NULL ORDER BY t.created_at DESC`,
        [userId],
      );
      return rows.map(mapTask);
    },

    async getById(taskId, userId) {
      return findTask(pool, taskId, userId);
    },

    async create(payload, userId) {
      return inTransaction(pool, async (connection) => {
        let recurrenceId = null;
        if (payload.isRecurring) {
          const [recurrence] = await connection.execute(
            `INSERT INTO recurrences (recurrence_type, start_date)
             VALUES (?, ?)`,
            [payload.recurrenceType, payload.due ?? today()],
          );
          recurrenceId = recurrence.insertId;
        }

        const [result] = await connection.execute(
          `INSERT INTO tasks
             (user_id, recurrence_id, title, priority, status, due_date, category, is_recurring)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            userId,
            recurrenceId,
            payload.title,
            payload.priority ?? 'Nanti',
            payload.status ?? 'todo',
            payload.due ?? null,
            payload.cat ?? '',
            payload.isRecurring ? 1 : 0,
          ],
        );

        await syncTags(connection, result.insertId, userId, payload.tags ?? []);
        return findTask(connection, result.insertId, userId);
      });
    },

    async update(taskId, payload, userId) {
      return inTransaction(pool, async (connection) => {
        const metadata = await getTaskMetadata(connection, taskId, userId);
        if (!metadata) return null;

        let recurrenceId = metadata.recurrence_id;
        const shouldRecur = payload.isRecurring ??
          ('recurrenceType' in payload ? true : Boolean(metadata.is_recurring));

        if (!shouldRecur && recurrenceId) {
          await connection.execute(
            'UPDATE tasks SET recurrence_id = NULL, is_recurring = 0 WHERE task_id = ?',
            [taskId],
          );
          await connection.execute('DELETE FROM recurrences WHERE recurrence_id = ?', [recurrenceId]);
          recurrenceId = null;
        } else if (shouldRecur) {
          if (recurrenceId) {
            if (payload.recurrenceType) {
              await connection.execute(
                'UPDATE recurrences SET recurrence_type = ? WHERE recurrence_id = ?',
                [payload.recurrenceType, recurrenceId],
              );
            }
          } else {
            if (!payload.recurrenceType) {
              throw new HttpError(422, 'recurrenceType wajib saat mengaktifkan task berulang');
            }
            const [recurrence] = await connection.execute(
              'INSERT INTO recurrences (recurrence_type, start_date) VALUES (?, ?)',
              [payload.recurrenceType, payload.due ?? today()],
            );
            recurrenceId = recurrence.insertId;
          }
        }

        const fieldMap = {
          title: 'title',
          priority: 'priority',
          status: 'status',
          due: 'due_date',
          cat: 'category',
        };
        const assignments = [];
        const values = [];
        for (const [apiField, databaseField] of Object.entries(fieldMap)) {
          if (apiField in payload) {
            assignments.push(`${databaseField} = ?`);
            values.push(payload[apiField]);
          }
        }
        if ('isRecurring' in payload || 'recurrenceType' in payload) {
          assignments.push('is_recurring = ?', 'recurrence_id = ?');
          values.push(shouldRecur ? 1 : 0, recurrenceId);
        }
        if (assignments.length) {
          await connection.execute(
            `UPDATE tasks SET ${assignments.join(', ')} WHERE task_id = ? AND user_id = ?`,
            [...values, taskId, userId],
          );
        }
        if ('tags' in payload) {
          await syncTags(connection, taskId, userId, payload.tags);
        }

        return findTask(connection, taskId, userId);
      });
    },

    async remove(taskId, userId) {
      return inTransaction(pool, async (connection) => {
        const metadata = await getTaskMetadata(connection, taskId, userId);
        if (!metadata) return false;

        const [result] = await connection.execute(
          'DELETE FROM tasks WHERE task_id = ? AND user_id = ?',
          [taskId, userId],
        );
        if (metadata.recurrence_id) {
          await connection.execute('DELETE FROM recurrences WHERE recurrence_id = ?', [metadata.recurrence_id]);
        }
        return result.affectedRows > 0;
      });
    },
  };
}
