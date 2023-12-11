const auth = require("./auth");
const users = require("./users");
const search = require("./search");
const cache = require("./chat/cache");
const tokens = require('./tokens');
const player = require('./player');
const tracks = require('./tracks');
const playlists = require('./playlists');

module.exports = {
  cache,
  ...tokens,
  ...auth,
  ...users,
  ...search,
  ...player,
  ...tracks,
  ...playlists,
};
