const log = require('../log');
const { getBroadcaster } = require('../broadcaster');
const { pregMatchAll } = require('../support/strings');
const client = require('./client');

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

module.exports = {
  getStreamId,
  getStreams,
  getBroadcasterStreams
}
