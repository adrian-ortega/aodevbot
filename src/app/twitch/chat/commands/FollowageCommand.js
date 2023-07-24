const { getBroadcaster, isBroadcaster } = require("../../../broadcaster");
const { isNumeric } = require("../../../support");
const { getTimeDifferenceForHumans } = require("../../../support/time");
const { getUserFollows } = require("../../follows");
const { getUser } = require("../../users");
const { botMessageReply } = require("../commands");
const { USER_ID, USER_MESSAGE_PARAMS } = require("../state-keys");

exports.name = ['followage', 'fa'];

exports.description = 'Displays how long the suer has been following';

exports.handle = async (message, state, channel, { client, commands }, resolve) => {
  let twitch_id = state[USER_ID];
  const broadcaster = await getBroadcaster();
  const broadcaster_name = broadcaster.display_name;

  if (isBroadcaster(twitch_id)) {
    const params = state[USER_MESSAGE_PARAMS];
    if (params[0] && params[0].length) {
      twitch_id = params[0].replace('@', '');
    } else {
      return client.say(channel, botMessageReply(`Listen ${broadcaster_name}... you have to give a VALID username to look for.`))
    }
  }

  const twitch_user = await getUser(twitch_id);
  const twitch_username = twitch_user.display_name;

  if (!isNumeric(twitch_id)) {
    twitch_id = parseInt(twitch_user.id, 10);
  }

  const { data } = await getUserFollows(twitch_id, 1);
  if (!data || data.length === 0) {
    chatMessage = `Hmmm, It looks like that follower doesn't exist or they don't follow @${broadcaster_name}`;
  } else {
    const followed_at = new Date(data[0].followed_at);
    const followed_at_formatted = followed_at.toLocaleDateString('en-us', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
    const follow_length = getTimeDifferenceForHumans(followed_at, new Date());

    chatMessage = `@${twitch_username} has been following @${broadcaster_name} since ${followed_at_formatted}. They've been following for ${follow_length}`;
  }

  client.say(channel, botMessageReply(chatMessage));

  return resolve(chatMessage);
}