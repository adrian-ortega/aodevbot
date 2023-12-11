const log = require("../../../log");
const Spotify = require("../../../spotify");
const moment = require("moment");
const { stringFormat } = require("../../../support/strings");
const {
  USER_DISPLAY_NAME,
  USER_MESSAGE_PARAMS,
} = require("../../../twitch/chat/state-keys");
const {
  SR_MESSAGES_UNAVAILABLE,
  SR_SONG_NOT_FOUND,
  SR_TIMEOUT,
} = require("../locale");
const { ONE_MINUTE } = require("../../../support/time");

const createSelectCallback = require("./song-requests/select-track-callback");
const {
  isUnavailable,
  searchSpotifyTracks,
  saySelectOptions,
} = require("./song-requests/helpers");

exports.name = "sr";
exports.handle = async (message, state, channel, { client }, resolve) => {
  if (isUnavailable()) {
    return client.say(
      channel,
      stringFormat(SR_MESSAGES_UNAVAILABLE, [state[USER_DISPLAY_NAME]]),
    );
  }

  try {
    const Twitch = require("../../../twitch");
    const [q, limit] = state[USER_MESSAGE_PARAMS];
    const results = await searchSpotifyTracks(q, limit);
    const timestamp = moment.unix();
    const stream_id = await Twitch.getStreamId();

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
        stream_id,
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
