const {
  getBroadcaster,
  isBroadcaster,
  getBroadcasterTwitchId,
} = require("../broadcaster");
const log = require("../log");
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
  from_id,
  first = 100,
  after = null,
  is_broadcaster = false,
) => {
  try {
    let to_id = await getBroadcasterTwitchId();
    if (from_id === to_id) {
      to_id = null;
    }

    if (is_broadcaster) {
      to_id = from_id;
      from_id = null;
    }
    const { data } = await client.get("/helix/users/follows", {
      params: { from_id, to_id, first, after: after || undefined },
    });
    return data;
  } catch (err) {
    log.error('getUserFollowers', { message: err.message }, logPrefix);
  }
  return null;
};

const getFollowersTotal = async (to_id) => {
  try {
    if (!to_id) {
      to_id = await getBroadcasterTwitchId();
    }
    const { data: responseData } = await client.get("/helix/users/follows", {
      params: { to_id, first: 1 },
    });
    return responseData.total;
  } catch (err) {
    log.error('getFollowersTotal', { message: err.message }, logPrefix);
  }
  return 0;
}

const getFollowers = async (twitch_id = null) => {
  try {
    if (!twitch_id) {
      const Broadcaster = await getBroadcaster();
      twitch_id = Broadcaster.twitch_id;
    }

    const is_broadcaster = await isBroadcaster(twitch_id);

    let response = await getUserFollowers(twitch_id, 100, null, is_broadcaster);
    let data = response.data;
    while (response.pagination.cursor) {
      response = await getUserFollowers(
        twitch_id,
        100,
        response.pagination.cursor,
        is_broadcaster,
      );
      data = [...data, ...response.data];
    }
    return data;
  } catch (err) {
    log.error(
      "getFollowers",
      {
        message: err.message,
      },
      logPrefix,
    );
  }
  return [];
};

const getUser = async (id) => {
  try {
    const params = { first: 1, id: null };
    if (id) {
      if (isNaN(id)) {
        params.login = id;
      } else {
        params.id = id;
      }
    }
    const { data: responseData } = await client.get("/helix/users", { params });
    const { data } = responseData;
    return data.length > 0 ? data[0] : null;
  } catch (err) {
    log.error(
      "getUser",
      {
        message: err.message,
      },
      logPrefix,
    );
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
