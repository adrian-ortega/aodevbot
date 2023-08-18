const log = require("../log");
const axios = require("axios");
const tokens = require("./tokens");

const instance = axios.create({
  baseURL: "https://api.spotify.com/v1",
});

const requestAccessTokenInterceptor = async function (config) {
  await tokens.loadAccessToken();
  const accessToken = tokens.getAccessToken();
  console.log(accessToken);
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
