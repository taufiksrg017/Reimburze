const pool = require('../config/db');

async function verify(req, res) {
  const { id } = req.params;
  const { decision, notes } = req.body;
  const { role, id: verifierId } = req.user;

  if (!['ketua', 'bendahara_inti'].includes(role)) {
    return res.status(403).json({ message: 'Hanya Ketua & Bendahara Inti yang boleh verifikasi' });
  }
  if (!['approved', 'rejected'].includes(decision)) {
    return res.status(400).json({ message: 'decision harus "approved" atau "rejected"' });
  }
  if (decision === 'rejected' && (!notes || !notes.trim())) {
    return res.status(400).json({ message: 'Alasan penolakan wajib diisi' });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [rows] = await conn.query(
      'SELECT * FROM reimbursements WHERE id = ? FOR UPDATE',
      [id]
    );
    if (!rows.length) {
      await conn.rollback();
      return res.status(404).json({ message: 'Pengajuan tidak ditemukan' });
    }
    const r = rows[0];

    if (['approved', 'rejected'].includes(r.status)) {
      await conn.rollback();
      return res.status(409).json({ message: 'Pengajuan sudah final, tidak bisa diverifikasi lagi' });
    }

    const column = role === 'ketua' ? 'ketua_decision' : 'bendahara_inti_decision';
    if (r[column] !== 'pending') {
      await conn.rollback();
      return res.status(409).json({ message: 'Anda sudah memverifikasi pengajuan ini' });
    }

    // 1) catat log
    await conn.query(
      `INSERT INTO verification_logs
         (reimbursement_id, verifier_id, verifier_role, decision, notes)
       VALUES (?, ?, ?, ?, ?)`,
      [id, verifierId, role, decision, notes || null]
    );

    // 2) update keputusan role ini
    await conn.query(`UPDATE reimbursements SET ${column} = ? WHERE id = ?`, [decision, id]);

    // 3) hitung status baru
    const ketua = role === 'ketua' ? decision : r.ketua_decision;
    const bi    = role === 'bendahara_inti' ? decision : r.bendahara_inti_decision;

    let newStatus;
    if (ketua === 'rejected' || bi === 'rejected') newStatus = 'rejected';
    else if (ketua === 'approved' && bi === 'approved') newStatus = 'approved';
    else if (ketua === 'approved' || bi === 'approved') newStatus = 'partially_verified';
    else newStatus = 'pending';

    await conn.query('UPDATE reimbursements SET status = ? WHERE id = ?', [newStatus, id]);
    await conn.commit();

    res.json({ message: 'Verifikasi tersimpan', status: newStatus });
  } catch (e) {
    await conn.rollback();
    res.status(500).json({ message: e.message });
  } finally {
    conn.release();
  }
}

module.exports = { verify };