import { Router } from 'express';
import { fieldController } from '../controllers/fieldController';

const router = Router();

router.get('/weather', (req, res) => fieldController.getWeatherByCoordinates(req, res));
router.get('/users/:userId', (req, res) => fieldController.getFieldsForUser(req, res));
router.post('/users/:userId', (req, res) => fieldController.createFieldForUser(req, res));
router.put('/users/:userId/:fieldId', (req, res) => fieldController.updateFieldForUser(req, res));
router.patch('/users/:userId/:fieldId/default', (req, res) => fieldController.setDefaultFieldForUser(req, res));
router.delete('/users/:userId/:fieldId', (req, res) => fieldController.deleteFieldForUser(req, res));

export default router;
