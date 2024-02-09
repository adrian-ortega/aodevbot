const { PORT, HOST } = require('./config.js');
const { checkOrCreateDirectory } = require('./app/support/files');
const { createWebSocketServer } = require('./app/websockets');
const chalk = require('chalk');
const history = require('connect-history-api-fallback')
const log = require('./app/log');
const path = require('path');
const express = require('express');
const router = require('./app/router');
const app = express();

console.clear();

const staticFileMiddleware = express.static(path.resolve('./public'));
app.use(staticFileMiddleware);
app.use(history({
  disableDotRule: true,
  rewrites: [{
    from: /^\/api\/.*$/,
    to: context => context.parsedUrl.path
  }]
}))
app.use(staticFileMiddleware);

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

const twitch = require('./app/twitch');
const server = app.listen(PORT, () => {
  log.debug(`${chalk.yellow('AODEVBot')} is up and running`, null, 'Server');
  log.info(chalk.blueBright(`http://${HOST}:${PORT}`), null, 'Server');
});

twitch.createChatClient(
  createWebSocketServer(server)
);

require('./app/stats')
require('./app/spotify/loop')