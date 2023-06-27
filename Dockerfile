FROM node:18-alpine

WORKDIR /var/app
COPY ./src/package.json .
RUN npm install
COPY ./src .
# CMD npm start

# EXPOSE 8080