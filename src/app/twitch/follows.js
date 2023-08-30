const log = require("../log");
const logPrefix = "Twitch Follows";
const client = require("./client");
const { getBroadcasterTwitchId } = require("../broadcaster");

const getUserFollows = async (
  from_id,
  first = 100,
  after = null,
  isBroadcaster = false,
) => {
  try {
    let to_id = await getBroadcasterTwitchId();
    if (from_id === to_id) {
      to_id = null;
    }

    if (isBroadcaster) {
      to_id = from_id;
      from_id = null;
    }

    const params = { from_id, first, to_id, after };
    const { data: responseData } = await client.get("/helix/users/follows", {
      params,
    });
    return responseData;
  } catch (err) {
    log.error(
      "Error",
      {
        message: err.message,
      },
      logPrefix,
    );
  }
};

module.exports = {
  getUserFollows,
};
