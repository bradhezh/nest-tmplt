import {Module} from '@nestjs/common'

import {CommonModule} from '@/common'
import {UsersModule} from '@/users'
import {AuthModule} from '@/auth'

@Module({
  imports: [CommonModule, UsersModule, AuthModule],
})
export class AppModule {}
