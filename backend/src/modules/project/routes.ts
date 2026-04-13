import { Router } from 'express';
import { projectController } from './controller';
import { authenticate, sseAuthenticate } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { createProjectSchema, updateProjectSchema } from './schema';
import { sseClients } from '../../utils/sseClients';

const router = Router();

router.get('/', authenticate, projectController.list);
router.post('/', authenticate, validate(createProjectSchema), projectController.create);
router.get('/:id', authenticate, projectController.getById);
router.patch('/:id', authenticate, validate(updateProjectSchema), projectController.update);
router.delete('/:id', authenticate, projectController.remove);
router.get('/:id/stats', authenticate, projectController.stats);

// SSE endpoint
router.get('/:id/events', sseAuthenticate, (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const { id } = req.params;
  sseClients.add(id, res);

  const heartbeat = setInterval(() => res.write(':heartbeat\n\n'), 30_000);

  req.on('close', () => {
    clearInterval(heartbeat);
    sseClients.remove(id, res);
  });
});

export default router;
