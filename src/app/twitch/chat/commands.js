const log = require("../../log");
const logPrefix = "Twitch Cmds";
const {
  getValue,
  isString,
  isArray,
  objectHasProp,
  objectHasMethod,
} = require("../../support");
const { USER_MESSAGE_PARAMS, USER_MESSAGE_COMMAND, USER_MESSAGE_COMMAND_NAME } = require("./state-keys");

let data = [];

const validate = (cmd) =>
  objectHasProp(cmd, "name") && objectHasMethod(cmd, "handle");
const createGenericCommand = (command, message) => {
  return {
    name: command,
    handle() {
      console.log(message);
    },
  };
};

const startsWithBang = (str) => str.trim().match(/^!\w+/g);
const getConcreteCommandFromMessage = (message) => {
  if (!startsWithBang(message)) return false;
  const set = data.find((cmd) => {
    // Messages must be followed by whitespace to be considered
    // a proper command
    //
    const name = getValue(cmd.name);
    const cmdRegEx = (cmdName) => new RegExp(`^!${cmdName}\\b`, "i");
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
exports.maybeRun = (channel, state, message, chatClient) => {
  const cmd = getConcreteCommandFromMessage(message);
  if (cmd === false) return false;

  const cmdName = getConcreteCommandName(cmd, true);
  const cmdCallback = (response = null) => {
    log.debug(`${cmdName} Complete.`, { response }, logPrefix);
  };

  state[USER_MESSAGE_PARAMS] = getMessageParams(message, cmd);
  state[USER_MESSAGE_COMMAND_NAME] = getMatchedName(message, cmd);
  state[USER_MESSAGE_COMMAND] = cmd.model;

  cmd.handle(message, state, channel, chatClient, cmdCallback);
  return true;
};

exports.append = (command, message = null) => {
  if (isString(command)) {
    command = createGenericCommand(command, message);
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
