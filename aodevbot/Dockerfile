FROM node:18-alpine

WORKDIR /aodevbot
COPY package.json .
RUN npm install
COPY . .
# CMD npm start

EXPOSE 8080