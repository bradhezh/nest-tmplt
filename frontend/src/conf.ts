import common from '@shared/conf'

const conf = {
  ...common,

  // injected by vite
  env: import.meta.env,
} as const

export default conf
