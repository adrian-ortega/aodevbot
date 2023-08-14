const log = require('../log')
const client = require('./client')

exports.getEventSubscriptions = async () => {
  try {
    const { data } = await client.get('/helix/eventsub/subscriptions')
    return data
  } catch (err) {
    log.error(
      'getEventSubscriptions',
      {
        message: err.message
      },
      'Twitch'
    )
  }
  return null
}
