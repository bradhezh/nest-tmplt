import {default as express, Request, Response} from 'express'

import {HTTP_STATUS, MESSAGE} from '@/const'
import {MiddlewareErr} from '@/utils/middleware'
import {credentialSchema, userSchemaIncs, UserIncs} from '@shared/schemas'
import usersSvc from '@/services/users'

export const loginRouter = express.Router()

/** `POST /api/login Credential & {includes?: UserIncs}`<br>
  => `UserResToken` */
export const login = async (req: Request, res: Response) => {
  const credential = credentialSchema.parse(req.body)
  const {includes} = userSchemaIncs.parse(req.body) as {includes?: UserIncs}
  const user = await usersSvc.login(credential, includes)
  if (!user) {
    throw new MiddlewareErr(HTTP_STATUS.UNAUTHED, MESSAGE.INV_CREDENTIAL)
  }
  res.json(user)
}
loginRouter.post('/', login)

export default loginRouter
