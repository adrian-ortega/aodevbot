const moment = require("moment");
const config = require("../../../config");
const { PRIMARY_BROADCASTER, SECONDARY_BROADCASTER, getBroadcasterOrNull } = require("../../broadcaster");
const { reconnectChatClient } = require("../../twitch/chat");
const redirect_uri = `http://${config.HOST}:${config.PORT}/api/twitch/authenticate/confirm`;

exports.authenticate = (req, res) => {
  const twitch = require("../../twitch");
  const { type } = req.query;
  res.send({
    data: twitch.getAuthURL(redirect_uri, parseInt(type, 10)),
  });
};

exports.authConfirm = async (req, res) => {
  const Twitch = require("../../twitch");
  const { Chatters, Tokens } = require("../../models");
  let { code, state } = req.query;
  try {
    state = JSON.parse(state);
  } catch (err) {
    console.log(err);
  }

  if (!code || !state) {
    return res.status(400).send({
      message: "Missing data",
      authenticated: false,
    });
  }

  const accessTokenResponse = await Twitch.getAuthTokenFromCode(
    code,
    redirect_uri,
  );
  if (!accessTokenResponse) {
    return accessTokenResponse === false
      ? res.redirect("/api/twitch/authenticate")
      : res.status(400).send({
        message: "Invalid Access Token",
        authenticated: false,
      });
  }

  const { access_token, refresh_token, expires_in, scope } =
    accessTokenResponse;
  const expires = moment().add(expires_in, "seconds");
  let tokenChatterId = -1
  let broadcasterType = 0;

  if ([PRIMARY_BROADCASTER, SECONDARY_BROADCASTER].includes(state.t)) {
    tokenChatterId = 0;
    broadcasterType = SECONDARY_BROADCASTER
    if (PRIMARY_BROADCASTER === state.t) {
      broadcasterType = PRIMARY_BROADCASTER
      const b = await getBroadcasterOrNull();
      if (b) {
        tokenChatterId = b.id;
      }
    }
  } else {
    return res.status(400).send({
      message: 'Invalid token state',
      state,
      authenticated: false
    })
  }

  const [chatterToken] = await Tokens.findOrCreate({
    where: {
      chatter_id: tokenChatterId,
      token_type: 'twitch'
    },
    limit: 1,
    order: [["expires", "DESC"]],
    defaults: {
      chatter_id: tokenChatterId,
      token_type: 'twitch',
      access_token,
      refresh_token,
      expires,
      scope: scope.join(' ')
    }
  })

  // We need to override the current token in order to pull the data with the
  // token provided by Twitch. Otherwise, the user returned will be that of the
  // broadcaster, if saved.
  //
  Twitch.overrideCurrentToken(true, chatterToken);
  const twitchUserData = await Twitch.getUser();
  Twitch.overrideCurrentToken(false);

  if (!twitchUserData) {
    return res.status(401).send({
      message: "Cannot load Twitch user",
      authenticated: false,
    });
  }

  const chatterResults = await Chatters.findOrCreate({
    where: {
      twitch_id: twitchUserData.id,
      username: twitchUserData.login
    },
    defaults: {
      twitch_id: twitchUserData.id,
      username: twitchUserData.login,
      display_name: twitchUserData.display_name,
      profile_image_url: twitchUserData.profile_image_url,
      mod: true,
      subscriber: true,
      broadcaster: broadcasterType
    },
  });
  const Chatter = chatterResults.shift();
  await chatterToken.update({
    chatter_id: Chatter.id,
    access_token,
    refresh_token,
    expires,
    scope: scope.join(' ')
  })
  await reconnectChatClient();

  return res.send({
    message: `User ${Chatter.twitch_id} Authenticated`,
    authenticated: true,
  });
};
