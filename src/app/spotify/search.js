const client = require("./client");

exports.search = async (
  q,
  limit = 10,
  page = 1,
  type = "track",
  market = "US",
) => {
  try {
    const offset = (page - 1) * limit;
    const params = { q, limit, offset, type, market };
    const { data } = await client.get("/search", { params });
    return data;
  } catch (err) {
    console.log(err.response);
  }
  return null;
};
