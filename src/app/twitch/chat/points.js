const log = require('../../log');
const { Watchtime } = require('../../models');
const { ONE_MINUTE } = require('../../support/time');
const { getBroadcasterStreams, getStreamChatters } = require('../stream');

let syncId, syncing;
const pointsSync = async () => {
  syncing = true;
  const stream = await getBroadcasterStreams(true);
  if (!stream || !stream.id) {
    return log.warn('Stream is not live', null, 'Twitch Streams');
  };

  const now = new Date();
  const { data: twitchChatters } = await getStreamChatters();
  for (let i = 0; i < twitchChatters.length; i++) {
    const {
      user_id: twitch_id,
      user_login: username,
      user_name: display_name
    } = twitchChatters[i];
    let seconds = 0;
    // const awarded = [];
    // const multiplier = 1;

    const wtResults = await Watchtime.findOrCreate({
      where: {
        twitch_id,
        stream_id: stream.id,
      },
      defaults: {
        twitch_id,
        stream_id: stream.id,
        total: 0
      }
    });
    const wt = wtResults.shift();
    const updatedAt = new Date(wt.updated_at);
    seconds = Math.floor(Math.abs(now.getTime() - updatedAt.getTime()) / 1000);

    await wt.update({
      total: wt.total + seconds
    });

    // await wt.update({
    //   total: seconds
    // });

    // or create it

    // Award 50 points for every 15 mins of "active" watchtime.
    // Active means someone that has chatted in the last 10 mins

    // Streaks
    // @TODO how to store stream session participants
    //       need to figure out how to keep "attendance"
    //       session_participants
    //       session_id, user_id only created, never updated or deleted
    //
    // 2: 300pt
    // 3: 350pt
    // 4: 400pt
    // 5+: 450pt
  }
}

exports.initPointsSync = () => {
  const sync = () => pointsSync().then(() => {
    syncId = setTimeout(sync, ONE_MINUTE);
  });
  clearTimeout(syncId);
  sync();
};
