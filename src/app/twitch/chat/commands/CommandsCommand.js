const { getValue, isArray } = require('../../../support')
const { USER_DISPLAY_NAME } = require('../state-keys')

exports.name = 'commands'
exports.description = 'Lists out available commands in chat.'
exports.handle = (message, state, channel, { client, commands }, resolve) => {
  let available = commands
    .getAll()
    .map((c) => getValue(c.name))
    .map((c) => {
      if (isArray(c)) c = c[0]
      return `!${c}`
    })

  const reply = commands.botMessageReply(
    `Hey ${state[USER_DISPLAY_NAME]}, here's a list of available commands: ${available.join(', ')}`
  )
  client.say(channel, reply)
  resolve(reply)
}
