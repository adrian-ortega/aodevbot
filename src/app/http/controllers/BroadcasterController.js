const {
  getBroadcaster,
  getSecondaryBroadcaster,
} = require("../../broadcaster");

exports.getBroadcaster = async (req, res) => {
  let data;
  try {
    data = await getBroadcaster();
  } catch (err) {
    data = {
      type: 1,
      error: true,
      message: err.message,
    };
  }
  res.send(data);
};

exports.getSecondaryBroadcaster = async (req, res) => {
  let data;
  try {
    data = await getSecondaryBroadcaster();
  } catch (err) {
    data = {
      type: 2,
      error: true,
      message: err.message,
    };
  }
  res.send(data);
};

// @TODO move this to the spotify controller?
//
exports.getSpotifyAccount = async (req, res) => {
  let data;
  const Spotify = require("../../spotify");
  try {
    const spotifyData = await Spotify.getCurrentUser();
    data = {
      id: spotifyData.id,
      display_name: spotifyData.email,
    };
  } catch (err) {
    data = {
      type: "spotify",
      error: true,
      message: err.message,
    };
  }
  res.send(data);
};
