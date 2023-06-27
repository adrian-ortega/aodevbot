const router = require('express').Router();
const controller = require('../controllers/ChattersController');

router.get('/', controller.list);
router.post('/', controller.create);
router.get('/:id', controller.detail);
router.patch('/:id', controller.update);
router.delete('/:id', controller.destroy);

module.exports = router;
