// routes/verificationRoutes.js
const router = require('express').Router();
const { auth } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');
const { verify } = require('../controllers/verificationController');

router.post(
  '/:id/verify',
  auth,
  requireRole('ketua', 'bendahara_inti'),
  verify
);
module.exports = router;