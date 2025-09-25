import {format} from 'util'

import {ENV} from '@/const'
import conf from '@/conf'
import {LogType} from '@PrismaClient/log'
import {prismaLog as prisma} from '@/app'

/** @param params - Format sequences like `%s`, `%d` can be used in params. */
export const info = async (...params: unknown[]) => {
  if (conf.NODE_ENV !== ENV.TEST) {
    console.log(new Date(), ':', format(...params))
  }
  await prisma?.log.create({
    data: {
      type: LogType.INFO,
      message: format(...params),
    },
  })
}

/** Only print for "debug" or development.
  @param params - Format sequences like `%s`, `%d` can be used in params. */
export const debug = async (...params: unknown[]) => {
  if (conf.NODE_ENV === ENV.DBG || conf.NODE_ENV === ENV.DEV) {
    console.log(new Date(), ':', format(...params))
  }
  await prisma?.log.create({
    data: {
      type: LogType.DEBUG,
      message: format(...params),
    },
  })
}

/** @param params - Format sequences like `%s`, `%d` can be used in params. */
export const error = async (...params: unknown[]) => {
  console.error(new Date(), ':', 'error:', format(...params))
  await prisma?.log.create({
    data: {
      type: LogType.ERROR,
      message: format(...params),
    },
  })
}

/** Logs will be written into the database (only) for "debug". */
export default {info, debug, error}
