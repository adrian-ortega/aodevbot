
const { requestAnimationFrame, ONE_SECOND, ONE_MINUTE } = require('../support/time');

let timeoutId;
let fetching = false;
let fetchingDevices = false;
let fetchingPS = false;
let lastTimestamp, lastDevicesTimestamp, lastPlayerTimestamp;

const broadcastCurrent = async () => {
  const { broadcastToClients } = require('../websockets')
  const Spotify = require('../spotify')
  broadcastToClients({
    event: 'spotify.currently-playing',
    payload: await Spotify.getCurrentlyPlaying()
  })
  broadcastToClients({
    event: 'spotify.player-state',
    payload: await Spotify.getPlayerState()
  })
  broadcastToClients({
    event: 'spotify.devices',
    payload: await Spotify.getDevices()
  })
}

const handle = async (timestamp, broadcastToClients) => {
  if (fetching) return;

  fetching = true;
  const Spotify = require('../spotify')
  broadcastToClients({
    event: 'spotify.currently-playing',
    payload: await Spotify.getCurrentlyPlaying()
  })

  if (!fetchingPS && (timestamp - lastPlayerTimestamp) > ONE_MINUTE * 0.25) {
    fetchingPS = true;
    lastPlayerTimestamp = timestamp
    broadcastToClients({
      event: 'spotify.player-state',
      payload: await Spotify.getPlayerState()
    })
    fetchingPS = false;
  }

  if (!fetchingDevices && (timestamp - lastDevicesTimestamp) > ONE_MINUTE) {
    fetchingDevices = true;
    lastDevicesTimestamp = timestamp;
    broadcastToClients({
      event: 'spotify.devices',
      payload: await Spotify.getDevices()
    })
    fetchingDevices = false;
  }

  fetching = false;
}

const loop = async (timestamp) => {
  timeoutId = requestAnimationFrame(loop);
  const { hasOverlayClients, broadcastToClients } = require('../websockets')
  if (fetching || !hasOverlayClients()) {
    return;
  }

  if ((timestamp - lastTimestamp) < ONE_SECOND * 5) {
    return;
  }

  lastTimestamp = timestamp;
  await handle(timestamp, broadcastToClients);
}

const init = () => {
  clearTimeout(timeoutId)
  timeoutId = requestAnimationFrame((timestamp) => {
    const { broadcastToClients } = require('../websockets')
    lastTimestamp = timestamp
    lastDevicesTimestamp = timestamp + ONE_MINUTE * 3
    lastPlayerTimestamp = lastDevicesTimestamp
    handle(timestamp, broadcastToClients)


    timeoutId = requestAnimationFrame(loop)
  })
}
init();

module.exports = {
  broadcastCurrent
}