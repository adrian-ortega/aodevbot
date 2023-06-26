const chattersController = require('../http/controllers/ChattersController');
module.exports = [
  {
    path: '/',
    methods: ['GET'],
    handler (req, res) {
      res.setHeader('Content-Type', 'application/json');
      res.send('{"foo": "Hello World, from routes.js!"}');
    }
  },
  {
    path: '/api/chatters',
    handler: chattersController.list.bind(chattersController)
  }
];
