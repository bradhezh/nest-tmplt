import {z, ZodRawShape, ZodTypeAny} from 'zod'

import {message} from '@shared/const'
import conf from '@shared/conf'

export enum Order {
  Asc = 'asc',
  Desc = 'desc',
}

type Operators = readonly Readonly<{
  name: string
  type?: string
}>[]

const condOps = [{
  name: 'startsWith',
  type: 'string',
}, {
  name: 'endsWith',
  type: 'string',
}, {
  name: 'contains',
  type: 'string',
}, {
  name: 'in',
}, {
  name: 'gt',
}, {
  name: 'gte',
}, {
  name: 'lt',
}, {
  name: 'lte',
}] as const

const updateOps = [{
  name: 'increment',
  type: 'number',
}, {
  name: 'decrement',
  type: 'number',
}, {
  name: 'multiply',
  type: 'number',
}, {
  name: 'divide',
  type: 'number',
}] as const

/** Zod schema for "id". */
export const idSchema = z.object({id: z.coerce.number().int()})
/** Type of "id". */
export type Id = z.infer<typeof idSchema>['id']

// Zod schema for "includes"
export const incsSchema = (includes: readonly string[]) => {
  if (!includes.length) {
    return z.object({includes: z.never().optional()})
  }
  const include = z.enum(includes as [string, ...string[]])
  return z.object({
    includes: z.union([include, include.array().nonempty()])
      .transform(d => typeof d !== 'string' ? d : [d]).optional(),
  })
}
/** Type of "includes". */
export type Includes = [string, ...string[]] | undefined

// Zod schema for "page", including pagination and order
export const pageSchema = (fields: [string, ...string[]]) => {
  return z.object({
    page: z.object({
      no: z.coerce.number().int().min(1).default(1),
      size: z.coerce.number().int()
        .min(1).max(conf.page.max).default(conf.page.default),
      order: z.nativeEnum(Order).default(Order.Asc),
      orderBy: z.enum(fields).optional(),
    }).default({
      no: 1,
      size: conf.page.default,
      order: Order.Asc,
    }),
  })
}
/** Type of "page", including pagination and order. */
export type Page = z.infer<ReturnType<typeof pageSchema>>['page']

const opSchema = (schema: ZodTypeAny, operators: Operators) => {
  return z.union([
    schema.refine(d => d !== undefined, {message: message.nonUndefined}),
    z.object(Object.fromEntries(operators.map(e => [
      e.name,
      e.name !== 'in'
        ? schema.refine(d => d != null, {message: message.nonNullish})
        : schema.refine(d => d != null, {message: message.nonNullish})
          .array().nonempty(),
    ]))).partial()
      .refine(d => Object.keys(d).length, {message: message.nonEmpty})
      .refine(d => {
        for (const op of operators) {
          if ('type' in op && op.name in d && typeof d[op.name] !== op.type) {
            return false
          }
        }
        let count = 0
        for (const op of updateOps) {
          if (op.name in d && count++ > 0) {
            return false
          }
        }
        if ('gt' in d && 'gte' in d || 'lt' in d && 'lte' in d) {
          return false
        }
        const from = d.gt ?? d.gte
        const to = d.lt ?? d.lte
        if (from != null && to != null && from > to) {
          return false
        }
        return true
      }, {message: message.invOp}),
  ])
}
type Defined<T> = T extends undefined ? never : T
type WithOp<T, O extends Operators> = {
  [K in keyof Partial<T>]: Defined<T[K]> | Partial<{
    [KO in O[number]['name']]: KO extends 'in'
    ? [NonNullable<T[K]>, ...NonNullable<T[K]>[]] : NonNullable<T[K]>
  }>
}

// Zod schema for "filter"
export const filterSchema = (
  where: string, fields: string[], shape: ZodRawShape,
) => {
  const schema = z.object(
    Object.fromEntries(fields.map(e => [e, opSchema(shape[e], condOps)])))
    .partial().refine(d => Object.keys(d).length, {message: message.nonEmpty})
  return z.object({
    [where]:
      z.union([schema, z.object({OR: schema.array().nonempty()})]).nullish(),
  })
}
/** Type of "filter". */
export type Filter = z.infer<ReturnType<typeof filterSchema>>[string]
export type FilterWithOp<T> = WithOp<T, typeof condOps>
  | {OR: [WithOp<T, typeof condOps>, ...WithOp<T, typeof condOps>[]]}
  | null | undefined

export const updateSchema = (
  data: string, fields: string[], shape: ZodRawShape,
) => {
  return z.object({
    [data]: z.object(
      Object.fromEntries(fields.map(e => [e, opSchema(shape[e], updateOps)])))
      .partial().refine(d => Object.keys(d).length, {message: message.nonEmpty})
      .nullish(),
  })
}
/** Type of "update data". */
export type Update = z.infer<ReturnType<typeof updateSchema>>[string]
export type UpdateWithOp<T> = WithOp<T, typeof updateOps> | null | undefined

// Zod schema for the "list" response
export const listSchema = (schema: ZodTypeAny) => {
  return z.tuple([schema.array(), z.number().int().nonnegative()])
}
/** Type of the "list" response. */
export type ListRes = z.infer<ReturnType<typeof listSchema>>
