const { ChatCommands } = require("../../../models");
const { USER_MESSAGE_COMMAND } = require("../state-keys");

class GenericCommand {
  constructor(Command, settings = {}, options = {}) {
    this.savedCommand = null;
    this.hasSavedCommand = false;

    if(Command instanceof ChatCommands) {
      this.hasSavedCommand = true;
      this.savedCommand = Command;
      this.settings = Command.settings;
      this.options = Command.options;
    } else {
      this.name = Command
      this.settings = settings;
      this.options = options
    }
  }

  name () {

  }

  options () {

  }
  
  description () {

  }

  examples () {

  }

  handle (message,
    state, channel, { client }, resolve
  ) {
    const { replyWithContext } = require("../commands");
    const response = this.getResponseTemplate()
    const {[USER_MESSAGE_COMMAND]: cmd, ...stateContext } = state;
    console.log(stateContext)
    if(response) client.say(channel, replyWithContext(response, stateContext))
  }

  getResponseTemplate () {
    return this.hasSavedCommand ? this.savedCommand.response : this.options?.response
  }
}

exports.create = (name, settings = {}, options = {}) => new GenericCommand(name, settings, options)