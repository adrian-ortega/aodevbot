const { ChatCommands, Sequelize } = require('../../models');
const { getCommands: getChatCommands } = require('../../twitch/chat');
const total = 42;

exports.getCommands = async (req, res) => {
  const { type, search } = req.query;
  let { page, limit } = req.query;
  let data = [];

  page = page ? parseInt(page, 10) : 1;
  limit = !isNaN(limit) && isFinite(limit) ? parseInt(limit, 10) : 10;
  const offset = 0;
  const pagination = {};
  const updatePagination = (total) => {
    pagination.page = page;
    pagination.limit = limit;
    pagination.pages = Math.ceil(total / limit);
    pagination.total = total;
  }

  switch (type) {
    case 'general':
      data = getChatCommands();
      break;
    case 'custom':
      const where = {};

      if (search && search.length > 0) {
        where[Sequelize.Op.or] = [
          { command_name: { [Sequelize.Op.like]: `%${search}%` } },
          { command_reply: { [Sequelize.Op.like]: `%${search}%` } },
        ];
      }

      data = await ChatCommands.findAll({ where, limit, offset });
      data = data.map((row) => {
        return {
          id: row.id,
          name: row.command_name,
          description: 'NONE'
        }
      })

      updatePagination(data.length);
    default:
      break;
  }
  
  res.send({
    data,
    pagination
  })
};

exports.createCommand = async (req, res) => {
  if (!req.body.command_name || !req.body.command_reply) {
    return res.status(400).send({
      message: 'Missing Content'
    })
  }

  const command = {
    command_type: 1,
    command_enabled: 0,
    command_name: req.body.command_name,
    command_reply: req.body.command_reply,
    command_options: {
      count: 0,
      permission: req.body.permission || 1
    }
  }

  ChatCommands.create(command)

  res.send({ data: {} });
}