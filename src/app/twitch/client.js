const log = require("../log");
const axios = require("axios");
const tokens = require("./tokens");
const { TWITCH_CLIENT_ID } = require("../../config");
const instance = axios.create({
  baseURL: "https://api.twitch.tv",
});

const requestAccessTokenInterceptor = async function (config) {
  await tokens.loadAccessToken();
  const accessToken = tokens.getAccessToken();
  config.headers["Client-ID"] = TWITCH_CLIENT_ID;
  config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
};

const requestInterceptorErrorHandler = function (err) {
  log.error(
    "Something went wrong with the interceptor",
    err,
    "requestInterceptorErrorHandler",
  );
};

instance.interceptors.request.use(
  requestAccessTokenInterceptor,
  requestInterceptorErrorHandler,
);

module.exports = instance;
