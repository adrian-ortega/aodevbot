const SpotifyPlayerCacheItem = require("./cache-item");
const { makeId } = require("../../support/uuid");
const { isFunction, isObject, objectHasProp } = require("../../support");

let data = [];
const idKey = "_cache_id";

const findByKey = (key, value) => {
  const found = data.find((item) => item[key] === value);
  if (found) return found;

  for (let i = 0; i < data.length; i++) {
    const cachedItem = data[i];
    if (cachedItem.items) {
      for (let j = 0; j < cachedItem.items.length; j++) {
        if (
          objectHasProp(cachedItem.items[j], key) &&
          cachedItem.items[j][key] === value
        ) {
          return cachedItem;
        }
      }
    }
  }

  return null;
};

const getItem = (id) => findByKey(idKey, id);
const removeItem = (id) => {
  data = data.filter((item) => item[idKey] === id);
};

const appendItem = (id, parentItem = {}, childItem = {}) => {
  const item = getItem(id);
  if (!item) {
    return addItem({
      [idKey]: id ?? makeId(),
      ...parentItem,
      items: [childItem],
    });
  }
  return item.update({ items: [childItem] });
};

const addItem = (item) => {
  const generatedId = makeId();
  if (isFunction(item)) {
    item = item(generatedId, idKey);
  }

  if (!isObject(item)) {
    throw new Error(
      "Cached item must be an object or a callback that returns one",
    );
  }

  if (isObject(item) && !objectHasProp(item, idKey)) {
    item[idKey] = generatedId;
  }

  const cachedItem = new SpotifyPlayerCacheItem(item);
  data.push(cachedItem);

  return cachedItem;
};

module.exports = {
  findByKey,
  getItem,
  appendItem,
  addItem,
  removeItem,
};
