import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { PaginationMetaDto } from '../dto/api-response.dto';
import { Reflector } from '@nestjs/core';

export interface Envelope<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  meta?: PaginationMetaDto;
}

export interface CustomPayload<T> {
  data: T;
  meta?: PaginationMetaDto;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<
  T,
  Envelope<T>
> {
  constructor(private readonly reflector: Reflector) {}
  intercept(
    ctx: ExecutionContext,
    next: CallHandler<T | CustomPayload<T>>,
  ): Observable<Envelope<T>> {
    const res = ctx.switchToHttp().getResponse();

    return next.handle().pipe(
      map((payload: T | CustomPayload<T>) => {
        // Check if response contains structured payload with data & meta
        if (
          payload &&
          typeof payload === 'object' &&
          'data' in payload &&
          'meta' in payload
        ) {
          const custom = payload as CustomPayload<T>;
          return {
            success: true,
            statusCode: res.statusCode,
            message: 'OK',
            data: custom.data,
            meta: custom.meta,
          };
        }

        return {
          success: true,
          statusCode: res.statusCode,
          message: 'OK',
          data: payload as T,
        };
      }),
    );
  }
}
