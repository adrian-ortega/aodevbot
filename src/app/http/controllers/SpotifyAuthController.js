const config = require("../../../config");
const { getBroadcaster } = require("../../broadcaster");
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

  // @TODO State parsing
  if (!code) {
    return res.status(400).send({
      message: 'Missing Data',
      authenticated: false
    })
  }

  const accessTokenRespone = await Spotify.getAuthTokenFromCode(code, state, redirect_uri)

  if (!accessTokenRespone) {
    return accessTokenRespone === false
      ? res.redirect('/api/spotify/authenticate')
      : res.status(400).send({
        message: 'Invalid Access Token',
        authenticated: false
      })
  }

  const { access_token, token_type, expires_in, refresh_token, scope } = accessTokenRespone;
  const Broadcaster = getBroadcaster()

};
