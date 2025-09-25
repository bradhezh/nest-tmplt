import {Injectable, PipeTransform, ArgumentMetadata} from '@nestjs/common'

import {getZodSchema} from './decorators'

@Injectable()
export class ValidationPipeZod implements PipeTransform {
  transform(value: unknown, {metatype}: ArgumentMetadata) {
    if (!metatype) {
      return value
    }
    const schema = getZodSchema(metatype)
    if (!schema) {
      return value
    }
    return schema.parse(value)
  }
}
