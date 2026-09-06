export type CredentialType = 'day1' | 'day2' | 'day3' | 'grand';

export type AchievementRarity = 'Common' | 'Rare' | 'Epic' | 'Legendary';
export type AchievementCategory = 'All' | 'Performance' | 'Speed' | 'Mastery' | 'Consistency';

export interface MilestoneAchievement {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  criteria: string;
  category: 'Performance' | 'Speed' | 'Mastery' | 'Consistency';
  rarity: AchievementRarity;
  xpReward: number;
  iconName: string;
  isUnlocked: boolean;
  unlockedAt?: string;
  progressText: string;
  progressPercentage: number;
}

export interface Badge {
  badgeId: string;
  day: number;
  title: string;
  learnerId: string;
  learnerName: string;
  issuedDate: string;
  verificationUrl: string;
  qrCodeDataUrl: string;
  workshopName: string;
  trainer: string;
  isValid: boolean;
}

export interface Certificate {
  certId: string;
  type: CredentialType;
  title: string;
  day: number | 'grand';
  learnerId: string;
  learnerName: string;
  issuedDate: string;
  verificationUrl: string;
  qrCodeDataUrl: string;
  workshopName: string;
  trainer: string;
  digitalSignature: string;
  theme: 'standard' | 'gold';
  score?: number;
  daysCompleted: number;
  isValid: boolean;
}

export interface DayAssignment {
  id: string;
  day: number;
  title: string;
  subtitle: string;
  description: string;
  published: boolean;
  scheduledDate?: string;
  content: {
    overview: string;
    keyTakeaways: string[];
    videoUrl?: string;
    pdfDownloadUrl?: string;
    pdfTitle?: string;
    readingMaterial: string;
    resourceLinks: { title: string; url: string; type: 'doc' | 'video' | 'practice' }[];
  };
}

export interface ChallengeQuestion {
  id: string;
  type: 'mcq' | 'typing' | 'sentence_correction' | 'vocabulary' | 'speaking' | 'paragraph';
  question: string;
  instructions?: string;
  options?: string[];
  correctAnswer?: string | number;
  explanation?: string;
  optionExplanations?: Record<string, string>;
  ruleReference?: string;
  targetTypingText?: string;
  speakingPrompt?: string;
}

export interface WheelSector {
  id: string;
  label: string;
  sublabel: string;
  category: 'Grammar' | 'Corporate' | 'Vocabulary' | 'Interview' | 'BonusXP' | 'Multiplier';
  color: string;
  accentColor: string;
  textColor: string;
  iconName: string;
  xpValue?: number;
  multiplier?: number;
  question?: ChallengeQuestion;
}

export interface DayChallenge {
  id: string;
  day: number;
  title: string;
  timeLimitMinutes: number;
  passingScore: number;
  questions: ChallengeQuestion[];
}

export interface LearnerDayStatus {
  assignmentViewed: boolean;
  challengeCompleted: boolean;
  score: number;
  maxScore: number;
  timeSpentSec: number;
  completedAt?: string;
  submissionText?: string;
  audioRecorded?: boolean;
  badgeIssued: boolean;
  badgeId?: string;
  certificateIssued: boolean;
  certificateId?: string;
}

export interface ChatMessage {
  id: string;
  learnerId: string;
  sender: 'learner' | 'admin';
  text: string;
  timestamp: string;
  read: boolean;
  fileAttachment?: {
    name: string;
    type: 'image' | 'file';
    url: string;
  };
}

export interface AppNotification {
  id: string;
  targetLearnerId?: string; // empty means broadcast to all
  title: string;
  message: string;
  type: 'announcement' | 'urgent' | 'reminder' | 'badge' | 'certificate';
  timestamp: string;
  read: boolean;
}

export interface Learner {
  id: string;
  name: string;
  joinedAt: string;
  currentDay: number;
  completedDays: number[];
  progressPercentage: number;
  xp: number;
  streak: number;
  dayStatus: Record<number, LearnerDayStatus>;
  badges: Badge[];
  certificates: Certificate[];
  unlockedAchievements?: string[];
  isArchived?: boolean;
}
