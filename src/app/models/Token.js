const TokenModel = (sequelize, Sequelize) => {
  const { INTEGER, STRING, TEXT, DATE } = Sequelize;
  const Token = sequelize.define('token', {
    chatter_id: { type: INTEGER },
    access_token: { type: TEXT },
    refresh_token: { type: TEXT },
    token_type: { type: STRING },
    expires: { type: DATE },
    scope: { type: STRING },
  });
  return Token;
};

module.exports = TokenModel;