const Timestamps = require("../../support/timestamps");
const { Watchtime, Chatters, ChatPoints } = require("../../models");
const { ONE_MINUTE } = require("../../support/time");
const {
  getBroadcasterStreams,
  getStreamChatters,
  getBroadcasterSubscribers,
} = require("../stream");

const TIMESTAMP_KEY = "twitch.points.sync";
let syncId;

const updateAndGetChatterWatchtime = async (twitch_id, stream_id, now) => {
  let wt = await Watchtime.findOne({
    where: { twitch_id, stream_id },
  });
  if (!wt) {
    wt = await Watchtime.create({ twitch_id, stream_id, total: 0 });
  }
  const updated = new Date(wt.updated_at);
  const seconds = Math.floor(
    Math.abs(now.getTime() - updated.getTime()) / 1000,
  );
  if (seconds) {
    await wt.update({
      total: wt.total + seconds,
    });
    return seconds;
  }

  return 0;
};

const getPointsMultiplier = async (Chatter) => {
  const subs = await getBroadcasterSubscribers();
  const sub = subs.find((sub) => sub.user_id === Chatter.twitch_id);
  if (sub) {
    switch (parseInt(sub.tier, 10)) {
      case 1000:
        return 1.2;
      case 2000:
        return 1.4;
      case 3000:
        return 2;
    }
  }
  return 1;
};

const pointsSync = async () => {
  const stream = await getBroadcasterStreams(true);
  if (!stream || !stream.id) {
    return;
  }
  const now = new Date();
  const stream_id = stream.id;
  const { data: twitchChatters } = await getStreamChatters();
  for (let i = 0; i < twitchChatters.length; i++) {
    const { user_id: twitch_id, user_name: display_name } = twitchChatters[i];
    const awarded = [];
    const Chatter = await Chatters.findOne({
      where: {
        twitch_id,
      },
    });
    const multiplier = await getPointsMultiplier(Chatter);
    const watchtimeSeconds = await updateAndGetChatterWatchtime(
      twitch_id,
      stream_id,
      now,
    );

    // Award 10 points for every 5 mins
    if (watchtimeSeconds >= 60 * 5) {
      const points = 10 * multiplier;
      Chatter.points = Math.ceil(Chatter.points + points);
      awarded.push({
        points,
        note: `${points} (10 * ${multiplier}) awarded to ${display_name} for every 5 minutes watched.`,
      });
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

    for (let i = 0; i < awarded.length; i++) {
      const { points, note } = awarded[i];
      await ChatPoints.create({
        stream_id,
        chatter_id: Chatter.id,
        points,
        note,
      });
    }
  }
};

exports.initPointsSync = () => {
  const timeout = Timestamps.getOrCreate(TIMESTAMP_KEY, ONE_MINUTE);
  const sync = () =>
    pointsSync().then(() => {
      syncId = setTimeout(sync, timeout);
    });
  clearTimeout(syncId);
  sync();
};
