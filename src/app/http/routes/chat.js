const router = require("express").Router();
const controller = require("../controllers/ChatController");

router.post("/", controller.create);

module.exports = router;
