import mysql from 'mysql2/promise';

const numberFromEnv = (name, fallback) => {
  const value = Number(process.env[name] ?? fallback);
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`${name} harus berupa bilangan bulat positif`);
  }
  return value;
};

export function createDatabasePool() {
  return mysql.createPool({
    host: process.env.DB_HOST ?? 'localhost',
    port: numberFromEnv('DB_PORT', 3306),
    user: process.env.DB_USER ?? 'root',
    password: process.env.DB_PASSWORD ?? '',
    database: process.env.DB_NAME ?? 'imtrack_db',
    waitForConnections: true,
    connectionLimit: numberFromEnv('DB_CONNECTION_LIMIT', 10),
    queueLimit: 0,
    dateStrings: true,
  });
}

export async function verifyDatabaseConnection(pool) {
  const connection = await pool.getConnection();
  try {
    await connection.query('SELECT 1');
  } finally {
    connection.release();
  }
}
