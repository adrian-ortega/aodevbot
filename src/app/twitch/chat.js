const WebSocket = require("ws");
const log = require("../log");
const logPrefix = "Twitch Chat";
const chalk = require("chalk");

const commands = require("./chat/commands");
const { initCommands } = require("./chat/commands/dictionary");
const events = require("./chat/events");
const initEvents = require("./chat/events/dictionary");

const { parseChatMessageHtml } = require("../websockets/helpers");
const { Chat, Chatters } = require("../models");
const { initPointsSync } = require("./chat/points");
const { loadAccessToken } = require("./tokens");
const { refreshAccessToken } = require("./auth");
const { getStreamId, initStreamSync } = require("./stream");
const { getUser } = require("./users");
const { TWITCH_USERNAME } = require("../../config");
const {
  USER_ID,
  USER_IS_SUB,
  USER_IS_MOD,
  USER_USERNAME,
  USER_DISPLAY_NAME,
} = require("./chat/state-keys");

const TMI_RECONNECT_RETRIES = 5;
const TMI_SENT_STAMP = "tmi-sent-ts";

const tmi = require("tmi.js");
let tmiConnected;
  let tmiConnectRetries = 0;

let client;
let current_message;

const getChatterFromChatState = async (state) => {
  const chatterResults = await Chatters.findOrCreate({
    where: {
      twitch_id: state[USER_ID],
    },
    defaults: {
      twitch_id: state[USER_ID],
      username: state[USER_USERNAME],
      display_name: state[USER_DISPLAY_NAME],
      mod: state[USER_IS_MOD],
      subscriber: state[USER_IS_SUB],
    },
  });
  const Chatter = chatterResults.length > 0 ? chatterResults[0] : null;
  if (Chatter && Chatter.subscriber !== state[USER_IS_MOD]) {
    Chatter.update({
      mod: state[USER_IS_MOD],
      subscriber: state[USER_IS_SUB],
    });
  }
  return Chatter;
};

const logMessage = async (message_content, state) => {
  const stream_id = await getStreamId();
  try {
    const Chatter = await getChatterFromChatState(state);
    if (Chatter) {
      await Chat.create({
        twitch_id: state[USER_ID],
        stream_id,
        message_content,
        created_at: new Date(parseInt(state[TMI_SENT_STAMP], 10)),
      });
    }
  } catch (err) {
    log.error(
      "logMessage",
      {
        message: err.message,
      },
      logPrefix,
    );
  }
};

const addCommand = (...args) => commands.append(...args);
const getCommands = () => commands.getAll();
const addEvent = (...args) => events.append(...args);
const getEvents = () => events.getAll();

const onJoin = async (channel, username, self) => {
  // Check if chatter exists
  const Chatter = await Chatters.findOne({ where: { username } });
  if (!Chatter) {
    const twitchUserData = await getUser(username);
    if (twitchUserData) {
      await Chatters.create({
        twitch_id: twitchUserData.id,
        username: twitchUserData.login,
        display_name: twitchUserData.display_name,
        profile_image_url: twitchUserData.profile_image_url,
      });
    }
  }

  if (self && !tmiConnected) {
    await initCommands(commands);
    await initEvents(events);
    await initStreamSync();
    await initPointsSync();
    tmiConnected = true;
    return log.success("Connected", null, logPrefix);
  }

  log.debug(`Chatter ${chalk.cyan(username)} has joined.`, null, logPrefix);
  // @TODO send event to Chat log?
};

const triggerSelfEvents = () => {};

const onMessage = async (channel, state, message, self) => {
  try {
    if (self) {
      return triggerSelfEvents(channel, state, message);
    }
    await logMessage(message, state);
    current_message = { message, state };

    // @TODO Implement dev web socket with debug chat component
    //
    const chatClient = {
      client,
      commands,
      events,
    };

    if (!commands.maybeRun(channel, state, message, chatClient)) {
      // @TODO implement events
      events.maybeRun(channel, state, message, chatClient);
    }
  } catch (err) {
    log.error(
      "onMessage",
      {
        message: err.message,
        err,
      },
      logPrefix,
    );
  }
};

// @TODO create a way to select which bot connects to
//       twitch chat, at the moment it's forced to use
//       the broadcaster (authenticated with access tokens).
//       When we create the UI, we need to make a config
//       page for this module.

const getTwitchAuthIdentity = () => {
  return {
    username: TWITCH_USERNAME,
    password: async () => {
      const token = await loadAccessToken();
      if (!token) {
        throw new Error("Twitch access_token not found");
      }
      return `oauth:${token.access_token}`;
    },
  };
};

const createChatClient = async (wss) => {
  try {
    const identity = getTwitchAuthIdentity();
    client = new tmi.Client({
      options: {
        debug: false,
      },
      identity,
      channels: [identity.username],
    });
    client.on("join", onJoin);
    client.on("message", onMessage);

    // send to debug clients
    client.on("message", (channel, state, message) => {
      if (wss.clients && wss.clients.length > 0) {
        wss.clients.forEach((ws) => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(
              JSON.stringify({
                event: "chat-message",
                payload: {
                  channel,
                  messages: [
                    {
                      message,
                      html: parseChatMessageHtml(message, state),
                      user: state,
                    },
                  ],
                },
              }),
            );
          }
        });
      }
    });

    await client.connect();
    return true;
  } catch (err) {
    const msg = err.toString().toLowerCase();
    if (msg.includes("not found") || msg.includes("authentication failed")) {
      const retry = tmiConnectRetries++ < TMI_RECONNECT_RETRIES;
      if (retry && (await refreshAccessToken())) {
        log.warn(
          "reconnecting...",
          {
            retry: tmiConnectRetries,
          },
          logPrefix,
        );
        return createChatClient();
      }
    } else {
      log.error(
        "createChatClient",
        {
          error: err,
        },
        logPrefix,
      );
    }
  }
};

const reconnectChatClient = async () => {
  if (client) {
    await client.disconnect();
  }
  log.debug("Reconnecting", null, logPrefix);
  return createChatClient();
};

const getChatClient = () => client;

module.exports = {
  createChatClient,
  reconnectChatClient,
  addCommand,
  getCommands,
  addEvent,
  getEvents,
  getChatClient,
};
