const router = require('express').Router();
const controller = require('../controllers/CommandsController');

router.get('/', controller.getCommands);

module.exports = router;