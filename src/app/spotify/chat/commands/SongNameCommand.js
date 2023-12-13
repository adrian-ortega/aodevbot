const spotify = require("../../../spotify");
const { isEmpty, randomFromArray } = require("../../../support");
const { botMessageReply } = require("../../../twitch/chat/commands");
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
    if(isEmpty(data)) {
      return client.say(channel, `Sorry ${username}, it looks like nothing is playing right now.`)
    }
    const song = data.item.name;
    const artist = data.item.artists ? ` | ${data.item.artists.map((artist) => artist.name).join(', ')}` : '';
    const savedTracks = await spotify.checkSavedTracks(data.item.id);
    const icon = savedTracks.length && savedTracks[0]
      ? randomFromArray(['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤎', '🤍', '💕'])
      : randomFromArray(['🎵', '🎶', '🔊', '🎧']);
    client.say(channel, botMessageReply(`${icon} Playing: ${song}${artist}`));
  } catch (err) {
    
  }
}