import { ArgumentsHost, Catch, ExceptionFilter, Logger } from '@nestjs/common';
import { ApiError } from './ApiError';
import { Response as ResponseExpress } from 'express';

@Catch()
export class ApiErrorExceptionsFilter implements ExceptionFilter {
  private readonly logger: Logger = new Logger('Exception Filter');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response: ResponseExpress = ctx.getResponse();

    if (exception instanceof ApiError) {
      const error = {
        code: exception.code,
        message: exception.message,
        cause: exception.cause,
        timestamp: new Date().toISOString(),
      };
      this.logger.error(error);
      return response.status(exception.status).json(error);
    }

    const error = {
      code: 'ERR_000',
      message: 'Something went wrong on our side',
      timestamp: new Date().toISOString(),
    };
    this.logger.error(error);
    response.status(500).json(error);
  }
}
