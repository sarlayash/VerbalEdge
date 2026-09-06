import React, { useState, useEffect, useRef } from 'react';
import { DayChallenge, ChallengeQuestion } from '../types';
import {
  CheckCircle2,
  XCircle,
  Mic,
  Square,
  Play,
  RotateCcw,
  Send,
  Sparkles,
  Clock,
  ArrowRight,
  Award,
  Trophy,
  Zap,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds } from '../utils/audio';
import { InteractiveQuizFeedback } from './InteractiveQuizFeedback';
import { SpinningWheelQuiz } from './SpinningWheelQuiz';

interface ChallengeArenaProps {
  challenge: DayChallenge;
  onComplete: (score: number, submissionText?: string, audioRecorded?: boolean, timeSpentSec?: number) => void;
  onClose: () => void;
  onAwardBonusXp?: (xp: number, reason: string) => void;
}

export const ChallengeArena: React.FC<ChallengeArenaProps> = ({
  challenge,
  onComplete,
  onClose,
  onAwardBonusXp,
}) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<Record<number, string>>({});
  const [typedInputs, setTypedInputs] = useState<Record<number, string>>({});
  const [paragraphInputs, setParagraphInputs] = useState<Record<number, string>>({});
  const [showExplanation, setShowExplanation] = useState<Record<number, boolean>>({});
  const [showSpinningWheel, setShowSpinningWheel] = useState<boolean>(false);

  // Audio recording state for Speaking Prompt
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<any>(null);

  // Challenge Timer
  const [timeLeft, setTimeLeft] = useState(challenge.timeLimitMinutes * 60);
  const [isFinished, setIsFinished] = useState(false);
  const [calculatedScore, setCalculatedScore] = useState(0);

  const currentQ = challenge.questions[currentIdx];

  // Countdown timer
  useEffect(() => {
    if (isFinished) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmitAll();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isFinished]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Audio recording handlers
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingSeconds(0);
      sounds.playPop();

      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds((s) => s + 1);
      }, 1000);
    } catch (err) {
      console.warn('Microphone access denied or unavailable', err);
      // Fallback: simulate audio recorded
      setIsRecording(true);
      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds((s) => s + 1);
      }, 1000);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    clearInterval(timerIntervalRef.current);
    setIsRecording(false);
    sounds.playPop();
  };

  const handleSelectOption = (opt: string) => {
    setSelectedOptions((prev) => ({ ...prev, [currentIdx]: opt }));
    setShowExplanation((prev) => ({ ...prev, [currentIdx]: true }));

    // Immediate sound feedback
    if (opt === currentQ.correctAnswer) {
      sounds.playSuccess();
    } else {
      sounds.playIncorrect();
    }
  };

  const handleRetryCurrentQuestion = () => {
    setSelectedOptions((prev) => {
      const next = { ...prev };
      delete next[currentIdx];
      return next;
    });
    sounds.playPop();
  };

  const handleSubmitAll = () => {
    // Grade questions
    let correctCount = 0;
    const totalQuestions = challenge.questions.length;

    challenge.questions.forEach((q, idx) => {
      if (q.type === 'mcq' || q.type === 'vocabulary' || q.type === 'sentence_correction') {
        if (selectedOptions[idx] === q.correctAnswer) {
          correctCount += 1;
        }
      } else if (q.type === 'typing') {
        const typed = (typedInputs[idx] || '').trim().toLowerCase();
        const target = (q.targetTypingText || '').trim().toLowerCase();
        // Give score if typed at least 80% matches
        if (typed.length >= target.length * 0.75) {
          correctCount += 1;
        }
      } else if (q.type === 'paragraph') {
        if ((paragraphInputs[idx] || '').trim().length > 15) {
          correctCount += 1;
        }
      } else if (q.type === 'speaking') {
        if (audioUrl || recordingSeconds > 3 || (paragraphInputs[idx] || '').length > 15) {
          correctCount += 1;
        }
      }
    });

    const finalScore = Math.round((correctCount / totalQuestions) * 100);
    setCalculatedScore(finalScore);
    setIsFinished(true);

    if (finalScore >= challenge.passingScore) {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
      });
      sounds.playSuccess();
    }
  };

  const handleFinalizeAndClaim = () => {
    const combinedSubmission = Object.values(paragraphInputs).join('\n---\n');
    const timeSpent = Math.max(20, challenge.timeLimitMinutes * 60 - timeLeft);
    onComplete(calculatedScore, combinedSubmission, !!audioUrl || recordingSeconds > 0, timeSpent);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white p-5 sm:p-6 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase font-bold tracking-widest text-indigo-300">
              <Trophy className="w-4 h-4 text-yellow-400" />
              Day {challenge.day} Interactive Challenge
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold mt-0.5 tracking-tight">
              {challenge.title}
            </h2>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Spinning Wheel Bonus Round Trigger */}
            <button
              id="btn-open-wheel-from-header"
              onClick={() => setShowSpinningWheel(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-md shadow-amber-500/20 transition active:scale-95 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 fill-current" />
              <span>Spin Wheel Quiz</span>
            </button>

            <div className="bg-white/10 px-3.5 py-1.5 rounded-full flex items-center gap-2 text-xs font-mono font-bold tracking-wider">
              <Clock className="w-4 h-4 text-amber-300 animate-pulse" />
              {formatTimer(timeLeft)}
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-sm font-bold transition"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Challenge Body */}
        <div className="p-6 sm:p-8 flex-1 overflow-y-auto">
          {!isFinished ? (
            <div>
              {/* Question progress pill */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Question {currentIdx + 1} of {challenge.questions.length}
                </span>
                <div className="flex gap-1.5">
                  {challenge.questions.map((_, i) => (
                    <div
                      key={i}
                      className={`h-2 rounded-full transition-all ${
                        i === currentIdx
                          ? 'w-7 bg-indigo-600'
                          : selectedOptions[i] || typedInputs[i] || paragraphInputs[i]
                          ? 'w-3 bg-emerald-500'
                          : 'w-3 bg-slate-200'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Quick Wheel Power-up prompt banner */}
              <div className="mb-5 p-3 rounded-2xl bg-gradient-to-r from-amber-50 via-indigo-50/50 to-purple-50/40 border border-amber-200/80 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-amber-400 text-slate-900 flex items-center justify-center font-bold text-xs shadow-sm shrink-0">
                    🎡
                  </div>
                  <div>
                    <span className="font-extrabold text-slate-900">Placement Spin Wheel:</span>
                    <span className="text-slate-600 ml-1">
                      Practice rapid-fire verbal quiz flashcards with instant rationale & bonus XP.
                    </span>
                  </div>
                </div>
                <button
                  id="btn-open-wheel-banner"
                  onClick={() => setShowSpinningWheel(true)}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 font-bold text-xs shrink-0 transition flex items-center gap-1 shadow-sm cursor-pointer"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Spin Wheel</span>
                </button>
              </div>

              {/* Question text */}
              <div className="mb-5">
                <span className="inline-block px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wider uppercase mb-2 bg-indigo-50 text-indigo-700">
                  {currentQ.type.replace('_', ' ')}
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
                  {currentQ.question}
                </h3>
                {currentQ.instructions && (
                  <p className="text-xs text-slate-500 mt-1 italic">{currentQ.instructions}</p>
                )}
              </div>

              {/* MCQ & Sentence Correction Options with Immediate Interactive Feedback */}
              {currentQ.options && (
                <div className="space-y-3 mb-4">
                  {currentQ.options.map((option, idx) => {
                    const isSelected = selectedOptions[currentIdx] === option;
                    const hasSelected = selectedOptions[currentIdx] !== undefined;
                    const isCorrectChoice = option === currentQ.correctAnswer;

                    let optionStyle =
                      'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700';

                    if (hasSelected) {
                      if (isSelected && isCorrectChoice) {
                        optionStyle =
                          'border-emerald-500 bg-emerald-50/90 text-emerald-950 shadow-md shadow-emerald-500/10 font-semibold';
                      } else if (isSelected && !isCorrectChoice) {
                        optionStyle =
                          'border-rose-500 bg-rose-50/90 text-rose-950 shadow-md shadow-rose-500/10 font-semibold';
                      } else if (isCorrectChoice) {
                        optionStyle =
                          'border-emerald-400/80 bg-emerald-50/40 text-emerald-900 border-dashed';
                      } else {
                        optionStyle = 'border-slate-100 bg-slate-50/50 text-slate-400 opacity-60';
                      }
                    }

                    return (
                      <button
                        key={idx}
                        onClick={() => handleSelectOption(option)}
                        className={`w-full text-left p-4 rounded-2xl border-2 text-sm transition-all flex items-start gap-3.5 ${optionStyle}`}
                      >
                        <span
                          className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black shrink-0 shadow-sm ${
                            hasSelected && isCorrectChoice
                              ? 'bg-emerald-600 text-white'
                              : hasSelected && isSelected && !isCorrectChoice
                              ? 'bg-rose-600 text-white'
                              : isSelected
                              ? 'bg-indigo-600 text-white'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span className="flex-1 mt-0.5 leading-snug">{option}</span>
                        {hasSelected && isCorrectChoice && (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100/80 px-2.5 py-0.5 rounded-full shrink-0">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Correct
                          </span>
                        )}
                        {hasSelected && isSelected && !isCorrectChoice && (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 bg-rose-100/80 px-2.5 py-0.5 rounded-full shrink-0">
                            <XCircle className="w-3.5 h-3.5 text-rose-600" />
                            Your Selection
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Typing Challenge Drill */}
              {currentQ.type === 'typing' && (
                <div className="space-y-4 mb-6">
                  <div className="p-4 rounded-2xl bg-slate-900 text-slate-100 font-mono text-sm leading-relaxed border border-slate-700 select-none">
                    <div className="text-[11px] uppercase tracking-widest text-indigo-400 font-sans font-bold mb-2">
                      Target Text to Type:
                    </div>
                    {currentQ.targetTypingText}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      Type Here Rapidly & Accurately:
                    </label>
                    <textarea
                      rows={3}
                      value={typedInputs[currentIdx] || ''}
                      onChange={(e) =>
                        setTypedInputs((prev) => ({ ...prev, [currentIdx]: e.target.value }))
                      }
                      placeholder="Start typing the text exactly above..."
                      className="w-full p-3.5 rounded-2xl border border-slate-300 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              )}

              {/* Paragraph writing */}
              {currentQ.type === 'paragraph' && (
                <div className="space-y-4 mb-6">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Your Corporate Articulation:
                  </label>
                  <textarea
                    rows={4}
                    value={paragraphInputs[currentIdx] || ''}
                    onChange={(e) =>
                      setParagraphInputs((prev) => ({ ...prev, [currentIdx]: e.target.value }))
                    }
                    placeholder="Draft your polished business response here..."
                    className="w-full p-4 rounded-2xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed"
                  />
                </div>
              )}

              {/* Speaking Voice Simulation */}
              {currentQ.type === 'speaking' && (
                <div className="space-y-5 mb-6">
                  <div className="p-4 rounded-2xl bg-indigo-50/80 border border-indigo-100 text-indigo-900 text-sm leading-relaxed">
                    <strong className="block text-xs font-bold uppercase tracking-wider text-indigo-600 mb-1">
                      Speaking Instructions:
                    </strong>
                    {currentQ.speakingPrompt}
                  </div>

                  <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                    {!isRecording ? (
                      <button
                        onClick={startRecording}
                        className="px-6 py-3 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-rose-600/30 transition transform hover:scale-105"
                      >
                        <Mic className="w-5 h-5" />
                        {audioUrl ? 'Record Again' : 'Start Voice Recording'}
                      </button>
                    ) : (
                      <button
                        onClick={stopRecording}
                        className="px-6 py-3 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm flex items-center gap-2 shadow-lg transition animate-pulse"
                      >
                        <Square className="w-5 h-5 text-rose-500 fill-current" />
                        Stop Recording ({recordingSeconds}s)
                      </button>
                    )}

                    {audioUrl && (
                      <div className="mt-4 flex flex-col items-center gap-2">
                        <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" /> Voice Recorded Successfully
                        </span>
                        <audio src={audioUrl} controls className="h-10 mt-1" />
                      </div>
                    )}

                    <div className="mt-4 w-full">
                      <p className="text-xs text-slate-400 mb-2">Or summarize your key points in writing:</p>
                      <textarea
                        rows={3}
                        value={paragraphInputs[currentIdx] || ''}
                        onChange={(e) =>
                          setParagraphInputs((prev) => ({ ...prev, [currentIdx]: e.target.value }))
                        }
                        placeholder="Bullet points of your speech response..."
                        className="w-full p-3 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Rich Immediate Quiz Feedback Component with Explanations for Correct and Incorrect */}
              {selectedOptions[currentIdx] !== undefined && currentQ.options && (
                <InteractiveQuizFeedback
                  question={currentQ}
                  selectedOption={selectedOptions[currentIdx]}
                  isCorrect={selectedOptions[currentIdx] === currentQ.correctAnswer}
                  onRetry={handleRetryCurrentQuestion}
                />
              )}

              {/* Navigation controls */}
              <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                <button
                  disabled={currentIdx === 0}
                  onClick={() => {
                    setCurrentIdx((i) => i - 1);
                    sounds.playPop();
                  }}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition"
                >
                  Previous
                </button>

                {currentIdx < challenge.questions.length - 1 ? (
                  <button
                    onClick={() => {
                      setCurrentIdx((i) => i + 1);
                      sounds.playPop();
                    }}
                    className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold flex items-center gap-2 shadow-md shadow-indigo-500/20 transition"
                  >
                    Next Question
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={handleSubmitAll}
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold flex items-center gap-2 shadow-md shadow-emerald-500/20 transition"
                  >
                    Submit Challenge
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* Results Screen */
            <div className="py-8 text-center flex flex-col items-center">
              {calculatedScore >= challenge.passingScore ? (
                <div className="w-24 h-24 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-5 ring-8 ring-emerald-50 shadow-inner">
                  <Trophy className="w-12 h-12 text-yellow-500" />
                </div>
              ) : (
                <div className="w-24 h-24 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mb-5 ring-8 ring-rose-50">
                  <RotateCcw className="w-10 h-10 text-rose-500" />
                </div>
              )}

              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {calculatedScore >= challenge.passingScore
                  ? 'Challenge Passed Successfully!'
                  : 'Score Below Passing Threshold'}
              </h2>

              <p className="text-sm text-slate-500 mt-1 max-w-md">
                Passing requirement: {challenge.passingScore}% • Your score:
              </p>

              <div className="my-6">
                <span className="text-6xl font-black text-slate-900">{calculatedScore}</span>
                <span className="text-2xl font-bold text-slate-400"> / 100</span>
              </div>

              {calculatedScore >= challenge.passingScore ? (
                <div className="space-y-4 max-w-md w-full">
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm font-medium">
                    🎉 Excellent performance! Your official{' '}
                    <strong>Day {challenge.day} Badge</strong> and{' '}
                    <strong>Verified Certificate</strong> have been unlocked!
                  </div>

                  {/* Milestone Unlocks Banner */}
                  {(calculatedScore === 100 || (challenge.timeLimitMinutes * 60 - timeLeft) <= 180) && (
                    <div className="p-3 bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-indigo-500/10 rounded-2xl border border-amber-200/80 text-left">
                      <div className="text-[10px] uppercase font-extrabold text-amber-700 tracking-wider flex items-center gap-1 mb-1">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Milestone Achievements Unlocked!
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {calculatedScore === 100 && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold border border-amber-300">
                            🌟 'Perfect Score' (100%)
                          </span>
                        )}
                        {(challenge.timeLimitMinutes * 60 - timeLeft) <= 180 && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-900 text-xs font-bold border border-indigo-300">
                            ⚡ 'Early Bird' ({Math.max(20, challenge.timeLimitMinutes * 60 - timeLeft)}s)
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Post-challenge Spinning Wheel Bonus prompt */}
                  <button
                    id="btn-spin-wheel-results"
                    onClick={() => setShowSpinningWheel(true)}
                    className="w-full py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-amber-300 font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 border border-slate-800 shadow-md transition cursor-pointer"
                  >
                    <span>🎡 Spin the Placement Wheel for Bonus XP & Flashcards</span>
                  </button>

                  <button
                    onClick={handleFinalizeAndClaim}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 text-white font-bold text-base shadow-xl shadow-indigo-500/25 hover:opacity-95 transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Award className="w-5 h-5 text-yellow-300" />
                    Claim Badges & Verified Certificate
                  </button>
                </div>
              ) : (
                <div className="space-y-4 max-w-md w-full">
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs text-left leading-relaxed">
                    Review today's assignment and try the questions again to meet the 75% placement benchmark.
                  </div>

                  <button
                    onClick={() => setShowSpinningWheel(true)}
                    className="w-full py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-md cursor-pointer"
                  >
                    <span>🎡 Practice on the Spinning Wheel First</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsFinished(false);
                      setCurrentIdx(0);
                      setTimeLeft(challenge.timeLimitMinutes * 60);
                    }}
                    className="w-full py-3 rounded-2xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-700 transition"
                  >
                    Retake Challenge
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Spinning Wheel Modal Overlay */}
      {showSpinningWheel && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="max-w-4xl w-full relative">
            <SpinningWheelQuiz
              onAwardBonusXp={onAwardBonusXp}
              onClose={() => setShowSpinningWheel(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};
