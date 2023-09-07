const { randomFromArray } = require('../support');

module.exports = async function () {
  const data = [];
  const twitch = require('../twitch');
  const followers = await twitch.getFollowers();
  if (followers.length > 0) {
    const follower = await twitch.getUser(randomFromArray(followers).from_id)

    data.push({
      title: '<strong>so!</strong> to follower',
      value: follower.display_name,
      user: follower
    })
  }

  const subscribers = await twitch.getSubscribers()
  if (subscribers.length > 0) {
    const subscriber = await twitch.getUser(randomFromArray(subscribers).user_id)
    data.push({
      title: '<strong>so!</strong> to follower',
      value: subscriber.display_name,
      user: subscriber
    })
  }

  return data;
}