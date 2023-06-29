const log = require('../log');
const { getBroadcaster } = require('../broadcaster');
const { pregMatchAll } = require('../support/strings');
const client = require('./client');
const { Streams, Games } = require('../models');

const getStreams = async (user_login) => {
  try {
    const { data } = await client.get('/helix/streams', {
      params: {
        first: 1,
        user_login
      }
    });
    return data;
  } catch (err) {
    log.error('getStreams', { err }, 'Twitch Streams')
  }

  return { data: [], pagination: [] };
};

const getBroadcasterStreams = async (single = false) => {
  const broadcaster = await getBroadcaster();
  const { data } = await getStreams(broadcaster.username);
  const streams = data.map(stream => {
    if (stream.title) {
      stream.title_tags = pregMatchAll(/(?:^|\s)#(\w+)/, stream.title);
    }
    return stream;
  });

  return single ? streams[0] : streams;
};

const getStreamId = async () => {
  const stream = await getBroadcasterStreams(true);
  return stream ? stream.id : null;
};

let syncing = false;
const syncStream = async () => {
  if (syncing) {
    // @TODO wait and retry?
    return;
  }

  syncing = true;
  log.debug('Syncing', null, 'Twitch Streams');
  const stream = await getBroadcasterStreams(true);
  if (!stream || !stream.id) {
    log.warn('Stream is not live', null, 'Twitch Streams');
  };

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
      started_at: stream.started_at,
    }
  });

  const Game = await Games.findOrCreate({
    where: {
      game_id: stream.game_id,
    },
    defaults: {
      game_id: stream.game_id,
      game_name: stream.game_name,
    }
  });

  syncing = false;
  // @TODO implement counters;
};

module.exports = {
  getStreamId,
  getStreams,
  getBroadcasterStreams,
  syncStream,
}
