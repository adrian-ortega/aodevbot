const ChatCommandModel = (sequelize, Sequelize) => {
  const { TEXT, INTEGER, STRING, BOOLEAN } = Sequelize;
  const ChatCommand = sequelize.define('chat-command', {
    id: { type: INTEGER, primaryKey: true, autoIncrement: true },
    command_type: { type: INTEGER },
    command_enabled: { type: BOOLEAN },
    command_name: { type: STRING },
    command_reply: { type: TEXT },
    command_options: { type: TEXT }
  });
  return ChatCommand;
};

module.exports = ChatCommandModel;
