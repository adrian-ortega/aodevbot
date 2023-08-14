const { plural } = require('./strings')
const { isString } = require('./index')

exports.ONE_SECOND = 1000
exports.ONE_MINUTE = 60 * 1000
exports.FIVE_MINUTES = 5 * 60 * 1000

const getTimeDifferenceInMilliseconds = (a, b) => {
  if (!b || b === 'now') b = new Date()
  if (isString(a)) a = new Date(a)
  if (isString(b)) b = new Date(b)
  return b.getTime() - a.getTime()
}

const getTimeDifferenceInSeconds = (a, b = null) => getTimeDifferenceInMilliseconds(a, b) / 1000

const getTimeDifferenceInMinutes = (a, b = null) =>
  (getTimeDifferenceInMilliseconds(a, b) / 60000).toFixed(2)

const getTimeDifferenceInHours = (a, b = null) =>
  (getTimeDifferenceInMilliseconds(a, b) / 3600000).toFixed(2)

const getTimeDifferenceInDays = (a, b = null) =>
  (getTimeDifferenceInMilliseconds(a, b) / (24 * 3600 * 1000)).toFixed(2)

const getTimeDifferenceInWeeks = (a, b = null) =>
  (getTimeDifferenceInMilliseconds(a, b) / (24 * 3600 * 1000 * 7)).toFixed(2)

const getTimeDifferenceInMonths = (a, b = null) =>
  (b.getMonth() + 12 * b.getFullYear() - (a.getMonth() + 12 * a.getFullYear())).toFixed(2)

const getTimeDifferenceInYears = (a, b = null) => (b.getFullYear() - a.getFullYear()).toFixed(2)

const getTimeDifferenceForHumans = (a, b = null) => {
  const s = getTimeDifferenceInSeconds(a, b)
  if (s < 60) return s < 30 ? 'seconds' : `${s} ${plural('second', s)}`

  const m = parseInt(getTimeDifferenceInMinutes(a, b), 10)
  if (m < 60) return `${m} ${plural('minute', m)}`

  const h = parseInt(getTimeDifferenceInHours(a, b), 10)
  if (h < 24) return `${h} ${plural('hour', h)}`

  const d = parseInt(getTimeDifferenceInDays(a, b), 10)
  if (d < 7) return `${d} ${plural('day', d)}`

  const w = parseInt(getTimeDifferenceInWeeks(a, b), 10)
  if (w < 4) return `${w} ${plural('week', w)}`

  const mo = parseInt(getTimeDifferenceInMonths(a, b), 10)
  if (mo < 12) return `${mo} ${plural('month', mo)}`

  const y = parseInt(getTimeDifferenceInYears(a, b), 10)
  return `${y} ${plural('year', y)}`
}

module.exports = {
  getTimeDifferenceForHumans,
  getTimeDifferenceInMilliseconds,
  getTimeDifferenceInSeconds,
  getTimeDifferenceInMinutes,
  getTimeDifferenceInHours,
  getTimeDifferenceInDays,
  getTimeDifferenceInWeeks,
  getTimeDifferenceInMonths,
  getTimeDifferenceInYears
}
