// only for "import" in prisma schemas, not used in src code
export * from '@shared/const'

const conf = {
  ep: {
    bkRoot: '/api',
    users: 'users',
    items: 'items',
    auth: 'auth',
    action: {
      login: 'login',
      logout: 'logout',
      signup: 'signup',
      search: 'search',
    },
    param: {
      me: 'me',
      byId: ':id',
      byName: 'by-name/:name',
      byUser: 'by-user/:id',
      byUsername: 'by-username/:name',
      byRole: 'by-role/:id',
      byRoleName: 'by-role-name/:name',
      byNameItem: 'by-name/:item',
      byUsernameUser: 'by-username/:user',
    },
    sub: {
      password: 'password',
    },
    rel: {
      users: 'users',
      roles: 'roles',
      items: 'items',
    },
  },

  page: {
    default: 20,
    max: 100,
  },

  schema: {
    name: {
      min: 3,
      max: 15,
    },
    displayName: {
      max: 60,
    },
    password: {
      min: 6,
      max: 30,
    },
  },

  role: {
    // the 1st one will have id 1 in the db
    user: 'User',
    admin: 'Admin',
    guest: 'Guest',
  },
} as const

export type Role = typeof conf.role[keyof typeof conf.role]

export default {
  ...conf,
  roles: Object.values(conf.role) as [Role, ...Role[]],
  defRole: conf.role.user,
} as const
