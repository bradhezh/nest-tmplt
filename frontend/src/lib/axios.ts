import axios from 'axios'

import {message} from '@/const'
import {useGUser} from '@/controllers/useGUser'
import {useGError} from '@/controllers/useGError'

export const setupAxiosInterceptor = () => {
  axios.interceptors.response.use(
    res => res,
    err => {
      if (err?.response?.status === 401) {
        useGError.getState().setError(message.invCredential)
        useGUser.getState().logout()
      } else {
        useGError.getState()
          .setError(err?.response?.data?.message || err?.message || String(err))
      }
      return Promise.reject(err instanceof Error ? err : new Error(String(err)))
    }
  )
}
