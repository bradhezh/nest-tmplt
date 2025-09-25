import {default as express, Request, Response} from 'express'
import {subject} from '@casl/ability'
import {z} from 'zod'

import {HTTP_STATUS, MESSAGE} from '@/const'
import conf from '@/conf'
import {auth, MiddlewareErr} from '@/utils/middleware'
import {
  idSchema, itemSchemaName,
  itemSchemaIncs, ItemIncs, itemSchemaPage, ItemPage, itemSchemaFilter,
  itemSchemaData, itemSchemaDataOpt,
  userSchemaFilter, userSchemaName,
} from '@shared/schemas'
import itemsSvc from '@/services/items'

export const itemsRouter = express.Router()

/** `POST /api/items/search ItemPage
  & {items?: NonNullable<ItemFilter>} & {users?: NonNullable<UserFilter>}`<br>
  => `ItemListRes` */
export const search = async (req: Request, res: Response) => {
  const page = itemSchemaPage.parse(req.body) as ItemPage
  const {items: filter} = itemSchemaFilter.parse(req.body)
  if (filter === null) {
    throw new z.ZodError([{
      code: z.ZodIssueCode.custom,
      message: MESSAGE.INV_NULL,
      path: ['items'],
    }])
  }
  const {users: userFltr} = userSchemaFilter.parse(req.body)
  if (userFltr === null) {
    throw new z.ZodError([{
      code: z.ZodIssueCode.custom,
      message: MESSAGE.INV_NULL,
      path: ['users'],
    }])
  }
  const items = await itemsSvc.pageSearch(page, filter, userFltr)
  res.json(items)
}

/** `GET /api/items{?page,pageSize,order,orderBy,includes}`<br>
  => `ItemListRes`<br>
  Refer to `ItemPage` for query parameter restrictions. */
export const getAll = async (req: Request, res: Response) => {
  const page = itemSchemaPage.parse(req.query) as ItemPage
  const items = await itemsSvc.pageSearch(page)
  res.json(items)
}

/** `GET /api/items/:id{?includes}`<br>
  => `ItemRes`<br>
  Refer to `ItemIncs` for query parameter restrictions. */
export const getById = async (req: Request, res: Response) => {
  const id = idSchema.parse(req.params)
  const {includes} = itemSchemaIncs.parse(req.query) as {includes?: ItemIncs}
  const item = await itemsSvc.getUnique(id, includes)
  res.json(item)
}

/** `GET /api/items/by-name/:item/by-username/:user{?includes}`<br>
  => `ItemRes`<br>
  Refer to `ItemIncs` for query parameter restrictions. */
export const getByNameUsername = async (req: Request, res: Response) => {
  const name = z.object({
    item: itemSchemaName.shape.name,
    user: userSchemaName.shape.name,
  }).parse(req.params)
  const {includes} = itemSchemaIncs.parse(req.query) as {includes?: ItemIncs}
  const item = await itemsSvc.getUnique({
    username_name: {
      username: name.user,
      name: name.item,
    },
  }, includes)
  res.json(item)
}

/** `GET /api/items/by-name/:name{?page,pageSize,order,orderBy,includes}`<br>
  => `ItemListRes`<br>
  Refer to `ItemPage` for query parameter restrictions. */
export const getByName = async (req: Request, res: Response) => {
  const name = itemSchemaName.parse(req.params)
  const page = itemSchemaPage.parse(req.query) as ItemPage
  const items = await itemsSvc.pageSearch(page, name)
  res.json(items)
}

/** `GET /api/items/by-user/:id{?page,pageSize,order,orderBy,includes}`<br>
  => `ItemListRes`<br>
  Refer to `ItemPage` for query parameter restrictions. */
export const getByUser = async (req: Request, res: Response) => {
  const id = idSchema.parse(req.params)
  const page = itemSchemaPage.parse(req.query) as ItemPage
  const items = await itemsSvc.pageSearch(page, {}, id)
  res.json(items)
}

/** `GET /api/items/by-username/:name{?page,pageSize,order,orderBy,includes}`
  <br>=> `ItemListRes`<br>
  Refer to `ItemPage` for query parameter restrictions. */
export const getByUsername = async (req: Request, res: Response) => {
  const {name: username} = userSchemaName.parse(req.params)
  const page = itemSchemaPage.parse(req.query) as ItemPage
  const items = await itemsSvc.pageSearch(page, {}, {username})
  res.json(items)
}

/** `POST /api/items {item: ItemData} & {includes?: ItemIncs}`<br>
  => `ItemRes`<br>
  Authorization header required with the `ITEM CREATE` permission. */
export const create = async (req: Request, res: Response) => {
  const {item: data} = itemSchemaData.parse(req.body)
  const {includes} = itemSchemaIncs.parse(req.body) as {includes?: ItemIncs}
  if (!req.ability || !req.user) {
    throw new Error(MESSAGE.NO_ABILITY)
  }
  if (!req.ability.can(conf.PERM.ACTION.CREATE, conf.PERM.SUBJECT.ITEM)) {
    throw new MiddlewareErr(HTTP_STATUS.UNAUTHED, MESSAGE.INV_PERM)
  }
  const item = await itemsSvc.create(data, {id: req.user.id}, includes)
  res.status(HTTP_STATUS.CREATED).json(item)
}

/** `PATCH /api/items/:id
  {item: NonNullable<ItemDataOpt>} & {includes?: UserIncs}`<br>
  => `ItemRes`<br>
  Authorization header required with the `ITEM UPDATE {username: user.username}`
  permission. */
export const update = async (req: Request, res: Response) => {
  const id = idSchema.parse(req.params)
  const {item: data} = itemSchemaDataOpt.parse(req.body)
  if (!data) {
    throw new z.ZodError([{
      code: z.ZodIssueCode.custom,
      message: MESSAGE.REQUIRED,
      path: ['item'],
    }])
  }
  const {includes} = itemSchemaIncs.parse(req.body) as {includes?: ItemIncs}
  if (!req.ability) {
    throw new Error(MESSAGE.NO_ABILITY)
  }
  const item = await itemsSvc.getUnique(id)
  if (!req.ability.can(conf.PERM.ACTION.UPDATE,
    subject(conf.PERM.SUBJECT.ITEM, {username: item.username}))) {
    throw new MiddlewareErr(HTTP_STATUS.UNAUTHED, MESSAGE.INV_PERM)
  }
  const updated = await itemsSvc.update(id, data, undefined, includes)
  res.json(updated)
}

/** `DELETE /api/items/:id`<br>
  Authorization header required with the `ITEM DELETE {username: user.username}`
  permission. */
export const remove = async (req: Request, res: Response) => {
  const id = idSchema.parse(req.params)
  if (!req.ability) {
    throw new Error(MESSAGE.NO_ABILITY)
  }
  const item = await itemsSvc.getUnique(id)
  if (!req.ability.can(conf.PERM.ACTION.DELETE,
    subject(conf.PERM.SUBJECT.ITEM, {username: item.username}))) {
    throw new MiddlewareErr(HTTP_STATUS.UNAUTHED, MESSAGE.INV_PERM)
  }
  await itemsSvc.remove(id)
  res.status(HTTP_STATUS.NO_CONTENT).end()
}

/** `DELETE /api/items
  {items?: NonNullable<ItemFilter>} & {users?: NonNullable<UserFilter>}`<br>
  => `number`<br>
  Authorization header required with the `ITEM DELETE` (with `users`) or `ITEM
  DELETE {username: user.username}` (without `users`, meaning my items)
  permission. */
export const rmBulk = async (req: Request, res: Response) => {
  const {items: filter} = itemSchemaFilter.parse(req.body)
  if (filter === null) {
    throw new z.ZodError([{
      code: z.ZodIssueCode.custom,
      message: MESSAGE.INV_NULL,
      path: ['items'],
    }])
  }
  const {users: userFltr} = userSchemaFilter.parse(req.body)
  if (userFltr === null) {
    throw new z.ZodError([{
      code: z.ZodIssueCode.custom,
      message: MESSAGE.INV_NULL,
      path: ['users'],
    }])
  }
  if (!req.ability || !req.user) {
    throw new Error(MESSAGE.NO_ABILITY)
  }
  if (userFltr
    && !req.ability.can(conf.PERM.ACTION.DELETE, conf.PERM.SUBJECT.ITEM)
    || !userFltr
    && !req.ability.can(conf.PERM.ACTION.DELETE,
      subject(conf.PERM.SUBJECT.ITEM, {username: req.user.username}))) {
    throw new MiddlewareErr(HTTP_STATUS.UNAUTHED, MESSAGE.INV_PERM)
  }
  const ret =
    await itemsSvc.rmBulk(filter, userFltr ?? {username: req.user.username})
  res.json(ret.count)
}

itemsRouter.get('/', getAll)
itemsRouter.get(
  `${conf.BY_NAME_ITEM}${conf.BY_USERNAME_USER}`, getByNameUsername)
itemsRouter.get(conf.BY_USERNAME, getByUsername)
itemsRouter.get(conf.BY_USER, getByUser)
itemsRouter.get(conf.BY_NAME, getByName)
itemsRouter.get(conf.BY_ID, getById)
itemsRouter.post(conf.SEARCH, search)
itemsRouter.post('/', auth, create)
itemsRouter.patch(conf.BY_ID, auth, update)
itemsRouter.delete('/', auth, rmBulk)
itemsRouter.delete(conf.BY_ID, auth, remove)

export default itemsRouter
