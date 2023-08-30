const { ChatCommands, Sequelize } = require("../../models");
const { objectHasProp } = require("../../support");
const {
  COMMAND_TYPES,
  COMMAND_TYPE_GENERAL,
} = require("../../twitch/chat/commands/dictionary");

const commandsTransformer = (row) => {
  const [name, ...aliases] = row.name.split(",");
  return {
    id: row.id,
    name,
    enabled: row.enabled,
    formatted_name: name
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, " ")
      .trim()
      .split(" ")
      .map((s) => s.substr(0, 1).toUpperCase() + s.substr(1))
      .join(" "),
    aliases,
    description: row.description,
  };
};

exports.list = async (req, res) => {
  const { search } = req.query;
  let { type, page, limit } = req.query;
  let data = [];

  page = page ? parseInt(page, 10) : 1;
  limit = !isNaN(limit) && isFinite(limit) ? parseInt(limit, 10) : 10;
  const offset = (page - 1) * limit;
  const pagination = {};
  const where = {};

  where.type = objectHasProp(COMMAND_TYPES, type)
    ? COMMAND_TYPES[type]
    : COMMAND_TYPES[COMMAND_TYPE_GENERAL];

  const updatePagination = (total) => {
    pagination.page = page;
    pagination.limit = limit;
    pagination.pages = Math.ceil(total / limit);
    pagination.total = total;
  };

  if (search && search.length > 0) {
    where[Sequelize.Op.or] = [
      { name: { [Sequelize.Op.like]: `%${search}%` } },
      { response: { [Sequelize.Op.like]: `%${search}%` } },
    ];
  }

  data = await ChatCommands.findAndCountAll({ where, limit, offset });
  console.log({ where, limit, offset });
  const rows = data.rows.map(commandsTransformer);

  updatePagination(data.count);

  res.send({
    data: rows,
    pagination,
  });
};

exports.detail = async (req, res) => {
  const { id } = req.params;
  try {
    const command = await ChatCommands.findByPk(id);
    if (!command) {
      return res.status(404).send({
        message: "Not found",
      });
    }
    res.send({ data: commandsTransformer(command) });
  } catch (err) {
    return res.status(500).send({
      message: err.message || "Something went wrong",
    });
  }
};

exports.create = async (req, res) => {
  if (!req.body.name || !req.body.response) {
    return res.status(400).send({
      message: "Missing Content",
    });
  }

  const command = await ChatCommands.create({
    type: COMMAND_TYPES[COMMAND_TYPE_GENERAL],
    enabled: 0,
    name: req.body.name,
    response: req.body.response,
    options: {
      count: 0,
      permission: req.body.permission || 1,
    },
  });

  res.send({ data: commandsTransformer(command) });
};

exports.update = async (req, res) => {};

exports.destroy = async (req, res) => {};
exports.listTemplates = async (req, res) => {
  res.send({
    data: [
      {
        name: "hug",
        response: "Awe! {0} hugged {1}",
      },
    ],
  });
};
