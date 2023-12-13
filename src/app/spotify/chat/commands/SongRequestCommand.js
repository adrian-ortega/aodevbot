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
exports.description = `
Will query Spotify (when linked) for song requests,
then adds it to the queue when a user selects one
from the returned results list
`.trim();

exports.options = () => {
  return {
    fields: [
      {
        id: 'unavailable_template',
        type: 'text',
        label: 'Unavailable Template',
        help: 'The message used to tell the user that the command is unavailable.',
        tokens: ['0'],
        token_descriptions: {
          '0' : "The requester's username"
        }
      },
      {
        id: 'playlist_enable',
        type: 'switch',
        label: 'Stream Playlist',
        help: 'Turn this on to save every song that has been successfully added to the queue, to a playlist on your Spotify Account',
      },
      {
        id: 'playlist_name_template',
        type: 'text',
        label: 'Stream Playlist Name Template',
        help: 'The name template used to save the Stream playlist to Spotify',
      }
    ],
    field_values: {
      unavailable_template: 'Sorry, @{0}, song requests are only available during a throwaway stream.',
      playlist_enable: true,
      playlist_name_template: '{display_name} Stream Song Requests {stream_id} {date}',
      tokens: ['0'],
      token_descriptions: {
        '0' : "The requester's username"
      }
    }
  }
}

exports.stats = () => {
  return [{
    id: 'total_requests',
    label: 'Total Requests',
    value: 0,
    unit: {
      plural: 'Requests',
      single: 'Request'
    }
  }]
}

exports.examples = () => {
  return [{
    example: `!sr <search keywords>
!sr Michael Jackson`,
    description: 'Use search keywords to find tracks.'
  }, {
    example: `!sr <search keywords> | <count (max 8, default 3)>
!sr Michael Jackson | 5`,
    description: 'A number can be passed as an argument to change the result set.'
  }]
}

exports.handle = async (message, state, channel, { client }, resolve) => {
  if (isUnavailable()) {
    return client.say(
      channel,
      stringFormat(SR_MESSAGES_UNAVAILABLE, [state[USER_DISPLAY_NAME]]),
    );
  }

  try {
    const Twitch = require("../../../twitch");
    let [q, limit] = state[USER_MESSAGE_PARAMS];
    limit = parseInt(limit, 10);
    if(limit > 8) limit = 8;
    if(limit < 1) limit = 1;

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
