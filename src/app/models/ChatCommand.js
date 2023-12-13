const { isString, isObject, isArray } = require("../support");

const ChatCommandModel = (sequelize, Sequelize) => {
  const { TEXT, INTEGER, STRING, BOOLEAN } = Sequelize;
  const ChatCommand = sequelize.define("chat-command", {
    id: { type: INTEGER, primaryKey: true, autoIncrement: true },
    type: { type: INTEGER },
    enabled: { type: BOOLEAN },
    count: { type: INTEGER, defaultValue: 0 },
    name: { type: STRING },
    description: { type: TEXT },
    response: { type: TEXT },
    settings: {
      type: TEXT,
      get () {
        const value = this.getDataValue("settings");
        try {
          const data = JSON.parse(value);
          return data;
        } catch (err) {
          return value;
        }
      }
    },
    options: {
      type: TEXT,
      get() {
        const value = this.getDataValue("options");
        try {
          const data = JSON.parse(value);
          return data;
        } catch (err) {
          return value;
        }
      },
    },
  });

  ChatCommand.beforeValidate(async (command, options) => {
    const opts = command.options;
    if (!isString(opts) && (isObject(opts) || isArray(opts))) {
      command.options = JSON.stringify(opts);
    }

    const settings = command.settings;
    if (!isString(settings) && (isObject(settings) || isArray(settings))) {
      command.settings = JSON.stringify(settings);
    }
  });

  return ChatCommand;
};

module.exports = ChatCommandModel;
