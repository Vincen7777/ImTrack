import 'dotenv/config';
import { createApp } from './app.js';
import { createDatabasePool, verifyDatabaseConnection } from './config/database.js';
import { createTaskService } from './services/taskService.js';

const port = Number(process.env.PORT ?? 3000);
if (!Number.isInteger(port) || port <= 0 || port > 65535) {
  throw new Error('PORT harus berupa bilangan bulat antara 1 dan 65535');
}

const pool = createDatabasePool();

try {
  await verifyDatabaseConnection(pool);
  const app = createApp(createTaskService(pool));
  const server = app.listen(port, () => {
    console.log(`ImTrack API berjalan di http://localhost:${port}/api`);
  });

  const shutdown = async (signal) => {
    console.log(`\n${signal} diterima, menutup server...`);
    server.close(async () => {
      await pool.end();
      process.exit(0);
    });
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
} catch (error) {
  const nestedErrors = Array.isArray(error.errors)
    ? error.errors.map((item) => item.code ?? item.message).filter(Boolean).join(', ')
    : '';
  const reason = error.code || error.message || nestedErrors || 'penyebab tidak diketahui';
  console.error('Gagal terhubung ke MySQL:', reason);
  await pool.end();
  process.exitCode = 1;
}
