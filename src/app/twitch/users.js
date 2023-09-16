const { getBroadcasterTwitchId } = require("../broadcaster");
const log = require("../log");
const { isString, isNumeric } = require("../support");
const logPrefix = "Twitch Users";
const client = require("./client");

const getSubscriptions = async (broadcaster_id, after = null) => {
  try {
    const params = { broadcaster_id }
    if (after) {
      params.after = after;
    }
    const { data: responseData } = await client.get('/helix/subscriptions', { params })
    return responseData;
  } catch (err) {
    log.error('getSubscriptions', { message: err.message }, logPrefix);
  }
}

const getSubscriberTotal = async (broadcaster_id) => {
  if (!broadcaster_id) {
    broadcaster_id = await getBroadcasterTwitchId();
  }
  const response = await getSubscriptions(broadcaster_id);
  return response.total;
}

const getSubscribers = async (broadcaster_id) => {
  if (!broadcaster_id) {
    broadcaster_id = await getBroadcasterTwitchId();
  }
  let response = await getSubscriptions(broadcaster_id, null);
  let data = response.data;
  while (response.pagination.cursor) {
    response = await getSubscriptions(
      broadcaster_id,
      response.pagination.cursor,
    );
    data = [...data, ...response.data];
  }
  return data;
}

const getUserFollowers = async (
  first = 100,
  after = undefined,
  user_id = undefined
) => {
  try {
    const { data } = await client.get("/helix/channels/followers", {
      params: {
        user_id: user_id || undefined,
        broadcaster_id: await getBroadcasterTwitchId(),
        first,
        after
      },
    });
    return data;
  } catch (err) {
    const data = err.response && err.response.data ? err.response.data : {}
    log.error('getUserFollowers', { message: err.message, data }, logPrefix);
  }
  return null;
};

const getFollowersTotal = async () => {
  try {
    const response = await getUserFollowers(1);
    return response.total;
  } catch (err) {
    const data = err.response && err.response.data ? err.response.data : {}
    log.error('getFollowersTotal', { message: err.message, data }, logPrefix);
  }
  return 0;
}

const getFollowers = async () => {
  try {
    let response = await getUserFollowers(100);
    let data = response ? response.data : [];
    while (response && response.pagination && response.pagination.cursor) {
      response = await getUserFollowers(100, response.pagination.cursor);
      data = [...data, ...response.data];
    }
    return data;
  } catch (err) {
    const data = err.response && err.response.data ? err.response.data : err
    log.error("getFollowers", { message: err.message, data }, logPrefix);
  }
  return [];
};

const getUser = async (id) => {
  try {
    const params = { first: 1, id: null };
    if (id) {
      if (!isNumeric(id)) {
        params.login = id;
      } else {
        params.id = id;
      }
    }
    const { data: responseData } = await client.get("/helix/users", { params });
    const { data } = responseData;
    return data.length > 0 ? data[0] : null;
  } catch (err) {
    const data = err.response && err.response.data ? err.response.data : {}
    log.error("getUser", { id, message: err.message, data }, logPrefix);
  }

  return null;
};

module.exports = {
  getUser,
  getFollowers,
  getFollowersTotal,
  getSubscribers,
  getSubscriberTotal,
};
