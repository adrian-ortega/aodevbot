const log = require("../../../log");
const Spotify = require("../../../spotify");
const moment = require("moment");
const { stringFormat, EMOJI_NUMBERS } = require("../../../support/strings");
const { botMessageReply } = require("../../../twitch/chat/commands");
const {
  USER_DISPLAY_NAME,
  USER_MESSAGE_PARAMS,
  USER_ID,
} = require("../../../twitch/chat/state-keys");
const {
  SR_MESSAGES_UNAVAILABLE,
  SR_SONG_NOT_FOUND,
  SR_PICK_A_RESULT,
  SR_RESULT_LINE,
  SR_RESULT_NONE,
  SR_TIMEOUT,
  SR_CANCELLED,
  SR_INVALID,
  SR_TRACK_ADDED,
  SR_SYSTEM_ERROR,
} = require("../locale");
const { ONE_MINUTE } = require("../../../support/time");
const { SongRequests } = require("../../../models");

// @TODO Implement this
const isUnavailble = () => false;

const getTracks = async (q, limit) => {
  const searchLimit = limit ? parseInt(limit, 10) : 3;
  const results = await Spotify.search(q, searchLimit);
  const tracks = results && results.tracks ? results.tracks.items : [];
  return tracks.map((track, o) => {
    track.no = o + 1;
    return track;
  })
};

const extractIndexNumberFromMessage = message => {
  const numberOnlyResult = message.match(/\d+/);
  if (!numberOnlyResult) {
      return null;
  }

  return isNaN(numberOnlyResult[0]) ? null : parseInt(numberOnlyResult[0], 10);
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

const createSelectCallback = (
  requester,
  timestamp,
  cachedRequest,
  client,
  reset,
) => {
  return async (channel, state, message) => {
    if (requester !== state[USER_DISPLAY_NAME]) return;
    const lastRequest = cachedRequest.data.items.find(o => o.timestamp === timestamp);
    if(!lastRequest || lastRequest.complete || !lastRequest.results.length) return;

    const searchResults = lastRequest.results;
    const indexNumber = extractIndexNumberFromMessage(message);
    const track = searchResults.find(o => o.no === indexNumber);
    if(track) {
      try {
        const track_artist  = track.artists.map(a => a.name).join(', ');
        const stream_id = lastRequest.stream_id;
        const SongRequest = await SongRequests.create({
          stream_id,
          display_name: requester,
          twitch_id: state[USER_ID],
          track_id: track.id,
          track_name: track.name,
          track_artist,
          track_uri: track.uri,
          track_duration: track.duration_ms
        });

        // Send track to the Spotify queue
        //
        await Spotify.addToQueue(track.uri);

        // Send song to the chat client and reset the original watch request
        //
        const songContext = [SongRequest.track_name, SongRequest.track_artist, requester];
        const songSelectedMessage = stringFormat(SR_TRACK_ADDED, songContext);
        client.say(channel, songSelectedMessage);
        reset(indexNumber);

        // Send data to the frontend
        //
        const broadcast = require('../../../websockets').broadcastToClients
        broadcast({
          event: 'spotify.up-next',
          payload: JSON.parse(JSON.stringify(SongRequest))
        })
      } catch (err) {
        console.log(err);
        client.say(channel, stringFormat(SR_SYSTEM_ERROR, [requester]));

        // log the error
      }

    }  else if (indexNumber === (searchResults.length + 1)) {
        client.say(channel, stringFormat(SR_CANCELLED, [requester]));
        reset(null);
    } else if (isNaN(indexNumber)) {
        // no need to reset, we expect the user to try again.
        client.say(channel, stringFormat(SR_INVALID, [requester]));
    }
  };
};

exports.name = "sr";
exports.handle = async (message, state, channel, { client }, resolve) => {
  if (isUnavailble()) {
    return client.say(
      channel,
      stringFormat(SR_MESSAGES_UNAVAILABLE, [state[USER_DISPLAY_NAME]]),
    );
  }

  try {
    const twitch = require("../../../twitch");
    const [q, limit] = state[USER_MESSAGE_PARAMS];
    const results = await getTracks(q, limit);
    const timestamp = moment.unix();
    const stream_id = await twitch.getStreamId()

    const cachedId = Spotify.cache.findByKey(
      "requester",
      state[USER_DISPLAY_NAME],
    );
    const cachedRequest = Spotify.cache.appendItem(
      cachedId,
      { requester: state[USER_DISPLAY_NAME] },
      {
        timestamp,
        q,
        results,
        selected: null,
        complete: false,
        stream_id
      },
    );
    const messageContext = [state[USER_DISPLAY_NAME]];

    // No songs found, kill the request, bye bye.
    if (results.length === 0) {
      return client.say(
        channel,
        stringFormat(SR_SONG_NOT_FOUND, messageContext),
      );
    }

    saySelectOptions(channel, results, client, messageContext);

    // Set a temporary responder for the user's request
    let selectCallback = null;
    const resetWaitCallback = (selected = null) => {
      client.off("message", selectCallback);
      cachedRequest.update({
        items: cachedRequest.data.items.map((o) => {
          if (o.timestamp === timestamp) {
            o.complete = true;
            o.selected = selected;
          }
          return o;
        }),
      });
    };

    selectCallback = createSelectCallback(
      state[USER_DISPLAY_NAME],
      timestamp,
      cachedRequest,
      client,
      resetWaitCallback,
    );
    client.on("message", selectCallback);
    setTimeout(() => {
      const data = cachedRequest.data;
      const items = data && data.items.length > 0 ? data.items : [];
      try {
        const { timestamp: rTimestamp, complete } = items.find(
          (o) => o.timestamp === timestamp,
        );
        if (rTimestamp === timestamp && !complete) {
          client.say(channel, stringFormat(SR_TIMEOUT, messageContext));
          resetWaitCallback(null);
        }
      } catch (e) {
        // We do nothing if something goes wrong, it'll capture it
        // on the next tick? At least that's what I'm assuming
        //
        // - AO from 08/21/22
      }
    }, ONE_MINUTE * 2);
  } catch (err) {
    log.error("Song Request", err.message);
  }
};
