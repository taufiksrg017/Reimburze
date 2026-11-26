import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Wallet, ShieldCheck } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const { login } = useAuth();
  const nav = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr('');
    if (!/^[a-zA-Z0-9_.-]{3,50}$/.test(username.trim())) {
      return setErr('Username 3–50 karakter (huruf/angka/underscore).');
    }
    try {
      await login(username.trim(), password);
      nav('/dashboard');
    } catch (e) {
      setErr(e.response?.data?.message || 'Gagal login');
    }
  };

  return (
    <div className="min-h-screen flex relative">
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle className="bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 shadow-sm" />
      </div>

      {/* Kiri: Branding */}
      <div className="hidden lg:flex w-1/2 bg-brand-900 dark:bg-gray-900 text-white flex-col justify-center p-20 relative overflow-hidden border-r border-transparent dark:border-gray-800">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-brand-500 via-transparent to-transparent"></div>
        <Wallet size={64} className="text-brand-500 mb-6" />
        <h1 className="text-5xl font-extrabold mb-4 tracking-tight">Reimburze.</h1>
        <p className="text-xl text-brand-100 dark:text-gray-300 mb-8 max-w-md">
          Platform manajemen keuangan organisasi yang transparan, akuntabel, dan modern.
        </p>
        <div className="flex items-center gap-3 text-brand-500 font-semibold">
          <ShieldCheck size={24} />
          <span>Sistem Verifikasi Ganda (Ketua & Bendahara)</span>
        </div>
      </div>

      {/* Kanan: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50 dark:bg-gray-950">
        <div className="max-w-md w-full bg-white dark:bg-gray-900 p-10 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Selamat Datang</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8">Masuk untuk mengelola keuangan organisasi.</p>

          {err && <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-4 rounded-xl mb-6 text-sm font-medium">{err}</div>}

          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Username</label>
              <input
                type="text"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                placeholder="contoh: bendahara_acara"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Password</label>
              <input
                type="password"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-brand-500 hover:bg-brand-600 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-brand-500/30"
            >
              Masuk ke Dashboard
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}