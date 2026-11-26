import { useState, useEffect } from 'react';
import api from '../api/axios';
import { UserPlus, CheckCircle, XCircle, Trash2 } from 'lucide-react';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ username: '', password: '', full_name: '', role: 'bendahara_acara' });
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const loadUsers = () => api.get('/users').then(res => setUsers(res.data));
  useEffect(() => { loadUsers(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setErr('');
    setLoading(true);
    try {
      await api.post('/users', form);
      alert('User berhasil ditambahkan!');
      setForm({ username: '', password: '', full_name: '', role: 'bendahara_acara' });
      loadUsers();
    } catch (error) {
      setErr(error.response?.data?.message || 'Gagal menambah user');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (id, newRole) => {
    try {
      await api.patch(`/users/${id}/role`, { role: newRole });
      loadUsers();
    } catch (error) {
      alert('Gagal mengubah role');
    }
  };

  const handleStatusToggle = async (id, currentStatus) => {
    try {
      await api.patch(`/users/${id}/status`, { is_active: !currentStatus });
      loadUsers();
    } catch (error) {
      alert('Gagal mengubah status');
    }
  };

  const handleDelete = async (id, username) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus user "${username}" secara permanen?`)) return;
    try {
      await api.delete(`/users/${id}`);
      loadUsers();
    } catch (error) {
      alert(error.response?.data?.message || 'Gagal menghapus user');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100">Kelola Pengguna</h1>

      {/* Form Tambah User */}
      <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-900 dark:text-gray-100">
          <UserPlus size={20} /> Tambah User Baru
        </h2>

        {err && (
          <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-xl mb-4 text-sm font-medium">
            {err}
          </div>
        )}

        <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">Username</label>
            <input
              type="text"
              required
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-brand-500 outline-none"
              value={form.username}
              onChange={e => setForm({ ...form, username: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">Nama Lengkap</label>
            <input
              type="text"
              required
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-brand-500 outline-none"
              value={form.full_name}
              onChange={e => setForm({ ...form, full_name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">Password</label>
            <input
              type="password"
              required
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-brand-500 outline-none"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">Role</label>
            <select
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-brand-500 outline-none"
              value={form.role}
              onChange={e => setForm({ ...form, role: e.target.value })}
            >
              <option value="bendahara_acara">Bendahara Acara</option>
              <option value="bendahara_inti">Bendahara Inti</option>
              <option value="ketua">Ketua</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-brand-500 text-white font-bold py-2.5 rounded-xl hover:bg-brand-600 transition-all disabled:opacity-60"
          >
            {loading ? 'Menyimpan...' : 'Tambah'}
          </button>
        </form>
      </div>

      {/* Tabel User */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 text-sm">
            <tr>
              <th className="p-4">Username</th>
              <th className="p-4">Nama Lengkap</th>
              <th className="p-4">Role</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {users.map(u => (
              <tr key={u.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                <td className="p-4 font-bold text-gray-900 dark:text-gray-100">{u.username}</td>
                <td className="p-4 text-gray-600 dark:text-gray-300">{u.full_name}</td>
                <td className="p-4">
                  <select
                    value={u.role}
                    onChange={(e) => handleRoleChange(u.id, e.target.value)}
                    className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm font-semibold focus:ring-2 focus:ring-brand-500 outline-none"
                  >
                    <option value="bendahara_acara">Bendahara Acara</option>
                    <option value="bendahara_inti">Bendahara Inti</option>
                    <option value="ketua">Ketua</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td className="p-4">
                  <button
                    onClick={() => handleStatusToggle(u.id, u.is_active)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold transition-colors ${
                      u.is_active
                        ? 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50'
                        : 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50'
                    }`}
                  >
                    {u.is_active ? <CheckCircle size={16} /> : <XCircle size={16} />}
                    {u.is_active ? 'Aktif' : 'Nonaktif'}
                  </button>
                </td>
                <td className="p-4 text-center">
                  <button
                    onClick={() => handleDelete(u.id, u.username)}
                    className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                    title="Hapus User"
                  >
                    <Trash2 size={20} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}