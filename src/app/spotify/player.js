const log = require("../log");
const { objectHasProp } = require("../support");
const logPrefix = "Spotify Player";
const client = require("./client");

exports.getCurrentlyPlaying = async () => {
  try {
    const { data, status } = await client.get('/me/player/currently-playing')
    if (status === 204) {
      return null;
    }

    return data;
  } catch (err) {
    log.error('getCurrentlyPlaying', {
      message: err.message,
      data: err.response && err.response.data ? err.response.data : {}
    }, logPrefix)
  }
  return null;
}

exports.getPlayerState = async () => {
  try {
    const { data, status } = await client.get('/me/player')
    if (status === 204) {
      return null;
    }
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
    return objectHasProp(data, 'devices') ? data.devices : [];
  } catch (err) {
    log.error('getDevices', {
      message: err.message,
      data: err.response && err.response.data ? err.response.data : {}
    }, logPrefix)
  }
  return [];
}