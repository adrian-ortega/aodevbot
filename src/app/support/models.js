const { KeyValue } = require("../models")

const updateOrCreateKeyValue = (values, where) => {
  return KeyValue.findOne({ where }).then((obj) => obj ? obj.update(values) : KeyValue.create(values))
}

module.exports = {
  updateOrCreateKeyValue,
}