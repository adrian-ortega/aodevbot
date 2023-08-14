const config = require("../../../config");
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

  res.send({
    code,
    state,
  });
};
