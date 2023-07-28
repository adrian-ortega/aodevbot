const { getBroadcaster } = require("../../broadcaster")

exports.index = async (req, res) => {
  res.send(await getBroadcaster());
};