const { getBroadcaster } = require('../../broadcaster');
const { parseChatMessageHtml } = require('../helpers');
const { Chatters } = require('../../models');
const {
  USER_COLOR, USER_ROOM_ID, USER_DISPLAY_NAME, USER_ID
} = require('../../twitch/chat/state-keys');
const twitchCommands = require('../../twitch/chat/commands');
const twitchEvents = require('../../twitch/chat/events');

const createTmiChatState = (Chatter, Broadcaster) => {
  return {
    _id: Chatter.id,
    [USER_ID]: Chatter.user_id,
    [USER_COLOR]: '#CF4C00',
    [USER_ROOM_ID]: Broadcaster.twitch_id,
    [USER_DISPLAY_NAME]: Chatter.display_name,
  };
};

const createTmiClientSpoof = (ws, state) => {
  return {
    say: async (channel, message) => {
      if (ws) {
        ws.send(JSON.stringify({
          event: 'chat-message',
          payload: {
            channel,
            messages: [{
              message,
              html: parseChatMessageHtml(message, state),
              user: state
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
}

module.exports = async ({ message, twitch_id }, args, ws) => {
  const Broadcaster = await getBroadcaster();
  const chatChannel = Broadcaster.username;
  const Chatter = Broadcaster.twitch_id === twitch_id
    ? Broadcaster
    : await Chatters.findOne({ where: { twitch_id } });

  const chatState = createTmiChatState(Chatter, Broadcaster);
  const tmiClient = createTmiClientSpoof(ws, chatState);
  const chatClient = {
    client: tmiClient,
    commands: twitchCommands,
    events: twitchEvents,
  };

  // Gotta reply to the original message to show it back to
  // the admin user.
  tmiClient.say(chatChannel, message);

  // Now we pass all the data to the registered chat commands
  // and events to spoof twitch chat
  if (!twitchCommands.maybeRun(chatChannel, chatState, message, chatClient)) {
    twitchEvents.maybeRun(chatChannel, chatState, message, chatClient);
  }
}