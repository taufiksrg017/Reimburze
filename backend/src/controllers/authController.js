const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

// Validasi: username teks biasa (boleh underscore/angka), TIDAK wajib email.
const USERNAME_RE = /^[a-zA-Z0-9_.-]{3,50}$/;

async function login(req, res) {
  const { username, password } = req.body || {};

  if (typeof username !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ message: 'Username dan password wajib diisi' });
  }
  const u = username.trim();
  if (!USERNAME_RE.test(u)) {
    return res.status(400).json({
      message: 'Username 3–50 karakter, hanya huruf/angka/underscore/titik/dash',
    });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: 'Password minimal 6 karakter' });
  }

  const [rows] = await pool.query(
    'SELECT id, username, password_hash, full_name, role, is_active FROM users WHERE username = ? LIMIT 1',
    [u]
  );
  if (rows.length === 0) {
    return res.status(401).json({ message: 'Username atau password salah' });
  }
  const user = rows[0];
  if (!user.is_active) {
    return res.status(403).json({ message: 'Akun dinonaktifkan' });
  }
  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) return res.status(401).json({ message: 'Username atau password salah' });

  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
  );

  res.json({
    token,
    user: { id: user.id, username: user.username, full_name: user.full_name, role: user.role },
  });
}

async function me(req, res) {
  const [rows] = await pool.query(
    'SELECT id, username, full_name, role FROM users WHERE id = ?',
    [req.user.id]
  );
  if (!rows.length) return res.status(404).json({ message: 'User tidak ditemukan' });
  res.json({ user: rows[0] });
}

module.exports = { login, me };