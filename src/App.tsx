import React, { useState, useEffect } from 'react';
import { useWorkshopStore } from './store/useWorkshopStore';
import { LandingPage } from './components/LandingPage';
import { LearnerDashboard } from './components/LearnerDashboard';
import { AdminPortal } from './components/AdminPortal';
import { VerificationView } from './components/VerificationView';

export default function App() {
  const {
    learners,
    activeLearner,
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
    findCredential,
    awardBonusXp,
  } = useWorkshopStore();

  // Navigation mode: 'app' | 'admin' | 'verify'
  const [viewMode, setViewMode] = useState<'app' | 'admin' | 'verify'>('app');
  const [verifyId, setVerifyId] = useState<string>('');

  // Handle URL params and popstate for /admin and ?verify=ID
  useEffect(() => {
    const handleUrlChange = () => {
      const url = new URL(window.location.href);
      const verifyParam = url.searchParams.get('verify');
      const adminParam = url.searchParams.get('admin');
      const path = url.pathname;

      if (verifyParam) {
        setVerifyId(verifyParam);
        setViewMode('verify');
      } else if (adminParam === 'true' || path === '/admin' || path.endsWith('/admin')) {
        setViewMode('admin');
      } else {
        setViewMode('app');
      }
    };

    handleUrlChange();
    window.addEventListener('popstate', handleUrlChange);
    return () => window.removeEventListener('popstate', handleUrlChange);
  }, []);

  // Keyboard shortcut (Alt+A or Ctrl+Shift+A) to access hidden admin panel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey && e.shiftKey && e.key === 'A') || (e.altKey && (e.key === 'a' || e.key === 'A'))) {
        e.preventDefault();
        setViewMode((prev) => (prev === 'admin' ? 'app' : 'admin'));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleOpenVerify = (id: string) => {
    setVerifyId(id);
    setViewMode('verify');
    const url = new URL(window.location.href);
    url.searchParams.set('verify', id);
    window.history.pushState({}, '', url.toString());
  };

  const handleOpenAdmin = () => {
    setViewMode('admin');
    const url = new URL(window.location.href);
    url.searchParams.delete('verify');
    url.searchParams.set('admin', 'true');
    window.history.pushState({}, '', url.toString());
  };

  const handleBackToApp = () => {
    setViewMode('app');
    const url = new URL(window.location.href);
    url.searchParams.delete('verify');
    url.searchParams.delete('admin');
    window.history.pushState({}, '', url.pathname);
  };

  // 1. Verification View
  if (viewMode === 'verify') {
    return (
      <VerificationView
        credentialId={verifyId}
        onBack={handleBackToApp}
        findCredential={findCredential}
      />
    );
  }

  // 2. Admin Portal View
  if (viewMode === 'admin') {
    return (
      <AdminPortal
        learners={learners}
        assignments={assignments}
        challenges={challenges}
        messages={messages}
        notifications={notifications}
        onLogin={adminLogin}
        onLogout={adminLogout}
        isAdminLoggedIn={isAdminLoggedIn}
        onEditLearnerName={adminEditLearnerName}
        onResetLearnerJourney={adminResetLearnerJourney}
        onDeleteLearner={adminDeleteLearner}
        onCompleteDayManually={(learnerId, day, score) =>
          completeDayForLearner(learnerId, day, score)
        }
        onReissueBadge={adminReissueBadge}
        onReissueCertificate={adminReissueCertificate}
        onInvalidateCredential={adminInvalidateCredential}
        onUpdateAssignment={adminUpdateAssignment}
        onUpdateChallenge={adminUpdateChallenge}
        onSendMessage={sendChatMessage}
        onMarkMessagesRead={markMessagesAsRead}
        onSendBroadcast={sendBroadcastNotification}
        onOpenVerify={handleOpenVerify}
        onCloseAdmin={handleBackToApp}
      />
    );
  }

  // 3. Learner View: If Learner is active, show Learner Dashboard
  if (activeLearner) {
    return (
      <LearnerDashboard
        learner={activeLearner}
        assignments={assignments}
        challenges={challenges}
        messages={messages}
        notifications={notifications}
        learnersLeaderboard={learners}
        onMarkAssignmentViewed={markAssignmentViewed}
        onCompleteDay={completeDayForLearner}
        onSendMessage={sendChatMessage}
        onMarkMessagesRead={markMessagesAsRead}
        onOpenVerify={handleOpenVerify}
        onLogout={logoutLearner}
        onAwardBonusXp={awardBonusXp}
      />
    );
  }

  // 4. Default: Landing Page (PRD Page 4: Enter Name -> Start Journey)
  return (
    <LandingPage
      onStartJourney={startLearnerJourney}
      onOpenAdmin={handleOpenAdmin}
      onOpenVerify={handleOpenVerify}
    />
  );
}
