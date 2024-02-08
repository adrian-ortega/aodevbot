const fs = require('fs');
const path = require('path');
const moment = require('moment');
const PassThrough = require('stream').PassThrough;
const { checkOrCreateDirectory } = require('../../support/files');
const { isEmpty } = require('../../support');
const { ABSPATH } = require('../../../config');

const MP3_STORAGE_PATH = path.join(ABSPATH, 'storage', 'mp3');

const downloadAndSaveTrack = async (track) => {
  checkOrCreateDirectory(MP3_STORAGE_PATH);

  let artists = [];
  for (let i = 0; i < track.artists.length; i++) {
    artists.push(track.artists[i].name);
  }
  artists = artists.join(' / ');
  const artistName = track.artists[0].name.replace(/\//g, ' - ');
  const artistPath = path.join(MP3_STORAGE_PATH, artistName);
  checkOrCreateDirectory(artistPath);

  const albumReleaseDate = moment(track.album.release_date)
  const almbumName = track.album.name.replace(/\//g, ' - ');
  const albumPath = path.join(artistPath, `${almbumName} [${albumReleaseDate.year()}]`);
  checkOrCreateDirectory(albumPath);

  const trackName = track.name.replace(/\//g, ' - ')
  const filePath = path.join(albumPath, `${artistName} - ${trackName}.mp3`);

  const fileOutStream = fs.createWriteStream(filePath);
  const stream = new PassThrough();

  // @TODO PULL THE MP3 STREAM, PLAY IT? AND DOWNLOAD IT
  // this is from spotify-web

  return {
    artistPath,
    albumPath,
    filePath
  }
}


exports.downloader = async (req, res) => {
  const Spotify = require('../../spotify');
  const { track: trackIds } = req.query;

  if(isEmpty(trackIds)) {
    return res.send({
      message: 'Missing Track'
    })
  }

  // if(!Spotify.validateTrackIDs(trackIds)) {
  //   return res.send({
  //     message: 'Invalid Track ID'
  //   })
  // }

  const results = [];
  const tracks = await Spotify.getTracks(trackIds);
  for (let tIdx = 0; tIdx < tracks.length; tIdx++) {
    results.push(await downloadAndSaveTrack(tracks[tIdx]));
  }
  return res.send(results);
}