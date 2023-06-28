const log = require('../log');
const axios = require('axios');
const tokens = require('./tokens');
const { TWITCH_CLIENT_ID } = require('../../config');
const instance = axios.create({
  baseURL: 'https://api.twitch.tv',
});

const requestAccessTokenInterceptor = async function (config) {
  await tokens.load();
  const accessToken = tokens.getAccessToken();
  config.headers['Client-ID'] = TWITCH_CLIENT_ID;
  config.headers['Authorization'] = `Bearer ${accessToken}`;
  return config;
}

const requestInterceptorErrorHandler = function (err) {
  console.log('Something went werong with the interceptor', err);
};

instance.interceptors.request.use(
  requestAccessTokenInterceptor,
  requestInterceptorErrorHandler
);

module.exports = instance;