import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signIn } from '../firebase/auth';
import toast from 'react-hot-toast';

export default function Login() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      await signIn(email, password);
      toast.success('Welcome back, Admin! 🌱');
      navigate('/');
    } catch (err) {
      const msg =
        err.code === 'auth/invalid-credential' ? 'Invalid email or password' :
        err.code === 'auth/user-not-found'     ? 'No account found with this email' :
        err.code === 'auth/wrong-password'     ? 'Incorrect password' :
        err.code === 'auth/too-many-requests'  ? 'Too many attempts. Try again later.' :
        'Login failed. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 flex items-center justify-center p-4">
      {/* Background pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {['top-20 left-20', 'bottom-20 right-20', 'top-1/2 left-10', 'top-10 right-1/3'].map((pos, i) => (
          <div
            key={i}
            className={`absolute ${pos} w-64 h-64 bg-white/5 rounded-full blur-3xl`}
          />
        ))}
      </div>

      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header band */}
          <div className="bg-gradient-to-r from-primary-700 to-primary-500 px-8 py-10 text-white text-center">
            <div className="w-20 h-20 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center text-4xl mx-auto mb-4 shadow-lg">
              ♻️
            </div>
            <h1 className="text-2xl font-bold">EcoBin Admin</h1>
            <p className="text-primary-200 text-sm mt-1">Smart Garbage Segregation Dashboard</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-8 py-8 space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Admin Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@ecobin.app"
                className="input"
                autoFocus
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary-700 hover:bg-primary-800 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 active:scale-95"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Signing in…
                </>
              ) : (
                <>🔐 Sign In to Dashboard</>
              )}
            </button>

            <p className="text-center text-xs text-gray-400">
              Restricted to authorized EcoBin administrators only
            </p>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-primary-300 text-xs mt-6">
          EcoBin Admin v1.0 · For city waste management personnel
        </p>
      </div>
    </div>
  );
}
