const { KeyValue } = require("../../../models");
const { randomFromArray, getValues } = require("../../../support");
const {
  getTimeDifferenceForHumans,
  getTimeDifferenceInDays,
  getTimeDifferenceInMinutes,
  getTimeDifferenceInHours,
} = require("../../../support/time");
const { botMessageReply } = require("../commands");
const { USER_ID, USER_DISPLAY_NAME } = require("../state-keys");

const getStoredLurkItem = async (twitch_id) =>
  KeyValue.findOne({
    where: { item_key: `cmd_lurk_${twitch_id}_ts` },
  });

const getRandomUnwelcomeMessage = (state) => {
  const name = state[USER_DISPLAY_NAME];
  return randomFromArray([
    `Hey... wait a minute... you weren't lurking AT ALL ${name}. What are you trying to pull?`,
    `Dude, both you and I know you weren't lurkin' at all. Were you? ${name}? huh?`,
    `Listen, ${name}, I know I'm old and forget things, but I know for sure you weren't lurkin`,
    `Nope, can't find ya ${name}. When did you go on lurk?`,
    `Sorry ${name}, can't find ya.`,
    `Hey, ${name}, next time use the !lurk command so I can keep track of how long you were gone aodevUwu`,
  ]);
};

const getRandomReturnMessage = (state, { duration, timestamp }) => {
  const name = state[USER_DISPLAY_NAME];
  return randomFromArray(
    getValues([
      `Hey! EVERYONE! ${name} is back! They were gone for ${duration}`,
      `Welcome back ${name}! You were gone for ${duration}. Not bad, what were you doin' huh?`,
      `EVERYBODY SAY WELCOME BACK TO ${name.toUpperCase()}. Now, I don't know about you, but it's never taken me ${duration} to boil an egg.`,
      `How long does it take you to poop? Apparently it takes ${name} ${duration}... welcome back!`,
      `Welcome back ${name}, you were gone for only gone for ${duration}`,
      `Welcome back ${name} and congratulations on using the lurk/unlurk system correctly! You were gone for only ${duration}! Nice job.`,
      () => {
        if (getTimeDifferenceInDays(timestamp) > 1) {
          return "Wow you've been gone for more than a day man. What were you doin?";
        }

        const m = getTimeDifferenceInMinutes(timestamp);
        if (m < 60) {
          switch (true) {
            case m < 10:
              return `Welcome back, ${name}! Did you just go get a snack? you were only gone for ${duration}`;

            case m < 15:
              return `How was your visit to the potty, ${name}?`;

            case m < 35:
              return `Did you make yourself a snack ${name}? Welcome back!`;

            default:
              return `Welcome back ${name}, you weren't long for long. Have a seat and enjoy the show!`;
          }
        }

        const h = getTimeDifferenceInHours(timestamp);
        switch (true) {
          case h < 1:
            return `How was your poop, ${name}?`;

          case h < 2:
            return `What takes ${duration} to do? Did you make me a cake, ${name}?`;

          default:
            return `Damn ${name}, you were gone for ${duration}. Anyway welcome back!`;
        }
      },
    ]),
  );
};

exports.name = "unlurk";
exports.description =
  "Will check to see if a user has lurked in the past to welcome them back. It also shames...";

exports.handle = async (message, state, channel, { client }, resolve) => {
  const saved = await getStoredLurkItem(state[USER_ID]);
  let chatMessage;
  if (saved) {
    const timestamp = new Date(saved.item_value.timestamp);
    chatMessage = getRandomReturnMessage(state, {
      timestamp,
      duration: getTimeDifferenceForHumans(timestamp),
    });
    await KeyValue.destroy({ where: { id: saved.id } });
  } else {
    chatMessage = getRandomUnwelcomeMessage(state);
  }

  client.say(channel, botMessageReply(chatMessage));
  return chatMessage;
};

exports.examples = () => {
  return [
    {
      example: '!unlurk',
      description: 'No special bells and whistles, just run it'
    }
  ]
}
