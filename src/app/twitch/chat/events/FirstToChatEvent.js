const { broadcastToClients } = require('../../../websockets');
const { objectHasProp } = require("../../../support");
const { USER_CUSTOM_REWARD_ID, USER_DISPLAY_NAME } = require("../state-keys");

const FIRST_TO_CHAT = 'c8a98169-d9fc-42fd-9996-0bcc444502be';

exports.assert = (channel, state) => {
  return objectHasProp(state, USER_CUSTOM_REWARD_ID)
    && state[USER_CUSTOM_REWARD_ID] === FIRST_TO_CHAT;
};

exports.handle = (channel, user, message, chatBot) => {
  broadcastToClients({
    redeem: {
      type: 'firstToChat',
      payload: {
        name: user[USER_DISPLAY_NAME],
        message,
        user
      }
    }
  });
};
