const moment = require("moment");
const log = require("../log");
const logPrefix = "Spotify Client";
const axios = require("axios");
const tokens = require("./tokens");
const { refreshAccessToken } = require("./auth");
const { getBroadcaster } = require("../broadcaster");
const { Tokens } = require("../models");

const instance = axios.create({
  baseURL: "https://api.spotify.com/v1",
});

const requestAccessTokenInterceptor = async function (config) {
  await tokens.loadAccessToken();
  const accessToken = tokens.getAccessToken();
  if (accessToken !== null) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
};

const requestInterceptorErrorHandler = function (err) {
  const data = err.response ? err.response.data : {}
  log.error("requestAccessTokenInterceptor", { message: err.message, data }, logPrefix);
  return Promise.reject(err);
};

const responseRefreshTokenInterceptor = async function (err) {
  const ogConfig = err.config;
  if (err.response && err.response.status === 401 && !ogConfig._retry) {
    ogConfig._retry = true;
    try {
      const { access_token, expires_in, scope } = await refreshAccessToken(
        tokens.getRefreshToken(),
      );
      const Broadcaster = await getBroadcaster();
      const SpotifyToken = await Tokens.findOne({
        where: {
          chatter_id: Broadcaster.id,
          token_type: "spotify",
        },
      });

      if (!SpotifyToken) throw new Error("No Spotify Token found");

      SpotifyToken.update({
        access_token,
        expires: moment().add(expires_in, "seconds"),
        scope,
      });

      instance.defaults.headers.Authorization = `Bearer ${access_token}`;
      return instance(ogConfig);
    } catch (_err) {
      // Do nothing
    }
  }
  const data = err.response ? err.response.data : {}
  return Promise.reject(err);
};

instance.interceptors.request.use(
  requestAccessTokenInterceptor,
  requestInterceptorErrorHandler,
);
instance.interceptors.response.use(
  (res) => res,
  responseRefreshTokenInterceptor,
);

module.exports = instance;
