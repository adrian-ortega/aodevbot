
const { EMOJI_NUMBERS, stringFormat } = require("../../../../support/strings");
const { SR_RESULT_LINE, SR_PICK_A_RESULT, SR_RESULT_NONE } = require("../../locale");
const { search: spotifySearch } = require("../../../search");
const { botMessageReply } = require("../../../../twitch/chat/commands");

// @TODO Implement this
const isUnavailable = () => {
  return false;
}

const searchSpotifyTracks = async (q, limit) => {
  const searchLimit = limit ? parseInt(limit, 10) : 3;
  const results = await spotifySearch(q, searchLimit);
  const tracks = results && results.tracks ? results.tracks.items : [];
  return tracks.map((track, o) => {
    track.no = o + 1;
    return track;
  })
};

const saySelectOptions = (channel, results, client, context) => {
  // Song results found, time to reply
  client.say(channel, botMessageReply(stringFormat(SR_PICK_A_RESULT, context)));

  // Display each search result in a line reply
  for (let i = 0; i < results.length; i++) {
    const item = results[i];
    client.say(
      channel,
      stringFormat(SR_RESULT_LINE, [
        EMOJI_NUMBERS[i + 1], // Line no
        item.name, // Title
        item.artists[0].name, // Artist
        item.album.name, // Album
      ]),
    );
  }

  // Add the Cancel Line
  client.say(
    channel,
    stringFormat(SR_RESULT_NONE, [EMOJI_NUMBERS[results.length + 1]]),
  );
};

module.exports = {
  isUnavailable,
  saySelectOptions,
  searchSpotifyTracks
}