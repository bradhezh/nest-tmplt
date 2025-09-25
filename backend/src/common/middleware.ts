import {
  Injectable, NestMiddleware, NotFoundException, RequestMethod,
} from '@nestjs/common'
import {Request, Response, NextFunction} from 'express'
import path from 'path'

import {message} from '@/const'
import conf from '@/conf'

@Injectable()
export class ReqLogger implements NestMiddleware {
  use(req: Request, _res: Response, next: NextFunction) {
    console.log(req.method, req.originalUrl, req.body)
    next()
  }
}

export function frRoutes(req: Request, res: Response, next: NextFunction) {
  if (req.originalUrl.startsWith(conf.ep.bkRoot)) {
    return next()
  }
  if (req.method !== RequestMethod[RequestMethod.GET]) {
    throw new NotFoundException()
  }
  console.log(message.frRoutes)
  res.sendFile(path.join(process.cwd(), conf.spa))
}
