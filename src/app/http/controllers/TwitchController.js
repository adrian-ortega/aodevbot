const log = require('../../log');
const config = require('../../../config');
const moment = require('moment');
const redirect_uri = `http://${config.HOST}:${config.PORT}/api/twitch/authenticate/confirm`;

exports.authenticate = (req, res) => {
  res.send({
    data: require('../../twitch').getAuthURL(true, redirect_uri)
  });
};

exports.authConfirm = async (req, res) => {
  const Twitch = require('../../twitch');
  const { Chatters } = require('../../models');

  const { code, state } = req.query;
  const accessTokenResponse = await Twitch.getAuthTokenFromCode(code, redirect_uri);
  if (!accessTokenResponse) {
    return res.status(400).send({
      message: "Invalid Access Token",
      authenticated: false
    });
  }

  const { access_token, refresh_token, expires_in, scope } = accessTokenResponse;
  const expires = moment().add(expires_in, 'seconds');
  await Twitch.setAccessToken(
    { access_token, refresh_token },
    expires,
    scope.join(' ')
  );

  const twitchUserData = await Twitch.getUser();
  if (!twitchUserData) {
    return res.status(401).send({
      message: "Cannot load Twitch user",
      authenticated: false
    })
  }

  const chatterResults = await Chatters.findOrCreate({
    where: { twitch_id: twitchUserData.id, username: twitchUserData.login },
    defaults: {
      twitch_id: twitchUserData.id,
      username: twitchUserData.login,
      display_name: twitchUserData.display_name
    }
  });
  const Chatter = chatterResults.length > 0 ? chatterResults.shift() : null;
  if (Chatter) {
    await Twitch.updateAccessTokenOwner(Chatter.id);
  }

  return res.send({
    message: `User ${Chatter.twitch_id} Authenticated`,
    authenticated: true
  });
}

exports.getUser = async (req, res) => {
  const { username } = req.params;
  const Twitch = require('../../twitch');
  const data = await Twitch.getUser(username);
  res.send({ data });
}
