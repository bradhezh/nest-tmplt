import z from 'zod'

import {message} from '@/const'
import {
  profSchemaName, ProfName, profSchemaKey, ProfKey, profSchemaKeys, ProfKeys,
  profSchemaIncs, ProfIncs, profSchemaPage, ProfPage,
  profSchemaFilter, ProfFilter,
  profSchemaData, ProfData, profSchemaUpdate, ProfUpdate,
} from '@shared/schemas'
import {ZodSchema} from '@/common'

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

// with default
@ZodSchema(profSchemaPage)
export class ProfDtoPage {
  page!: ProfPage
}

@ZodSchema(profSchemaFilter)
export class ProfDtoFilter {
  profiles?: ProfFilter
}

// as the non-relation filter for oneself
@ZodSchema(z.object({
  profiles: profSchemaFilter.shape.profiles
    .refine(d => d !== null, {message: message.nonNull}),
}))
export class ProfDtoFilterNonNull {
  profiles?: NonNullable<ProfFilter>
}

@ZodSchema(profSchemaData)
export class ProfDtoData {
  profile!: ProfData
}

// as an optional relation data in user creation
@ZodSchema(profSchemaData.partial())
export class ProfDtoDataOpt {
  profile?: ProfData
}

@ZodSchema(profSchemaUpdate)
export class ProfDtoUpdate {
  profile?: ProfUpdate
}

// as an optional relation data in user updating and null means removal
@ZodSchema(z.object({profile: profSchemaUpdate.shape.profile.nullable()}))
export class ProfDtoUpdateNullable {
  profile?: ProfUpdate | null
}
