const log = require('../log');
const { Tokens, Sequelize } = require('../models');
const token_type = 'twitch';

let chatter_id = 0;
let access_token, refresh_token, token_id;

exports.load = async () => {
  try {

    const results = await Tokens.findAll({
      where: {
        token_type,
        expires: {
          [Sequelize.Op.gt]: new Date()
        }
      },
      limit: 1,
      order: [['expires', 'DESC']]
    });
    const Token = results.shift();
    if (Token) {
      access_token = Token.access_token;
      refresh_token = Token.refresh_token;
      token_id = Token.id;
    }
  } catch (err) {
    log.error('Twitch.tokens.load', {
      message: err.message
    });
  }

  return access_token;
}

exports.updateAccessTokenOwner = async (chatter_id) => {
  if (token_id) {
    return Tokens.update({ chatter_id }, {
      where: { id: token_id }
    });
  }

  return null;
}

exports.getAccessToken = () => access_token;

exports.getRefreshToken = () => refresh_token;

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
  const Token = results.shift();
  access_token = Token.token;
  token_id = Token.id;
};