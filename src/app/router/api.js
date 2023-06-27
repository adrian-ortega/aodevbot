module.exports = (app) => {
  app.use('/api/chatters', require('../http/routes/chatters'));
  app.use('/api/games', require('../http/routes/games'));
  app.use('/api/chat', require('../http/routes/chat'))

  app.get('/api', (req, res) => {
    res.json({
      chatters: '/api/chatters'
    });
  });
};
