import { useEffect, useState, useMemo } from 'react';
import { getAllUsers } from '../firebase/firestore';
import { format } from 'date-fns';
import Papa from 'papaparse';
import UserDrawer from '../components/UserDrawer';

const SORT_OPTIONS = [
  { value: 'points',   label: 'Points'    },
  { value: 'reports',  label: 'Reports'   },
  { value: 'joined',   label: 'Join Date' },
];

export default function Users() {
  const [users,    setUsers]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [search,   setSearch]   = useState('');
  const [sortBy,   setSortBy]   = useState('points');
  const [drawerUid, setDrawerUid] = useState(null);

  useEffect(() => {
    getAllUsers()
      .then(setUsers)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let arr = [...users];
    if (search.trim()) {
      const s = search.toLowerCase();
      arr = arr.filter(u =>
        (u.displayName || u.name || '').toLowerCase().includes(s) ||
        (u.email || '').toLowerCase().includes(s)
      );
    }
    arr.sort((a, b) => {
      if (sortBy === 'points')  return (b.totalPoints ?? b.points ?? 0) - (a.totalPoints ?? a.points ?? 0);
      if (sortBy === 'reports') return (b.totalReports ?? 0) - (a.totalReports ?? 0);
      if (sortBy === 'joined') {
        const da = a.createdAt?.toDate?.() ?? 0;
        const db_ = b.createdAt?.toDate?.() ?? 0;
        return db_ - da;
      }
      return 0;
    });
    return arr;
  }, [users, search, sortBy]);

  const handleExportCSV = () => {
    const rows = filtered.map(u => ({
      Name:          u.displayName || u.name || '',
      Email:         u.email || '',
      City:          u.location?.city || u.city || '',
      'Total Reports': u.totalReports ?? 0,
      Points:        u.totalPoints ?? u.points ?? 0,
      'Badges Count': u.badges?.length ?? 0,
      Joined:        u.createdAt ? format(u.createdAt.toDate(), 'yyyy-MM-dd') : '',
      Anonymous:     u.isAnonymous ? 'Yes' : 'No',
    }));
    const csv = Papa.unparse(rows);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `ecobin-users-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="card p-4">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
            <input
              type="text"
              placeholder="Search by name or email…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input pl-9"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-500 font-medium whitespace-nowrap">Sort by:</label>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="input w-36"
            >
              {SORT_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <span className="text-sm text-gray-500 font-medium">
              {filtered.length} user{filtered.length !== 1 ? 's' : ''}
            </span>
            <button onClick={handleExportCSV} className="btn-secondary">
              ⬇️ Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="p-10 text-center">
            <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-gray-500">Loading users…</p>
          </div>
        ) : error ? (
          <div className="p-6 text-center text-red-500 bg-red-50">⚠️ {error}</div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center text-gray-400">
            <p className="text-4xl mb-3">👥</p>
            <p className="text-sm">No users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  {['Name', 'Email', 'City', 'Reports', 'Points', 'Badges', 'Joined', 'Actions'].map(h => (
                    <th key={h} className="table-header">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(u => (
                  <tr key={u.uid} className="hover:bg-primary-50/50 transition-colors">
                    <td className="table-cell">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-xs font-bold text-primary-700 flex-shrink-0">
                          {(u.displayName || u.name || u.email || '?')[0].toUpperCase()}
                        </div>
                        <div>
                          <span className="font-medium text-gray-900">
                            {u.displayName || u.name || '—'}
                          </span>
                          {u.isAnonymous && (
                            <span className="ml-1 text-xs text-gray-400">(guest)</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="table-cell text-gray-500">{u.email || '—'}</td>
                    <td className="table-cell">{u.location?.city || u.city || '—'}</td>
                    <td className="table-cell text-center">
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md text-xs font-semibold">
                        {u.totalReports ?? 0}
                      </span>
                    </td>
                    <td className="table-cell text-center">
                      <span className="px-2 py-0.5 bg-primary-50 text-primary-700 rounded-md text-xs font-semibold">
                        {u.totalPoints ?? u.points ?? 0}
                      </span>
                    </td>
                    <td className="table-cell text-center">
                      <span className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded-md text-xs font-semibold">
                        {u.badges?.length ?? u.badgeCount ?? 0}
                      </span>
                    </td>
                    <td className="table-cell text-gray-500 text-xs">
                      {u.createdAt ? format(u.createdAt.toDate(), 'MMM d, yyyy') : '—'}
                    </td>
                    <td className="table-cell">
                      <button
                        onClick={() => setDrawerUid(u.uid)}
                        className="btn-secondary py-1 text-xs"
                      >
                        👁 View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* User Drawer */}
      {drawerUid && (
        <UserDrawer uid={drawerUid} onClose={() => setDrawerUid(null)} />
      )}
    </div>
  );
}
