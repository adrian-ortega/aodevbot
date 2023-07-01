const log = require('../../log');
const Timestamps = require('../../support/timestamps');
const { Watchtime, Chatters, ChatPoints } = require('../../models');
const { ONE_MINUTE } = require('../../support/time');
const { getBroadcasterStreams, getStreamChatters, getBroadcasterSubscribers } = require('../stream');

let syncId, syncing;

const getChatterPoints = async (chatter_id, stream_id) => {
  const cp = await ChatPoints.findOrCreate({
    where: { chatter_id, stream_id },
    defaults: { chatter_id, stream_id }
  });
  return cp.shift();
}

const getPointsMultiplier = async (Chatter) => {
  const subs = await getBroadcasterSubscribers();
  const sub = subs.find((sub) => sub.user_id === Chatter.twitch_id);
  if (sub) {
    switch (parseInt(sub.tier, 10)) {
      case 1000: return 1.2;
      case 2000: return 1.4;
      case 3000: return 2;
    }
  }
  return 1;
}

const pointsSync = async () => {
  syncing = true;
  const stream = await getBroadcasterStreams(true);
  if (!stream || !stream.id) {
    return log.warn('Stream is not live', null, 'Twitch Streams');
  };

  const stream_id = stream.id;
  const lastRunTs = Timestamps.get('twitch.points.sync');
  console.log({ lastRunTs });
  const now = new Date();
  const { data: twitchChatters } = await getStreamChatters();

  // @TODO create a timestamp that stores in files
  // for interval handling.

  for (let i = 0; i < twitchChatters.length; i++) {
    const {
      user_id: twitch_id,
      user_login: username,
      user_name: display_name
    } = twitchChatters[i];
    let totalSeconds = 0;
    // const awarded = [];
    const Chatter = await Chatters.findOne({
      where: {
        twitch_id
      }
    });
    const multiplier = await getPointsMultiplier(Chatter);
    const wtResults = await Watchtime.findOrCreate({
      where: {
        twitch_id,
        stream_id,
      },
      defaults: {
        twitch_id,
        stream_id,
        total: 0
      }
    });
    const wt = wtResults.shift();
    const updatedAt = new Date(wt.updated_at);
    totalSeconds = Math.floor(Math.abs(now.getTime() - updatedAt.getTime()) / 1000);
    wt.toal = wt.total + totalSeconds;
    await wt.save();

    if (totalSeconds >= (60 * 5)) {
      const chatterPoints = await getChatterPoints(twitch_id, stream_id);
      chatterPoints.points = chatterPoints.points + (10 * multiplier);
      chatterPoints.save();
    }

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

    Timestamps.put('twitch.points.sync', now.getTime());
  }
}

exports.initPointsSync = () => {
  const sync = () => pointsSync().then(() => {
    syncId = setTimeout(sync, ONE_MINUTE);
  });
  clearTimeout(syncId);
  sync();
};
