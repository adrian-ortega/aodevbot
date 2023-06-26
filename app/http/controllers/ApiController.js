const Controller = require('./Controller');
class ApiController extends Controller {
  respondWithJSON (res, data, status = 200) {
    res.status(status);
    res.setHeader('Content-Type', 'application/json');
    res.json(data);
  }
}

module.exports = ApiController;
