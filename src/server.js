const { PORT, HOST } = require('./config.js');
const express = require('express');
const router = require('./app/router');
const app = express();

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

router(app);

const db = require('./app/models');
db.sequelize.sync({ force: true });

app.listen(PORT, () => {
  console.log(`STUFF IS UP AND RUNNING! http://${HOST}:${PORT}`);
});
