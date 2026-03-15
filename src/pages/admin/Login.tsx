import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Lock, Mail, AlertCircle, ShieldCheck } from 'lucide-react';
import { ensureAdminUser } from '../../lib/seed';

const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      let userDoc;
      try {
        userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      } catch (fsErr: any) {
        console.error('Firestore error during login:', fsErr);
        // If we can't even check the doc, but it's a known admin email, we can still try to proceed
        const isAdminEmail = email.toLowerCase() === 'rumalfernando@luxeboutique.lk' || email.toLowerCase() === 'nirwanisthe@gmail.com';
        if (isAdminEmail) {
          // Try to create the doc if it might be missing and we have permission
          try {
            await setDoc(doc(db, 'users', userCredential.user.uid), {
              email: email.toLowerCase(),
              role: 'admin',
              name: email.split('@')[0],
              createdAt: new Date().toISOString()
            });
            navigate('/admin/dashboard');
            return;
          } catch (setErr) {
            console.error('Failed to auto-create admin doc:', setErr);
            setError('Auth successful, but failed to verify admin permissions. Please ensure Firestore rules are deployed.');
            return;
          }
        }
        setError('Auth successful, but failed to check permissions. ' + fsErr.message);
        return;
      }
      
      const isAdminEmail = email.toLowerCase() === 'rumalfernando@luxeboutique.lk' || email.toLowerCase() === 'nirwanisthe@gmail.com';
      
      if ((userDoc.exists() && userDoc.data().role === 'admin') || isAdminEmail) {
        // If it's a hardcoded admin but doc is missing, create it now
        if (!userDoc.exists() && isAdminEmail) {
          await setDoc(doc(db, 'users', userCredential.user.uid), {
            email: email.toLowerCase(),
            role: 'admin',
            name: email.split('@')[0],
            createdAt: new Date().toISOString()
          });
        }
        navigate('/admin/dashboard');
      } else {
        await auth.signOut();
        setError('Access denied. You do not have admin privileges.');
      }
    } catch (err: any) {
      if (err.code === 'auth/operation-not-allowed') {
        setError('Email/Password sign-in is not enabled in Firebase Console. Please go to Authentication > Sign-in method and enable Email/Password.');
      } else if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Invalid email or password. If you haven\'t initialized the admin account yet, please click the button below.');
      } else {
        setError('Login failed: ' + err.message);
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInitializeAdmin = async () => {
    setInitializing(true);
    setError('');
    setSuccess('');
    try {
      await ensureAdminUser();
      setSuccess('Admin account initialized successfully! You can now login.');
    } catch (err: any) {
      if (err.code === 'auth/operation-not-allowed') {
        setError('Email/Password sign-in is not enabled in Firebase Console. Please go to Authentication > Sign-in method and enable Email/Password.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('Admin account already exists. Please try logging in.');
      } else {
        setError('Failed to initialize admin account. Please check console.');
      }
      console.error(err);
    } finally {
      setInitializing(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white shadow-2xl p-10">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-serif tracking-widest uppercase mb-2">Luxe Admin</h1>
          <p className="text-stone-400 text-sm">Enter your credentials to access the dashboard</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm flex items-center">
            <AlertCircle size={18} className="mr-2 flex-shrink-0" />
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 text-emerald-600 text-sm flex items-center">
            <ShieldCheck size={18} className="mr-2 flex-shrink-0" />
            {success}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-xs uppercase tracking-widest font-bold text-stone-500 mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" size={18} />
              <input 
                type="email" 
                required
                className="w-full pl-12 pr-4 py-4 border border-stone-200 focus:outline-none focus:border-stone-900 transition-colors"
                placeholder="admin@luxeboutique.lk"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest font-bold text-stone-500 mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" size={18} />
              <input 
                type={showPassword ? "text" : "password"} 
                required
                className="w-full pl-12 pr-12 py-4 border border-stone-200 focus:outline-none focus:border-stone-900 transition-colors"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading || initializing}
            className="w-full bg-stone-900 text-white py-5 uppercase tracking-widest text-xs font-bold hover:bg-stone-800 transition-colors disabled:bg-stone-400"
          >
            {loading ? 'Authenticating...' : 'Login to Dashboard'}
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-stone-100 text-center">
          <p className="text-stone-400 text-xs mb-4 uppercase tracking-widest">First time setup?</p>
          <div className="mb-4 p-3 bg-stone-50 rounded text-[10px] text-stone-500 text-left space-y-1">
            <p><strong>Email:</strong> rumalfernando@luxeboutique.lk</p>
            <p><strong>Password:</strong> WelCome./@1</p>
          </div>
          <button 
            onClick={handleInitializeAdmin}
            disabled={loading || initializing}
            className="text-stone-600 hover:text-stone-900 text-xs font-bold uppercase tracking-widest flex items-center justify-center mx-auto gap-2 transition-colors disabled:opacity-50"
          >
            <ShieldCheck size={14} />
            {initializing ? 'Initializing...' : 'Initialize Admin Account'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
