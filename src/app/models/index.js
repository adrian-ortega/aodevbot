const {
  DB_HOST,
  DB_NAME,
  DB_USER,
  DB_PASSWORD,
  DB_DIALECT,
  DB_POOL,
} = require("../../config");
const Sequelize = require("sequelize");
const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  dialect: DB_DIALECT,
  logging: false,
  define: {
    createdAt: "created_at",
    updatedAt: "updated_at",
    deletedAt: "deleted_at",
    charset: "utf8mb4",
    collate: "utf8mb4_unicode_ci",
  },
  pool: {
    max: DB_POOL.max,
    min: DB_POOL.min,
    acquire: DB_POOL.acquire,
    idle: DB_POOL.idle,
  },
});

const db = {};
db.sequelize = sequelize;
db.Sequelize = Sequelize;

// Register models
//
db.Chatters = require("./Chatter")(sequelize, Sequelize);
db.Streams = require("./Stream")(sequelize, Sequelize);
db.Games = require("./Game")(sequelize, Sequelize);
db.Chat = require("./Chat")(sequelize, Sequelize);
db.ChatPoints = require("./ChatPoints")(sequelize, Sequelize);
db.ChatCommands = require("./ChatCommand")(sequelize, Sequelize);
db.Watchtime = require("./Watchtime")(sequelize, Sequelize);
db.Tokens = require("./Token")(sequelize, Sequelize);
db.KeyValue = require("./KeyValue")(sequelize, Sequelize);
db.SongRequests = require("./SongRequests")(sequelize, Sequelize);

module.exports = db;
