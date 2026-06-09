import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { RESPONSE_MESSAGE_KEY } from '../decorators/response-message.decorator';

/**
 * Wraps every successful response in the consistent envelope:
 *   { status: true, message?, data? }
 *
 * The `message` comes from the @ResponseMessage() decorator on the handler.
 * `data` is omitted when the handler returns null/undefined (e.g. delete,
 * password update) so the response stays clean.
 */
@Injectable()
export class TransformInterceptor implements NestInterceptor {
  constructor(private reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const message = this.reflector.get<string>(
      RESPONSE_MESSAGE_KEY,
      context.getHandler(),
    );

    return next.handle().pipe(
      map((data) => {
        const response: Record<string, any> = { status: true };
        if (message) {
          response.message = message;
        }
        if (data !== null && data !== undefined) {
          response.data = data;
        }
        return response;
      }),
    );
  }
}
