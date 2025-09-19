import dotenv from 'dotenv'

import common from '@shared/conf'

// dotenv sets env vars from .env (in the cwd, only used locally)
dotenv.config()

const conf = {
  ...common,

  /** Should be set in the CLI. */
  NODE_ENV: process.env.NODE_ENV!,

  /** Flexible or sensitive configuration included in .env: should be set in the
    cloud but unnecessary in CICD pipelines. */
  SECRET: process.env.SECRET || 'alskjfeoicvinef',
  /** Flexible or sensitive configuration included in .env: normally will be
    automatically set by cloud platforms, so unnecessary to be set in both the
    cloud and CICD pipelines. */
  PORT: Number(process.env.PORT) || 3000,
  /** Flexible or sensitive configuration included in .env: should be set in the
    cloud but unnecessary in CICD pipelines. */
  SALT: Number(process.env.SALT) || 5,
  /** Flexible or sensitive configuration included in .env: should be set in the
    cloud but unnecessary in CICD pipelines. */
  INI_ADMIN: process.env.INI_ADMIN || 'admin',
  /** Flexible or sensitive configuration included in .env: should be set in the
    cloud but unnecessary in CICD pipelines. */
  DEF_PASSWD: process.env.DEF_PASSWD || '888888',
  /** Flexible or sensitive configuration included in .env: should be set in the
    cloud but unnecessary in CICD pipelines. */
  TOKEN_EXPIRE: Number(process.env.TOKEN_EXPIRE) || 604800,

  VER_EP: '/version',
  VERSION: 0,

  DIST_DIR: 'dist',

  PERM: {
    ACTION: {
      READ: 'read',
      CREATE: 'create',
      UPDATE: 'update',
      DELETE: 'delete',
      RESET_PASSWD: 'resetPassword',
      SET_ROLE: 'setRole',
    },
    SUBJECT: {
      USER: 'user',
      PROFILE: 'profile',
      ROLE: 'role',
      ITEM: 'item',
      USER_ROLE: 'user_role',
    },
  },
} as const

/** Flexible or sensitive configurations are typically from corresponding
  environment variables, which are set by dotenv locally, or by cloud platforms
  in deployment. For CICD testing, corresponding environment variables should be
  set by CICD pipelines only if the configurations are flexible or sensitive for
  testing. Otherwise, they can be from default. Configurations only for testing
  don't need to be defined in the cloud for production deployment.
  `DATABASE_URL`, `DB_URL_LOG`, and `DB_URL_LOG_DIRECT` included in .env (but
  not used in app code) should be set in the cloud for production, and in CICD
  pipelines (only) for testing. */
export default {
  ...conf,
  SPA: `${conf.DIST_DIR}/index.html`,
} as const
