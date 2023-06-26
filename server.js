const { PORT, HOST } = require('./config.js');
const express = require('express');
const router = require('./app/router');

const app = express();

router(app);

app.listen(PORT, () => {
  console.log(`STUFF IS UP AND RUNNING! http://${HOST}:${PORT}`);
});
