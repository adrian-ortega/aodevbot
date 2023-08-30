const { isBroadcaster, getBroadcaster } = require("../../../broadcaster");
const { botMessageReply } = require("../commands");
const {
  USER_ID,
  USER_DISPLAY_NAME,
  USER_MESSAGE_PARAMS,
  USER_CUSTOM_REWARD_ID,
} = require("../state-keys");

exports.private = true;
exports.name = "redeem";
exports.description = "Only used for testing Redeem Events";

exports.handle = async (
  message,
  state,
  channel,
  { client, events },
  resolve,
) => {
  if (!isBroadcaster(state[USER_ID])) {
    const broadcaster = await getBroadcaster();
    return client.say(
      channel,
      botMessageReply(
        `I'm sorry @${state[USER_DISPLAY_NAME]}, this can only be done by @${broadcaster.display_name}`,
      ),
    );
  }

  const [redeemableID] = state[USER_MESSAGE_PARAMS];
  state[USER_CUSTOM_REWARD_ID] = redeemableID;
  events.maybeRun(channel, state, `Redeeming Custom Reward`);
};
