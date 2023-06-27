const { Tokens } = require('../models');
let chatter_id = 0;
let token, token_id;
const token_type = 'twitch';

exports.load = async () => {
  try {
    const results = await Tokens.findAll({ where: { token_type } })
    const Token = results.shift();
    if (Token) {
      token = Token.token;
      token_id = Token.id;
    }
  } catch (err) {
    console.log('Something went wrong', err);
  }
}

exports.updateAccessTokenOwner = async (chatter_id) => {
  if (token_id) {
    return Tokens.update({ chatter_id }, {
      where: { id: token_id }
    });
  }

  return null;
}

exports.getAccessToken = () => token;

exports.setAccessToken = async (data, expires_in, scope) => {
  const results = await Tokens.findOrCreate({
    where: { chatter_id, token_type },
    defaults: { chatter_id, token_type, token: data, expires_in, scope }
  });
  const Token = results.shift();
  token = Token.token;
  token_id = Token.id;
};