const log = require('../log');
const config = require('../../config');
const client = require('axios');
const moment = require('moment');
const { Tokens } = require('../models');
const { loadAccessToken, getRefreshToken, getTokenType } = require('./tokens');
const { getUser } = require('./users');
const { getBroadcaster } = require('../broadcaster');

exports.refreshAccessToken = async () => {
  try {
    const broadcaster = await getBroadcaster();
    await loadAccessToken();
    const refresh_token = getRefreshToken();
    const { data } = await client.post('https://id.twitch.tv/oauth2/token', {
      client_id: config.TWITCH_CLIENT_ID,
      client_secret: config.TWITCH_CLIENT_SECRET,
      grant_type: 'refresh_token',
      refresh_token
    });
    await Tokens.create({
      chatter_id: broadcaster.id,
      token_type: getTokenType(),
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires: moment().add(data.expires_in, 'seconds'),
      scope: data.scope.join(' ')
    });
    return true;
  } catch (err) {
    log.error('refreshAccessToken', err);
    return false;
  }

  return true;
}

exports.getAuthTokenFromCode = async (code, redirect_uri) => {
  try {
    const { data } = await client.post('https://id.twitch.tv/oauth2/token', {
      client_id: config.TWITCH_CLIENT_ID,
      client_secret: config.TWITCH_CLIENT_SECRET,
      code,
      grant_type: 'authorization_code',
      redirect_uri
    });
    return data;
  } catch (err) {
    const { response } = err;

    // Missing code for access_token
    if (response && response.status === 400) {
      return false;
    }

    log.error('error getAuthTokenFromCode', {
      message: err.message
    });
  }

  return null;
}

exports.getAuthURL = (isBroadcaster = false, redirect_uri) => {
  const client_id = config.TWITCH_CLIENT_ID;

  const state = '';
  const scopes = ['user:read:email'];

  if (isBroadcaster) {
    scopes.push('bits:read');
    scopes.push('moderator:read:chatters');
    scopes.push('analytics:read:games');
    scopes.push('channel:read:subscriptions');
    scopes.push('channel:read:hype_train');
    scopes.push('channel:manage:broadcast');
    scopes.push('channel:manage:redemptions');
    scopes.push('chat:read');
    scopes.push('chat:edit');
    scopes.push('user:read:subscriptions');
    scopes.push('user:read:follows');
  }

  const url = new URL(`https://id.twitch.tv/oauth2/authorize`);
  const params = {
    response_type: 'code',
    client_id,
    redirect_uri,
    scope: scopes.join(' '),
    state: state
  }
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });
  return url;
}