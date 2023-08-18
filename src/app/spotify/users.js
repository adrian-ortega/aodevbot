const log = require("../log");
const logPrefix = "Spotify Users";
const client = require("./client");

exports.getCurrentUser = async () => {
  try {
    const { data } = await client.get("/me");
    return data;
  } catch (err) {
    log.error("getCurrentUser", { message: err.message }, logPrefix);
  }

  return null;
};
