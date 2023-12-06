const USER_BADGE_INFO = "badge-ingo";
const USER_BADGES = "badges";
const USER_BITS = "bits";
const USER_COLOR = "color";
const USER_DISPLAY_NAME = "display-name";
const USER_EMOTES = "emotes";
const USER_FIRST_MSG = "first-msg";
const USER_FLAGS = "flags";
const USER_IS_MOD = "mod";
const USER_ROOM_ID = "room-id";
const USER_IS_SUB = "subscriber";
const USER_CUSTOM_REWARD_ID = "custom-reward-id";
const USER_ID = "user-id";
const USER_TYPE = "user-type";
const USER_USERNAME = "username";
const USER_MESSAGE_PARAMS = "user-message-params";
const USER_TMI_SENT_STAMP = 'tmi-sent-ts'
const USER_MESSAGE_COMMAND = "user-message-command"

const getPublicAccessibleKeysAndDescriptions = () => {
  return {
    name: 'Viewers name',
  }
}

module.exports = {
  USER_BADGE_INFO,
  USER_BADGES,
  USER_BITS,
  USER_COLOR,
  USER_DISPLAY_NAME,
  USER_EMOTES,
  USER_FIRST_MSG,
  USER_FLAGS,
  USER_IS_MOD,
  USER_ROOM_ID,
  USER_IS_SUB,
  USER_CUSTOM_REWARD_ID,
  USER_ID,
  USER_TYPE,
  USER_USERNAME,
  USER_MESSAGE_PARAMS,
  USER_MESSAGE_COMMAND,
  USER_TMI_SENT_STAMP,
  getPublicAccessibleKeysAndDescriptions
};
