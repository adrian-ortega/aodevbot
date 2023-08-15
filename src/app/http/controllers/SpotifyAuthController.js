const config = require("../../../config");
const moment = require("moment");
const { getBroadcaster } = require("../../broadcaster");
const { Tokens } = require("../../models");
const { isObject } = require("../../support");

const redirect_uri = `http://${config.HOST}:${config.PORT}/api/spotify/authenticate/confirm`;

exports.authenticate = (req, res) => {
  const Spotify = require("../../spotify");
  res.send({
    data: Spotify.getAuthURL(redirect_uri),
  });
};

exports.authConfirm = async (req, res) => {
  const Spotify = require("../../spotify");
  const { code, state } = req.query;

  // @TODO State parsing, we use this in case we want to pass
  //       the user ID that was registered, but this app isn't
  //       public facing, therefore no need to differentiate
  //       between broadcaster and users
  //
  if (!code) {
    return res.status(400).send({
      message: "Missing Data",
      authenticated: false,
    });
  }

  const accessTokenRespone = await Spotify.getAuthTokenFromCode(
    code,
    redirect_uri,
  );
  if (!isObject(accessTokenRespone)) {
    return accessTokenRespone === false
      ? res.redirect("/api/spotify/authenticate")
      : res.status(400).send({
        message: "Invalid Access Token",
        authenticated: false,
      });
  }

  const { access_token, expires_in, refresh_token, scope } = accessTokenRespone;
  const Broadcaster = await getBroadcaster();
  const [Token, tokenCreated] = await Tokens.findOrCreate({
    where: {
      chatter_id: Broadcaster.id,
      token_type: "spotify",
    },
    defaults: {
      chatter_id: Broadcaster.id,
      token_type: "spotify",
      access_token,
      refresh_token,
      expires: moment().add(expires_in, "seconds"),
      scope,
    },
  });

  // We only need to update the token if it wasn't created
  if (!tokenCreated) {
    await Token.update({
      access_token,
      refresh_token,
      expires: moment().add(expires_in, "seconds"),
      scope,
    });
  }

  return res.send({
    message: "Authenticated with Spotify",
    authenticated: true,
  });
};
