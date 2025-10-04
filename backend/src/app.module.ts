import {Module} from '@nestjs/common'

import {CommonModule} from '@/common/module'
import {UsersModule} from '@/users/module'
import {AuthModule} from '@/auth/module'
import {ItemsModule} from '@/items/module'

@Module({imports: [CommonModule, UsersModule, AuthModule, ItemsModule]})
export class AppModule {}
