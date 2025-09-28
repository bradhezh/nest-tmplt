import {idSchema, Id} from '@shared/schemas'
import {ZodSchema} from './decorators'

@ZodSchema(idSchema)
export class IdDto {
  id!: Id
}
