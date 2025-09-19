import {z} from 'zod'

import {MESSAGE} from '@shared/const'
import {
  incsSchema, pageSchema, filterSchema, FilterWithOpOr, listSchema,
} from '@shared/schemas/base'
import {userSchemaResNoRelated} from '@shared/schemas'
import {profileSchema} from '@shared/schemas/prisma'

const autos = ['id', 'createdAt', 'updatedAt'] as const
const excludes = [] as const
const fkeys = ['username'] as const
// response of relations possibly included; note that for :m relationships, the
// count of included one should be controllable since no pagination for it
const relsRes = () => ({user: userSchemaResNoRelated.optional()} as const)
const resRels = ['user']

type ResField =
  Exclude<keyof typeof profileSchema.shape, typeof excludes[number]>
const resFields = Object.keys(profileSchema.shape).filter(
  e => !excludes.includes(e as typeof excludes[number]),
) as [ResField, ...ResField[]]
export const profOmit = Object.fromEntries(excludes.map(e => [e, true])) as {
  [K in typeof excludes[number]]: true
}
const resSchema = profileSchema.omit(profOmit)

/** Zod schema for profile's "name" (`username`). */
export const profSchemaName = z.object({name: profileSchema.shape.username})
/** Type of profile's "name" (`username`). */
export type ProfName = z.infer<typeof profSchemaName>['name']

/** Zod schema for profile's "key". */
export const profSchemaKey = z.object({
  profile: z.union(
    [profileSchema.pick({id: true}), profileSchema.pick({username: true})])
    .nullish(),
})
/** Type of profile's "key". */
export type ProfKey = z.infer<typeof profSchemaKey>['profile']

/** Zod schema for profile's "keys". */
export const profSchemaKeys = z.object({
  profiles: z.union(
    [profileSchema.pick({id: true}), profileSchema.pick({username: true})])
    .array().nonempty().nullish(),
})
/** Type of profile's "keys". */
export type ProfKeys = z.infer<typeof profSchemaKeys>['profiles']

/** Zod schema for profile's "includes". */
export const profSchemaIncs = incsSchema(resRels)
type Inc = keyof ReturnType<typeof relsRes>
/** Type of profile's "includes". */
export type ProfIncs = [Inc, ...Inc[]] | undefined

/** Zod schema for profile's "page", including pagination, order, and
  "includes". */
export const profSchemaPage = pageSchema(resFields).merge(profSchemaIncs)
/** Type of profile's "page", including pagination, order, and "includes". */
export type ProfPage =
  z.infer<typeof profSchemaPage> & {orderBy?: ResField} & {includes?: ProfIncs}

/** Zod schema for profile's "filter". */
export const profSchemaFilter =
  filterSchema('profiles', resFields, profileSchema.shape)
/** Type of profile's "filter". */
export type ProfFilter = FilterWithOpOr<z.infer<typeof resSchema>>

/** Zod schema for profile's "data", typically for creation. */
export const profSchemaData = z.object({
  profile: profileSchema.omit(
    Object.fromEntries([...autos, ...fkeys].map(e => [e, true])) as {
      [K in typeof autos[number] | typeof fkeys[number]]: true
    }),
})
/** Type of profile's "data", typically for creation. */
export type ProfData = z.infer<typeof profSchemaData>['profile']

/** Zod schema for profile's "partial data", typically for updating. */
export const profSchemaDataOpt = z.object({
  profile: profSchemaData.shape.profile.omit(profOmit).partial()
    .refine(d => Object.keys(d).length, {message: MESSAGE.INV_DATAOPT})
    .nullish(),
})
/** Type of profile's "partial data", typically for updating. */
export type ProfDataOpt = z.infer<typeof profSchemaDataOpt>['profile']

/** Zod schema for the "profile" response without any relations. */
export const profSchemaResNoRelated = resSchema
/** Type of the "profile" response without any relations. */
export type ProfResNoRelated = z.infer<typeof profSchemaResNoRelated>

/** Zod schema for the "profile" response. */
export const profSchemaRes =
  z.lazy(() => profSchemaResNoRelated.extend(relsRes()))
/** Type of the "profile" response. */
export type ProfRes = z.infer<typeof profSchemaRes>

/** Zod schema for the "profile list" response without any relations. */
export const profSchemaListResNoRelated = listSchema(profSchemaResNoRelated)
/** Type of the "profile list" response without any relations. */
export type ProfListResNoRelated = [ProfResNoRelated[], number]

/** Zod schema for the "profile list" response. */
export const profSchemaListRes = listSchema(profSchemaRes)
/** Type of the "profile list" response. */
export type ProfListRes = [ProfRes[], number]
