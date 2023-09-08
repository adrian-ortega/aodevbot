const auth = require("./auth");
const channels = require("./channels");
const chat = require("./chat");
const tokens = require("./tokens");
const stream = require("./stream.js");
const users = require("./users");
const events = require("./events");
const leaderboard = require('./leaderboard');
const client = require('./client');
const clips = require('./clips')

module.exports = {
  client,
  ...auth,
  ...channels,
  ...chat,
  ...clips,
  ...tokens,
  ...stream,
  ...users,
  ...events,
  ...leaderboard,
};
