const auth = require('./auth');
const chat = require('./chat');
const tokens = require('./tokens');
const users = require('./users');

module.exports = {
  ...auth,
  ...chat,
  ...tokens,
  ...users,
}