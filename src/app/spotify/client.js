const axios = require('axios')
const instance = axios.create({
  baseURL: 'https://api.spotify.com/v1'
})

// @TODO add token interceptors, see /app/twitch/client

module.exports = instance