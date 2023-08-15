const client = require("axios");
const config = require("../../config");
const log = require("../log");
const logPrefix = "Twitch Auth";
const { isEmpty } = require("../support");

const getClientOptions = () => {
  return {
    headers: {
      Authorization: `Basic ${Buffer.from(
        `${config.SPOTIFY_CLIENT_ID}:${config.SPOTIFY_CLIENT_SECRET}`,
      ).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
  };
};

exports.refreshAccessToken = async (refresh_token) => {
  try {
    const response = await client.post(
      "https://accounts.spotify.com/api/token",
      {
        grant_type: "refresh_token",
        refresh_token,
      },
      getClientOptions(),
    );
    return await response.json();
  } catch (err) {
    log.error("Refresh token failed", { message: err.message }, logPrefix);
  }

  return null;
};

exports.getAuthTokenFromCode = async (code = null, redirect_uri = "") => {
  try {
    if (isEmpty(code) || isEmpty(redirect_uri)) {
      throw new Error("Missing params");
    }
    const requestOptions = {
      grant_type: "authorization_code",
      code,
      redirect_uri,
    };
    const { data } = await client.post(
      "https://accounts.spotify.com/api/token",
      requestOptions,
      getClientOptions(),
    );
    return data;
  } catch (err) {
    const { response } = err;

    // Missing code for access_token
    if (response && response.status === 400) {
      return false;
    }

    log.error(
      "getAuthTokenFromCode",
      {
        message: err.message,
      },
      logPrefix,
    );
  }

  return null;
};

exports.getAuthURL = (redirect_uri) => {
  // @TODO In the original Bot API, we gave an option to pass
  //       different types to change the scopes required
  //       to interact with this API

  const client_id = config.SPOTIFY_CLIENT_ID;
  const scopes = [
    // This is sthe only required spotify scope for everyone else,
    "user-read-email",

    // These are required for the bot
    "streaming",
    "user-read-private",
    "user-read-playback-state",
    "user-modify-playback-state",
    "user-read-currently-playing",
    "user-library-read",
    "playlist-modify-private",
  ];
  const url = new URL("https://accounts.spotify.com/authorize");
  const params = {
    client_id,
    response_type: "code",
    redirect_uri,
    state: "",
    scope: scopes.join(" "),
  };
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });
  return url;
};
