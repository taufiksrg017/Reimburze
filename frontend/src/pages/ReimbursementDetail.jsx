import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, CheckCircle, XCircle, Pencil } from 'lucide-react';
import SecureFile from '../components/SecureFile';

export default function ReimbursementDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const nav = useNavigate();
  const [r, setR] = useState(null);
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);

  const load = () => api.get(`/reimbursements/${id}`).then((res) => setR(res.data));
  useEffect(() => { load(); }, [id]);

  if (!r) return <p className="text-gray-500 dark:text-gray-400 animate-pulse">Memuat detail...</p>;

  const canVerify = ['ketua', 'bendahara_inti'].includes(user.role);
  const myDecision =
    user.role === 'ketua' ? r.ketua_decision :
    user.role === 'bendahara_inti' ? r.bendahara_inti_decision : null;
  const final = ['approved', 'rejected'].includes(r.status);
  const canAct = canVerify && myDecision === 'pending' && !final;

  const canEdit = ['bendahara_acara', 'bendahara_inti'].includes(user.role) && r.status === 'pending';

  const submit = async (decision) => {
    if (decision === 'rejected' && !notes.trim()) return alert('Alasan penolakan wajib diisi');
    setBusy(true);
    try {
      await api.post(`/reimbursements/${id}/verify`, { decision, notes });
      setNotes('');
      await load();
    } catch (e) {
      alert(e.response?.data?.message || 'Gagal');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <button
        onClick={() => nav(-1)}
        className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-500 font-medium mb-4 transition-colors"
      >
        <ArrowLeft size={20} /> Kembali
      </button>

      <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
        {/* HEADER */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100 mb-2">{r.title}</h1>
            <p className="text-gray-500 dark:text-gray-400 font-medium">
              {r.code} • {r.event_name || 'Tanpa Acara'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {canEdit && (
              <button
                onClick={() => nav(`/reimbursements/${r.id}/edit`)}
                className="flex items-center gap-2 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-900/50 px-4 py-2 rounded-xl font-bold text-sm transition-colors"
              >
                <Pencil size={16} /> Edit
              </button>
            )}
            <StatusBadge status={r.status} />
          </div>
        </div>

        {/* NOMINAL & TANGGAL */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl">
            <p className="text-sm text-gray-500 dark:text-gray-400 font-semibold mb-1">Nominal</p>
            <p className="text-2xl font-bold text-brand-600 dark:text-brand-500">
              Rp {Number(r.amount).toLocaleString('id-ID')}
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl">
            <p className="text-sm text-gray-500 dark:text-gray-400 font-semibold mb-1">Tanggal Pengeluaran</p>
            <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
              {new Date(r.expense_date).toLocaleDateString('id-ID')}
            </p>
          </div>
        </div>

        {/* KETERANGAN */}
        <div className="mb-8">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">Keterangan</h3>
          <p className="text-gray-600 dark:text-gray-300">{r.description || '-'}</p>
        </div>

        {/* BUKTI NOTA */}
        <div className="mb-8">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Bukti Nota</h3>
          <div className="flex gap-4 flex-wrap">
            {r.receipts.map((f) => (
              <SecureFile key={f.id} file={f} />
            ))}
          </div>
        </div>

        {/* STATUS VERIFIKASI & AKSI */}
        <div className="border-t border-gray-100 dark:border-gray-800 pt-8">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Status Verifikasi</h3>
          <div className="flex gap-4 mb-6">
            <div className="flex-1 bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl flex items-center justify-between">
              <span className="font-semibold text-gray-700 dark:text-gray-300">Ketua</span>
              <DecisionBadge decision={r.ketua_decision} />
            </div>
            <div className="flex-1 bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl flex items-center justify-between">
              <span className="font-semibold text-gray-700 dark:text-gray-300">Bendahara Inti</span>
              <DecisionBadge decision={r.bendahara_inti_decision} />
            </div>
          </div>

          {canAct && (
            <div className="bg-brand-50 dark:bg-brand-900/20 p-6 rounded-2xl border border-brand-100 dark:border-brand-900/50">
              <h4 className="font-bold text-brand-900 dark:text-brand-100 mb-3">
                Aksi Verifikasi ({user.role.replace('_', ' ')})
              </h4>
              <textarea
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-brand-200 dark:border-brand-900/50 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-brand-500 outline-none mb-4"
                placeholder="Catatan (wajib jika menolak)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
              <div className="flex gap-3">
                <button
                  disabled={busy}
                  onClick={() => submit('approved')}
                  className="flex-1 bg-brand-500 hover:bg-brand-600 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-brand-500/30 flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  <CheckCircle size={20} /> Approve
                </button>
                <button
                  disabled={busy}
                  onClick={() => submit('rejected')}
                  className="flex-1 bg-white dark:bg-gray-800 border-2 border-red-500 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  <XCircle size={20} /> Reject
                </button>
              </div>
            </div>
          )}
        </div>

        {/* RIWAYAT VERIFIKASI */}
        <div className="mt-8 border-t border-gray-100 dark:border-gray-800 pt-8">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Riwayat Verifikasi</h3>
          {r.logs.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 italic">Belum ada verifikasi.</p>
          ) : (
            <div className="space-y-3">
              {r.logs.map((l) => (
                <div key={l.id} className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <div className={`mt-1 p-1 rounded-full ${
                    l.decision === 'approved'
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                      : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                  }`}>
                    {l.decision === 'approved' ? <CheckCircle size={16} /> : <XCircle size={16} />}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {l.verifier_name}{' '}
                      <span className="text-gray-500 dark:text-gray-400 font-normal">
                        ({l.verifier_role.replace('_', ' ')})
                      </span>
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(l.created_at).toLocaleString('id-ID')}
                    </p>
                    {l.notes && <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">"{l.notes}"</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// --- KOMPONEN BANTUAN (BADGE) ---

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
    <span className={`px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider ${styles[status] || styles.pending}`}>
      {labels[status] || status}
    </span>
  );
}

function DecisionBadge({ decision }) {
  if (decision === 'approved')
    return <span className="text-green-600 dark:text-green-400 font-bold text-sm bg-green-100 dark:bg-green-900/30 px-3 py-1 rounded-lg">Approved</span>;
  if (decision === 'rejected')
    return <span className="text-red-600 dark:text-red-400 font-bold text-sm bg-red-100 dark:bg-red-900/30 px-3 py-1 rounded-lg">Rejected</span>;
  return <span className="text-gray-500 dark:text-gray-400 font-bold text-sm bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded-lg">Pending</span>;
}