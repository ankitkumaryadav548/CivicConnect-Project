import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { MapPin, Phone, Mail, Clock, ShieldCheck, Heart, ExternalLink, MessageSquare, ArrowUpRight } from 'lucide-react';

const Footer = () => {
  const { user } = useAuth();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-b from-slate-900 via-slate-950 to-black text-slate-300 pt-16 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Grid Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800/80">
          
          {/* Brand Info (Cols 1 & 2) */}
          <div className="lg:col-span-2 space-y-5">
            <Link to="/" className="inline-flex items-center group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 mr-3 transition-transform duration-300 group-hover:scale-105">
                <span className="text-white font-extrabold text-xl">C</span>
              </div>
              <span className="text-2xl font-extrabold text-white tracking-tight">
                Civic<span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">Connect</span>
              </span>
            </Link>

            <p className="text-slate-400 text-sm leading-relaxed max-w-sm font-normal">
              Empowering citizens to report, track, and resolve municipal infrastructure issues. Working together for safer, cleaner, and better-connected communities.
            </p>

            {/* System Status Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/60 border border-slate-700/60 text-xs text-slate-300 font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>All Municipal Services Operational</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-xs font-extrabold text-white uppercase tracking-widest border-b border-slate-800 pb-2">
              Platform Navigation
            </h4>
            <ul className="space-y-2.5 text-xs font-semibold">
              <li>
                <Link to="/" className="text-slate-400 hover:text-indigo-400 transition-colors flex items-center gap-1.5">
                  <span>Home Hub</span>
                </Link>
              </li>
              {user ? (
                <>
                  {user.role !== 'admin' && (
                    <>
                      <li>
                        <Link to="/report" className="text-slate-400 hover:text-indigo-400 transition-colors flex items-center gap-1.5">
                          <span>Report Civic Issue</span>
                        </Link>
                      </li>
                      <li>
                        <Link to="/my-issues" className="text-slate-400 hover:text-indigo-400 transition-colors flex items-center gap-1.5">
                          <span>My Filed Complaints</span>
                        </Link>
                      </li>
                    </>
                  )}
                  {user.role === 'admin' && (
                    <>
                      <li>
                        <Link to="/admin" className="text-slate-400 hover:text-indigo-400 transition-colors flex items-center gap-1.5">
                          <span>Admin Control Center</span>
                        </Link>
                      </li>
                      <li>
                        <Link to="/analytics" className="text-slate-400 hover:text-indigo-400 transition-colors flex items-center gap-1.5">
                          <span>Civic Analytics</span>
                        </Link>
                      </li>
                    </>
                  )}
                </>
              ) : (
                <>
                  <li>
                    <Link to="/login" className="text-slate-400 hover:text-indigo-400 transition-colors flex items-center gap-1.5">
                      <span>Citizen Login</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/register" className="text-slate-400 hover:text-indigo-400 transition-colors flex items-center gap-1.5">
                      <span>Register Account</span>
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Infrastructure Categories */}
          <div className="space-y-4">
            <h4 className="text-xs font-extrabold text-white uppercase tracking-widest border-b border-slate-800 pb-2">
              Issue Sectors
            </h4>
            <ul className="space-y-2.5 text-xs font-semibold text-slate-400">
              <li className="flex items-center gap-2">
                <span>🛣️</span> Roads & Potholes
              </li>
              <li className="flex items-center gap-2">
                <span>💧</span> Water Supply & Leaks
              </li>
              <li className="flex items-center gap-2">
                <span>⚡</span> Electricity & Power
              </li>
              <li className="flex items-center gap-2">
                <span>🧹</span> Sanitation & Waste
              </li>
              <li className="flex items-center gap-2">
                <span>🌳</span> Parks & Environment
              </li>
            </ul>
          </div>

          {/* Municipal Contact Details */}
          <div className="space-y-4">
            <h4 className="text-xs font-extrabold text-white uppercase tracking-widest border-b border-slate-800 pb-2">
              Municipal Helpdesk
            </h4>
            <ul className="space-y-3 text-xs font-medium text-slate-400">
              <li className="flex items-start gap-2.5">
                <MapPin size={16} className="text-indigo-400 flex-shrink-0 mt-0.5" />
                <span>Municipal Civic Center, Sector 4, Civic Plaza</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone size={16} className="text-indigo-400 flex-shrink-0" />
                <a href="tel:18002484200" className="hover:text-white transition-colors">
                  Toll-Free: 1800-248-4200
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail size={16} className="text-indigo-400 flex-shrink-0" />
                <a href="mailto:support@civicconnect.gov.in" className="hover:text-white transition-colors">
                  support@civicconnect.gov.in
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Clock size={16} className="text-indigo-400 flex-shrink-0" />
                <span>Mon – Sat: 8:00 AM – 8:00 PM</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Legal & Copyright Bar */}
        <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-medium text-slate-500">
          <div>
            <p>&copy; {currentYear} CivicConnect Portal. All rights reserved.</p>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <a href="#privacy" className="hover:text-slate-300 transition-colors">Privacy Policy</a>
            <a href="#terms" className="hover:text-slate-300 transition-colors">Terms of Service</a>
            <a href="#accessibility" className="hover:text-slate-300 transition-colors">Accessibility</a>
            <a href="#charter" className="hover:text-slate-300 transition-colors">Citizen Charter</a>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
