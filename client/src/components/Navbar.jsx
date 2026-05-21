import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LogOut, PlusCircle, LayoutDashboard, User as UserIcon, ShieldAlert, LogIn, ArrowRight, BarChart3, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';
import { createPortal } from 'react-dom';

const themeAccents = {
  'General Inquiry': {
    primary: 'indigo',
    gradient: 'from-indigo-600 to-violet-600',
    hoverGradient: 'hover:from-indigo-700 hover:to-violet-700',
    lightBg: 'bg-indigo-50/50',
    border: 'border-indigo-100',
    text: 'text-indigo-600',
    ring: 'focus:ring-indigo-500/20 focus:border-indigo-500',
    glow: 'bg-indigo-600/10'
  },
  'System Support': {
    primary: 'amber',
    gradient: 'from-amber-500 to-orange-600',
    hoverGradient: 'hover:from-amber-600 hover:to-orange-700',
    lightBg: 'bg-amber-50/50',
    border: 'border-amber-100',
    text: 'text-amber-600',
    ring: 'focus:ring-amber-500/20 focus:border-amber-500',
    glow: 'bg-amber-600/10'
  },
  'Report Abuse': {
    primary: 'rose',
    gradient: 'from-rose-500 to-red-600',
    hoverGradient: 'hover:from-rose-600 hover:to-red-700',
    lightBg: 'bg-rose-50/50',
    border: 'border-rose-100',
    text: 'text-rose-600',
    ring: 'focus:ring-rose-500/20 focus:border-rose-500',
    glow: 'bg-rose-600/10'
  },
  'Partnership Request': {
    primary: 'emerald',
    gradient: 'from-emerald-500 to-teal-600',
    hoverGradient: 'hover:from-emerald-600 hover:to-teal-700',
    lightBg: 'bg-emerald-50/50',
    border: 'border-emerald-100',
    text: 'text-emerald-600',
    ring: 'focus:ring-emerald-500/20 focus:border-emerald-500',
    glow: 'bg-emerald-600/10'
  }
};

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Contact Support states
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: user ? user.name : '',
    email: user ? user.email : '',
    subject: 'General Inquiry',
    message: '',
    extraField: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const currentAccent = themeAccents[contactForm.subject] || themeAccents['General Inquiry'];

  // Sync user info when authentication state changes
  useEffect(() => {
    if (user) {
      setContactForm(prev => ({
        ...prev,
        name: user.name,
        email: user.email
      }));
    } else {
      setContactForm(prev => ({
        ...prev,
        name: '',
        email: ''
      }));
    }
  }, [user]);

  // Lock background body scroll when contact modal is active
  useEffect(() => {
    if (isContactOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isContactOpen]);

  // Reset extra field when subject changes to keep form consistent
  useEffect(() => {
    setContactForm(prev => ({ ...prev, extraField: '' }));
  }, [contactForm.subject]);

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.message) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    // Simulate support ticket API dispatch
    setTimeout(() => {
      toast.success('Thank you for reaching out! Our support team will respond shortly.');
      setContactForm(prev => ({
        ...prev,
        message: '',
        extraField: ''
      }));
      setIsSubmitting(false);
      setIsContactOpen(false);
    }, 1200);
  };

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
            {user?.role === 'admin' && (
              <Link
                to="/analytics"
                className={`px-3 py-2 rounded-lg text-sm font-semibold flex items-center gap-1.5 transition-all duration-200 ${
                  isActive('/analytics')
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'
                }`}
              >
                <BarChart3 size={16} />
                <span className="hidden sm:inline">Civic Analytics</span>
                <span className="sm:hidden">Analytics</span>
              </Link>
            )}

            {user ? (
              <>
                {user.role !== 'admin' && (
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
                  </>
                )}

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

                <button
                  onClick={() => setIsContactOpen(true)}
                  className="px-4 py-2 bg-gradient-to-r from-indigo-50 to-violet-50 hover:from-indigo-100 hover:to-violet-100 border border-indigo-100/50 rounded-xl text-sm font-bold flex items-center gap-1.5 transition-all duration-300 text-indigo-700 hover:text-indigo-800 shadow-sm hover:shadow active:scale-95 cursor-pointer relative group"
                >
                  <MessageSquare size={15} className="group-hover:scale-110 group-hover:rotate-6 transition-all text-indigo-600" />
                  <span className="hidden sm:inline">Contact Support</span>
                  <span className="sm:hidden">Contact</span>
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                </button>

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
                <button
                  onClick={() => setIsContactOpen(true)}
                  className="px-4 py-2 bg-gradient-to-r from-indigo-50 to-violet-50 hover:from-indigo-100 hover:to-violet-100 border border-indigo-100/50 rounded-xl text-sm font-bold flex items-center gap-1.5 transition-all duration-300 text-indigo-700 hover:text-indigo-800 shadow-sm hover:shadow active:scale-95 cursor-pointer mr-1 relative group"
                >
                  <MessageSquare size={15} className="group-hover:scale-110 group-hover:rotate-6 transition-all text-indigo-600" />
                  <span>Contact</span>
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                </button>
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


      {/* Dynamic Opaque Contact Modal Backdrop */}
      {isContactOpen && createPortal(
        <div className="fixed inset-0 bg-slate-950 z-[99999] flex items-center justify-center p-4 overflow-y-auto w-screen h-screen">
          {/* 100% Solid color background layer to prevent looking through */}
          <div className="absolute inset-0 bg-slate-950"></div>
          {/* Subtle glowing grid background block */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-35 z-0"></div>
          <div className={`absolute top-1/4 left-1/4 w-96 h-96 rounded-full ${currentAccent.glow} blur-3xl transition-colors duration-500 z-0`}></div>
          <div className={`absolute bottom-10 right-1/4 w-96 h-96 rounded-full ${currentAccent.glow} blur-3xl transition-colors duration-500 z-0`}></div>

          <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl p-6 md:p-8 w-full max-w-lg relative overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-10 my-8">
            {/* Design header banner decoration with dynamic gradient */}
            <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${currentAccent.gradient} transition-all duration-500`}></div>

            <div className="flex justify-between items-start mb-5">
              <div className="flex items-center gap-2.5">
                <div className={`w-9 h-9 rounded-xl ${currentAccent.lightBg} border ${currentAccent.border} ${currentAccent.text} flex items-center justify-center shadow-sm transition-colors duration-500`}>
                  <MessageSquare size={18} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Support Workspace</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Municipal Coordination Console</p>
                </div>
              </div>
              <button 
                onClick={() => setIsContactOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer text-sm font-bold font-sans"
              >
                ✕
              </button>
            </div>

            {/* Dynamic Subject Info Box */}
            <div className={`mb-6 p-4 rounded-2xl ${currentAccent.lightBg} border ${currentAccent.border} text-xs ${currentAccent.text} font-semibold leading-relaxed transition-all duration-500`}>
              {contactForm.subject === 'General Inquiry' && "📂 Have general feedback, suggestions, or community concerns? Write to us below."}
              {contactForm.subject === 'System Support' && "⚙️ Encountered a portal bug or technical issue? Detail your setup and describe what broke."}
              {contactForm.subject === 'Report Abuse' && "⚠️ Report reports, comments, or issues violating community guidelines. Our safety crew will review."}
              {contactForm.subject === 'Partnership Request' && "🤝 Coordinate civic integration, data sharing proposals, or municipal corporate support paths."}
            </div>

            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Your Name *</label>
                  <input
                    type="text"
                    required
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    placeholder="Enter your name"
                    className={`block w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 ${currentAccent.ring} transition-all duration-300`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    placeholder="Enter email"
                    className={`block w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 ${currentAccent.ring} transition-all duration-300`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Subject / Topic *</label>
                <select
                  value={contactForm.subject}
                  onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                  className={`block w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 cursor-pointer focus:outline-none focus:ring-2 ${currentAccent.ring} transition-all duration-300`}
                >
                  <option value="General Inquiry">📂 General Inquiry</option>
                  <option value="System Support">⚙️ Technical Support</option>
                  <option value="Report Abuse">⚠️ Report Policy Violation</option>
                  <option value="Partnership Request">🤝 Partnership & Collaboration</option>
                </select>
              </div>

              {/* Dynamic Form Field Rendering */}
              {contactForm.subject === 'System Support' && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">System/Device Configuration *</label>
                  <input
                    type="text"
                    required
                    value={contactForm.extraField}
                    onChange={(e) => setContactForm({ ...contactForm, extraField: e.target.value })}
                    placeholder="e.g. Chrome browser on Windows 11, iOS Safari"
                    className={`block w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 ${currentAccent.ring} transition-all duration-300`}
                  />
                </div>
              )}

              {contactForm.subject === 'Report Abuse' && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Violating Item ID / Title *</label>
                  <input
                    type="text"
                    required
                    value={contactForm.extraField}
                    onChange={(e) => setContactForm({ ...contactForm, extraField: e.target.value })}
                    placeholder="e.g. Broken transformer report, ID: 64fa829..."
                    className={`block w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 ${currentAccent.ring} transition-all duration-300`}
                  />
                </div>
              )}

              {contactForm.subject === 'Partnership Request' && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Organization / Municipality Name *</label>
                  <input
                    type="text"
                    required
                    value={contactForm.extraField}
                    onChange={(e) => setContactForm({ ...contactForm, extraField: e.target.value })}
                    placeholder="e.g. Sector 4 Citizen Council, Municipal Works Corp"
                    className={`block w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 ${currentAccent.ring} transition-all duration-300`}
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Your Message *</label>
                <textarea
                  rows="4"
                  required
                  value={contactForm.message}
                  onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  placeholder={
                    contactForm.subject === 'General Inquiry' ? "How can we help your neighborhood today? Write details..." :
                    contactForm.subject === 'System Support' ? "Please explain what malfunctioned, what page you were on, and exact steps to reproduce the error..." :
                    contactForm.subject === 'Report Abuse' ? "Please explain in detail why this community item or comment violates guidelines and safety regulations..." :
                    "How would you like to partner or collaborate with CivicConnect? Detail your proposal..."
                  }
                  className={`block w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 ${currentAccent.ring} resize-none text-slate-700 transition-all duration-300`}
                />
              </div>

              <div className="pt-2 flex justify-end gap-3 text-sm font-bold">
                <button
                  type="button"
                  onClick={() => setIsContactOpen(false)}
                  className="px-4 py-2.5 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`relative bg-gradient-to-r ${currentAccent.gradient} ${currentAccent.hoverGradient} text-white px-5 py-2.5 rounded-xl shadow-md transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:pointer-events-none flex items-center justify-center gap-1.5 cursor-pointer`}
                >
                  {isSubmitting ? (
                    <>
                      <span className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      <span>Sending...</span>
                    </>
                  ) : (
                    <span>Submit Inquiry</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </nav>
  );
};

export default Navbar;
