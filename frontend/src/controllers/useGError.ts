import {create} from 'zustand'

interface GError {
  error: string | null
  setError: (msg: string | null) => void
}

export const useGError = create<GError>(set => ({
  error: null,
  setError: (msg) => set({error: msg}),
}))

export default useGError
