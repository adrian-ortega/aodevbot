const { Sequelize, Chat, Chatters } = require("../../../models");
const { botMessageReply } = require("../commands");
const { USER_ID, USER_DISPLAY_NAME } = require("../state-keys");

exports.name = ["chat-count", "chatted", "chatcount", "chat count"];
exports.handle = async (message, state, channel, { client }, resolve) => {
  let chatMessage;
  const twitch_id = state[USER_ID];
  const chatterResults = await Chatters.findAll({
    where: {
      twitch_id,
    },
    attributes: [
      [Sequelize.fn("COUNT", Sequelize.col("Chats.id")), "chatCount"],
    ],
    include: {
      model: Chat,
      attributes: [],
    },
    group: ["Chatter.id"],
  });

  if (chatterResults.length > 0) {
    const Chatter = chatterResults.shift();
    const count = parseInt(Chatter.getDataValue("chatCount")).toLocaleString();
    chatMessage = `you've chatted ${count} times ${state[USER_DISPLAY_NAME]}!!!`;
  } else {
    chatMessage = `Oops! something went wrong, ${state[USER_DISPLAY_NAME]}. Please try again.`;
  }

  client.say(channel, botMessageReply(chatMessage));
  resolve(chatMessage);
};
