import {Module} from '@nestjs/common'

import {CommonModule} from '@/common/module'
import {ItemsSvc} from './service'
import {ItemsCtlr} from './controller'

@Module({
  imports: [CommonModule],
  providers: [ItemsSvc],
  controllers: [ItemsCtlr],
})
export class ItemsModule {}
