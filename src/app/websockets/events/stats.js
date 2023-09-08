const next = ({ timestamp }) => {
  const stats = require('../../stats')
  return stats.fastForward(timestamp);
}

const current = ({ timestamp }) => {
  const stats = require('../../stats')
  return stats.getCurrent(timestamp);
}

const stop = ({ timestamp }) => {
  const { broadcastToClients } = require('../')
  broadcastToClients({ event: 'stats.stop', payload: { timestamp } })
}

module.exports = {
  next,
  current,
  stop
}