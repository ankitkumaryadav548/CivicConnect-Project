import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axios';
import { useAuth } from '../hooks/useAuth';
import { CitizenBadge, ImpactScoreBadge } from '../components/Badges';
import { Trophy, Award, Star, Flame, CheckCircle, ThumbsUp, MessageSquare, Search, ShieldCheck, Zap, User, ArrowUpRight, TrendingUp } from 'lucide-react';

const Leaderboard = () => {
  const { user } = useAuth();
  const [citizens, setCitizens] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [myImpact, setMyImpact] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('citizens'); // 'citizens' or 'departments'

  useEffect(() => {
    fetchLeaderboardData();
  }, [user]);

  const fetchLeaderboardData = async () => {
    setLoading(true);
    try {
      const [citizensRes, deptsRes] = await Promise.all([
        axiosInstance.get('/leaderboard/citizens'),
        axiosInstance.get('/leaderboard/departments'),
      ]);

      setCitizens(citizensRes.data.data);
      setDepartments(deptsRes.data.data);

      if (user) {
        try {
          const impactRes = await axiosInstance.get('/leaderboard/my-impact');
          setMyImpact(impactRes.data.data);
        } catch (e) {
          console.error('Error fetching my impact:', e);
        }
      }
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCitizens = citizens.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  const top3 = citizens.slice(0, 3);
  const restCitizens = filteredCitizens;

  const getInitials = (name) => {
    return name ? name.charAt(0).toUpperCase() : 'C';
  };

  return (
    <div className="pb-16 transition-colors duration-300">
      {/* Hero Header */}
      <div className="relative bg-gradient-to-br from-slate-900 via-amber-950 to-slate-950 text-white py-14 px-4 overflow-hidden border-b border-amber-900/20">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-35"></div>
        <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full bg-amber-500/10 blur-3xl"></div>
        <div className="absolute bottom-10 right-1/4 w-96 h-96 rounded-full bg-orange-600/10 blur-3xl"></div>

        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-amber-500/20 border border-amber-500/40 text-amber-300 shadow-sm">
            <Trophy size={14} className="text-amber-400" />
            Civic Community Leaderboard & Gamification
          </span>

          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Honoring Civic Champions,<br />
            <span className="bg-gradient-to-r from-amber-300 via-yellow-200 to-orange-400 bg-clip-text text-transparent">
              Transforming Municipal Neighborhoods.
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-slate-300 text-sm md:text-base leading-relaxed">
            Citizens earn Impact Points for submitting verified infrastructure issues, receiving community upvotes, and participating in resolution feedback loops.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20 space-y-8">
        {/* Personal Impact Banner (If logged in) */}
        {myImpact && (
          <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-6 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 transition-all duration-300">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white font-extrabold text-2xl flex items-center justify-center shadow-lg shadow-amber-500/20">
                  {getInitials(user?.name)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-extrabold text-slate-800 dark:text-slate-100">{user?.name}</h3>
                    <CitizenBadge points={myImpact.impactScore} />
                  </div>
                  <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold mt-0.5">
                    Global Rank: <span className="text-indigo-600 dark:text-indigo-400 font-extrabold">#{myImpact.rank}</span> across {citizens.length} citizens
                  </p>
                </div>
              </div>

              {/* Stat Counters Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full lg:w-auto">
                <div className="bg-slate-50 dark:bg-slate-800/80 p-3 rounded-2xl border border-slate-100 dark:border-slate-700/60 text-center">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Impact Points</span>
                  <span className="text-lg font-extrabold text-amber-500 dark:text-amber-400">⭐ {myImpact.impactScore}</span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/80 p-3 rounded-2xl border border-slate-100 dark:border-slate-700/60 text-center">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Reports</span>
                  <span className="text-lg font-extrabold text-slate-800 dark:text-slate-100">📢 {myImpact.totalIssues}</span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/80 p-3 rounded-2xl border border-slate-100 dark:border-slate-700/60 text-center">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Upvotes</span>
                  <span className="text-lg font-extrabold text-indigo-600 dark:text-indigo-400">👍 {myImpact.totalUpvotes}</span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/80 p-3 rounded-2xl border border-slate-100 dark:border-slate-700/60 text-center">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Solved</span>
                  <span className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">✅ {myImpact.resolvedIssues}</span>
                </div>
              </div>
            </div>

            {/* Next Milestone Progress Bar */}
            <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80">
              <div className="flex justify-between items-center text-xs font-bold mb-1.5">
                <span className="text-slate-600 dark:text-slate-300">
                  Progress to Next Milestone ({myImpact.impactScore} / {myImpact.nextMilestone} pts)
                </span>
                <span className="text-amber-600 dark:text-amber-400">{myImpact.progressPercentage}%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden p-0.5">
                <div
                  className="bg-gradient-to-r from-amber-500 to-orange-500 h-full rounded-full transition-all duration-500 shadow-sm"
                  style={{ width: `${myImpact.progressPercentage}%` }}
                ></div>
              </div>
            </div>

            {/* Badges Carousel / Grid */}
            <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80">
              <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block mb-3">Your Achievements & Badges</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {myImpact.badges.map((b) => (
                  <div
                    key={b.id}
                    className={`p-3 rounded-2xl border transition-all ${
                      b.unlocked
                        ? 'bg-amber-50/50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/40 text-amber-900 dark:text-amber-200 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-400 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl">{b.icon}</span>
                      <span className="text-xs font-extrabold">{b.title}</span>
                    </div>
                    <p className="text-[11px] leading-tight text-slate-500 dark:text-slate-400">{b.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab Controls (Citizen Leaderboard vs Municipal Department Performance) */}
        <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('citizens')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                activeTab === 'citizens'
                  ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
              }`}
            >
              <Trophy size={15} />
              <span>Top Citizen Champions ({citizens.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('departments')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                activeTab === 'departments'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
              }`}
            >
              <ShieldCheck size={15} />
              <span>Department Responsiveness</span>
            </button>
          </div>

          {activeTab === 'citizens' && (
            <div className="relative max-w-xs hidden sm:block">
              <Search size={15} className="absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search citizen..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          )}
        </div>

        {/* Tab 1: Citizen Champions Leaderboard */}
        {activeTab === 'citizens' && (
          <div className="space-y-8">
            {/* Top 3 Podium Cards */}
            {top3.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                {/* 2nd Place Silver Podium */}
                {top3[1] && (
                  <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border-2 border-slate-200 dark:border-slate-700 shadow-lg relative flex flex-col items-center text-center order-2 md:order-1 transform hover:-translate-y-1 transition-all">
                    <div className="absolute -top-4 px-3 py-1 rounded-full bg-slate-200 text-slate-800 font-black text-xs shadow-sm flex items-center gap-1">
                      🥈 2ND PLACE
                    </div>
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-300 to-slate-500 text-white font-black text-3xl flex items-center justify-center shadow-md my-4">
                      {getInitials(top3[1].name)}
                    </div>
                    <h4 className="text-base font-extrabold text-slate-800 dark:text-slate-100">{top3[1].name}</h4>
                    <div className="mt-1">
                      <CitizenBadge points={top3[1].impactScore} />
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80 w-full flex justify-around text-xs font-bold text-slate-600 dark:text-slate-400">
                      <div>
                        <span className="block text-[10px] text-slate-400 uppercase">Impact</span>
                        <span className="text-amber-500 font-extrabold">⭐ {top3[1].impactScore}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-slate-400 uppercase">Reports</span>
                        <span className="font-extrabold">{top3[1].totalIssues}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 1st Place Gold Podium */}
                {top3[0] && (
                  <div className="bg-gradient-to-b from-amber-50/80 via-white to-white dark:from-amber-950/40 dark:via-slate-900 dark:to-slate-900 rounded-3xl p-6 border-2 border-amber-400 dark:border-amber-500 shadow-2xl relative flex flex-col items-center text-center order-1 md:order-2 transform md:-translate-y-4 hover:-translate-y-5 transition-all">
                    <div className="absolute -top-5 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 text-white font-black text-xs shadow-md flex items-center gap-1">
                      👑 1ST CHAMPION
                    </div>
                    <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-500 text-white font-black text-4xl flex items-center justify-center shadow-xl shadow-amber-500/30 my-4">
                      {getInitials(top3[0].name)}
                    </div>
                    <h4 className="text-lg font-extrabold text-slate-900 dark:text-slate-100">{top3[0].name}</h4>
                    <div className="mt-1">
                      <CitizenBadge points={top3[0].impactScore} />
                    </div>
                    <div className="mt-4 pt-4 border-t border-amber-200/60 dark:border-slate-800 w-full flex justify-around text-xs font-bold text-slate-600 dark:text-slate-400">
                      <div>
                        <span className="block text-[10px] text-amber-600 dark:text-amber-400 uppercase font-extrabold">Total Impact</span>
                        <span className="text-amber-500 font-extrabold text-sm">⭐ {top3[0].impactScore}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-slate-400 uppercase">Reports</span>
                        <span className="font-extrabold text-sm">{top3[0].totalIssues}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3rd Place Bronze Podium */}
                {top3[2] && (
                  <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border-2 border-amber-200 dark:border-amber-900/60 shadow-lg relative flex flex-col items-center text-center order-3 transform hover:-translate-y-1 transition-all">
                    <div className="absolute -top-4 px-3 py-1 rounded-full bg-amber-700 text-white font-black text-xs shadow-sm flex items-center gap-1">
                      🥉 3RD PLACE
                    </div>
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-700 to-amber-900 text-white font-black text-3xl flex items-center justify-center shadow-md my-4">
                      {getInitials(top3[2].name)}
                    </div>
                    <h4 className="text-base font-extrabold text-slate-800 dark:text-slate-100">{top3[2].name}</h4>
                    <div className="mt-1">
                      <CitizenBadge points={top3[2].impactScore} />
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80 w-full flex justify-around text-xs font-bold text-slate-600 dark:text-slate-400">
                      <div>
                        <span className="block text-[10px] text-slate-400 uppercase">Impact</span>
                        <span className="text-amber-500 font-extrabold">⭐ {top3[2].impactScore}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-slate-400 uppercase">Reports</span>
                        <span className="font-extrabold">{top3[2].totalIssues}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Complete Citizen Rankings Table */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800/80 overflow-hidden">
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-100">All Citizen Contributors</h3>
                <span className="text-xs text-slate-400 font-semibold">{restCitizens.length} Active Citizens</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-semibold">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-400 dark:text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-100 dark:border-slate-800">
                    <tr>
                      <th className="py-3.5 px-6">Rank</th>
                      <th className="py-3.5 px-6">Citizen</th>
                      <th className="py-3.5 px-6">Achievement Badge</th>
                      <th className="py-3.5 px-6 text-center">Reports Filed</th>
                      <th className="py-3.5 px-6 text-center">Issues Solved</th>
                      <th className="py-3.5 px-6 text-center">Upvotes</th>
                      <th className="py-3.5 px-6 text-right">Impact Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {restCitizens.map((c) => (
                      <tr key={c._id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="py-4 px-6 font-extrabold">
                          {c.rank === 1 ? '🥇 #1' : c.rank === 2 ? '🥈 #2' : c.rank === 3 ? '🥉 #3' : `#${c.rank}`}
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 font-extrabold text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs">
                              {getInitials(c.name)}
                            </div>
                            <div>
                              <span className="font-bold text-slate-800 dark:text-slate-100 block">{c.name}</span>
                              <span className="text-[10px] text-slate-400 font-mono">{c.email}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <CitizenBadge points={c.impactScore} />
                        </td>
                        <td className="py-4 px-6 text-center font-bold text-slate-700 dark:text-slate-300">
                          {c.totalIssues}
                        </td>
                        <td className="py-4 px-6 text-center font-bold text-emerald-600 dark:text-emerald-400">
                          {c.resolvedIssues}
                        </td>
                        <td className="py-4 px-6 text-center font-bold text-indigo-600 dark:text-indigo-400">
                          {c.totalUpvotes}
                        </td>
                        <td className="py-4 px-6 text-right font-black text-amber-500 dark:text-amber-400 text-sm">
                          ⭐ {c.impactScore}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Department Responsiveness */}
        {activeTab === 'departments' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {departments.map((dept) => (
              <div
                key={dept.key}
                className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800/80 shadow-md hover:shadow-xl transition-all"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-100">{dept.name}</h3>
                    <span className="text-xs text-slate-400 font-semibold">{dept.totalTickets} Total Tickets Assigned</span>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-black border ${
                    dept.resolutionRate >= 70 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                    dept.resolutionRate >= 40 ? 'bg-amber-50 text-amber-700 border-amber-200' :
                    'bg-slate-100 text-slate-600 border-slate-200'
                  }`}>
                    {dept.resolutionRate}% Resolved
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden mb-5">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      dept.resolutionRate >= 70 ? 'bg-emerald-500' : dept.resolutionRate >= 40 ? 'bg-amber-500' : 'bg-slate-400'
                    }`}
                    style={{ width: `${dept.resolutionRate}%` }}
                  ></div>
                </div>

                <div className="grid grid-cols-4 gap-2 text-center text-xs font-bold">
                  <div className="p-2 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                    <span className="block text-[10px] text-slate-400 uppercase">Resolved</span>
                    <span className="text-emerald-600 font-extrabold">{dept.resolvedTickets}</span>
                  </div>
                  <div className="p-2 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                    <span className="block text-[10px] text-slate-400 uppercase">Progress</span>
                    <span className="text-amber-500 font-extrabold">{dept.inProgressTickets}</span>
                  </div>
                  <div className="p-2 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                    <span className="block text-[10px] text-slate-400 uppercase">Open</span>
                    <span className="text-blue-500 font-extrabold">{dept.openTickets}</span>
                  </div>
                  <div className="p-2 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                    <span className="block text-[10px] text-slate-400 uppercase">SLA Breach</span>
                    <span className="text-rose-500 font-extrabold">{dept.slaBreachedTickets}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
