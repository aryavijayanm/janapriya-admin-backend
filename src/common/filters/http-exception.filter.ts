import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message = this.extractMessage(exception);

    response.status(status).json({
      statusCode: status,
      message,
      data: null,
    });
  }

  private extractMessage(exception: unknown): string {
    if (!(exception instanceof HttpException)) {
      return 'Internal server error';
    }

    const body = exception.getResponse();

    // class-validator errors arrive as { message: string[], error, statusCode }
    if (typeof body === 'object' && body !== null && 'message' in body) {
      const msg = (body as { message: string | string[] }).message;
      return Array.isArray(msg) ? msg.join(', ') : msg;
    }

    if (typeof body === 'string') {
      return body;
    }

    return exception.message ?? 'Something went wrong';
  }
}
