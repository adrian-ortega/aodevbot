const router = require('express').Router();
const controller = require('../controllers/BroadcasterController');

router.get('/', controller.index);

module.exports = router;