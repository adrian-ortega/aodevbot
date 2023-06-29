const router = require('express').Router();
const mainController = require('../controllers/TwitchController');
const authController = require('../controllers/TwitchAuthController');
const webhookController = require('../controllers/TwitchWebhookController');

router.get('/authenticate', authController.authenticate);
router.get('/authenticate/confirm', authController.authConfirm);

router.get('/user/:username', mainController.getUser);

// router.get('/webhooks/status', webhookController.status);
// router.get('/webhooks/handle', webhookController.handleWebhook);

module.exports = router;