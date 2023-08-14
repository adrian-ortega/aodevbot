const db = require("../../models");
const { Games } = db;

exports.list = (req, res) => {
  Games.findAll()
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Something went wrong",
      });
    });
};

exports.detail = (req, res) => {
  const { id } = req.params;
  Games.findByPk(id)
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
  if (!req.body.game_id) {
    return res.status(400).send({
      message: "Content empty",
    });
  }

  const game = {
    game_id: req.body.game_id,
    game_name: req.body.game_name || "",
  };

  Games.create(game)
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

  Games.update(req.body, {
    where: { id },
  })
    .then((num) => {
      if (num === 1) {
        res.send({
          message: "Game was updated successfully.",
        });
      } else {
        res.send({
          num,
          message: `Cannot update Game with id=${id}. ${num}, ${typeof num}`,
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
  Games.destroy({
    where: { id },
  })
    .then((num) => {
      if (num === 1) {
        res.send({
          message: "Game was deleted successfully!",
        });
      } else {
        res.send({
          message: `Cannot delete Game with id=${id}.`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Something went wrong",
      });
    });
};
