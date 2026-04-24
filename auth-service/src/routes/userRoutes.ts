import { Router } from 'express';
import userController from '../controllers/userController';

const router = Router();

// POST /login - Autenticar usuário e gerar JWT
router.post('/login', (req, res) => userController.loginUser(req, res));

// POST /cadastro - Criar novo usuário
router.post('/cadastro', (req, res) => userController.createUser(req, res));

// GET /user/:id - Obter usuário por ID
router.get('/user/:id', (req, res) => userController.getUser(req, res));

// DELETE /user/:id - Deletar usuário
router.delete('/user/:id', (req, res) => userController.deleteUser(req, res));

export default router;
