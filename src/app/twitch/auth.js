const log = require('../log');
const config = require('../../config');
const client = require('axios');
const { loadAccessToken, getAccessToken, getTokenOwner } = require('./tokens');
const { getUser } = require('./users');

exports.refreshAccessToken = async () => {
  try {
    await loadAccessToken();
    const tokenOwner = await getTokenOwner();
    console.log(tokenOwner);
    // const data = await getUser();
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