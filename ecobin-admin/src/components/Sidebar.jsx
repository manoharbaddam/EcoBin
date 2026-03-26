import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const NAV = [
  { to: '/',              label: 'Overview',      icon: '📊' },
  { to: '/users',         label: 'Users',         icon: '👥' },
  { to: '/reports',       label: 'Waste Reports', icon: '🗑️'  },
  { to: '/notifications', label: 'Notifications', icon: '🔔' },
  { to: '/settings',      label: 'Settings',      icon: '⚙️'  },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <aside className="fixed left-0 top-0 h-full w-60 bg-primary-900 flex flex-col z-30 shadow-xl">
      {/* Brand */}
      <div className="px-5 py-6 border-b border-primary-800">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center text-xl shadow-md">
            ♻️
          </div>
          <div>
            <h1 className="text-white font-bold text-lg leading-tight">EcoBin</h1>
            <p className="text-primary-400 text-xs">Admin Dashboard</p>
          </div>
        </div>
        {/* Admin info */}
        <div className="flex items-center gap-2 bg-primary-800 rounded-lg px-3 py-2">
          <div className="w-7 h-7 bg-primary-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {user?.email?.[0]?.toUpperCase() || 'A'}
          </div>
          <div className="overflow-hidden">
            <p className="text-white text-xs font-medium truncate">{user?.email}</p>
            <p className="text-primary-400 text-xs">Administrator</p>
          </div>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              isActive ? 'nav-link-active' : 'nav-link'
            }
          >
            <span className="text-base w-5 text-center">{icon}</span>
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-primary-800">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-300 hover:bg-red-900/40 hover:text-red-200 transition-all duration-200"
        >
          <span className="text-base w-5 text-center">🚪</span>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
