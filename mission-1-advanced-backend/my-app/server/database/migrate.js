import 'dotenv/config';
import { DataTypes } from 'sequelize';
import { pathToFileURL } from 'node:url';
import { createDatabase } from '../config/database.js';
import { defineModels } from '../models/index.js';

// Additive migration: preserve existing users, tasks, and tables from the earlier mission.
export async function migrate(sequelize) {
  const query = sequelize.getQueryInterface();
  const tables = await query.showAllTables();
  if (tables.includes('users')) {
    const columns = await query.describeTable('users');
    const additions = {
      fullname: { type: DataTypes.STRING(100), allowNull: true },
      verification_token: { type: DataTypes.STRING(64), allowNull: true, unique: true },
      verification_expires_at: { type: DataTypes.DATE, allowNull: true },
      email_verified_at: { type: DataTypes.DATE, allowNull: true },
    };
    for (const [name, spec] of Object.entries(additions)) {
      if (!columns[name]) await query.addColumn('users', name, spec);
    }
    await sequelize.query(columns.display_name
      ? 'UPDATE users SET fullname = COALESCE(display_name, username) WHERE fullname IS NULL'
      : 'UPDATE users SET fullname = username WHERE fullname IS NULL');
    await query.changeColumn('users', 'fullname', { type: DataTypes.STRING(100), allowNull: false });
  }
  await sequelize.sync(); // CREATE IF NOT EXISTS only; never force/alter existing tables.
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const database = createDatabase();
  defineModels(database);
  try {
    await migrate(database);
    console.log('Migrasi selesai. Tabel tersedia; data lama dipertahankan.');
  } catch (error) {
    console.error('Migrasi gagal:', error.message);
    process.exitCode = 1;
  } finally {
    await database.close();
  }
}
