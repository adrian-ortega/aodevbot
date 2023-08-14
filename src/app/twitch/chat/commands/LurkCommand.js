const { KeyValue } = require("../../../models");
const { USER_ID, USER_USERNAME, USER_DISPLAY_NAME } = require("../state-keys");
const { getValues, randomFromArray } = require("../../../support");
const {
  getTimeDifferenceForHumans,
  getTimeDifferenceInDays,
  getTimeDifferenceInHours,
} = require("../../../support/time");
const { botMessageReply } = require("../commands");

/**
 * @param {String} message
 * @param {Object} state
 * @returns {KeyValue}
 */
const getStoredOrCreateLurkPoint = async (message, state) => {
  const twitch_id = state[USER_ID];
  const item_key = `cmd_lurk_${twitch_id}_ts`;
  const keyValueResults = await KeyValue.findOrCreate({
    where: { item_key },
    limit: 1,
    defaults: {
      item_key,
      item_value: {
        [USER_ID]: state[USER_ID],
        message,
        [USER_USERNAME]: state[USER_USERNAME],
        timestamp: new Date(),
      },
    },
  });
  return keyValueResults.shift();
};

const getRandomUnwlecomeMessage = (state, { timestamp, duration }) => {
  const name = state[USER_DISPLAY_NAME];
  return randomFromArray(
    getValues([
      `${name}, I could just erase the last time you started to lurk, ${duration} ago... just use !unlurk.`,
      `Yo, ${name}, you've been lurking for ${duration}.`,
      `Love you bud... but you've been lurking for ${duration}`,
      () => {
        if (getTimeDifferenceInDays(timestamp) > 1) {
          return "Wow you've been gone for more than a day man. What were you doin? did you forget you already lurked?";
        }

        const h = getTimeDifferenceInHours(timestamp);
        switch (true) {
          case h < 1:
            return `You know you lurked less than an hour ago right? ${name}?`;

          case h < 2:
            return `You lurked a couple hours ago mate... you good? ${name}?`;

          default:
            return `Damn ${name}, you were gone for ${duration} the last time you lurked.`;
        }
      },
    ]),
  );
};

const getRandomMessage = (state) => {
  const name = state[USER_DISPLAY_NAME];
  return randomFromArray([
    `I don't event know my purpose anymore. Anyway, enjoy your poop ${name}`,
    `Enjoy your lurk ${name}! We'll be here when you get back.`,
    `Thank you for using the AODEVBOT lurk/unlurk system, ${name}. We'll be here when you get back.`,
    `Thank you for the lurk ${name}.`,
    "You know the best thing about waking up is having folgers in your cup? I'll be the folgers in your cup bb.. when you get back.",
    `Hey, my name’s Microsoft. Can I crash at your place tonight? oh uh I mean... uh... have a great lurk ${name}.`,
    `If you were a chicken, ${name}, you’d be impeccable. Have a good lurk bb.`,
    `Baby, if you were words on a book... you'd be fine print. Have a nice lurk ${name}.`,
    `Oh ${name}, I was feeling a little off today — but now you’ve gone and turned me on again! Have a nice lurk bb.`,
    `They say nothing lasts forever — so would you be my nothing, ${name}?. Have a nice lurk, bb.`,
    `Thank you for the lurk ${name}!`,
  ]);
};

exports.name = "lurk";
exports.description =
  "Will keep track of timestamps when chatters go on !lurk.";

exports.handle = async (message, state, channel, { client }, resolve) => {
  const saved = await getStoredOrCreateLurkPoint(message, state);
  const data = saved.item_value;
  const timestamp = new Date(data.timestamp);
  if (!saved._options.isNewRecord) {
    return client.say(
      channel,
      botMessageReply(
        getRandomUnwlecomeMessage(state, {
          timestamp,
          duration: getTimeDifferenceForHumans(timestamp),
        }),
      ),
    );
  }

  client.say(channel, botMessageReply(getRandomMessage(state)));
};
