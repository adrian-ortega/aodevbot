module.exports = (app) => {
  app.use('/api/chatters', require('../http/controllers/ChattersController'));

  app.get('/api', (req, res) => {
    res.json({
      chatters: '/api/chatters'
    });
  });
};
