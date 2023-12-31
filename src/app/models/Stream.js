const StreamModel = (sequelize, Sequelize) => {
  const { BIGINT, INTEGER, STRING, DATE } = Sequelize;
  const Stream = sequelize.define("stream", {
    id: { type: INTEGER, primaryKey: true, autoIncrement: true },
    stream_id: { type: BIGINT, primaryKey: true },
    game_id: { type: BIGINT, primaryKey: true },
    title: { type: STRING },
    started_at: { type: DATE },
    ended_at: { type: DATE },
  });
  return Stream;
};

module.exports = StreamModel;
