import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const PAGE_TITLES = {
  '/':              { title: 'Overview',        subtitle: 'Platform snapshot & analytics' },
  '/users':         { title: 'Users',           subtitle: 'Manage registered users' },
  '/reports':       { title: 'Waste Reports',   subtitle: 'Review and update waste submissions' },
  '/notifications': { title: 'Notifications',   subtitle: 'Send messages to app users' },
  '/settings':      { title: 'Settings',        subtitle: 'Configure app and account' },
};

export default function Header() {
  const { pathname } = useLocation();
  const { logout }   = useAuth();
  const navigate     = useNavigate();
  const info = PAGE_TITLES[pathname] || { title: 'EcoBin Admin', subtitle: '' };

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out');
    navigate('/login');
  };

  return (
    <header className="fixed top-0 left-60 right-0 h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 z-20 shadow-sm">
      <div>
        <h2 className="text-lg font-bold text-gray-900 leading-tight">{info.title}</h2>
        <p className="text-xs text-gray-500">{info.subtitle}</p>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-xs text-gray-400 bg-primary-50 border border-primary-100 rounded-full px-3 py-1 font-medium text-primary-700">
          🌱 EcoBin Admin v1.0
        </div>
        <button
          onClick={handleLogout}
          className="text-xs text-gray-500 hover:text-red-600 transition-colors font-medium"
        >
          Sign out
        </button>
      </div>
    </header>
  );
}
