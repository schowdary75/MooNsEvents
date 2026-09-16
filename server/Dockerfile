FROM node:24-alpine AS dependencies
WORKDIR /app
COPY package.json package-lock.json ./
COPY client/package.json ./client/package.json
COPY server/package.json ./server/package.json
COPY scripts/prepare-husky.mjs ./scripts/prepare-husky.mjs
COPY server/prisma ./server/prisma
COPY server/scripts ./server/scripts
RUN HUSKY=0 npm ci --workspace @moonsevents/server && npm run prisma:generate --workspace @moonsevents/server

FROM dependencies AS build
COPY server/tsconfig*.json ./server/
COPY server/src ./server/src
RUN npm run build --workspace @moonsevents/server

FROM node:24-alpine AS runtime
ENV NODE_ENV=production
ENV SCREEN_EXPORT_SOURCE_ROOT=/app/screen-export-source
WORKDIR /app
RUN apk add --no-cache mysql-client && addgroup -S nodeapp && adduser -S nodeapp -G nodeapp
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=build /app/server/dist ./dist
COPY --from=dependencies /app/server/prisma ./prisma
COPY server/package.json ./
COPY package.json ./screen-export-source/package.json
COPY client/package.json client/tsconfig.json client/vite.config.ts ./screen-export-source/client/
COPY client/src ./screen-export-source/client/src
COPY client/public ./screen-export-source/client/public
COPY server/package.json server/tsconfig.json server/tsconfig.build.json ./screen-export-source/server/
COPY server/src ./screen-export-source/server/src
COPY server/prisma ./screen-export-source/server/prisma
COPY server/src/constants/crmPermissions.ts ./src/constants/crmPermissions.ts
RUN mkdir -p uploads/recordings storage/uploads storage/logs && chown -R nodeapp:nodeapp /app
USER nodeapp
EXPOSE 4000
CMD ["node", "dist/server.js"]
