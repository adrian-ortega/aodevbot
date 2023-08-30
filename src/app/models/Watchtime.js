const WatchtimeModel = (sequelize, Sequelize) => {
  const { INTEGER, BIGINT } = Sequelize;
  const Watchtime = sequelize.define("watchtime", {
    twitch_id: { type: INTEGER, primaryKey: true },
    stream_id: { type: BIGINT, primaryKey: true },
    total: { type: INTEGER },
  });
  return Watchtime;
};

module.exports = WatchtimeModel;
