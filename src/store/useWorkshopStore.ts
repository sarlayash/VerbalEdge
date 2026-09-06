import { useState, useEffect, useCallback } from 'react';
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
  INITIAL_ASSIGNMENTS,
  INITIAL_CHALLENGES,
  INITIAL_LEARNERS,
  INITIAL_NOTIFICATIONS,
  INITIAL_MESSAGES,
} from '../data/initialData';
import { generateQrCode } from '../utils/qr';
import { sounds } from '../utils/audio';

const STORAGE_KEYS = {
  LEARNERS: 've_learners_v2',
  ACTIVE_LEARNER_ID: 've_active_learner_id_v2',
  ASSIGNMENTS: 've_assignments_v2',
  CHALLENGES: 've_challenges_v2',
  MESSAGES: 've_messages_v2',
  NOTIFICATIONS: 've_notifications_v2',
  ADMIN_AUTH: 've_admin_auth_v2',
};

export function useWorkshopStore() {
  const [learners, setLearners] = useState<Learner[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.LEARNERS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_LEARNERS;
  });

  const [activeLearnerId, setActiveLearnerId] = useState<string | null>(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.ACTIVE_LEARNER_ID) || null;
    } catch {}
    return null;
  });

  const [assignments, setAssignments] = useState<DayAssignment[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ASSIGNMENTS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_ASSIGNMENTS;
  });

  const [challenges, setChallenges] = useState<DayChallenge[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CHALLENGES);
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_CHALLENGES;
  });

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MESSAGES);
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_MESSAGES;
  });

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_NOTIFICATIONS;
  });

  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.ADMIN_AUTH) === 'true';
    } catch {}
    return false;
  });

  // Persist states
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.LEARNERS, JSON.stringify(learners));
    } catch {}
  }, [learners]);

  useEffect(() => {
    try {
      if (activeLearnerId) {
        localStorage.setItem(STORAGE_KEYS.ACTIVE_LEARNER_ID, activeLearnerId);
      } else {
        localStorage.removeItem(STORAGE_KEYS.ACTIVE_LEARNER_ID);
      }
    } catch {}
  }, [activeLearnerId]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(assignments));
    } catch {}
  }, [assignments]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CHALLENGES, JSON.stringify(challenges));
    } catch {}
  }, [challenges]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
    } catch {}
  }, [messages]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
    } catch {}
  }, [notifications]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ADMIN_AUTH, String(isAdminLoggedIn));
    } catch {}
  }, [isAdminLoggedIn]);

  const activeLearner = learners.find((l) => l.id === activeLearnerId) || null;

  // Start Journey: Enter Name -> Instant ID -> Dashboard
  const startLearnerJourney = useCallback(async (name: string) => {
    const trimmed = name.trim() || 'Learner';
    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const newId = `VE-2026-${randomCode}`;
    const todayStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    const newLearner: Learner = {
      id: newId,
      name: trimmed,
      joinedAt: todayStr,
      currentDay: 1,
      completedDays: [],
      progressPercentage: 0,
      xp: 100, // starting bonus
      streak: 1,
      dayStatus: {
        1: { assignmentViewed: false, challengeCompleted: false, score: 0, maxScore: 100, timeSpentSec: 0, badgeIssued: false, certificateIssued: false },
        2: { assignmentViewed: false, challengeCompleted: false, score: 0, maxScore: 100, timeSpentSec: 0, badgeIssued: false, certificateIssued: false },
        3: { assignmentViewed: false, challengeCompleted: false, score: 0, maxScore: 100, timeSpentSec: 0, badgeIssued: false, certificateIssued: false },
      },
      badges: [],
      certificates: [],
    };

    setLearners((prev) => [newLearner, ...prev]);
    setActiveLearnerId(newId);

    // Initial greeting message from Trainer Kapil
    const welcomeMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      learnerId: newId,
      sender: 'admin',
      text: `Hello ${trimmed}! I am Kapil Narula, your mentor for VerbalEdge. Welcome to the 3-Day Challenge. Dive into Day 1 Assignment and feel free to ping me anytime with questions!`,
      timestamp: 'Just now',
      read: false,
    };
    setMessages((prev) => [...prev, welcomeMsg]);

    sounds.playNotification();
    return newLearner;
  }, []);

  const logoutLearner = useCallback(() => {
    setActiveLearnerId(null);
  }, []);

  const adminLogin = useCallback((adminId: string, pass: string): boolean => {
    if (adminId.trim().toLowerCase() === 'kapiladmin' && pass === 'admin123') {
      setIsAdminLoggedIn(true);
      sounds.playSuccess();
      return true;
    }
    return false;
  }, []);

  const adminLogout = useCallback(() => {
    setIsAdminLoggedIn(false);
  }, []);

  const markAssignmentViewed = useCallback((learnerId: string, day: number) => {
    setLearners((prev) =>
      prev.map((l) => {
        if (l.id !== learnerId) return l;
        const current = l.dayStatus[day] || { assignmentViewed: false, challengeCompleted: false, score: 0, maxScore: 100, timeSpentSec: 0, badgeIssued: false, certificateIssued: false };
        if (current.assignmentViewed) return l;

        const updatedStatus = { ...l.dayStatus, [day]: { ...current, assignmentViewed: true } };
        // calculate progress
        const completedCount = l.completedDays.length;
        const newProgress = Math.min(100, Math.round(((completedCount * 2 + 1) / 6) * 100));

        return {
          ...l,
          progressPercentage: Math.max(l.progressPercentage, newProgress),
          xp: l.xp + 50,
          dayStatus: updatedStatus,
        };
      })
    );
  }, []);

  const completeDayForLearner = useCallback(
    async (
      learnerId: string,
      day: number,
      score: number,
      submissionText?: string,
      audioRecorded?: boolean,
      timeSpentSec?: number
    ) => {
      const learner = learners.find((l) => l.id === learnerId);
      if (!learner) return;

      const dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      const badgeId = `VE-BDG-D${day}-${Math.floor(1000 + Math.random() * 9000)}`;
      const certId = `VE-CRT-D${day}-${Math.floor(10000 + Math.random() * 90000)}`;

      const badgeTitles: Record<number, string> = {
        1: 'Day 1 Challenger',
        2: 'Day 2 Communicator',
        3: 'Day 3 Placement Warrior',
      };

      const certTitles: Record<number, string> = {
        1: 'Day 1 Verbal Foundations Certificate',
        2: 'Day 2 Corporate Communication Certificate',
        3: 'Day 3 Placement Interview Certificate',
      };

      const verificationOrigin = typeof window !== 'undefined' ? window.location.origin : '';
      const badgeVerifyUrl = `${verificationOrigin}?verify=${badgeId}`;
      const certVerifyUrl = `${verificationOrigin}?verify=${certId}`;

      const [badgeQr, certQr] = await Promise.all([
        generateQrCode(badgeVerifyUrl),
        generateQrCode(certVerifyUrl),
      ]);

      const newBadge: Badge = {
        badgeId,
        day,
        title: badgeTitles[day] || `Day ${day} Achiever`,
        learnerId,
        learnerName: learner.name,
        issuedDate: dateStr,
        verificationUrl: badgeVerifyUrl,
        qrCodeDataUrl: badgeQr,
        workshopName: 'VerbalEdge',
        trainer: 'Kapil Narula',
        isValid: true,
      };

      const newCert: Certificate = {
        certId,
        type: `day${day}` as any,
        title: certTitles[day] || `Day ${day} Certificate`,
        day,
        learnerId,
        learnerName: learner.name,
        issuedDate: dateStr,
        verificationUrl: certVerifyUrl,
        qrCodeDataUrl: certQr,
        workshopName: 'VerbalEdge',
        trainer: 'Kapil Narula',
        digitalSignature: 'Kapil Narula',
        theme: 'standard',
        score,
        daysCompleted: day,
        isValid: true,
      };

      let grandCert: Certificate | null = null;
      let grandBadge: Badge | null = null;

      // If Day 3 is completed, issue Grand Master Certificate (Gold Theme)
      const allCompletedDays = Array.from(new Set([...learner.completedDays, day]));
      if (allCompletedDays.includes(1) && allCompletedDays.includes(2) && allCompletedDays.includes(3)) {
        const grandCertId = `VE-CRT-GR-${Math.floor(10000 + Math.random() * 90000)}`;
        const grandVerifyUrl = `${verificationOrigin}?verify=${grandCertId}`;
        const grandQr = await generateQrCode(grandVerifyUrl);

        grandCert = {
          certId: grandCertId,
          type: 'grand',
          title: 'Grand Placement Readiness Master Certificate',
          day: 'grand',
          learnerId,
          learnerName: learner.name,
          issuedDate: dateStr,
          verificationUrl: grandVerifyUrl,
          qrCodeDataUrl: grandQr,
          workshopName: 'VerbalEdge',
          trainer: 'Kapil Narula',
          digitalSignature: 'Kapil Narula',
          theme: 'gold',
          score,
          daysCompleted: 3,
          isValid: true,
        };
      }

      setLearners((prev) =>
        prev.map((l) => {
          if (l.id !== learnerId) return l;
          const nextCompleted = Array.from(new Set([...l.completedDays, day]));
          const nextDay = Math.min(3, Math.max(l.currentDay, day + 1));
          const progress = Math.round((nextCompleted.length / 3) * 100);

          const actualTimeSpent = timeSpentSec || l.dayStatus[day]?.timeSpentSec || 120;

          const updatedDayStatus = {
            ...l.dayStatus,
            [day]: {
              ...l.dayStatus[day],
              challengeCompleted: true,
              assignmentViewed: true,
              score,
              timeSpentSec: actualTimeSpent,
              completedAt: dateStr,
              submissionText,
              audioRecorded,
              badgeIssued: true,
              badgeId,
              certificateIssued: true,
              certificateId: certId,
            },
          };

          // Check milestone achievements
          const newlyUnlocked: string[] = [];
          let bonusXp = 0;
          if (score === 100) {
            newlyUnlocked.push('perfect-score');
            bonusXp += 300;
          }
          if (actualTimeSpent <= 180) {
            newlyUnlocked.push('early-bird');
            bonusXp += 200;
          }
          if (actualTimeSpent <= 240 && score >= 70) {
            newlyUnlocked.push('speed-demon');
            bonusXp += 250;
          }
          if (day === 1) newlyUnlocked.push('day1-pioneer');
          if (day === 1 && score >= 90) {
            newlyUnlocked.push('grammar-titan');
            bonusXp += 150;
          }
          if (day === 2 && score >= 90) {
            newlyUnlocked.push('executive-articulator');
            bonusXp += 150;
          }
          if (day === 3 && audioRecorded) {
            newlyUnlocked.push('voice-of-authority');
            bonusXp += 200;
          }
          if (nextCompleted.length >= 3) {
            newlyUnlocked.push('grand-placement-warrior', 'streak-champion');
            bonusXp += 500;
          }

          const mergedAchievements = Array.from(
            new Set([...(l.unlockedAchievements || []), ...newlyUnlocked])
          );

          const badges = [...l.badges.filter((b) => b.day !== day), newBadge];
          const certs = [...l.certificates.filter((c) => c.day !== day), newCert];
          if (grandCert) {
            certs.push(grandCert);
          }

          return {
            ...l,
            completedDays: nextCompleted,
            currentDay: nextDay,
            progressPercentage: progress,
            xp: l.xp + 250 + (score >= 90 ? 100 : 50) + bonusXp,
            streak: Math.max(l.streak, nextCompleted.length),
            dayStatus: updatedDayStatus,
            badges,
            certificates: certs,
            unlockedAchievements: mergedAchievements,
          };
        })
      );

      // Notification
      const newNotif: AppNotification = {
        id: `notif-${Date.now()}`,
        targetLearnerId: learnerId,
        title: `Congratulations, ${learner.name}! 🏆`,
        message: `You earned the "${badgeTitles[day]}" Badge and your Day ${day} Verified Certificate!`,
        type: 'badge',
        timestamp: 'Just now',
        read: false,
      };
      setNotifications((prev) => [newNotif, ...prev]);

      if (grandCert) {
        sounds.playGrandFanfare();
      } else {
        sounds.playSuccess();
      }
    },
    [learners]
  );

  const sendChatMessage = useCallback(
    (learnerId: string, sender: 'learner' | 'admin', text: string, fileAttachment?: any) => {
      const newMsg: ChatMessage = {
        id: `msg-${Date.now()}`,
        learnerId,
        sender,
        text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        read: sender === 'learner' ? false : true,
        fileAttachment,
      };

      setMessages((prev) => [...prev, newMsg]);

      if (sender === 'learner') {
        sounds.playNotification();

        // Trainer Kapil automated quick feedback simulation if after 1.5 seconds
        setTimeout(() => {
          const replies = [
            `Thanks for asking! I have reviewed your submission. Keep up this momentum!`,
            `Excellent question. Focus on precise vocabulary and the STAR technique in your answer.`,
            `Checked! That is a great corporate phrasing approach. Keep practicing!`,
          ];
          const randomReply = replies[Math.floor(Math.random() * replies.length)];
          const trainerReply: ChatMessage = {
            id: `msg-${Date.now() + 1}`,
            learnerId,
            sender: 'admin',
            text: randomReply,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            read: false,
          };
          setMessages((m) => [...m, trainerReply]);
          sounds.playNotification();
        }, 1600);
      } else {
        sounds.playPop();
      }
    },
    []
  );

  const markMessagesAsRead = useCallback((learnerId: string, reader: 'learner' | 'admin') => {
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.learnerId === learnerId && msg.sender !== reader && !msg.read) {
          return { ...msg, read: true };
        }
        return msg;
      })
    );
  }, []);

  const sendBroadcastNotification = useCallback((title: string, message: string, type: any = 'announcement') => {
    const notif: AppNotification = {
      id: `notif-${Date.now()}`,
      title,
      message,
      type,
      timestamp: 'Just now',
      read: false,
    };
    setNotifications((prev) => [notif, ...prev]);
    sounds.playNotification();
  }, []);

  const adminEditLearnerName = useCallback((learnerId: string, newName: string) => {
    setLearners((prev) =>
      prev.map((l) => {
        if (l.id !== learnerId) return l;
        const badges = l.badges.map((b) => ({ ...b, learnerName: newName }));
        const certs = l.certificates.map((c) => ({ ...c, learnerName: newName }));
        return { ...l, name: newName, badges, certificates: certs };
      })
    );
  }, []);

  const adminResetLearnerJourney = useCallback((learnerId: string) => {
    setLearners((prev) =>
      prev.map((l) => {
        if (l.id !== learnerId) return l;
        return {
          ...l,
          currentDay: 1,
          completedDays: [],
          progressPercentage: 0,
          xp: 100,
          streak: 1,
          dayStatus: {
            1: { assignmentViewed: false, challengeCompleted: false, score: 0, maxScore: 100, timeSpentSec: 0, badgeIssued: false, certificateIssued: false },
            2: { assignmentViewed: false, challengeCompleted: false, score: 0, maxScore: 100, timeSpentSec: 0, badgeIssued: false, certificateIssued: false },
            3: { assignmentViewed: false, challengeCompleted: false, score: 0, maxScore: 100, timeSpentSec: 0, badgeIssued: false, certificateIssued: false },
          },
          badges: [],
          certificates: [],
        };
      })
    );
  }, []);

  const adminDeleteLearner = useCallback((learnerId: string) => {
    setLearners((prev) => prev.filter((l) => l.id !== learnerId));
    if (activeLearnerId === learnerId) {
      setActiveLearnerId(null);
    }
  }, [activeLearnerId]);

  const adminReissueBadge = useCallback(async (learnerId: string, day: number) => {
    const learner = learners.find((l) => l.id === learnerId);
    if (!learner) return;
    const dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const badgeId = `VE-BDG-D${day}-${Math.floor(1000 + Math.random() * 9000)}`;
    const verificationOrigin = typeof window !== 'undefined' ? window.location.origin : '';
    const badgeVerifyUrl = `${verificationOrigin}?verify=${badgeId}`;
    const badgeQr = await generateQrCode(badgeVerifyUrl);

    const badgeTitles: Record<number, string> = {
      1: 'Day 1 Challenger',
      2: 'Day 2 Communicator',
      3: 'Day 3 Placement Warrior',
    };

    const newBadge: Badge = {
      badgeId,
      day,
      title: badgeTitles[day] || `Day ${day} Achiever`,
      learnerId,
      learnerName: learner.name,
      issuedDate: dateStr,
      verificationUrl: badgeVerifyUrl,
      qrCodeDataUrl: badgeQr,
      workshopName: 'VerbalEdge',
      trainer: 'Kapil Narula',
      isValid: true,
    };

    setLearners((prev) =>
      prev.map((l) => {
        if (l.id !== learnerId) return l;
        return {
          ...l,
          badges: [...l.badges.filter((b) => b.day !== day), newBadge],
        };
      })
    );
  }, [learners]);

  const adminReissueCertificate = useCallback(async (learnerId: string, certId: string, newDate?: string) => {
    const dateStr = newDate || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    setLearners((prev) =>
      prev.map((l) => {
        if (l.id !== learnerId) return l;
        return {
          ...l,
          certificates: l.certificates.map((c) =>
            c.certId === certId ? { ...c, issuedDate: dateStr, isValid: true } : c
          ),
        };
      })
    );
  }, []);

  const adminInvalidateCredential = useCallback((credentialId: string) => {
    setLearners((prev) =>
      prev.map((l) => ({
        ...l,
        badges: l.badges.map((b) => (b.badgeId === credentialId ? { ...b, isValid: false } : b)),
        certificates: l.certificates.map((c) =>
          c.certId === credentialId ? { ...c, isValid: false } : c
        ),
      }))
    );
  }, []);

  const adminUpdateAssignment = useCallback((updated: DayAssignment) => {
    setAssignments((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
  }, []);

  const adminUpdateChallenge = useCallback((updated: DayChallenge) => {
    setChallenges((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
  }, []);

  const awardBonusXp = useCallback(
    (learnerId: string, xpAmount: number, reason: string) => {
      setLearners((prev) =>
        prev.map((l) => {
          if (l.id !== learnerId) return l;
          return {
            ...l,
            xp: l.xp + xpAmount,
          };
        })
      );
      const newNotif: AppNotification = {
        id: `notif-${Date.now()}`,
        targetLearnerId: learnerId,
        title: '🎡 Wheel Bonus Awarded!',
        message: `${reason} (+${xpAmount} XP)`,
        type: 'announcement',
        timestamp: 'Just now',
        read: false,
      };
      setNotifications((prev) => [newNotif, ...prev]);
    },
    []
  );

  // Credential lookup
  const findCredential = useCallback(
    (queryId: string) => {
      const q = queryId.trim();
      for (const learner of learners) {
        const cert = learner.certificates.find((c) => c.certId.toLowerCase() === q.toLowerCase());
        if (cert) return { type: 'certificate' as const, data: cert, learner };

        const badge = learner.badges.find((b) => b.badgeId.toLowerCase() === q.toLowerCase());
        if (badge) return { type: 'badge' as const, data: badge, learner };
      }
      return null;
    },
    [learners]
  );

  return {
    learners,
    activeLearner,
    activeLearnerId,
    assignments,
    challenges,
    messages,
    notifications,
    isAdminLoggedIn,
    startLearnerJourney,
    logoutLearner,
    adminLogin,
    adminLogout,
    markAssignmentViewed,
    completeDayForLearner,
    sendChatMessage,
    markMessagesAsRead,
    sendBroadcastNotification,
    adminEditLearnerName,
    adminResetLearnerJourney,
    adminDeleteLearner,
    adminReissueBadge,
    adminReissueCertificate,
    adminInvalidateCredential,
    adminUpdateAssignment,
    adminUpdateChallenge,
    awardBonusXp,
    findCredential,
    setActiveLearnerId,
  };
}
