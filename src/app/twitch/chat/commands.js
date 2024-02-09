const { getBroadcaster } = require("../../broadcaster");
const log = require("../../log");
const { ChatCommands, Sequelize } = require("../../models");
const logPrefix = "Twitch Cmds";
const {
  getValue,
  isString,
  isArray,
  objectHasProp,
  objectHasMethod,
  isEmpty,
} = require("../../support");
const { create: createGenericCommand } = require("./commands/GenericCommand");
const { USER_MESSAGE_PARAMS, USER_MESSAGE_COMMAND, USER_MESSAGE_COMMAND_NAME, USER_DISPLAY_NAME } = require("./state-keys");

let data = [];

const validate = (cmd) =>
  objectHasProp(cmd, "name") && objectHasMethod(cmd, "handle");
const startsWithBang = (str) => str.trim().match(/^!\w+/g);
const getCommandNameRegEx = (cmdName) => new RegExp(`^!${cmdName}\\b`, "i");
const getConcreteCommandFromMessage = async (message) => {
  if (!startsWithBang(message)) return false;
  const set = data.find((cmd) => {
    // Messages must be followed by whitespace to be considered
    // a proper command
    //
    const name = getValue(cmd.name);
    if (isArray(name)) {
      for (let i = 0; i < name.length; i++) {
        if (message.trim().match(getCommandNameRegEx(name[i]))) {
          return true;
        }
      }
    }
    return message.trim().match(getCommandNameRegEx(name));
  });

  // Found a concrete command class
  //
  if(set) return set;

  // Look for the command in db
  //
  const [_message, _cmd, _cmdArgs] = message.trim().match(/^!(\w+)(?:\s+(.*))?/)
    if(!isEmpty(_cmd)) {
      const Command = await ChatCommands.findOne({
        where: {
          [Sequelize.Op.or]: {
            name: {
              [Sequelize.Op.like]: `%${_cmd}`
            },
            'options.aliases': {
              [Sequelize.Op.like]: `%"${_cmd}"%`
            }
          }
        }
      })

      if(Command) {
        return createGenericCommand(Command)
      }
    }

  return false;
};

const getConcreteCommandName = (cmd, includeAliases) => {
  let cmdName = getValue(cmd.name);
  if (isArray(cmdName)) {
    const cmdNames = cmdName.map((a) => a.trim());
    cmdName = `${cmdNames[0]}`;
    if (includeAliases) {
      cmdName += ` (Aliases: ${cmdNames.splice(1).join(", ")})`;
    }
  }
  return cmdName;
};

exports.getConcreteCommandName = getConcreteCommandName;

const getMatchedName = (message, cmd) => {
  const cmdName = getValue(cmd.name);
  let matchedName = cmdName;
  if (isArray(cmdName)) {
    for (let i = 0; i < cmdName.length; i++) {
      if (message.trim().match(new RegExp(`^!${cmdName[i]}\\b`, "i"))) {
        matchedName = cmdName[i];
        break;
      }
    }
  }
  return matchedName;
};

const getMessageParams = (message, cmd) => {
  const name = getMatchedName(message, cmd);
  const params = [
    ...message
      .trim()
      .split(new RegExp(`^!${name}(\\b\\s+|$)`, "i"))
      .map((p) => p.replace(name, "").trim())
      .filter((p) => p.length > 0)
      .values(),
  ];

  return message.indexOf("|") === -1
    ? params
    : params.map((p) => p.split("|").map((p) => p.trim())).flat();
};

exports.botMessageReply = (message) => `🤖 ${message}`;
exports.replyWithContext = (template, context = {}) => Object.keys(context).reduce((acc, key) => acc.replaceAll(`{${key}}`, context[key]), template)
exports.maybeRun = async (channel, state, message, chatClient) => {
  const cmd = await getConcreteCommandFromMessage(message);
  if (cmd === false) return false;

  const cmdName = getConcreteCommandName(cmd, true);
  const cmdCallback = (response = null) => {
    log.debug(`${cmdName} Complete.`, { response }, logPrefix);
  };

  state[USER_MESSAGE_PARAMS] = getMessageParams(message, cmd);
  state[USER_MESSAGE_COMMAND_NAME] = getMatchedName(message, cmd);
  state[USER_MESSAGE_COMMAND] = cmd.model;

  // @TODO Make this dynamic
  //
  const broadcaster = await getBroadcaster()
  state['name'] = state[USER_DISPLAY_NAME];
  state['broadcaster_name'] = broadcaster.display_name;

  cmd.handle(message, state, channel, chatClient, cmdCallback);
  return true;
};

exports.append = (command, message = null) => {
  if (isString(command)) {
    console.log('STRING COMMANDS NOT IMPLEMENTED');
    return;
  }

  if (!validate(command)) {
    throw new Error("Invalid Command", { command });
  }

  data.push(command);
};

exports.clear = () => {
  data = [];
};

exports.getAll = () => {
  return data;
};
