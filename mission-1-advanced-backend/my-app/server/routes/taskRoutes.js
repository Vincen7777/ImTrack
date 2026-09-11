import { Router } from 'express';
import { createTaskController } from '../controllers/taskController.js';
import { validateTaskQuery } from '../validators/queryValidator.js';
import { validateTaskId, validateTaskPayload } from '../validators/taskValidator.js';

export function createTaskRouter(taskService) {
  const router = Router();
  const controller = createTaskController(taskService);

  router.get('/', validateTaskQuery, controller.getAll);
  router.get('/:id', validateTaskId, controller.getById);
  router.post('/', validateTaskPayload(), controller.create);
  router.patch('/:id', validateTaskId, validateTaskPayload({ partial: true }), controller.update);
  router.delete('/:id', validateTaskId, controller.remove);

  return router;
}
