import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LogOut, PlusCircle, LayoutDashboard, User as UserIcon, ShieldAlert, LogIn, ArrowRight } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (name) => {
    return name ? name.charAt(0).toUpperCase() : 'U';
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="sticky top-0 z-50 glass border-b border-slate-200/50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex-shrink-0 flex items-center group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-md shadow-indigo-200 mr-2.5 transition-transform duration-300 group-hover:scale-105">
                <span className="text-white font-extrabold text-lg">C</span>
              </div>
              <span className="text-xl font-extrabold bg-gradient-to-r from-slate-900 via-indigo-950 to-violet-950 bg-clip-text text-transparent group-hover:text-indigo-600 transition-colors">
                Civic<span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">Connect</span>
              </span>
            </Link>
          </div>

          <div className="flex items-center space-x-2">
            {user ? (
              <>
                <Link
                  to="/report"
                  className={`px-3 py-2 rounded-lg text-sm font-semibold flex items-center gap-1.5 transition-all duration-200 ${
                    isActive('/report')
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'
                  }`}
                >
                  <PlusCircle size={16} />
                  <span>Report Issue</span>
                </Link>
                
                <Link
                  to="/my-issues"
                  className={`px-3 py-2 rounded-lg text-sm font-semibold flex items-center gap-1.5 transition-all duration-200 ${
                    isActive('/my-issues')
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'
                  }`}
                >
                  <UserIcon size={16} />
                  <span>My Issues</span>
                </Link>

                {user.role === 'admin' && (
                  <Link
                    to="/admin"
                    className={`px-3 py-2 rounded-lg text-sm font-semibold flex items-center gap-1.5 transition-all duration-200 ${
                      isActive('/admin')
                        ? 'bg-amber-50 text-amber-700'
                        : 'text-slate-600 hover:text-amber-600 hover:bg-slate-50'
                    }`}
                  >
                    <LayoutDashboard size={16} />
                    <span>Dashboard</span>
                  </Link>
                )}

                <div className="h-5 w-[1px] bg-slate-200 mx-2"></div>

                <div className="flex items-center gap-3">
                  {user.role === 'admin' ? (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 border border-amber-200/60 text-xs font-bold text-amber-700 shadow-sm">
                      <ShieldAlert size={13} className="text-amber-600" />
                      <span>Admin</span>
                    </div>
                  ) : (
                    <span className="hidden sm:inline text-xs font-semibold text-slate-500">
                      {user.name}
                    </span>
                  )}

                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-extrabold text-sm shadow-sm">
                    {getInitials(user.name)}
                  </div>
                  
                  <button
                    onClick={handleLogout}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all duration-200"
                    title="Logout"
                  >
                    <LogOut size={18} />
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="group px-4 py-2.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/50 rounded-xl text-sm font-bold transition-all duration-300 transform active:scale-95 flex items-center gap-1.5"
                >
                  <LogIn size={15} className="transition-transform duration-300 text-slate-400 group-hover:text-indigo-600" />
                  <span>Login</span>
                </Link>
                <Link
                  to="/register"
                  className="group relative bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white px-4.5 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-indigo-600/10 hover:shadow-xl hover:shadow-indigo-600/25 transition-all duration-300 transform hover:-translate-y-0.5 hover:scale-[1.02] active:scale-[0.98] flex items-center gap-1.5"
                >
                  <span>Sign Up</span>
                  <ArrowRight size={15} className="transition-transform duration-300 group-hover:translate-x-0.5" />
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
