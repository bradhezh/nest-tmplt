import {Injectable, UnauthorizedException} from '@nestjs/common'
import {JwtService} from '@nestjs/jwt'
import bcrypt from 'bcrypt'

import {Credential, UserIncs, UserResToken} from '@shared/schemas'
import {UsersSvc} from '@/users'

@Injectable()
export class AuthSvc {
  constructor(private jwtSvc: JwtService, private usersSvc: UsersSvc) {}

  async login(
    {username, password}: Credential, includes?: UserIncs,
  ): Promise<UserResToken> {
    try {
      const user = await this.usersSvc.findOnePasswd({username}, includes)
      if (!await bcrypt.compare(password, user.password)) {
        throw new Error()
      }
      const token = await this.jwtSvc.signAsync({id: user.id})
      return {...(({password: _p, ...rest}) => rest)(user), token}

    } catch {
      throw new UnauthorizedException()
    }
  }
}
