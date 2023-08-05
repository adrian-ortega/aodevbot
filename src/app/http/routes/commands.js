const router = require('express').Router();
const controller = require('../controllers/CommandsController');

router.get('/', controller.getCommands);
router.post('/', controller.createCommand);

module.exports = router;