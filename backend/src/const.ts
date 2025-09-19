import {MESSAGE as MESSAGE_COMMON} from '@shared/const'
export * from '@shared/const'

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQ: 400,
  UNAUTHED: 401,
  NOT_FOUND: 404,
  INTERNAL_SVR_ERR: 500,
} as const

export type HttpStatus = typeof HTTP_STATUS[keyof typeof HTTP_STATUS]

export const ERROR = {
  MIDDLEWARE: 'MiddlewareErr',
} as const

export const MESSAGE = {
  ...MESSAGE_COMMON,

  NO_ROLES_INC: 'No roles included in the user for authorisation.',
  UNKNOWN: 'Unknown error.',
  UNKNOWN_EP: 'Unknown endpoint.',
  NO_TOKEN: 'No token with the request.',
  INV_TOKEN: 'Token invalid.',
  NO_ABILITY: 'No ability or user for permission check.',
  INV_PERM: 'Invalid permission for the operation.',
  INV_UPDATE: 'Update without any data specified.',
  INV_NULL: 'Invalid null.',
  INV_UNDEFINED: 'Invalid undefined.',
  REQUIRED: 'Invalid null or undefined.',
  INV_CREDENTIAL: 'Username or password incorrect.',
  APP_STARTED: 'Server running on port %d.',
} as const
