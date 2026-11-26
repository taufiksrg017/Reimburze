import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';
import { ArrowLeft, UploadCloud } from 'lucide-react';

export default function NewReimbursement() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const nav = useNavigate();

  const [form, setForm] = useState({ title: '', amount: '', expense_date: '', event_name: '', description: '' });
  const [files, setFiles] = useState(null);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEdit) {
      api.get(`/reimbursements/${id}`).then(res => {
        const d = res.data;
        setForm({
          title: d.title,
          amount: d.amount,
          expense_date: d.expense_date.split('T')[0],
          event_name: d.event_name || '',
          description: d.description || '',
        });
      });
    }
  }, [id, isEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr('');
    if (!isEdit && (!files || files.length === 0)) return setErr('Wajib melampirkan minimal 1 foto nota!');

    setLoading(true);
    const data = new FormData();
    data.append('title', form.title);
    data.append('amount', form.amount);
    data.append('expense_date', form.expense_date);
    data.append('event_name', form.event_name);
    data.append('description', form.description);
    if (files) {
      for (let i = 0; i < files.length; i++) data.append('receipts', files[i]);
    }

    try {
      if (isEdit) {
        await api.put(`/reimbursements/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
        alert('Pengajuan berhasil diupdate!');
        nav(`/reimbursements/${id}`);
      } else {
        await api.post('/reimbursements', data, { headers: { 'Content-Type': 'multipart/form-data' } });
        alert('Pengajuan berhasil dibuat!');
        nav('/dashboard');
      }
    } catch (error) {
      setErr(error.response?.data?.message || 'Gagal menyimpan pengajuan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <button
        onClick={() => nav(-1)}
        className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-500 font-medium mb-6 transition-colors"
      >
        <ArrowLeft size={20} /> Kembali
      </button>

      <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
        <h2 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100 mb-6">
          {isEdit ? 'Edit Pengajuan' : 'Buat Pengajuan Reimburse'}
        </h2>

        {err && (
          <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-4 rounded-xl mb-6 text-sm font-medium">
            {err}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Judul Pengeluaran *</label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-brand-500 outline-none"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Nominal (Rp) *</label>
              <input
                type="number"
                required
                min="1"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-brand-500 outline-none"
                value={form.amount}
                onChange={e => setForm({ ...form, amount: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Tanggal Pengeluaran *</label>
              <input
                type="date"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-brand-500 outline-none"
                value={form.expense_date}
                onChange={e => setForm({ ...form, expense_date: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Nama Acara / Kegiatan</label>
              <input
                type="text"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-brand-500 outline-none"
                value={form.event_name}
                onChange={e => setForm({ ...form, event_name: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Keterangan Tambahan</label>
            <textarea
              rows="3"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-brand-500 outline-none"
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Upload Foto/PDF Nota {isEdit ? '(Opsional jika tidak diganti)' : '*'}
            </label>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl p-8 text-center hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors relative">
              <input
                type="file"
                multiple
                accept="image/*,application/pdf"
                onChange={e => setFiles(e.target.files)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <UploadCloud size={40} className="text-gray-400 dark:text-gray-500 mx-auto mb-3" />
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Klik atau drag file ke sini</p>
              {files && (
                <p className="text-sm font-bold text-brand-600 dark:text-brand-500 mt-3">{files.length} file terpilih</p>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-500 hover:bg-brand-600 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-brand-500/30 mt-4 disabled:opacity-60"
          >
            {loading ? 'Menyimpan...' : (isEdit ? 'Simpan Perubahan' : 'Kirim Pengajuan')}
          </button>
        </form>
      </div>
    </div>
  );
}