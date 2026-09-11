import { HttpError } from '../errors/httpError.js';

export function createTaskController(taskService) {
  return {
    getAll: async (req, res) => {
      res.json(await taskService.getAll(req.userId, req.taskQuery));
    },

    getById: async (req, res) => {
      const task = await taskService.getById(req.params.id, req.userId);
      if (!task) throw new HttpError(404, 'Task tidak ditemukan');
      res.json(task);
    },

    create: async (req, res) => {
      const task = await taskService.create(req.body, req.userId);
      res.status(201).location(`${req.baseUrl}/${task.id}`).json(task);
    },

    update: async (req, res) => {
      const task = await taskService.update(req.params.id, req.body, req.userId);
      if (!task) throw new HttpError(404, 'Task tidak ditemukan');
      res.json(task);
    },

    remove: async (req, res) => {
      const removed = await taskService.remove(req.params.id, req.userId);
      if (!removed) throw new HttpError(404, 'Task tidak ditemukan');
      res.status(204).end();
    },
  };
}
