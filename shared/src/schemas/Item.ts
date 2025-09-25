import {z} from 'zod'

import {
  incsSchema, pageSchema,
  filterSchema, FilterWithOp, updateSchema, UpdateWithOp, listSchema,
} from '@shared/schemas/base'
import {userSchemaResNoRelated} from '@shared/schemas'
import {itemSchema} from '@shared/schemas/prisma'

const autos = ['id', 'createdAt', 'updatedAt'] as const
const excludes = [] as const
const fkeys = ['username'] as const
// response of relations possibly included; note that for :m relationships, the
// count of included one should be controllable since no pagination for it
const relsRes = () => ({user: userSchemaResNoRelated.optional()} as const)
const resRels = ['user'] as const

type ResField = Exclude<keyof typeof itemSchema.shape, typeof excludes[number]>
const resFields = Object.keys(itemSchema.shape).filter(
  e => !excludes.includes(e as typeof excludes[number]),
) as [ResField, ...ResField[]]
export const itemOmit = Object.fromEntries(excludes.map(e => [e, true])) as {
  [K in typeof excludes[number]]: true
}
const resSchema = itemSchema.omit(itemOmit)

/** Zod schema for item's "name". */
export const itemSchemaName = z.object({name: itemSchema.shape.name})
/** Type of item's "name". */
export type ItemName = z.infer<typeof itemSchemaName>['name']

/** Zod schema for item's "key". */
export const itemSchemaKey = z.object({
  item: z.union([
    itemSchema.pick({id: true}), itemSchema.pick({username: true, name: true}),
  ]).nullish(),
})
/** Type of item's "key". */
export type ItemKey = z.infer<typeof itemSchemaKey>['item']

/** Zod schema for item's "keys". */
export const itemSchemaKeys = z.object({
  items: z.union([
    itemSchema.pick({id: true}), itemSchema.pick({username: true, name: true}),
  ]).array().nonempty().nullish(),
})
/** Type of item's "keys". */
export type ItemKeys = z.infer<typeof itemSchemaKeys>['items']

/** Zod schema for item's "includes". */
export const itemSchemaIncs = incsSchema(resRels)
type Inc = keyof ReturnType<typeof relsRes>
/** Type of item's "includes". */
export type ItemIncs = [Inc, ...Inc[]] | undefined

/** Zod schema for item's "page", including pagination and order. */
export const itemSchemaPage = pageSchema(resFields)
/** Type of item's "page", including pagination and order. */
export type ItemPage =
  z.infer<typeof itemSchemaPage>['page'] & {orderBy?: ResField}

/** Zod schema for item's "filter". */
export const itemSchemaFilter =
  filterSchema('items', resFields, itemSchema.shape)
/** Type of item's "filter". */
export type ItemFilter = FilterWithOp<z.infer<typeof resSchema>>

/** Zod schema for item's "data", typically for creation. */
export const itemSchemaData = z.object({
  item: itemSchema.omit(
    Object.fromEntries([...autos, ...fkeys].map(e => [e, true])) as {
      [K in typeof autos[number] | typeof fkeys[number]]: true
    }),
})
/** Type of item's "data", typically for creation. */
export type ItemData = z.infer<typeof itemSchemaData>['item']

/** Zod schema for item's "update data". */
export const itemSchemaUpdate = updateSchema('item',
  Object.keys(itemSchemaData.shape.item.omit(itemOmit).shape), itemSchema.shape)
/** Type of item's "update data". */
export type ItemUpdate = UpdateWithOp<
  Omit<z.infer<typeof resSchema>, typeof autos[number] | typeof fkeys[number]>>

/** Zod schema for the "item" response without any relations. */
export const itemSchemaResNoRelated = resSchema
/** Type of the "item" response without any relations. */
export type ItemResNoRelated = z.infer<typeof itemSchemaResNoRelated>

/** Zod schema for the "item" response. */
export const itemSchemaRes =
  z.lazy(() => itemSchemaResNoRelated.extend(relsRes()))
/** Type of the "item" response. */
export type ItemRes = z.infer<typeof itemSchemaRes>

/** Zod schema for the "item list" response without any relations. */
export const itemSchemaListResNoRelated = listSchema(itemSchemaResNoRelated)
/** Type of the "item list" response without any relations. */
export type ItemListResNoRelated = [ItemResNoRelated[], number]

/** Zod schema for the "item list" response. */
export const itemSchemaListRes = listSchema(itemSchemaRes)
/** Type of the "item list" response. */
export type ItemListRes = [ItemRes[], number]
