const { getBroadcaster, isBroadcaster } = require("../../../broadcaster");
const { isNumeric, isString } = require("../../../support");
const { getTimeDifferenceForHumans } = require("../../../support/time");
const { getUserFollows } = require("../../follows");
const { getUser } = require("../../users");
const { botMessageReply } = require("../commands");
const { USER_ID, USER_MESSAGE_PARAMS } = require("../state-keys");

exports.name = () => ["followage", "fa"];

exports.description = "Displays how long the user has been following";

exports.examples = () => ([{
  example: '!followage',
  description: 'The default usage will return the requesters follow-age.'
}, {
  description: 'The broadcaster can pass a twitch id or twitch username to check the follow-age.',
  example: `!followage <twitch_id|twitch_username>
!followage @mnmmia
`
}])

exports.options = () => {
  let cmdName = exports.name()
  if(isString(cmdName)) cmdName = cmdName.split(',').map(a => a.trim())
  const [,...aliases] = cmdName
  const cmdTokens = {
    followed_at: 'The follow date.',
    followed_at_formatted: 'The human readable date when the requested user followed the broadcaster.',
    follow_length: 'Human readable follow length.'
  }
  return {
    fields: [
      { id: 'response', type: 'text', label: 'Response', help: 'Use the provided tokens to create the response template.', tokens: Object.keys(cmdTokens), token_descriptions: cmdTokens },
      { id: 'aliases', type: 'aliases', label: 'Aliases' },
    ],
    field_values: {
      response: '@{name} has been following @{broadcaster_name} since {followed_at_formatted}. They\'ve been following for {follow_length}',
      aliases
    }
  }
}

exports.handle = async (
  message,
  state,
  channel,
  { client, commands },
  resolve,
) => {
  let twitch_id = state[USER_ID];
  let chatMessage;
  const broadcaster = await getBroadcaster();
  const broadcaster_name = broadcaster.display_name;

  if (isBroadcaster(twitch_id)) {
    const params = state[USER_MESSAGE_PARAMS];
    if (params[0] && params[0].length) {
      twitch_id = params[0].replace("@", "");
    } else {
      return client.say(
        channel,
        botMessageReply(
          `Listen ${broadcaster_name}... you have to give a VALID username to look for.`,
        ),
      );
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
    const followed_at_formatted = followed_at.toLocaleDateString("en-us", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
    const follow_length = getTimeDifferenceForHumans(followed_at, new Date());

    chatMessage = `@${twitch_username} has been following @${broadcaster_name} since ${followed_at_formatted}. They've been following for ${follow_length}`;
  }

  client.say(channel, botMessageReply(chatMessage));

  return resolve(chatMessage);
};
