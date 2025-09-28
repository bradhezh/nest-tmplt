import {credentialSchema, Credential} from '@shared/schemas'
import {ZodSchema} from '@/common'

@ZodSchema(credentialSchema)
export class CredentialDto {
  credential!: Credential
}
