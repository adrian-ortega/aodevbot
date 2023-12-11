const log = require("../log");
const logPrefix = "Spotify Playlists";
const client = require("./client");

const createPlaylist = async (user_id, {
  name,
  public = true,
  collaborative = false,
  description = ''
}) => {
  try {
    const { data } = await client.post(`/users/${user_id}/playlists`, {
      name, public, collaborative, description
    })
    return data;
  } catch (err) {
    
  }
}

const addItemsToPlaylist = async (playlist_id, position = undefined, uris = []) => {
  try {
    const { data } = await client.post(`/playlists/${playlist_id}/tracks`, {
      uris, position
    })
    return data;
  } catch (err) {
    
  }
  return null
}

const addItemToPlaylist = async (playlist_id, uri) => {
  return addItemsToPlaylist(playlist_id, undefined, [ uri ])
}

const getCurrentUserPlaylists = async (limit = 20, offset = 0) => {
  try {
    const { data } = await client.get("/me/playlists", {
      params: {
        limit,
        offset,
      },
    });
    return data;
  } catch (err) {
    log.error(
      "getCurrentUserPlaylists",
      {
        message: err.message,
        data: err.response && err.response.data ? err.response.data : {},
      },
      logPrefix,
    );
  }
  return null;
};

const getAllCurrentUserPlaylists = async () => {
  const limit = 20;
  let playlists = [];
  try {
    let response = await getCurrentUserPlaylists(limit)
    playlists = [...response.items];
    while(response.total !== playlists.length) {
      response = await getCurrentUserPlaylists(limit, response.offset + limit)
      playlists = [...playlists, ...response.items];
    }
  } catch (err) {
    console.log(err);
  }
  return playlists;
}

module.exports = {
  getCurrentUserPlaylists,
  getAllCurrentUserPlaylists,
  createPlaylist,
  addItemsToPlaylist,
  addItemToPlaylist
}
