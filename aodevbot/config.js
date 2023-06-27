require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 8080,
  HOST: process.env.HOST || 'localhost',

  // Database
  DB_HOST: process.env.DB_HOST || "localhost",
  DB_USER: process.env.DB_USER || "root",
  DB_PASSWORD: process.env.DB_PASSWORD || "password",
  DB_NAME: process.env.DB_NAME || "aodevbot",
  DB_DIALECT: process.env.DB_DIALECT || "mysql",
  DB_POOL: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
};
