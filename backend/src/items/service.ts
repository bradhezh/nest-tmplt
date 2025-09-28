import {Injectable} from '@nestjs/common'

import {Prisma} from '@PrismaClient/.'
import {
  ItemIncs, ItemPage, ItemFilter, ItemData, ItemUpdate, ItemRes, ItemListRes,
  UserFilter, UserKey,
} from '@shared/schemas'
import {PrismaSvc} from '@/common'

@Injectable()
export class ItemsSvc {
  constructor(private prismaSvc: PrismaSvc) {}

  async find(
    filter?: NonNullable<ItemFilter>, userFltr?: NonNullable<UserFilter>,
    includes?: ItemIncs, page?: ItemPage,
  ): Promise<ItemRes[] | ItemListRes> {
    const where = {
      ...(filter ?? {}),
      ...(userFltr === undefined ? {} : {user: {is: userFltr}}),
    }
    if (!page) {
      const items = await this.prismaSvc.prisma.item.findMany(
        {where, ...this.prismaSvc.parseIncs(includes)})
      return items.map(e => ({...e, price: Number(e.price)}))
    }
    const list = await Promise.all([
      this.prismaSvc.prisma.item.findMany({
        where,
        ...this.prismaSvc.parseIncs(includes),
        ...this.prismaSvc.parsePage(page),
      }),
      this.prismaSvc.prisma.item.count({where}),
    ])
    return [list[0].map(e => ({...e, price: Number(e.price)})), list[1]]
  }

  async findOne(
    where: Prisma.ItemWhereUniqueInput, includes?: ItemIncs,
  ): Promise<ItemRes> {
    const item = await this.prismaSvc.prisma.item.findUniqueOrThrow(
      {where, ...this.prismaSvc.parseIncs(includes)})
    return {...item, price: Number(item.price)}
  }

  async findOneSafe(
    where: Prisma.ItemWhereUniqueInput, includes?: ItemIncs,
  ): Promise<ItemRes | null> {
    const item = await this.prismaSvc.prisma.item.findUnique(
      {where, ...this.prismaSvc.parseIncs(includes)})
    return !item ? null : {...item, price: Number(item.price)}
  }

  async create(
    data: ItemData, user: NonNullable<UserKey>, includes?: ItemIncs,
  ): Promise<ItemRes> {
    const item = await this.prismaSvc.prisma.item.create({
      data: {...data, user: {connect: user}},
      ...this.prismaSvc.parseIncs(includes),
    })
    return {...item, price: Number(item.price)}
  }

  async update(
    where: Prisma.ItemWhereUniqueInput, data?: ItemUpdate,
    user?: NonNullable<UserKey>, includes?: ItemIncs,
  ): Promise<ItemRes> {
    const item = await this.prismaSvc.prisma.item.update({
      where,
      data: {
        ...(!data ? {} : data),
        ...(user === undefined ? {}
          : user === null ? {user: {disconnect: true}} as never
            : {user: {connect: user}}),
        updatedAt: new Date(),
      },
      ...this.prismaSvc.parseIncs(includes),
    })
    return {...item, price: Number(item.price)}
  }

  async updateBulk(
    filter?: NonNullable<ItemFilter>, userFltr?: NonNullable<UserFilter>,
    data?: ItemUpdate, user?: NonNullable<UserKey>,
  ): Promise<Prisma.BatchPayload> {
    return this.prismaSvc.prisma.item.updateMany({
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

  async remove(
    where: Prisma.ItemWhereUniqueInput,
  ): Promise<ItemRes> {
    const item = await this.prismaSvc.prisma.item.delete({where})
    return {...item, price: Number(item.price)}
  }

  async rmBulk(
    filter?: NonNullable<ItemFilter>, userFltr?: NonNullable<UserFilter>,
  ): Promise<Prisma.BatchPayload> {
    return this.prismaSvc.prisma.item.deleteMany({
      where: {
        ...(filter ?? {}),
        ...(userFltr === undefined ? {} : {user: {is: userFltr}}),
      },
    })
  }
}
