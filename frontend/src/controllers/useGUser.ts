import {create} from 'zustand'
import {persist} from 'zustand/middleware'

import conf from '@/conf'
import {Credential, UserResToken} from '@shared/schemas'
import loginSvc from '@/services/login'

interface GUser {
  user: UserResToken | null
  login: (credential: Credential) => Promise<void>
  logout: () => void
  isAdmin: () => boolean
}

export const useGUser = create<GUser>()(persist((set, get) => ({
  user: null,

  login: async (credential: Credential) => {
    const loggedin = await loginSvc.login(credential)
    set({user: loggedin})
  },

  logout: () => {
    set({user: null})
  },

  isAdmin: () => {
    return !!get().user?.roles?.map(e => e.name).includes(conf.role.admin)
  },
}), {name: 'user'}))

export default useGUser
