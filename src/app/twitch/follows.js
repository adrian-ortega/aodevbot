const log = require("../log");
const logPrefix = "Twitch Follows";
const client = require("./client");
const { getBroadcasterTwitchId } = require("../broadcaster");

const getFollowedChannels = async (
  user_id,
  broadcaster_id = undefined,
  first = undefined,
  after = undefined
) => {
  try {
    const { data } = await client.get('/helix/channels/followed', {
      params: {
        user_id,
        broadcaster_id,
        first,
        after
      }
    })
    return data;
  } catch (err) {
    log.error(
      "Error",
      err.response.data,
      logPrefix,
    );
    return null;
  }
};

module.exports = {
  getFollowedChannels,
};
