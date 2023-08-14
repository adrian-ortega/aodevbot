module.exports = (app) => {
  app.use('/api/broadcaster', require('../http/routes/broadcaster'));
  app.use('/api/twitch', require('../http/routes/twitch'));
  app.use('/api/spotify', require('../http/routes/spotify'));
  app.use('/api/chatters', require('../http/routes/chatters'));
  app.use('/api/commands', require('../http/routes/commands'));
  app.use('/api/games', require('../http/routes/games'));
  app.use('/api/chat', require('../http/routes/chat'))

  app.get('/api', (req, res) => {
    res.json({
      chatters: '/api/chatters'
    });
  });
};
