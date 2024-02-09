const { Sequelize, Chat, Chatters, ChatCommands } = require("../../../models");
const { isString } = require("../../../support");
const { botMessageReply, replyWithContext } = require("../commands");
const { USER_ID, USER_MESSAGE_COMMAND } = require("../state-keys");

exports.name = () => ["chat-count", "chatted", "chatcount", "chat count"];
exports.description = 'Returns a message containing the amount of times a user has ever chatted on the broadcaster\'s stream';
exports.handle = async (message, state, channel, { client }, resolve) => {
  const {[USER_MESSAGE_COMMAND]: cmd, ...stateContext } = state;
  let chatMessage, chatContext = { count: 0, ...stateContext };
  const twitch_id = state[USER_ID];
  const chatterResults = await Chatters.findAll({
    where: {
      twitch_id,
    },
    attributes: [
      [Sequelize.fn("COUNT", Sequelize.col("chats.id")), "chatCount"],
    ],
    include: {
      model: Chat,
      attributes: [],
    },
    group: ["chatter.id"],
  });

  if (chatterResults.length > 0) {
    const Chatter = chatterResults.shift();
    chatContext.count = parseInt(Chatter.getDataValue("chatCount")).toLocaleString();;
    chatMessage = cmd.options.response;
  } else {
    chatMessage = 'Oops! something went wrong, {name}. Please try again.';
  }

  chatMessage = botMessageReply(replyWithContext(chatMessage, chatContext))
  client.say(channel, chatMessage);
  resolve(chatMessage);
};
exports.options = () => {
  let cmdName = exports.name()
  if(isString(cmdName)) cmdName = cmdName.split(',').map(a => a.trim())
  const [,...aliases] = cmdName
  const cmdTokens = {
    count: 'How many times the requester has chatted'
  }
  return {
    fields: [
      { id: 'response', type: 'text', label: 'Response', help: 'Use the provided tokens to create the response when a song is playing.', tokens: Object.keys(cmdTokens), token_descriptions: cmdTokens },
      { id: 'aliases', type: 'aliases', label: 'Aliases' },
    ],
    tokens: ['count'],
    field_values: {
      response: `you've chatted {count} times {name}!!!`,
      aliases
    }
  }
}