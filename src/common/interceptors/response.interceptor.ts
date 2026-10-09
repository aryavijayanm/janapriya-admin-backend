import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import type { Response } from 'express';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

interface Envelope<T> {
  statusCode: number;
  message: string;
  data: T;
}

function isAlreadyEnveloped(value: unknown): value is Envelope<unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    'statusCode' in value &&
    'message' in value &&
    'data' in value
  );
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, Envelope<T>> {
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<Envelope<T>> {
    const response = context.switchToHttp().getResponse<Response>();

    return next.handle().pipe(
      map((value) => {
        // Controllers that already build their own {statusCode, message, data}
        // shape (e.g. UserController.create) are passed through unchanged.
        if (isAlreadyEnveloped(value)) {
          return value as Envelope<T>;
        }

        return {
          statusCode: response.statusCode,
          message: 'Success',
          data: value,
        };
      }),
    );
  }
}
