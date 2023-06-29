const db = require('../../models');
const { Chat } = db;

exports.create = (req, res) => {
  if (!req.body.message_content || !req.body.chatter_id) {
    return res.status(400).send({
      message: "Missing content"
    });
  }

  // @TODO look for chatter, if not found,
  //       create new chatter instance before
  //       creating new chat (msg) instance

  // @TODO pull Stream Data, save if necessary, 
  //       then use stream_id

  const chat = {
    chatter_id: req.body.chatter_id,

    // @TODO pull this live!
    stream_id: 1,
    message_content: req.body.message_content,
    created_at: req.body.created_at
  };

  Chat.create(chat).then(data => {
    res.send(data);
  }).catch(err => {
    res.status(500).send({
      error: true,
      err,
      message: err.message || 'Something went wrong'
    });
  });
};