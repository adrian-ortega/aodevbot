const ChatModel = (sequelize, Sequelize) => {
  const { Chatter, Stream } = sequelize.models;
  const { STRING, INTEGER, TEXT } = Sequelize;
  const Chat = sequelize.define('Chat', {
    chatter_id: { type: INTEGER },
    stream_id: { type: INTEGER },
    message_type: { type: STRING },
    message_content: { type: TEXT }
  });

  Chat.belongsTo(Chatter, { foreign_key: 'chatter_id' });
  Chat.belongsTo(Stream, { foreign_key: 'stream_id' });

  return Chat;
};

module.exports = ChatModel;