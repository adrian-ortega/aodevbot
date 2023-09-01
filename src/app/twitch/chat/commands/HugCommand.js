const { KeyValue } = require('../../../models');
const { isEmpty, randomFromArray } = require('../../../support');
const { getUser } = require('../../users');
const { botMessageReply } = require('../commands');
const { USER_MESSAGE_PARAMS, USER_ID, USER_DISPLAY_NAME } = require("../state-keys");
const slugify = require('slugify')

const getUserStats = async (twitch_id, friend = null) => {
  let item_key = `cmd_hug_count_${twitch_id}`
  if (!isEmpty(friend)) {
    item_key += ` ${friend}`
  }

  item_key = slugify(item_key);

  const [model] = await KeyValue.findOrCreate({
    where: {
      item_key
    },
    defaults: {
      item_key,
      item_value: 0
    }
  });

  return model;
}

const getRandomReply = (state, count) => randomFromArray([
  `Here's a hug for you @${state[USER_DISPLAY_NAME]} 🫂🥰`,
  `You've gotten ${count} hugs @${state[USER_DISPLAY_NAME]}, here's one more 🥰`,
  count > 5 ? `We love @${state[USER_DISPLAY_NAME]}! Here's another hug to add to your ${count} hugs 🫂🥰` : null,
  count > 20 ? `At this point, we should get married @${state[USER_DISPLAY_NAME]}. 🫂🥰` : null,
].filter(a => a))

const getRandomFriendReply = (state, friend, count) => randomFromArray([
  `Awe! @${state[USER_DISPLAY_NAME]} hugged @${friend} 🫂🥰`,
  `${state[USER_DISPLAY_NAME]} hugged @${friend} and squeezed dem cheeks 👀`,
  `@${state[USER_DISPLAY_NAME]} hugs @${friend}... ${count > 0 ? `they've hugged ${count} times` : 'this is a first 👀'}`,
  count > 5 ? `Man, @${state[USER_DISPLAY_NAME]} really likes hugging @${friend}. Here's another 🫂🥰` : null,
  count > 20 ? `Ya'll must be in love @${state[USER_DISPLAY_NAME]} and @${friend}` : null
].filter(a => a))

exports.name = ["hug", "hugs", "abrazo"];
exports.description = "Will reply with a hug comment";
exports.handle = async (
  message,
  state,
  channel,
  { client },
  resolve,
) => {
  const broadcast = require('../../../websockets').broadcastToClients
  let [friend] = state[USER_MESSAGE_PARAMS];
  let count, reply;

  if (!isEmpty(friend)) {
    const friendData = await getUser(friend.toString().replace('@', '').trim())
    count = await getUserStats(state[USER_ID], friendData ? friendData.id : friend)
    reply = getRandomFriendReply(state, friend, count.item_value)
  } else {
    count = await getUserStats(state[USER_ID])
    reply = getRandomReply(state, count.item_value)
  }

  await client.say(channel, botMessageReply(reply))
  broadcast({
    event: 'hug-command',
    payload: {
      count: count.item_value,
      reply,
      friend,
      state,
    }
  })
  resolve(reply)
  await count.update({
    item_value: count.item_value + 1
  })
};
