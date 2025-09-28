import {
  Controller, Get, Post, Param, Query, Body,
  HttpCode, HttpStatus, ForbiddenException,
} from '@nestjs/common'
import type {MongoAbility} from '@casl/ability'

import conf from '@/conf'
import {Ability, IdDto} from '@/common'
import {ProfDtoFilter} from '@/profiles'
import {RoleDtoFilter} from '@/roles'
import {ItemDtoFilter} from '@/items'
import {
  UserDtoName, UserDtoIncs, UserDtoPage, UserDtoFilterNonNull,
} from './dtos'
import {UsersSvc} from './service'

@Controller(`${conf.ep.bkRoot}${conf.ep.users}`)
export class UsersCtlr {
  constructor(private usersSvc: UsersSvc) {}

  @HttpCode(HttpStatus.OK)
  @Post(`${conf.ep.action.search}`)
  async find(
    @Ability() ability: MongoAbility,
    @Body() {users}: UserDtoFilterNonNull, @Body() {profiles}: ProfDtoFilter,
    @Body() {roles}: RoleDtoFilter, @Body() {items}: ItemDtoFilter,
    @Body() {includes}: UserDtoIncs, @Body() {page}: UserDtoPage,
  ) {
    if (!ability.can(conf.perm.action.read, conf.perm.subject.user)) {
      throw new ForbiddenException()
    }
    return this.usersSvc.find(users, profiles, roles, items, includes, page)
  }

  @Get(`${conf.ep.param.byId}`)
  async findOne(
    @Ability() ability: MongoAbility,
    @Param() {id}: IdDto, @Query() {includes}: UserDtoIncs,
  ) {
    if (!ability.can(conf.perm.action.read, conf.perm.subject.user)) {
      throw new ForbiddenException()
    }
    return this.usersSvc.findOne({id}, includes)
  }

  @Get(`${conf.ep.param.byName}`)
  async findOneByName(
    @Ability() ability: MongoAbility,
    @Param() {name: username}: UserDtoName, @Query() {includes}: UserDtoIncs,
  ) {
    if (!ability.can(conf.perm.action.read, conf.perm.subject.user)) {
      throw new ForbiddenException()
    }
    return this.usersSvc.findOne({username}, includes)
  }
}
