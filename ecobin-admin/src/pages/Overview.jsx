import { useEffect, useState } from 'react';
import {
  LineChart, Line,
  BarChart, Bar,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { format } from 'date-fns';
import {
  getStats,
  getReportsPerDay,
  getStatusBreakdown,
  getTopCategories,
  getTopUsersByPoints,
} from '../firebase/firestore';
import StatsCard from '../components/StatsCard';

const DONUT_COLORS = ['#f59e0b', '#3b82f6', '#10b981'];

export default function Overview() {
  const [stats,      setStats]      = useState(null);
  const [daily,      setDaily]      = useState([]);
  const [donut,      setDonut]      = useState([]);
  const [categories, setCategories] = useState([]);
  const [topUsers,   setTopUsers]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);

  useEffect(() => {
    Promise.all([
      getStats(),
      getReportsPerDay(7),
      getStatusBreakdown(),
      getTopCategories(),
      getTopUsersByPoints(5),
    ])
      .then(([s, d, dn, cat, users]) => {
        setStats(s); setDaily(d); setDonut(dn); setCategories(cat); setTopUsers(users);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (error) return (
    <div className="p-8 text-center">
      <p className="text-red-500 bg-red-50 rounded-xl p-4 border border-red-200">⚠️ {error}</p>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-4 gap-5">
        <StatsCard label="Total Users"       value={stats?.totalUsers}        icon="👥" color="green"  sub="Registered accounts"     />
        <StatsCard label="Total Reports"     value={stats?.totalReports}      icon="🗑️"  color="blue"   sub="All waste submissions"    />
        <StatsCard label="Pending Reports"   value={stats?.pendingReports}    icon="⏳" color="amber"  sub="Awaiting collection"      />
        <StatsCard label="Collected Reports" value={stats?.collectedReports}  icon="✅" color="emerald" sub="Successfully resolved"   />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-3 gap-5">
        {/* Line Chart — Reports per day */}
        <div className="col-span-2 card">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-bold text-gray-900">Reports per Day</h3>
              <p className="text-xs text-gray-400">Last 7 days activity</p>
            </div>
            <span className="text-xs bg-primary-50 text-primary-700 px-3 py-1 rounded-full font-medium border border-primary-100">
              7-day view
            </span>
          </div>
          {loading ? (
            <div className="h-52 bg-gray-50 rounded-xl animate-pulse" />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={daily}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12 }}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#166534"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#166534', strokeWidth: 0 }}
                  activeDot={{ r: 6 }}
                  name="Reports"
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Donut — Status breakdown */}
        <div className="card">
          <div className="mb-5">
            <h3 className="font-bold text-gray-900">Status Breakdown</h3>
            <p className="text-xs text-gray-400">All reports by current status</p>
          </div>
          {loading ? (
            <div className="h-52 bg-gray-50 rounded-xl animate-pulse" />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={donut}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {donut.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [value, name]}
                  contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12 }}
                />
                <Legend iconType="circle" iconSize={10} wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-3 gap-5">
        {/* Bar chart — Top waste categories */}
        <div className="col-span-2 card">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-bold text-gray-900">Top Waste Categories</h3>
              <p className="text-xs text-gray-400">Most reported waste types</p>
            </div>
          </div>
          {loading ? (
            <div className="h-48 bg-gray-50 rounded-xl animate-pulse" />
          ) : categories.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-gray-400 text-sm">No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={categories} barSize={32}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12 }}
                />
                <Bar dataKey="count" fill="#22c55e" radius={[4, 4, 0, 0]} name="Reports" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Top Users */}
        <div className="card">
          <div className="mb-4">
            <h3 className="font-bold text-gray-900">Top Users</h3>
            <p className="text-xs text-gray-400">By total points earned</p>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[1,2,3,4,5].map(i => (
                <div key={i} className="h-10 bg-gray-50 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : topUsers.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">No users yet</p>
          ) : (
            <div className="space-y-2">
              {topUsers.map((u, i) => (
                <div key={u.uid} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                    i === 0 ? 'bg-yellow-100 text-yellow-700' :
                    i === 1 ? 'bg-gray-100  text-gray-600'   :
                    i === 2 ? 'bg-orange-100 text-orange-700' :
                               'bg-primary-50 text-primary-700'
                  }`}>
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i+1}`}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-semibold text-gray-800 truncate">
                      {u.displayName || u.name || u.email?.split('@')[0] || 'User'}
                    </p>
                    <p className="text-xs text-gray-400 truncate">{u.email}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-primary-700">{u.totalPoints ?? u.points ?? 0}</p>
                    <p className="text-xs text-gray-400">pts</p>
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
