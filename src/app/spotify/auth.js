const client = require("axios");
const config = require("../../config");
const log = require("../log");
const logPrefix = "Twitch Auth";
const { isEmpty } = require("../support");

const accessTokenHeaders = {
  "Content-Type": "application/x-www-form-urlencoded",
  auth: [config.SPOTIFY_CLIENT_ID, config.SPOTIFY_CLIENT_SECRET],
};

exports.refreshAccessToken = async (refresh_token) => {
  try {
    const response = await client.post(
      "https://accounts.spotify.com/api/token",
      {
        grant_type: "refresh_token",
        refresh_token,
      },
      {
        headers: accessTokenHeaders,
      },
    );
    return await response.json();
  } catch (err) {
    log.error("Refresh token failed", { message: err.message }, logPrefix);
  }

  return null;
};

exports.getAuthTokenFromCode = async (
  code = null,
  state = "",
  redirect_uri = "",
) => {
  try {
    if (isEmpty(code) || isEmpty(redirect_uri)) {
      throw new Error("Missing params");
    }
    const response = await client.post(
      "https://accounts.spotify.com/api/token",
      {
        headers: accessTokenHeaders,
      },
    );

    // @TODO finish this implementation
  } catch (err) {
    //
  }
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
