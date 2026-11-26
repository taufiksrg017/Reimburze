import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend,
} from 'recharts';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Wallet, ArrowUpRight, ArrowDownRight, Clock } from 'lucide-react';

const rupiah = (n) => 'Rp ' + Number(n).toLocaleString('id-ID');

// Format ringkas untuk sumbu Y: 10jt, 7.5jt, 500rb
const formatShort = (v) => {
  if (v >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(1)}M`;
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}jt`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(0)}rb`;
  return `${v}`;
};

// Tooltip custom — match tema gelap/terang
function CustomTooltip({ active, payload, label, isDark }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div
      className={`rounded-xl px-4 py-3 shadow-xl border text-sm ${
        isDark
          ? 'bg-gray-800 border-gray-700 text-gray-100'
          : 'bg-white border-gray-200 text-gray-900'
      }`}
    >
      <p className="font-bold mb-2">{label}</p>
      {payload.map((entry) => (
        <div key={entry.dataKey} className="flex items-center gap-2 mb-1 last:mb-0">
          <span
            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: entry.color }}
          />
          <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>{entry.name}:</span>
          <span className="font-semibold tabular-nums">{rupiah(entry.value)}</span>
        </div>
      ))}
    </div>
  );
}

// Legend custom — dot + label, sejajar kanan
function CustomLegend({ payload, isDark }) {
  return (
    <div className="flex items-center gap-5 justify-end mb-4">
      {payload.map((entry) => (
        <div key={entry.value} className="flex items-center gap-2 text-sm">
          <span
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get('/dashboard/summary').then((r) => setData(r.data));
  }, []);

  if (!data) {
    return <p className="text-gray-500 dark:text-gray-400 animate-pulse">Memuat dashboard...</p>;
  }

  const chartData = data.chart || [];
  const isEmpty =
    chartData.length === 0 ||
    chartData.every((d) => !d.income && !d.expense);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight">
          Ringkasan Keuangan
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Pantau arus kas dan status verifikasi secara real-time.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card
          title="Saldo Kas"
          value={rupiah(data.saldo)}
          icon={<Wallet size={24} className="text-brand-500" />}
          bg="bg-brand-50 dark:bg-brand-900/30"
          border="border-brand-100 dark:border-brand-900/50"
        />
        <Card
          title="Total Pemasukan"
          value={rupiah(data.total_income)}
          icon={<ArrowUpRight size={24} className="text-green-500" />}
          bg="bg-white dark:bg-gray-900"
          border="border-gray-100 dark:border-gray-800"
        />
        <Card
          title="Total Pengeluaran"
          value={rupiah(data.total_expense)}
          icon={<ArrowDownRight size={24} className="text-red-500" />}
          bg="bg-white dark:bg-gray-900"
          border="border-gray-100 dark:border-gray-800"
        />
        <Card
          title="Menunggu Verifikasi"
          value={`${data.pending_count} Pengajuan`}
          icon={<Clock size={24} className="text-amber-500" />}
          bg="bg-white dark:bg-gray-900"
          border="border-gray-100 dark:border-gray-800"
        />
      </div>

      {/* === CHART MODERN === */}
      <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
        <div className="mb-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
            Arus Kas (12 Bulan Terakhir)
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Perbandingan pemasukan dan pengeluaran per bulan.
          </p>
        </div>

        {isEmpty ? (
          <div className="h-72 flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
            <p className="text-sm">Belum ada data transaksi</p>
          </div>
        ) : (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                barGap={6}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={isDark ? '#34d399' : '#10b981'} stopOpacity={1} />
                    <stop offset="100%" stopColor={isDark ? '#059669' : '#6ee7b7'} stopOpacity={0.55} />
                  </linearGradient>
                  <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={isDark ? '#f87171' : '#ef4444'} stopOpacity={1} />
                    <stop offset="100%" stopColor={isDark ? '#dc2626' : '#fca5a5'} stopOpacity={0.55} />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  strokeDasharray="4 4"
                  vertical={false}
                  stroke={isDark ? '#1f2937' : '#f1f5f9'}
                />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 12 }}
                  dy={8}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 12 }}
                  tickFormatter={formatShort}
                  width={55}
                />
                <Tooltip
                  content={<CustomTooltip isDark={isDark} />}
                  cursor={{
                    fill: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
                    radius: 8,
                  }}
                />
                <Legend content={<CustomLegend isDark={isDark} />} />
                <Bar
                  dataKey="income"
                  name="Pemasukan"
                  fill="url(#incomeGradient)"
                  radius={[8, 8, 0, 0]}
                  maxBarSize={48}
                />
                <Bar
                  dataKey="expense"
                  name="Pengeluaran"
                  fill="url(#expenseGradient)"
                  radius={[8, 8, 0, 0]}
                  maxBarSize={48}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* === TABEL PENGAJUAN TERBARU === */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
            Pengajuan Terbaru
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 text-sm">
                <th className="p-4 font-semibold">Kode / Judul</th>
                <th className="p-4 font-semibold">Pengaju</th>
                <th className="p-4 font-semibold">Nominal</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {data.recent.map((r) => (
                <tr
                  key={r.id}
                  className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <td className="p-4">
                    <p className="font-bold text-gray-900 dark:text-gray-100">{r.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{r.code}</p>
                  </td>
                  <td className="p-4 text-sm text-gray-600 dark:text-gray-300">
                    {r.submitter_name}
                  </td>
                  <td className="p-4 font-bold text-gray-900 dark:text-gray-100 tabular-nums">
                    {rupiah(r.amount)}
                  </td>
                  <td className="p-4">
                    <StatusBadge status={r.status} />
                  </td>
                  <td className="p-4 text-right">
                    <Link
                      to={`/reimbursements/${r.id}`}
                      className="text-brand-600 dark:text-brand-500 hover:text-brand-900 dark:hover:text-brand-400 font-semibold text-sm"
                    >
                      Detail →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Card({ title, value, icon, bg, border }) {
  return (
    <div className={`p-6 rounded-3xl border ${bg} ${border} shadow-sm`}>
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-white dark:bg-gray-800 rounded-2xl shadow-sm">{icon}</div>
      </div>
      <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">{title}</p>
      <p className="text-2xl font-extrabold text-gray-900 dark:text-gray-100 tabular-nums">{value}</p>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    approved: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    pending: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    partially_verified: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  };
  const labels = {
    approved: 'Approved',
    rejected: 'Rejected',
    pending: 'Pending',
    partially_verified: 'Sebagian',
  };
  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
        styles[status] || styles.pending
      }`}
    >
      {labels[status] || status}
    </span>
  );
}