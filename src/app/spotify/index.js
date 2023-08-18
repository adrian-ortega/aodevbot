const auth = require("./auth");
const users = require("./users");
const search = require("./search");
const cache = require("./chat/cache");

module.exports = {
  cache,
  ...auth,
  ...users,
  ...search,
};
