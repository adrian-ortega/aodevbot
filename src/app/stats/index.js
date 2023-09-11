const log = require('../log');
const logPrefix = 'Stats'
const { shuffleArray, isFunction } = require('../support')
const { requestAnimationFrame, ONE_MINUTE } = require('../support/time');

const DURATION_ON = ONE_MINUTE * 3;
const DURATION_OFF = ONE_MINUTE * 2;
const DURATION_PUSH = ONE_MINUTE / 4;
const DEFAULT_GROUP = 'bits-leaders,default,followers'//,song-requests'

let timeoutId;
let lastTimestamp;
let flip = true;
let fetching = false;
let duration = 100;
let groups;
let nextGroup;

const resetGroups = () => {
  groups = shuffleArray(DEFAULT_GROUP.split(',').map(s => s.trim()))
}

const broadcastCurrent = () => {
  const { broadcastToClients } = require('../websockets');
  broadcastToClients({
    event: 'stats.current',
    payload: {
      currentGroup: nextGroup,
      nextGroup: flip ? groups[0] : 'skip',
      lastTimestamp,
      duration
    }
  });
}
const handle = async (wss) => {
  try {
    nextGroup = groups.shift();
    if (groups.length === 0) resetGroups();
    const groupHandler = require(`./${nextGroup}`);
    if (!isFunction(groupHandler)) {
      return;
    }

    const data = await groupHandler();
    flip = false;
    duration = DURATION_ON;
    return { data, type: nextGroup };
  } catch (e) {
    log.error('handler error', e, logPrefix)
  }

  return null;
}

const loop = async (timestamp) => {
  timeoutId = requestAnimationFrame(loop);
  const { getWebSocketServer, broadcastToClients } = require('../websockets');
  const wss = getWebSocketServer()
  if (fetching || wss.clients.size === 0) {
    return;
  }

  if ((timestamp - lastTimestamp) % DURATION_PUSH === 0) {
    broadcastCurrent();
  }

  if ((timestamp - lastTimestamp) < duration) {
    return;
  }

  fetching = true
  lastTimestamp = timestamp;
  if (!flip) {
    flip = true
    duration = DURATION_OFF;
  } else {
    broadcastToClients({
      event: 'stats',
      payload: await handle()
    });
  }
  fetching = false
  broadcastCurrent()
}

const fastForward = async () => {
  const { broadcastToClients } = require('../websockets');
  fetching = true;
  lastTimestamp += duration;
  flip = true;
  broadcastToClients({ event: 'stats', payload: await handle() })
  broadcastCurrent()
  fetching = false;
}

const getCurrent = async () => {
  broadcastCurrent()
}

const init = () => {
  clearTimeout(timeoutId)
  resetGroups();
  broadcastCurrent();
  timeoutId = requestAnimationFrame((timestamp) => {
    lastTimestamp = timestamp;
    timeoutId = requestAnimationFrame(loop);
  });
}
init();

module.exports = {
  fastForward,
  getCurrent
}