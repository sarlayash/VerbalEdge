import { Learner, ChatMessage, MilestoneAchievement } from '../types';

export interface MilestoneDefinition {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  criteria: string;
  category: 'Performance' | 'Speed' | 'Mastery' | 'Consistency';
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  xpReward: number;
  iconName: string;
  evaluate: (learner: Learner, messages?: ChatMessage[]) => {
    isUnlocked: boolean;
    progressText: string;
    progressPercentage: number;
    unlockedAt?: string;
  };
}

export const MILESTONE_DEFINITIONS: MilestoneDefinition[] = [
  {
    id: 'perfect-score',
    title: 'Perfect Score',
    subtitle: 'Flawless Placement Execution',
    description: 'Score 100% on any daily verbal or placement challenge, demonstrating absolute accuracy.',
    criteria: '100% score on Day 1, 2, or 3 Challenge',
    category: 'Performance',
    rarity: 'Legendary',
    xpReward: 300,
    iconName: 'Sparkles',
    evaluate: (learner) => {
      const bestScore = Math.max(
        0,
        ...Object.values(learner.dayStatus || {})
          .filter((s) => s.challengeCompleted)
          .map((s) => s.score || 0)
      );
      const isUnlocked = bestScore >= 100 || (learner.unlockedAchievements?.includes('perfect-score') ?? false);
      const perfectDay = Object.entries(learner.dayStatus || {}).find(
        ([, s]) => s.challengeCompleted && s.score >= 100
      );
      return {
        isUnlocked,
        progressText: isUnlocked ? '100% Score Achieved! 🎯' : `Best Score: ${bestScore}% / 100%`,
        progressPercentage: Math.min(100, bestScore),
        unlockedAt: perfectDay?.[1]?.completedAt || (isUnlocked ? learner.joinedAt : undefined),
      };
    },
  },
  {
    id: 'early-bird',
    title: 'Early Bird',
    subtitle: 'Rapid Assessment Sprinter',
    description: 'Complete any daily challenge in under 3 minutes (180 seconds) with speed and confidence.',
    criteria: 'Finish any challenge in ≤ 180 seconds',
    category: 'Speed',
    rarity: 'Rare',
    xpReward: 200,
    iconName: 'Zap',
    evaluate: (learner) => {
      const completedWithTime = Object.values(learner.dayStatus || {}).filter(
        (s) => s.challengeCompleted && s.timeSpentSec && s.timeSpentSec > 0
      );
      const fastestTime = completedWithTime.length > 0
        ? Math.min(...completedWithTime.map((s) => s.timeSpentSec))
        : 0;

      const isUnlocked =
        (fastestTime > 0 && fastestTime <= 180) ||
        (learner.unlockedAchievements?.includes('early-bird') ?? false);

      const fastestDay = Object.entries(learner.dayStatus || {}).find(
        ([, s]) => s.challengeCompleted && s.timeSpentSec > 0 && s.timeSpentSec <= 180
      );

      return {
        isUnlocked,
        progressText: isUnlocked
          ? `Speed Run: ${fastestTime}s (Target ≤ 180s) ⚡`
          : fastestTime > 0
          ? `Fastest: ${fastestTime}s (Target ≤ 180s)`
          : 'Pending challenge attempt',
        progressPercentage: isUnlocked ? 100 : fastestTime > 0 ? Math.min(95, Math.round((180 / fastestTime) * 100)) : 0,
        unlockedAt: fastestDay?.[1]?.completedAt || (isUnlocked ? learner.joinedAt : undefined),
      };
    },
  },
  {
    id: 'speed-demon',
    title: 'Speed Demon',
    subtitle: 'Time Pressure Master',
    description: 'Conquer a proctored assessment with more than 50% of the countdown clock remaining.',
    criteria: 'Complete challenge with > 50% time left',
    category: 'Speed',
    rarity: 'Epic',
    xpReward: 250,
    iconName: 'Flame',
    evaluate: (learner) => {
      const qualifyingDays = Object.values(learner.dayStatus || {}).filter(
        (s) => s.challengeCompleted && s.score >= 70 && s.timeSpentSec > 0 && s.timeSpentSec <= 240
      );
      const isUnlocked = qualifyingDays.length > 0 || (learner.unlockedAchievements?.includes('speed-demon') ?? false);
      return {
        isUnlocked,
        progressText: isUnlocked ? 'Completed with >50% clock remaining! ⏱️' : 'Finish challenge in < 4 mins',
        progressPercentage: isUnlocked ? 100 : qualifyingDays.length > 0 ? 100 : 0,
        unlockedAt: qualifyingDays[0]?.completedAt,
      };
    },
  },
  {
    id: 'streak-champion',
    title: 'Streak Champion',
    subtitle: 'Daily Dedication',
    description: 'Maintain a 3-day active practice streak throughout the placement readiness workshop.',
    criteria: 'Reach a streak of 3 active days',
    category: 'Consistency',
    rarity: 'Epic',
    xpReward: 250,
    iconName: 'Flame',
    evaluate: (learner) => {
      const streak = Math.max(learner.streak || 0, learner.completedDays.length);
      const isUnlocked = streak >= 3 || (learner.unlockedAchievements?.includes('streak-champion') ?? false);
      return {
        isUnlocked,
        progressText: `${Math.min(3, streak)} / 3 Days Streak 🔥`,
        progressPercentage: Math.min(100, Math.round((streak / 3) * 100)),
        unlockedAt: isUnlocked ? learner.joinedAt : undefined,
      };
    },
  },
  {
    id: 'grammar-titan',
    title: 'Grammar Titan',
    subtitle: 'Sentence Dynamics Specialist',
    description: 'Score 90%+ on Day 1 Verbal Foundations & Grammar Placement Mastery.',
    criteria: 'Score ≥ 90% on Day 1 Challenge',
    category: 'Mastery',
    rarity: 'Rare',
    xpReward: 150,
    iconName: 'BookOpen',
    evaluate: (learner) => {
      const d1 = learner.dayStatus?.[1];
      const isUnlocked = (d1?.challengeCompleted && (d1?.score || 0) >= 90) || (learner.unlockedAchievements?.includes('grammar-titan') ?? false);
      return {
        isUnlocked,
        progressText: d1?.challengeCompleted ? `Day 1 Score: ${d1.score}%` : 'Pending Day 1 Challenge',
        progressPercentage: Math.min(100, d1?.score || 0),
        unlockedAt: d1?.completedAt,
      };
    },
  },
  {
    id: 'executive-articulator',
    title: 'Executive Articulator',
    subtitle: 'Corporate BLUF Connoisseur',
    description: 'Master bottom-line-up-front structuring and tone with 90%+ on Day 2 Corporate Communication.',
    criteria: 'Score ≥ 90% on Day 2 Challenge',
    category: 'Mastery',
    rarity: 'Rare',
    xpReward: 150,
    iconName: 'Award',
    evaluate: (learner) => {
      const d2 = learner.dayStatus?.[2];
      const isUnlocked = (d2?.challengeCompleted && (d2?.score || 0) >= 90) || (learner.unlockedAchievements?.includes('executive-articulator') ?? false);
      return {
        isUnlocked,
        progressText: d2?.challengeCompleted ? `Day 2 Score: ${d2.score}%` : 'Pending Day 2 Challenge',
        progressPercentage: Math.min(100, d2?.score || 0),
        unlockedAt: d2?.completedAt,
      };
    },
  },
  {
    id: 'voice-of-authority',
    title: 'Voice of Authority',
    subtitle: 'Interview Speaking Crucible',
    description: 'Deliver and record spoken answers during the Day 3 Placement Interview Crucible.',
    criteria: 'Submit voice recording on Day 3',
    category: 'Performance',
    rarity: 'Epic',
    xpReward: 200,
    iconName: 'Mic',
    evaluate: (learner) => {
      const d3 = learner.dayStatus?.[3];
      const isUnlocked = Boolean(d3?.audioRecorded) || (learner.unlockedAchievements?.includes('voice-of-authority') ?? false);
      return {
        isUnlocked,
        progressText: isUnlocked ? 'Audio response verified 🎙️' : 'Record voice on Day 3',
        progressPercentage: isUnlocked ? 100 : 0,
        unlockedAt: d3?.completedAt,
      };
    },
  },
  {
    id: 'grand-placement-warrior',
    title: 'Placement Grandmaster',
    subtitle: 'Triple-Crown Certification',
    description: 'Complete all 3 days of curriculum, pass all assessments, and unlock the Gold Grand Master Certificate.',
    criteria: 'Complete Day 1, 2, and 3',
    category: 'Performance',
    rarity: 'Legendary',
    xpReward: 500,
    iconName: 'Trophy',
    evaluate: (learner) => {
      const count = learner.completedDays.length;
      const isUnlocked = count >= 3 || (learner.unlockedAchievements?.includes('grand-placement-warrior') ?? false);
      return {
        isUnlocked,
        progressText: `${Math.min(3, count)} / 3 Days Completed 👑`,
        progressPercentage: Math.min(100, Math.round((count / 3) * 100)),
        unlockedAt: isUnlocked ? learner.dayStatus?.[3]?.completedAt || learner.joinedAt : undefined,
      };
    },
  },
  {
    id: 'day1-pioneer',
    title: 'Day 1 Pioneer',
    subtitle: 'First Victory',
    description: 'Successfully complete your first verbal ability placement challenge.',
    criteria: 'Pass the Day 1 challenge',
    category: 'Consistency',
    rarity: 'Common',
    xpReward: 100,
    iconName: 'CheckCircle2',
    evaluate: (learner) => {
      const isUnlocked = learner.completedDays.includes(1) || (learner.unlockedAchievements?.includes('day1-pioneer') ?? false);
      return {
        isUnlocked,
        progressText: isUnlocked ? 'Day 1 Passed ✅' : '0 / 1 Day Completed',
        progressPercentage: isUnlocked ? 100 : 0,
        unlockedAt: learner.dayStatus?.[1]?.completedAt,
      };
    },
  },
  {
    id: 'trainer-connected',
    title: 'Mentorship Seeker',
    subtitle: 'Placement Clarity Champion',
    description: 'Reach out to Lead Trainer Kapil Narula via private chat for doubt clearance or placement advice.',
    criteria: 'Send at least 1 message in Trainer Chat',
    category: 'Consistency',
    rarity: 'Common',
    xpReward: 100,
    iconName: 'MessageSquare',
    evaluate: (learner, messages = []) => {
      const hasSent = messages.some((m) => m.learnerId === learner.id && m.sender === 'learner');
      const isUnlocked = hasSent || (learner.unlockedAchievements?.includes('trainer-connected') ?? false);
      return {
        isUnlocked,
        progressText: isUnlocked ? 'Connected with Trainer Kapil 💬' : 'Send a doubt in Trainer Chat',
        progressPercentage: isUnlocked ? 100 : 0,
        unlockedAt: isUnlocked ? 'Recently' : undefined,
      };
    },
  },
];

export function getLearnerAchievements(
  learner: Learner,
  messages: ChatMessage[] = []
): MilestoneAchievement[] {
  return MILESTONE_DEFINITIONS.map((def) => {
    const evalResult = def.evaluate(learner, messages);
    return {
      id: def.id,
      title: def.title,
      subtitle: def.subtitle,
      description: def.description,
      criteria: def.criteria,
      category: def.category,
      rarity: def.rarity,
      xpReward: def.xpReward,
      iconName: def.iconName,
      isUnlocked: evalResult.isUnlocked,
      unlockedAt: evalResult.unlockedAt,
      progressText: evalResult.progressText,
      progressPercentage: evalResult.progressPercentage,
    };
  });
}
