import supertest from 'supertest'
import TestAgent from 'supertest/lib/agent'

import {HTTP_STATUS, MESSAGE} from '@/const'
import conf from '@/conf'
import log from '@/utils/log'
import usersSvc from '@/services/users'
import profsSvc from '@/services/profiles'
import rolesSvc from '@/services/roles'
import itemsSvc from '@/services/items'
import {app, prisma, prismaLog} from '@/app'

const admin = {
  username: 'admin',
  password: 'a88888',
  email: 'admin@mail.com',
} as const

const guest = {
  username: 'guest',
  password: 'a66666',
  email: 'guest@mail.com',
} as const

const brad = {
  username: 'brad',
  password: 'abcd12',
  email: 'brad@mail.com',
  profile: {
    name: 'Brad Hezh',
  },
} as const

const ethan = {
  username: 'ethan',
  password: '34ef!@',
  email: 'ethan@mail.com',
} as const

const items = [{
  id: -1,
  name: 'item1',
  price: 10.5,
}, {
  id: -1,
  name: 'item2',
  price: 20.5,
}, {
  id: -1,
  name: 'item3',
  price: 30.5,
}, {
  id: -1,
  name: 'item4',
  price: 40.5,
}] as const

let api: TestAgent

describe('app', () => {
  beforeAll(async () => {
    api = supertest(app)
    await usersSvc.rmBulk()
    await profsSvc.rmBulk()
    await rolesSvc.rmBulk()
    await itemsSvc.rmBulk()
    await prismaLog?.log.deleteMany()

    for (const role of conf.ROLES) {
      await rolesSvc.create({name: role})
    }
    await usersSvc.create(admin, undefined, [{name: conf.ROLE.ADMIN}])

    await log.info('Test start...')
  })

  describe('users', () => {
    it('signup', async () => {
      const res = await api.post(`${conf.USERS_EP}${conf.SIGNUP}`).send({
        user: brad,
        profile: brad.profile,
        includes: ['profile', 'roles'],
      }).expect(HTTP_STATUS.CREATED).expect('Content-Type', /application\/json/)

      const {
        id: _i, createdAt: _c, updatedAt: _u,
        profile: {id: _i1, createdAt: _c1, updatedAt: _u1, ...profData},
        roles: _r,
        ...userData
      } = res.body
      expect(userData)
        .toEqual((({password: _p, profile: _f, ...rest}) => rest)(brad))
      expect(profData).toEqual({...brad.profile, username: brad.username})
      expect(res.body.roles.length).toBe(1)
      expect(res.body.roles[0].name).toBe(conf.ROLE_DEF)

      const profile = await profsSvc.getUnique({id: res.body.profile.id})
      expect(res.body.profile).toEqual(JSON.parse(JSON.stringify(profile)))
      const roles = await rolesSvc.search({}, {id: res.body.id})
      expect(res.body.roles).toEqual(JSON.parse(JSON.stringify(roles)))
      const user =
        await usersSvc.getUnique({id: res.body.id}, ['profile', 'roles'])
      expect(res.body).toEqual(JSON.parse(JSON.stringify(user)))
    })

    it('create', async () => {
      let res = await api.post(conf.USERS_EP).send({
        user: guest,
        roles: [{name: conf.ROLE.GUEST}],
      }).expect(HTTP_STATUS.UNAUTHED)
        .expect('Content-Type', /application\/json/)
      expect(res.body).toEqual({message: MESSAGE.NO_TOKEN})

      let loggedin = await api.post(conf.LOGIN_EP).send({
        username: brad.username,
        password: brad.password,
        includes: ['roles'],
      }).expect(HTTP_STATUS.OK).expect('Content-Type', /application\/json/)
      expect(loggedin.body.username).toBe(brad.username)
      expect(loggedin.body.email).toBe(brad.email)
      expect(loggedin.body.roles.length).toBe(1)
      expect(loggedin.body.roles[0].name).toBe(conf.ROLE_DEF)
      res = await api.post(conf.USERS_EP)
        .set("Authorization", `Bearer ${loggedin.body.token}`).send({
          user: guest,
          roles: [{name: conf.ROLE.GUEST}],
        }).expect(HTTP_STATUS.UNAUTHED)
        .expect('Content-Type', /application\/json/)
      expect(res.body).toEqual({message: MESSAGE.INV_PERM})

      loggedin = await api.post(conf.LOGIN_EP).send({
        username: admin.username,
        password: admin.password,
      }).expect(HTTP_STATUS.OK).expect('Content-Type', /application\/json/)
      res = await api.post(conf.USERS_EP)
        .set("Authorization", `Bearer ${loggedin.body.token}`).send({
          user: guest,
          roles: [{name: conf.ROLE.GUEST}],
          includes: ['profile', 'roles'],
        }).expect(HTTP_STATUS.CREATED)
        .expect('Content-Type', /application\/json/)
      const {
        id: _i, createdAt: _c, updatedAt: _u, profile: _p, roles: _r,
        ...userData
      } = res.body
      expect(userData)
        .toEqual((({password: _p, ...rest}) => rest)(guest))
      expect(res.body.roles.length).toBe(1)
      expect(res.body.roles[0].name).toBe(conf.ROLE.GUEST)
      const roles = await rolesSvc.search({}, {id: res.body.id})
      expect(res.body.roles).toEqual(JSON.parse(JSON.stringify(roles)))
      const user =
        await usersSvc.getUnique({id: res.body.id}, ['profile', 'roles'])
      expect(res.body).toEqual(JSON.parse(JSON.stringify(user)))
    })
  })

  describe('items', () => {
    it('create', async () => {
      let loggedin = await api.post(conf.LOGIN_EP).send({
        username: admin.username,
        password: admin.password,
      }).expect(HTTP_STATUS.OK).expect('Content-Type', /application\/json/)
      let res = await api.post(conf.ITEMS_EP)
        .set("Authorization", `Bearer ${loggedin.body.token}`)
        .send({item: items[0]}).expect(HTTP_STATUS.UNAUTHED)
        .expect('Content-Type', /application\/json/)
      expect(res.body).toEqual({message: MESSAGE.INV_PERM})

      await api.post(`${conf.USERS_EP}${conf.SIGNUP}`).send({user: ethan})
        .expect(HTTP_STATUS.CREATED).expect('Content-Type', /application\/json/)
      loggedin = await api.post(conf.LOGIN_EP).send({
        username: ethan.username,
        password: ethan.password,
      }).expect(HTTP_STATUS.OK).expect('Content-Type', /application\/json/)
      res = await api.post(conf.ITEMS_EP)
        .set("Authorization", `Bearer ${loggedin.body.token}`).send({
          item: items[0],
          includes: ['user'],
        }).expect(HTTP_STATUS.CREATED)
        .expect('Content-Type', /application\/json/)
      const {
        createdAt: _c, updatedAt: _u,
        user: {id: _i1, createdAt: _c1, updatedAt: _u1, ...userData},
        ...itemData
      } = res.body;
      (items[0].id as any) = res.body.id
      expect(itemData).toEqual({...items[0], username: ethan.username})
      expect(userData).toEqual((({password: _p, ...rest}) => rest)(ethan))
      const user = await usersSvc.getUnique({id: res.body.user.id})
      expect(res.body.user).toEqual(JSON.parse(JSON.stringify(user)))
      const item = await itemsSvc.getUnique({id: res.body.id}, ['user'])
      expect(res.body).toEqual(JSON.parse(JSON.stringify(item)))

      for (const data of items) {
        if (data.id === items[0].id) {
          continue
        }
        res = await api.post(conf.ITEMS_EP)
          .set("Authorization", `Bearer ${loggedin.body.token}`)
          .send({item: data}).expect(HTTP_STATUS.CREATED)
          .expect('Content-Type', /application\/json/);
        (data.id as any) = res.body.id
      }
      const all = await itemsSvc.search()
      expect(all.length).toBe(items.length)
    })

    it('delete', async () => {
      let loggedin = await api.post(conf.LOGIN_EP).send({
        username: brad.username,
        password: brad.password,
      }).expect(HTTP_STATUS.OK).expect('Content-Type', /application\/json/)
      let res = await api.delete(`${conf.ITEMS_EP}/${items[0].id}`)
        .set("Authorization", `Bearer ${loggedin.body.token}`)
        .expect(HTTP_STATUS.UNAUTHED)
        .expect('Content-Type', /application\/json/)
      expect(res.body).toEqual({message: MESSAGE.INV_PERM})
      res = await api.delete(conf.ITEMS_EP)
        .set("Authorization", `Bearer ${loggedin.body.token}`)
        .send({items: {name: items[0].name}}).expect(HTTP_STATUS.OK)
        .expect('Content-Type', /application\/json/)
      expect(res.body).toBe(0)

      loggedin = await api.post(conf.LOGIN_EP).send({
        username: ethan.username,
        password: ethan.password,
      }).expect(HTTP_STATUS.OK).expect('Content-Type', /application\/json/)
      res = await api.delete(`${conf.ITEMS_EP}/${items[0].id}`)
        .set("Authorization", `Bearer ${loggedin.body.token}`)
        .expect(HTTP_STATUS.NO_CONTENT)
      res = await api.delete(conf.ITEMS_EP)
        .set("Authorization", `Bearer ${loggedin.body.token}`)
        .send({items: {name: items[1].name}}).expect(HTTP_STATUS.OK)
        .expect('Content-Type', /application\/json/)
      expect(res.body).toBe(1)

      loggedin = await api.post(conf.LOGIN_EP).send({
        username: admin.username,
        password: admin.password,
      }).expect(HTTP_STATUS.OK).expect('Content-Type', /application\/json/)
      res = await api.delete(`${conf.ITEMS_EP}/${items[2].id}`)
        .set("Authorization", `Bearer ${loggedin.body.token}`)
        .expect(HTTP_STATUS.NO_CONTENT)
      res = await api.delete(conf.ITEMS_EP)
        .set("Authorization", `Bearer ${loggedin.body.token}`)
        .send({users: {id: {gte: 0}}}).expect(HTTP_STATUS.OK)
        .expect('Content-Type', /application\/json/)
      expect(res.body).toBe(1)

      const all = await itemsSvc.search()
      expect(all.length).toBe(0)
    })
  })

  afterAll(async () => {
    await log.info('Test finished.')
    await prisma.$disconnect()
    await prismaLog?.$disconnect()
  })
})
