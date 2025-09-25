import {
  userSchemaName, UserName, userSchemaKey, UserKey, userSchemaKeys, UserKeys,
  userSchemaIncs, UserIncs, userSchemaPage, UserPage, userSchemaData, UserData,
  userSchemaFilter, UserFilter, userSchemaUpdate, UserUpdate,
  passwdSchema, Password,
  profSchemaName, ProfName, profSchemaKey, ProfKey, profSchemaKeys, ProfKeys,
  profSchemaIncs, ProfIncs, profSchemaPage, ProfPage, profSchemaData, ProfData,
  profSchemaFilter, ProfFilter, profSchemaUpdate, ProfUpdate,
} from "@shared/schemas"
import {ZodSchema} from '@/common'

@ZodSchema(userSchemaName)
export class UserDtoName {
  name!: UserName
}

@ZodSchema(userSchemaKey)
export class UserDtoKey {
  user?: UserKey
}

@ZodSchema(userSchemaKeys)
export class UserDtoKeys {
  users?: UserKeys
}

@ZodSchema(userSchemaIncs)
export class UserDtoIncs {
  includes?: UserIncs
}

/** with default */
@ZodSchema(userSchemaPage)
export class UserDtoPage {
  page!: UserPage
}

@ZodSchema(userSchemaFilter)
export class UserDtoFilter {
  users?: UserFilter
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

@ZodSchema(profSchemaName)
export class ProfDtoName {
  name!: ProfName
}

@ZodSchema(profSchemaKey)
export class ProfDtoKey {
  profile?: ProfKey
}

@ZodSchema(profSchemaKeys)
export class ProfDtoKeys {
  profiles?: ProfKeys
}

@ZodSchema(profSchemaIncs)
export class ProfDtoIncs {
  includes?: ProfIncs
}

/** with default */
@ZodSchema(profSchemaPage)
export class ProfDtoPage {
  page!: ProfPage
}

@ZodSchema(profSchemaFilter)
export class ProfDtoFilter {
  profiles?: ProfFilter
}

@ZodSchema(profSchemaData)
export class ProfDtoData {
  profile!: ProfData
}

@ZodSchema(profSchemaUpdate)
export class ProfDtoUpdate {
  profile?: ProfUpdate
}
