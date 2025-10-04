import axios from 'axios'

import conf from '@/conf'
import {
  Id, ItemIncs, ItemPage, ItemFilter, ItemData, ItemUpdate,
  ItemRes, ItemListRes, itemSchemaRes, itemSchemaListRes, UserFilter,
} from '@shared/schemas'

const headers = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
}

export const find = async (
  filter?: NonNullable<ItemFilter>, userFltr?: NonNullable<UserFilter>,
  includes?: ItemIncs, page?: ItemPage, token?: string,
): Promise<ItemListRes> => {
  const res = await axios.post(
    `${conf.ep.bkRoot}/${conf.ep.items}/${conf.ep.action.search}`, {
      items: filter,
      users: userFltr,
      includes, page,
    }, {
      headers: {
        ...headers,
        ...(!token ? {} : {Authorization: `Bearer ${token}`}),
      },
    })
  if (!conf.env.PROD) {
    return itemSchemaListRes.parse(res.data)
  }
  return res.data
}

export const create = async (
  data: ItemData, includes?: ItemIncs, token?: string,
): Promise<ItemRes> => {
  const res = await axios.post(`${conf.ep.bkRoot}/${conf.ep.items}`, {
    item: data,
    includes,
  }, {
    headers: {
      ...headers,
      ...(!token ? {} : {Authorization: `Bearer ${token}`}),
    },
  })
  if (!conf.env.PROD) {
    return itemSchemaRes.parse(res.data)
  }
  return res.data
}

export const update = async (
  id: Id, data?: ItemUpdate, includes?: ItemIncs, token?: string,
): Promise<ItemRes> => {
  const res = await axios.patch(`${conf.ep.bkRoot}/${conf.ep.items}/${id}`, {
    item: data,
    includes,
  }, {
    headers: {
      ...headers,
      ...(!token ? {} : {Authorization: `Bearer ${token}`}),
    },
  })
  if (!conf.env.PROD) {
    return itemSchemaRes.parse(res.data)
  }
  return res.data
}

export const remove = async (id: Id, token?: string) => {
  await axios.delete(`${conf.ep.bkRoot}/${conf.ep.items}/${id}`, {
    headers: {
      ...headers,
      ...(!token ? {} : {Authorization: `Bearer ${token}`}),
    },
  })
}

export default {find, create, update, remove}
