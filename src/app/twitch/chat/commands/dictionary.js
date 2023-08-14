const { getValue, isString } = require('../../../support')
const { ChatCommands } = require('../../../models')

const COMMAND_TYPE_GENERAL = 'general'
const COMMAND_TYPE_CUSTOM = 'custom'

const COMMAND_TYPES = {
  [COMMAND_TYPE_GENERAL]: 1,
  [COMMAND_TYPE_CUSTOM]: 2
}

const registeredCommands = [
  require('./FollowageCommand'),
  require('./LurkCommand'),
  require('./UnlurkCommand'),
  require('./ChatCountCommand'),
  require('./TimeCommand'),
  require('./PointsCommand'),
  require('./RedeemCommand'),
  require('./CommandsCommand') // Must be last in the list
]

const initCommands = (commands) => {
  commands.clear()
  registeredCommands.forEach(async (command) => {
    let names = getValue(command.name)
    if (isString(names)) {
      names = [
        ...names
          .split(',')
          .map((s) => s.trim())
          .filter((a) => a)
          .values()
      ]
    }
    const cmd = {
      type: COMMAND_TYPES.custom,
      enabled: 0,
      name: names.join(','),
      description: getValue(command.description, ''),
      response: '',
      options: getValue(command.options)
    }
    const exists = await ChatCommands.findOne({
      where: {
        type: cmd.type,
        name: cmd.name
      }
    })

    if (!exists) {
      await ChatCommands.create(cmd)
    }

    commands.append(command)
  })
}

module.exports = {
  COMMAND_TYPE_CUSTOM,
  COMMAND_TYPE_GENERAL,
  COMMAND_TYPES,
  initCommands
}
