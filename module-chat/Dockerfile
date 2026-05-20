# 빌드 스테이지
FROM node:22-alpine AS build
WORKDIR /app

COPY module-chat/package.json module-chat/package-lock.json ./
RUN npm ci

COPY module-chat/ ./
RUN npm run build

# 실행 스테이지
FROM node:22-alpine
WORKDIR /app

COPY module-chat/package.json module-chat/package-lock.json ./
RUN npm ci --omit=dev

COPY --from=build /app/dist ./dist

EXPOSE 8083

CMD ["node", "dist/main.js"]
