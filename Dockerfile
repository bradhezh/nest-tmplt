FROM node:22

WORKDIR /usr/app

RUN corepack enable && corepack prepare pnpm@10 --activate

COPY . .

RUN pnpm i --frozen-lockfile
RUN pnpm build
RUN pnpm i --frozen-lockfile --prod

USER node

CMD ["pnpm", "start:debug"]
