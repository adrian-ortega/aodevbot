const log = require('../log');
const { load: loadAccessToken } = require('../twitch/tokens');
const { TWITCH_USERNAME } = require('../../config');

const tmi = require('tmi.js');
let client;

// @TODO create a way to select which bot connects to
//       twitch chat, at the moment its forced to use
//       the broadcaster. When we create the UI, we need
//       to make a config page for this module.

const getTwitchAuthIdentity = () => {
  return {
    username: TWITCH_USERNAME,
    password: async () => `oauth:${await loadAccessToken()}`
  }
}

module.exports = {
  async createChatClient() {
    try {
      const identity = getTwitchAuthIdentity();
      client = new tmi.Client({
        options: {
          debug: true
        },
        identity,
        channels: [
          identity.username
        ]
      });
      client.connect();
      client.on('message', () => { });
    } catch (err) {
      log.error('Twitch.chat.createChatClient', {
        message: err.message
      });
    }
  },
  getChatClient() {
    return client;
  }
};