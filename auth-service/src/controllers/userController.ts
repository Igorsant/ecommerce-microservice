import { Request, Response } from 'express';
import userService from '../services/userService';
import userServiceClient from '../services/userServiceClient';
import prisma from '../config/database';
import logger from '../utils/logger';

export class UserController {
  async loginUser(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      const correlationId = req.correlationId;

      logger.info({ email, correlationId }, 'POST /login - Authenticating user');

      if (!email || !password) {
        res.status(400).json({
          error: 'E-mail e senha são obrigatórios',
          correlationId,
        });
        return;
      }

      const authResult = await userService.loginUser({
        email,
        password,
        correlationId,
      });

      res.status(200).json({
        token: authResult.token,
        tokenType: authResult.tokenType,
        expiresIn: authResult.expiresIn,
        user: authResult.user,
        correlationId,
      });
    } catch (error) {
      const err = error as Error;
      logger.error({ error: err.message, correlationId: req.correlationId }, 'Error in POST /login');

      if (err.message === 'Credenciais inválidas') {
        res.status(401).json({
          error: 'Credenciais inválidas',
          correlationId: req.correlationId,
        });
        return;
      }

      if (err.message === 'JWT_SECRET não configurado') {
        res.status(500).json({
          error: 'JWT não configurado no servidor',
          correlationId: req.correlationId,
        });
        return;
      }

      res.status(500).json({
        error: 'Erro interno do servidor',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined,
        correlationId: req.correlationId,
      });
    }
  }

  async createUser(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      const correlationId = req.correlationId;

      logger.info(
        { email, correlationId },
        'POST /cadastro - Creating user'
      );

      // Validação
      if (!email || !password) {
        logger.warn({ correlationId }, 'Missing email or password');
        res.status(400).json({
          error: 'E-mail e senha são obrigatórios',
          correlationId,
        });
        return;
      }

      // Criar usuário
      const newUser = await userService.createUser({
        email,
        password,
        correlationId,
      });

      logger.info(
        { userId: newUser.id, correlationId },
        'User created, notifying User Service'
      );

      // Notificar User Service
      try {
        await userServiceClient.notifyUserCreated(
          { id: newUser.id, email: newUser.email },
          correlationId
        );
      } catch (notificationError) {
        logger.error(
          { userId: newUser.id, correlationId, error: notificationError },
          'User Service notification failed, rolling back user creation'
        );

        // Rollback: deletar usuário criado
        await prisma.user.delete({
          where: { id: newUser.id },
        });

        res.status(503).json({
          error: 'Falha ao criar perfil do usuário no User Service',
          correlationId,
        });
        return;
      }

      logger.info(
        { userId: newUser.id, correlationId },
        'User creation completed successfully'
      );

      res.status(201).json({
        id: newUser.id,
        email: newUser.email,
        createdAt: newUser.createdAt,
        correlationId,
      });
    } catch (error) {
      const err = error as Error;
      logger.error(
        { error: err.message, correlationId: req.correlationId },
        'Error in POST /cadastro'
      );

      // Tratamento específico de email duplicado
      if (err.message === 'E-mail já existe') {
        res.status(409).json({
          error: 'E-mail já existe',
          correlationId: req.correlationId,
        });
        return;
      }

      res.status(500).json({
        error: 'Erro interno do servidor',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined,
        correlationId: req.correlationId,
      });
    }
  }

  async getUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const correlationId = req.correlationId;

      logger.info(
        { userId: id, correlationId },
        'GET /user/:id - Fetching user'
      );

      const user = await userService.getUserById(id, correlationId);

      if (!user) {
        logger.warn(
          { userId: id, correlationId },
          'User not found'
        );
        res.status(404).json({
          error: 'Usuário não encontrado',
          correlationId,
        });
        return;
      }

      logger.info(
        { userId: id, correlationId },
        'User retrieved successfully'
      );

      res.status(200).json({
        ...user,
        correlationId,
      });
    } catch (error) {
      const err = error as Error;
      logger.error(
        { error: err.message, correlationId: req.correlationId },
        'Error in GET /user/:id'
      );

      res.status(500).json({
        error: 'Erro interno do servidor',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined,
        correlationId: req.correlationId,
      });
    }
  }

  async deleteUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const correlationId = req.correlationId;

      logger.info(
        { userId: id, correlationId },
        'DELETE /user/:id - Deleting user'
      );

      const user = await userService.getUserById(id, correlationId);

      if (!user) {
        logger.warn(
          { userId: id, correlationId },
          'User not found for deletion'
        );
        res.status(404).json({
          error: 'Usuário não encontrado',
          correlationId,
        });
        return;
      }

      // Notificar User Service sobre deleção
      try {
        await userServiceClient.notifyUserDeleted(id, correlationId);
      } catch (notificationError) {
        logger.error(
          { userId: id, correlationId, error: notificationError },
          'Failed to notify User Service about deletion'
        );
        // Continua mesmo se falhar a notificação
      }

      // Deletar usuário
      const deleted = await userService.deleteUser(id, correlationId);

      if (!deleted) {
        res.status(404).json({
          error: 'Usuário não encontrado',
          correlationId,
        });
        return;
      }

      logger.info(
        { userId: id, correlationId },
        'User deleted successfully'
      );

      res.status(204).send();
    } catch (error) {
      const err = error as Error;
      logger.error(
        { error: err.message, correlationId: req.correlationId },
        'Error in DELETE /user/:id'
      );

      res.status(500).json({
        error: 'Erro interno do servidor',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined,
        correlationId: req.correlationId,
      });
    }
  }
}

export default new UserController();
