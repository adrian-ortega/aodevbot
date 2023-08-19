const { Chatters, Sequelize } = require("../../models");

const chattersTraformer = (row) => {
  return {
    id: row.id,
    twitch_id: row.twitch_id,
    username: row.username,
    display_name: row.display_name,
    profile_image_url: row.profile_image_url,
    broadcaster: row.broadcaster,
    subscriber: row.subscriber,
    mod: row.mod,
    points: row.points,
  };
};

exports.list = async (req, res) => {
  const { search } = req.query;
  let { page, limit } = req.query;
  let data = [];

  page = page ? parseInt(page, 10) : 1;
  limit = !isNaN(limit) && isFinite(limit) ? parseInt(limit, 10) : 10;
  const offset = (page - 1) * limit;
  const pagination = {};
  const where = {};

  if (search && search.length > 0) {
    where[Sequelize.Op.or] = [
      { username: { [Sequelize.Op.like]: `%${search}%` } },
      { display_name: { [Sequelize.Op.like]: `%${search}%` } },
    ];
  }

  data = await Chatters.findAndCountAll({ where, limit, offset });
  const rows = data.rows.map(chattersTraformer);

  pagination.page = page;
  pagination.limit = limit;
  pagination.pages = Math.ceil(data.count / limit);
  pagination.total = data.count;

  res.send({
    data: rows,
    pagination,
  });
};

exports.detail = (req, res) => {
  const { id } = req.params;
  Chatters.findByPk(id)
    .then((data) => {
      if (data) {
        res.send(data);
      } else {
        res.status(404).send({
          message: "Not found",
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Something went wrong",
      });
    });
};

exports.create = (req, res) => {
  if (!req.body.twitch_id) {
    return res.status(400).send({
      message: "Content empty",
    });
  }

  const chatter = {
    twitch_id: req.body.twitch_id,
    username: req.body.username || "",
    display_name: req.body.display_name || "",
  };

  Chatters.create(chatter)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Something went wrong",
      });
    });
};

exports.update = (req, res) => {
  const { id } = req.params;

  Chatters.update(req.body, {
    where: { id },
  })
    .then((num) => {
      if (num === 1) {
        res.send({
          message: "Chatter was updated successfully.",
        });
      } else {
        res.send({
          num,
          message: `Cannot update Chatter with id=${id}. ${num}, ${typeof num}`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Something went wrong",
      });
    });
};

exports.destroy = (req, res) => {
  const { id } = req.params;
  Chatters.destroy({
    where: { id },
  })
    .then((num) => {
      if (num === 1) {
        res.send({
          message: "Chatter was deleted successfully!",
        });
      } else {
        res.send({
          message: `Cannot delete Chatter with id=${id}.`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Something went wrong",
      });
    });
};

exports.sync = async (req, res) => {
  const Twitch = require("../../twitch");
  const chatters = await Twitch.getFollowers()
  console.log(`Found ${chatters.length} Chatters`)
  const syncData = []

  console.log('Pulling data from Twitch')
  for (let i = 0; i < chatters.length; i++) {
    const item = await Twitch.getUser(chatters[i].from_id);
    syncData.push({
      twitch_id: parseInt(item.id, 10),
      username: item.login,
      display_name: item.display_name,
      profile_image_url: item.profile_image_url
    })
  }

  console.log('Attempting Bulk Create')

  const results = await Chatters.bulkCreate(syncData, {
    fields: ['twitch_id', 'username', 'display_name', 'profile_image_url'],
    updateOnDuplicate: ['username', 'display_name', 'profile_image_url'],
    upsertOn: ['twitch_id']
  })

  res.send({ results });
};
