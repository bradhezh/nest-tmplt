export const ENV = {
  PROD: 'production',
  DBG: 'debug',
  DEV: 'development',
  TEST: 'test',
} as const

export const MESSAGE = {
  INV_NAME: 'Name as a key must start with a letter and contain only letters, numbers, or underscores.',
  INV_PASSWD_LETTER_REQUIRED: 'Password must include letters.',
  INV_PASSWD_DIGIT_REQUIRED: 'Password must include digits.',
  NON_UNDEFINED: 'Data cannot be undefined.',
  NON_NULLISH: 'Data cannot be null or undefined.',
  INV_CONDITION: 'Condition invalid.',
  INV_FILTER: 'No condition included.',
  INV_DATAOPT: 'No data included.',
} as const
