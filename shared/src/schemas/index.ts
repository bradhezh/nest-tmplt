export * from './base'
export * from './User'
export * from './Profile'
export * from './Role'
export * from './Item'

import {userOmit} from './User'
import {profOmit} from './Profile'
import {roleOmit} from './Role'
import {itemOmit} from './Item'

export const omit = {
  ...(!Object.keys(userOmit).length
    ? {} : {user: userOmit}),
  ...(!Object.keys(profOmit).length
    ? {} : {profile: profOmit}),
  ...(!Object.keys(roleOmit).length
    ? {} : {role: roleOmit}),
  ...(!Object.keys(itemOmit).length
    ? {} : {item: itemOmit}),
} as const
