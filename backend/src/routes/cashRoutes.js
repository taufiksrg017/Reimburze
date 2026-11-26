const router = require('express').Router();
const { auth } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');
const c = require('../controllers/cashController');

router.use(auth);
router.get('/', c.list);
// Hanya bendahara_inti yang bisa tambah kas
router.post('/', requireRole('bendahara_inti'), c.create);

module.exports = router;