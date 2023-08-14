const log = require('../log')
const logPrefix = 'Twitch Users'
const client = require('./client')

const getUser = async (id) => {
  try {
    const params = { first: 1, id: null }
    if (id) {
      if (isNaN(id)) {
        params.login = id
      } else {
        params.id = id
      }
    }
    const { data: responseData } = await client.get('/helix/users', { params })
    const { data } = responseData
    return data.length > 0 ? data[0] : null
  } catch (err) {
    log.error(
      'Twitch.getUser error',
      {
        message: err.message
      },
      logPrefix
    )
  }

  return null
}

module.exports = {
  getUser
}
