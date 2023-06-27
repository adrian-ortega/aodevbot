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
db.chatters = require('./Chatter')(sequelize, Sequelize);

module.exports = db;
