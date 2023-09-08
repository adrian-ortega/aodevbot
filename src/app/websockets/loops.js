const Logger = require('../log');
const logPrefix = 'Loop'
const { isFunction } = require("../support");

let fps = 60;
let started = false;
let handleLoop;
let lastTimestampMs;
const simulationTimeStep = 1000 / fps;
const handlers = [];

const requestAnimationFrame = (function () {
  let lastTimestamp = Date.now();
  let now;
  let timeout;

  return function (callback) {
    now = Date.now();
    timeout = Math.max(0, simulationTimeStep, (now - lastTimestamp) * -1)
    lastTimestamp = now + timeout;
    return setTimeout(function () {
      callback(now + timeout)
    })
  }
})()

function callLoopHandler(handler, ...args) {
  try {
    return isFunction(handler) ? handler(...args) : void 0;
  } catch (e) {
    Logger.error('Loop handler error', {
      message: e.message
    }, logPrefix)
  }
}

function loopHandlers(timestamp) {
  const wss = require('../websockets').getWebSocketServer()
  if (wss.clients.size > 0) {
    for (let i = 0; i < handlers.length; i++) {
      callLoopHandler(handlers[i], timestamp, wss)
    }
  }
}


function loop(timestamp) {
  handleLoop = requestAnimationFrame(loop);
  if (timestamp < lastTimestampMs) {
    return;
  }

  lastTimestampMs = timestamp;
  loopHandlers(timestamp)
}

exports.createLoop = () => {
  if (!started) {
    started = true;
    handleLoop = requestAnimationFrame(function (timestamp) {
      handleLoop = requestAnimationFrame(loop);
    });
  }
}

exports.registerLoopHandler = (handler) => {
  handlers.push(handler);
}