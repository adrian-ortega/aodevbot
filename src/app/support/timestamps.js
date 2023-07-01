const path = require('path');
const createJsonFileStorage = require('./json-file-storage');
console.log();

module.exports = createJsonFileStorage(
  path.resolve(path.join('storage', 'timestamps.json')),
  {},
  true
);