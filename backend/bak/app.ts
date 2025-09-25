import express from 'express'
import 'express-async-errors'
import {withAccelerate} from '@prisma/extension-accelerate'

import {ENV} from '@/const'
import conf from '@/conf'
import {PrismaClient as PrismaClientLog} from '@PrismaClient/log'
import {reqLogger, unknownEp, errHandler} from '@/utils/middleware'
import {PrismaClient} from '@PrismaClient/.'
import {omit} from '@shared/schemas'
import loginRouter from '@/controllers/login'
import usersRouter from '@/controllers/users'
import itemsRouter from '@/controllers/items'

export const prisma = new PrismaClient({omit}).$extends(withAccelerate())
export const prismaLog = conf.NODE_ENV !== ENV.DBG && conf.NODE_ENV !== ENV.TEST
  ? null : new PrismaClientLog().$extends(withAccelerate())

export const app = express()

// middleware mounted by `app.<method>(...)` is called (valid) only if requests
// match the method and path (route) exactly (only with minor tolerance like the
// trailing slash), while `app.use(...)` adopts prefix-based matching and the
// matched prefix will be stripped from `req.url` before it's passed to the
// middleware, so a router should exclude the matched prefix from its own routes

// give static (files) priority over subsequent middleware for `GET`; the path
// is relative to the cwd
app.use(express.static(conf.DIST_DIR))
// deserialise json in requests into `req.body`
app.use(express.json())

app.use(reqLogger)

// overridden by dist/index.html due to `express.static(...)`
app.get('/', (_req, res) => {
  res.send('<h1>Hello world!</h1>')
})
// for deployment or health check
app.get(conf.VER_EP, (_req, res) => {
  res.json(conf.VERSION)
})

app.use(conf.LOGIN_EP, loginRouter)
app.use(conf.USERS_EP, usersRouter)
app.use(conf.ITEMS_EP, itemsRouter)
app.use(unknownEp)
app.use(errHandler)
