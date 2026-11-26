// auth.js
const jwt = require('jsonwebtoken');

function auth(req, res, next) {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token tidak ditemukan' });
  }
  try {
    req.user = jwt.verify(header.slice(7), process.env.JWT_SECRET);
    // payload: { id, username, role }
    next();
  } catch {
    return res.status(401).json({ message: 'Token tidak valid/kedaluwarsa' });
  }
}

module.exports = { auth };