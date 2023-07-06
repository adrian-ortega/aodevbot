const { PORT, HOST } = require('./config.js');
const { checkOrCreateDirectory } = require('./app/support/files');
const log = require('./app/log');
const path = require('path');
const express = require('express');
const router = require('./app/router');
const app = express();

app.use(express.static(path.resolve('./public')));
checkOrCreateDirectory(path.resolve('./storage'));

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
