import {createParamDecorator, ExecutionContext} from '@nestjs/common'
import {Reflector} from '@nestjs/core'
import {ZodTypeAny} from 'zod'

const zodSchema = Symbol('zodSchema')

export function ZodSchema(schema: ZodTypeAny): ClassDecorator {
  return (target) => Reflect.defineMetadata(zodSchema, schema, target)
}

export function getZodSchema(target: object): ZodTypeAny | undefined {
  return Reflect.getMetadata(zodSchema, target)
}

export const Public = Reflector.createDecorator<boolean>()

export const User = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) =>
    ctx.switchToHttp().getRequest().user)

export const Ability = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) =>
    ctx.switchToHttp().getRequest().ability)
