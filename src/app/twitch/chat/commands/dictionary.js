const log = require('../../../log');
const registeredCommands = [
  require('./LurkCommand'),
  require('./UnlurkCommand'),
  require('./ChatCountCommand'),
  require('./TimeCommand'),
  require('./PointsCommand'),
  require('./CommandsCommand') // Must be last in the list
];

module.exports = (commands) => {
  commands.clear();
  registeredCommands.forEach(command => commands.append(command));
};
