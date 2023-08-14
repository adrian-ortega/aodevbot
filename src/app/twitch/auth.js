const log = require("../log");
const config = require("../../config");
const client = require("axios");
const moment = require("moment");
const TokensStore = require("./tokens");
const { Tokens } = require("../models");
const {
  getBroadcaster,
  PRIMARY_BROADCASTER,
  SECONDARY_BROADCASTER,
} = require("../broadcaster");

exports.refreshAccessToken = async () => {
  try {
    const broadcaster = await getBroadcaster();
    await TokensStore.loadAccessToken();
    const refresh_token = TokensStore.getRefreshToken();
    const { data } = await client.post("https://id.twitch.tv/oauth2/token", {
      client_id: config.TWITCH_CLIENT_ID,
      client_secret: config.TWITCH_CLIENT_SECRET,
      grant_type: "refresh_token",
      refresh_token,
    });
    await Tokens.create({
      chatter_id: broadcaster.id,
      token_type: TokensStore.getTokenType(),
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires: moment().add(data.expires_in, "seconds"),
      scope: data.scope.join(" "),
    });
    return true;
  } catch (err) {
    log.error("refreshAccessToken", {
      message: err.message,
    });
  }
  return false;
};

exports.getAuthTokenFromCode = async (code, redirect_uri) => {
  try {
    const { data } = await client.post("https://id.twitch.tv/oauth2/token", {
      client_id: config.TWITCH_CLIENT_ID,
      client_secret: config.TWITCH_CLIENT_SECRET,
      code,
      grant_type: "authorization_code",
      redirect_uri,
    });
    return data;
  } catch (err) {
    const { response } = err;

    // Missing code for access_token
    if (response && response.status === 400) {
      return false;
    }

    log.error("error getAuthTokenFromCode", {
      message: err.message,
    });
  }

  return null;
};

exports.getAuthURL = (redirect_uri, type = 0) => {
  const client_id = config.TWITCH_CLIENT_ID;
  const state = JSON.stringify({ t: type });
  const scopes = ["user:read:email"];

  if (type === PRIMARY_BROADCASTER) {
    scopes.push("bits:read");
    scopes.push("moderator:read:chatters");
    scopes.push("analytics:read:games");
    scopes.push("channel:read:subscriptions");
    scopes.push("channel:read:hype_train");
    scopes.push("channel:manage:broadcast");
    scopes.push("channel:manage:redemptions");
    scopes.push("user:read:subscriptions");
    scopes.push("user:read:follows");
  }

  if (type === PRIMARY_BROADCASTER || type === SECONDARY_BROADCASTER) {
    scopes.push("chat:read");
    scopes.push("chat:edit");
  }

  const url = new URL(`https://id.twitch.tv/oauth2/authorize`);
  const params = {
    response_type: "code",
    client_id,
    redirect_uri,
    scope: scopes.join(" "),
    state,
    force_verify: true,
  };
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });
  return url;
};
