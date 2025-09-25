import {
  Module, forwardRef, NestModule, MiddlewareConsumer,
} from '@nestjs/common'
import {APP_GUARD, APP_PIPE, APP_FILTER} from '@nestjs/core'

import {UsersModule} from '@/users'
import {PrismaSvc} from './services'
import {AbilityFactoryCasl} from './factories'
import {ReqLogger, frRoutes} from './middleware'
import {AuthGuard} from './guard'
import {ValidationPipeZod} from './pipe'
import {Filter} from './filter'

@Module({
  imports: [forwardRef(() => UsersModule)],
  providers: [
    PrismaSvc, AbilityFactoryCasl,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    }, {
      provide: APP_PIPE,
      useClass: ValidationPipeZod,
    }, {
      provide: APP_FILTER,
      useClass: Filter,
    },
  ],
  exports: [PrismaSvc],
})
export class CommonModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ReqLogger, frRoutes).forRoutes('*')
  }
}
