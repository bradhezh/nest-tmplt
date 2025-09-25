import {
  itemSchemaName, ItemName, itemSchemaKey, ItemKey, itemSchemaKeys, ItemKeys,
  itemSchemaIncs, ItemIncs, itemSchemaPage, ItemPage, itemSchemaData, ItemData,
  itemSchemaFilter, ItemFilter, itemSchemaUpdate, ItemUpdate,
} from "@shared/schemas"
import {ZodSchema} from '@/common'

@ZodSchema(itemSchemaName)
export class ItemDtoName {
  name!: ItemName
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

/** with default */
@ZodSchema(itemSchemaPage)
export class ItemDtoPage {
  page!: ItemPage
}

@ZodSchema(itemSchemaFilter)
export class ItemDtoFilter {
  items?: ItemFilter
}

@ZodSchema(itemSchemaData)
export class ItemDtoData {
  item!: ItemData
}

@ZodSchema(itemSchemaUpdate)
export class ItemDtoUpdate {
  item?: ItemUpdate
}
