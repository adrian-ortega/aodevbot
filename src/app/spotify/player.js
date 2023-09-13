const log = require("../log");
const logPrefix = "Spotify Player";
const client = require("./client");

exports.getCurrentlyPlaying = async () => {
  try {
    const { data } = await client.get('/me/player/currently-playing')
    console.log({ data })

    return data;
  } catch (err) {
    log.error('getPlayerState', {
      message: err.message,
      data: err.response && err.response.data ? err.response.data : {}
    }, logPrefix)
  }
  return null;
}

exports.getPlayerState = async () => {
  try {
    const { data } = await client.get('/me/player')
    console.log({ data })
    return data;
  } catch (err) {
    log.error('getPlayerState', {
      message: err.message,
      data: err.response && err.response.data ? err.response.data : {}
    }, logPrefix)
  }
  return null;
}

exports.getDevices = async () => {
  try {
    const { data } = await client.get('/me/player/devices')
    console.log({ data })
    return data;
  } catch (err) {
    log.error('getDevices', {
      message: err.message,
      data: err.response && err.response.data ? err.response.data : {}
    }, logPrefix)
  }
  return [];
}