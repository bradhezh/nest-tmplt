import {Module} from '@nestjs/common'
import {JwtModule} from '@nestjs/jwt'

import conf from '@/conf'
import {UsersModule} from '@/users'
import {AuthSvc} from './service'
import {AuthCtlr} from './controller'

@Module({
  imports: [
    UsersModule,
    JwtModule.register({
      global: true,
      secret: conf.secret,
      signOptions: {expiresIn: conf.tokenExpire},
    }),
  ],
  providers: [AuthSvc],
  controllers: [AuthCtlr],
})
export class AuthModule {}
