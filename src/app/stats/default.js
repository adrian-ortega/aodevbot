const getMultiplesOf = (num, max = 1000) => {
  const multiples = [];
  for (let i = 0; i < max; i++) {
    if(i % num === 0) multiples.push(i);
  }
  return multiples;
  
};
const getSmallestGoal = (value, map) => Math.min(...[...map].filter((mapValue) => mapValue > value))

module.exports = async function () {
  const data = [];
  const twitch = require('../twitch');

  const subscriberTotal = await twitch.getSubscriberTotal();
  let subscriberGoal = getSmallestGoal(subscriberTotal, getMultiplesOf(8, 1000))
  subscriberGoal = Math.ceil(subscriberTotal / subscriberGoal) * subscriberGoal;

  data.push({
    title: 'Arbitrary AF Sub Goal',
    value: `<strong>${subscriberTotal}</strong> of ${subscriberGoal}`
  });

  const followerTotal = await twitch.getFollowersTotal();
  let followerGoal = getSmallestGoal(followerTotal, getMultiplesOf(25, 50000));
  followerGoal = Math.ceil(followerTotal / followerGoal) * followerGoal;

  data.push({
    title: 'Arbitrary AF Follower Goal',
    value: `<strong>${followerTotal}</strong> of ${followerGoal}`
  });

  return data;
}