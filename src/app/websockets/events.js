const log = require("../log");
const logPrefix = "WS Events";
const { isFunction } = require("../support");

const events = [];
const listeners = {};

const createEventListener = (name) => {
  events.push(name);
  listeners[name] = [];
};

const eventListenerExists = (name) => events.includes(name);
const pushEventListener = (name, handler) => listeners[name].push(handler);

const addEventListener = (name, handler) => {
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
  addEventListener("chat-message", await require("./events/chat-message"));

  const stats = require('./events/stats')
  addEventListener('stats.next', stats.next);
  addEventListener('stats.current', stats.current);
  addEventListener('stats.stop', stats.stop)

  const spotify = require('./events/spotify');
  addEventListener('spotify.current', spotify.current);
  addEventListener('spotify.next', spotify.skipNext);
  addEventListener('spotify.play', spotify.playResume);
  addEventListener('spotify.pause', spotify.pause);
  addEventListener('spotify.previous', spotify.skipPrevious);
};

module.exports = {
  addEventListener,
  fireEventListeners,
  registerEventListeners,
};
