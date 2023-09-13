
const log = require('../log');
const logPrefix = 'Spotify Loop'
const { requestAnimationFrame, ONE_SECOND } = require('../support/time');

let timeoutId;
let fetching = false;
let lastTimestamp;
const DURATION = ONE_SECOND * 5;

const getCurrent = async () => { }

const broadcastCurrent = async () => { }

// --

const handle = async () => {
  const Spotify = require('../spotify')
  const currentlyPlaying = await Spotify.getCurrentlyPlaying();
  const playerState = await Spotify.getPlayerState();

  console.log({ currentlyPlaying, playerState })

  return null;
}

const loop = async (timestamp) => {
  timeoutId = requestAnimationFrame(loop);
  const { hasOverlayClients, broadcastToClients } = require('../websockets')
  if (fetching || !hasOverlayClients()) {
    return;
  }

  if ((timestamp - lastTimestamp) < DURATION) {
    return;
  }

  fetching = true;
  lastTimestamp = timestamp;
  const payload = await handle();
  log.debug('Broadcasting', { payload }, logPrefix)
  broadcastToClients({
    event: 'spotify',
    payload
  })
  fetching = false
}

const init = () => {
  clearTimeout(timeoutId)
  broadcastCurrent();
  timeoutId = requestAnimationFrame((timestamp) => {
    lastTimestamp = timestamp
    timeoutId = requestAnimationFrame(loop)
  })
}
init();

module.exports = {
  getCurrent
}