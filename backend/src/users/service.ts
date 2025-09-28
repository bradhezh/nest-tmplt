import {Injectable} from '@nestjs/common'
import bcrypt from 'bcrypt'

import conf from '@/conf'
import {Prisma} from '@PrismaClient/.'
import {
  UserIncs, UserPage, UserFilter, UserData, UserRes, UserListRes,
  ProfFilter, RoleFilter, ItemFilter, RoleKeys, ProfData,
} from '@shared/schemas'
import {PrismaSvc} from '@/common'

@Injectable()
export class UsersSvc {
  constructor(private prismaSvc: PrismaSvc) {}

  async find(
    filter?: NonNullable<UserFilter>,
    profFltr?: ProfFilter, roleFltr?: RoleFilter, itemFltr?: ItemFilter,
    includes?: UserIncs, page?: UserPage,
  ): Promise<UserRes[] | UserListRes> {
    const where = {
      ...(filter ?? {}),
      ...(profFltr === undefined ? {} : {profile: {is: profFltr}}),
      ...(roleFltr === undefined ? {}
        : roleFltr === null ? {roles: {none: {}}} : {roles: {some: roleFltr}}),
      ...(itemFltr === undefined ? {}
        : itemFltr === null ? {items: {none: {}}} : {items: {some: itemFltr}}),
    }
    if (!page) {
      return this.prismaSvc.prisma.user.findMany(
        {where, ...this.prismaSvc.parseIncs(includes)})
    }
    return Promise.all([
      this.prismaSvc.prisma.user.findMany({
        where,
        ...this.prismaSvc.parseIncs(includes),
        ...this.prismaSvc.parsePage(page),
      }),
      this.prismaSvc.prisma.user.count({where}),
    ])
  }

  async findOne(
    where: Prisma.UserWhereUniqueInput, includes?: UserIncs,
  ): Promise<UserRes> {
    return this.prismaSvc.prisma.user.findUniqueOrThrow(
      {where, ...this.prismaSvc.parseIncs(includes)})
  }

  async findOneSafe(
    where: Prisma.UserWhereUniqueInput, includes?: UserIncs,
  ): Promise<UserRes | null> {
    return this.prismaSvc.prisma.user.findUnique(
      {where, ...this.prismaSvc.parseIncs(includes)})
  }

  async findOnePasswd(
    where: Prisma.UserWhereUniqueInput, includes?: UserIncs,
  ): Promise<UserRes & Pick<UserData, 'password'>> {
    return this.prismaSvc.prisma.user.findUniqueOrThrow({
      where,
      omit: {password: false},
      ...this.prismaSvc.parseIncs(includes),
    })
  }

  async create(
    data: UserData, profile?: ProfData, roles?: RoleKeys, includes?: UserIncs,
  ): Promise<UserRes> {
    const password = await bcrypt.hash(data.password, conf.salt)
    return this.prismaSvc.prisma.user.create({
      data: {
        ...data,
        password,
        ...(!profile ? {} : {profile: {create: profile}}),
        ...(!roles ? {} : {roles: {connect: roles}}),
      },
      ...this.prismaSvc.parseIncs(includes),
    })
  }
}
