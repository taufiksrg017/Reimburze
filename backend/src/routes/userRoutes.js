const router = require('express').Router();
const { auth } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');
const c = require('../controllers/userController');

// Semua rute di sini WAJIB login sebagai Admin
router.use(auth, requireRole('admin'));

router.get('/', c.getUsers);
router.post('/', c.createUser);
router.patch('/:id/role', c.updateRole);
router.patch('/:id/status', c.toggleStatus);
router.delete('/:id', c.deleteUser);

module.exports = router;