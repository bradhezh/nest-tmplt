import {app, prisma, prismaLog} from '@/app'
import {MESSAGE} from '@/const'
import conf from '@/conf'
import log from '@/utils/log'

process.on('SIGINT', async () => {
  await log.debug('SIGINT: end the app')
  await prisma?.$disconnect()
  await prismaLog?.$disconnect()
  process.exit(0)
})

app.listen(conf.PORT, async () => {
  await log.info(MESSAGE.APP_STARTED, conf.PORT)
})
