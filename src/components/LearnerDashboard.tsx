import React, { useState } from 'react';
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
  CheckCircle2,
  Lock,
  Clock,
  Award,
  BookOpen,
  Trophy,
  MessageSquare,
  Bell,
  User,
  Calendar,
  Sparkles,
  ExternalLink,
  Download,
  Flame,
  Zap,
  ArrowRight,
  LogOut,
  FileText,
  Video,
  ChevronRight,
  Share2,
} from 'lucide-react';
import { BadgeCard } from './BadgeCard';
import { CertificateView } from './CertificateView';
import { ChatPanel } from './ChatPanel';
import { ChallengeArena } from './ChallengeArena';
import { AchievementBadgesModule } from './AchievementBadgesModule';
import { SpinningWheelQuiz } from './SpinningWheelQuiz';
import { sounds } from '../utils/audio';

interface LearnerDashboardProps {
  learner: Learner;
  assignments: DayAssignment[];
  challenges: DayChallenge[];
  messages: ChatMessage[];
  notifications: AppNotification[];
  learnersLeaderboard: Learner[];
  onMarkAssignmentViewed: (learnerId: string, day: number) => void;
  onCompleteDay: (learnerId: string, day: number, score: number, text?: string, audio?: boolean, timeSpentSec?: number) => void;
  onSendMessage: (learnerId: string, sender: 'learner' | 'admin', text: string, attachment?: any) => void;
  onMarkMessagesRead: (learnerId: string, reader: 'learner' | 'admin') => void;
  onOpenVerify: (credentialId: string) => void;
  onLogout: () => void;
  onAwardBonusXp?: (learnerId: string, xp: number, reason: string) => void;
}

export const LearnerDashboard: React.FC<LearnerDashboardProps> = ({
  learner,
  assignments,
  challenges,
  messages,
  notifications,
  learnersLeaderboard,
  onMarkAssignmentViewed,
  onCompleteDay,
  onSendMessage,
  onMarkMessagesRead,
  onOpenVerify,
  onLogout,
  onAwardBonusXp,
}) => {
  const [activeTab, setActiveTab] = useState<'workshop' | 'badges' | 'certificates' | 'messages' | 'leaderboard' | 'profile'>('workshop');
  const [selectedDay, setSelectedDay] = useState<number>(learner.currentDay || 1);
  const [activeChallengeDay, setActiveChallengeDay] = useState<number | null>(null);
  const [previewCert, setPreviewCert] = useState<Certificate | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showDashboardSpinWheel, setShowDashboardSpinWheel] = useState(false);

  const currentAssignment = assignments.find((a) => a.day === selectedDay) || assignments[0];
  const currentChallenge = challenges.find((c) => c.day === selectedDay) || challenges[0];
  const currentDayStatus = learner.dayStatus[selectedDay] || {
    assignmentViewed: false,
    challengeCompleted: false,
    score: 0,
    maxScore: 100,
    timeSpentSec: 0,
    badgeIssued: false,
    certificateIssued: false,
  };

  const isDayUnlocked = selectedDay === 1 || learner.completedDays.includes(selectedDay - 1);
  const isDayCompleted = learner.completedDays.includes(selectedDay);

  const unreadMessagesCount = messages.filter((m) => m.learnerId === learner.id && m.sender === 'admin' && !m.read).length;
  const unreadNotifsCount = notifications.filter((n) => !n.read && (!n.targetLearnerId || n.targetLearnerId === learner.id)).length;

  // Grand Certificate
  const grandCert = learner.certificates.find((c) => c.type === 'grand');

  const handleStartChallenge = (day: number) => {
    onMarkAssignmentViewed(learner.id, day);
    setActiveChallengeDay(day);
    sounds.playPop();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-extrabold shadow-md shadow-indigo-500/20">
              VE
            </div>
            <div>
              <div className="font-extrabold text-base tracking-tight text-slate-900 flex items-center gap-1.5">
                VerbalEdge
                <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full">
                  Workshop
                </span>
              </div>
              <div className="text-[11px] text-slate-500 font-medium hidden sm:block">
                Powered by Kapil
              </div>
            </div>
          </div>

          {/* User Status Pills & Quick Nav */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Streak & XP */}
            <div className="hidden sm:flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-full text-xs font-semibold">
              <span className="flex items-center gap-1 text-amber-600">
                <Flame className="w-3.5 h-3.5 fill-current" />
                {learner.streak} Day Streak
              </span>
              <span className="text-slate-300">•</span>
              <span className="flex items-center gap-1 text-indigo-600">
                <Zap className="w-3.5 h-3.5 fill-current" />
                {learner.xp} XP
              </span>
            </div>

            {/* Spinning Wheel Bonus Quick Button */}
            <button
              id="btn-spin-wheel-topbar"
              onClick={() => setShowDashboardSpinWheel(true)}
              className="px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-sm shadow-amber-500/20 transition active:scale-95 cursor-pointer"
              title="Practice rapid verbal quiz flashcards on the Spinning Wheel"
            >
              <Sparkles className="w-3.5 h-3.5 fill-current" />
              <span className="hidden sm:inline">Spin Wheel</span>
            </button>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition relative"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadNotifsCount > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white animate-pulse" />
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 z-50">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <h4 className="font-bold text-sm text-slate-900">Workshop Notifications</h4>
                    <span className="text-xs text-indigo-600 font-medium">Real-time alerts</span>
                  </div>
                  <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto mt-2">
                    {notifications.map((n) => (
                      <div key={n.id} className="py-3 text-left">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-900 mb-0.5">
                          <span>{n.title}</span>
                          <span className="text-[10px] text-slate-400 font-normal">{n.timestamp}</span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">{n.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Learner ID pill */}
            <div className="bg-indigo-50 border border-indigo-100 text-indigo-900 px-3 py-1 rounded-xl text-xs font-mono font-bold hidden md:block">
              {learner.id}
            </div>

            {/* Switch User / Leave */}
            <button
              onClick={onLogout}
              className="p-2 text-slate-500 hover:text-rose-600 rounded-xl hover:bg-slate-100 transition"
              title="Leave / Change User"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex gap-2 sm:gap-6 overflow-x-auto text-xs sm:text-sm font-semibold border-t border-slate-100">
          <button
            onClick={() => setActiveTab('workshop')}
            className={`py-3 px-1 border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'workshop'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Workshop Journey
          </button>
          <button
            onClick={() => setActiveTab('badges')}
            className={`py-3 px-1 border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'badges'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Award className="w-4 h-4" />
            Badges & Achievements
          </button>
          <button
            onClick={() => setActiveTab('certificates')}
            className={`py-3 px-1 border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'certificates'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            Certificates ({learner.certificates.length})
          </button>
          <button
            onClick={() => setActiveTab('messages')}
            className={`py-3 px-1 border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'messages'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            Trainer Chat
            {unreadMessagesCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] flex items-center justify-center font-bold">
                {unreadMessagesCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`py-3 px-1 border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'leaderboard'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Trophy className="w-4 h-4 text-yellow-500" />
            Leaderboard
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-3 px-1 border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'profile'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-4 h-4" />
            Profile
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-6">
        {/* Welcome Header & Progress Overview */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 border border-slate-200 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="text-xs uppercase tracking-wider font-bold text-indigo-600 mb-1 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                VerbalEdge 3-Day Challenge
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Hello, {learner.name}! 👋
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
                Ready to elevate your articulation and placement test scores? Complete today's daily assignment and pass the timed challenge to claim your verified credential.
              </p>
            </div>

            {/* Overall Progress Meter */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 flex items-center gap-5 min-w-[240px]">
              <div className="w-16 h-16 rounded-full bg-indigo-50 border-4 border-indigo-600 flex items-center justify-center font-black text-indigo-900 text-base shadow-sm">
                {learner.progressPercentage}%
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Workshop Progress</div>
                <div className="text-sm font-extrabold text-slate-900 mt-0.5">
                  {learner.completedDays.length} of 3 Days Done
                </div>
                <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">
                  {learner.completedDays.length === 3 ? '🎉 Fully Certified!' : 'In Progress'}
                </div>
              </div>
            </div>
          </div>

          {/* 3-Day Stepper / Progress Bar (PRD Page 6) */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Daily Journey Stepper
            </div>
            <div className="grid grid-cols-3 gap-2 sm:gap-4">
              {[1, 2, 3].map((d) => {
                const isCompleted = learner.completedDays.includes(d);
                const isCurrent = learner.currentDay === d && !isCompleted;
                const isLocked = d > learner.currentDay && !isCompleted;
                const isSelected = selectedDay === d;

                return (
                  <button
                    key={d}
                    onClick={() => {
                      setSelectedDay(d);
                      sounds.playPop();
                    }}
                    className={`p-3.5 sm:p-4 rounded-2xl text-left border-2 transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/50 shadow-md'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-black uppercase tracking-wider text-slate-900">
                        Day {d}
                      </span>
                      {isCompleted ? (
                        <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Done
                        </span>
                      ) : isCurrent ? (
                        <span className="text-xs font-bold text-amber-600 flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-full">
                          <Clock className="w-3.5 h-3.5 animate-spin" /> In Progress
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-slate-400 flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-full">
                          <Lock className="w-3.5 h-3.5" /> Locked
                        </span>
                      )}
                    </div>

                    <div className="text-xs font-semibold text-slate-700 truncate">
                      {d === 1 && 'Verbal Foundations'}
                      {d === 2 && 'Corporate Comms'}
                      {d === 3 && 'Placement Crucible'}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Grand Completion Banner (When Day 3 is Done!) */}
        {grandCert && (
          <div className="mb-8 rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 text-slate-950 shadow-2xl shadow-amber-500/20 flex flex-col md:flex-row items-center justify-between gap-6 border-2 border-yellow-300">
            <div>
              <div className="inline-flex items-center gap-1.5 bg-black/20 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                Grand Master Achievement Unlocked
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Grand Placement Readiness Master Certificate
              </h2>
              <p className="text-xs sm:text-sm text-yellow-100 max-w-xl mt-1">
                Congratulations {learner.name}! You completed all 3 days of the VerbalEdge Challenge. Your prestigious Gold-Themed Certificate is ready to share and download.
              </p>
            </div>
            <button
              onClick={() => {
                setPreviewCert(grandCert);
                sounds.playSuccess();
              }}
              className="px-6 py-3.5 rounded-2xl bg-slate-950 text-amber-300 hover:bg-slate-900 font-extrabold text-sm shadow-xl flex items-center gap-2 shrink-0 transition"
            >
              <Award className="w-5 h-5 text-yellow-400" />
              View Gold Certificate
            </button>
          </div>
        )}

        {/* TAB 1: WORKSHOP JOURNEY */}
        {activeTab === 'workshop' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Assignment Content (2 cols) */}
            <div className="lg:col-span-2 space-y-6">
              {/* Today's Assignment Card */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
                      D{selectedDay}
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Today's Assignment
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 font-medium">
                    {currentAssignment.scheduledDate}
                  </span>
                </div>

                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mb-2">
                  {currentAssignment.title}
                </h2>
                <p className="text-sm text-indigo-600 font-semibold mb-6">
                  {currentAssignment.subtitle}
                </p>

                {/* Key Takeaways */}
                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 mb-6">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Key Placement Learning Outcomes
                  </h4>
                  <ul className="space-y-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {currentAssignment.content.keyTakeaways.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Reading & Rules Content */}
                <div className="prose prose-slate max-w-none text-xs sm:text-sm leading-relaxed mb-6 bg-slate-50/50 p-5 rounded-2xl border border-slate-200/60 whitespace-pre-line text-slate-700 font-sans">
                  {currentAssignment.content.readingMaterial}
                </div>

                {/* Resources & Download Materials */}
                <div className="space-y-3 pt-4 border-t border-slate-100">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Curated Placement Materials
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {currentAssignment.content.resourceLinks.map((res, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-xl border border-slate-200 flex items-center justify-between text-xs hover:border-indigo-300 transition bg-slate-50/40"
                      >
                        <div className="flex items-center gap-2 text-slate-700 font-semibold truncate">
                          {res.type === 'video' ? (
                            <Video className="w-4 h-4 text-rose-500 shrink-0" />
                          ) : (
                            <FileText className="w-4 h-4 text-indigo-500 shrink-0" />
                          )}
                          <span className="truncate">{res.title}</span>
                        </div>
                        <span className="text-[10px] font-bold text-indigo-600 hover:underline shrink-0">
                          View
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Assignment Action Bar */}
                <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    {currentDayStatus.assignmentViewed ? (
                      <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                        <CheckCircle2 className="w-4 h-4" /> Material Studied
                      </span>
                    ) : (
                      <span>Marked complete once you review</span>
                    )}
                  </div>

                  <button
                    onClick={() => handleStartChallenge(selectedDay)}
                    className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold shadow-lg shadow-indigo-600/25 flex items-center gap-2 transition"
                  >
                    <span>Proceed to Day {selectedDay} Challenge</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Right: Challenge Status, Badges & Calendar (1 col) */}
            <div className="space-y-6">
              {/* Today's Challenge Action Card */}
              <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Day {selectedDay} Challenge
                  </span>
                  <span className="text-xs font-mono font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">
                    {currentChallenge.timeLimitMinutes} Mins Timed
                  </span>
                </div>

                <h3 className="text-lg font-extrabold text-slate-900 tracking-tight mb-2">
                  {currentChallenge.title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-4">
                  Passing score: {currentChallenge.passingScore}% • Includes MCQ, Sentence Correction, and interactive drills.
                </p>

                {currentDayStatus.challengeCompleted ? (
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 mb-4">
                    <div className="flex items-center justify-between font-bold text-sm">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Challenge Cleared!
                      </span>
                      <span>Score: {currentDayStatus.score}%</span>
                    </div>
                    <p className="text-xs text-emerald-700 mt-1">
                      Badge & Certificate generated successfully.
                    </p>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-600 mb-4 text-xs">
                    Test your understanding under realistic placement exam time pressure.
                  </div>
                )}

                <button
                  onClick={() => handleStartChallenge(selectedDay)}
                  className={`w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-md transition ${
                    currentDayStatus.challengeCompleted
                      ? 'bg-slate-900 text-white hover:bg-slate-800'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-500/20'
                  }`}
                >
                  <Trophy className="w-4 h-4 text-yellow-300" />
                  {currentDayStatus.challengeCompleted ? 'Retake / Practice Again' : `Start Day ${selectedDay} Challenge`}
                </button>
              </div>

              {/* Day Credentials Status */}
              <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-200">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">
                  Credentials for Day {selectedDay}
                </h4>

                <div className="space-y-3">
                  {/* Badge Row */}
                  <div className="p-3.5 rounded-2xl border border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                        <Award className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">
                          Day {selectedDay} Badge
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {currentDayStatus.badgeIssued ? 'Issued & Verified' : 'Locked until challenge'}
                        </div>
                      </div>
                    </div>
                    {currentDayStatus.badgeIssued ? (
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                        Earned ✅
                      </span>
                    ) : (
                      <Lock className="w-4 h-4 text-slate-400" />
                    )}
                  </div>

                  {/* Certificate Row */}
                  <div className="p-3.5 rounded-2xl border border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">
                          Day {selectedDay} Certificate
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {currentDayStatus.certificateIssued ? 'Authenticated' : 'Locked'}
                        </div>
                      </div>
                    </div>
                    {currentDayStatus.certificateIssued ? (
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                        Earned ✅
                      </span>
                    ) : (
                      <Lock className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </div>
              </div>

              {/* Workshop Calendar Card (PRD Page 6) */}
              <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-200">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                  <Calendar className="w-4 h-4 text-indigo-600" />
                  Workshop Schedule & Milestones
                </div>
                <div className="space-y-3 text-xs">
                  <div className="flex items-start gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                    <div>
                      <strong className="text-slate-900">Day 1:</strong> Grammar & Verbal Aptitude Foundation
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                    <div>
                      <strong className="text-slate-900">Day 2:</strong> Corporate Email & Articulation Mastery
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                    <div>
                      <strong className="text-slate-900">Day 3:</strong> Interview Crucible & Grand Certification
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Unlockable Milestone Achievements Module */}
            <div className="mt-8">
              <AchievementBadgesModule
                learner={learner}
                messages={messages}
                compact
                onNavigateToTab={(tab) => setActiveTab(tab as any)}
              />
            </div>
          </div>
        )}

        {/* TAB 2: MY BADGES & MILESTONES */}
        {activeTab === 'badges' && (
          <div className="space-y-10">
            {/* Section 1: Core Verified Day Badges */}
            <div>
              <div className="mb-6">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-600 mb-1">
                  <Award className="w-4 h-4 text-indigo-600" />
                  Official Placement Credentials
                </div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  Curriculum Day Badges
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  Every verified badge includes a cryptographically unique number, QR code verification, and instant PNG/PDF downloads.
                </p>
              </div>

              {learner.badges.length === 0 ? (
                <div className="bg-white rounded-3xl p-10 text-center border border-slate-200">
                  <Award className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <h3 className="text-base font-bold text-slate-800">No Curriculum Badges Earned Yet</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-6">
                    Complete the Day 1 Placement Challenge to earn your official "Day 1 Challenger" Digital Badge!
                  </p>
                  <button
                    onClick={() => {
                      setActiveTab('workshop');
                      setSelectedDay(1);
                    }}
                    className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition shadow-sm"
                  >
                    Start Day 1 Challenge
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {learner.badges.map((badge) => (
                    <BadgeCard
                      key={badge.badgeId}
                      badge={badge}
                      onOpenVerify={onOpenVerify}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Section 2: Unlockable Milestone Achievements Gallery */}
            <div>
              <AchievementBadgesModule
                learner={learner}
                messages={messages}
                compact={false}
                onNavigateToTab={(tab) => setActiveTab(tab as any)}
              />
            </div>
          </div>
        )}

        {/* TAB 3: CERTIFICATES */}
        {activeTab === 'certificates' && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                Verified Certificates
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Daily completion certificates and the Grand Placement Master Certificate with Kapil Narula's digital signature and QR verification.
              </p>
            </div>

            {learner.certificates.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
                <Sparkles className="w-12 h-12 text-amber-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-800">No Certificates Earned Yet</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-6">
                  Pass the daily challenges to instantly generate your certificates.
                </p>
                <button
                  onClick={() => setActiveTab('workshop')}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition"
                >
                  Go to Workshop
                </button>
              </div>
            ) : (
              <div className="space-y-12">
                {learner.certificates.map((cert) => (
                  <div key={cert.certId} className="bg-slate-100 p-4 sm:p-8 rounded-3xl border border-slate-200">
                    <CertificateView
                      certificate={cert}
                      onOpenVerify={onOpenVerify}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: TRAINER CHAT (1-on-1 Mentorship) */}
        {activeTab === 'messages' && (
          <div className="max-w-3xl mx-auto">
            <ChatPanel
              learnerId={learner.id}
              learnerName={learner.name}
              messages={messages}
              currentRole="learner"
              onSendMessage={onSendMessage}
              onMarkRead={onMarkMessagesRead}
            />
          </div>
        )}

        {/* TAB 5: LEADERBOARD */}
        {activeTab === 'leaderboard' && (
          <div className="max-w-4xl mx-auto bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-amber-600 flex items-center gap-1.5">
                  <Trophy className="w-4 h-4" />
                  VerbalEdge Cohort Leaderboard
                </div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
                  Top Performing Placement Warriors
                </h2>
              </div>
              <span className="text-xs bg-slate-100 px-3 py-1.5 rounded-full font-semibold text-slate-600">
                Real-time Cohort Ranking
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {learnersLeaderboard
                .slice()
                .sort((a, b) => b.xp - a.xp)
                .map((l, rank) => {
                  const isMe = l.id === learner.id;
                  return (
                    <div
                      key={l.id}
                      className={`py-4 px-3 sm:px-4 rounded-2xl flex items-center justify-between transition ${
                        isMe ? 'bg-indigo-50/70 border border-indigo-200' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${
                            rank === 0
                              ? 'bg-amber-400 text-slate-950 ring-4 ring-amber-100'
                              : rank === 1
                              ? 'bg-slate-300 text-slate-900'
                              : rank === 2
                              ? 'bg-amber-700 text-white'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {rank + 1}
                        </div>

                        <div>
                          <div className="font-bold text-sm text-slate-900 flex items-center gap-2">
                            {l.name}
                            {isMe && (
                              <span className="text-[10px] bg-indigo-600 text-white px-2 py-0.5 rounded-full font-bold">
                                YOU
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 font-code">
                            ID: {l.id} • {l.completedDays.length}/3 Days Done
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-6 text-right">
                        <div>
                          <div className="text-xs font-bold text-slate-400 uppercase">Streak</div>
                          <div className="text-xs font-extrabold text-amber-600 flex items-center gap-1 justify-end">
                            <Flame className="w-3.5 h-3.5 fill-current" />
                            {l.streak}d
                          </div>
                        </div>

                        <div className="min-w-[70px]">
                          <div className="text-xs font-bold text-slate-400 uppercase">XP</div>
                          <div className="text-sm font-black text-indigo-600">{l.xp} pts</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* TAB 6: PROFILE */}
        {activeTab === 'profile' && (
          <div className="max-w-2xl mx-auto bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200">
            <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-black text-xl flex items-center justify-center shadow-lg">
                {learner.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-900">{learner.name}</h2>
                <p className="text-xs font-mono text-indigo-600 font-bold">Learner ID: {learner.id}</p>
                <p className="text-xs text-slate-400 mt-0.5">Enrolled on: {learner.joinedAt}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6 border-b border-slate-100 text-center">
              <div className="p-3 bg-slate-50 rounded-2xl">
                <div className="text-xs text-slate-400 uppercase font-bold">Progress</div>
                <div className="text-lg font-black text-slate-900 mt-0.5">
                  {learner.progressPercentage}%
                </div>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl">
                <div className="text-xs text-slate-400 uppercase font-bold">XP Points</div>
                <div className="text-lg font-black text-indigo-600 mt-0.5">{learner.xp}</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl">
                <div className="text-xs text-slate-400 uppercase font-bold">Badges</div>
                <div className="text-lg font-black text-amber-600 mt-0.5">
                  {learner.badges.length}
                </div>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl">
                <div className="text-xs text-slate-400 uppercase font-bold">Certificates</div>
                <div className="text-lg font-black text-emerald-600 mt-0.5">
                  {learner.certificates.length}
                </div>
              </div>
            </div>

            <div className="pt-6">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Placement Challenge Milestones
              </h4>
              <div className="space-y-3">
                {[1, 2, 3].map((day) => {
                  const done = learner.completedDays.includes(day);
                  const st = learner.dayStatus[day];
                  return (
                    <div
                      key={day}
                      className="p-3.5 rounded-2xl border border-slate-200 flex items-center justify-between text-xs"
                    >
                      <span className="font-bold text-slate-800">
                        Day {day}: {day === 1 ? 'Verbal Aptitude' : day === 2 ? 'Corporate Articulation' : 'Mock Interview'}
                      </span>
                      {done ? (
                        <span className="text-emerald-600 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" /> Passed ({st?.score}%)
                        </span>
                      ) : (
                        <span className="text-slate-400 font-medium">Pending</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Active Challenge Modal */}
      {activeChallengeDay && (
        <ChallengeArena
          challenge={challenges.find((c) => c.day === activeChallengeDay) || challenges[0]}
          onComplete={(score, submissionText, audioRecorded, timeSpentSec) => {
            onCompleteDay(learner.id, activeChallengeDay, score, submissionText, audioRecorded, timeSpentSec);
            setActiveChallengeDay(null);
          }}
          onClose={() => setActiveChallengeDay(null)}
          onAwardBonusXp={(xp, reason) => onAwardBonusXp?.(learner.id, xp, reason)}
        />
      )}

      {/* Standalone Spinning Wheel Modal */}
      {showDashboardSpinWheel && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="max-w-4xl w-full relative">
            <SpinningWheelQuiz
              onAwardBonusXp={(xp, reason) => onAwardBonusXp?.(learner.id, xp, reason)}
              onClose={() => setShowDashboardSpinWheel(false)}
            />
          </div>
        </div>
      )}

      {/* Preview Certificate Modal */}
      {previewCert && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
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
