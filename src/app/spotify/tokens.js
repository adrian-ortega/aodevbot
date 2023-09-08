const log = require("../log");
const logPrefix = "Spotify Auth";
const { getBroadcasterWithTokens, getBroadcaster } = require("../broadcaster");
const { Tokens } = require("../models");

let currentToken;

exports.loadAccessToken = async () => {
  try {
    const broadcaster = await getBroadcaster();
    const chatter_id = broadcaster.id
    const results = await Tokens.findAll({
      where: {
        chatter_id,
        token_type: 'spotify'
      },
      limit: 1,
      order: [["expires", "DESC"]],
    })
    const token = results.shift();
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
