import {z, ZodRawShape, ZodTypeAny} from 'zod'

import {MESSAGE} from '@shared/const'
import conf from '@shared/conf'

export enum Order {
  Asc = 'asc',
  Desc = 'desc',
}

export const operators = [{
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

/** Zod schema for "id". */
export const idSchema = z.object({id: z.coerce.number().int()})
/** Type of "id". */
export type Id = z.infer<typeof idSchema>['id']

// Zod schema for "includes"
export const incsSchema = (includes: string[]) => {
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
    page: z.coerce.number().int().min(1).default(1),
    pageSize:
      z.coerce.number().int().min(1).max(conf.PAGE_MAX).default(conf.PAGE_DEF),
    order: z.nativeEnum(Order).default(Order.Asc),
    orderBy: z.enum(fields).optional(),
  })
}
/** Type of "page", including pagination, order, and "includes". */
export type Page =
  z.infer<ReturnType<typeof pageSchema>> & {includes?: Includes}

const conditionSchema = (schema: ZodTypeAny) => {
  return z.union([
    schema.refine(d => d !== undefined, {message: MESSAGE.NON_UNDEFINED}),
    z.object(Object.fromEntries(operators.map(e => [
      e.name,
      e.name !== 'in'
        ? schema.refine(d => d != null, {message: MESSAGE.NON_NULLISH})
        : schema.refine(d => d != null, {message: MESSAGE.NON_NULLISH})
          .array().nonempty(),
    ]))).partial().refine(d => {
      if (!Object.keys(d).length) {
        return false
      }
      for (const op of operators) {
        if ('type' in op && op.name in d && typeof d[op.name] !== op.type) {
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
    }, {message: MESSAGE.INV_CONDITION}),
  ])
}

const filterSchemaWithoutOr = (fields: string[], shape: ZodRawShape) => {
  return z.object(
    Object.fromEntries(fields.map(e => [e, conditionSchema(shape[e])])))
    .partial()
    .refine(d => Object.keys(d).length, {message: MESSAGE.INV_FILTER})
}

// Zod schema for "filter"
export const filterSchema = (
  where: string, fields: string[], shape: ZodRawShape,
) => {
  const schema = filterSchemaWithoutOr(fields, shape)
  return z.object({
    [where]:
      z.union([schema, z.object({OR: schema.array().nonempty()})]).nullish(),
  })
}
/** Type of "filter". */
export type Filter = z.infer<ReturnType<typeof filterSchema>>[string]
type Defined<T> = T extends undefined ? never : T
type FilterWithOp<F> = {
  [K in keyof Partial<F>]: Defined<F[K]> | Partial<{
    [O in typeof operators[number]['name']]: O extends 'in'
    ? [NonNullable<F[K]>, ...NonNullable<F[K]>[]] : NonNullable<F[K]>
  }>
}
export type FilterWithOpOr<F> = FilterWithOp<F>
  | {OR: [FilterWithOp<F>, ...FilterWithOp<F>[]]} | null | undefined

// Zod schema for the "list" response
export const listSchema = (schema: ZodTypeAny) => {
  return z.tuple([schema.array(), z.number().int().nonnegative()])
}
/** Type of the "list" response. */
export type ListRes = z.infer<ReturnType<typeof listSchema>>
