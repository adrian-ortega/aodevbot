const twitchCommands = require('../../twitch/chat/commands');
const twitchEvents = require('../../twitch/chat/events');
const { parseChatMessageHtml } = require('../helpers');

const tmiClientSpoof = {
  ws: null,
  state: {},

  say: async (channel, message) => {
    if (tmiClientSpoof.ws) {
      tmiClientSpoof.ws.send(JSON.stringify({
        event: 'chat-message',
        payload: {
          channel,
          messages: [{
            message,
            html: parseChatMessageHtml(message, tmiClientSpoof.state),
            user: tmiClientSpoof.state
          }]
        }
      }));
    }
  },

  on: (...args) => {
    console.log('tmiClientSpoof.on', { args })
  },

  off: (...args) => {
    console.log('tmiClientSpoof.off', { args })
  },
};

module.exports = ({ message, user }, args, ws) => {
  // Immediatly send it back to the original chats
  ws.send(JSON.stringify({
    event: 'chat-message',
    payload: {
      messages: [message]
    }
  }));

  const chatChannel = '';
  const chatState = {};

  tmiClientSpoof.ws = ws;
  tmiClientSpoof.state = chatState;

  const chatClient = {
    client: tmiClientSpoof,
    commands: twitchCommands,
    events: twitchEvents,
  };

  if (!twitchCommands.maybeRun(chatChannel, chatState, message, chatClient)) {
    twitchEvents.maybeRun(chatChannel, chatState, message, chatClient);
  }
}