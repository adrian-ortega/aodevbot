const log = require('../log');
const logPrefix = 'Twitch Clips'
const client = require('./client');

exports.getUserClips = async (broadcaster_id, first = 20) => {
  try {
    const { data } = await client.get('/helix/clips', { params: { broadcaster_id, first } })
    return data.data
  } catch (err) {
    log.error('getUserClips', { message: err.message }, logPrefix);
  }

  return null;
}