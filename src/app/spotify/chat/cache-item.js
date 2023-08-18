class SpotifyPlayerCacheItem {
  constructor(data) {
    this.data = data;
  }

  update(newData) {
    this.data = { ...this.data, ...newData };
    return this;
  }
}

module.exports = SpotifyPlayerCacheItem;
