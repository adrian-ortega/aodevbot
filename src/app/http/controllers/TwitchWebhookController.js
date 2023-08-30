//
// @TODO THIS WAS STARTED BUT CANNOT WORK WITHOUT A
//       LIVE SERVER
//

// const handleWebhookCallbackVerification = () => {};

// const handleNotification = () => {};
// const handleRevocation = () => {};
// const successMethod = () => {};
// const missingMethod = () => {};

exports.status = async (req, res) => {
  const Twitch = require("../../twitch");
  return res.send({
    data: await Twitch.getEventSubscriptions(),
  });
};

exports.handleWebhook = (req) => {
  const payload = req.body;
  const messageType = req.headers["twitch-eventsub-message-type"];
  const messageId = req.headers["twitch-eventsub-message-id"];
  const retries = parseInt(req.headers["twitch-eventsub-message-retry"], 10);
  const timestamp = "";
  console.log({
    payload,
    messageId,
    messageType,
    retries,
    timestamp,
  });
};
