const client = require("./client");

exports.getCurrentUser = async () => {
  try {
    const { data } = await client.get("/me");
    return data;
  } catch (err) {
    console.log(err);
  }

  return null;
};
