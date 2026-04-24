import axios, { AxiosError } from 'axios';
import logger from '../utils/logger';

interface UserNotificationPayload {
  id: string;
  email: string;
}

export class UserServiceClient {
  private baseUrl: string;
  private timeout: number = 5000;

  constructor() {
    this.baseUrl = process.env.USER_SERVICE_URL || 'http://user-service:3002';
  }

  async notifyUserCreated(
    userData: UserNotificationPayload,
    correlationId?: string
  ): Promise<void> {
    try {
      logger.info(
        { userId: userData.id, email: userData.email, correlationId },
        'Notifying User Service about new user'
      );

      await axios.post(
        `${this.baseUrl}/users`,
        userData,
        {
          timeout: this.timeout,
          headers: {
            'x-correlation-id': correlationId || '',
          },
        }
      );

      logger.info(
        { userId: userData.id, correlationId },
        'User Service notified successfully'
      );
    } catch (error) {
      const axiosError = error as AxiosError;
      logger.error(
        {
          userId: userData.id,
          correlationId,
          errorMessage: axiosError.message,
          status: axiosError.status,
        },
        'Failed to notify User Service'
      );
      throw new Error(`Falha ao notificar o User Service: ${axiosError.message}`);
    }
  }

  async notifyUserDeleted(
    userId: string,
    correlationId?: string
  ): Promise<void> {
    try {
      logger.info(
        { userId, correlationId },
        'Notifying User Service about user deletion'
      );

      await axios.delete(
        `${this.baseUrl}/users/${userId}`,
        {
          timeout: this.timeout,
          headers: {
            'x-correlation-id': correlationId || '',
          },
        }
      );

      logger.info(
        { userId, correlationId },
        'User Service notified about deletion'
      );
    } catch (error) {
      const axiosError = error as AxiosError;
      logger.error(
        {
          userId,
          correlationId,
          errorMessage: axiosError.message,
          status: axiosError.status,
        },
        'Failed to notify User Service about deletion'
      );
      throw new Error(`Falha ao notificar o User Service: ${axiosError.message}`);
    }
  }
}

export default new UserServiceClient();
