const { ChatCommands, Sequelize } = require('../../models');
const { objectHasProp } = require('../../support');
const { COMMAND_TYPES, COMMAND_TYPE_GENERAL } = require('../../twitch/chat/commands/dictionary');

const commandsTransformer = (row) => {
  const [name, ...aliases] = row.name.split(',')
  return {
    id: row.id,
    name,
    enabled: row.enabled,
    formatted_name: name
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, ' ')
      .trim()
      .split(' ')
      .map(s => s.substr(0, 1).toUpperCase() + s.substr(1))
      .join(' '),
    aliases,
    description: row.description
  }
}

exports.getCommands = async (req, res) => {
  const { search } = req.query;
  let { type, page, limit } = req.query;
  let data = [];

  page = page ? parseInt(page, 10) : 1;
  limit = !isNaN(limit) && isFinite(limit) ? parseInt(limit, 10) : 10;
  const offset = 0;
  const pagination = {};
  const where = {};

  where.type = objectHasProp(COMMAND_TYPES, type) ? COMMAND_TYPES[type] : COMMAND_TYPES[COMMAND_TYPE_GENERAL]

  const updatePagination = (total) => {
    pagination.page = page;
    pagination.limit = limit;
    pagination.pages = Math.ceil(total / limit);
    pagination.total = total;
  }
  

  if (search && search.length > 0) {
    where[Sequelize.Op.or] = [
      { name: { [Sequelize.Op.like]: `%${search}%` } },
      { reply: { [Sequelize.Op.like]: `%${search}%` } },
    ];
  }

  data = await ChatCommands.findAll({ where, limit, offset });
  data = data.map(commandsTransformer)

  updatePagination(data.length);
  
  res.send({
    data,
    pagination
  })
};

exports.createCommand = async (req, res) => {
  if (!req.body.name || !req.body.response) {
    return res.status(400).send({
      message: 'Missing Content'
    })
  }

  const command = await ChatCommands.create({
    type: COMMAND_TYPES[COMMAND_TYPE_GENERAL],
    enabled: 0,
    name: req.body.name,
    response: req.body.response,
    options: {
      count: 0,
      permission: req.body.permission || 1
    }
  })

  res.send({ data: commandsTransformer(command) });
}