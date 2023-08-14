const { isNumeric } = require("../support");
const { Chatters } = require("../models");

const PRIMARY_BROADCASTER = 1;
const SECONDARY_BROADCASTER = 2;

const getBroadcaster = async () => {
  const Broadcaster = await Chatters.findOne({
    where: {
      broadcaster: PRIMARY_BROADCASTER,
    },
  });
  if (!Broadcaster) {
    throw new Error("Primary broadcaster does not exist");
  }
  return Broadcaster;
};

const getSecondaryBroadcaster = async () => {
  const Broadcaster = await Chatters.findOne({
    where: {
      broadcaster: SECONDARY_BROADCASTER,
    },
  });
  if (!Broadcaster) {
    throw new Error("Secondary broadcaster does not exist");
  }
  return Broadcaster;
};

const getBroadcasterTwitchId = async () => (await getBroadcaster()).twitch_id;

const isBroadcaster = async (twitch_id_or_usename) => {
  const Broadcaster = await getBroadcaster();
  return isNumeric(twitch_id_or_usename)
    ? Broadcaster.twitch_id === twitch_id_or_usename
    : Broadcaster.username === twitch_id_or_usename ||
        Broadcaster.display_name === twitch_id_or_usename;
};

module.exports = {
  PRIMARY_BROADCASTER,
  SECONDARY_BROADCASTER,
  getBroadcaster,
  getBroadcasterTwitchId,
  isBroadcaster,

  getSecondaryBroadcaster,
};
