// role.js
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'Belum login' });
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: `Akses ditolak. Butuh role: ${roles.join(', ')}` });
    }
    next();
  };
}

module.exports = { requireRole };