const log = require("../log");
const axios = require("axios");
const tokens = require("./tokens");
const auth = require("./auth");
const { TWITCH_CLIENT_ID } = require("../../config");
const instance = axios.create({
  baseURL: "https://api.twitch.tv",
});

const requestAccessTokenInterceptor = async function (config) {
  const token = await tokens.loadAccessToken();
  if (token) {
    config.headers["Client-ID"] = TWITCH_CLIENT_ID;
    config.headers.Authorization = `Bearer ${token.access_token}`;
  }
  return config;
};

const requestInterceptorErrorHandler = function (err) {
  log.error(
    "Something went wrong with the interceptor",
    err,
    "requestInterceptorErrorHandler",
  );
};

const responseRefreshTokenInterceptor = async function (err) {
  const ogConfig = err.config;
  if (err.response && err.response.status === 401 && !ogConfig._retry) {
    ogConfig._retry = true;
    try {
      await auth.refreshAccessToken();
      const accessToken = await tokens.getAccessToken()
      instance.defaults.headers.Authorization = `Bearer ${accessToken}`;
      return instance(ogConfig)
    } catch (_err) {
      console.log(_err)
    }
  }
  return Promise.reject(err);
};

instance.interceptors.request.use(
  requestAccessTokenInterceptor,
  requestInterceptorErrorHandler,
);

instance.interceptors.response.use(
  (res) => res,
  responseRefreshTokenInterceptor
);

module.exports = instance;
