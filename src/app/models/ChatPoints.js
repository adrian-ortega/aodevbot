const ChatPointsModel = (sequelize, Sequelize) => {
  const { Chatter } = sequelize.models;
  const { BIGINT, INTEGER, STRING } = Sequelize;
  const ChatPoints = sequelize.define('ChatPoints', {
    id: { type: INTEGER, primaryKey: true, autoIncrement: true },
    stream_id: { type: BIGINT },
    chatter_id: { type: BIGINT },
    points: { type: INTEGER, defaultValue: 0 },
    note: { type: STRING }
  });

  ChatPoints.Chatter = ChatPoints.belongsTo(Chatter, { foreignKey: 'chatter_id', as: 'chatter' });
  Chatter.ChatPoints = Chatter.hasMany(ChatPoints, { foreignKey: 'chatter_id' });

  return ChatPoints;
};

module.exports = ChatPointsModel;
