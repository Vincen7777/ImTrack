import 'dotenv/config';
import assert from 'node:assert/strict';
import { before, after, describe, test } from 'node:test';
import { randomUUID } from 'node:crypto';
import { mkdtemp, rm, readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import { createDatabase } from '../../config/database.js';
import { defineModels } from '../../models/index.js';
import { migrate } from '../../database/migrate.js';
import { createApp } from '../../app.js';
import { createAuthService, hashToken } from '../../services/authService.js';
import { createTaskService } from '../../services/taskService.js';
import { createMailService } from '../../services/mailService.js';

describe('Mission end-to-end with real MySQL + Sequelize', () => {
  let admin, database, models, server, base, root, userA, userB, tokenA, tokenB, taskId;
  const mails = [];
  const databaseName = 'imtrack_test_' + randomUUID().replaceAll('-', '');
  const password = 'ValidPassword123!';
  let mailFails = false;
  const json = (body, token) => ({ method: 'POST', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) }, body: JSON.stringify(body) });
  const headers = (token) => ({ Authorization: 'Bearer ' + token });
  const request = (route, options = {}) => fetch(base + route, options);
  const register = async (name) => {
    const response = await request('/auth/register', json({ fullname: 'Student ' + name, username: name, email: name + '@example.test', password }));
    assert.equal(response.status, 201);
    return (await response.json()).user;
  };
  const verify = (token) => request('/auth/verify-email', json({ token }));
  before(async () => {
    admin = await mysql.createConnection({ host: process.env.TEST_DB_HOST || process.env.DB_HOST || 'localhost', port: Number(process.env.TEST_DB_PORT || process.env.DB_PORT || 3306), user: process.env.TEST_DB_USER || process.env.DB_USER || 'root', password: process.env.TEST_DB_PASSWORD ?? process.env.DB_PASSWORD ?? '' });
    await admin.query('CREATE DATABASE ' + databaseName + ' CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
    process.env.DB_NAME = databaseName;
    for (const suffix of ['HOST', 'PORT', 'USER', 'PASSWORD']) if (process.env['TEST_DB_' + suffix] !== undefined) process.env['DB_' + suffix] = process.env['TEST_DB_' + suffix];
    database = createDatabase();
    models = defineModels(database);
    // Simulate the previous mission's users table and confirm migration preserves its data.
    await database.query('CREATE TABLE users (user_id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT, username VARCHAR(50) NOT NULL UNIQUE, email VARCHAR(255) NOT NULL UNIQUE, password_hash VARCHAR(255) NOT NULL, display_name VARCHAR(100), avatar_url VARCHAR(500), is_active TINYINT(1) NOT NULL DEFAULT 1, created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP)');
    await database.query("INSERT INTO users (username,email,password_hash,display_name) VALUES ('legacy','legacy@example.test','old-placeholder','Legacy Student')");
    await migrate(database);
    await migrate(database);
    root = await mkdtemp(path.resolve('tmp/mission-integration-'));
    const config = { jwtSecret: 'integration-test-secret-long-enough-123456', corsOrigin: 'http://localhost:5173', uploadDir: path.join(root, 'upload') };
    const authService = createAuthService({ User: models.User, jwtSecret: config.jwtSecret, mailService: { sendVerification: async (email, token) => { if (mailFails) throw new Error('SMTP unavailable'); mails.push({ email, token }); return 'file'; } } });
    const app = createApp({ config, authService, taskService: createTaskService(database, models) });
    await new Promise((resolve) => { server = app.listen(0, '127.0.0.1', resolve); });
    base = 'http://127.0.0.1:' + server.address().port + '/api';
  });
  after(async () => {
    if (server) await new Promise((resolve) => server.close(resolve));
    if (database) await database.close();
    if (admin) {
      if (!/^imtrack_test_[a-f0-9]{32}$/.test(databaseName)) throw new Error('Unsafe test database name');
      await admin.query('DROP DATABASE IF EXISTS ' + databaseName);
      await admin.end();
    }
    if (root) {
      const workspaceTmp = path.resolve('tmp') + path.sep;
      if (!root.startsWith(workspaceTmp)) throw new Error('Unsafe test directory');
      await rm(root, { recursive: true, force: true });
    }
  });
  test('additive migration preserves legacy users and can run twice', async () => {
    const legacy = await models.User.findOne({ where: { username: 'legacy' } });
    assert.equal(legacy.fullname, 'Legacy Student');
    assert.equal(legacy.email_verified_at, null);
  });
  test('register stores bcrypt password and hashed UUID token without exposing secrets', async () => {
    userA = await register('student_a');
    const record = await models.User.findByPk(userA.id);
    assert.ok(await bcrypt.compare(password, record.password_hash));
    assert.notEqual(record.password_hash, password);
    assert.equal(record.verification_token, hashToken(mails.at(-1).token));
    assert.equal(userA.password_hash, undefined);
    assert.equal(userA.verification_token, undefined);
    assert.equal(userA.emailVerified, false);
    const duplicate = await request('/auth/register', json({ fullname: 'Duplicate', username: 'student_a', email: 'different@example.test', password }));
    assert.equal(duplicate.status, 409);
  });
  test('login rejects unverified users and wrong credentials', async () => {
    assert.equal((await request('/auth/login', json({ email: userA.email, password }))).status, 403);
    for (const data of [{ email: userA.email, password: 'incorrect' }, { email: 'missing@example.test', password }]) {
      const response = await request('/auth/login', json(data)); assert.equal(response.status, 401);
      assert.equal((await response.json()).error.message, 'Email atau password yang dimasukkan salah');
    }
  });
  test('verification token is single-use, including concurrent requests', async () => {
    const token = mails.find((mail) => mail.email === userA.email).token;
    const responses = await Promise.all([verify(token), verify(token)]);
    assert.deepEqual(responses.map((r) => r.status).sort(), [200, 400]);
    assert.equal((await verify('invalid')).status, 400);
    const response = await request('/auth/login', json({ email: userA.email, password }));
    assert.equal(response.status, 200); tokenA = (await response.json()).token;
    const me = await request('/auth/me', { headers: headers(tokenA) });
    assert.equal((await me.json()).user.fullname, 'Student student_a');
  });
  test('expired tokens fail; resend rotates the token and permits verification', async () => {
    userB = await register('student_b');
    const oldToken = mails.at(-1).token;
    await models.User.update({ verification_expires_at: new Date(0) }, { where: { user_id: userB.id } });
    assert.equal((await verify(oldToken)).status, 400);
    assert.equal((await request('/auth/resend-verification', json({ email: userB.email }))).status, 200);
    assert.notEqual(mails.at(-1).token, oldToken);
    assert.equal((await verify(oldToken)).status, 400);
    assert.equal((await verify(mails.at(-1).token)).status, 200);
    tokenB = (await (await request('/auth/login', json({ email: userB.email, password }))).json()).token;
  });
  test('email failure preserves account and resend recovers it', async () => {
    mailFails = true;
    const response = await request('/auth/register', json({ fullname: 'Recovery', username: 'recovery', email: 'recovery@example.test', password }));
    assert.equal(response.status, 201); assert.equal((await response.json()).emailDelivery, 'failed');
    mailFails = false;
    assert.equal((await request('/auth/resend-verification', json({ email: 'recovery@example.test' }))).status, 200);
    assert.equal((await verify(mails.at(-1).token)).status, 200);
  });
  test('creates relational tasks with tags and recurrence', async () => {
    const response = await request('/task', json({ title: 'Belajar Node 100%', cat: 'Belajar', priority: 'Sekarang', tags: ['backend', 'node'], isRecurring: true, recurrenceType: 'weekly', due: '2026-12-20' }, tokenA));
    assert.equal(response.status, 201);
    const task = await response.json(); taskId = task.id;
    assert.deepEqual(task.tags.sort(), ['backend', 'node']); assert.equal(task.recurrenceType, 'weekly');
    assert.equal(await models.TaskTag.count(), 2);
    await request('/task', json({ title: 'Zebra Node', cat: 'Belajar', priority: 'Sekarang' }, tokenA));
    await request('/task', json({ title: 'Private B', cat: 'Belajar' }, tokenB));
  });
  test('filters, sorting, search, literal wildcards, and SQL injection handling use real queries', async () => {
    let response = await request('/task?cat=Belajar&priority=Sekarang&status=todo&search=Node&sort=title&order=desc', { headers: headers(tokenA) });
    assert.equal(response.status, 200); assert.deepEqual((await response.json()).map((t) => t.title), ['Zebra Node', 'Belajar Node 100%']);
    response = await request('/task?search=%25', { headers: headers(tokenA) });
    assert.deepEqual((await response.json()).map((t) => t.id), [taskId]);
    response = await request('/task?search=' + encodeURIComponent("' OR 1=1 --"), { headers: headers(tokenA) });
    assert.deepEqual(await response.json(), []);
  });
  test('ownership prevents cross-user reads, edits, deletes and header impersonation', async () => {
    for (const method of ['GET', 'PATCH', 'DELETE']) {
      const response = await request('/task/' + taskId, { method, headers: { ...headers(tokenB), 'Content-Type': 'application/json', 'x-user-id': userA.id }, ...(method === 'PATCH' ? { body: JSON.stringify({ title: 'Stolen' }) } : {}) });
      assert.equal(response.status, 404, method);
    }
    const list = await request('/task', { headers: { ...headers(tokenB), 'x-user-id': userA.id } });
    assert.deepEqual((await list.json()).map((task) => task.title), ['Private B']);
  });
  test('updates tags and recurrence transactionally; errors roll back', async () => {
    const patch = (body) => request('/task/' + taskId, { ...json(body, tokenA), method: 'PATCH' });
    assert.equal((await patch({ isRecurring: false, tags: ['updated'], status: 'done' })).status, 200);
    assert.equal(await models.Recurrence.count(), 0);
    assert.equal((await patch({ title: 'Should roll back', isRecurring: true })).status, 422);
    const task = await (await request('/task/' + taskId, { headers: headers(tokenA) })).json();
    assert.equal(task.title, 'Belajar Node 100%'); assert.deepEqual(task.tags, ['updated']);
  });
  test('upload persists real image; spoofed/oversized files are rejected and files are private', async () => {
    const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aG1kAAAAASUVORK5CYII=', 'base64');
    const upload = (data, type = 'image/png', field = 'file') => {
      const form = new FormData(); form.append(field, new Blob([data], { type }), 'photo.png');
      return request('/upload', { method: 'POST', headers: headers(tokenA), body: form });
    };
    const response = await upload(png);
    assert.equal(response.status, 201); const { file } = await response.json();
    const image = await request(file.url, { headers: headers(tokenA) });
    assert.equal(image.status, 200); assert.deepEqual(Buffer.from(await image.arrayBuffer()), png);
    assert.equal((await request(file.url, { headers: headers(tokenB) })).status, 404);
    assert.equal((await request(file.url)).status, 401);
    assert.equal((await upload(Buffer.from('<script>alert(1)</script>'))).status, 415);
    assert.equal((await upload(Buffer.from('x'))).status, 415);
    assert.equal((await upload(png, 'text/html')).status, 415);
    assert.equal((await upload(png, 'image/png', 'avatar')).status, 422);
    assert.equal((await upload(Buffer.alloc(5 * 1024 * 1024 + 1))).status, 413);
    assert.equal((await readdir(path.join(root, 'upload', userA.id))).length, 1);
  });
  test('delete removes task and tag links; inactive account loses API access', async () => {
    assert.equal((await request('/task/' + taskId, { method: 'DELETE', headers: headers(tokenA) })).status, 204);
    assert.equal((await request('/task/' + taskId, { headers: headers(tokenA) })).status, 404);
    assert.equal(await models.TaskTag.count(), 0);
    await models.User.update({ is_active: false }, { where: { user_id: userA.id } });
    assert.equal((await request('/task', { headers: headers(tokenA) })).status, 401);
  });
  test('Nodemailer file transport creates an actual verification email locally', async () => {
    const mailDir = path.join(root, 'mail');
    const mail = createMailService({ mailMode: 'file', mailDir, frontendUrl: 'http://localhost:5173' });
    assert.equal(await mail.sendVerification('local@example.test', randomUUID()), 'file');
    const [filename] = await readdir(mailDir);
    const contents = await readFile(path.join(mailDir, filename), 'utf8');
    assert.match(contents, /Subject: Verifikasi akun ImTrack/);
    assert.match(contents, /verify-email/);
    assert.match(contents, /local@example.test/);
  });
});
