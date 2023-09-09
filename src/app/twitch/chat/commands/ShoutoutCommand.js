const { randomFromArray } = require("../../../support");
const { botMessageReply } = require("../commands");
const { USER_MESSAGE_PARAMS, USER_DISPLAY_NAME } = require("../state-keys");

const getRandomChannelShoutout = ({ broadcaster_name, game_name }, link) => {
  return randomFromArray([
    `Check out ${broadcaster_name}! They were last playing ${game_name} over at ${link}.`,
    `Follow ${broadcaster_name} at ${link}. They were last streaming ${game_name}`,
    `I think you'll enjoy watching ${broadcaster_name} stream at ${link}. They were last streaming ${game_name}`
  ])
}

const getRandomShoutout = ({ broadcaster_name }, link) => {
  const linkText = `Check out ${broadcaster_name} over at ${link}`;
  return randomFromArray([
    `Hey ${broadcaster_name}, aside from being sexy, what do you do for a living? aodevUwu ${linkText}`,
    `Hey ${broadcaster_name}, I changed my name to Microsoft, can I crash at your place tonight? aodevUwu ${linkText}`,
    `${broadcaster_name} is an awesome person and deserves a follow! Check them out! aodevUwu ${link}`,
    `${broadcaster_name}, if you were words on a page, you'd be fine print. ${linkText}`,
    `Are you a magician ${broadcaster_name}? Because when I'm looking at you, you make everyone else disappear! aodevUwu ${linkText}`,
    `Hey ${broadcaster_name}, I've lost my pants... can I get in yours? aodevUwu ${linkText}`
  ]);
}

exports.name = ['shoutout', 'so', 'shout'];

exports.description = "Will shout out a user and try to retrieve their last broadcast information.";
exports.handle = async (
  message,
  state,
  channel,
  { client, commands },
  resolve,
) => {
  const { broadcastToClients } = require("../../../websockets");
  const twitch = require('../../../twitch');

  // @TODO lock to only subs and moderators?
  // @TODO params that have the same first two letters as the command name, will get trimmed
  //       !so something` will return `mething` as the first param
  //

  let [target_user] = state[USER_MESSAGE_PARAMS];
  if (!target_user || target_user.length === 0) {
    client.say(channel, botMessageReply(`Hmm, looks like you forgot something ${state[USER_DISPLAY_NAME]}`));
    return resolve('Missing params')
  }

  target_user = target_user.split(' ').map((a) => a.trim().replace(/\s|!|@|\./g, ''))[0]
  const channelData = await twitch.getChannelInformation(target_user)
  if (!channelData) {
    client.say(channel, botMessageReply(`So uh, this is embarrasing, I couldn't find ${target_user}...`))
    return resolve('User not found')
  }

  const channelLink = `https://twitch.tv/${channelData.broadcaster_login}`
  const reply = channelData.game_id
    ? botMessageReply(getRandomChannelShoutout(channelData, channelLink))
    : botMessageReply(getRandomShoutout(channelData, channelLink))

  client.say(channel, reply);
  resolve(reply)

  const clips = await twitch.getUserClips(channelData.broadcaster_id, 1);
  const userData = await twitch.getUser(channelData.broadcaster_id);

  broadcastToClients({
    event: 'shoutout',
    payload: {
      channel: { ...channelData },
      user: { ...userData },
      reply,
      clips: [...clips].map(clip => {
        return {
          ...clip,
          src_url: clip.thumbnail_url.replace(/-preview.*/, '.mp4')
        }
      }),
    }
  })
};
