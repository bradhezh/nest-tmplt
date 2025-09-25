import {Injectable} from '@nestjs/common'
import {AbilityBuilder, createMongoAbility} from '@casl/ability'

import conf from '@/conf'
import {UserRes} from '@shared/schemas'

@Injectable()
export class AbilityFactoryCasl {
  createForUser(user: UserRes) {
    const {can, build} = new AbilityBuilder(createMongoAbility)
    const roles = user.roles!.map(e => e.name)
    if (roles.includes(conf.role.admin)) {
      can(conf.perm.action.manage, conf.perm.subject.all)
      return build()
    }
    if (roles.includes(conf.role.user)) {
      can(conf.perm.action.read, conf.perm.subject.user)
      can(conf.perm.action.read, conf.perm.subject.profile)
      can(conf.perm.action.read, conf.perm.subject.item)
      can(conf.perm.action.create, conf.perm.subject.item)
      can(conf.perm.action.update,
        conf.perm.subject.item, {username: user.username})
      can(conf.perm.action.delete,
        conf.perm.subject.item, {username: user.username})
      return build()
    }
    if (roles.includes(conf.role.guest)) {
      return build()
    }
    return build()
  }
}
