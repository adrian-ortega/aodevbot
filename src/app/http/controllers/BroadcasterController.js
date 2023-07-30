const { getBroadcaster, getSecondaryBroadcaster } = require("../../broadcaster")

exports.getBroadcaster = async (req, res) => {
  let data;
  try {
    data = await getBroadcaster()
  } catch (error) {
    data = { error: true, message: error.message }
  }
  res.send(data)
};

exports.getSecondaryBroadcaster = async (req, res) => {
  let data;
  try {
    data = await getSecondaryBroadcaster()
  } catch (error) {
    data = { error: true, message: error.message }
  }
  res.send(data)
}