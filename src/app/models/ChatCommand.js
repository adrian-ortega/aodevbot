const { isString, isObject, isArray } = require("../support");

const ChatCommandModel = (sequelize, Sequelize) => {
  const { TEXT, INTEGER, STRING, BOOLEAN } = Sequelize;
  const ChatCommand = sequelize.define('chat-command', {
    id: { type: INTEGER, primaryKey: true, autoIncrement: true },
    type: { type: INTEGER },
    enabled: { type: BOOLEAN },
    name: { type: STRING },
    description: { type: TEXT },
    response: { type: TEXT },
    options: {
      type: TEXT,
      get() {
        const value = this.getDataValue('options');
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
    const opts = command.options;
    if (!isString(opts) && (isObject(opts) || isArray(opts))) {
      command.options = JSON.stringify(opts);
    }
  });

  return ChatCommand;
};

module.exports = ChatCommandModel;
