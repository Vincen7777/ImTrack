import 'dotenv/config';
import { createApp } from './app.js';
import { createDatabase } from './config/database.js';
import { runtimeConfig } from './config/runtime.js';
import { defineModels } from './models/index.js';
import { createTaskService } from './services/taskService.js';
import { createAuthService } from './services/authService.js';
import { createMailService } from './services/mailService.js';

const config = runtimeConfig();
const database = createDatabase();
const models = defineModels(database);
try {
  await database.authenticate();
  // Fail early with a useful error if db:migrate has not run.
  await models.User.findOne({ attributes: ['user_id', 'fullname', 'verification_token'] });
  const authService = createAuthService({ User: models.User, mailService: createMailService(config), jwtSecret: config.jwtSecret });
  const app = createApp({ taskService: createTaskService(database, models), authService, config });
  const server = app.listen(config.port, () => {
    console.log('ImTrack API berjalan di http://localhost:' + config.port + '/api');
    if (config.mailMode === 'file') console.log('Email lokal disimpan di server/storage/mail/*.eml (tidak dikirim ke inbox).');
  });
  for (const signal of ['SIGINT', 'SIGTERM']) {
    process.on(signal, () => {
      server.close(async () => { await database.close(); process.exit(0); });
      setTimeout(() => process.exit(1), 10000).unref();
    });
  }
} catch (error) {
  console.error('API gagal dimulai. Periksa MySQL, .env, dan jalankan npm run db:migrate. Detail:', error.message);
  await database.close();
  process.exitCode = 1;
}
