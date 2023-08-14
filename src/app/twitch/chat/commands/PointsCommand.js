const { Chatters } = require("../../../models");
const { USER_DISPLAY_NAME, USER_ID } = require("../state-keys");

exports.name = () => {
  return ["points", "pt"];
};

exports.handle = async (
  message,
  state,
  channel,
  { client, commands },
  resolve,
) => {
  // @TODO if broadcaster or mod runs this command, the username option is available
  //       Example: !pt <username>                   -> Gets points for user
  //                !points <username>
  //
  //       Example: !pt <username> <amount_to_award> -> Awards points to user

  const twitch_id = state[USER_ID];
  const display_name = state[USER_DISPLAY_NAME];

  // @TODO Implement suggested_action, this will check the amount of points and grab
  //       a random action from a dictionary of actions users can run using their
  //       points.
  //
  const suggested_action = "";

  const Chatter = await Chatters.findOne({
    where: {
      twitch_id,
    },
  });
  const points = parseInt(Chatter.points).toLocaleString();
  let reply;
  await client.say(
    channel,
    (reply = commands.botMessageReply(
      `Hello @${display_name}, you have ${points} points.${suggested_action}`,
    )),
  );
  resolve(reply);
};
