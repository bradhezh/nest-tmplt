import {Includes, Page} from '@shared/schemas'

export const parseIncs = (
  includes?: Includes,
): {include?: {[K in NonNullable<Includes>[number]]: true}} => {
  return !includes?.length
    ? {} : {include: Object.fromEntries(includes.map(e => [e, true]))}
}

export const parsePage = (page: Page) => {
  return {
    skip: (page.page - 1) * page.pageSize,
    take: page.pageSize,
    ...(!page.orderBy ? {} : {orderBy: {[page.orderBy]: page.order}}),
    ...parseIncs(page.includes),
  }
}
