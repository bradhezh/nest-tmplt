import {default as express, Request, Response} from 'express'
import {z} from 'zod'

import {HTTP_STATUS, MESSAGE} from '@/const'
import conf from '@/conf'
import {auth, MiddlewareErr} from '@/utils/middleware'
import {
  idSchema, userSchemaName,
  userSchemaIncs, UserIncs, userSchemaPage, UserPage, userSchemaFilter,
  userSchemaData, userSchemaDataOpt,
  profSchemaFilter, roleSchemaFilter, itemSchemaFilter,
  roleSchemaKeys, roleSchemaName, profSchemaData, profSchemaDataOpt,
  passwdSchema,
} from '@shared/schemas'
import usersSvc from '@/services/users'

export const usersRouter = express.Router()

/** `POST /api/users/search UserPage & {users?: NonNullable<UserFilter>}
  & {profiles?: ProfFilter} & {roles?: RoleFilter} & {items?: ItemFilter}`<br>
  => `UserListRes`<br>
  Authorization header required with the `USER READ` permission. */
export const search = async (req: Request, res: Response) => {
  const page = userSchemaPage.parse(req.body) as UserPage
  const {users: filter} = userSchemaFilter.parse(req.body)
  if (filter === null) {
    throw new z.ZodError([{
      code: z.ZodIssueCode.custom,
      message: MESSAGE.INV_NULL,
      path: ['users'],
    }])
  }
  const {profiles: profFltr} = profSchemaFilter.parse(req.body)
  const {roles: roleFltr} = roleSchemaFilter.parse(req.body)
  const {items: itemFltr} = itemSchemaFilter.parse(req.body)
  if (!req.ability) {
    throw new Error(MESSAGE.NO_ABILITY)
  }
  if (!req.ability.can(conf.PERM.ACTION.READ, conf.PERM.SUBJECT.USER)) {
    throw new MiddlewareErr(HTTP_STATUS.UNAUTHED, MESSAGE.INV_PERM)
  }
  const users =
    await usersSvc.pageSearch(page, filter, profFltr, roleFltr, itemFltr)
  res.json(users)
}

/** `GET /api/users{?page,pageSize,order,orderBy,includes}`<br>
  => `UserListRes`<br>
  Refer to `UserPage` for query parameter restrictions.<br>
  Authorization header required with the `USER READ` permission. */
export const getAll = async (req: Request, res: Response) => {
  const page = userSchemaPage.parse(req.query) as UserPage
  if (!req.ability) {
    throw new Error(MESSAGE.NO_ABILITY)
  }
  if (!req.ability.can(conf.PERM.ACTION.READ, conf.PERM.SUBJECT.USER)) {
    throw new MiddlewareErr(HTTP_STATUS.UNAUTHED, MESSAGE.INV_PERM)
  }
  const users = await usersSvc.pageSearch(page)
  res.json(users)
}

/** `GET /api/users/:id{?includes}`<br>
  => `UserRes`<br>
  Refer to `UserIncs` for query parameter restrictions.<br>
  Authorization header required with the `USER READ` permission. */
export const getById = async (req: Request, res: Response) => {
  const id = idSchema.parse(req.params)
  const {includes} = userSchemaIncs.parse(req.query) as {includes?: UserIncs}
  if (!req.ability) {
    throw new Error(MESSAGE.NO_ABILITY)
  }
  if (!req.ability.can(conf.PERM.ACTION.READ, conf.PERM.SUBJECT.USER)) {
    throw new MiddlewareErr(HTTP_STATUS.UNAUTHED, MESSAGE.INV_PERM)
  }
  const user = await usersSvc.getUnique(id, includes)
  res.json(user)
}

/** `GET /api/users/by-name/:name{?includes}`<br>
  => `UserRes`<br>
  Refer to `UserIncs` for query parameter restrictions.
  Authorization header required with the `USER READ` permission. */
export const getByName = async (req: Request, res: Response) => {
  const {name: username} = userSchemaName.parse(req.params)
  const {includes} = userSchemaIncs.parse(req.query) as {includes?: UserIncs}
  if (!req.ability) {
    throw new Error(MESSAGE.NO_ABILITY)
  }
  if (!req.ability.can(conf.PERM.ACTION.READ, conf.PERM.SUBJECT.USER)) {
    throw new MiddlewareErr(HTTP_STATUS.UNAUTHED, MESSAGE.INV_PERM)
  }
  const user = await usersSvc.getUnique({username}, includes)
  res.json(user)
}

/** `GET /api/users/by-role/:id{?page,pageSize,order,orderBy,includes}`<br>
  => `UserListRes`<br>
  Refer to `UserPage` for query parameter restrictions.<br>
  Authorization header required with the `USER READ` permission. */
export const getByRole = async (req: Request, res: Response) => {
  const id = idSchema.parse(req.params)
  const page = userSchemaPage.parse(req.query) as UserPage
  if (!req.ability) {
    throw new Error(MESSAGE.NO_ABILITY)
  }
  if (!req.ability.can(conf.PERM.ACTION.READ, conf.PERM.SUBJECT.USER)) {
    throw new MiddlewareErr(HTTP_STATUS.UNAUTHED, MESSAGE.INV_PERM)
  }
  const users = await usersSvc.pageSearch(page, {}, {}, id)
  res.json(users)
}

/** `GET /api/users/by-role-name/:name{?page,pageSize,order,orderBy,includes}`
  <br>=> `UserListRes`<br>
  Refer to `UserPage` for query parameter restrictions.<br>
  Authorization header required with the `USER READ` permission. */
export const getByRoleName = async (req: Request, res: Response) => {
  const name = roleSchemaName.parse(req.params)
  const page = userSchemaPage.parse(req.query) as UserPage
  if (!req.ability) {
    throw new Error(MESSAGE.NO_ABILITY)
  }
  if (!req.ability.can(conf.PERM.ACTION.READ, conf.PERM.SUBJECT.USER)) {
    throw new MiddlewareErr(HTTP_STATUS.UNAUTHED, MESSAGE.INV_PERM)
  }
  const users = await usersSvc.pageSearch(page, {}, {}, name)
  res.json(users)
}

/** `POST /api/users/signup
  {user: UserData} & {profile?: ProfData} & {includes?: UserIncs}`<br>
  => `UserRes`<br> */
export const signup = async (req: Request, res: Response) => {
  const {user: data} = userSchemaData.parse(req.body)
  const {profile} = profSchemaData.partial().parse(req.body)
  const {includes} = userSchemaIncs.parse(req.body) as {includes?: UserIncs}
  const user =
    await usersSvc.create(data, profile, [{name: conf.ROLE_DEF}], includes)
  res.status(HTTP_STATUS.CREATED).json(user)
}

/** `POST /api/users
  {user: UserData} & {roles?: RoleKeys} & {includes?: UserIncs}`<br>
  => `UserRes`<br>
  Authorization header required with the `USER CREATE` permission, and
  `USER SET_ROLE` for `roles`. */
export const create = async (req: Request, res: Response) => {
  const {user: data} = userSchemaData.parse(req.body)
  const {roles} = roleSchemaKeys.parse(req.body)
  const {includes} = userSchemaIncs.parse(req.body) as {includes?: UserIncs}
  if (!req.ability) {
    throw new Error(MESSAGE.NO_ABILITY)
  }
  if (!req.ability.can(conf.PERM.ACTION.CREATE, conf.PERM.SUBJECT.USER)
    || roles !== undefined
    && !req.ability.can(conf.PERM.ACTION.SET_ROLE, conf.PERM.SUBJECT.USER)) {
    throw new MiddlewareErr(HTTP_STATUS.UNAUTHED, MESSAGE.INV_PERM)
  }
  const user = await usersSvc.create(data, undefined, roles, includes)
  res.status(HTTP_STATUS.CREATED).json(user)
}

/** `PATCH /api/users/me {user?: NonNullable<UserDataOpt>}
  & {profile?: ProfData | ProfDataOpt} & {includes?: UserIncs}`<br>
  => `UserRes`<br>
  If `profile` is valid and the user has no profile, it must be `ProfData` for
  creating the user's profile. */
export const updateMe = async (req: Request, res: Response) => {
  const {user: data} = userSchemaDataOpt.parse(req.body)
  if (data === null) {
    throw new z.ZodError([{
      code: z.ZodIssueCode.custom,
      message: MESSAGE.INV_NULL,
      path: ['user'],
    }])
  }
  const r = profSchemaData.safeParse(req.body)
  const {profile} = r.success ? r.data : profSchemaDataOpt.parse(req.body)
  const {includes} = userSchemaIncs.parse(req.body) as {includes?: UserIncs}
  if (!req.user) {
    throw new Error(MESSAGE.NO_ABILITY)
  }
  const user =
    await usersSvc.update({id: req.user.id}, data, profile, undefined, includes)
  res.json(user)
}

/** `PATCH /api/users/:id {user?: NonNullable<UserDataOpt>}
  & {roles?: RoleKeys} & {includes?: UserIncs}`<br>
  => `UserRes`<br>
  Authorization header required with the `USER UPDATE` permission for `user`, or
  `USER SET_ROLE` for `roles`. */
export const update = async (req: Request, res: Response) => {
  const id = idSchema.parse(req.params)
  const {user: data} = userSchemaDataOpt.parse(req.body)
  if (data === null) {
    throw new z.ZodError([{
      code: z.ZodIssueCode.custom,
      message: MESSAGE.INV_NULL,
      path: ['user'],
    }])
  }
  const {roles} = roleSchemaKeys.parse(req.body)
  const {includes} = userSchemaIncs.parse(req.body) as {includes?: UserIncs}
  if (!req.ability) {
    throw new Error(MESSAGE.NO_ABILITY)
  }
  if (data && !req.ability.can(conf.PERM.ACTION.UPDATE, conf.PERM.SUBJECT.USER)
    || roles !== undefined
    && !req.ability.can(conf.PERM.ACTION.SET_ROLE, conf.PERM.SUBJECT.USER)) {
    throw new MiddlewareErr(HTTP_STATUS.UNAUTHED, MESSAGE.INV_PERM)
  }
  const user = await usersSvc.update(id, data, undefined, roles, includes)
  res.json(user)
}

/** `PATCH /api/users/me/password {password: Password}` */
export const setMyPasswd = async (req: Request, res: Response) => {
  const password = passwdSchema.parse(req.body)
  if (!req.user) {
    throw new Error(MESSAGE.NO_ABILITY)
  }
  if (!await usersSvc.setPasswd({id: req.user.id}, password)) {
    throw new MiddlewareErr(HTTP_STATUS.UNAUTHED, MESSAGE.INV_CREDENTIAL)
  }
  res.status(HTTP_STATUS.NO_CONTENT).end()
}

/** `PATCH /api/users/:id/password`<br>
  Authorization header required with the `USER RESET_PASSWD` permission. */
export const setPasswd = async (req: Request, res: Response) => {
  const id = idSchema.parse(req.params)
  if (!req.ability) {
    throw new Error(MESSAGE.NO_ABILITY)
  }
  if (!req.ability.can(conf.PERM.ACTION.RESET_PASSWD, conf.PERM.SUBJECT.USER)) {
    throw new MiddlewareErr(HTTP_STATUS.UNAUTHED, MESSAGE.INV_PERM)
  }
  await usersSvc.setPasswd(id, conf.DEF_PASSWD)
  res.status(HTTP_STATUS.NO_CONTENT).end()
}

/** `POST /api/users/:id/roles
  {roles: NonNullable<RoleKeys>} & {includes?: UserIncs}`<br>
  => `UserRes`<br>
  Authorization header required with the `USER SET_ROLE` permission. */
export const addRoles = async (req: Request, res: Response) => {
  const id = idSchema.parse(req.params)
  const {roles} = roleSchemaKeys.parse(req.body)
  if (!roles) {
    throw new z.ZodError([{
      code: z.ZodIssueCode.custom,
      message: MESSAGE.REQUIRED,
      path: ['roles'],
    }])
  }
  const {includes} = userSchemaIncs.parse(req.body) as {includes?: UserIncs}
  if (!req.ability) {
    throw new Error(MESSAGE.NO_ABILITY)
  }
  if (!req.ability.can(conf.PERM.ACTION.SET_ROLE, conf.PERM.SUBJECT.USER)) {
    throw new MiddlewareErr(HTTP_STATUS.UNAUTHED, MESSAGE.INV_PERM)
  }
  const user = await usersSvc.addRoles(id, roles, includes)
  res.json(user)
}

/** `DELETE /api/users/:id/roles
  {roles: NonNullable<RoleKeys>} & {includes?: UserIncs}`<br>
  => `UserRes`<br>
  Authorization header required with the `USER SET_ROLE` permission. */
export const rmRoles = async (req: Request, res: Response) => {
  const id = idSchema.parse(req.params)
  const {roles} = roleSchemaKeys.parse(req.body)
  if (!roles) {
    throw new z.ZodError([{
      code: z.ZodIssueCode.custom,
      message: MESSAGE.REQUIRED,
      path: ['roles'],
    }])
  }
  const {includes} = userSchemaIncs.parse(req.body) as {includes?: UserIncs}
  if (!req.ability) {
    throw new Error(MESSAGE.NO_ABILITY)
  }
  if (!req.ability.can(conf.PERM.ACTION.SET_ROLE, conf.PERM.SUBJECT.USER)) {
    throw new MiddlewareErr(HTTP_STATUS.UNAUTHED, MESSAGE.INV_PERM)
  }
  const user = await usersSvc.rmRoles(id, roles, includes)
  res.json(user)
}

/** `DELETE /api/users/me` */
export const removeMe = async (req: Request, res: Response) => {
  if (!req.user) {
    throw new Error(MESSAGE.NO_ABILITY)
  }
  await usersSvc.remove({id: req.user.id})
  res.status(HTTP_STATUS.NO_CONTENT).end()
}

/** `DELETE /api/users/:id`<br>
  Authorization header required with the `USER DELETE` permission. */
export const remove = async (req: Request, res: Response) => {
  const id = idSchema.parse(req.params)
  if (!req.ability) {
    throw new Error(MESSAGE.NO_ABILITY)
  }
  if (!req.ability.can(conf.PERM.ACTION.DELETE, conf.PERM.SUBJECT.USER)) {
    throw new MiddlewareErr(HTTP_STATUS.UNAUTHED, MESSAGE.INV_PERM)
  }
  await usersSvc.remove(id)
  res.status(HTTP_STATUS.NO_CONTENT).end()
}

/** `DELETE /api/users {users?: NonNullable<UserFilter>}
  & {profiles?: ProfFilter} & {roles?: RoleFilter} & {items?: ItemFilter}`<br>
  => `number`<br>
  Authorization header required with the `USER DELETE` permission. */
export const rmBulk = async (req: Request, res: Response) => {
  const {users: filter} = userSchemaFilter.parse(req.body)
  if (filter === null) {
    throw new z.ZodError([{
      code: z.ZodIssueCode.custom,
      message: MESSAGE.INV_NULL,
      path: ['users'],
    }])
  }
  const {profiles: profFltr} = profSchemaFilter.parse(req.body)
  const {roles: roleFltr} = roleSchemaFilter.parse(req.body)
  const {items: itemFltr} = itemSchemaFilter.parse(req.body)
  if (!req.ability) {
    throw new Error(MESSAGE.NO_ABILITY)
  }
  if (!req.ability.can(conf.PERM.ACTION.DELETE, conf.PERM.SUBJECT.USER)) {
    throw new MiddlewareErr(HTTP_STATUS.UNAUTHED, MESSAGE.INV_PERM)
  }
  const ret = await usersSvc.rmBulk(filter, profFltr, roleFltr, itemFltr)
  res.json(ret.count)
}

usersRouter.get('/', auth, getAll)
usersRouter.get(conf.BY_ROLENAME, auth, getByRoleName)
usersRouter.get(conf.BY_ROLE, auth, getByRole)
usersRouter.get(conf.BY_NAME, auth, getByName)
usersRouter.get(conf.BY_ID, auth, getById)
usersRouter.post(conf.SEARCH, auth, search)
usersRouter.post(conf.SIGNUP, signup)
usersRouter.post('/', auth, create)
usersRouter.post(`${conf.BY_ID}${conf.REL_ROLES}`, auth, addRoles)
usersRouter.patch(`${conf.ME}${conf.USER_PASSWD}`, auth, setMyPasswd)
usersRouter.patch(conf.ME, auth, updateMe)
usersRouter.patch(`${conf.BY_ID}${conf.USER_PASSWD}`, auth, setPasswd)
usersRouter.patch(conf.BY_ID, auth, update)
usersRouter.delete(conf.ME, auth, removeMe)
usersRouter.delete('/', auth, rmBulk)
usersRouter.delete(`${conf.BY_ID}${conf.REL_ROLES}`, auth, rmRoles)
usersRouter.delete(conf.BY_ID, auth, remove)

export default usersRouter
