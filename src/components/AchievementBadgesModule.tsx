import React, { useState, useMemo } from 'react';
import { Learner, ChatMessage, MilestoneAchievement } from '../types';
import { getLearnerAchievements } from '../utils/achievements';
import {
  Sparkles,
  Zap,
  Flame,
  Trophy,
  BookOpen,
  Award,
  Mic,
  CheckCircle2,
  MessageSquare,
  Lock,
  Share2,
  Check,
  Filter,
  ChevronRight,
  Info,
  Timer,
  ShieldCheck,
  Target,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds } from '../utils/audio';

interface AchievementBadgesModuleProps {
  learner: Learner;
  messages?: ChatMessage[];
  compact?: boolean;
  onNavigateToTab?: (tab: string) => void;
}

export const AchievementBadgesModule: React.FC<AchievementBadgesModuleProps> = ({
  learner,
  messages = [],
  compact = false,
  onNavigateToTab,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<'all' | 'unlocked' | 'locked'>('all');
  const [activeModalBadge, setActiveModalBadge] = useState<MilestoneAchievement | null>(null);
  const [copiedBadgeId, setCopiedBadgeId] = useState<string | null>(null);

  const achievements = useMemo(() => {
    return getLearnerAchievements(learner, messages);
  }, [learner, messages]);

  const unlockedCount = achievements.filter((a) => a.isUnlocked).length;
  const totalCount = achievements.length;
  const totalEarnedXp = achievements
    .filter((a) => a.isUnlocked)
    .reduce((acc, a) => acc + a.xpReward, 0);
  const completionPercentage = Math.round((unlockedCount / totalCount) * 100);

  const filteredAchievements = useMemo(() => {
    return achievements.filter((a) => {
      if (selectedCategory !== 'All' && a.category !== selectedCategory) {
        return false;
      }
      if (statusFilter === 'unlocked' && !a.isUnlocked) return false;
      if (statusFilter === 'locked' && a.isUnlocked) return false;
      return true;
    });
  }, [achievements, selectedCategory, statusFilter]);

  const renderIcon = (iconName: string, isUnlocked: boolean, className = 'w-6 h-6') => {
    switch (iconName) {
      case 'Sparkles':
        return <Sparkles className={`${className} ${isUnlocked ? 'text-amber-500' : 'text-slate-400'}`} />;
      case 'Zap':
        return <Zap className={`${className} ${isUnlocked ? 'text-amber-500 fill-amber-400/20' : 'text-slate-400'}`} />;
      case 'Flame':
        return <Flame className={`${className} ${isUnlocked ? 'text-rose-500 fill-rose-400/20' : 'text-slate-400'}`} />;
      case 'Trophy':
        return <Trophy className={`${className} ${isUnlocked ? 'text-yellow-500 fill-yellow-400/20' : 'text-slate-400'}`} />;
      case 'BookOpen':
        return <BookOpen className={`${className} ${isUnlocked ? 'text-indigo-500' : 'text-slate-400'}`} />;
      case 'Award':
        return <Award className={`${className} ${isUnlocked ? 'text-emerald-500' : 'text-slate-400'}`} />;
      case 'Mic':
        return <Mic className={`${className} ${isUnlocked ? 'text-purple-500' : 'text-slate-400'}`} />;
      case 'MessageSquare':
        return <MessageSquare className={`${className} ${isUnlocked ? 'text-sky-500' : 'text-slate-400'}`} />;
      case 'Timer':
        return <Timer className={`${className} ${isUnlocked ? 'text-orange-500' : 'text-slate-400'}`} />;
      case 'Target':
      default:
        return <Target className={`${className} ${isUnlocked ? 'text-emerald-500' : 'text-slate-400'}`} />;
    }
  };

  const getRarityBadgeStyle = (rarity: string) => {
    switch (rarity) {
      case 'Legendary':
        return 'bg-amber-100 text-amber-800 border-amber-300 font-extrabold';
      case 'Epic':
        return 'bg-purple-100 text-purple-800 border-purple-300 font-bold';
      case 'Rare':
        return 'bg-indigo-100 text-indigo-800 border-indigo-300 font-bold';
      case 'Common':
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200 font-semibold';
    }
  };

  const handleBadgeClick = (badge: MilestoneAchievement) => {
    setActiveModalBadge(badge);
    if (badge.isUnlocked) {
      sounds.playPop();
    } else {
      sounds.playPop();
    }
  };

  const triggerCelebrate = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
    sounds.playSuccess();
  };

  const handleShareBadge = (badge: MilestoneAchievement) => {
    const text = `🏆 I just unlocked the "${badge.title}" (${badge.rarity}) Achievement on VerbalEdge 3-Day Placement Workshop! Criteria: ${badge.criteria}.`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedBadgeId(badge.id);
      sounds.playSuccess();
      setTimeout(() => setCopiedBadgeId(null), 3000);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 border border-slate-200">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-600 mb-1">
            <Sparkles className="w-4 h-4 text-amber-500" />
            Milestone Achievement Badges
            <span className="bg-indigo-50 text-indigo-700 text-[10px] px-2 py-0.5 rounded-full border border-indigo-100">
              Interactive System
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Placement Challenge Milestones
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Earn exclusive unlockable badges for lightning speed, flawless accuracy, and interview crucible feats.
          </p>
        </div>

        {/* Aggregate Stats */}
        <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200/80 shrink-0">
          <div className="text-center px-2">
            <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Unlocked</div>
            <div className="text-lg font-black text-slate-900">
              {unlockedCount} <span className="text-xs font-bold text-slate-400">/ {totalCount}</span>
            </div>
          </div>
          <div className="w-px h-8 bg-slate-200" />
          <div className="text-center px-2">
            <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Bonus XP</div>
            <div className="text-lg font-black text-indigo-600">+{totalEarnedXp}</div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="py-4">
        <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
          <span className="text-slate-600">Achievement Mastery Progress</span>
          <span className="text-indigo-600 font-bold">{completionPercentage}% Completed</span>
        </div>
        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-indigo-500 via-purple-500 to-amber-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 pb-4">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {['All', 'Performance', 'Speed', 'Mastery', 'Consistency'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl font-bold transition ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              {cat === 'All' ? 'All Milestones' : cat}
            </button>
          ))}
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-2.5 py-1 rounded-lg transition ${
              statusFilter === 'all' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-500'
            }`}
          >
            All ({achievements.length})
          </button>
          <button
            onClick={() => setStatusFilter('unlocked')}
            className={`px-2.5 py-1 rounded-lg transition ${
              statusFilter === 'unlocked' ? 'bg-white text-emerald-700 shadow-sm font-bold' : 'text-slate-500'
            }`}
          >
            Unlocked ({unlockedCount})
          </button>
          <button
            onClick={() => setStatusFilter('locked')}
            className={`px-2.5 py-1 rounded-lg transition ${
              statusFilter === 'locked' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-500'
            }`}
          >
            Locked ({totalCount - unlockedCount})
          </button>
        </div>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
        {filteredAchievements.map((badge) => {
          const isUnlocked = badge.isUnlocked;
          return (
            <div
              key={badge.id}
              onClick={() => handleBadgeClick(badge)}
              className={`group relative rounded-2xl p-4 sm:p-5 border transition-all cursor-pointer flex flex-col justify-between ${
                isUnlocked
                  ? 'bg-gradient-to-b from-white to-slate-50/60 border-indigo-200/80 hover:border-indigo-400 hover:shadow-lg hover:shadow-indigo-500/10'
                  : 'bg-slate-50/70 border-slate-200/70 hover:border-slate-300 opacity-90'
              }`}
            >
              <div>
                {/* Top Badge Meta */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105 ${
                      isUnlocked
                        ? badge.rarity === 'Legendary'
                          ? 'bg-amber-50 ring-2 ring-amber-400/40 shadow-md shadow-amber-200/50'
                          : badge.rarity === 'Epic'
                          ? 'bg-purple-50 ring-2 ring-purple-400/40 shadow-md shadow-purple-200/50'
                          : 'bg-indigo-50 ring-2 ring-indigo-400/40 shadow-md shadow-indigo-200/50'
                        : 'bg-slate-200/80 text-slate-400'
                    }`}
                  >
                    {renderIcon(badge.iconName, isUnlocked, 'w-6 h-6')}
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <span
                      className={`text-[10px] uppercase px-2 py-0.5 rounded-full border ${getRarityBadgeStyle(
                        badge.rarity
                      )}`}
                    >
                      {badge.rarity}
                    </span>
                    <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-md">
                      +{badge.xpReward} XP
                    </span>
                  </div>
                </div>

                {/* Title and Subtitle */}
                <div className="flex items-center gap-1.5 mb-0.5">
                  <h3
                    className={`font-black text-sm tracking-tight ${
                      isUnlocked ? 'text-slate-900' : 'text-slate-700'
                    }`}
                  >
                    {badge.title}
                  </h3>
                  {isUnlocked ? (
                    <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                      ✓
                    </span>
                  ) : (
                    <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  )}
                </div>
                <p className="text-[11px] font-medium text-slate-500 line-clamp-1 mb-2">
                  {badge.subtitle}
                </p>

                {/* Criteria text */}
                <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                  {badge.description}
                </p>
              </div>

              {/* Bottom status indicator */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="font-semibold text-slate-500 truncate max-w-[170px]">
                  {badge.progressText}
                </span>

                {isUnlocked ? (
                  <span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60 shrink-0">
                    Unlocked
                  </span>
                ) : (
                  <span className="text-slate-400 font-medium bg-slate-100 px-2 py-0.5 rounded-full shrink-0">
                    Locked
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredAchievements.length === 0 && (
        <div className="py-12 text-center text-slate-400">
          <p className="text-sm">No badges match the selected filters.</p>
        </div>
      )}

      {/* Footer link to view full badges tab if on workshop view */}
      {compact && onNavigateToTab && (
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-medium">
            Keep practicing daily challenges to unlock all {totalCount} placement achievements!
          </span>
          <button
            onClick={() => onNavigateToTab('badges')}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition"
          >
            View All Badges & Credentials <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Achievement Detail Modal */}
      {activeModalBadge && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-100 relative animate-in fade-in zoom-in duration-200">
            {/* Close Button */}
            <button
              onClick={() => setActiveModalBadge(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-sm transition"
            >
              ✕
            </button>

            {/* Badge Emblem Center */}
            <div className="flex flex-col items-center text-center pt-2">
              <div
                className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-4 transition-transform shadow-xl ${
                  activeModalBadge.isUnlocked
                    ? activeModalBadge.rarity === 'Legendary'
                      ? 'bg-gradient-to-tr from-amber-400 to-yellow-500 text-white shadow-amber-300/40 ring-4 ring-amber-100'
                      : activeModalBadge.rarity === 'Epic'
                      ? 'bg-gradient-to-tr from-purple-500 to-indigo-600 text-white shadow-purple-300/40 ring-4 ring-purple-100'
                      : 'bg-gradient-to-tr from-indigo-500 to-sky-600 text-white shadow-indigo-300/40 ring-4 ring-indigo-100'
                    : 'bg-slate-100 text-slate-400 border border-slate-200'
                }`}
              >
                {renderIcon(activeModalBadge.iconName, activeModalBadge.isUnlocked, 'w-10 h-10')}
              </div>

              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`text-[11px] uppercase px-2.5 py-0.5 rounded-full border ${getRarityBadgeStyle(
                    activeModalBadge.rarity
                  )}`}
                >
                  {activeModalBadge.rarity}
                </span>
                <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full">
                  +{activeModalBadge.xpReward} XP Points
                </span>
                <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                  {activeModalBadge.category}
                </span>
              </div>

              <h3 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
                {activeModalBadge.title}
              </h3>
              <p className="text-xs font-bold text-indigo-600 uppercase tracking-wide mt-0.5">
                {activeModalBadge.subtitle}
              </p>
            </div>

            {/* Content Details */}
            <div className="my-5 space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs">
              <div>
                <div className="font-bold text-slate-700 uppercase text-[10px] tracking-wider mb-0.5">
                  About This Milestone
                </div>
                <p className="text-slate-600 leading-relaxed">{activeModalBadge.description}</p>
              </div>

              <div className="pt-2 border-t border-slate-200/60">
                <div className="font-bold text-slate-700 uppercase text-[10px] tracking-wider mb-0.5">
                  Unlock Criteria
                </div>
                <p className="text-indigo-900 font-semibold">{activeModalBadge.criteria}</p>
              </div>

              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-700 uppercase text-[10px] tracking-wider">
                    Status
                  </div>
                  <div className="text-slate-600 mt-0.5 font-medium">
                    {activeModalBadge.progressText}
                  </div>
                </div>
                {activeModalBadge.isUnlocked ? (
                  <span className="text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full font-bold text-xs flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Unlocked
                  </span>
                ) : (
                  <span className="text-slate-500 bg-slate-200 px-3 py-1 rounded-full font-semibold text-xs flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5" /> In Progress
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              {activeModalBadge.isUnlocked ? (
                <>
                  <button
                    onClick={triggerCelebrate}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5"
                  >
                    <Sparkles className="w-4 h-4" />
                    Celebrate
                  </button>
                  <button
                    onClick={() => handleShareBadge(activeModalBadge)}
                    className="py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition flex items-center gap-1.5"
                    title="Copy achievement text"
                  >
                    {copiedBadgeId === activeModalBadge.id ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-600" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Share2 className="w-4 h-4" />
                        Share Brag
                      </>
                    )}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    setActiveModalBadge(null);
                    if (onNavigateToTab) onNavigateToTab('workshop');
                  }}
                  className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition"
                >
                  Take Challenge to Unlock
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
