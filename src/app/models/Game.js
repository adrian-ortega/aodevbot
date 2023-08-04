const GameModel = (sequelize, Sequelize) => {
  const { INTEGER, STRING } = Sequelize;
  const Game = sequelize.define('game', {
    id: { type: INTEGER, primaryKey: true, autoIncrement: true },
    game_id: { type: STRING },
    game_name: { type: STRING }
  });
  return Game;
};

module.exports = GameModel;
