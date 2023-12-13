const spotify = require("../../../spotify");
const { USER_DISPLAY_NAME } = require("../../../twitch/chat/state-keys");

exports.name = () => {
  return ['song', 'song-name', 'sn', 'sr-name']
}

exports.description = 'Will return the name of the currently playing song, if any.';

exports.examples = () => [{
  example: '!song',
  description: 'Does not take any arguments'
}]

exports.handle = async (message, state, channel, { client }, resolve) => {
  try {
    const username = state[USER_DISPLAY_NAME];
    const data = await spotify.getCurrentlyPlaying();
    console.log(username, data)
  } catch (err) {
    
  }
}