const ChatPointsModel = (sequelize, Sequelize) => {
  const { Chatter } = sequelize.models;
  const { BIGINT, INTEGER, STRING } = Sequelize;
  const ChatPoints = sequelize.define('ChatPoints', {
    id: { type: INTEGER, primaryKey: true, autoIncrement: true },
    stream_id: { type: BIGINT },
    chatter_id: { type: BIGINT },
    points: { type: INTEGER },
    note: { type: STRING }
  });

  ChatPoints.belongsTo(Chatter, { foreignKey: 'chatter_id', as: 'chatter' });

  return ChatPoints;
};

module.exports = ChatPointsModel;
