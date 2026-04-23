import bcryptjs from 'bcryptjs';
import prisma from '../config/database';
import logger from '../utils/logger';

interface CreateUserRequest {
  email: string;
  password: string;
  correlationId?: string;
}

interface UserResponse {
  id: string;
  email: string;
  createdAt: Date;
}

export class UserService {
  async createUser(data: CreateUserRequest): Promise<UserResponse> {
    const { email, password, correlationId } = data;

    logger.info(
      { email, correlationId },
      'Creating user'
    );

    // Validação básica
    if (!email || !password) {
      const error = new Error('E-mail e senha são obrigatórios');
      logger.error({ error, correlationId }, 'Validation error');
      throw error;
    }

    // Verificar se email já existe
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      const error = new Error('E-mail já existe');
      logger.warn({ email, correlationId }, 'Email already exists');
      throw error;
    }

    // Criptografar senha com bcrypt (10 rounds)
    const passwordHash = await bcryptjs.hash(password, 10);

    logger.info(
      { email, correlationId },
      'Password hashed successfully'
    );

    // Criar usuário no banco
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
      },
    });

    logger.info(
      { userId: user.id, email, correlationId },
      'User created successfully'
    );

    return {
      id: user.id,
      email: user.email,
      createdAt: user.createdAt,
    };
  }

  async getUserById(userId: string, correlationId?: string): Promise<UserResponse | null> {
    logger.info(
      { userId, correlationId },
      'Fetching user by ID'
    );

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      logger.warn(
        { userId, correlationId },
        'User not found'
      );
      return null;
    }

    logger.info(
      { userId, correlationId },
      'User found'
    );

    return {
      id: user.id,
      email: user.email,
      createdAt: user.createdAt,
    };
  }

  async deleteUser(userId: string, correlationId?: string): Promise<boolean> {
    logger.info(
      { userId, correlationId },
      'Deleting user'
    );

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      logger.warn(
        { userId, correlationId },
        'User not found for deletion'
      );
      return false;
    }

    await prisma.user.delete({
      where: { id: userId },
    });

    logger.info(
      { userId, correlationId },
      'User deleted successfully'
    );

    return true;
  }
}

export default new UserService();
