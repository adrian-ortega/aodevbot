module.exports = (app) => {
  require('./web')(app);
  require('./api')(app);
};
