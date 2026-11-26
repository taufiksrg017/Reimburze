import { useState, useEffect } from 'react';
import api from '../api/axios';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';

export default function CashTransactions() {
  const [form, setForm] = useState({ type: 'income', amount: '', description: '', category: '', transaction_date: '' });
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadData = () => api.get('/cash').then(res => setList(res.data));
  useEffect(() => { loadData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/cash', form);
      alert('Transaksi berhasil dicatat!');
      setForm({ type: 'income', amount: '', description: '', category: '', transaction_date: '' });
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100">Kas Organisasi</h1>

      <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">Catat Transaksi Baru</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Jenis Transaksi</label>
            <select
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-brand-500 outline-none"
              value={form.type}
              onChange={e => setForm({ ...form, type: e.target.value })}
            >
              <option value="income">Pemasukan</option>
              <option value="expense">Pengeluaran</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Nominal (Rp)</label>
            <input
              type="number"
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-brand-500 outline-none"
              value={form.amount}
              onChange={e => setForm({ ...form, amount: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Tanggal</label>
            <input
              type="date"
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-brand-500 outline-none"
              value={form.transaction_date}
              onChange={e => setForm({ ...form, transaction_date: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Keterangan</label>
            <input
              type="text"
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-brand-500 outline-none"
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="col-span-2 bg-brand-500 text-white font-bold py-3 rounded-xl hover:bg-brand-600 transition-all mt-2 disabled:opacity-60"
          >
            {loading ? 'Menyimpan...' : 'Simpan Transaksi'}
          </button>
        </form>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 text-sm">
            <tr>
              <th className="p-4">Tanggal</th>
              <th className="p-4">Keterangan</th>
              <th className="p-4">Tipe</th>
              <th className="p-4 text-right">Nominal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {list.map(item => (
              <tr key={item.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                <td className="p-4 text-sm text-gray-700 dark:text-gray-300">
                  {new Date(item.transaction_date).toLocaleDateString('id-ID')}
                </td>
                <td className="p-4 font-medium text-gray-900 dark:text-gray-100">{item.description}</td>
                <td className="p-4">
                  {item.type === 'income' ? (
                    <span className="text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1 w-max">
                      <ArrowUpRight size={14} /> Pemasukan
                    </span>
                  ) : (
                    <span className="text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1 w-max">
                      <ArrowDownRight size={14} /> Pengeluaran
                    </span>
                  )}
                </td>
                <td className={`p-4 text-right font-bold ${item.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {item.type === 'income' ? '+' : '-'} Rp {Number(item.amount).toLocaleString('id-ID')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}