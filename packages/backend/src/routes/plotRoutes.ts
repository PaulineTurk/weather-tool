import { Router } from 'express';
import { plotController } from '../controllers/plotController';

const router = Router();

router.get('/users/:userId', (req, res) => plotController.getPlotsForUser(req, res));
router.post('/users/:userId', (req, res) => plotController.createPlotForUser(req, res));
router.put('/users/:userId/:plotId', (req, res) => plotController.updatePlotForUser(req, res));
router.patch('/users/:userId/:plotId/default', (req, res) =>
  plotController.setDefaultPlotForUser(req, res),
);
router.delete('/users/:userId/:plotId', (req, res) => plotController.deletePlotForUser(req, res));

export default router;
