const router = require("express").Router();
const controller = require("../controllers/BroadcasterController");

router.get("/", controller.getBroadcaster);
router.get("/secondary", controller.getSecondaryBroadcaster);

module.exports = router;
