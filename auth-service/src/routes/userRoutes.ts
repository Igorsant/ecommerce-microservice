import { Router } from 'express';
import userController from '../controllers/userController';

const router = Router();

// POST /cadastro - Criar novo usuário
router.post('/cadastro', (req, res) => userController.createUser(req, res));

// GET /user/:id - Obter usuário por ID
router.get('/user/:id', (req, res) => userController.getUser(req, res));

// DELETE /user/:id - Deletar usuário
router.delete('/user/:id', (req, res) => userController.deleteUser(req, res));

export default router;
