const SongRequestModel = (sequelize, Sequelize) => {
  const { BIGINT, BOOLEAN, DATE, INTEGER, STRING } = Sequelize;
  const SongRequest = sequelize.define('song-request', {
    id: { type: INTEGER, primaryKey: true, autoIncrement: true },
    stream_id: { type: BIGINT, allowNull: true },
    twitch_id: { type: INTEGER },
    display_name: { type: STRING },
    track_id: { type: STRING },
    track_name: { type: STRING },
    track_artist: { type: STRING },
    track_uri: { type: STRING },
    track_duration: { type: INTEGER },
    played: { type: BOOLEAN, default: false },
    played_at: { type: DATE, allowNull: true }
  })

  // @TODO add foreign key for stream_id

  return SongRequest;
}

module.exports = SongRequestModel;
