const log = require('../log');
const logPrefix = 'Twitch Tokens';
const { getBroadcaster } = require('../broadcaster');
const { Chatters, Tokens, Sequelize } = require('../models');

const token_type = 'twitch';

// @TODO Update this to pull the chatter id from token
let chatter_id = 0;

let currentToken;

exports.loadAccessToken = async () => {
  try {
    const broadcaster = await getBroadcaster();
    chatter_id = broadcaster.id;

    const results = await Tokens.findAll({
      where: {
        chatter_id,
        token_type,
        expires: {
          [Sequelize.Op.gt]: new Date()
        }
      },
      limit: 1,
      order: [['expires', 'DESC']]
    });
    if (results.length > 0) {
      chatter_id = broadcaster.id;
      currentToken = results.shift();
    }
  } catch (err) {
    log.error('Twitch.tokens.load', {
      message: err.message
    }, logPrefix);
  }

  return currentToken;
}

exports.setTokenOwner = async (chatter_id) => {
  if (currentToken) {
    return Tokens.update({ chatter_id }, {
      where: { id: currentToken.id }
    });
  }

  return null;
}

exports.getTokenOwner = async () => {
  await this.loadAccessToken();
  return currentToken ? Chatters.findByPk(currentToken.chatter_id) : 0;
};

exports.getTokenType = () => token_type;

exports.getToken = () => currentToken;

exports.getAccessToken = () => currentToken.access_token;

exports.getRefreshToken = () => currentToken.refresh_token;

exports.setAccessToken = async ({ access_token, refresh_token }, expires, scope) => {
  const results = await Tokens.findOrCreate({
    where: {
      chatter_id,
      token_type
    },
    defaults: {
      chatter_id,
      token_type,
      access_token,
      refresh_token,
      expires,
      scope
    }
  });
  currentToken = results.shift();
};