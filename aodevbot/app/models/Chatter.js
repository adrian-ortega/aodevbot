const ChatterModel = (sequelize, Sequelize) => {
    const { BIGINT, INTEGER, STRING, BOOLEAN, DATE, NOW } = Sequelize;
    const Chatter = sequelize.define('Chatter', {
        id: { type: INTEGER, primaryKey: true, autoIncrement: true },
        twitch_id: { type: INTEGER, primaryKey: true },
        username: { type: STRING },
        display_name: { type: STRING },
        subscriber: { type: BOOLEAN, default: false },
        mod: { type: BOOLEAN, default: false },
        points: { type: BIGINT, default: 0 },
        created_at: { type: DATE, default: NOW },
        updated_at: { type: DATE, default: NOW }
    });
    return Chatter;
}

module.exports = ChatterModel;