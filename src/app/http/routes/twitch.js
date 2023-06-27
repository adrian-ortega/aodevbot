const router = require('express').Router();
const controller = require('../controllers/TwitchController');

router.get('/authenticate', controller.authenticate);
router.get('/authenticate/confirm', controller.authConfirm);

router.get('/user/:username', controller.getUser);

module.exports = router;