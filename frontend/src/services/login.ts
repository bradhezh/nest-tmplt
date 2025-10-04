import axios from 'axios'

import conf from '@/conf'
import {Credential, UserResToken, userSchemaResToken} from '@shared/schemas'

const headers = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
}

export const login = async (credential: Credential): Promise<UserResToken> => {
  const res = await axios.post(
    `${conf.ep.bkRoot}/${conf.ep.auth}/${conf.ep.action.login}`, {
      credential,
      includes: ['roles'],
    }, {headers})
  if (!conf.env.PROD) {
    return userSchemaResToken.parse(res.data)
  }
  return res.data
}

export default {login}
