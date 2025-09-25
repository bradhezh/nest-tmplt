export const env = {
  production: 'production',
  debug: 'debug',
  development: 'development',
  test: 'test',
} as const

export const message = {
  nonUndefined: 'Cannot be undefined',
  nonNull: 'Cannot be null',
  nonNullish: 'Cannot be null or undefined',
  nonEmpty: 'Cannot be empty',
  letterRequired: 'Must include letters',
  digitRequired: 'Must include digits',
  invName: 'Must start with a letter and contain only letters, numbers, or underscores',
  invOp: 'Invalid operation',
} as const
