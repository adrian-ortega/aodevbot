const StreamModel = (sequelize, Sequelize) => {
  const { BIGINT, INTEGER, STRING, BOOLEAN, DATE } = Sequelize;
  const Stream = sequelize.define('Stream', {
    id: { type: INTEGER, primaryKey: true, autoIncrement: true },
    stream_id: { type: BIGINT, primaryKey: true },
    title: { type: STRING },
    mature: { type: BOOLEAN, defaultValue: false },
    start_time: { type: DATE },
    end_time: { type: DATE }
  });
  return Stream;
};

module.exports = StreamModel;
