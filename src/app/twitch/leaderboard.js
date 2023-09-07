const log = require('../log');
const logPrefix = 'Twitch Leaderboard';
const client = require('./client');

const getBitsLeaderboard = async ({
  count = 10,
  period = 'all',
  user_id,
  started_at
}) => {
  try {
    const { data: responseData } = await client.get('/helix/bits/leaderboard', {
      params: { count, period, started_at, user_id }
    })
    return responseData;
  } catch (err) {
    log.error('getBitsLeaderboard', {
      message: err.message
    }, logPrefix)
  }
}

module.exports = {
  getBitsLeaderboard
}