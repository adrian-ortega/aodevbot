const { Chatters } = require('../../models');
const spotifyTokens = require('../../spotify/tokens');
const twitchTokens = require('../../twitch/tokens');
const {
  getBroadcaster,
  getSecondaryBroadcaster,
} = require("../../broadcaster");

/**
 * @param {Chatters} Broadcaster 
 */
const transformBroadcaster = async (Broadcaster) => {
  if (!(Broadcaster instanceof Chatters)) return Broadcaster;
  const data = {
    chatter_id: Broadcaster.id,
    twitch_id: Broadcaster.twitch_id,
    username: Broadcaster.username,
    display_name: Broadcaster.display_name,
    broadcaster_type: Broadcaster.broadcaster,
    profile_image_url: Broadcaster.profile_image_url,
    tokens: {}
  }

  const spotifyToken = await spotifyTokens.loadAccessToken(Broadcaster.id);
  if (spotifyToken) {
    data.tokens.spotify = {
      expires_at: spotifyToken.expires.getTime(),
      updated_at: spotifyToken.updated_at.getTime()
    }
  }

  const twitchToken = await twitchTokens.loadAccessToken(Broadcaster.id);
  if (twitchToken) {
    data.tokens.twitch = {
      expires_at: twitchToken.expires.getTime(),
      updated_at: twitchToken.updated_at.getTime()
    }
  }


  return data;
}

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
  res.send(await transformBroadcaster(data));
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
  res.send(await transformBroadcaster(data));
};

// @TODO move this to the spotify controller?
//
exports.getSpotifyAccount = async (req, res) => {
  let data;
  const Spotify = require("../../spotify");
  try {
    const spotifyData = await Spotify.getCurrentUser();
    data = {
      spotify_id: spotifyData.id,
      display_name: spotifyData.email,
      tokens: {}
    };

    const spotifyToken = await Spotify.loadAccessToken();
    if (spotifyToken) {
      data.tokens.spotify = {
        expires_at: spotifyToken.expires.getTime(),
        updated_at: spotifyToken.updated_at.getTime()
      }
    }

  } catch (err) {
    data = {
      type: "spotify",
      error: true,
      message: err.message,
    };
  }
  res.send(data);
};
