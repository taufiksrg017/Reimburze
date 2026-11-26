const pool = require('../config/db');
const bcrypt = require('bcryptjs');

// 1. Ambil semua user
async function getUsers(req, res) {
  const [rows] = await pool.query(
    'SELECT id, username, full_name, role, is_active, created_at FROM users ORDER BY id ASC'
  );
  res.json(rows);
}

// 2. Tambah user baru
async function createUser(req, res) {
  const { username, password, full_name, role } = req.body;
  
  if (!/^[a-zA-Z0-9_.-]{3,50}$/.test(username)) {
    return res.status(400).json({ message: 'Username 3–50 karakter (huruf/angka/underscore).' });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: 'Password minimal 6 karakter.' });
  }

  try {
    const hash = await bcrypt.hash(password, 10);
    await pool.query(
      'INSERT INTO users (username, password_hash, full_name, role) VALUES (?, ?, ?, ?)',
      [username, hash, full_name, role]
    );
    res.status(201).json({ message: 'User berhasil dibuat' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Username sudah digunakan' });
    }
    res.status(500).json({ message: error.message });
  }
}

// 3. Ubah Role User
async function updateRole(req, res) {
  const { id } = req.params;
  const { role } = req.body;
  
  if (!['ketua', 'bendahara_inti', 'bendahara_acara', 'admin'].includes(role)) {
    return res.status(400).json({ message: 'Role tidak valid' });
  }

  await pool.query('UPDATE users SET role = ? WHERE id = ?', [role, id]);
  res.json({ message: 'Role berhasil diubah' });
}

// 4. Aktif/Nonaktifkan User
async function toggleStatus(req, res) {
  const { id } = req.params;
  const { is_active } = req.body;

  await pool.query('UPDATE users SET is_active = ? WHERE id = ?', [is_active ? 1 : 0, id]);
  res.json({ message: 'Status user berhasil diubah' });
}

module.exports = { getUsers, createUser, updateRole, toggleStatus };

// 5. Hapus User
async function deleteUser(req, res) {
  const { id } = req.params;

  // Cegah admin menghapus dirinya sendiri
  if (Number(id) === req.user.id) {
    return res.status(400).json({ message: 'Anda tidak dapat menghapus akun Anda sendiri' });
  }

  try {
    await pool.query('DELETE FROM users WHERE id = ?', [id]);
    res.json({ message: 'User berhasil dihapus' });
  } catch (error) {
    // Error ER_ROW_IS_REFERENCED_2 muncul jika user punya riwayat transaksi
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(400).json({ 
        message: 'User tidak bisa dihapus karena memiliki riwayat transaksi/verifikasi. Silakan nonaktifkan saja.' 
      });
    }
    res.status(500).json({ message: error.message });
  }
}

// Ubah module.exports menjadi:
module.exports = { getUsers, createUser, updateRole, toggleStatus, deleteUser };