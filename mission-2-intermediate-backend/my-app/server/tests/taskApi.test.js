import assert from 'node:assert/strict';
import { after, before, describe, test } from 'node:test';
import { createApp } from '../app.js';

const initialTask = {
  id: '1',
  title: 'Belajar Express',
  priority: 'Sekarang',
  status: 'todo',
  due: '2026-09-08',
  tags: ['backend'],
  cat: 'Belajar',
  isRecurring: false,
};

function createFakeTaskService() {
  let tasks = [structuredClone(initialTask)];
  return {
    async getAll() { return tasks; },
    async getById(id) { return tasks.find((task) => task.id === id) ?? null; },
    async create(payload) {
      const task = { priority: 'Nanti', status: 'todo', due: null, tags: [], cat: '', isRecurring: false, ...payload, id: String(tasks.length + 1) };
      tasks.push(task);
      return task;
    },
    async update(id, payload) {
      const index = tasks.findIndex((task) => task.id === id);
      if (index < 0) return null;
      tasks[index] = { ...tasks[index], ...payload };
      return tasks[index];
    },
    async remove(id) {
      const previousLength = tasks.length;
      tasks = tasks.filter((task) => task.id !== id);
      return tasks.length < previousLength;
    },
  };
}

describe('Task REST API', () => {
  let server;
  let baseUrl;

  before(async () => {
    const app = createApp(createFakeTaskService());
    await new Promise((resolve) => {
      server = app.listen(0, '127.0.0.1', resolve);
    });
    baseUrl = `http://127.0.0.1:${server.address().port}/api/task`;
  });

  after(async () => {
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  });

  test('GET memperoleh semua task', async () => {
    const response = await fetch(baseUrl);
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), [initialTask]);
  });

  test('GET memperoleh task berdasarkan id', async () => {
    const response = await fetch(`${baseUrl}/1`);
    assert.equal(response.status, 200);
    assert.equal((await response.json()).title, initialTask.title);
  });

  test('POST menambah task', async () => {
    const response = await fetch(baseUrl, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ title: 'Tulis dokumentasi', priority: 'Nanti', status: 'todo', due: null, tags: ['docs'], cat: 'Kerja' }),
    });
    assert.equal(response.status, 201);
    assert.equal((await response.json()).title, 'Tulis dokumentasi');
  });

  test('PATCH mengubah task tertentu', async () => {
    const response = await fetch(`${baseUrl}/1`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ status: 'done' }),
    });
    assert.equal(response.status, 200);
    assert.equal((await response.json()).status, 'done');
  });

  test('DELETE menghapus task tertentu', async () => {
    const response = await fetch(`${baseUrl}/1`, { method: 'DELETE' });
    assert.equal(response.status, 204);
    assert.equal((await fetch(`${baseUrl}/1`)).status, 404);
  });

  test('payload invalid menghasilkan 422', async () => {
    const response = await fetch(baseUrl, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ title: '', priority: 'Mendesak' }),
    });
    assert.equal(response.status, 422);
    assert.equal((await response.json()).error.message, 'Payload task tidak valid');
  });
});
