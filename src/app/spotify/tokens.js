const log = require("../log");
const logPrefix = "Spotify Auth";
const { getBroadcasterWithTokens } = require("../broadcaster");

let currentToken;

exports.loadAccessToken = async () => {
  try {
    const broadcaster = await getBroadcasterWithTokens();
    const token = broadcaster.tokens.find((a) => a.token_type === "spotify");
    if (token) {
      currentToken = token;
    }
  } catch (err) {
    log.error("loadAccessToken", { message: err.message }, logPrefix);
  }

  return currentToken;
};

exports.getAccessToken = () =>
  currentToken ? currentToken.access_token : null;

exports.getRefreshToken = () =>
  currentToken ? currentToken.refresh_token : null;
