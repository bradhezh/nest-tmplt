import z from 'zod'

import {message} from '@/const'
import {
  roleSchemaName, RoleName, roleSchemaKey, RoleKey, roleSchemaKeys, RoleKeys,
  roleSchemaIncs, RoleIncs, roleSchemaPage, RolePage,
  roleSchemaFilter, RoleFilter,
  roleSchemaData, RoleData, roleSchemaUpdate, RoleUpdate,
} from '@shared/schemas'
import {ZodSchema} from '@/common'

@ZodSchema(roleSchemaName)
export class RoleDtoName {
  name!: RoleName
}

@ZodSchema(roleSchemaKey)
export class RoleDtoKey {
  role?: RoleKey
}

@ZodSchema(roleSchemaKeys)
export class RoleDtoKeys {
  roles?: RoleKeys
}

// for addRoles and rmRoles
@ZodSchema(z.object({
  roles: roleSchemaKeys.shape.roles
    .refine(d => d != null, {message: message.nonNullish}),
}))
export class RoleDtoKeysNonNullish {
  roles!: NonNullable<RoleKeys>
}

@ZodSchema(roleSchemaIncs)
export class RoleDtoIncs {
  includes?: RoleIncs
}

// with default
@ZodSchema(roleSchemaPage)
export class RoleDtoPage {
  page!: RolePage
}

@ZodSchema(roleSchemaFilter)
export class RoleDtoFilter {
  roles?: RoleFilter
}

// as the non-relation filter for oneself
@ZodSchema(z.object({
  roles: roleSchemaFilter.shape.roles
    .refine(d => d !== null, {message: message.nonNull}),
}))
export class RoleDtoFilterNonNull {
  roles?: NonNullable<RoleFilter>
}

@ZodSchema(roleSchemaData)
export class RoleDtoData {
  role!: RoleData
}

@ZodSchema(roleSchemaUpdate)
export class RoleDtoUpdate {
  role?: RoleUpdate
}
