const { isArray, objectHasKey } = require("./index");

const NANOID_DEFAULT_LENGTH = 5;
const NANOID_DEFAULT_CHARS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

/**
 * Will create a random ID using a set of characters from a string. (defaults above)
 * This will also check to see if the ID exists as a key in the our rooms object
 * @param {Object|Array} cache
 * @param {Number} size
 * @param {String} chars
 * @return {String}
 */
const makeId = (
  cache = {},
  size = NANOID_DEFAULT_LENGTH,
  chars = NANOID_DEFAULT_CHARS,
) => {
  const key = [...Array(size)]
    .map(() => chars.charAt(Math.floor(Math.random() * chars.length)))
    .join("");
  return isArray(cache) && objectHasKey(cache[0], "id")
    ? cache.find((o) => o.id === key)
      ? makeId(cache, size, chars)
      : key
    : Object.prototype.hasOwnProperty.call(cache, key)
    ? makeId(cache, size, chars)
    : key;
};

exports.makeId = makeId;
