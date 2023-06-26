const { PORT, HOST } = require('./config.js');
const express = require('express');

const app = express();

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(PORT, () => {
  console.log(`STUFF IS UP AND RUNNING! http://${HOST}:${PORT}`);
});
