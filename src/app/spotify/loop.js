
const { requestAnimationFrame, ONE_SECOND, ONE_MINUTE } = require('../support/time');

let timeoutId;
let fetching = false;
let lastTimestamp, lastDevicesTimestamp, lastPlayerTimestamp;

const handle = async (timestamp, broadcastToClients) => {
  const Spotify = require('../spotify')
  broadcastToClients({
    event: 'spotify.currently-playing',
    payload: await Spotify.getCurrentlyPlaying()
  })

  if ((timestamp - lastPlayerTimestamp) > ONE_MINUTE * 0.25) {
    lastPlayerTimestamp = timestamp
    broadcastToClients({
      event: 'spotify.player-state',
      payload: await Spotify.getPlayerState()
    })
  }

  if ((timestamp - lastDevicesTimestamp) > ONE_MINUTE) {
    lastDevicesTimestamp = timestamp;
    broadcastToClients({
      event: 'spotify.devices',
      payload: await Spotify.getDevices()
    })
  }
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

  fetching = true;
  lastTimestamp = timestamp;
  await handle(timestamp, broadcastToClients);
  fetching = false
}

const init = () => {
  clearTimeout(timeoutId)
  timeoutId = requestAnimationFrame((timestamp) => {
    lastTimestamp = timestamp
    lastDevicesTimestamp = timestamp
    lastPlayerTimestamp = timestamp
    timeoutId = requestAnimationFrame(loop)
  })
}
init();