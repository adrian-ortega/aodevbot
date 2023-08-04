const { getBroadcaster, getSecondaryBroadcaster } = require("../../broadcaster")

exports.getBroadcaster = async (req, res) => {
  let data;
  try {
    data = await getBroadcaster()
  } catch (error) {
    data = {
      type: 1,
      error: true,
      message: error.message
    }
  }
  res.send(data)
};

exports.getSecondaryBroadcaster = async (req, res) => {
  let data;
  try {
    data = await getSecondaryBroadcaster()
  } catch (error) {
    data = {
      type: 2,
      error: true,
      message: error.message
    }
  }
  res.send(data)
}