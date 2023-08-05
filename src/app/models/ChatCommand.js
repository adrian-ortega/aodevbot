const { isString, isObject, isArray } = require("../support");

const ChatCommandModel = (sequelize, Sequelize) => {
  const { TEXT, INTEGER, STRING, BOOLEAN } = Sequelize;
  const ChatCommand = sequelize.define('chat-command', {
    id: { type: INTEGER, primaryKey: true, autoIncrement: true },
    command_type: { type: INTEGER },
    command_enabled: { type: BOOLEAN },
    command_name: { type: STRING },
    command_reply: { type: TEXT },
    command_options: {
      type: TEXT,
      get() {
        const value = this.getDataValue('command_options');
        try {
          const data = JSON.parse(value);
          return data;
        } catch (err) {
          return value;
        }
      }
    }
  });

  ChatCommand.beforeValidate(async (command, options) => {
    const opts = command.command_options;
    if (!isString(opts) && (isObject(opts) || isArray(opts))) {
      command.command_options = JSON.stringify(opts);
    }
  });

  return ChatCommand;
};

module.exports = ChatCommandModel;
