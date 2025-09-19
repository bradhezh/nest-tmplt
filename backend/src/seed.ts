import {withAccelerate} from '@prisma/extension-accelerate'
import bcrypt from 'bcrypt'

import conf from '@/conf'
import {PrismaClient} from '@PrismaClient/.'

const prisma = new PrismaClient().$extends(withAccelerate())

void (async () => {
  try {
    for (const role of conf.ROLES) {
      await prisma.role.upsert({
        where: {name: role},
        update: {},
        create: {name: role},
      })
    }

    const password = await bcrypt.hash(conf.DEF_PASSWD, conf.SALT)
    await prisma.user.upsert({
      where: {username: conf.INI_ADMIN},
      update: {},
      create: {
        username: conf.INI_ADMIN,
        password,
        email: 'admin@domain',
        roles: {connect: {name: conf.ROLE.ADMIN}},
      },
    })
  } catch (err) {
    console.log(err)

  } finally {
    await prisma.$disconnect()
  }
})()
