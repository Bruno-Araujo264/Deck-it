import { Router } from 'express';
import { GameController } from '../controller/gameController.js'; // Ajuste o caminho se necessário

const router = Router();
const gameController = new GameController();

// Rotas básicas de CRUD
router.post('/', gameController.create);
router.get('/', gameController.getAll);

// 🔍 ATENÇÃO: A rota /search DEVE vir ANTES de /:id
router.get('/search', gameController.search);

// Rotas dinâmicas por ID
router.get('/:id', gameController.getById);
router.put('/:id', gameController.update);
router.delete('/:id', gameController.delete);

export default router;