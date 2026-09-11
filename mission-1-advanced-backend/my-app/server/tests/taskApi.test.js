import assert from 'node:assert/strict';
import { after, before, describe, test } from 'node:test';
import jwt from 'jsonwebtoken';
import { createApp } from '../app.js';

const secret = 'test-secret-used-only-in-automated-tests-12345';
describe('HTTP validation and JWT middleware (without MySQL)', () => {
  let server, base, lastQuery;
  const token = jwt.sign({}, secret, { subject: '7', issuer: 'imtrack-api', audience: 'imtrack-app', expiresIn: '1h' });
  const auth = { Authorization: 'Bearer ' + token };
  before(async () => {
    const app = createApp({
      config: { jwtSecret: secret, corsOrigin: 'http://localhost:5173', uploadDir: 'upload' },
      authService: { getUser: async (id) => id === '7' ? { id, emailVerified: true } : null },
      taskService: { getAll: async (id, query) => { lastQuery = { id, query }; return []; } },
    });
    await new Promise((resolve) => { server = app.listen(0, '127.0.0.1', resolve); });
    base = 'http://127.0.0.1:' + server.address().port;
  });
  after(async () => { await new Promise((resolve) => server.close(resolve)); });
  test('header x-user-id cannot authenticate a request', async () => {
    assert.equal((await fetch(base + '/api/task', { headers: { 'x-user-id': '7' } })).status, 401);
  });
  test('valid token controls owner; filters are validated and forwarded', async () => {
    const response = await fetch(base + '/api/tasks?cat=Belajar&status=todo&priority=Sekarang&search=Node&sort=title&order=asc', { headers: { ...auth, 'x-user-id': '999' } });
    assert.equal(response.status, 200);
    assert.deepEqual(lastQuery, { id: '7', query: { cat: 'Belajar', status: 'todo', priority: 'Sekarang', search: 'Node', sort: 'title', order: 'asc' } });
  });
  test('invalid, expired, wrong-audience and deleted-user tokens return 401', async () => {
    const cases = [
      'bad-token',
      jwt.sign({}, secret, { subject: '7', issuer: 'imtrack-api', audience: 'imtrack-app', expiresIn: -1 }),
      jwt.sign({}, secret, { subject: '7', issuer: 'imtrack-api', audience: 'other-app' }),
      jwt.sign({}, secret, { subject: '8', issuer: 'imtrack-api', audience: 'imtrack-app' }),
      jwt.sign({}, 'another-secret', { subject: '7', issuer: 'imtrack-api', audience: 'imtrack-app' }),
    ];
    for (const value of cases) assert.equal((await fetch(base + '/api/task', { headers: { Authorization: 'Bearer ' + value } })).status, 401);
  });
  test('rejects unknown, repeated, nested, and unsafe query values', async () => {
    for (const query of ['sort=title;DROP%20TABLE%20users', 'order=sideways', 'status=unknown', 'sort=title&sort=due', 'search[x]=a', 'owner=8']) {
      assert.equal((await fetch(base + '/api/task?' + query, { headers: auth })).status, 422, query);
    }
  });
  test('rejects malformed JSON and invalid task bodies', async () => {
    for (const [body, expected] of [['{', 400], ['null', 400], [JSON.stringify({ title: '', user_id: '8' }), 422], [JSON.stringify({ title: 'Valid', due: '2026-02-30' }), 422]]) {
      const response = await fetch(base + '/api/task', { method: 'POST', headers: { ...auth, 'Content-Type': 'application/json' }, body });
      assert.equal(response.status, expected);
    }
  });
  test('registration validates required account fields before using service', async () => {
    const response = await fetch(base + '/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fullname: '', email: 'bad', password: 'short', username: '?' }) });
    assert.equal(response.status, 422);
    assert.equal((await response.json()).error.details.length, 4);
  });
  test('all upload aliases require a valid token', async () => {
    for (const url of ['/upload', '/api/upload', '/uploads/test.png', '/api/uploads/test.png']) {
      assert.equal((await fetch(base + url, { method: url.endsWith('upload') ? 'POST' : 'GET' })).status, 401);
    }
  });
});
