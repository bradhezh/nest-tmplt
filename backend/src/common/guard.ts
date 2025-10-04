import {
  Injectable, CanActivate, ExecutionContext, UnauthorizedException,
} from '@nestjs/common'
import {Reflector} from '@nestjs/core'
import {JwtService} from '@nestjs/jwt'

import {UsersSvc} from '@/users'
import {Public} from './decorators'
import {AbilityFactoryCasl} from './factories'

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private jwtSvc: JwtService,
    private usersSvc: UsersSvc,
    private abilityFactory: AbilityFactoryCasl,
  ) {}

  async canActivate(ctx: ExecutionContext) {
    try {
      if (this.reflector.get(Public, ctx.getHandler())) {
        return true
      }
      const req = ctx.switchToHttp().getRequest()
      const [type, token] =
        (req.headers.authorization as string | undefined)?.split(' ') ?? []
      if (type !== 'Bearer' || !token) {
        throw new UnauthorizedException()
      }
      const {id} = await this.jwtSvc.verifyAsync(token)
      req.user = await this.usersSvc.findOne({id}, ['roles'])
      req.ability = this.abilityFactory.createForUser(req.user)
      return true

    } catch {
      throw new UnauthorizedException()
    }
  }
}
