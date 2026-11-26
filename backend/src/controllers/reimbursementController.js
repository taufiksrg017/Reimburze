const pool = require('../config/db');

async function create(req, res) {
  const { title, description, amount, expense_date, event_name } = req.body;
  const files = req.files || [];

  if (!title || !amount || !expense_date) {
    return res.status(400).json({ message: 'title, amount, expense_date wajib' });
  }
  if (files.length === 0) {
    return res.status(400).json({ message: 'Wajib melampirkan minimal 1 foto/dokumen nota' });
  }
  const amt = Number(amount);
  if (!Number.isFinite(amt) || amt <= 0) {
    return res.status(400).json({ message: 'Amount harus > 0' });
  }

  const code = 'RMB-' + Date.now();
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [r] = await conn.query(
      `INSERT INTO reimbursements
         (code, submitted_by, event_name, title, description, amount, expense_date)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [code, req.user.id, event_name || null, title, description || null, amt, expense_date]
    );
    const id = r.insertId;
    for (const f of files) {
      await conn.query(
        `INSERT INTO reimbursement_receipts
           (reimbursement_id, file_path, file_type, original_name)
         VALUES (?, ?, ?, ?)`,
        [id, f.path, f.mimetype, f.originalname]
      );
    }
    await conn.commit();
    res.status(201).json({ id, code, status: 'pending' });
  } catch (e) {
    await conn.rollback();
    res.status(500).json({ message: e.message });
  } finally {
    conn.release();
  }
}

async function list(req, res) {
  const { status } = req.query;
  const params = [];
  let where = '';
  if (status) { where = 'WHERE r.status = ?'; params.push(status); }

  const [rows] = await pool.query(
    `SELECT r.id, r.code, r.title, r.event_name, r.amount, r.expense_date,
            r.status, r.ketua_decision, r.bendahara_inti_decision,
            r.created_at, u.full_name AS submitter_name
       FROM reimbursements r
       JOIN users u ON u.id = r.submitted_by
       ${where}
       ORDER BY r.created_at DESC`,
    params
  );
  res.json(rows);
}

async function detail(req, res) {
  const { id } = req.params;
  const [rows] = await pool.query(
    `SELECT r.*, u.full_name AS submitter_name
       FROM reimbursements r JOIN users u ON u.id = r.submitted_by
      WHERE r.id = ?`,
    [id]
  );
  if (!rows.length) return res.status(404).json({ message: 'Tidak ditemukan' });
  const [receipts] = await pool.query(
    'SELECT id, file_path, file_type, original_name FROM reimbursement_receipts WHERE reimbursement_id = ?',
    [id]
  );
  const [logs] = await pool.query(
    `SELECT vl.*, u.full_name AS verifier_name
       FROM verification_logs vl JOIN users u ON u.id = vl.verifier_id
      WHERE vl.reimbursement_id = ? ORDER BY vl.created_at ASC`,
    [id]
  );
  res.json({ ...rows[0], receipts, logs });
}

module.exports = { create, list, detail };

async function update(req, res) {
  const { id } = req.params;
  const { title, description, amount, expense_date, event_name } = req.body;
  const files = req.files || [];

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Cek apakah pengajuan ada dan statusnya masih pending
    const [rows] = await conn.query('SELECT status FROM reimbursements WHERE id = ? FOR UPDATE', [id]);
    if (rows.length === 0) throw new Error('Pengajuan tidak ditemukan');
    if (rows[0].status !== 'pending') throw new Error('Hanya pengajuan berstatus Pending yang bisa diedit');

    // Update data
    await conn.query(
      `UPDATE reimbursements SET title=?, description=?, amount=?, expense_date=?, event_name=? WHERE id=?`,
      [title, description || null, Number(amount), expense_date, event_name || null, id]
    );

    // Jika ada nota baru diupload, tambahkan
    for (const f of files) {
      await conn.query(
        `INSERT INTO reimbursement_receipts (reimbursement_id, file_path, file_type, original_name) VALUES (?, ?, ?, ?)`,
        [id, f.path, f.mimetype, f.originalname]
      );
    }

    await conn.commit();
    res.json({ message: 'Pengajuan berhasil diupdate' });
  } catch (e) {
    await conn.rollback();
    res.status(400).json({ message: e.message });
  } finally {
    conn.release();
  }
}

module.exports = { create, list, detail, update }; // <-- Tambahkan update di sini