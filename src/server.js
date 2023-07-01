const { PORT, HOST } = require('./config.js');
const log = require('./app/log');
const express = require('express');
const router = require('./app/router');
const app = express();

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

router(app);

const db = require('./app/models');
db.sequelize.sync({
  logging: false,
  force: false
});

app.listen(PORT, () => {
  // console.clear();
  require('./app/twitch').createChatClient();
  console.log();
  log.debug('AODEVBot is up and running', null, 'Server');
  log.info(`http://${HOST}:${PORT}\n`, null, 'Server');
});
