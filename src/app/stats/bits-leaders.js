const moment = require('moment')
module.exports = async function () {
  const data = [];
  const Twitch = require('../twitch');
  const now = moment();

  const count = 1;
  let dailyLeader, monthlyLeader, yearlyLeader;

  const daily = await Twitch.getBitsLeaderboard({
    count, period: 'day', started_at: now.startOf('day').toISOString()
  })
  if (daily && daily.total > 0) {
    dailyLeader = await Twitch.getUser(daily.data[0].user_id);
    data.push({
      title: `Today's Leader`,
      value: daily.data[0].score,
      user: dailyLeader
    })
  }

  const monthly = await Twitch.getBitsLeaderboard({
    count, period: 'month', started_at: now.startOf('month').toISOString()
  })

  if (monthly && monthly.total > 0) {
    if ((dailyLeader && dailyLeader.id === monthly.data[0].user_id)) {
      monthlyLeader = dailyLeader;
    } else {
      monthlyLeader = await Twitch.getUser(monthly.data[0].user_id);
    }
    data.push({
      title: `Monthly Leader`,
      value: monthly.data[0].score,
      user: monthlyLeader
    })
  }

  const yearly = await Twitch.getBitsLeaderboard({
    count, period: 'year', started_at: now.startOf('year').toISOString()
  })
  if (yearly && yearly.total > 0) {
    if (dailyLeader && (dailyLeader.id === yearly.data[0].user_id)) {
      yearlyLeader = dailyLeader;
    } else if (monthlyLeader && (monthlyLeader.id === yearly.data[0].user_id)) {
      yearlyLeader = monthlyLeader
    } else {
      yearlyLeader = await Twitch.getUser(yearly.data[0].user_id);
    }
    data.push({
      title: `Bit Leader`,
      value: yearly.data[0].score,
      user: yearlyLeader
    })
  }
  return data;
}