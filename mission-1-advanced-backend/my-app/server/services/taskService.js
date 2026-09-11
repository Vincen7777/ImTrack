import { Op } from 'sequelize';
import { HttpError } from '../errors/httpError.js';

function mapTask(instance) {
  if (!instance) return null;
  const row = instance.get({ plain: true });
  return {
    id: String(row.task_id), title: row.title, priority: row.priority, status: row.status,
    due: row.due_date, cat: row.category || '', tags: (row.tags || []).map((tag) => tag.name),
    isRecurring: Boolean(row.is_recurring),
    ...(row.recurrence ? { recurrenceType: row.recurrence.recurrence_type } : {}),
  };
}

export function createTaskService(sequelize, { Task, Tag, TaskTag, Recurrence }) {
  const include = [{ model: Tag, as: 'tags', through: { attributes: [] } }, { model: Recurrence, as: 'recurrence' }];
  const owned = (id, userId) => ({ task_id: id, user_id: userId, deleted_at: null });
  const find = async (id, userId, transaction) => mapTask(await Task.findOne({ where: owned(id, userId), include, transaction }));
  async function syncTags(task, names, userId, transaction) {
    const tags = [];
    for (const name of names) {
      const [tag] = await Tag.findOrCreate({ where: { user_id: userId, name }, transaction });
      tags.push(tag);
    }
    await task.setTags(tags, { transaction });
  }
  function fields(payload) {
    const result = {};
    for (const [key, column] of Object.entries({ title: 'title', priority: 'priority', status: 'status', due: 'due_date', cat: 'category', isRecurring: 'is_recurring' })) {
      if (key in payload) result[column] = payload[key];
    }
    return result;
  }
  return {
    async getAll(userId, query = {}) {
      const where = { user_id: userId, deleted_at: null };
      for (const [key, column] of Object.entries({ status: 'status', priority: 'priority', cat: 'category' })) {
        if (query[key] !== undefined) where[column] = query[key];
      }
      if (query.search) {
        // Escape LIKE wildcards: % and _ in input search for literal characters.
        where.title = { [Op.like]: '%' + query.search.replace(/[\\%_]/g, '\\$&') + '%' };
      }
      const sortFields = { createdAt: 'created_at', title: 'title', due: 'due_date', priority: 'priority', status: 'status' };
      const sort = sortFields[query.sort] || 'created_at';
      return (await Task.findAll({ where, include, order: [[sort, query.order === 'asc' ? 'ASC' : 'DESC'], ['task_id', 'DESC']] })).map(mapTask);
    },
    getById: find,
    async create(payload, userId) {
      return sequelize.transaction(async (transaction) => {
        let recurrence = null;
        if (payload.isRecurring) recurrence = await Recurrence.create({ recurrence_type: payload.recurrenceType, start_date: payload.due || new Date().toISOString().slice(0, 10) }, { transaction });
        const task = await Task.create({ ...fields(payload), user_id: userId, recurrence_id: recurrence?.recurrence_id || null }, { transaction });
        await syncTags(task, payload.tags || [], userId, transaction);
        return find(task.task_id, userId, transaction);
      });
    },
    async update(id, payload, userId) {
      return sequelize.transaction(async (transaction) => {
        const task = await Task.findOne({ where: owned(id, userId), transaction, lock: transaction.LOCK.UPDATE });
        if (!task) return null;
        const changes = fields(payload);
        const shouldRecur = payload.isRecurring ?? (payload.recurrenceType ? true : task.is_recurring);
        const oldRecurrenceId = task.recurrence_id;
        if (!shouldRecur) {
          changes.is_recurring = false;
          changes.recurrence_id = null;
        } else if (!oldRecurrenceId) {
          if (!payload.recurrenceType) throw new HttpError(422, 'recurrenceType wajib saat mengaktifkan task berulang');
          const recurrence = await Recurrence.create({ recurrence_type: payload.recurrenceType, start_date: payload.due || task.due_date || new Date().toISOString().slice(0, 10) }, { transaction });
          changes.recurrence_id = recurrence.recurrence_id;
          changes.is_recurring = true;
        } else if (payload.recurrenceType) {
          await Recurrence.update({ recurrence_type: payload.recurrenceType }, { where: { recurrence_id: oldRecurrenceId }, transaction });
        }
        await task.update(changes, { transaction });
        if (!shouldRecur && oldRecurrenceId) await Recurrence.destroy({ where: { recurrence_id: oldRecurrenceId }, transaction });
        if ('tags' in payload) await syncTags(task, payload.tags, userId, transaction);
        return find(id, userId, transaction);
      });
    },
    async remove(id, userId) {
      return sequelize.transaction(async (transaction) => {
        const task = await Task.findOne({ where: owned(id, userId), transaction, lock: transaction.LOCK.UPDATE });
        if (!task) return false;
        await TaskTag.destroy({ where: { task_id: id }, transaction });
        await task.destroy({ transaction });
        if (task.recurrence_id) await Recurrence.destroy({ where: { recurrence_id: task.recurrence_id }, transaction });
        return true;
      });
    },
  };
}
