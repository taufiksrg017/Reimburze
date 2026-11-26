const pool = require('../config/db');

async function summary(_req, res) {
  // 1. Hitung Total Pemasukan (Kas Masuk)
  const [[income]] = await pool.query(
    "SELECT COALESCE(SUM(amount),0) AS t FROM cash_transactions WHERE type='income'"
  );
  
  // 2. Hitung Pengeluaran Kas Manual (Kas Keluar)
  const [[cashExpense]] = await pool.query(
    "SELECT COALESCE(SUM(amount),0) AS t FROM cash_transactions WHERE type='expense'"
  );
  
  // 3. Hitung Total Reimburse yang sudah Approved
  const [[reimb]] = await pool.query(
    "SELECT COALESCE(SUM(amount),0) AS t FROM reimbursements WHERE status='approved'"
  );
  
  // 4. Hitung Pengajuan yang masih pending
  const [[pending]] = await pool.query(
    "SELECT COUNT(*) AS c FROM reimbursements WHERE status IN ('pending','partially_verified')"
  );

  const totalIncome = Number(income.t);
  // Total Pengeluaran = Kas Keluar Manual + Reimburse Approved
  const totalExpense = Number(cashExpense.t) + Number(reimb.t);
  const saldo = totalIncome - totalExpense;

  // 5. Ambil Data Grafik Kas Manual
  const [cashChart] = await pool.query(`
    SELECT DATE_FORMAT(transaction_date,'%Y-%m') AS month,
           SUM(CASE WHEN type='income'  THEN amount ELSE 0 END) AS income,
           SUM(CASE WHEN type='expense' THEN amount ELSE 0 END) AS expense
      FROM cash_transactions
      GROUP BY month
  `);

  // 6. Ambil Data Grafik Reimburse Approved
  const [reimbChart] = await pool.query(`
    SELECT DATE_FORMAT(expense_date,'%Y-%m') AS month,
           SUM(amount) AS expense
      FROM reimbursements
     WHERE status = 'approved'
     GROUP BY month
  `);

  // 7. Gabungkan Data Grafik
  const chartMap = {};
  cashChart.forEach(row => {
    chartMap[row.month] = { month: row.month, income: Number(row.income), expense: Number(row.expense) };
  });
  reimbChart.forEach(row => {
    if (!chartMap[row.month]) {
      chartMap[row.month] = { month: row.month, income: 0, expense: 0 };
    }
    chartMap[row.month].expense += Number(row.expense);
  });

  // Urutkan berdasarkan bulan dan ambil 12 bulan terakhir
  const chart = Object.values(chartMap)
    .sort((a, b) => a.month.localeCompare(b.month))
    .slice(-12);

  // 8. Ambil Pengajuan Terbaru untuk Tabel
  const [recent] = await pool.query(`
    SELECT r.id, r.code, r.title, r.amount, r.status,
           r.ketua_decision, r.bendahara_inti_decision,
           r.created_at, u.full_name AS submitter_name
      FROM reimbursements r JOIN users u ON u.id = r.submitted_by
      ORDER BY r.created_at DESC LIMIT 15
  `);

  res.json({
    saldo,
    total_income: totalIncome,
    total_expense: totalExpense,
    total_reimburse_approved: Number(reimb.t),
    pending_count: pending.c,
    chart,
    recent,
  });
}

module.exports = { summary };