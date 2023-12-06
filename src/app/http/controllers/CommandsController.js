const { ChatCommands, Sequelize } = require("../../models");
const { objectHasProp } = require("../../support");
const { getPublicAccessibleKeysAndDescriptions } = require('../../twitch/chat/state-keys')
const {
  COMMAND_TYPES,
  COMMAND_TYPE_CUSTOM,
  COMMAND_TYPE_GENERAL,
} = require("../../twitch/chat/commands/dictionary");

const commandsTransformer = (row) => {
  let [name, ...aliases] = row.name.split(",");
  const defaultTokens = getPublicAccessibleKeysAndDescriptions()
  let options = {
    tokens: Object.keys(defaultTokens),
    token_descriptions: {...defaultTokens}
  };

  // @TODO this can be removed, check for usages of names split by a column.
  if(objectHasProp(row.options, 'aliases')) {
    aliases = row.options.aliases;
    delete row.options.aliases;
  }

  if(objectHasProp(row.settings, 'tokens')) {
    options.tokens = [...options.tokens, row.settings.tokens];
  }

  if(objectHasProp(row.settings, 'token_descriptions')) {
    options.token_descriptions = [...options.token_descriptions, row.settings.token_descriptions];
  }

  if(objectHasProp(row.settings, 'fields')) {
    options.fields = [...row.settings.fields];
    options.field_values = {
      ...(row.settings.field_values||{}),
      ...row.options
    }
  } else {
    options = {...options, ...row.options}
  }

  return {
    id: row.id,
    name,
    type: row.type,
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
    response: row.response,
    options,
    created_at: row.created_at.getTime(),
    updated_at: row.updated_at.getTime()
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

// @TODO: This is horrible. VVV Redo this function
//
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

exports.update = async (req, res) => {
  if (!req.params.id) {
    return res.status(400).send({
      error: true,
      message: "Missing Content"
    });
  }

  const { id } = req.params;
  try {
    const command = await ChatCommands.findByPk(id);
    if (!command) {
      return res.status(404).send({
        error: true,
        message: "Not found",
      });
    }

    const commandData = {
      enabled: req.body.enabled,
      options: req.body.options,
    };

    if(objectHasProp(req.body, 'aliases')) {
      commandData.options.aliases = req.body.aliases
    }

    if(objectHasProp(req.body, 'response')) {
      commandData.response = req.body.response;
    }

    if(objectHasProp(req.body, 'permission')) {
      commandData.permission = req.body.permission;
    }

    if(command.type === COMMAND_TYPES[COMMAND_TYPE_GENERAL]) {
      commandData.name = req.body.name;
      commandData.description = req.body.description;
    } else {
      // Custom functionality
    }

    const updateResponse = await command.update(commandData);
    res.send({ 
      message: `Successfully updated Command #${id}`,
      error: false, 
      data: commandsTransformer(updateResponse)
    });
  } catch (err) {
    return res.status(500).send({
      error: true,
      message: err.message || "Something went wrong",
      data: []
    });
  }
};

exports.destroy = async (req, res) => { };
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
