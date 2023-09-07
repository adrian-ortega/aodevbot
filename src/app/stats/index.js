const log = require('../log');
const logPrefix = 'Stats'
const { shuffleArray, isFunction } = require('../support')
const { requestAnimationFrame, ONE_MINUTE } = require('../support/time');

const DURATION_ON = ONE_MINUTE;
const DURATION_OFF = ONE_MINUTE * 3;
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
    log.error('handler error', {
      message: e.message
    }, logPrefix)
  }
}

const loop = async (timestamp) => {
  timeoutId = requestAnimationFrame(loop);
  const { getWebSocketServer, broadcastToClients } = require('../websockets');
  const wss = getWebSocketServer()
  if (fetching || wss.clients.size === 0 || ((timestamp - lastTimestamp) < duration)) {
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
}

const init = () => {
  resetGroups();
  timeoutId = requestAnimationFrame((timestamp) => {
    lastTimestamp = timestamp;
    timeoutId = requestAnimationFrame(loop);
  });
}
init();