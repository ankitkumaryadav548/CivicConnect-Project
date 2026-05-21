import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import { Mail, Lock, User, UserPlus, ArrowRight } from 'lucide-react';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(name, email, password);
      toast.success('Account created successfully');
      
      const from = location.state?.from || '/';
      navigate(from);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Visual Glowing Circles */}
      <div className="absolute top-1/4 left-1/3 w-80 h-80 rounded-full bg-indigo-500/10 blur-3xl -z-10 animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/3 w-96 h-96 rounded-full bg-violet-500/10 blur-3xl -z-10"></div>

      <div className="max-w-md w-full space-y-8 glass p-8 md:p-10 rounded-3xl shadow-2xl border border-slate-200/50 shadow-indigo-100/30 transition-all duration-500">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 rounded-2xl flex items-center justify-center bg-white shadow-lg mb-5 transition-transform duration-300 hover:scale-105">
            <UserPlus size={32} className="text-indigo-600" />
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">
            Create an account
          </h2>
          <p className="mt-2 text-xs font-semibold text-slate-400">
            Join CivicConnect to report issues and collaborate with municipal teams
          </p>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User size={16} />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  autoComplete="off"
                  className="block w-full pl-10 pr-3 py-2.5 bg-white border border-slate-200 text-slate-800 rounded-xl sm:text-sm placeholder-slate-400"
                  placeholder="Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label htmlFor="email-address" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Email Address
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
                  minLength="6"
                  autoComplete="off"
                  className="block w-full pl-10 pr-3 py-2.5 bg-white border border-slate-200 text-slate-800 rounded-xl sm:text-sm placeholder-slate-400"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className={`group w-full flex items-center justify-center gap-2 py-3 px-4 border border-transparent text-sm font-extrabold rounded-xl text-white shadow-md cursor-pointer transition-all duration-300 transform hover:-translate-y-0.5 hover:scale-[1.01] active:scale-[0.99] bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 shadow-indigo-600/20 hover:shadow-lg hover:shadow-indigo-600/30 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              <span>{loading ? 'Creating account...' : 'Create Free Account'}</span>
              {!loading && (
                <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
              )}
            </button>
          </div>
        </form>

        <div className="text-center mt-6 pt-4 border-t border-slate-100">
          <p className="text-xs text-slate-500 font-semibold">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-indigo-600 hover:text-indigo-700 transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-[1.5px] after:w-0 hover:after:w-full after:bg-indigo-600 after:transition-all after:duration-300">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
