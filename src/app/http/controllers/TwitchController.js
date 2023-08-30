exports.getUser = async (req, res) => {
  const { username } = req.params;
  const Twitch = require("../../twitch");
  const data = await Twitch.getUser(username);
  res.send({ data });
};

exports.getChatters = async (req, res) => {
  const Twitch = require("../../twitch");
  const { data } = await Twitch.getStreamChatters();
  return res.send({ data });
};
