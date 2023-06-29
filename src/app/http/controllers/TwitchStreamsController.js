
exports.stream = async (req, res) => {
  const Twitch = require('../../twitch');
  const streams = await Twitch.getBroadcasterStreams();

  return res.send({
    data: streams.find(stream => stream.type === 'live')
  })
}