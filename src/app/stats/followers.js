const { randomFromArray } = require('../support');
const { getBroadcasterTwitchId } = require('../broadcaster')

module.exports = async function () {
  const data = [];
  const broadcaster_id = await getBroadcasterTwitchId()
  const notBroadcaster = (a) => parseInt(a.user_id, 10) !== parseInt(broadcaster_id, 10)
  const twitch = require('../twitch');
  const followers = await twitch.getFollowers();
  if (followers.length > 0) {
    const random_follower = randomFromArray(followers.filter(notBroadcaster))
    const follower = await twitch.getUser(random_follower.user_id)
    data.push({
      title: '<strong>so!</strong> to follower',
      value: follower.display_name,
      user: follower
    })
  }

  const subscribers = await twitch.getSubscribers()
  if (subscribers && subscribers.length > 0) {
    const random_subscriber = randomFromArray(subscribers.filter(notBroadcaster))
    const subscriber = await twitch.getUser(random_subscriber.user_id)
    data.push({
      title: '<strong>so!</strong> to subscriber',
      value: subscriber.display_name,
      user: subscriber
    })
  }

  return data;
}