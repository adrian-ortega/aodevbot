const Spotify = require("../../../../spotify");
const { stringFormat } = require("../../../../support/strings");
const { SongRequests } = require("../../../../models");
const {
  USER_ID,
  USER_DISPLAY_NAME,
} = require("../../../../twitch/chat/state-keys");
const {
  SR_CANCELLED,
  SR_INVALID,
  SR_TRACK_ADDED,
  SR_SYSTEM_ERROR,
} = require("../../locale");
const { addTrackToStreamPlaylist } = require("./stream-playlist");

const extractIndexNumberFromMessage = (message) => {
  const numberOnlyResult = message.match(/\d+/);
  if (!numberOnlyResult) {
    return null;
  }

  return isNaN(numberOnlyResult[0]) ? null : parseInt(numberOnlyResult[0], 10);
};

module.exports = function createSelectCallback(
  requester,
  timestamp,
  cachedRequest,
  client,
  reset,
) {
  return async (channel, state, message) => {
    if (requester !== state[USER_DISPLAY_NAME]) return;
    const lastRequest = cachedRequest.data.items.find(
      (o) => o.timestamp === timestamp,
    );
    if (!lastRequest || lastRequest.complete || !lastRequest.results.length)
      return;

    const searchResults = lastRequest.results;
    const indexNumber = extractIndexNumberFromMessage(message);
    const track = searchResults.find((o) => o.no === indexNumber);
    if (track) {
      try {
        const track_artist = track.artists.map((a) => a.name).join(", ");
        const stream_id = lastRequest.stream_id;
        const SongRequest = await SongRequests.create({
          stream_id,
          display_name: requester,
          twitch_id: state[USER_ID],
          track_id: track.id,
          track_name: track.name,
          track_artist,
          track_uri: track.uri,
          track_duration: track.duration_ms,
        });

        // Send track to the Spotify queue
        //
        await Spotify.addToQueue(track.uri);

        // Send song to the chat client and reset the original watch request
        //
        const songContext = [
          SongRequest.track_name,
          SongRequest.track_artist,
          requester,
        ];
        const songSelectedMessage = stringFormat(SR_TRACK_ADDED, songContext);
        client.say(channel, songSelectedMessage);
        reset(indexNumber);

        // Send data to the frontend
        //
        const broadcast = require("../../../../websockets").broadcastToClients;
        broadcast({
          event: "spotify.up-next",
          payload: JSON.parse(JSON.stringify(SongRequest)),
        });

        // Add the requested song to the stream playlist
        //
        addTrackToStreamPlaylist(SongRequest, stream_id)
      } catch (err) {
        console.log(err);
        client.say(channel, stringFormat(SR_SYSTEM_ERROR, [requester]));

        // log the error
      }
    } else if (indexNumber === searchResults.length + 1) {
      client.say(channel, stringFormat(SR_CANCELLED, [requester]));
      reset(null);
    } else if (isNaN(indexNumber)) {
      // no need to reset, we expect the user to try again.
      client.say(channel, stringFormat(SR_INVALID, [requester]));
    }
  };
};
