const log = require("../log");
const logPrefix = "Spotify Users";
const client = require("./client");

exports.getCurrentUser = async () => {
  try {
    const { data } = await client.get("/me");
    return data;
  } catch (err) {
    const data = err.response && err.response.data ? err.response.data : {}
    log.error("getCurrentUser", { message: err.message, data }, logPrefix);
  }

  return null;
};
