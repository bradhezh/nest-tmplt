import {default as express, Request, Response} from 'express'
import {z} from 'zod'

import {HTTP_STATUS, MESSAGE} from '@/const'
import conf from '@/conf'
import {auth, MiddlewareErr} from '@/utils/middleware'
import {
  idSchema, roleSchemaName,
  roleSchemaIncs, RoleIncs, roleSchemaPage, RolePage, roleSchemaFilter,
  userSchemaFilter, userSchemaKeys, userSchemaName,
} from '@shared/schemas'
import rolesSvc from '@/services/roles'

export const rolesRouter = express.Router()

/** `POST /api/roles/search
  RolePage & {roles?: NonNullable<RoleFilter>} & {users?: UserFilter}`<br>
  => `RoleListRes`<br>
  Authorization header required with the `ROLE READ` permission. */
export const search = async (req: Request, res: Response) => {
  const page = roleSchemaPage.parse(req.body) as RolePage
  const {roles: filter} = roleSchemaFilter.parse(req.body)
  if (filter === null) {
    throw new z.ZodError([{
      code: z.ZodIssueCode.custom,
      message: MESSAGE.INV_NULL,
      path: ['roles'],
    }])
  }
  const {users: userFltr} = userSchemaFilter.parse(req.body)
  if (!req.ability) {
    throw new Error(MESSAGE.NO_ABILITY)
  }
  if (!req.ability.can(conf.PERM.ACTION.READ, conf.PERM.SUBJECT.ROLE)) {
    throw new MiddlewareErr(HTTP_STATUS.UNAUTHED, MESSAGE.INV_PERM)
  }
  const roles = await rolesSvc.pageSearch(page, filter, userFltr)
  res.json(roles)
}

/** `GET /api/roles{?page,pageSize,order,orderBy,includes}`<br>
  => `RoleListRes`<br>
  Refer to `RolePage` for query parameter restrictions.<br>
  Authorization header required with the `ROLE READ` permission. */
export const getAll = async (req: Request, res: Response) => {
  const page = roleSchemaPage.parse(req.query) as RolePage
  if (!req.ability) {
    throw new Error(MESSAGE.NO_ABILITY)
  }
  if (!req.ability.can(conf.PERM.ACTION.READ, conf.PERM.SUBJECT.ROLE)) {
    throw new MiddlewareErr(HTTP_STATUS.UNAUTHED, MESSAGE.INV_PERM)
  }
  const roles = await rolesSvc.pageSearch(page)
  res.json(roles)
}

/** `GET /api/roles/:id{?includes}`<br>
  => `RoleRes`<br>
  Refer to `RoleIncs` for query parameter restrictions.<br>
  Authorization header required with the `ROLE READ` permission. */
export const getById = async (req: Request, res: Response) => {
  const id = idSchema.parse(req.params)
  const {includes} = roleSchemaIncs.parse(req.query) as {includes?: RoleIncs}
  if (!req.ability) {
    throw new Error(MESSAGE.NO_ABILITY)
  }
  if (!req.ability.can(conf.PERM.ACTION.READ, conf.PERM.SUBJECT.ROLE)) {
    throw new MiddlewareErr(HTTP_STATUS.UNAUTHED, MESSAGE.INV_PERM)
  }
  const role = await rolesSvc.getUnique(id, includes)
  res.json(role)
}

/** `GET /api/roles/by-name/:name{?includes}`<br>
  => `RoleRes`<br>
  Refer to `RoleIncs` for query parameter restrictions.
  Authorization header required with the `ROLE READ` permission. */
export const getByName = async (req: Request, res: Response) => {
  const name = roleSchemaName.parse(req.params)
  const {includes} = roleSchemaIncs.parse(req.query) as {includes?: RoleIncs}
  if (!req.ability) {
    throw new Error(MESSAGE.NO_ABILITY)
  }
  if (!req.ability.can(conf.PERM.ACTION.READ, conf.PERM.SUBJECT.ROLE)) {
    throw new MiddlewareErr(HTTP_STATUS.UNAUTHED, MESSAGE.INV_PERM)
  }
  const role = await rolesSvc.getUnique(name, includes)
  res.json(role)
}

/** `GET /api/roles/by-user/:id{?page,pageSize,order,orderBy,includes}`<br>
  => `RoleListRes`<br>
  Refer to `RolePage` for query parameter restrictions.<br>
  Authorization header required with the `ROLE READ` permission. */
export const getByUser = async (req: Request, res: Response) => {
  const id = idSchema.parse(req.params)
  const page = roleSchemaPage.parse(req.query) as RolePage
  if (!req.ability) {
    throw new Error(MESSAGE.NO_ABILITY)
  }
  if (!req.ability.can(conf.PERM.ACTION.READ, conf.PERM.SUBJECT.ROLE)) {
    throw new MiddlewareErr(HTTP_STATUS.UNAUTHED, MESSAGE.INV_PERM)
  }
  const roles = await rolesSvc.pageSearch(page, {}, id)
  res.json(roles)
}

/** `GET /api/roles/by-username/:name{?page,pageSize,order,orderBy,includes}`
  <br>=> `RoleListRes`<br>
  Refer to `RolePage` for query parameter restrictions.<br>
  Authorization header required with the `ROLE READ` permission. */
export const getByUserName = async (req: Request, res: Response) => {
  const {name: username} = userSchemaName.parse(req.params)
  const page = roleSchemaPage.parse(req.query) as RolePage
  if (!req.ability) {
    throw new Error(MESSAGE.NO_ABILITY)
  }
  if (!req.ability.can(conf.PERM.ACTION.READ, conf.PERM.SUBJECT.ROLE)) {
    throw new MiddlewareErr(HTTP_STATUS.UNAUTHED, MESSAGE.INV_PERM)
  }
  const roles = await rolesSvc.pageSearch(page, {}, {username})
  res.json(roles)
}

/** `PUT /api/roles/:id/users
  {users: Defined<UserKeys>} & {includes?: RoleIncs}`<br>
  => `RoleRes`<br>
  Authorization header required with the `USER SET_ROLE` permission. */
export const setUsers = async (req: Request, res: Response) => {
  const id = idSchema.parse(req.params)
  const {users} = userSchemaKeys.parse(req.body)
  if (users === undefined) {
    throw new z.ZodError([{
      code: z.ZodIssueCode.custom,
      message: MESSAGE.INV_UNDEFINED,
      path: ['users'],
    }])
  }
  const {includes} = roleSchemaIncs.parse(req.body) as {includes?: RoleIncs}
  if (!req.ability) {
    throw new Error(MESSAGE.NO_ABILITY)
  }
  if (!req.ability.can(conf.PERM.ACTION.SET_ROLE, conf.PERM.SUBJECT.USER)) {
    throw new MiddlewareErr(HTTP_STATUS.UNAUTHED, MESSAGE.INV_PERM)
  }
  const role = await rolesSvc.update(id, undefined, users, includes)
  res.json(role)
}

/** `POST /api/roles/:id/users
  {users: NonNullable<UserKeys>} & {includes?: RoleIncs}`<br>
  => `RoleRes`<br>
  Authorization header required with the `USER SET_ROLE` permission. */
export const addUsers = async (req: Request, res: Response) => {
  const id = idSchema.parse(req.params)
  const {users} = userSchemaKeys.parse(req.body)
  if (!users) {
    throw new z.ZodError([{
      code: z.ZodIssueCode.custom,
      message: MESSAGE.REQUIRED,
      path: ['users'],
    }])
  }
  const {includes} = roleSchemaIncs.parse(req.body) as {includes?: RoleIncs}
  if (!req.ability) {
    throw new Error(MESSAGE.NO_ABILITY)
  }
  if (!req.ability.can(conf.PERM.ACTION.SET_ROLE, conf.PERM.SUBJECT.USER)) {
    throw new MiddlewareErr(HTTP_STATUS.UNAUTHED, MESSAGE.INV_PERM)
  }
  const role = await rolesSvc.addUsers(id, users, includes)
  res.json(role)
}

/** `DELETE /api/roles/:id/users
  {users: NonNullable<UserKeys>} & {includes?: RoleIncs}`<br>
  => `RoleRes`<br>
  Authorization header required with the `USER SET_ROLE` permission. */
export const rmUsers = async (req: Request, res: Response) => {
  const id = idSchema.parse(req.params)
  const {users} = userSchemaKeys.parse(req.body)
  if (!users) {
    throw new z.ZodError([{
      code: z.ZodIssueCode.custom,
      message: MESSAGE.REQUIRED,
      path: ['users'],
    }])
  }
  const {includes} = roleSchemaIncs.parse(req.body) as {includes?: RoleIncs}
  if (!req.ability) {
    throw new Error(MESSAGE.NO_ABILITY)
  }
  if (!req.ability.can(conf.PERM.ACTION.SET_ROLE, conf.PERM.SUBJECT.USER)) {
    throw new MiddlewareErr(HTTP_STATUS.UNAUTHED, MESSAGE.INV_PERM)
  }
  const role = await rolesSvc.rmUsers(id, users, includes)
  res.json(role)
}

rolesRouter.get('/', auth, getAll)
rolesRouter.get(conf.BY_USERNAME, auth, getByUserName)
rolesRouter.get(conf.BY_USER, auth, getByUser)
rolesRouter.get(conf.BY_NAME, auth, getByName)
rolesRouter.get(conf.BY_ID, auth, getById)
rolesRouter.post(conf.SEARCH, auth, search)
rolesRouter.post(`${conf.BY_ID}${conf.REL_USERS}`, auth, addUsers)
rolesRouter.put(`${conf.BY_ID}${conf.REL_USERS}`, auth, setUsers)
rolesRouter.delete(`${conf.BY_ID}${conf.REL_USERS}`, auth, rmUsers)

export default rolesRouter
