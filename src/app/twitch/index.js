const auth = require('./auth');
const chat = require('./chat');
const tokens = require('./tokens');
const stream = require('./stream.js');
const users = require('./users');

module.exports = {
  ...auth,
  ...chat,
  ...tokens,
  ...stream,
  ...users,
}