FROM node:21-alpine AS builder

WORKDIR ./
RUN apk update && \
  apk upgrade && \
  apk add git && \
  git clone https://github.com/adrian-ortega/aodevbot-frontend.git && \
  cd aodevbot-frontend && \
  npm install --prefer-dist && \
  npm run build

FROM node:21-alpine
WORKDIR /home/node/app
COPY --from=builder ./aodevbot-frontend/dist ./public
COPY ./src/package.json .
RUN npm install --prefer-dist
COPY ./src .
CMD ["npm", "run", "serve"]
EXPOSE 8080