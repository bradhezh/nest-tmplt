import {
  roleSchemaName, RoleName, roleSchemaKey, RoleKey, roleSchemaKeys, RoleKeys,
  roleSchemaIncs, RoleIncs, roleSchemaPage, RolePage, roleSchemaData, RoleData,
  roleSchemaFilter, RoleFilter, roleSchemaUpdate, RoleUpdate,
} from "@shared/schemas"
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

@ZodSchema(roleSchemaIncs)
export class RoleDtoIncs {
  includes?: RoleIncs
}

/** with default */
@ZodSchema(roleSchemaPage)
export class RoleDtoPage {
  page!: RolePage
}

@ZodSchema(roleSchemaFilter)
export class RoleDtoFilter {
  roles?: RoleFilter
}

@ZodSchema(roleSchemaData)
export class RoleDtoData {
  role!: RoleData
}

@ZodSchema(roleSchemaUpdate)
export class RoleDtoUpdate {
  role?: RoleUpdate
}
