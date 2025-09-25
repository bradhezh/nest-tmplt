import {z} from 'zod'

import {MESSAGE} from '@/const'
import {Prisma} from '@PrismaClient/.'
import {
  ItemIncs, ItemPage, ItemFilter, ItemData, ItemDataOpt, ItemRes, ItemListRes,
  UserFilter, UserKey,
} from '@shared/schemas'
import {parseIncs, parsePage} from '@/services/base'
import {prisma} from '@/app'

export const search = async (
  filter?: NonNullable<ItemFilter>, userFltr?: NonNullable<UserFilter>,
): Promise<ItemRes[]> => {
  const items = await prisma.item.findMany({
    where: {
      ...(filter ?? {}),
      ...(userFltr === undefined ? {} : {user: {is: userFltr}}),
    },
  })
  return items.map(e => ({...e, price: Number(e.price)}))
}

export const pageSearch = async (
  page: ItemPage,
  filter?: NonNullable<ItemFilter>, userFltr?: NonNullable<UserFilter>,
): Promise<ItemListRes> => {
  const where = {
    ...(filter ?? {}),
    ...(userFltr === undefined ? {} : {user: {is: userFltr}}),
  }
  const list = await Promise.all([
    prisma.item.findMany({where, ...parsePage(page)}),
    prisma.item.count({where}),
  ])
  return [list[0].map(e => ({...e, price: Number(e.price)})), list[1]]
}

export const getUnique = async (
  where: Prisma.ItemWhereUniqueInput, includes?: ItemIncs,
): Promise<ItemRes> => {
  const item =
    await prisma.item.findUniqueOrThrow({where, ...parseIncs(includes)})
  return {...item, price: Number(item.price)}
}

export const getUniqueSafe = async (
  where: Prisma.ItemWhereUniqueInput, includes?: ItemIncs,
): Promise<ItemRes | null> => {
  const item = await prisma.item.findUnique({where, ...parseIncs(includes)})
  return item && {...item, price: Number(item.price)}
}

export const create = async (
  data: ItemData, user: NonNullable<UserKey>, includes?: ItemIncs,
): Promise<ItemRes> => {
  const item = await prisma.item.create({
    data: {...data, user: {connect: user}},
    ...parseIncs(includes),
  })
  return {...item, price: Number(item.price)}
}

export const update = async (
  where: Prisma.ItemWhereUniqueInput, data?: NonNullable<ItemDataOpt>,
  user?: NonNullable<UserKey>, includes?: ItemIncs,
): Promise<ItemRes> => {
  if (!data && user === undefined) {
    throw new z.ZodError([{
      code: z.ZodIssueCode.custom,
      message: MESSAGE.INV_UPDATE,
      path: ['item', 'user'],
    }])
  }
  const item = await prisma.item.update({
    where,
    data: {
      ...(!data ? {} : data),
      ...(user === undefined ? {}
        : user === null ? {user: {disconnect: true}} as never
          : {user: {connect: user}}),
      updatedAt: new Date(),
    },
    ...parseIncs(includes),
  })
  return {...item, price: Number(item.price)}
}

export const updateBulk = async (
  filter?: NonNullable<ItemFilter>, userFltr?: NonNullable<UserFilter>,
  data?: NonNullable<ItemDataOpt>, user?: NonNullable<UserKey>,
): Promise<Prisma.BatchPayload> => {
  if (!data && user === undefined) {
    throw new z.ZodError([{
      code: z.ZodIssueCode.custom,
      message: MESSAGE.INV_UPDATE,
      path: ['item', 'user'],
    }])
  }
  return prisma.item.updateMany({
    where: {
      ...(filter ?? {}),
      ...(userFltr === undefined ? {} : {user: {is: userFltr}}),
    },
    data: {
      ...(!data ? {} : data),
      ...(user === undefined ? {}
        : user === null ? {user: {disconnect: true}} as never
          : {user: {connect: user}}),
      updatedAt: new Date(),
    },
  })
}

export const remove = async (
  where: Prisma.ItemWhereUniqueInput,
): Promise<ItemRes> => {
  const item = await prisma.item.delete({where})
  return {...item, price: Number(item.price)}
}

export const rmBulk = async (
  filter?: NonNullable<ItemFilter>, userFltr?: NonNullable<UserFilter>,
): Promise<Prisma.BatchPayload> => {
  return prisma.item.deleteMany({
    where: {
      ...(filter ?? {}),
      ...(userFltr === undefined ? {} : {user: {is: userFltr}}),
    },
  })
}

export default {
  search, pageSearch, getUnique, getUniqueSafe,
  create, update, updateBulk, remove, rmBulk,
}
