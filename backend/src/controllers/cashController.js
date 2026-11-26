const pool = require('../config/db');

async function create(req, res) {
  const { type, amount, description, category, transaction_date } = req.body;
  if (!['income', 'expense'].includes(type)) return res.status(400).json({ message: 'Tipe tidak valid' });
  
  await pool.query(
    `INSERT INTO cash_transactions (type, amount, description, category, transaction_date, created_by) VALUES (?, ?, ?, ?, ?, ?)`,
    [type, amount, description, category, transaction_date, req.user.id]
  );
  res.status(201).json({ message: 'Transaksi kas berhasil dicatat' });
}

async function list(req, res) {
  const [rows] = await pool.query('SELECT * FROM cash_transactions ORDER BY transaction_date DESC');
  res.json(rows);
}

module.exports = { create, list };