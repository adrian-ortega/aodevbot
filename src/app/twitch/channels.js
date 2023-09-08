const { isNumeric } = require("../support")
const { getUser } = require("./users");
const client = require('./client')

exports.getChannelInformation = async (broadcaster_id) => {
  try {
    if (!isNumeric(broadcaster_id)) {
      const user = await getUser(broadcaster_id);
      if (!user) {
        throw new Error('User not found')
      }
      broadcaster_id = user.id;
    }

    const { data } = await client.get('/helix/channels', {
      params: { broadcaster_id }
    })
    return data.data[0];
  } catch (err) {
    // console.log(err)
  }
  return null;
}