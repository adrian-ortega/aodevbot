const log = require("../log").withPrefix('Twitch Tokens');
const chalk = require('chalk');
const { getBroadcaster } = require("../broadcaster");
const { Tokens } = require("../models");

const token_type = `twitch`

let currentToken;
let currentTokenOverride = false;

/**
 * @returns {Tokens|null|undefined}
 */
exports.loadAccessToken = async (chatter_id = null) => {
  if (!currentTokenOverride) {
    try {
      if (!chatter_id) {
        const broadcaster = await getBroadcaster();
        chatter_id = broadcaster.id;
      }

      const results = await Tokens.findAll({
        where: {
          chatter_id,
          token_type,
        },
        limit: 1,
        order: [["expires", "DESC"]],
      });
      const token = results.shift();
      if (token) {
        currentToken = token;
      }
    } catch (err) {
      log.error("Twitch.tokens.load", { message: err.message, }, logPrefix);
    }
  }
  return currentToken && currentToken instanceof Tokens ? currentToken : null;
};

/**
 * @returns {String}
 */
exports.getTokenType = () => token_type;

/**
 * 
 * @returns {null|undefined|Tokens}
 */
exports.getToken = () => currentToken;

/**
 * @returns {String}
 */
exports.getAccessToken = () =>
  currentToken ? currentToken.access_token : null;

/**
 * @returns {String}
 */
exports.getRefreshToken = () =>
  currentToken ? currentToken.refresh_token : null;

/**
 * 
 * @param {Boolean} override 
 * @param {Tokens} tokenOverride 
 */
exports.overrideCurrentToken = (override, tokenOverride) => {
  currentTokenOverride = override;
  if (override && (tokenOverride && tokenOverride instanceof Tokens)) {
    currentToken = tokenOverride;
  }
};
