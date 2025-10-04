import {message as common} from '@shared/const'
export * from '@shared/const'

export const message = {
  ...common,

  invCredential: 'Invalid username or password',
  createdInPagi: 'Created',
  createdInPagiDesc: 'It may not appear here after refresh if it belongs on another page.',
} as const
