const { botMessageReply } = require('../commands');

const getDayName = (day) => {
  return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][day];
}

exports.name = 'time';
exports.description = 'Shows the current time for the broadcaster.'
exports.handle = (message, state, channel, { client }, resolve) => {
  const time = new Date();
  const hours = time.getHours();
  const minutes = time.getMinutes();
  const day = getDayName(time.getDay());
  const ampm = hours > 12 ? 'PM' : 'AM';

  const h = hours % 12 ? hours % 12 : 12;
  const m = minutes < 10 ? `0${minutes}` : minutes;

  client.say(
    channel,
    botMessageReply(`It is ${day} ${h}:${m} ${ampm} for ${channel}.`)
  ).then(() => resolve());
}