import { useEffect, useState } from 'react';
import { getUserById, getUserReports } from '../firebase/firestore';
import { format } from 'date-fns';
import StatusBadge from './StatusBadge';

export default function UserDrawer({ uid, onClose }) {
  const [user, setUser]       = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) return;
    setLoading(true);
    Promise.all([getUserById(uid), getUserReports(uid, 5)])
      .then(([u, r]) => { setUser(u); setReports(r); })
      .finally(() => setLoading(false));
  }, [uid]);

  const lat = user?.location?.latitude  || user?.locationLat;
  const lng = user?.location?.longitude || user?.locationLng;
  const hasLocation = lat && lng;

  const mapSrc = hasLocation
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.01}%2C${lat - 0.01}%2C${lng + 0.01}%2C${lat + 0.01}&layer=mapnik&marker=${lat}%2C${lng}`
    : null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 z-40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <aside className="fixed right-0 top-0 h-full w-[520px] bg-white z-50 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-primary-900 text-white flex-shrink-0">
          <h3 className="font-bold text-lg">User Details</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-primary-700 flex items-center justify-center text-xl leading-none transition-colors"
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : !user ? (
            <div className="p-6 text-center text-gray-500">User not found</div>
          ) : (
            <>
              {/* Profile */}
              <div className="px-6 py-5 border-b border-gray-100">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center text-2xl font-bold text-primary-700">
                    {(user.displayName || user.name || user.email || '?')[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-lg font-bold text-gray-900">
                      {user.displayName || user.name || 'No name'}
                    </p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      UID: {user.uid}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Points', value: user.totalPoints ?? user.points ?? 0, color: 'text-primary-700 bg-primary-50' },
                    { label: 'Reports', value: user.totalReports ?? 0,              color: 'text-blue-700 bg-blue-50' },
                    { label: 'Badges',  value: (user.badges?.length ?? user.badgeCount ?? 0), color: 'text-amber-700 bg-amber-50' },
                  ].map(item => (
                    <div key={item.label} className={`${item.color} rounded-xl p-3 text-center`}>
                      <p className="text-xl font-bold">{item.value}</p>
                      <p className="text-xs font-medium opacity-70">{item.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Details */}
              <div className="px-6 py-4 border-b border-gray-100 space-y-2">
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Profile Info</h4>
                {[
                  { label: 'City',       value: user.location?.city || user.city || '—' },
                  { label: 'Joined',     value: user.createdAt ? format(user.createdAt.toDate(), 'MMM d, yyyy') : '—' },
                  { label: 'Anonymous',  value: user.isAnonymous ? 'Yes' : 'No' },
                ].map(item => (
                  <div key={item.label} className="flex justify-between text-sm">
                    <span className="text-gray-500 font-medium">{item.label}</span>
                    <span className="text-gray-800">{item.value}</span>
                  </div>
                ))}
              </div>

              {/* Badges */}
              {user.badges?.length > 0 && (
                <div className="px-6 py-4 border-b border-gray-100">
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Badges</h4>
                  <div className="flex flex-wrap gap-2">
                    {user.badges.map((b, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-semibold border border-primary-200"
                      >
                        🏅 {typeof b === 'string' ? b : b.name || b.badgeId || 'Badge'}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Map */}
              <div className="px-6 py-4 border-b border-gray-100">
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Location</h4>
                {hasLocation ? (
                  <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                    <iframe
                      title="User Location"
                      src={mapSrc}
                      width="100%"
                      height="200"
                      frameBorder="0"
                      scrolling="no"
                      loading="lazy"
                    />
                  </div>
                ) : (
                  <div className="h-24 bg-gray-50 rounded-xl border border-dashed border-gray-200 flex items-center justify-center">
                    <p className="text-sm text-gray-400">No location data</p>
                  </div>
                )}
                {hasLocation && (
                  <p className="text-xs text-gray-400 mt-2 text-center">
                    {lat.toFixed(5)}, {lng.toFixed(5)}
                  </p>
                )}
              </div>

              {/* Recent Reports */}
              <div className="px-6 py-4">
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  Recent Reports ({reports.length})
                </h4>
                {reports.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-4">No reports submitted yet</p>
                ) : (
                  <div className="space-y-2">
                    {reports.map(r => (
                      <div key={r.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                        <div>
                          <p className="text-sm font-medium text-gray-800 capitalize">
                            {r.wasteType || r.classification?.category || 'Unknown type'}
                          </p>
                          <p className="text-xs text-gray-400">
                            {r.createdAt ? format(r.createdAt.toDate(), 'MMM d, yyyy') : '—'}
                          </p>
                        </div>
                        <StatusBadge status={r.status || 'pending'} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </aside>
    </>
  );
}
