import z from 'zod'

import {message} from '@/const'
import {
  userSchemaName, UserName, userSchemaKey, UserKey, userSchemaKeys, UserKeys,
  userSchemaIncs, UserIncs, userSchemaPage, UserPage,
  userSchemaFilter, UserFilter,
  userSchemaData, UserData, userSchemaUpdate, UserUpdate,
  passwdSchema, Password,
} from '@shared/schemas'
import {ZodSchema} from '@/common'

@ZodSchema(userSchemaName)
export class UserDtoName {
  name!: UserName
}

@ZodSchema(userSchemaKey)
export class UserDtoKey {
  user?: UserKey
}

// as a required (nonNull) foreign key for creation (required: nonUndefined)
@ZodSchema(z.object({
  user: userSchemaKey.shape.user
    .refine(d => d != null, {message: message.nonNullish}),
}))
export class UserDtoKeyNonNullish {
  user!: NonNullable<UserKey>
}

// as a required (nonNull) foreign key for updating (optional)
@ZodSchema(z.object({
  user: userSchemaKey.shape.user
    .refine(d => d !== null, {message: message.nonNull}),
}))
export class UserDtoKeyNonNull {
  user?: NonNullable<UserKey>
}

@ZodSchema(userSchemaKeys)
export class UserDtoKeys {
  users?: UserKeys
}

// for addUsers and rmUsers
@ZodSchema(z.object({
  users: userSchemaKeys.shape.users
    .refine(d => d != null, {message: message.nonNullish}),
}))
export class UserDtoKeysNonNullish {
  users!: NonNullable<UserKeys>
}

@ZodSchema(userSchemaIncs)
export class UserDtoIncs {
  includes?: UserIncs
}

// with default
@ZodSchema(userSchemaPage)
export class UserDtoPage {
  page!: UserPage
}

@ZodSchema(userSchemaFilter)
export class UserDtoFilter {
  users?: UserFilter
}

// as the non-relation filter for oneself
@ZodSchema(z.object({
  users: userSchemaFilter.shape.users
    .refine(d => d !== null, {message: message.nonNull}),
}))
export class UserDtoFilterNonNull {
  users?: NonNullable<UserFilter>
}

@ZodSchema(userSchemaData)
export class UserDtoData {
  user!: UserData
}

@ZodSchema(userSchemaUpdate)
export class UserDtoUpdate {
  user?: UserUpdate
}

@ZodSchema(passwdSchema)
export class PasswdDto {
  password!: Password
}
