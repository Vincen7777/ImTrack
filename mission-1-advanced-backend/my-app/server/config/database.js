import { Sequelize } from 'sequelize';

export function createDatabase() {
  return new Sequelize(process.env.DB_NAME || 'imtrack_db', process.env.DB_USER || 'root', process.env.DB_PASSWORD || '', {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    dialect: 'mysql',
    logging: false,
    dialectOptions: { supportBigNumbers: true, bigNumberStrings: true },
    pool: { max: Number(process.env.DB_CONNECTION_LIMIT || 10), min: 0 },
    define: { charset: 'utf8mb4', collate: 'utf8mb4_unicode_ci' },
  });
}
