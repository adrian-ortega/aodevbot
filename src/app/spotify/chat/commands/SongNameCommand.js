const spotify = require("../../../spotify");
const { isEmpty, randomFromArray, isString } = require("../../../support");
const { botMessageReply, replyWithContext } = require("../../../twitch/chat/commands");
const { USER_MESSAGE_COMMAND } = require("../../../twitch/chat/state-keys");

exports.name = () => {
  return ['song', 'song-name', 'sn', 'sr-name']
}

exports.description = 'Will return the name of the currently playing song, if any.';

exports.examples = () => [{
  example: '!song',
  description: 'Does not take any arguments'
}]

exports.options = () => {
  let cmdName = exports.name()
  if(isString(cmdName)) cmdName = cmdName.split(',').map(a => a.trim())
  const [,...aliases] = cmdName

  const cmdTokens = {
    icon: 'The icon selected for the response. You can change which icons are used for Tracks and Liked Tracks.',
    song: 'The song name that is currently playing.',
    artist: 'The name of the artist for the currently playing song'
  }
  return {
    fields: [
      { id: 'offline_response', type: 'text', label: 'Offline Response', help: 'This is the message that displays when nothing is playing, in any player.', tokens: Object.keys(cmdTokens), token_descriptions: cmdTokens },
      { id: 'response', type: 'text', label: 'Response', help: 'Use the provided tokens to create the response when a song is playing.', tokens: Object.keys(cmdTokens), token_descriptions: cmdTokens },
      { id: 'aliases', type: 'aliases', label: 'Aliases' },
      { id: 'response_icons', type: 'text', label: 'Icons', help: 'Comma Separated list of icons to use when a song is in your liked list.'},
      { id: 'response_liked_icons', type: 'text', label: 'Liked Icons', help: 'Comma Separated list of default icons to use'},
    ],
    field_values: {
      offline_response: 'Sorry {name}, it looks like nothing is playing right now.',
      response: '{icon} Playing: {song} | {artist}',
      response_liked_icons: '❤️, 🧡, 💛, 💚, 💙, 💜, 🖤, 🤎, 🤍, 💕',
      response_icons: '🎵, 🎶, 🔊, 🎧',
      aliases,
    }
  }
}

exports.handle = async (message, state, channel, { client }, resolve) => {
  try {
    const {[USER_MESSAGE_COMMAND]: cmd, ...stateContext } = state;
    const data = await spotify.getCurrentlyPlaying();
    if(isEmpty(data)) {
      return client.say(channel, botMessageReply(replyWithContext(cmd.options.offline_response, { ...stateContext })))
    }
    const song = data.item.name;
    const artist = data.item.artists ? data.item.artists.map((artist) => artist.name).join(', ') : '';
    const savedTracks = await spotify.checkSavedTracks(data.item.id);
    const defaultIcons = cmd.options.response_icons.split(',').map(a => a.trim()).filter(a => a);
    const likedIcons = cmd.options.response_liked_icons.split(',').map(a => a.trim()).filter(a => a);
    const icon = savedTracks.length && savedTracks[0]
      ? randomFromArray(likedIcons)
      : randomFromArray(defaultIcons);
    const chatMessage = botMessageReply(replyWithContext(cmd.options.response, { song, artist, icon, ...stateContext }))
    client.say(channel, chatMessage);
    resolve(chatMessage);
  } catch (err) {
    
  }
}