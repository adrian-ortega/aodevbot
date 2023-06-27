const db = require('../../models');
const Chatters = db.chatters;

exports.list = (req, res) => {
  Chatters.findAll().then(data => {
    res.send(data);
  }).catch(err => {
    res.status(500).send({
      message: err.message || 'Something went wrong'
    });
  });
};

exports.detail = (req, res) => {
  const { id } = req.params;
  Chatters.findByPk(id).then(data => {
    res.send(data);
  }).catch(err => {
    res.status(500).send({
      message: err.message || 'Something went wrong'
    });
  });
};

exports.create = (req, res) => {
  if (!req.body.twitch_id) {
    return res.status(400).send({
      message: 'Content empty'
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
      message: err.message || 'Something went wrong'
    });
  });
};

exports.update = (req, res) => {
  const id = req.params.id;

  Chatters.update(req.body, {
    where: { id }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: 'Chatter was updated successfully.'
        });
      } else {
        res.send({
          num,
          message: `Cannot update Chatter with id=${id}. ${num}, ${typeof num}`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || 'Something went wrong'
      });
    });
};

exports.destroy = (req, res) => {
  const { id } = req.params;
  Chatters
    .destroy({
      where: { id }
    })
    .then(num => {
      if (num == 1) {
        res.send({
          message: 'Chatter was deleted successfully!'
        });
      } else {
        res.send({
          message: `Cannot delete Chatter with id=${id}.`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || 'Something went wrong'
      });
    });
};
