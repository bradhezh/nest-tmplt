import {INestApplication} from '@nestjs/common'
import {Test} from '@nestjs/testing'
import request from 'supertest'

import {AppModule} from '@/app.module'

describe('users', () => {
  let app: INestApplication

  beforeAll(async () => {
    const moduleRef =
      await Test.createTestingModule({imports: [AppModule]}).compile()
    app = moduleRef.createNestApplication()
    await app.init()
  })

  it('search', () => {
    return request(app.getHttpServer())
      .post('/api/users/search')
      .send({})
      .expect(401)
  })

  afterAll(async () => {
    await app.close()
  })
})
