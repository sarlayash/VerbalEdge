import React, { useState, useMemo } from 'react';
import {
  Learner,
  DayAssignment,
  DayChallenge,
  Badge,
  Certificate,
  ChatMessage,
  AppNotification,
} from '../types';
import {
  Users,
  Award,
  Sparkles,
  BookOpen,
  MessageSquare,
  BarChart3,
  Search,
  Download,
  Trash2,
  RotateCcw,
  Edit2,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Bell,
  Lock,
  LogOut,
  Plus,
  ArrowUpRight,
  Filter,
  Eye,
  FileSpreadsheet,
  AlertTriangle,
  Send,
  Calendar,
  Layers,
} from 'lucide-react';
import { exportCsv } from '../utils/export';
import { ChatPanel } from './ChatPanel';
import { CertificateView } from './CertificateView';
import { BadgeCard } from './BadgeCard';
import { sounds } from '../utils/audio';

interface AdminPortalProps {
  learners: Learner[];
  assignments: DayAssignment[];
  challenges: DayChallenge[];
  messages: ChatMessage[];
  notifications: AppNotification[];
  onLogin: (id: string, pass: string) => boolean;
  onLogout: () => void;
  isAdminLoggedIn: boolean;
  onEditLearnerName: (learnerId: string, newName: string) => void;
  onResetLearnerJourney: (learnerId: string) => void;
  onDeleteLearner: (learnerId: string) => void;
  onCompleteDayManually: (learnerId: string, day: number, score: number) => void;
  onReissueBadge: (learnerId: string, day: number) => void;
  onReissueCertificate: (learnerId: string, certId: string, newDate?: string) => void;
  onInvalidateCredential: (credentialId: string) => void;
  onUpdateAssignment: (assignment: DayAssignment) => void;
  onUpdateChallenge: (challenge: DayChallenge) => void;
  onSendMessage: (learnerId: string, sender: 'learner' | 'admin', text: string) => void;
  onMarkMessagesRead: (learnerId: string, reader: 'learner' | 'admin') => void;
  onSendBroadcast: (title: string, message: string, type?: any) => void;
  onOpenVerify: (credentialId: string) => void;
  onCloseAdmin: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  learners,
  assignments,
  challenges,
  messages,
  notifications,
  onLogin,
  onLogout,
  isAdminLoggedIn,
  onEditLearnerName,
  onResetLearnerJourney,
  onDeleteLearner,
  onCompleteDayManually,
  onReissueBadge,
  onReissueCertificate,
  onInvalidateCredential,
  onUpdateAssignment,
  onUpdateChallenge,
  onSendMessage,
  onMarkMessagesRead,
  onSendBroadcast,
  onOpenVerify,
  onCloseAdmin,
}) => {
  // Login credentials state
  const [adminId, setAdminId] = useState('');
  const [adminPass, setAdminPass] = useState('');
  const [loginError, setLoginError] = useState('');

  // Active Admin Tab
  const [activeTab, setActiveTab] = useState<
    | 'dashboard'
    | 'learners'
    | 'assignments'
    | 'challenges'
    | 'reports'
    | 'credentials'
    | 'messaging'
    | 'broadcasts'
  >('dashboard');

  // Search & Filter
  const [globalSearch, setGlobalSearch] = useState('');
  const [learnerFilter, setLearnerFilter] = useState<'all' | 'day1' | 'day2' | 'day3' | 'certified'>('all');

  // Selected learner for chat / editing
  const [selectedChatLearnerId, setSelectedChatLearnerId] = useState<string>(learners[0]?.id || '');
  const [previewCert, setPreviewCert] = useState<Certificate | null>(null);
  const [previewBadge, setPreviewBadge] = useState<Badge | null>(null);

  // Broadcast modal/form state
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [broadcastType, setBroadcastType] = useState<'announcement' | 'urgent' | 'reminder'>('announcement');

  // Assignment edit state
  const [editingAssignment, setEditingAssignment] = useState<DayAssignment | null>(null);

  // Login handler
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const ok = onLogin(adminId, adminPass);
    if (!ok) {
      setLoginError('Invalid Admin ID or Password. (Hint: kapiladmin / admin123)');
      sounds.playPop();
    } else {
      setLoginError('');
      sounds.playSuccess();
    }
  };

  // Metrics calculation
  const totalLearners = learners.length;
  const activeToday = learners.filter((l) => l.streak >= 1).length;
  const completedDay1 = learners.filter((l) => l.completedDays.includes(1)).length;
  const completedDay2 = learners.filter((l) => l.completedDays.includes(2)).length;
  const completedDay3 = learners.filter((l) => l.completedDays.includes(3)).length;
  const totalBadges = learners.reduce((acc, l) => acc + l.badges.length, 0);
  const totalCerts = learners.reduce((acc, l) => acc + l.certificates.length, 0);
  const avgCompletion = totalLearners > 0
    ? Math.round(learners.reduce((acc, l) => acc + l.progressPercentage, 0) / totalLearners)
    : 0;
  const totalUnreadMessages = messages.filter((m) => m.sender === 'learner' && !m.read).length;

  // Filtered learners
  const filteredLearners = useMemo(() => {
    return learners.filter((l) => {
      const matchSearch =
        l.name.toLowerCase().includes(globalSearch.toLowerCase()) ||
        l.id.toLowerCase().includes(globalSearch.toLowerCase());
      if (!matchSearch) return false;

      if (learnerFilter === 'day1') return l.completedDays.includes(1) && !l.completedDays.includes(2);
      if (learnerFilter === 'day2') return l.completedDays.includes(2) && !l.completedDays.includes(3);
      if (learnerFilter === 'day3' || learnerFilter === 'certified') return l.completedDays.includes(3);
      return true;
    });
  }, [learners, globalSearch, learnerFilter]);

  // CSV Exporter functions
  const handleExportOverallCsv = () => {
    const rows = learners.map((l) => ({
      'Learner ID': l.id,
      Name: l.name,
      'Joined Date': l.joinedAt,
      'Completed Days': l.completedDays.join('; ') || 'None',
      'Progress %': `${l.progressPercentage}%`,
      XP: l.xp,
      Streak: l.streak,
      'Badges Earned': l.badges.length,
      'Certificates Earned': l.certificates.length,
      'Grand Certified': l.completedDays.includes(3) ? 'YES' : 'NO',
    }));
    exportCsv('VerbalEdge_Overall_Placement_Report', rows);
    sounds.playSuccess();
  };

  const handleExportDayCsv = (day: number) => {
    const rows = learners.map((l) => {
      const st = l.dayStatus[day];
      return {
        'Learner ID': l.id,
        Name: l.name,
        Day: `Day ${day}`,
        'Challenge Completed': st?.challengeCompleted ? 'YES' : 'NO',
        Score: st?.score ? `${st.score}%` : 'N/A',
        'Time Spent (Sec)': st?.timeSpentSec || 0,
        'Badge Issued': st?.badgeIssued ? 'YES' : 'NO',
        'Badge ID': st?.badgeId || '',
        'Certificate Issued': st?.certificateIssued ? 'YES' : 'NO',
        'Certificate ID': st?.certificateId || '',
        Timestamp: st?.completedAt || 'Pending',
      };
    });
    exportCsv(`VerbalEdge_Day${day}_Report`, rows);
    sounds.playSuccess();
  };

  // Login Gate
  if (!isAdminLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-100">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center mb-3 shadow-lg shadow-indigo-600/30">
              <Lock className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              VerbalEdge Admin Portal
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Kapil Narula • Confidential Lead Trainer Gateway
            </p>
          </div>

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Admin ID
              </label>
              <input
                type="text"
                value={adminId}
                onChange={(e) => setAdminId(e.target.value)}
                placeholder="kapiladmin"
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Password
              </label>
              <input
                type="password"
                value={adminPass}
                onChange={(e) => setAdminPass(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
              />
            </div>

            {loginError && (
              <p className="text-xs font-semibold text-rose-400 text-center">{loginError}</p>
            )}

            <button
              type="submit"
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-lg transition"
            >
              Sign In to Command Center
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-800 text-center">
            <button
              onClick={onCloseAdmin}
              className="text-xs text-slate-400 hover:text-white transition"
            >
              Return to Workshop Homepage
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated Admin Portal (Dark Theme as mandated in PRD Page 12)
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Admin Header */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 sticky top-0 z-30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center font-black text-white shadow-md">
            VE
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base text-white">VerbalEdge Admin</span>
              <span className="bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full">
                Trainer Portal
              </span>
            </div>
            <div className="text-xs text-slate-400">Kapil Narula (Root Administrator)</div>
          </div>
        </div>

        {/* Global Search Bar (PRD Page 18) */}
        <div className="hidden md:flex items-center gap-2 bg-slate-800/80 px-4 py-2 rounded-xl border border-slate-700 max-w-md w-full">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            placeholder="Search learners, credentials, questions, messages..."
            className="bg-transparent text-xs text-white placeholder:text-slate-400 focus:outline-none w-full"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setActiveTab('broadcasts');
              sounds.playPop();
            }}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white flex items-center gap-1.5 transition"
          >
            <Bell className="w-4 h-4" />
            <span className="hidden sm:inline">Broadcast</span>
          </button>

          <button
            onClick={onLogout}
            className="p-2 text-slate-400 hover:text-rose-400 rounded-xl hover:bg-slate-800 transition"
            title="Admin Sign Out"
          >
            <LogOut className="w-5 h-5" />
          </button>

          <button
            onClick={onCloseAdmin}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-medium"
          >
            Exit to App
          </button>
        </div>
      </header>

      {/* Admin Navigation Tabs */}
      <div className="bg-slate-900/60 border-b border-slate-800/80 px-6 flex items-center gap-1 sm:gap-4 overflow-x-auto text-xs font-bold">
        {[
          { id: 'dashboard', label: 'Overview Dashboard', icon: BarChart3 },
          { id: 'learners', label: `Learners (${learners.length})`, icon: Users },
          { id: 'assignments', label: 'Assignments', icon: BookOpen },
          { id: 'challenges', label: 'Challenges', icon: Layers },
          { id: 'credentials', label: `Badges & Certs (${totalBadges + totalCerts})`, icon: Award },
          { id: 'messaging', label: `Private Chat ${totalUnreadMessages > 0 ? `(${totalUnreadMessages})` : ''}`, icon: MessageSquare },
          { id: 'reports', label: 'CSV Reports', icon: FileSpreadsheet },
          { id: 'broadcasts', label: 'Broadcasts', icon: Bell },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                sounds.playPop();
              }}
              className={`py-3 px-2 border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Main Admin View Container */}
      <main className="p-6 max-w-7xl mx-auto w-full flex-1">
        {/* TAB 1: OVERVIEW DASHBOARD (PRD Page 12 & 15) */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Real-time Statistics Cards (PRD Page 12 & 13) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase mb-1">
                  <span>Total Learners</span>
                  <Users className="w-4 h-4 text-indigo-400" />
                </div>
                <div className="text-3xl font-black text-white">{totalLearners}</div>
                <div className="text-[11px] text-emerald-400 mt-1 font-medium">100% Mobile Ready</div>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase mb-1">
                  <span>Active Cohort</span>
                  <Sparkles className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-3xl font-black text-amber-400">{activeToday}</div>
                <div className="text-[11px] text-slate-400 mt-1">Daily Streak Active</div>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase mb-1">
                  <span>Day 1 Completed</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-3xl font-black text-white">{completedDay1}</div>
                <div className="text-[11px] text-slate-400 mt-1">Verbal Foundations</div>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase mb-1">
                  <span>Day 2 Completed</span>
                  <CheckCircle2 className="w-4 h-4 text-teal-400" />
                </div>
                <div className="text-3xl font-black text-white">{completedDay2}</div>
                <div className="text-[11px] text-slate-400 mt-1">Corporate Comms</div>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase mb-1">
                  <span>Fully Certified</span>
                  <Award className="w-4 h-4 text-yellow-400" />
                </div>
                <div className="text-3xl font-black text-yellow-400">{completedDay3}</div>
                <div className="text-[11px] text-amber-300 mt-1">Gold Master Certs</div>
              </div>
            </div>

            {/* Secondary KPI Bar */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-400 font-bold uppercase">Badges Issued</div>
                  <div className="text-2xl font-black text-white mt-0.5">{totalBadges}</div>
                </div>
                <Award className="w-8 h-8 text-indigo-400 opacity-60" />
              </div>

              <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-400 font-bold uppercase">Certificates Issued</div>
                  <div className="text-2xl font-black text-white mt-0.5">{totalCerts}</div>
                </div>
                <Sparkles className="w-8 h-8 text-amber-400 opacity-60" />
              </div>

              <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-400 font-bold uppercase">Average Completion</div>
                  <div className="text-2xl font-black text-white mt-0.5">{avgCompletion}%</div>
                </div>
                <BarChart3 className="w-8 h-8 text-emerald-400 opacity-60" />
              </div>

              <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-400 font-bold uppercase">Pending Queries</div>
                  <div className="text-2xl font-black text-white mt-0.5">{totalUnreadMessages}</div>
                </div>
                <MessageSquare className="w-8 h-8 text-rose-400 opacity-60" />
              </div>
            </div>

            {/* Placement Readiness Cohort Heatmap & Quick Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-white tracking-tight">
                    Recent Cohort Enrollments & Journey Status
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Real-time synchronization across learner submissions and trainer certifications.
                  </p>
                </div>
                <button
                  onClick={handleExportOverallCsv}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white flex items-center gap-1.5 transition"
                >
                  <Download className="w-3.5 h-3.5 text-indigo-400" />
                  Export All CSV
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-800/60 uppercase font-bold text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="p-3">Learner</th>
                      <th className="p-3">Learner ID</th>
                      <th className="p-3">Day 1</th>
                      <th className="p-3">Day 2</th>
                      <th className="p-3">Day 3</th>
                      <th className="p-3">Progress</th>
                      <th className="p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {learners.slice(0, 6).map((l) => (
                      <tr key={l.id} className="hover:bg-slate-800/40">
                        <td className="p-3 font-bold text-white">{l.name}</td>
                        <td className="p-3 font-mono text-indigo-400">{l.id}</td>
                        <td className="p-3">
                          {l.completedDays.includes(1) ? (
                            <span className="text-emerald-400 font-bold">Passed</span>
                          ) : (
                            <span className="text-slate-500">Pending</span>
                          )}
                        </td>
                        <td className="p-3">
                          {l.completedDays.includes(2) ? (
                            <span className="text-emerald-400 font-bold">Passed</span>
                          ) : (
                            <span className="text-slate-500">Pending</span>
                          )}
                        </td>
                        <td className="p-3">
                          {l.completedDays.includes(3) ? (
                            <span className="text-yellow-400 font-bold">Gold Certified</span>
                          ) : (
                            <span className="text-slate-500">Pending</span>
                          )}
                        </td>
                        <td className="p-3">
                          <div className="w-24 bg-slate-800 h-2 rounded-full overflow-hidden">
                            <div
                              className="bg-indigo-500 h-full rounded-full"
                              style={{ width: `${l.progressPercentage}%` }}
                            />
                          </div>
                        </td>
                        <td className="p-3">
                          <button
                            onClick={() => {
                              setSelectedChatLearnerId(l.id);
                              setActiveTab('messaging');
                            }}
                            className="text-indigo-400 hover:text-indigo-300 font-semibold"
                          >
                            Chat / Review
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: LEARNER MANAGEMENT (PRD Page 13) */}
        {activeTab === 'learners' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white">Learner Roster & Management</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Search, edit names, manually mark days complete, reset journeys, and export reports.
                </p>
              </div>

              {/* Filter pills */}
              <div className="flex items-center gap-2 text-xs">
                {(['all', 'day1', 'day2', 'certified'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setLearnerFilter(f)}
                    className={`px-3 py-1.5 rounded-xl font-bold transition uppercase ${
                      learnerFilter === f
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Learner Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-800/80 uppercase font-bold text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="p-4">Name & ID</th>
                      <th className="p-4">Joined</th>
                      <th className="p-4">Progress</th>
                      <th className="p-4">Badges & Certs</th>
                      <th className="p-4">Manual Certification</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {filteredLearners.map((l) => (
                      <tr key={l.id} className="hover:bg-slate-800/40 transition">
                        <td className="p-4">
                          <div className="font-bold text-white text-sm">{l.name}</div>
                          <div className="font-mono text-indigo-400 text-[11px]">{l.id}</div>
                        </td>
                        <td className="p-4 text-slate-400">{l.joinedAt}</td>
                        <td className="p-4">
                          <div className="font-bold text-white">{l.progressPercentage}%</div>
                          <div className="text-[10px] text-slate-500">
                            {l.completedDays.length}/3 Days Done
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1.5">
                            <span className="bg-indigo-950 text-indigo-400 px-2 py-0.5 rounded-md font-bold">
                              {l.badges.length} Badges
                            </span>
                            <span className="bg-amber-950 text-amber-400 px-2 py-0.5 rounded-md font-bold">
                              {l.certificates.length} Certs
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1">
                            {[1, 2, 3].map((d) => (
                              <button
                                key={d}
                                onClick={() => {
                                  onCompleteDayManually(l.id, d, 90);
                                  sounds.playSuccess();
                                }}
                                title={`Mark Day ${d} Completed`}
                                className={`px-2 py-1 rounded-lg text-[10px] font-bold transition ${
                                  l.completedDays.includes(d)
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-slate-800 hover:bg-indigo-600 text-slate-400 hover:text-white'
                                }`}
                              >
                                D{d} {l.completedDays.includes(d) ? '✓' : '+'}
                              </button>
                            ))}
                          </div>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                const newName = prompt('Enter new name for learner:', l.name);
                                if (newName && newName.trim()) {
                                  onEditLearnerName(l.id, newName.trim());
                                  sounds.playSuccess();
                                }
                              }}
                              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
                              title="Edit Learner Name"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Reset progress for ${l.name}?`)) {
                                  onResetLearnerJourney(l.id);
                                  sounds.playPop();
                                }
                              }}
                              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-lg"
                              title="Reset Journey"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Permanently delete learner ${l.name}?`)) {
                                  onDeleteLearner(l.id);
                                  sounds.playPop();
                                }
                              }}
                              className="p-1.5 bg-slate-800 hover:bg-rose-900 text-rose-400 rounded-lg"
                              title="Delete Learner"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: ASSIGNMENTS MANAGER (PRD Page 13 & 14) */}
        {activeTab === 'assignments' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">Curriculum & Assignment Manager</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Update syllabus notes, video lecture URLs, placement PDF downloads, and release schedules.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {assignments.map((asg) => (
                <div
                  key={asg.id}
                  className="bg-slate-900 border border-slate-800 p-6 rounded-3xl flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs font-bold mb-2">
                      <span className="text-indigo-400 uppercase">Day {asg.day} Module</span>
                      <span className="bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full text-[10px]">
                        Published
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-white">{asg.title}</h3>
                    <p className="text-xs text-slate-400 mt-1">{asg.subtitle}</p>

                    <div className="my-4 p-3 bg-slate-800/60 rounded-xl text-xs text-slate-300">
                      <strong>Takeaways:</strong> {asg.content.keyTakeaways.length} key points listed
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      const newTitle = prompt('Edit Assignment Title:', asg.title);
                      if (newTitle && newTitle.trim()) {
                        onUpdateAssignment({ ...asg, title: newTitle.trim() });
                        sounds.playSuccess();
                      }
                    }}
                    className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition flex items-center justify-center gap-1.5"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-indigo-400" />
                    Quick Edit Content
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: CHALLENGES MANAGER (PRD Page 14) */}
        {activeTab === 'challenges' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white">Placement Challenge Manager</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Manage MCQ banks, typing tests, speech recording crucibles, and passing score thresholds.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {challenges.map((ch) => (
                <div key={ch.id} className="bg-slate-900 border border-slate-800 p-6 rounded-3xl">
                  <div className="flex items-center justify-between text-xs font-bold mb-2">
                    <span className="text-indigo-400 uppercase">Day {ch.day} Assessment</span>
                    <span className="bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full font-mono text-[10px]">
                      {ch.timeLimitMinutes} Mins
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white">{ch.title}</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Passing Threshold: {ch.passingScore}% • {ch.questions.length} questions
                  </p>

                  <div className="my-4 space-y-2 max-h-48 overflow-y-auto">
                    {ch.questions.map((q, idx) => (
                      <div key={q.id} className="p-2.5 bg-slate-800/60 rounded-xl text-xs">
                        <div className="font-bold text-slate-300">
                          Q{idx + 1}: <span className="uppercase text-indigo-400 font-mono text-[10px]">[{q.type}]</span>
                        </div>
                        <p className="text-slate-400 truncate mt-0.5">{q.question}</p>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => {
                      const newScore = prompt('Edit Passing Threshold % (e.g. 75):', String(ch.passingScore));
                      if (newScore && !isNaN(Number(newScore))) {
                        onUpdateChallenge({ ...ch, passingScore: Number(newScore) });
                        sounds.playSuccess();
                      }
                    }}
                    className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition flex items-center justify-center gap-1.5"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-indigo-400" />
                    Edit Passing Threshold
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: BADGES & CERTIFICATES MANAGER (PRD Page 16) */}
        {activeTab === 'credentials' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-bold text-white">Credential Verification & Audit</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Reissue, preview, download, or invalidate any digital badge or gold certificate.
              </p>
            </div>

            {/* Badges list */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
              <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                <Award className="w-4 h-4 text-indigo-400" />
                Issued Digital Badges
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {learners.flatMap((l) => l.badges).map((badge) => (
                  <div key={badge.badgeId} className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700">
                    <div className="flex items-center justify-between text-xs font-bold mb-1">
                      <span className="text-white">{badge.title}</span>
                      <span className={badge.isValid ? 'text-emerald-400' : 'text-rose-400'}>
                        {badge.isValid ? 'Active' : 'Revoked'}
                      </span>
                    </div>
                    <div className="text-xs text-slate-300">Recipient: <strong>{badge.learnerName}</strong></div>
                    <div className="font-mono text-[11px] text-indigo-400 mt-0.5">{badge.badgeId}</div>

                    <div className="flex items-center gap-2 mt-4">
                      <button
                        onClick={() => onOpenVerify(badge.badgeId)}
                        className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs font-semibold"
                      >
                        Verify
                      </button>
                      <button
                        onClick={() => {
                          onInvalidateCredential(badge.badgeId);
                          sounds.playPop();
                        }}
                        className="px-3 py-1.5 bg-rose-950/80 hover:bg-rose-900 text-rose-300 rounded-lg text-xs font-semibold"
                      >
                        {badge.isValid ? 'Invalidate' : 'Reactivate'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Certificates list */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
              <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Issued Verified Certificates
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {learners.flatMap((l) => l.certificates).map((cert) => (
                  <div key={cert.certId} className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700">
                    <div className="flex items-center justify-between text-xs font-bold mb-1">
                      <span className={cert.theme === 'gold' ? 'text-amber-300' : 'text-white'}>
                        {cert.title}
                      </span>
                      <span className={cert.isValid ? 'text-emerald-400' : 'text-rose-400'}>
                        {cert.isValid ? 'Active' : 'Revoked'}
                      </span>
                    </div>
                    <div className="text-xs text-slate-300">Recipient: <strong>{cert.learnerName}</strong></div>
                    <div className="font-mono text-[11px] text-indigo-400 mt-0.5">{cert.certId}</div>

                    <div className="flex items-center gap-2 mt-4">
                      <button
                        onClick={() => setPreviewCert(cert)}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold"
                      >
                        Preview High-Res
                      </button>
                      <button
                        onClick={() => onOpenVerify(cert.certId)}
                        className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs font-semibold"
                      >
                        Verify Portal
                      </button>
                      <button
                        onClick={() => {
                          onInvalidateCredential(cert.certId);
                          sounds.playPop();
                        }}
                        className="px-3 py-1.5 bg-rose-950/80 hover:bg-rose-900 text-rose-300 rounded-lg text-xs font-semibold"
                      >
                        {cert.isValid ? 'Invalidate' : 'Reactivate'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: MESSAGING PANEL (PRD Page 17) */}
        {activeTab === 'messaging' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[600px]">
            {/* Learners Conversation List */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 overflow-y-auto">
              <h3 className="font-bold text-sm text-white mb-3">Learner Direct Messages</h3>
              <div className="space-y-2">
                {learners.map((l) => {
                  const unreadCount = messages.filter(
                    (m) => m.learnerId === l.id && m.sender === 'learner' && !m.read
                  ).length;
                  const isSelected = selectedChatLearnerId === l.id;

                  return (
                    <button
                      key={l.id}
                      onClick={() => {
                        setSelectedChatLearnerId(l.id);
                        sounds.playPop();
                      }}
                      className={`w-full p-3 rounded-2xl text-left transition flex items-center justify-between ${
                        isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-800/70 hover:bg-slate-800 text-slate-300'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="font-bold text-xs truncate">{l.name}</div>
                        <div className="text-[10px] opacity-75 font-mono truncate">{l.id}</div>
                      </div>
                      {unreadCount > 0 && (
                        <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                          {unreadCount}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Chat Thread */}
            <div className="md:col-span-2 h-full">
              {selectedChatLearnerId ? (
                <ChatPanel
                  learnerId={selectedChatLearnerId}
                  learnerName={learners.find((l) => l.id === selectedChatLearnerId)?.name || 'Learner'}
                  messages={messages}
                  currentRole="admin"
                  onSendMessage={onSendMessage}
                  onMarkRead={onMarkMessagesRead}
                />
              ) : (
                <div className="h-full bg-slate-900 rounded-3xl border border-slate-800 flex items-center justify-center text-slate-500 text-xs">
                  Select a learner on the left to review doubts.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 7: CSV REPORTS (PRD Page 15) */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white">Placement Readiness CSV Reports</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Download instantaneous spreadsheets for placement cell records, HR audits, and cohort rankings.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-4">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-white text-base">Day 1 Verbal Report</h3>
                <p className="text-xs text-slate-400 mt-1 mb-6">
                  Grammar test scores, typing speed submissions, and Day 1 Challenger badge status.
                </p>
                <button
                  onClick={() => handleExportDayCsv(1)}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition"
                >
                  <Download className="w-4 h-4" /> Download Day 1 CSV
                </button>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl">
                <div className="w-12 h-12 rounded-2xl bg-teal-500/20 text-teal-400 flex items-center justify-center mb-4">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-white text-base">Day 2 Comms Report</h3>
                <p className="text-xs text-slate-400 mt-1 mb-6">
                  Corporate email articulation marks and Communicator badge audit.
                </p>
                <button
                  onClick={() => handleExportDayCsv(2)}
                  className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition"
                >
                  <Download className="w-4 h-4" /> Download Day 2 CSV
                </button>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-4">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-white text-base">Day 3 Placement Report</h3>
                <p className="text-xs text-slate-400 mt-1 mb-6">
                  STAR method mock interview submissions and Placement Warrior badge logs.
                </p>
                <button
                  onClick={() => handleExportDayCsv(3)}
                  className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition"
                >
                  <Download className="w-4 h-4" /> Download Day 3 CSV
                </button>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-4">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-white text-base">Master Overall Report</h3>
                <p className="text-xs text-slate-400 mt-1 mb-6">
                  Comprehensive audit of all learners, XP points, streaks, certificates, and completion.
                </p>
                <button
                  onClick={handleExportOverallCsv}
                  className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition"
                >
                  <Download className="w-4 h-4" /> Download Overall CSV
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 8: BROADCAST NOTIFICATIONS (PRD Page 17) */}
        {activeTab === 'broadcasts' && (
          <div className="max-w-2xl mx-auto bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8">
            <h2 className="text-xl font-bold text-white mb-2">Send Broadcast Announcement</h2>
            <p className="text-xs text-slate-400 mb-6">
              Push real-time announcements, urgent deadline alerts, or workshop reminders to all enrolled learners.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!broadcastTitle || !broadcastMsg) return;
                onSendBroadcast(broadcastTitle, broadcastMsg, broadcastType);
                setBroadcastTitle('');
                setBroadcastMsg('');
                sounds.playSuccess();
                alert('Broadcast notification sent to all learners!');
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                  Notification Type
                </label>
                <select
                  value={broadcastType}
                  onChange={(e) => setBroadcastType(e.target.value as any)}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="announcement">General Announcement</option>
                  <option value="urgent">Urgent Alert / Action Required</option>
                  <option value="reminder">Live Session Reminder</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={broadcastTitle}
                  onChange={(e) => setBroadcastTitle(e.target.value)}
                  placeholder="e.g. Day 2 is Now Live!"
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                  Message Content
                </label>
                <textarea
                  rows={4}
                  value={broadcastMsg}
                  onChange={(e) => setBroadcastMsg(e.target.value)}
                  placeholder="Draft your announcement message here..."
                  className="w-full p-4 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" /> Send Announcement Now
              </button>
            </form>
          </div>
        )}
      </main>

      {/* Certificate Modal */}
      {previewCert && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 p-6 rounded-3xl max-w-4xl w-full relative">
            <button
              onClick={() => setPreviewCert(null)}
              className="absolute top-4 right-4 text-white hover:text-rose-400 font-bold text-sm bg-white/10 px-3 py-1.5 rounded-full"
            >
              ✕ Close
            </button>
            <CertificateView certificate={previewCert} onOpenVerify={onOpenVerify} fullView />
          </div>
        </div>
      )}
    </div>
  );
};
