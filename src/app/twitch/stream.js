const log = require('../log')
const client = require('./client')
const { FIVE_MINUTES } = require('../support/time')
const { pregMatchAll } = require('../support/strings')
const { getBroadcaster } = require('../broadcaster')
const { Streams, Games } = require('../models')

const getStreams = async (user_login) => {
  try {
    const { data } = await client.get('/helix/streams', {
      params: {
        first: 1,
        user_login
      }
    })
    return data
  } catch (err) {
    log.error('getStreams', { err }, 'Twitch Streams')
  }

  return { data: [], pagination: [] }
}

const getBroadcasterStreams = async (single = false) => {
  const broadcaster = await getBroadcaster()
  const { data } = await getStreams(broadcaster.username)
  const streams = data.map((stream) => {
    if (stream.title) {
      stream.title_tags = pregMatchAll(/(?:^|\s)#(\w+)/, stream.title)
    }
    return stream
  })

  return single ? streams[0] : streams
}

const getStreamId = async () => {
  const stream = await getBroadcasterStreams(true)
  return stream ? stream.id : null
}

let syncing = false
const syncStream = async () => {
  if (syncing) {
    return false
  }

  syncing = true
  const stream = await getBroadcasterStreams(true)
  if (!stream || !stream.id) {
    return
  }

  const Stream = await Streams.findOrCreate({
    where: {
      stream_id: stream.id,
      game_id: stream.game_id,
      title: stream.title
    },
    defaults: {
      stream_id: stream.id,
      game_id: stream.game_id,
      title: stream.title,
      started_at: stream.started_at
    }
  })

  const Game = await Games.findOrCreate({
    where: {
      game_id: stream.game_id
    },
    defaults: {
      game_id: stream.game_id,
      game_name: stream.game_name
    }
  })

  syncing = false

  // @TODO implement counters;
}

const getStreamChatters = async () => {
  try {
    const broadcaster = await getBroadcaster()
    const { data } = await client.get(`/helix/chat/chatters`, {
      params: {
        broadcaster_id: broadcaster.twitch_id,
        moderator_id: broadcaster.twitch_id
      }
    })
    return data
  } catch (err) {
    log.error('getStreamChatters', { message: err.message }, 'Twitch Streams')
  }

  return []
}

const getSubscriptions = async (broadcaster_id, after = null) => {
  try {
    const params = {
      broadcaster_id,
      fitst: 100
    }

    if (after) {
      params.after = after
    }
    const { data } = await client.get('/helix/subscriptions', { params })
    return data
  } catch (err) {
    log.error('getSubscriptions', { message: err.message }, 'Twitch Streams')
  }
  return []
}

const getBroadcasterSubscribers = async () => {
  try {
    const broadcaster = await getBroadcaster()
    let response = await getSubscriptions(broadcaster.twitch_id)
    let data = [...response.data]
    while (response.pagination.cursor) {
      response = await getSubscriptions(broadcaster.twitch_id, response.pagination.cursor)
      data = [...response.data]
    }
    return data
  } catch (err) {
    log.error('getStreamChatters', { message: err.message }, 'Twitch Streams')
  }
  return []
}

let streamSyncId

const initStreamSync = () => {
  const sync = async () =>
    syncStream().then(() => {
      streamSyncId = setTimeout(sync, FIVE_MINUTES)
    })
  clearTimeout(streamSyncId)
  sync()
}

module.exports = {
  initStreamSync,
  getStreamId,
  getStreams,
  getStreamChatters,
  getBroadcasterSubscribers,
  getBroadcasterStreams,
  syncStream
}
