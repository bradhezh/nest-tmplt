import dotenv from 'dotenv'
import path from 'path'

import common from '@shared/conf'

// dotenv sets env vars from .env (in the cwd, only used locally)
dotenv.config()

const conf = {
  ...common,

  /** Should be set in the CLI. */
  env: process.env.NODE_ENV!,

  /** Flexible or sensitive configuration included in .env: should be set in the
    cloud but unnecessary in CICD pipelines. */
  secret: process.env.SECRET || 'alskjfeoicvinef',
  /** Flexible or sensitive configuration included in .env: normally will be
    automatically set by cloud platforms, so unnecessary to be set in both the
    cloud and CICD pipelines. */
  port: Number(process.env.PORT) || 3000,
  /** Flexible or sensitive configuration included in .env: should be set in the
    cloud but unnecessary in CICD pipelines. */
  salt: Number(process.env.SALT) || 5,
  /** Flexible or sensitive configuration included in .env: should be set in the
    cloud but unnecessary in CICD pipelines. */
  iniAdmin: process.env.INI_ADMIN || 'admin',
  /** Flexible or sensitive configuration included in .env: should be set in the
    cloud but unnecessary in CICD pipelines. */
  defPasswd: process.env.DEF_PASSWD || '123abc',
  /** Flexible or sensitive configuration included in .env: should be set in the
    cloud but unnecessary in CICD pipelines. */
  tokenExpire: Number(process.env.TOKEN_EXPIRE) || 604800,

  version: {
    no: 0,
    ep: '/version',
  },

  dist: 'dist',
  index: 'index.html',

  perm: {
    action: {
      manage: 'manage',
      read: 'read',
      create: 'create',
      update: 'update',
      delete: 'delete',
      resetPasswd: 'resetPasswd',
      setRole: 'setRole',
    },
    subject: {
      all: 'all',
      user: 'user',
      profile: 'profile',
      role: 'role',
      item: 'item',
      user_role: 'user_role',
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
  spa: path.join(conf.dist, conf.index),
} as const
