const { getBroadcaster, isBroadcaster } = require("../../../broadcaster");
const { isNumeric, isString } = require("../../../support");
const { getTimeDifferenceForHumans } = require("../../../support/time");
const { getFollowedChannels } = require("../../follows");
const { getUser, getUserFollowers } = require("../../users");
const { botMessageReply, replyWithContext } = require("../commands");
const { USER_ID, USER_MESSAGE_PARAMS, USER_ROOM_ID, USER_MESSAGE_COMMAND } = require("../state-keys");

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
  const broadcaster = await getBroadcaster();
  const broadcaster_name = broadcaster.display_name;
  const {[USER_MESSAGE_COMMAND]: cmd, ...stateContext } = state;
  let twitch_id = state[USER_ID];
  let chatMessage, chatContext = { ...stateContext };

  if (isBroadcaster(twitch_id)) {
    const params = state[USER_MESSAGE_PARAMS];
    if (params[0] && params[0].length) {
      const twitch_user = await getUser(params[0].replace("@", ""));
      twitch_id = twitch_user.id
    } else {
      return client.say(
        channel,
        botMessageReply(
          `Listen ${broadcaster_name}... you have to give a VALID username to look for.`,
        ),
      );
    }
  }

  const { data } = await getUserFollowers(1, null, twitch_id);
  if (!data || data.length === 0) {
    chatMessage = `Hmmm, It looks like that follower doesn't exist or they don't follow {broadcaster_name}`;
  } else {
    const followed_at = new Date(data[0].followed_at);
    const followed_at_formatted = followed_at.toLocaleDateString("en-us", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
    const follow_length = getTimeDifferenceForHumans(followed_at, new Date());
    chatContext = {
      broadcaster_name,
      followed_at,
      followed_at_formatted,
      follow_length,
      ...stateContext
    }
    chatMessage = cmd.options.response;
  }

  client.say(channel, botMessageReply(replyWithContext(chatMessage, chatContext)));
  resolve(chatMessage);
};
