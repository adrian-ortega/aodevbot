const ChatterModel = (sequelize, Sequelize) => {
  const { BIGINT, INTEGER, STRING, BOOLEAN } = Sequelize;
  const Chatter = sequelize.define("chatter", {
    id: { type: INTEGER, primaryKey: true, autoIncrement: true },
    twitch_id: { type: INTEGER, primaryKey: true },
    username: { type: STRING },
    display_name: { type: STRING },
    profile_image_url: { type: STRING },
    broadcaster: { type: INTEGER, defaultValue: false },
    color: { type: STRING(20), defaultValue: null },
    subscriber: { type: BOOLEAN, defaultValue: false },
    mod: { type: BOOLEAN, defaultValue: false },
    points: { type: BIGINT, defaultValue: 0 },
  });
  return Chatter;
};

module.exports = ChatterModel;
