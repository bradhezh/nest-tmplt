import {
  Injectable, NestInterceptor, ExecutionContext, CallHandler,
  RequestTimeoutException,
} from '@nestjs/common'
import {Observable, throwError, TimeoutError} from 'rxjs'
import {tap, timeout, catchError} from 'rxjs/operators'

import conf from '@/conf'

@Injectable()
export class Interceptor implements NestInterceptor {
  intercept(_ctx: ExecutionContext, next: CallHandler): Observable<unknown> {
    console.log('Before...')
    const now = Date.now()
    return next.handle().pipe(
      tap(() => console.log(`After...${Date.now() - now}ms`)),
      timeout(conf.timeout),
      catchError(e => {
        if (e instanceof TimeoutError) {
          return throwError(() => new RequestTimeoutException())
        }
        return throwError(() => e)
      }))
  }
}
