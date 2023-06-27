const router = require('express').Router();
const controller = require('../controllers/ChattersController');

router.get('/', controller.list);
router.get('/:id', controller.detail);
router.post('/', controller.create);
router.patch('/', controller.update);
router.delete('/', controller.destroy);

module.exports = router;
