import {withAccelerate} from '@prisma/extension-accelerate'
import bcrypt from 'bcrypt'

import conf from '@/conf'
import {PrismaClient} from '@PrismaClient/.'

const prisma = new PrismaClient().$extends(withAccelerate())

void (async () => {
  try {
    for (const role of conf.roles) {
      await prisma.role.upsert({
        where: {name: role},
        update: {},
        create: {name: role},
      })
    }

    const password = await bcrypt.hash(conf.defPasswd, conf.salt)
    await prisma.user.upsert({
      where: {username: conf.iniAdmin},
      update: {},
      create: {
        username: conf.iniAdmin,
        password,
        email: 'admin@domain',
        roles: {connect: {name: conf.role.admin}},
      },
    })
  } catch (err) {
    console.log(err)

  } finally {
    await prisma.$disconnect()
  }
})()
