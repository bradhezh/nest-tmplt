import {AbilityBuilder, createMongoAbility} from '@casl/ability'

import {MESSAGE} from '@/const'
import conf from '@/conf'
import {UserRes} from '@shared/schemas'

export const ability = (user: UserRes) => {
  const builder = new AbilityBuilder(createMongoAbility)
  if (!user.roles) {
    throw new Error(MESSAGE.NO_ROLES_INC)
  }
  const roles = user.roles.map(e => e.name)
  if (roles.includes(conf.ROLE.ADMIN)) {
    builder.can(conf.PERM.ACTION.READ, conf.PERM.SUBJECT.USER)
    builder.can(conf.PERM.ACTION.CREATE, conf.PERM.SUBJECT.USER)
    builder.can(conf.PERM.ACTION.RESET_PASSWD, conf.PERM.SUBJECT.USER)
    builder.can(conf.PERM.ACTION.SET_ROLE, conf.PERM.SUBJECT.USER)
    builder.can(conf.PERM.ACTION.DELETE, conf.PERM.SUBJECT.USER)
    builder.can(conf.PERM.ACTION.READ, conf.PERM.SUBJECT.PROFILE)
    builder.can(conf.PERM.ACTION.DELETE, conf.PERM.SUBJECT.PROFILE)
    builder.can(conf.PERM.ACTION.READ, conf.PERM.SUBJECT.ROLE)
    builder.can(conf.PERM.ACTION.DELETE, conf.PERM.SUBJECT.ITEM)
    builder.can(conf.PERM.ACTION.UPDATE, conf.PERM.SUBJECT.USER_ROLE)
    return builder.build()
  }
  if (roles.includes(conf.ROLE.USER)) {
    builder.can(conf.PERM.ACTION.READ, conf.PERM.SUBJECT.USER)
    builder.can(conf.PERM.ACTION.READ, conf.PERM.SUBJECT.PROFILE)
    builder.can(conf.PERM.ACTION.CREATE, conf.PERM.SUBJECT.ITEM)
    builder.can(conf.PERM.ACTION.UPDATE,
      conf.PERM.SUBJECT.ITEM, {username: user.username})
    builder.can(conf.PERM.ACTION.DELETE,
      conf.PERM.SUBJECT.ITEM, {username: user.username})
    return builder.build()
  }
  if (roles.includes(conf.ROLE.GUEST)) {
    return builder.build()
  }
  return builder.build()
}

export default ability
