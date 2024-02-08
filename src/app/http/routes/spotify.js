const router = require("express").Router();
const authController = require("../controllers/SpotifyAuthController");
const downloadController = require('../controllers/SpotifyDownloaderController');

router.get("/authenticate", authController.authenticate);
router.get("/authenticate/confirm", authController.authConfirm);

router.get('/downloader', downloadController.downloader);

module.exports = router;
