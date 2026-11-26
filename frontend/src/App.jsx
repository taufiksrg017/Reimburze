import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ReimbursementDetail from './pages/ReimbursementDetail';
import NewReimbursement from './pages/NewReimbursement';
import CashTransactions from './pages/CashTransactions';
import Users from './pages/Users';
import ThemeToggle from './components/ThemeToggle';
import { LayoutDashboard, FilePlus, LogOut, Wallet, Landmark, Users as UsersIcon } from 'lucide-react';

function Sidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  if (!user) return null;

  const menu = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['ketua', 'bendahara_inti', 'bendahara_acara'] },
    { name: 'Kas Organisasi', path: '/cash', icon: Landmark, roles: ['bendahara_inti'] },
    { name: 'Pengajuan Baru', path: '/reimbursements/new', icon: FilePlus, roles: ['bendahara_acara', 'bendahara_inti'] },
    { name: 'Kelola Pengguna', path: '/users', icon: UsersIcon, roles: ['admin'] },
  ];

  return (
    <div className="w-64 bg-brand-900 dark:bg-gray-900 text-white min-h-screen flex flex-col fixed left-0 top-0 border-r border-transparent dark:border-gray-800">
      <div className="p-6 flex items-center gap-3 border-b border-brand-500/20 dark:border-gray-800">
        <Wallet className="text-brand-500" size={28} />
        <span className="text-2xl font-extrabold tracking-tight">Reimburze</span>
      </div>

      <div className="flex-1 py-6 px-4 space-y-2">
        {menu.filter(m => m.roles.includes(user.role)).map((item) => {
          const Icon = item.icon;
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                active
                  ? 'bg-brand-500 text-white font-bold shadow-lg shadow-brand-500/20'
                  : 'text-brand-100 hover:bg-brand-500/10 dark:text-gray-300 dark:hover:bg-gray-800'
              }`}
            >
              <Icon size={20} />
              {item.name}
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-brand-500/20 dark:border-gray-800">
        <div className="mb-4 px-2">
          <p className="text-sm text-brand-100 dark:text-gray-400 font-medium">Login sebagai:</p>
          {/* Teks user.full_name udah dihapus dari sini */}
          <span className="inline-block mt-1 text-xs bg-brand-500/20 dark:bg-brand-500/30 text-brand-100 dark:text-brand-300 px-2 py-1 rounded-md uppercase tracking-wider font-bold">
            {user.role.replace('_', ' ')}
          </span>
        </div>
        <div className="flex gap-2">
          <ThemeToggle className="flex-shrink-0 bg-white/10 hover:bg-white/20 dark:bg-gray-800 dark:hover:bg-gray-700 text-white" />
          <button
            onClick={logout}
            className="flex-1 flex items-center justify-center gap-2 bg-white/10 hover:bg-red-500 dark:bg-gray-800 dark:hover:bg-red-600 text-white font-semibold py-2.5 rounded-xl transition-all"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </div>
    </div>
  );
}

function AppLayout({ children }) {
  const { user } = useAuth();
  return (
    <div className="flex bg-gray-50 dark:bg-gray-950 min-h-screen">
      {user && <Sidebar />}
      <div className={`flex-1 ${user ? 'ml-64' : ''} p-8`}>
        {children}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppLayout>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/cash" element={<ProtectedRoute roles={['bendahara_inti']}><CashTransactions /></ProtectedRoute>} />
            <Route path="/reimbursements/new" element={<ProtectedRoute roles={['bendahara_acara', 'bendahara_inti']}><NewReimbursement /></ProtectedRoute>} />
            <Route path="/reimbursements/:id/edit" element={<ProtectedRoute roles={['bendahara_acara', 'bendahara_inti']}><NewReimbursement /></ProtectedRoute>} />
            <Route path="/reimbursements/:id" element={<ProtectedRoute><ReimbursementDetail /></ProtectedRoute>} />
            <Route path="/users" element={<ProtectedRoute roles={['admin']}><Users /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/dashboard" />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </AuthProvider>
  );
}