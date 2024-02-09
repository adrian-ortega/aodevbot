const ChatCommandModel = (sequelize, Sequelize) => {
  const { TEXT, INTEGER, STRING, BOOLEAN, JSON } = Sequelize;
  const ChatCommand = sequelize.define("chat-command", {
    id: { type: INTEGER, primaryKey: true, autoIncrement: true },
    type: { type: INTEGER },
    enabled: { type: BOOLEAN },
    count: { type: INTEGER, defaultValue: 0 },
    name: { type: STRING },
    description: { type: TEXT },
    response: { type: TEXT },
    settings: { type: JSON },
    options: { type: JSON },
  });

  return ChatCommand;
};

module.exports = ChatCommandModel;
