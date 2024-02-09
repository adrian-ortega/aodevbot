const router = require("express").Router();
const authController = require("../controllers/SpotifyAuthController");

router.get("/authenticate", authController.authenticate);
router.get("/authenticate/confirm", authController.authConfirm);

module.exports = router;