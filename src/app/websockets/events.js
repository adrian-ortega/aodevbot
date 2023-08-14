const log = require("../log");
const logPrefix = "WS Events";
const { isFunction, objectHasProp, wait } = require("../support");

const events = [];
const listeners = {};

const createEventListener = (name) => {
  events.push(name);
  listeners[name] = [];
};

const eventListenerExists = (name) => events.includes(name);
const pushEventListener = (name, handler) => listeners[name].push(handler);

const addEventListner = (name, handler) => {
  if (!isFunction(handler)) {
    throw new Error("Event listener handler must be a function");
  }

  if (!eventListenerExists(name)) {
    createEventListener(name);
  }

  pushEventListener(name, handler);
};

const fireEventListeners = async (ws, event, payload, args) => {
  if (!eventListenerExists(event)) return null;
  try {
    const handlers = listeners[event];
    for (let i = 0; i < handlers.length; i++) {
      await handlers[i](payload, args, ws);
    }
  } catch (err) {
    log.error(
      "Fire Event Listeners",
      {
        error: err,
        event,
        payload,
        args,
      },
      logPrefix,
    );
  }
};

const registerEventListeners = async () => {
  addEventListner("chat-message", await require("./events/chat-message"));
};

module.exports = {
  addEventListner,
  fireEventListeners,
  registerEventListeners,
};
