import z from 'zod'

import {message} from '@/const'
import {
  itemSchemaName, ItemName, itemSchemaKey, ItemKey, itemSchemaKeys, ItemKeys,
  itemSchemaIncs, ItemIncs, itemSchemaPage, ItemPage,
  itemSchemaFilter, ItemFilter,
  itemSchemaData, ItemData, itemSchemaUpdate, ItemUpdate,
  userSchemaName, UserName,
} from '@shared/schemas'
import {ZodSchema} from '@/common'

@ZodSchema(itemSchemaName)
export class ItemDtoName {
  name!: ItemName
}

export interface ItemUsernameName {
  username: UserName
  name: ItemName
}
@ZodSchema(z.object({
  username_name: z.object({
    username: userSchemaName.shape.name,
    name: itemSchemaName.shape.name,
  }),
}))
export class ItemDtoUsernameName {
  username_name!: ItemUsernameName
}

@ZodSchema(itemSchemaKey)
export class ItemDtoKey {
  item?: ItemKey
}

@ZodSchema(itemSchemaKeys)
export class ItemDtoKeys {
  items?: ItemKeys
}

@ZodSchema(itemSchemaIncs)
export class ItemDtoIncs {
  includes?: ItemIncs
}

// with default
@ZodSchema(itemSchemaPage)
export class ItemDtoPage {
  page!: ItemPage
}

@ZodSchema(itemSchemaFilter)
export class ItemDtoFilter {
  items?: ItemFilter
}

// as the non-relation filter for oneself
@ZodSchema(z.object({
  items: itemSchemaFilter.shape.items
    .refine(d => d !== null, {message: message.nonNull}),
}))
export class ItemDtoFilterNonNull {
  items?: NonNullable<ItemFilter>
}

@ZodSchema(itemSchemaData)
export class ItemDtoData {
  item!: ItemData
}

@ZodSchema(itemSchemaUpdate)
export class ItemDtoUpdate {
  item?: ItemUpdate
}
