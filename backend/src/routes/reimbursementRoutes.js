const router = require('express').Router();
const { auth } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');
const { upload } = require('../middleware/upload');
const c = require('../controllers/reimbursementController');

router.use(auth);
router.get('/', c.list);
router.get('/:id', c.detail);

// Izinkan bendahara_acara DAN bendahara_inti untuk membuat & edit
router.post('/', requireRole('bendahara_acara', 'bendahara_inti'), upload.array('receipts', 5), c.create);
router.put('/:id', requireRole('bendahara_acara', 'bendahara_inti'), upload.array('receipts', 5), c.update);

module.exports = router;