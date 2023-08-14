const { isObject } = require("../support");

const actions = [];
const ACTION_STUB = {
  id: null,
  handler: () => {},
  args: [],
};

const addAction = (action) => {
  if (!isObject(action))
    throw new Error("Action must be an object with an id, and handler.");
  actions.push({ ...ACTION_STUB, ...action });
};

const registerActions = (wss) => {};

const fireActions = () => {};

module.exports = {
  addAction,
  registerActions,
};
