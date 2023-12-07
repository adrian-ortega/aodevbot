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
    console.log(err.status)
    if (err.status !== 401) {
      log.error('getCurrentlyPlaying', {
        message: err.message,
        data: err.response && err.response.data ? err.response.data : {}
      }, logPrefix)
    }
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

exports.skipToNext = async () => {
  try {
    const player_state = await this.getPlayerState()
    await client.post('/me/player/next', {
      params: {
        device_id: player_state?.device?.id
      }
    })
  } catch (err) {
    // console.log(err)
  }
}

exports.playResume = async () => {
  try {
    const player_state = await this.getPlayerState()
    await client.put('/me/player/play', {
      params: {
        device_id: player_state?.device?.id
      }
    })
  } catch (err) {
    // console.log(err)
  }
}

exports.pause = async () => {
  try {
    const player_state = await this.getPlayerState()
    await client.put('/me/player/pause', {
      params: {
        device_id: player_state?.device?.id
      }
    })
  } catch (err) {
    // console.log(err)
  }
}

exports.skipToPrevious = async () => {
  try {
    const player_state = await this.getPlayerState()
    await client.post('/me/player/previous', {
      params: {
        device_id: player_state?.device?.id
      }
    })
  } catch (err) {
    // console.log(err)
  }
}

exports.addToQueue = async (uri) => {
  try {
    const { data } = await client.post('/me/player/queue', null, {
      params: {
        uri
      }
    })
    return data;
  } catch (err) {
    // console.log(err.response.data)
  }
  return null;
}