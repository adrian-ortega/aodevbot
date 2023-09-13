const log = require("../log");
const logPrefix = "Spotify Tracks";
const client = require("./client");
const { arrayWrap } = require("../support");

exports.getTracks = async (ids) => {

  try {
    return client.get('/tracks', {
      params: {
        ids: arrayWrap(ids).map(id => id.replace('spotify:track:', '')).join(','),
        market: 'US'
      }
    })
  } catch (err) {
    log.error('getTracks', {
      message: err.message,
      data: err.response && err.response.data ? err.response.data : {}
    }, logPrefix)
  }

  return null;
}

exports.checkSavedTracks = (ids) => {
  try {
    return client.get('/me/tracks/contains', {
      params: {
        ids: arrayWrap(ids).join(',')
      }
    })
  } catch (err) {
    log.error('checkSavedTracks', {
      message: err.message,
      data: err.response && err.response.data ? err.response.data : {}
    }, logPrefix)
  }
}