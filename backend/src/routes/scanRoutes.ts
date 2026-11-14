import { Router } from 'express';
import { ScanController } from '../controllers/scanController.js';

const router = Router();
const scanController = new ScanController();

router.post('/', (req, res) => scanController.identify(req, res));

export default router;
