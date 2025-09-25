import {message as common} from '@shared/const'
export * from '@shared/const'

export const message = {
  ...common,
  frRoutes: 'Frontend routes',
} as const
