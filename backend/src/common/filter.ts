import {Catch, ArgumentsHost, HttpStatus} from '@nestjs/common'
import {BaseExceptionFilter, HttpAdapterHost} from '@nestjs/core'
import {z} from 'zod'

@Catch()
export class Filter extends BaseExceptionFilter {
  constructor(private adapter: HttpAdapterHost) {
    super()
  }

  catch(err: unknown, host: ArgumentsHost) {
    if (!(err instanceof Error)) {
      console.log(err)
    } else {
      console.log(err.name, err.message)
    }
    const http = this.adapter.httpAdapter
    const res = host.switchToHttp().getResponse()
    if (err instanceof z.ZodError) {
      return http.reply(res, {message: err.message}, HttpStatus.BAD_REQUEST)
    }
    if ((err instanceof Error)
      && err.name === 'PrismaClientKnownRequestError') {
      return http.reply(
        res, {message: err.message.trimEnd().split('\n').pop() || ''},
        HttpStatus.BAD_REQUEST)
    }
    super.catch(err, host)
  }
}
