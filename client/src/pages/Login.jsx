import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import axiosInstance from '../api/axios';
import { Mail, Lock, ShieldCheck, UserCheck, ArrowRight } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isAdmin) {
        const res = await axiosInstance.post('/auth/login', { email, password });
        if (res.data.user.role !== 'admin') {
          toast.error('Access Denied: This account does not have administrator privileges.');
          setLoading(false);
          return;
        }
      }

      await login(email, password);
      toast.success(isAdmin ? 'Logged in as Administrator' : 'Logged in successfully');
      
      const from = location.state?.from || '/';
      navigate(from);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAdmin = () => {
    setIsAdmin(!isAdmin);
    setEmail('');
    setPassword('');
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Visual Glowing Circles */}
      <div className="absolute top-1/4 left-1/3 w-80 h-80 rounded-full bg-indigo-500/10 blur-3xl -z-10 animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/3 w-96 h-96 rounded-full bg-violet-500/10 blur-3xl -z-10"></div>

      <div 
        className={`max-w-md w-full space-y-8 glass p-8 md:p-10 rounded-3xl shadow-2xl transition-all duration-500 ${
          isAdmin 
            ? 'border-amber-200/60 shadow-amber-100/30' 
            : 'border-slate-200/50 shadow-indigo-100/30'
        }`}
      >
        <div className="text-center">
          <div className="mx-auto h-16 w-16 rounded-2xl flex items-center justify-center shadow-lg mb-5 transition-transform duration-300 hover:scale-105 bg-white">
            {isAdmin ? (
              <ShieldCheck size={32} className="text-amber-500" />
            ) : (
              <UserCheck size={32} className="text-indigo-600" />
            )}
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">
            {isAdmin ? 'Municipal Dashboard' : 'Welcome back'}
          </h2>
          <p className="mt-2 text-xs font-semibold text-slate-400">
            {isAdmin ? 'Administrator Authentication Portal' : 'Sign in to access your CivicConnect reports'}
          </p>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email-address" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                {isAdmin ? 'Admin Email Address' : 'Email Address'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail size={16} />
                </div>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  required
                  autoComplete="off"
                  className="block w-full pl-10 pr-3 py-2.5 bg-white border border-slate-200 text-slate-800 rounded-xl sm:text-sm placeholder-slate-400"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock size={16} />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  autoComplete="off"
                  className="block w-full pl-10 pr-3 py-2.5 bg-white border border-slate-200 text-slate-800 rounded-xl sm:text-sm placeholder-slate-400"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className={`group w-full flex items-center justify-center gap-2 py-3 px-4 border border-transparent text-sm font-extrabold rounded-xl text-white shadow-md cursor-pointer transition-all duration-300 transform hover:-translate-y-0.5 hover:scale-[1.01] active:scale-[0.99] ${
                isAdmin 
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-amber-500/20 hover:shadow-lg hover:shadow-amber-500/30' 
                  : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 shadow-indigo-600/20 hover:shadow-lg hover:shadow-indigo-600/30'
              } ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              <span>{loading ? 'Authenticating...' : (isAdmin ? 'Sign in as Administrator' : 'Sign in')}</span>
              {!loading && (
                <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
              )}
            </button>

            <button
              type="button"
              onClick={handleToggleAdmin}
              disabled={loading}
              className={`w-full flex items-center justify-center gap-1.5 py-2.5 px-4 border text-xs font-bold rounded-xl cursor-pointer shadow-sm transition-all duration-300 transform active:scale-[0.98] ${
                isAdmin 
                  ? 'border-slate-200 text-slate-600 bg-white hover:bg-indigo-50/30 hover:border-indigo-200 hover:text-indigo-600'
                  : 'border-slate-200 text-slate-600 bg-white hover:bg-amber-50/30 hover:border-amber-200 hover:text-amber-600'
              }`}
            >
              {isAdmin ? (
                <>
                  <UserCheck size={14} className="animate-pulse" />
                  <span>Switch to Citizen Portal</span>
                </>
              ) : (
                <>
                  <ShieldCheck size={14} className="animate-pulse" />
                  <span>Switch to Administrator Portal</span>
                </>
              )}
            </button>
          </div>
        </form>

        {!isAdmin && (
          <div className="text-center mt-6 pt-4 border-t border-slate-100">
            <p className="text-xs text-slate-500 font-semibold">
              Don't have an account?{' '}
              <Link to="/register" className="font-bold text-indigo-600 hover:text-indigo-700 transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-[1.5px] after:w-0 hover:after:w-full after:bg-indigo-600 after:transition-all after:duration-300">
                Create a Free Account
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
