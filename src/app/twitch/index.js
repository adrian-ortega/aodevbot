const auth = require('./auth');
const tokens = require('./tokens');
const users = require('./users');

module.exports = {
  ...auth,
  ...tokens,
  ...users,
}