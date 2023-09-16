const { getBroadcaster } = require("../../broadcaster");
const { parseChatMessageHtml } = require("../helpers");
const { Chatters } = require("../../models");
const {
  USER_COLOR,
  USER_ROOM_ID,
  USER_DISPLAY_NAME,
  USER_ID,
  USER_USERNAME,
} = require("../../twitch/chat/state-keys");
const twitchCommands = require("../../twitch/chat/commands");
const twitchEvents = require("../../twitch/chat/events");
const { makeId } = require("../../support/uuid");
const { getChatBotAccount } = require("../../twitch");

/**
 * 
 * @param {Chatters} Chatter 
 * @param {Chatters} botChatter 
 * @returns 
 */
const createTmiChatState = (Chatter, botChatter) => {
  return {
    _id: Chatter.id,
    [USER_ID]: Chatter.twitch_id,
    [USER_USERNAME]: Chatter.username,
    [USER_COLOR]: Chatter.color || null,
    [USER_ROOM_ID]: botChatter.twitch_id,
    [USER_DISPLAY_NAME]: Chatter.display_name,
  };
};

const createTmiClientSpoof = function (ws, state) {
  // This doesn't work. when creating the the original spoof, the
  // user stays as the original request for the bot.
  //
  // Example: The original request is by the user
  //            ↳ Dragoy_Zzz: !time
  //
  //          The returned message should be by the BOT ACCOUNT,
  //          this only happens for admin debug chat.
  //            ↳ Dragoy_Zzz: 🤖 It is Friday 4:03 PM for aodev.

  const eventCallbackCache = {};
  let stateCopy = { ...state };
  const reset = async () => {
    stateCopy = createTmiChatState(
      await getChatBotAccount(),
      await getBroadcaster()
    )
  }

  return {
    resetTmiState: reset,
    say: async (channel, message) => {
      if (ws) {
        ws.send(
          JSON.stringify({
            event: "chat-message",
            payload: {
              channel,
              messages: [
                {
                  message,
                  html: parseChatMessageHtml(message, stateCopy),
                  user: stateCopy,
                },
              ],
            },
          }),
        );
      }
    },

    on: (event, callback) => {
      const eventCallbackId = makeId(eventCallbackCache);
      switch (event) {
        case "message":
          eventCallbackCache[eventCallbackId] = (ogMessage) => {
            const data = JSON.parse(ogMessage);
            if (!data.event) return;

            console.log(data);
            getBroadcaster().then((broadcaster) => {
              callback(broadcaster.username, {}, data.payload.message);
            });
          };
          ws.on("message", eventCallbackCache[eventCallbackId].bind(this));
      }
    },

    off: (event, callback) => {
      for (const cacheKey in eventCallbackCache) {
        const cachedCallback = eventCallbackCache[cacheKey].bind(this);
        if (cachedCallback === callback) {
          ws.removeListener(event, cachedCallback.bind(this));
        }
      }
    },
  };
};

module.exports = async ({ message, twitch_id }, args, ws) => {
  const broadcasterChatter = await getBroadcaster();
  const botChatter = await getChatBotAccount();
  const chatChannel = broadcasterChatter.username;
  const Chatter =
    botChatter.twitch_id === twitch_id
      ? botChatter
      : await Chatters.findOne({ where: { twitch_id } });

  const chatState = createTmiChatState(Chatter, botChatter);
  const tmiClient = createTmiClientSpoof(ws, chatState);
  const chatClient = {
    client: tmiClient,
    commands: twitchCommands,
    events: twitchEvents,
  };

  // Gotta reply to the original message to show it back to
  // the admin user.
  await tmiClient.say(chatChannel, message);
  await tmiClient.resetTmiState();

  // Now we pass all the data to the registered chat commands
  // and events to spoof twitch chat
  if (!twitchCommands.maybeRun(chatChannel, chatState, message, chatClient)) {
    twitchEvents.maybeRun(chatChannel, chatState, message, chatClient);
  }
};
