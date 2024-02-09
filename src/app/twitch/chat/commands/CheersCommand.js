const { KeyValue } = require('../../../models');
const { randomFromArray } = require('../../../support');
const { stringFormat } = require('../../../support/strings');
const { botMessageReply } = require('../commands');
const { USER_ID, USER_MESSAGE_COMMAND_NAME, USER_DISPLAY_NAME } = require('../state-keys');

const getUserStats = async (twitch_id) => {
  const item_key = `cmd_cheers_count_${twitch_id}`
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

const CHEER_REPLIES = [
  {
    names: ["cheers", "prohst", "sante", "prohst", "kippis"],
    replies: [
      "Cheers man! This goes out to you @{0}!",
      "Hey @{0}, that's {1} this round! Cheers bubba.",
      "🍻🍺🍻🍺 {0} 🍻🍺🍻🍺",
    ],
  },
  {
    names: ["salud", "salute"],
    replies: [
      "'pa riba, pal centro, y pa dentro @{0}!",
      "🍻🍺🍻🍺 {0} 🍻🍺🍻🍺",
    ],
  },
  {
    names: ["kippis"],
    replies: ["Ja kulaus! @{0}", "🍻🍺🍻🍺 {0} 🍻🍺🍻🍺"],
  },
  {
    names: ["kanpai"],
    replies: ["かんぱーい！@{0}", "🍻🍺🍻🍺 {0} 🍻🍺🍻🍺"],
  },
];

exports.name = () =>
  CHEER_REPLIES.map((r) => r.names).reduce(
    (acc, names) => [...acc, ...names],
    [],
  );

exports.description =
  "Will reply CHEERS in the correct language to the user and keep count of the times the user has cheers-ed us.";

exports.examples = () => [{ example: '!salud' }, { example: '!cheers' }]
exports.handle = async (
  message,
  state,
  channel,
  { client, commands },
  resolve,
) => {
  const count = await getUserStats(state[USER_ID]);
  const repo = CHEER_REPLIES.find(o => o.names.includes(state[USER_MESSAGE_COMMAND_NAME]))
  const reply = stringFormat(randomFromArray(repo.replies), [
    state[USER_DISPLAY_NAME],
    count.item_value
  ])
  client.say(channel, botMessageReply(reply)).then(() => resolve(reply))
};
