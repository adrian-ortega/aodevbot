const router = require("express").Router();
const controller = require("../controllers/ChattersController");

router.get("/", controller.list);
router.post("/", controller.create);
router.post("/sync", controller.sync);
router.get("/sync-status", controller.syncStatus);
router.get("/:id", controller.detail);
router.patch("/:id", controller.update);
router.delete("/:id", controller.destroy);

module.exports = router;
