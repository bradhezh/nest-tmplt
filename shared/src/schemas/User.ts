import {z} from 'zod'

import {MESSAGE} from '@shared/const'
import {
  incsSchema, pageSchema, filterSchema, FilterWithOpOr, listSchema,
} from '@shared/schemas/base'
import {profSchemaResNoRelated, roleSchemaResNoRelated} from '@shared/schemas'
import {userSchema} from '@shared/schemas/prisma'

const autos = ['id', 'createdAt', 'updatedAt'] as const
const excludes = ['password'] as const
const fkeys = [] as const
// response of relations possibly included; note that for :m relationships, the
// count of included one should be controllable since no pagination for it
const relsRes = () => ({
  profile: profSchemaResNoRelated.nullish(),
  roles: roleSchemaResNoRelated.array().optional(),
} as const)
const resRels = ['profile', 'roles']

type ResField = Exclude<keyof typeof userSchema.shape, typeof excludes[number]>
const resFields = Object.keys(userSchema.shape).filter(
  e => !excludes.includes(e as typeof excludes[number]),
) as [ResField, ...ResField[]]
export const userOmit = Object.fromEntries(excludes.map(e => [e, true])) as {
  [K in typeof excludes[number]]: true
}
const resSchema = userSchema.omit(userOmit)

/** Zod schema for user's "name" (`username`). */
export const userSchemaName = z.object({name: userSchema.shape.username})
/** Type of user's "name" (`username`). */
export type UserName = z.infer<typeof userSchemaName>['name']

/** Zod schema for user's "key". */
export const userSchemaKey = z.object({
  user: z.union([
    userSchema.pick({id: true}),
    userSchema.pick({username: true}),
    userSchema.pick({email: true}),
  ]).nullish(),
})
/** Type of user's "key". */
export type UserKey = z.infer<typeof userSchemaKey>['user']

/** Zod schema for user's "keys". */
export const userSchemaKeys = z.object({
  users: z.union([
    userSchema.pick({id: true}),
    userSchema.pick({username: true}),
    userSchema.pick({email: true}),
  ]).array().nonempty().nullish(),
})
/** Type of user's "keys". */
export type UserKeys = z.infer<typeof userSchemaKeys>['users']

/** Zod schema for user's "includes". */
export const userSchemaIncs = incsSchema(resRels)
type Inc = keyof ReturnType<typeof relsRes>
/** Type of user's "includes". */
export type UserIncs = [Inc, ...Inc[]] | undefined

/** Zod schema for user's "page", including pagination, order, and "includes".
*/
export const userSchemaPage = pageSchema(resFields).merge(userSchemaIncs)
/** Type of user's "page", including pagination, order, and "includes". */
export type UserPage =
  z.infer<typeof userSchemaPage> & {orderBy?: ResField} & {includes?: UserIncs}

/** Zod schema for user's "filter". */
export const userSchemaFilter =
  filterSchema('users', resFields, userSchema.shape)
/** Type of user's "filter". */
export type UserFilter = FilterWithOpOr<z.infer<typeof resSchema>>

/** Zod schema for user's "data", typically for creation. */
export const userSchemaData = z.object({
  user: userSchema.omit(
    Object.fromEntries([...autos, ...fkeys].map(e => [e, true])) as {
      [K in typeof autos[number] | typeof fkeys[number]]: true
    }),
})
/** Type of user's "data", typically for creation. */
export type UserData = z.infer<typeof userSchemaData>['user']

/** Zod schema for user's "partial data", typically for updating. */
export const userSchemaDataOpt = z.object({
  user: userSchemaData.shape.user.omit(userOmit).partial()
    .refine(d => Object.keys(d).length, {message: MESSAGE.INV_DATAOPT})
    .nullish(),
})
/** Type of user's "partial data", typically for updating. */
export type UserDataOpt = z.infer<typeof userSchemaDataOpt>['user']

/** Zod schema for "password". */
export const passwdSchema = z.object({
  old: userSchema.shape.password,
  new: userSchema.shape.password,
})
/** Type of "password". */
export type Password = z.infer<typeof passwdSchema>

/** Zod schema for "credential". */
export const credentialSchema = userSchema.pick({
  username: true,
  password: true,
})
/** Type of "credential". */
export type Credential = z.infer<typeof credentialSchema>

/** Zod schema for the "user" response without any relations. */
export const userSchemaResNoRelated = resSchema
/** Type of the "user" response without any relations. */
export type UserResNoRelated = z.infer<typeof userSchemaResNoRelated>

/** Zod schema for the "user" response. */
export const userSchemaRes =
  z.lazy(() => userSchemaResNoRelated.extend(relsRes()))
/** Type of the "user" response. */
export type UserRes = z.infer<typeof userSchemaRes>

/** Zod schema for the "login" response without any relations. */
export const userSchemaResTokenNoRelated = resSchema.extend({token: z.string()})
/** Type of the "login" response without any relations. */
export type UserResTokenNoRelated = z.infer<typeof userSchemaResTokenNoRelated>

/** Zod schema for the "login" response. */
export const userSchemaResToken =
  z.lazy(() => userSchemaResTokenNoRelated.extend(relsRes()))
/** Type of the "login" response. */
export type UserResToken = z.infer<typeof userSchemaResToken>

/** Zod schema for the "user list" response without any relations. */
export const userSchemaListResNoRelated = listSchema(userSchemaResNoRelated)
/** Type of the "user list" response without any relations. */
export type UserListResNoRelated = [UserResNoRelated[], number]

/** Zod schema for the "user list" response. */
export const userSchemaListRes = listSchema(userSchemaRes)
/** Type of the "user list" response. */
export type UserListRes = [UserRes[], number]
