const log = require("../log");
const logPrefix = "Spotify Tracks";
const client = require("./client");
const { arrayWrap } = require("../support");

exports.validateTrackIDs = (ids) => {
  const isValid = (id) => {
    if (
      // Spotify Track IDs are 22-character alphanumeric strings
      id.length !== 22

      // Check if the string contains only alphanumeric characters
      || !/^[a-zA-Z0-9]+$/.test(id)

      // // Check if the string starts with "spotify:track:"
      //  || !id.startsWith("spotify:track:")
    ) {
      return false;
    }
    return true;
  }
  ids = arrayWrap(ids);
  for (let i = 0; i < ids.length; i++) {
    if (!isValid(ids[i])) return false;
  }
  return true;
}

exports.getTracks = async (ids) => {

  try {
    const { data } = await client.get('/tracks', {
      params: {
        ids: arrayWrap(ids).map(id => id.replace('spotify:track:', '')).join(','),
        market: 'US'
      }
    });
    return data.tracks;
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