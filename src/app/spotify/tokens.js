const { getBroadcaster } = require("../broadcaster");

let currentToken;

exports.loadAccessToken = async () => {
  try {
    const broadcaster = await getBroadcaster();
    const token = broadcaster.tokens.find((a) => a.token_type === "spotify");
    if (token) {
      currentToken = token;
    }
  } catch (err) {
    //
  }

  return currentToken;
};

exports.getAccessToken = () =>
  currentToken ? currentToken.access_token : null;
