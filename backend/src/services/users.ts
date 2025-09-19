import {z} from 'zod'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

import {MESSAGE} from '@/const'
import conf from '@/conf'
import {Prisma} from '@PrismaClient/.'
import {
  UserIncs, UserPage, UserFilter, UserData, UserDataOpt, UserRes, UserListRes,
  ProfFilter, RoleFilter, ItemFilter, RoleKeys, ProfData, ProfDataOpt, profOmit,
  Password, Credential, UserResToken,
} from '@shared/schemas'
import {parseIncs, parsePage} from '@/services/base'
import {prisma} from '@/app'

export const search = async (
  filter?: NonNullable<UserFilter>,
  profFltr?: ProfFilter, roleFltr?: RoleFilter, itemFltr?: ItemFilter,
): Promise<UserRes[]> => {
  return prisma.user.findMany({
    where: {
      ...(filter ?? {}),
      ...(profFltr === undefined ? {} : {profile: {is: profFltr}}),
      ...(roleFltr === undefined ? {}
        : roleFltr === null ? {roles: {none: {}}} : {roles: {some: roleFltr}}),
      ...(itemFltr === undefined ? {}
        : itemFltr === null ? {items: {none: {}}} : {items: {some: itemFltr}}),
    },
  })
}

export const pageSearch = async (
  page: UserPage, filter?: NonNullable<UserFilter>,
  profFltr?: ProfFilter, roleFltr?: RoleFilter, itemFltr?: ItemFilter,
): Promise<UserListRes> => {
  const where = {
    ...(filter ?? {}),
    ...(profFltr === undefined ? {} : {profile: {is: profFltr}}),
    ...(roleFltr === undefined ? {}
      : roleFltr === null ? {roles: {none: {}}} : {roles: {some: roleFltr}}),
    ...(itemFltr === undefined ? {}
      : itemFltr === null ? {items: {none: {}}} : {items: {some: itemFltr}}),
  }
  return Promise.all([
    prisma.user.findMany({where, ...parsePage(page)}),
    prisma.user.count({where}),
  ])
}

export const getUnique = async (
  where: Prisma.UserWhereUniqueInput, includes?: UserIncs,
): Promise<UserRes> => {
  return prisma.user.findUniqueOrThrow({where, ...parseIncs(includes)})
}

export const getUniqueSafe = async (
  where: Prisma.UserWhereUniqueInput, includes?: UserIncs,
): Promise<UserRes | null> => {
  return await prisma.user.findUnique({where, ...parseIncs(includes)})
}

export const create = async (
  data: UserData, profile?: ProfData, roles?: RoleKeys, includes?: UserIncs,
): Promise<UserRes> => {
  const password = await bcrypt.hash(data.password, conf.SALT)
  return prisma.user.create({
    data: {
      ...data,
      password,
      ...(!profile ? {} : {profile: {create: profile}}),
      ...(!roles ? {} : {roles: {connect: roles}}),
    },
    ...parseIncs(includes),
  })
}

export const update = async (
  where: Prisma.UserWhereUniqueInput, data?: NonNullable<UserDataOpt>,
  profile?: ProfData | ProfDataOpt, roles?: RoleKeys, includes?: UserIncs,
): Promise<UserRes> => {
  if (!data && profile === undefined && roles === undefined) {
    throw new z.ZodError([{
      code: z.ZodIssueCode.custom,
      message: MESSAGE.INV_UPDATE,
      path: ['user', 'profile', 'roles'],
    }])
  }
  const profOpt = profile && Object.fromEntries(Object.entries(profile)
    .filter(([key]) => !profOmit[key as keyof typeof profOmit]))
  return prisma.$transaction(async (tx) => {
    const user = await tx.user.update({
      where,
      data: {
        ...(!data ? {} : {...data, updatedAt: new Date()}),
        /* `delete` will throw an error on non-existent one
        ...(profile === undefined ? {}
          : profile === null ? {profile: {delete: true}} : {
        */
        ...(!profile ? {} : {
          profile: {
            upsert: {
              create: profile as ProfData,
              update: {...profOpt, updatedAt: new Date()},
            },
          },
        }),
        ...(roles === undefined ? {}
          : roles === null ? {roles: {set: []}} : {roles: {set: roles}}),
      },
      ...parseIncs(includes),
    }) as UserRes
    if (profile === null) {
      await tx.profile.deleteMany({where: {username: user.username}})
      user.profile = null
    }
    return user
  })
}

export const updateBulk = async (
  filter?: NonNullable<UserFilter>,
  profFltr?: ProfFilter, roleFltr?: RoleFilter, itemFltr?: ItemFilter,
  data?: NonNullable<UserDataOpt>, roles?: RoleKeys,
): Promise<Prisma.BatchPayload> => {
  if (!data && roles === undefined) {
    throw new z.ZodError([{
      code: z.ZodIssueCode.custom,
      message: MESSAGE.INV_UPDATE,
      path: ['user', 'roles'],
    }])
  }
  return prisma.user.updateMany({
    where: {
      ...(filter ?? {}),
      ...(profFltr === undefined ? {} : {profile: {is: profFltr}}),
      ...(roleFltr === undefined ? {}
        : roleFltr === null ? {roles: {none: {}}} : {roles: {some: roleFltr}}),
      ...(itemFltr === undefined ? {}
        : itemFltr === null ? {items: {none: {}}} : {items: {some: itemFltr}}),
    },
    data: {
      ...(!data ? {} : {...data, updatedAt: new Date()}),
      ...(roles === undefined ? {}
        : roles === null ? {roles: {set: []}} : {roles: {set: roles}}),
    },
  })
}

export const setPasswd = async (
  where: Prisma.UserWhereUniqueInput, pass: Password | string,
) => {
  if (typeof pass === 'object') {
    const user = await prisma.user.findUniqueOrThrow({
      where,
      omit: {password: false},
    })
    const verified = await bcrypt.compare(pass.old, user.password)
    if (!verified) {
      return false
    }
  }
  const password =
    await bcrypt.hash(typeof pass === 'string' ? pass : pass.new, conf.SALT)
  await prisma.user.update({
    where,
    data: {
      password,
      updatedAt: new Date(),
    },
  })
  return true
}

export const addRoles = async (
  where: Prisma.UserWhereUniqueInput, roles: NonNullable<RoleKeys>,
  includes?: UserIncs,
): Promise<UserRes> => {
  return prisma.user.update({
    where,
    data: {roles: {connect: roles}},
    ...parseIncs(includes),
  })
}

export const rmRoles = async (
  where: Prisma.UserWhereUniqueInput, roles: NonNullable<RoleKeys>,
  includes?: UserIncs,
): Promise<UserRes> => {
  return prisma.user.update({
    where,
    data: {roles: {disconnect: roles}},
    ...parseIncs(includes),
  })
}

export const remove = async (
  where: Prisma.UserWhereUniqueInput,
): Promise<UserRes> => {
  return prisma.user.delete({where})
}

export const rmBulk = async (
  filter?: NonNullable<UserFilter>,
  profFltr?: ProfFilter, roleFltr?: RoleFilter, itemFltr?: ItemFilter,
): Promise<Prisma.BatchPayload> => {
  return prisma.user.deleteMany({
    where: {
      ...(filter ?? {}),
      ...(profFltr === undefined ? {} : {profile: {is: profFltr}}),
      ...(roleFltr === undefined ? {}
        : roleFltr === null ? {roles: {none: {}}} : {roles: {some: roleFltr}}),
      ...(itemFltr === undefined ? {}
        : itemFltr === null ? {items: {none: {}}} : {items: {some: itemFltr}}),
    },
  })
}

export const login = async (
  credential: Credential, includes?: UserIncs,
): Promise<UserResToken | undefined> => {
  const user = await prisma.user.findUniqueOrThrow({
    where: {username: credential.username},
    omit: {password: false},
    ...parseIncs(includes),
  })
  const verified = await bcrypt.compare(credential.password, user.password)
  if (!verified) {
    return
  }
  // a token signed with a secret and then can be verified against the secret
  const token =
    jwt.sign({id: user.id}, conf.SECRET, {expiresIn: conf.TOKEN_EXPIRE})
  return {...(({password: _p, ...rest}) => rest)(user), token}
}

export default {
  search, pageSearch, getUnique, getUniqueSafe,
  create, update, updateBulk, setPasswd, addRoles, rmRoles, remove, rmBulk,
  login,
}
