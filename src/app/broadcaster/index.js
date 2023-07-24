const { isNumeric } = require('../support')
const { Chatters } = require('../models');

const getBroadcaster = async () => {
  const Broadcaster = await Chatters.findOne({ where: { broadcaster: true } });
  if (!Broadcaster) {
    throw new Error('No broadcaster!')
  }
  return Broadcaster;
}

const getBroadcasterTwitchId = async () => (await getBroadcaster()).twitch_id;

const isBroadcaster = async (twitch_id_or_usename) => {
  const Broadcaster = await getBroadcaster();
  return isNumeric(twitch_id_or_usename)
    ? Broadcaster.twitch_id === twitch_id_or_usename
    : Broadcaster.username === twitch_id_or_usename || Broadcaster.display_name === twitch_id_or_usename
}

module.exports = {
  getBroadcaster,
  getBroadcasterTwitchId,
  isBroadcaster
}