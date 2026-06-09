import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

/**
 * Renders every error in the consistent envelope:
 *   { status: false, message, errors }
 *
 * Validation errors (class-validator) arrive as a string[] inside the
 * HttpException response body; we surface them under `errors`.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errors: string[] = [];

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const body = exception.getResponse();

      if (typeof body === 'string') {
        message = body;
      } else if (typeof body === 'object' && body !== null) {
        const res = body as Record<string, any>;
        if (Array.isArray(res.message)) {
          errors = res.message;
          message = 'Validation failed';
        } else if (typeof res.message === 'string') {
          message = res.message;
        }
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    response.status(status).json({
      status: false,
      message,
      errors,
    });
  }
}
