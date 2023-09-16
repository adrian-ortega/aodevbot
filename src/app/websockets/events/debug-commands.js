const { Chatters } = require("../../models");
const { objectHasProp } = require("../../support");
const { getChatBotAccount } = require("../../twitch");
const { createTmiChatState } = require('./chat-message')

const TRIGGER_MAP = {
  'c8a98169-d9fc-42fd-9996-0bcc444502be': 'firstToChat'
}
const triggerRedeemableEvent = async ({ chatter_id, twitch_id, data, message }, args, ws) => {
  if (!data.id || !objectHasProp(TRIGGER_MAP, data.id)) return;
  const { broadcastToClients } = require('../../websockets')

  let Chatter = await Chatters.findByPk(chatter_id);
  if (!Chatter && twitch_id) {
    Chatter = await Chatters.findOne({
      where: {
        twitch_id
      }
    })
  }

  if (!Chatter) {
    return null;
  }

  broadcastToClients({
    event: 'redeemable',
    redeem: {
      type: TRIGGER_MAP[data.id],
      payload: {
        name: Chatter.display_name,
        message,
        user: createTmiChatState(Chatter, await getChatBotAccount())
      }
    }
  })
  console.log({ payload: { data, message }, args })
}

module.exports = {
  triggerRedeemableEvent
}