import {Module, forwardRef} from '@nestjs/common'

import {CommonModule} from '@/common'
import {UsersSvc} from './service'
import {UsersCtlr} from './controller'

@Module({
  imports: [forwardRef(() => CommonModule)],
  providers: [UsersSvc],
  controllers: [UsersCtlr],
  exports: [UsersSvc],
})
export class UsersModule {}
