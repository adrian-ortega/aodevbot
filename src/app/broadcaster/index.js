const { isNumeric } = require("../support");
const { Chatters } = require("../models");

const PRIMARY_BROADCASTER = 1;
const SECONDARY_BROADCASTER = 2;

/**
 * @returns {Chatters}
 * @throws {Error}
 */
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

/**
 * @returns {Chatters|null}
 */
const getBroadcasterOrNull = async () => {
  try {
    return await getBroadcaster();
  } catch (err) {
    return null;
  }
}

/**
 * @returns {Chatters}
 * @throws {Error}
 */
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

/**
 * @returns {Chatters|null}
 */
const getSecondaryBroadcasterOrNull = async () => {
  try {
    return await getSecondaryBroadcaster();
  } catch (err) {
    return null;
  }
}

/**
 * @returns {String|null}
 * @throws {Error}
 */
const getBroadcasterTwitchId = async () => (await getBroadcaster()).twitch_id;

/**
 * @param {String|Number} twitch_id_or_usename 
 * @returns {Boolean}
 * @TODO Should this check the secondary account as well?
 */
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
  getBroadcasterOrNull,
  getBroadcasterTwitchId,
  isBroadcaster,

  getSecondaryBroadcaster,
  getSecondaryBroadcasterOrNull
};
