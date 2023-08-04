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