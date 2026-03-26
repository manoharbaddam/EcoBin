import { useEffect, useState } from 'react';
import { getAllUsers, sendAdminNotification, getNotificationHistory } from '../firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function Notifications() {
  const { user } = useAuth();

  // Form state
  const [title,       setTitle]      = useState('');
  const [body,        setBody]       = useState('');
  const [target,      setTarget]     = useState('all');
  const [targetUid,   setTargetUid]  = useState('');
  const [targetName,  setTargetName] = useState('');
  const [users,       setUsers]      = useState([]);
  const [userSearch,  setUserSearch] = useState('');
  const [sending,     setSending]    = useState(false);

  // History
  const [history,  setHistory]  = useState([]);
  const [histLoad, setHistLoad] = useState(true);

  useEffect(() => {
    getAllUsers().then(setUsers).catch(() => {});
    loadHistory();
  }, []);

  const loadHistory = () => {
    setHistLoad(true);
    getNotificationHistory()
      .then(setHistory)
      .catch(() => {})
      .finally(() => setHistLoad(false));
  };

  const filteredUsers = users.filter(u => {
    const s = userSearch.toLowerCase();
    return (
      (u.displayName || u.name || '').toLowerCase().includes(s) ||
      (u.email || '').toLowerCase().includes(s)
    );
  }).slice(0, 50);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      toast.error('Title and message are required');
      return;
    }
    if (target === 'specific' && !targetUid) {
      toast.error('Please select a target user');
      return;
    }

    setSending(true);
    try {
      await sendAdminNotification({
        title:      title.trim(),
        body:       body.trim(),
        target:     target === 'all' ? 'all' : targetUid,
        targetName: target === 'all' ? 'All Users' : targetName,
        sentBy:     user?.email || 'admin',
      });
      toast.success('Notification sent! 🔔');
      setTitle(''); setBody(''); setTarget('all'); setTargetUid(''); setTargetName(''); setUserSearch('');
      loadHistory();
    } catch (err) {
      toast.error('Failed to send: ' + err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="grid grid-cols-5 gap-6">
      {/* Send Form */}
      <div className="col-span-2">
        <div className="card">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-9 h-9 bg-primary-100 rounded-lg flex items-center justify-center text-lg">🔔</div>
            <div>
              <h3 className="font-bold text-gray-900">Send Notification</h3>
              <p className="text-xs text-gray-400">Push to Firebase + mobile app</p>
            </div>
          </div>

          <form onSubmit={handleSend} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Title *</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Collection Day Reminder"
                className="input"
                maxLength={80}
              />
              <p className="text-xs text-gray-400 mt-1 text-right">{title.length}/80</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Message Body *</label>
              <textarea
                value={body}
                onChange={e => setBody(e.target.value)}
                placeholder="e.g. Waste collection will happen tomorrow between 8–11am. Please segregate waste properly."
                rows={4}
                className="input resize-none"
                maxLength={300}
              />
              <p className="text-xs text-gray-400 mt-1 text-right">{body.length}/300</p>
            </div>

            {/* Target */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Target Audience</label>
              <div className="space-y-2">
                <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors hover:bg-primary-50 border-gray-200 has-[:checked]:border-primary-400 has-[:checked]:bg-primary-50">
                  <input
                    type="radio"
                    name="target"
                    value="all"
                    checked={target === 'all'}
                    onChange={() => setTarget('all')}
                    className="w-4 h-4 text-primary-600"
                  />
                  <div>
                    <p className="text-sm font-semibold text-gray-800">📢 All Users</p>
                    <p className="text-xs text-gray-400">Send to everyone on the platform</p>
                  </div>
                </label>
                <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors hover:bg-primary-50 border-gray-200 has-[:checked]:border-primary-400 has-[:checked]:bg-primary-50">
                  <input
                    type="radio"
                    name="target"
                    value="specific"
                    checked={target === 'specific'}
                    onChange={() => setTarget('specific')}
                    className="w-4 h-4 text-primary-600"
                  />
                  <div>
                    <p className="text-sm font-semibold text-gray-800">👤 Specific User</p>
                    <p className="text-xs text-gray-400">Target a single user by name/email</p>
                  </div>
                </label>
              </div>

              {target === 'specific' && (
                <div className="mt-3">
                  <input
                    type="text"
                    placeholder="Search user by name or email…"
                    value={userSearch}
                    onChange={e => setUserSearch(e.target.value)}
                    className="input mb-2"
                  />
                  <div className="border border-gray-200 rounded-lg overflow-hidden max-h-40 overflow-y-auto">
                    {filteredUsers.length === 0 ? (
                      <div className="p-3 text-sm text-gray-400 text-center">No users found</div>
                    ) : (
                      filteredUsers.map(u => (
                        <button
                          key={u.uid}
                          type="button"
                          onClick={() => {
                            setTargetUid(u.uid);
                            setTargetName(u.displayName || u.name || u.email);
                            setUserSearch(u.displayName || u.name || u.email);
                          }}
                          className={`w-full text-left px-3 py-2 text-sm hover:bg-primary-50 transition-colors border-b border-gray-100 last:border-0 ${
                            targetUid === u.uid ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-700'
                          }`}
                        >
                          <span className="font-medium">{u.displayName || u.name || '—'}</span>
                          <span className="text-gray-400 ml-2 text-xs">{u.email}</span>
                        </button>
                      ))
                    )}
                  </div>
                  {targetUid && (
                    <p className="text-xs text-primary-600 mt-1.5 font-medium">
                      ✓ Selected: {targetName}
                    </p>
                  )}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={sending}
              className="btn-primary w-full justify-center py-2.5"
            >
              {sending ? (
                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Sending…</>
              ) : (
                <>🔔 Send Notification</>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* History */}
      <div className="col-span-3">
        <div className="card p-0 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-gray-900">Notification History</h3>
              <p className="text-xs text-gray-400">{history.length} notification{history.length !== 1 ? 's' : ''} sent</p>
            </div>
            <button onClick={loadHistory} className="btn-secondary py-1.5 text-xs">↻ Refresh</button>
          </div>
          {histLoad ? (
            <div className="p-10 text-center">
              <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : history.length === 0 ? (
            <div className="p-10 text-center text-gray-400">
              <p className="text-4xl mb-3">🔔</p>
              <p className="text-sm">No notifications sent yet</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {history.map(n => (
                <div key={n.id} className="px-5 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0 mt-0.5 ${
                        n.target === 'all' ? 'bg-primary-100' : 'bg-blue-100'
                      }`}>
                        {n.target === 'all' ? '📢' : '👤'}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{n.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{n.body}</p>
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                            n.target === 'all'
                              ? 'bg-primary-50 text-primary-700'
                              : 'bg-blue-50 text-blue-700'
                          }`}>
                            {n.target === 'all' ? 'All Users' : n.targetName || n.target}
                          </span>
                          <span className="text-xs text-gray-400">by {n.sentBy}</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0">
                      {n.sentAt ? format(n.sentAt.toDate(), 'MMM d, h:mm a') : '—'}
                    </p>
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
