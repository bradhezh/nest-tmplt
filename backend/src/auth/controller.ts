import {Controller, Post, Body, HttpCode, HttpStatus} from '@nestjs/common'

import conf from '@/conf'
import {Public} from '@/common'
import {UserDtoIncs, UserDtoData, UsersSvc} from '@/users'
import {ProfDtoDataOpt} from '@/profiles'
import {CredentialDto} from './dtos'
import {AuthSvc} from './service'

@Controller(`${conf.ep.bkRoot}/${conf.ep.auth}`)
export class AuthCtlr {
  constructor(private usersSvc: UsersSvc, private authSvc: AuthSvc) {}

  @Public(true)
  @HttpCode(HttpStatus.OK)
  @Post(`${conf.ep.action.login}`)
  async login(
    @Body() {credential}: CredentialDto, @Body() {includes}: UserDtoIncs,
  ) {
    return this.authSvc.login(credential, includes)
  }

  @Public(true)
  @Post(`${conf.ep.action.signup}`)
  async signup(@Body() {user}: UserDtoData, @Body() {profile}: ProfDtoDataOpt) {
    return this.usersSvc.create(user, profile, [{name: conf.defRole}])
  }
}
