const { isObject } = require("../support");

const KeyValueModel = (sequelize, Sequelize) => {
  const { TEXT, INTEGER, STRING } = Sequelize;
  const KeyValue = sequelize.define("key-value", {
    id: { type: INTEGER, primaryKey: true, autoIncrement: true },
    item_key: { type: STRING },
    item_value: {
      type: TEXT,
      get() {
        return JSON.parse(this.getDataValue("item_value"));
      },
      set(value) {
        this.setDataValue("item_value", JSON.stringify(value));
      },
    },
  });
  return KeyValue;
};

module.exports = KeyValueModel;
