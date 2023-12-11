const moment = require("moment");
const { getCurrentUser } = require("../../../users");
const { getAllCurrentUserPlaylists, createPlaylist, addItemToPlaylist } = require("../../../playlists");
const { getBroadcaster } = require("../../../../broadcaster");
const { isEmpty } = require("../../../../support");

const getStreamPlaylistName = async (stream_id = null) => {
  const now = moment();
  const broadcaster = await getBroadcaster()

  // @TODO make this a setting int he admin dashboard
  //
  // <USER_DISPLAY_NAME> Stream Requests Playlist (#<USER_ID>) <TODAYS DATE MM-DD-YY>
  // AODEV Stream Requests Playlist (#100001) 12-01-23
  //

  return `${broadcaster.display_name} Stream Requests Playlist ${stream_id ? `(#${stream_id}) `:''}${now.format(`L`)}`
}

const getStreamPlaylist = async (stream_id = null) => {
  try {
    const currentUser = await getCurrentUser();
    const playlistResponse = await getAllCurrentUserPlaylists();
    const ownedPlaylists = playlistResponse.filter((p) => p.owner.id === currentUser.id);
    const streamPlaylistName = await getStreamPlaylistName(stream_id)
    const existingPlaylist = ownedPlaylists.find((p) => p.name === streamPlaylistName)
    if(!isEmpty(existingPlaylist)) {
      return existingPlaylist
    }

    // create it
    return createPlaylist(currentUser.id, {
      name: streamPlaylistName,
      description: `Automatically created by AODEVBOT on ${moment().format(`L`)}`,
      private: true,
      collaborative: false,
    });
  } catch (err) {
    console.log('checkStreamPlaylist', err);
  }
  return null;
}

/**
 * 
 * @param {SongRequest} SongRequest 
 * @param {*} stream_id 
 */
const addTrackToStreamPlaylist = async (SongRequest, stream_id = null) => {
  try {
    const playlist = await getStreamPlaylist(stream_id)
    return addItemToPlaylist(playlist.id, SongRequest.track_uri);
  } catch (err) {
    console.log('addTrackToStreamPlaylist', err)
  }
  return null;
}

module.exports = {
  checkStreamPlaylist: getStreamPlaylist,
  addTrackToStreamPlaylist
}