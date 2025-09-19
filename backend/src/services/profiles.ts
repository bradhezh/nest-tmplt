import {z} from 'zod'

import {MESSAGE} from '@/const'
import {Prisma} from '@PrismaClient/.'
import {
  ProfIncs, ProfPage, ProfFilter, ProfData, ProfDataOpt, ProfRes, ProfListRes,
  UserFilter, UserKey,
} from '@shared/schemas'
import {parseIncs, parsePage} from '@/services/base'
import {prisma} from '@/app'

export const search = async (
  filter?: NonNullable<ProfFilter>, userFltr?: NonNullable<UserFilter>,
): Promise<ProfRes[]> => {
  return prisma.profile.findMany({
    where: {
      ...(filter ?? {}),
      ...(userFltr === undefined ? {} : {user: {is: userFltr}}),
    },
  })
}

export const pageSearch = async (
  page: ProfPage,
  filter?: NonNullable<ProfFilter>, userFltr?: NonNullable<UserFilter>,
): Promise<ProfListRes> => {
  const where = {
    ...(filter ?? {}),
    ...(userFltr === undefined ? {} : {user: {is: userFltr}}),
  }
  return Promise.all([
    prisma.profile.findMany({where, ...parsePage(page)}),
    prisma.profile.count({where}),
  ])
}

export const getUnique = async (
  where: Prisma.ProfileWhereUniqueInput, includes?: ProfIncs,
): Promise<ProfRes> => {
  return prisma.profile.findUniqueOrThrow({where, ...parseIncs(includes)})
}

export const getUniqueSafe = async (
  where: Prisma.ProfileWhereUniqueInput, includes?: ProfIncs,
): Promise<ProfRes | null> => {
  return prisma.profile.findUnique({where, ...parseIncs(includes)})
}

export const create = async (
  data: ProfData, user: NonNullable<UserKey>, includes?: ProfIncs,
): Promise<ProfRes> => {
  return prisma.profile.create({
    data: {...data, user: {connect: user}},
    ...parseIncs(includes),
  })
}

export const update = async (
  where: Prisma.ProfileWhereUniqueInput, data?: NonNullable<ProfDataOpt>,
  user?: NonNullable<UserKey>, includes?: ProfIncs,
): Promise<ProfRes> => {
  if (!data && user === undefined) {
    throw new z.ZodError([{
      code: z.ZodIssueCode.custom,
      message: MESSAGE.INV_UPDATE,
      path: ['profile', 'user'],
    }])
  }
  return prisma.profile.update({
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
}

export const updateBulk = async (
  filter?: NonNullable<ProfFilter>, userFltr?: NonNullable<UserFilter>,
  data?: NonNullable<ProfDataOpt>, user?: NonNullable<UserKey>,
): Promise<Prisma.BatchPayload> => {
  if (!data && user === undefined) {
    throw new z.ZodError([{
      code: z.ZodIssueCode.custom,
      message: MESSAGE.INV_UPDATE,
      path: ['profile', 'user'],
    }])
  }
  return prisma.profile.updateMany({
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
  where: Prisma.ProfileWhereUniqueInput,
): Promise<ProfRes> => {
  return prisma.profile.delete({where})
}

export const rmBulk = async (
  filter?: NonNullable<ProfFilter>, userFltr?: NonNullable<UserFilter>,
): Promise<Prisma.BatchPayload> => {
  return prisma.profile.deleteMany({
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
