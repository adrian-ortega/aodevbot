const { PORT, HOST } = require('./config.js');
const express = require('express');
const router = require('./app/router');
const db = require('./app/models');

const app = express();

router(app);

db.sequelize.sync().then(() => {
  console.log('Synced DB');
}).catch((err) => {
  console.log('Failed to sync DB', err.message);
})

app.listen(PORT, () => {
  console.log(`STUFF IS UP AND RUNNING! http://${HOST}:${PORT}`);
});
