module.exports = async function () {
  const data = [];
  const twitch = require('../twitch');
  const subscriberTotal = await twitch.getSubscriberTotal();
  let subscriberGoal = subscriberTotal > 50 ? 100 : 50;
  subscriberGoal = Math.ceil(subscriberTotal / subscriberGoal) * subscriberGoal;

  data.push({
    title: 'Arbitrary AF Sub Goal',
    value: `<strong>${subscriberTotal}</strong> of ${subscriberGoal}`
  });

  const followerTotal = await twitch.getFollowersTotal();
  let followerGoal = followerTotal > 500 ? 500 : 250;
  followerGoal = Math.ceil(followerTotal / followerGoal) * followerGoal;

  data.push({
    title: 'Arbitrary AF Follower Goal',
    value: `<strong>${followerTotal}</strong> of ${followerGoal}`
  });

  return data;
}