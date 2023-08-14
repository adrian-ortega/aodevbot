const router = require("express").Router();
const controller = require("../controllers/CommandsController");

router.get("/", controller.list);
router.post("/", controller.create);
router.get("/templates", controller.listTemplates);
router.get("/:id", controller.detail);

module.exports = router;
