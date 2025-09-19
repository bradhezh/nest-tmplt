import {UserRes} from '@shared/schemas'
import {MongoAbility} from '@casl/ability'

declare global {
  namespace Express {
    interface Request {
      user?: UserRes
      ability?: MongoAbility
    }
  }
}
