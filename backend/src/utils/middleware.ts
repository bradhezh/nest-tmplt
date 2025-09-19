import {Request, Response, NextFunction} from 'express'
import jwt from 'jsonwebtoken'
import {z} from 'zod'
import path from 'path'
import {format} from 'util'

import {ENV, HTTP_STATUS, HttpStatus, ERROR, MESSAGE} from '@/const'
import conf from '@/conf'
import log from '@/utils/log'
import usersSvc from '@/services/users'
import ability from '@/utils/ability'

export class MiddlewareErr extends Error {
  name = ERROR.MIDDLEWARE

  /** @param messages
    Format sequences like `%s`, `%d` can be used in messages. */
  constructor(public status: HttpStatus, ...messages: unknown[]) {
    super(format(...messages))
  }
}

/** Log requests before they're handled, only for "debug" or development. */
export const reqLogger = async (
  req: Request, _res: Response, next: NextFunction,
) => {
  await log.debug(req.method, req.path,
    conf.NODE_ENV !== ENV.DEV && conf.NODE_ENV !== ENV.TEST ? undefined
      : req.body)
  next()
}

export const unknownEp = async (
  _req: Request, res: Response, next: NextFunction,
) => {
  await log.debug(MESSAGE.UNKNOWN_EP)
  if (!conf.SPA) {
    throw new MiddlewareErr(HTTP_STATUS.NOT_FOUND, MESSAGE.UNKNOWN_EP)
  }
  // in spa, site routes are handled by frontend, so for any unknown endpoint,
  // the page should be sent back for the frontend to handle the route
  res.sendFile(path.join(process.cwd(), conf.SPA), next)
}

export const errHandler = async (
  err: unknown, _req: Request, res: Response, next: NextFunction,
) => {
  // type narrowing
  if (!(err instanceof Error)) {
    throw new Error(MESSAGE.UNKNOWN)
  }
  await log.error(err.name, err.message)

  if (err instanceof z.ZodError) {
    // causing frontend axios to throw `error` including the object from json as
    // `error.response.data`
    return res.status(HTTP_STATUS.BAD_REQ).json({message: err.message})
  }

  // the type is actually defined in the client (multiple ones in this app)
  if (err.name === 'PrismaClientKnownRequestError') {
    return res.status(HTTP_STATUS.BAD_REQ)
      .json({message: err.message.trimEnd().split('\n').pop() || ''})
  }

  if (err instanceof MiddlewareErr) {
    return res.status(err.status).json({message: err.message})
  }

  // pass to the default one
  next(err)
}

export const auth = async (
  req: Request, _res: Response, next: NextFunction,
) => {
  const token = req.get('authorization')?.replace('Bearer ', '')
  if (!token) {
    throw new MiddlewareErr(HTTP_STATUS.UNAUTHED, MESSAGE.NO_TOKEN)
  }
  const id = Number((jwt.verify(token, conf.SECRET) as {id: number}).id)
  if (isNaN(id)) {
    throw new MiddlewareErr(HTTP_STATUS.UNAUTHED, MESSAGE.INV_TOKEN)
  }
  req.user = await usersSvc.getUnique({id}, ['roles'])
  req.ability = ability(req.user)
  next()
}
