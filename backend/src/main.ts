import {NestFactory} from '@nestjs/core'
import express from 'express'

import conf from '@/conf'
import {AppModule} from '@/app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.enableShutdownHooks()
  app.use(express.static(conf.dist))
  await app.listen(conf.port)
}
void bootstrap()
