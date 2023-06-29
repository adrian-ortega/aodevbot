const log = require('../log');
const chalk = require('chalk');
const commands = require('./chat/commands');
const initCommands = require('./chat/commands/dictionary');
const events = require('./chat/events');
const { loadAccessToken } = require('./tokens');
const { refreshAccessToken } = require('./auth');
const { getStreamId, syncStream } = require('./stream');

const { Chat, Chatters } = require('../models');
const { isString } = require('../support');
const { TWITCH_USERNAME } = require('../../config');
const { USER_ID, USER_IS_SUB, USER_IS_MOD, USER_USERNAME, USER_DISPLAY_NAME } = require('./chat/state-keys');

const TMI_RECONNECT_RETRIES = 5;
const TMI_SENT_STAMP = 'tmi-sent-ts';

const tmi = require('tmi.js');
let tmiConnected, tmiConnectRetries = 0;

let client;
let current_message;

const getChatterFromChatState = async (state) => {
  const chatterResults = await Chatters.findOrCreate({
    where: {
      twitch_id: state[USER_ID]
    },
    defaults: {
      twitch_id: state[USER_ID],
      username: state[USER_USERNAME],
      display_name: state[USER_DISPLAY_NAME],
      mod: state[USER_IS_MOD],
      subscriber: state[USER_IS_SUB],
    }
  });
  return chatterResults.length > 0 ? chatterResults[0] : null;
};

const logMessage = async (message_content, state) => {
  const stream_id = await getStreamId();
  try {
    const Chatter = await getChatterFromChatState(state);
    if (Chatter) {
      await Chat.create({
        chatter_id: state[USER_ID],
        stream_id,
        message_content,
        created_at: new Date(parseInt(state[TMI_SENT_STAMP], 10))
      });
    }
  } catch (err) {
    log.error('Twitch.chat.logMessage', {
      message: err.message
    })
  }
}

const addCommand = (...args) => commands.append(...args)
const addEvent = (...args) => events.append(...args);

const onJoin = async (channel, user, self) => {
  await syncStream();
  if (self && !tmiConnected) {
    await initCommands(commands);
    tmiConnected = true;
    return log.success('Connected', null, 'Twitch Chat');
  }

  log.debug(`Chatter: ${chalk.cyan(user)} has joined.`, null, 'Twitch Chat');
  // @TODO send event to Chat log?
}

const triggerSelfEvents = () => { };

const onMessage = async (channel, state, message, self) => {
  try {
    if (self) {
      return triggerSelfEvents(channel, state, message);
    }
    await logMessage(message, state);
    current_message = { message, state };
    const chatClient = {
      client,
      commands,
      events
    };
    if (!commands.maybeRun(channel, state, message, chatClient)) {
      // @TODO implement events
      events.maybeRun(channel, state, message, chatClient)
    }
  } catch (err) {
    log.error('Twitch.chat.client.onMessage', {
      message: err.message,
      err
    });
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
        throw new Error('Twitch access_token not found');
      }
      return `oauth:${token.access_token}`;
    }
  }
}

const createChatClient = async () => {
  try {
    const identity = getTwitchAuthIdentity();
    client = new tmi.Client({
      options: {
        debug: false
      },
      identity,
      channels: [
        identity.username
      ]
    });
    client.on('join', onJoin);
    client.on('message', onMessage);
    await client.connect();
    return true;
  } catch (err) {
    console.log({
      tmiConnectRetries,
      TMI_RECONNECT_RETRIES,
    })
    if (
      isString(err) &&
      err.toLowerCase().includes('authentication failed') &&
      (tmiConnectRetries++ < TMI_RECONNECT_RETRIES) &&
      await refreshAccessToken()
    ) {
      log.warn('Twitch.chat.createChatClient reconnecting...', {
        retry: tmiConnectRetries
      })
      return this.createChatClient();
    } else {
      log.error('Twitch.chat.createChatClient', {
        error: err
      });
    }
  }
}

module.exports = {
  createChatClient,
  addCommand,
  addEvent,
};