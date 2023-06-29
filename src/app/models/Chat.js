const ChatModel = (sequelize, Sequelize) => {
  const { Chatter, Stream } = sequelize.models;
  const { STRING, BIGINT, INTEGER, TEXT } = Sequelize;
  const Chat = sequelize.define('Chat', {
    id: { type: INTEGER, primaryKey: true, autoIncrement: true },
    stream_id: { type: BIGINT },
    chatter_id: { type: INTEGER },
    message_type: { type: STRING },
    message_content: { type: TEXT }
  });

  Chat.belongsTo(Chatter, { foreignKey: 'chatter_id', as: 'chatter' });
  Chat.belongsTo(Stream, { foreignKey: 'stream_id', as: 'stream' });

  return Chat;
};

module.exports = ChatModel;