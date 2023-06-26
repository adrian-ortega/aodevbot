const ApiController = require('./ApiController');

class ChattersController extends ApiController {
  list (req, res) {
    this.respondWithJSON(res, [
      {
        id: 1,
        twitch_id: 80000,
        username: 'aodev',
        display_name: 'AODev'
      }
    ]);
  }
}

module.exports = new ChattersController();
