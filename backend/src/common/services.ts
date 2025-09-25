import {Injectable, OnModuleInit, OnModuleDestroy} from '@nestjs/common'
import {withAccelerate} from '@prisma/extension-accelerate'

import {omit, Includes, Page} from '@shared/schemas'
import {PrismaClient} from '@PrismaClient/.'

@Injectable()
export class PrismaSvc implements OnModuleInit, OnModuleDestroy {
  private client = new PrismaClient({omit}).$extends(withAccelerate())

  get prisma() {
    return this.client
  }

  parseIncs(
    includes?: Includes,
  ): {include?: {[K in NonNullable<Includes>[number]]: true}} {
    return !includes?.length ? {} :
      {include: Object.fromEntries(includes.map(e => [e, true]))}
  }

  parsePage(page: Page) {
    return {
      skip: (page.no - 1) * page.size,
      take: page.size,
      ...(!page.orderBy ? {} : {orderBy: {[page.orderBy]: page.order}}),
    }
  }

  async onModuleInit() {
    return this.client.$connect()
  }

  async onModuleDestroy() {
    return this.client.$disconnect()
  }
}
