module.exports = (app) => {
  const chattersRouter = require('../http/routes/chatters');

  app.use('/api/chatters', chattersRouter);

  app.get('/api', (req, res) => {
    res.json({
      chatters: '/api/chatters'
    });
  });
};
