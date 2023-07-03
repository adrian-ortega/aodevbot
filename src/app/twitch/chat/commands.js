const log = require('../../log');
const logPrefix = 'Twitch Cmds'
const { getValue, isString, isArray, objectHasProp, objectHasMethod } = require('../../support');

let data = [];

const validate = (cmd) => objectHasProp(cmd, 'name') && objectHasMethod(cmd, 'handle')
const createGenericCommand = (command, message) => {
  return {
    name: command,
    handle() {
      console.log(message);
    }
  }
}

const startsWithBang = (str) => str.trim().match(/^!\w+/g);
const extractCommand = (message) => {
  if (!startsWithBang(message)) return false;
  const set = data.find((cmd) => {
    // Messages must be followed by whitespace to be considered
    // a proper command
    //
    const name = getValue(cmd.name);
    const cmdRegEx = (cmdName) => new RegExp(`^!${cmdName}\\b`, 'i');
    if (isArray(name)) {
      for (let i = 0; i < name.length; i++) {
        if (message.trim().match(cmdRegEx(name[i]))) {
          return true;
        }
      }
    }
    return message.trim().match(cmdRegEx(name));
  });
  return set ?? false;
};
const extractCommandName = (cmd, includeAliases) => {
  let cmdName = getValue(cmd.name);
  if (isArray(cmdName)) {
    const cmdNames = cmdName.map(a => `!${a}`);
    cmdName = `${cmdNames[0]}`;
    if (includeAliases) {
      cmdName += ` (Aliases: ${cmdNames.splice(1).join(', ')})`;
    }
  }
  return cmdName;
};

exports.botMessageReply = (message) => `🤖 ${message}`;

exports.maybeRun = (channel, state, message, chatClient) => {
  const cmd = extractCommand(message);
  if (cmd === false) return false;

  let cmdName = extractCommandName(cmd, true);
  const cmdCallback = (response = null) => {
    log.debug(`${cmdName} Complete.`, { response }, logPrefix);
  }
  cmd.handle(message, state, channel, chatClient, cmdCallback);
  return true;
}

exports.append = (command, message = null) => {
  if (isString(command)) {
    command = createGenericCommand(command, message);
  }

  // @TODO before we push into memory, store it in DB somehow

  if (!validate(command)) {
    throw new Error('Invalid Command', { command });
  }

  data.push(command);
}

exports.clear = () => {
  data = [];
}

exports.getAll = () => {
  return [...data];
}