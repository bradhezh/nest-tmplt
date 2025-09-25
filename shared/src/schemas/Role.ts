import {z} from 'zod'

import {
  incsSchema, pageSchema,
  filterSchema, FilterWithOp, updateSchema, UpdateWithOp, listSchema,
} from '@shared/schemas/base'
import {roleSchema} from '@shared/schemas/prisma'

const autos = ['id', 'createdAt', 'updatedAt'] as const
const excludes = [] as const
const fkeys = [] as const
// response of relations possibly included; note that for :m relationships, the
// count of included one should be controllable since no pagination for it
const relsRes = () => ({} as const)
const resRels = [] as const

type ResField = Exclude<keyof typeof roleSchema.shape, typeof excludes[number]>
const resFields = Object.keys(roleSchema.shape).filter(
  e => !excludes.includes(e as typeof excludes[number]),
) as [ResField, ...ResField[]]
export const roleOmit = Object.fromEntries(excludes.map(e => [e, true])) as {
  [K in typeof excludes[number]]: true
}
const resSchema = roleSchema.omit(roleOmit)

/** Zod schema for role's "name". */
export const roleSchemaName = z.object({name: roleSchema.shape.name})
/** Type of role's "name". */
export type RoleName = z.infer<typeof roleSchemaName>['name']

/** Zod schema for role's "key". */
export const roleSchemaKey = z.object({
  role: z.union([roleSchema.pick({id: true}), roleSchema.pick({name: true})])
    .nullish(),
})
/** Type of role's "key". */
export type RoleKey = z.infer<typeof roleSchemaKey>['role']

/** Zod schema for role's "keys". */
export const roleSchemaKeys = z.object({
  roles: z.union([roleSchema.pick({id: true}), roleSchema.pick({name: true})])
    .array().nonempty().nullish(),
})
/** Type of role's "keys". */
export type RoleKeys = z.infer<typeof roleSchemaKeys>['roles']

/** Zod schema for role's "includes". */
export const roleSchemaIncs = incsSchema(resRels)
type Inc = keyof ReturnType<typeof relsRes>
/** Type of role's "includes". */
export type RoleIncs = [Inc, ...Inc[]] | undefined

/** Zod schema for role's "page", including pagination and order. */
export const roleSchemaPage = pageSchema(resFields)
/** Type of role's "page", including pagination and order. */
export type RolePage =
  z.infer<typeof roleSchemaPage>['page'] & {orderBy?: ResField}

/** Zod schema for role's "filter". */
export const roleSchemaFilter =
  filterSchema('roles', resFields, roleSchema.shape)
/** Type of role's "filter". */
export type RoleFilter = FilterWithOp<z.infer<typeof resSchema>>

/** Zod schema for role's "data", typically for creation. */
export const roleSchemaData = z.object({
  role: roleSchema.omit(
    Object.fromEntries([...autos, ...fkeys].map(e => [e, true])) as {
      [K in typeof autos[number] | typeof fkeys[number]]: true
    }),
})
/** Type of role's "data", typically for creation. */
export type RoleData = z.infer<typeof roleSchemaData>['role']

/** Zod schema for role's "update data". */
export const roleSchemaUpdate = updateSchema('role',
  Object.keys(roleSchemaData.shape.role.omit(roleOmit).shape), roleSchema.shape)
/** Type of role's "update data". */
export type RoleUpdate = UpdateWithOp<
  Omit<z.infer<typeof resSchema>, typeof autos[number] | typeof fkeys[number]>>

/** Zod schema for the "role" response without any relations. */
export const roleSchemaResNoRelated = resSchema
/** Type of the "role" response without any relations. */
export type RoleResNoRelated = z.infer<typeof roleSchemaResNoRelated>

/** Zod schema for the "role" response. */
export const roleSchemaRes =
  z.lazy(() => roleSchemaResNoRelated.extend(relsRes()))
/** Type of the "role" response. */
export type RoleRes = z.infer<typeof roleSchemaRes>

/** Zod schema for the "role list" response without any relations. */
export const roleSchemaListResNoRelated = listSchema(roleSchemaResNoRelated)
/** Type of the "role list" response without any relations. */
export type RoleListResNoRelated = [RoleResNoRelated[], number]

/** Zod schema for the "role list" response. */
export const roleSchemaListRes = listSchema(roleSchemaRes)
/** Type of the "role list" response. */
export type RoleListRes = [RoleRes[], number]
