const TokenModel = (sequelize, Sequelize) => {
  const Chatter = sequelize.models.chatter;
  const { INTEGER, STRING, TEXT, DATE } = Sequelize;
  const Token = sequelize.define("token", {
    chatter_id: { type: INTEGER },
    access_token: { type: TEXT },
    refresh_token: { type: TEXT },
    token_type: { type: STRING },
    expires: { type: DATE },
    scope: { type: TEXT },
  });

  Token.Chatter = Token.belongsTo(Chatter, {
    foreignKey: "chatter_id",
    as: "chatter",
  });

  Chatter.Tokens = Chatter.hasMany(Token, {
    foreignKey: "chatter_id",
    as: "tokens",
  });

  return Token;
};

module.exports = TokenModel;
