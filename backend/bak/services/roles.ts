import {z} from 'zod'

import {MESSAGE} from '@/const'
import {Prisma} from '@PrismaClient/.'
import {
  RoleIncs, RolePage, RoleFilter, RoleData, RoleDataOpt, RoleRes,
  UserFilter, UserKeys,
} from '@shared/schemas'
import {parseIncs, parsePage} from '@/services/base'
import {prisma} from '@/app'

type RoleResPrisma = Omit<RoleRes, 'name'> & {name: string}
type RoleListResPrisma = [RoleResPrisma[], number]

export const search = async (
  filter?: NonNullable<RoleFilter>, userFltr?: UserFilter,
): Promise<RoleResPrisma[]> => {
  return prisma.role.findMany({
    where: {
      ...(filter ?? {}),
      ...(userFltr === undefined ? {}
        : userFltr === null ? {users: {none: {}}} : {users: {some: userFltr}}),
    },
  })
}

export const pageSearch = async (
  page: RolePage, filter?: NonNullable<RoleFilter>, userFltr?: UserFilter,
): Promise<RoleListResPrisma> => {
  const where = {
    ...(filter ?? {}),
    ...(userFltr === undefined ? {}
      : userFltr === null ? {users: {none: {}}} : {users: {some: userFltr}}),
  }
  return Promise.all([
    prisma.role.findMany({where, ...parsePage(page)}),
    prisma.role.count({where}),
  ])
}

export const getUnique = async (
  where: Prisma.RoleWhereUniqueInput, includes?: RoleIncs,
): Promise<RoleResPrisma> => {
  return prisma.role.findUniqueOrThrow({where, ...parseIncs(includes)})
}

export const getUniqueSafe = async (
  where: Prisma.RoleWhereUniqueInput, includes?: RoleIncs,
): Promise<RoleResPrisma | null> => {
  return prisma.role.findUnique({where, ...parseIncs(includes)})
}

export const create = async (
  data: RoleData, users?: UserKeys, includes?: RoleIncs,
): Promise<RoleResPrisma> => {
  return prisma.role.create({
    data: {
      ...data,
      ...(!users ? {} : {users: {connect: users}}),
    },
    ...parseIncs(includes),
  })
}

export const update = async (
  where: Prisma.RoleWhereUniqueInput,
  data?: NonNullable<RoleDataOpt>, users?: UserKeys, includes?: RoleIncs,
): Promise<RoleResPrisma> => {
  if (!data && users === undefined) {
    throw new z.ZodError([{
      code: z.ZodIssueCode.custom,
      message: MESSAGE.INV_UPDATE,
      path: ['role', 'users'],
    }])
  }
  return prisma.role.update({
    where,
    data: {
      ...(!data ? {} : {...data, updatedAt: new Date()}),
      ...(users === undefined ? {}
        : users === null ? {users: {set: []}} : {users: {set: users}}),
    },
    ...parseIncs(includes),
  })
}

export const updateBulk = async (
  filter?: NonNullable<RoleFilter>, userFltr?: UserFilter,
  data?: NonNullable<RoleDataOpt>, users?: UserKeys,
): Promise<Prisma.BatchPayload> => {
  if (!data && users === undefined) {
    throw new z.ZodError([{
      code: z.ZodIssueCode.custom,
      message: MESSAGE.INV_UPDATE,
      path: ['role', 'users'],
    }])
  }
  return prisma.role.updateMany({
    where: {
      ...(filter ?? {}),
      ...(userFltr === undefined ? {}
        : userFltr === null ? {users: {none: {}}} : {users: {some: userFltr}}),
    },
    data: {
      ...(!data ? {} : {...data, updatedAt: new Date()}),
      ...(users === undefined ? {}
        : users === null ? {users: {set: []}} : {users: {set: users}}),
    },
  })
}

export const addUsers = async (
  where: Prisma.RoleWhereUniqueInput, users: NonNullable<UserKeys>,
  includes?: RoleIncs,
): Promise<RoleResPrisma> => {
  return prisma.role.update({
    where,
    data: {users: {connect: users}},
    ...parseIncs(includes),
  })
}

export const rmUsers = async (
  where: Prisma.RoleWhereUniqueInput, users: NonNullable<UserKeys>,
  includes?: RoleIncs,
): Promise<RoleResPrisma> => {
  return prisma.role.update({
    where,
    data: {users: {disconnect: users}},
    ...parseIncs(includes),
  })
}

export const remove = async (
  where: Prisma.RoleWhereUniqueInput,
): Promise<RoleResPrisma> => {
  return prisma.role.delete({where})
}

export const rmBulk = async (
  filter?: NonNullable<RoleFilter>, userFltr?: UserFilter,
): Promise<Prisma.BatchPayload> => {
  return prisma.role.deleteMany({
    where: {
      ...(filter ?? {}),
      ...(userFltr === undefined ? {}
        : userFltr === null ? {users: {none: {}}} : {users: {some: userFltr}}),
    },
  })
}

export default {
  search, pageSearch, getUnique, getUniqueSafe,
  create, update, updateBulk, addUsers, rmUsers, remove, rmBulk,
}
