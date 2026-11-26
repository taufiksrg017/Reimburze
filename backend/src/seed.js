require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('./config/db'); // Pastikan file config/db.js sudah ada

const users = [
  { username: 'admin',           full_name: 'Administrator',      role: 'admin',           password: 'admin123' },
  { username: 'ketua01',         full_name: 'Ketua Organisasi',   role: 'ketua',           password: 'ketua123' },
  { username: 'bendahara_inti',  full_name: 'Bendahara Inti',     role: 'bendahara_inti',  password: 'bendahara123' },
  { username: 'bendahara_acara', full_name: 'Bendahara Acara',    role: 'bendahara_acara', password: 'acara123' },
];

(async () => {
  try {
    for (const u of users) {
      const hash = await bcrypt.hash(u.password, 10);
      await pool.query(
        `INSERT INTO users (username, password_hash, full_name, role)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash)`,
        [u.username, hash, u.full_name, u.role]
      );
      console.log('✔ User dibuat:', u.username, '->', u.role);
    }
    process.exit(0);
  } catch (error) {
    console.error('Gagal seed:', error);
    process.exit(1);
  }
})();