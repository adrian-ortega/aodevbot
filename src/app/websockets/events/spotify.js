const { broadcastCurrent } = require('../../spotify/loop')

const playResume = async () => {
  const Spotify = require('../../spotify')
  return Spotify.playResume();
}

const pause = async () => {
  const Spotify = require('../../spotify')
  return Spotify.pause();
}

const skipNext = async () => {
  const Spotify = require('../../spotify')
  return Spotify.skipToNext()
}
const skipPrevious = async () => {
  const Spotify = require('../../spotify')
  return Spotify.skipToPrevious()
}

module.exports = {
  current: broadcastCurrent,
  playResume,
  pause,
  skipNext,
  skipPrevious
}