import {
  Controller, Get, Post, Patch, Delete, Param, Query, Body,
  HttpCode, HttpStatus, ForbiddenException,
} from '@nestjs/common'
import {MongoAbility, subject} from '@casl/ability'

import conf from '@/conf'
// "type" must be used here to enforce the import being removed in the compiled
// js, because tsup won't (but tsc still will) auto remove it since it's related
// to a param decorator, which might involve metadata for a real class, and then
// tsup will try to import it as a class and fail
import type {UserRes} from '@shared/schemas'
import {Ability, User, IdDto} from '@/common'
import {UserDtoFilterNonNull} from '@/users'
import {
  ItemDtoUsernameName, ItemDtoIncs, ItemDtoPage,
  ItemDtoFilterNonNull, ItemDtoData, ItemDtoUpdate,
} from './dtos'
import {ItemsSvc} from './service'

@Controller(`${conf.ep.bkRoot}/${conf.ep.items}`)
export class ItemsCtlr {
  constructor(private itemsSvc: ItemsSvc) {}

  @HttpCode(HttpStatus.OK)
  @Post(`${conf.ep.action.search}`)
  async find(
    @Ability() ability: MongoAbility,
    @Body() {items}: ItemDtoFilterNonNull,
    @Body() {users}: UserDtoFilterNonNull,
    @Body() {includes}: ItemDtoIncs, @Body() {page}: ItemDtoPage,
  ) {
    if (!ability.can(conf.perm.action.read, conf.perm.subject.item)) {
      throw new ForbiddenException()
    }
    return this.itemsSvc.find(items, users, includes, page)
  }

  @Get(`${conf.ep.param.byId}`)
  async findOne(
    @Ability() ability: MongoAbility,
    @Param() {id}: IdDto, @Query() {includes}: ItemDtoIncs,
  ) {
    if (!ability.can(conf.perm.action.read, conf.perm.subject.item)) {
      throw new ForbiddenException()
    }
    return this.itemsSvc.findOne({id}, includes)
  }

  @Get(`${conf.ep.param.byNameItem}/${conf.ep.param.byUsernameUser}`)
  async findOneByName(
    @Ability() ability: MongoAbility,
    @Param() {username_name}: ItemDtoUsernameName,
    @Query() {includes}: ItemDtoIncs,
  ) {
    if (!ability.can(conf.perm.action.read, conf.perm.subject.item)) {
      throw new ForbiddenException()
    }
    return this.itemsSvc.findOne({username_name}, includes)
  }

  @Get(`${conf.ep.param.byUser}`)
  async findByUser(
    @Ability() ability: MongoAbility,
    @Param() {id}: IdDto,
    @Query() {includes}: ItemDtoIncs, @Query() {page}: ItemDtoPage,
  ) {
    if (!ability.can(conf.perm.action.read, conf.perm.subject.item)) {
      throw new ForbiddenException()
    }
    return this.itemsSvc.find({}, {id}, includes, page)
  }

  @Post()
  async create(
    @Ability() ability: MongoAbility, @User() user: UserRes,
    @Body() {item}: ItemDtoData, @Body() {includes}: ItemDtoIncs,
  ) {
    if (!ability.can(conf.perm.action.create, conf.perm.subject.item)) {
      throw new ForbiddenException()
    }
    return this.itemsSvc.create(item, {id: user.id}, includes)
  }

  @Patch(`${conf.ep.param.byId}`)
  async update(
    @Ability() ability: MongoAbility,
    @Param() {id}: IdDto,
    @Body() {item}: ItemDtoUpdate, @Body() {includes}: ItemDtoIncs,
  ) {
    const found = await this.itemsSvc.findOne({id})
    if (!ability.can(conf.perm.action.update,
      subject(conf.perm.subject.item, {username: found.username}))) {
      throw new ForbiddenException()
    }
    return this.itemsSvc.update({id}, item, undefined, includes)
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(`${conf.ep.param.byId}`)
  async remove(@Ability() ability: MongoAbility, @Param() {id}: IdDto) {
    const found = await this.itemsSvc.findOne({id})
    if (!ability.can(conf.perm.action.delete,
      subject(conf.perm.subject.item, {username: found.username}))) {
      throw new ForbiddenException()
    }
    await this.itemsSvc.remove({id})
  }

  @Delete()
  async rmBulk(
    @Ability() ability: MongoAbility, @User() user: UserRes,
    @Body() {items}: ItemDtoFilterNonNull,
    @Body() {users}: UserDtoFilterNonNull,
  ) {
    if (users
      && !ability.can(conf.perm.action.delete, conf.perm.subject.item)
      || !users
      && !ability.can(conf.perm.action.delete,
        subject(conf.perm.subject.item, {username: user.username}))) {
      throw new ForbiddenException()
    }
    return this.itemsSvc.rmBulk(items, users ?? {username: user.username})
  }
}
