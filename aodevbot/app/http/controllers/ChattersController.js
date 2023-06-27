exports.list = (req, res) => {
  res.send('Controller `list` not implemented.');
};

const db = require('../../models');
const Chatters = db.chatters; m

exports.detail = (req, res) => {
  res.send('Controller `detail` not implemented.');
};

exports.create = (req, res) => {
  if (req.body.twitch_id) {
    return res.status(400).send({
      message: "Content empty"
    });
  }

  const chatter = {
    twitch_id: req.body.twitch_id,
    username: req.body.username || '',
    display_name: req.body.display_name || ''
  };

  Chatters.create(chatter).then(data => {
    res.send(data);
  }).catch(err => {
    res.status(500).send({
      message: err.message || "Something went wrong"
    })
  });
};

exports.update = (req, res) => {
  res.send('Controller `update` not implemented.');
};

exports.destroy = (req, res) => {
  res.send('Controller `destroy` not implemented.');
};
