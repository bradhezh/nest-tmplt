// only for "import" in prisma schemas, not used in src code
export * from '@shared/const'

const conf = {
  USERS_EP: '/api/users',
  ITEMS_EP: '/api/items',
  LOGIN_EP: '/api/login',
  LOGOUT_EP: '/api/logout',
  SIGNUP: '/signup',
  SEARCH: '/search',
  ME: '/me',
  BY_ID: '/:id',
  BY_NAME: '/by-name/:name',
  BY_USER: '/by-user/:id',
  BY_USERNAME: '/by-username/:name',
  BY_ROLE: '/by-role/:id',
  BY_ROLENAME: '/by-role-name/:name',
  BY_NAME_ITEM: 'by-name/:item',
  BY_USERNAME_USER: '/by-username/:user',
  USER_PASSWD: '/password',
  REL_USERS: '/users',
  REL_ROLES: '/roles',
  REL_ITEMS: '/items',

  PAGE_DEF: 20,
  PAGE_MAX: 100,

  NAME_MIN: 3,
  NAME_MAX: 15,
  DISPLAYED_NAME_MAX: 60,
  PASSWD_MIN: 6,
  PASSWD_MAX: 30,

  ROLE: {
    // the 1st one will have id 1 in the db
    USER: 'User',
    ADMIN: 'Admin',
    GUEST: 'Guest',
  },
} as const

export type Role = typeof conf.ROLE[keyof typeof conf.ROLE]

export default {
  ...conf,
  ROLES: Object.values(conf.ROLE) as [Role, ...Role[]],
  ROLE_DEF: conf.ROLE.USER,
} as const
