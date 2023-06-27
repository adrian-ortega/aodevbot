const {
    DB_HOST,
    DB_NAME,
    DB_USER,
    DB_PASSWORD,
    DB_DIALECT,
    DB_POOL
} = require('../../config');
const Sequelize = require('sequelize');
const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
    host: DB_HOST,
    dialect: DB_DIALECT,
    operatorsAliases: false,

    pool: {
        max: DB_POOL.max,
        min: DB_POOL.min,
        acquire: DB_POOL.acquire,
        idle: DB_POOL.idle
    }
});

const db = {};
db.sequelize = sequelize;
db.Sequelize = Sequelize;

// Register models
//
db.Chatters = require('./Chatter')(sequelize, Sequelize);
db.Streams = require('./Stream')(sequelize, Sequelize);
db.Games = require('./Game')(sequelize, Sequelize);
db.Chat = require('./Chat')(sequelize, Sequelize);
db.Tokens = require('./Token')(sequelize, Sequelize);

module.exports = db;
