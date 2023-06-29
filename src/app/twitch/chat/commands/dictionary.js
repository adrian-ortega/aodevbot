const log = require('../../../log');
const registeredCommands = [
  require('./TimeCommand'),
  require('./CommandsCommand') // Must be last in the list
];

module.exports = (commands) => {
  commands.clear();
  registeredCommands.forEach(command => commands.append(command));
};
