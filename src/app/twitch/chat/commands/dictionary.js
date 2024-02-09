const { getValue, isString } = require("../../../support");
const { ChatCommands } = require("../../../models");

const COMMAND_TYPE_GENERAL = "general";
const COMMAND_TYPE_CUSTOM = "custom";

const COMMAND_TYPES = {
  [COMMAND_TYPE_GENERAL]: 1,
  [COMMAND_TYPE_CUSTOM]: 2,
};

const registeredCommands = [
  // Spotify Commands
  require("../../../spotify/chat/commands/SongNameCommand"),
  require("../../../spotify/chat/commands/SongRequestCommand"),

  // General Commands
  require("./CheersCommand"),
  require("./HugCommand"),
  require("./FollowageCommand"),
  require("./LurkCommand"),
  require("./UnlurkCommand"),
  require("./ChatCountCommand"),
  require("./TimeCommand"),
  require("./PointsCommand"),
  require("./RedeemCommand"),
  require("./ShoutoutCommand"),
  require("./CommandsCommand"), // Must be last in the list
];

const initCommands = (commands) => {
  commands.clear();
  registeredCommands.forEach(async (command) => {
    let cmdNames = getValue(command.name);
    if (isString(cmdNames)) {
      cmdNames = [
        ...cmdNames
          .split(",")
          .map((s) => s.trim())
          .filter((a) => a)
          .values(),
      ];
    }
    const cmdSettings = getValue(command.options, {});
    const [name, ...aliases] = cmdNames;
    const cmd = {
      type: COMMAND_TYPES.custom,
      enabled: 0,
      name,
      aliases,
      description: getValue(command.description, ""),
      response: "",
      settings: { ...cmdSettings },
      options: {
        aliases,
        ...getValue(cmdSettings.field_values, {})
      },
    };
    let existingChatCommand = await ChatCommands.findOne({
      where: {
        type: cmd.type,
        name: cmd.name,
      },
    });
    
    if (!existingChatCommand) {
      existingChatCommand = await ChatCommands.create(cmd);
    }

    command.model = existingChatCommand;
    commands.append(command);
  });
};

module.exports = {
  COMMAND_TYPE_CUSTOM,
  COMMAND_TYPE_GENERAL,
  COMMAND_TYPES,
  initCommands,
};
