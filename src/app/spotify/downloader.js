const log = require("../log");
const logPrefix = "Spotify Tracks";
const client = require("./client");
const wss = require('../websockets')

exports.downloadTrack = async (id) => {
  try {
    wss.isBusy('spotify:download', id)
  } catch (err) {
    
  }

  wss.notBusy('spotify:download', id);
}

exports.downloadTracks = async (id) => {

}