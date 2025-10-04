import {useState, useCallback} from 'react'

import {
  Id, ItemIncs, ItemPage, ItemFilter, ItemData, ItemUpdate, ItemRes, UserFilter,
} from '@shared/schemas'
import itemsSvc from '@/services/items'
import useGUser from './useGUser'

export const useItems = () => {
  const {user} = useGUser()
  const [items, setItems] = useState<ItemRes[]>([])

  const findItems = useCallback(async (
    filter?: NonNullable<ItemFilter>, userFltr?: NonNullable<UserFilter>,
    includes?: ItemIncs, page?: ItemPage,
  ) => {
    const found =
      await itemsSvc.find(filter, userFltr, includes, page, user!.token)
    setItems(found[0])
  }, [user])

  const createItem = useCallback(async (
    data: ItemData, includes?: ItemIncs,
  ) => {
    const item = await itemsSvc.create(data, includes, user!.token)
    // `useCallback(...)` makes this func only be created at the initial render
    // (only re-created for dependency changes) of the component using this
    // hook, meaning `items` here is also in the lexical env for the initial
    // render (component func calling), with the initial value (empty), which
    // won't be updated by subsequent render since each calling creates a
    // different lexical env, so the functional state update should be used
    // instead of `setItems([...items, item])`
    setItems(prevItems => [item, ...prevItems])
  }, [user])

  const updateItem = useCallback(async (
    id: Id, data?: ItemUpdate, includes?: ItemIncs,
  ) => {
    const item = await itemsSvc.update(id, data, includes, user!.token)
    setItems(prevItems => prevItems.map(e => e.id !== item.id ? e : item))
  }, [user])

  const rmItem = useCallback(async (id: Id) => {
    await itemsSvc.remove(id, user!.token)
    setItems(prevItems => prevItems.filter(e => e.id !== id))
  }, [user])

  return {items, findItems, createItem, updateItem, rmItem}
}

export default useItems
