const TokenModel = (sequelize, Sequelize) => {
  const { INTEGER, STRING, TEXT } = Sequelize;
  const Token = sequelize.define('Token', {
    chatter_id: { type: INTEGER },
    token: { type: TEXT },
    token_type: { type: STRING },
    expires_in: { type: INTEGER },
    scope: { type: STRING },
  });
  return Token;
};

module.exports = TokenModel;