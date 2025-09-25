import {
  credentialSchema, Credential, profSchemaData, ProfData,
} from "@shared/schemas"
import {ZodSchema} from '@/common'

@ZodSchema(credentialSchema)
export class CredentialDto {
  credential!: Credential
}

@ZodSchema(profSchemaData.partial())
export class ProfDtoData {
  profile?: ProfData
}
