const { getCommands: getChatCommands } = require('../../twitch/chat');
const total = 42;

exports.getCommands = (req, res) => {
  const { type, search } = req.query;
  let { page, limit } = req.query;
  let data = [];

  page = page ? parseInt(page, 10) : 1;
  limit = limit ? parseInt(limit, 19) : 10;

  const pagination = {
    page,
    pages: Math.ceil(total/limit),
    total
  }

  switch (type) {
    case 'custom':
      data = getChatCommands();
      break;
    case 'general':
      data = new Array(10).fill(0).map((_, i) => ({
        id: i,
        name: 'Some Name ' + i,
      }));
    default:
      break;
  }
  
  res.send({
    data,
    pagination
  })
};