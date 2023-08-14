const ChatModel = (sequelize, Sequelize) => {
  const Chatter = sequelize.models.chatter
  const { STRING, BIGINT, INTEGER, TEXT } = Sequelize
  const Chat = sequelize.define('chat', {
    id: { type: INTEGER, primaryKey: true, autoIncrement: true },
    stream_id: { type: BIGINT },
    twitch_id: { type: INTEGER },
    message_type: { type: STRING },
    message_content: { type: TEXT }
  })

  Chatter.Chats = Chatter.hasMany(Chat, {
    sourceKey: 'twitch_id',
    foreignKey: 'twitch_id'
  })

  Chat.Chatter = Chat.belongsTo(Chatter, {
    sourceKey: 'twitch_id',
    foreignKey: 'twitch_id'
  })

  return Chat
}

module.exports = ChatModel
