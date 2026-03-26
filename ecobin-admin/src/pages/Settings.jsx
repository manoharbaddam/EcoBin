import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAppConfig, updateAppConfig } from '../firebase/firestore';
import { changePassword } from '../firebase/auth';
import toast from 'react-hot-toast';

export default function Settings() {
  const { user } = useAuth();

  // Password
  const [currentPw, setCurrentPw] = useState('');
  const [newPw,     setNewPw]     = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [pwLoading, setPwLoading] = useState(false);

  // App config
  const [config,     setConfig]     = useState(null);
  const [cfgLoading, setCfgLoading] = useState(true);
  const [cfgSaving,  setCfgSaving]  = useState(false);

  useEffect(() => {
    getAppConfig()
      .then(setConfig)
      .catch(() => toast.error('Failed to load config'))
      .finally(() => setCfgLoading(false));
  }, []);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!currentPw || !newPw || !confirmPw) {
      toast.error('Please fill all password fields');
      return;
    }
    if (newPw.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    if (newPw !== confirmPw) {
      toast.error('New passwords do not match');
      return;
    }
    setPwLoading(true);
    try {
      await changePassword(currentPw, newPw);
      toast.success('Password updated successfully ✓');
      setCurrentPw(''); setNewPw(''); setConfirmPw('');
    } catch (err) {
      const msg =
        err.code === 'auth/wrong-password'    ? 'Current password is incorrect' :
        err.code === 'auth/weak-password'     ? 'New password is too weak' :
        err.code === 'auth/requires-recent-login' ? 'Please log out and log back in first' :
        err.message;
      toast.error(msg);
    } finally {
      setPwLoading(false);
    }
  };

  const handleConfigSave = async (e) => {
    e.preventDefault();
    setCfgSaving(true);
    try {
      await updateAppConfig(config);
      toast.success('App config saved ✓');
    } catch {
      toast.error('Failed to save config');
    } finally {
      setCfgSaving(false);
    }
  };

  const CONSOLE_LINKS = [
    { label: 'Firebase Console',     url: 'https://console.firebase.google.com',                               icon: '🔥' },
    { label: 'Firestore Database',   url: 'https://console.firebase.google.com/project/ecobin-a629b/firestore', icon: '🗄️'  },
    { label: 'Firebase Auth',        url: 'https://console.firebase.google.com/project/ecobin-a629b/authentication', icon: '🔐' },
    { label: 'Cloud Functions',      url: 'https://console.firebase.google.com/project/ecobin-a629b/functions', icon: '⚡' },
    { label: 'Firebase Storage',     url: 'https://console.firebase.google.com/project/ecobin-a629b/storage',   icon: '📦' },
    { label: 'Google AI Studio',     url: 'https://aistudio.google.com',                                        icon: '🤖' },
  ];

  return (
    <div className="grid grid-cols-2 gap-6 max-w-4xl">
      {/* Admin Profile */}
      <div className="card col-span-2">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center text-2xl font-bold text-primary-700">
            {user?.email?.[0]?.toUpperCase() || 'A'}
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Admin Profile</h3>
            <p className="text-gray-600 text-sm">{user?.email}</p>
            <span className="inline-block mt-1 text-xs bg-primary-100 text-primary-700 px-3 py-0.5 rounded-full font-semibold border border-primary-200">
              🛡️ Administrator
            </span>
          </div>
          <div className="ml-auto text-right">
            <p className="text-xs text-gray-400">Project</p>
            <p className="text-sm font-semibold text-gray-700">ecobin-a629b</p>
          </div>
        </div>
      </div>

      {/* Change Password */}
      <div className="card">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center">🔑</div>
          <div>
            <h3 className="font-bold text-gray-900">Change Password</h3>
            <p className="text-xs text-gray-400">Re-authentication required</p>
          </div>
        </div>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          {[
            { label: 'Current Password', val: currentPw, set: setCurrentPw, placeholder: '••••••••' },
            { label: 'New Password',     val: newPw,     set: setNewPw,     placeholder: 'Min. 6 characters' },
            { label: 'Confirm New',      val: confirmPw, set: setConfirmPw, placeholder: 'Re-enter new password' },
          ].map(f => (
            <div key={f.label}>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">{f.label}</label>
              <input
                type="password"
                value={f.val}
                onChange={e => f.set(e.target.value)}
                placeholder={f.placeholder}
                className="input"
                disabled={pwLoading}
              />
            </div>
          ))}
          <button type="submit" disabled={pwLoading} className="btn-primary w-full justify-center">
            {pwLoading ? (
              <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Updating…</>
            ) : '🔑 Update Password'}
          </button>
        </form>
      </div>

      {/* App Config */}
      <div className="card">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-9 h-9 bg-primary-100 rounded-lg flex items-center justify-center">⚙️</div>
          <div>
            <h3 className="font-bold text-gray-900">App Configuration</h3>
            <p className="text-xs text-gray-400">Saved to Firestore: appConfig/settings</p>
          </div>
        </div>
        {cfgLoading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => <div key={i} className="h-14 bg-gray-50 rounded-lg animate-pulse" />)}
          </div>
        ) : config ? (
          <form onSubmit={handleConfigSave} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Points Awarded per Scan
              </label>
              <input
                type="number"
                min={0}
                max={1000}
                value={config.pointsPerScan ?? 20}
                onChange={e => setConfig(prev => ({ ...prev, pointsPerScan: Number(e.target.value) }))}
                className="input"
              />
              <p className="text-xs text-gray-400 mt-1">Default: 20 pts per waste classification scan</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Points per Badge Unlock
              </label>
              <input
                type="number"
                min={0}
                max={1000}
                value={config.pointsPerBadge ?? 50}
                onChange={e => setConfig(prev => ({ ...prev, pointsPerBadge: Number(e.target.value) }))}
                className="input"
              />
              <p className="text-xs text-gray-400 mt-1">Bonus awarded when user earns a new badge</p>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200">
              <div>
                <p className="text-sm font-semibold text-gray-800">Enable New Registrations</p>
                <p className="text-xs text-gray-400">Allow new users to sign up on the mobile app</p>
              </div>
              <button
                type="button"
                onClick={() => setConfig(prev => ({ ...prev, enableNewRegistrations: !prev.enableNewRegistrations }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                  config.enableNewRegistrations ? 'bg-primary-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${
                    config.enableNewRegistrations ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            <button type="submit" disabled={cfgSaving} className="btn-primary w-full justify-center">
              {cfgSaving ? (
                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving…</>
              ) : '💾 Save Configuration'}
            </button>
          </form>
        ) : (
          <p className="text-sm text-gray-400">Could not load configuration</p>
        )}
      </div>

      {/* Firebase Console Links */}
      <div className="card col-span-2">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-9 h-9 bg-orange-100 rounded-lg flex items-center justify-center">🔗</div>
          <div>
            <h3 className="font-bold text-gray-900">Firebase Console Links</h3>
            <p className="text-xs text-gray-400">Quick access to project services</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {CONSOLE_LINKS.map(link => (
            <a
              key={link.label}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl hover:border-primary-300 hover:bg-primary-50 transition-all group"
            >
              <span className="text-xl">{link.icon}</span>
              <span className="text-sm font-medium text-gray-700 group-hover:text-primary-700 transition-colors">
                {link.label}
              </span>
              <span className="ml-auto text-gray-300 group-hover:text-primary-400 text-xs">↗</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
