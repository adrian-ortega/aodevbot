const { Chatters } = require('../models');

exports.getBroadcaster = async () => {
  const Broadcaster = await Chatters.findOne({ where: { broadcaster: true } });
  if (!Broadcaster) {
    throw new Error('No broadcaster!')
  }
  return Broadcaster;
}
