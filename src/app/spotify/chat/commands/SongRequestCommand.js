const log = require("../../../log");
const Spotify = require("../../../spotify");
const moment = require("moment");
const { stringFormat, EMOJI_NUMBERS } = require("../../../support/strings");
const { botMessageReply } = require("../../../twitch/chat/commands");
const {
  USER_DISPLAY_NAME,
  USER_MESSAGE_PARAMS,
} = require("../../../twitch/chat/state-keys");
const {
  SR_MESSAGES_UNAVAILABLE,
  SR_SONG_NOT_FOUND,
  SR_PICK_A_RESULT,
  SR_RESULT_LINE,
  SR_RESULT_NONE,
  SR_TIMEOUT,
} = require("../locale");
const { ONE_MINUTE } = require("../../../support/time");

// @TODO Implement this
const isUnavailble = () => false;

const getTracks = async (q, limit) => {
  const searchLimit = limit ? parseInt(limit, 10) : 3;
  const results = await Spotify.search(q, searchLimit);
  return results && results.tracks ? results.tracks.items : [];
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
  return (message, state, channel) => {
    // if (requester !== state[USER_DISPLAY_NAME]) return;

    const lastRequests = cachedRequest.data;
    console.log({ lastRequests, message, state, channel, timestamp });
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
    const [q, limit] = state[USER_MESSAGE_PARAMS];
    const results = await getTracks(q, limit);
    const timestamp = moment.unix();

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
        sreamId: null,
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
