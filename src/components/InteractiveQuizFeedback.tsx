import React from 'react';
import { CheckCircle2, XCircle, Lightbulb, BookOpen, Sparkles, ArrowRight } from 'lucide-react';
import { ChallengeQuestion } from '../types';

interface InteractiveQuizFeedbackProps {
  question: ChallengeQuestion;
  selectedOption: string | number | undefined;
  isCorrect: boolean;
  onNext?: () => void;
  onRetry?: () => void;
  showNextButton?: boolean;
}

export const InteractiveQuizFeedback: React.FC<InteractiveQuizFeedbackProps> = ({
  question,
  selectedOption,
  isCorrect,
  onNext,
  onRetry,
  showNextButton = false,
}) => {
  if (selectedOption === undefined) return null;

  const selectedStr = String(selectedOption);
  const correctStr = String(question.correctAnswer);
  
  // Specific explanation for the chosen option if available
  const specificOptionExplanation = question.optionExplanations?.[selectedStr];
  const correctOptionExplanation = question.optionExplanations?.[correctStr];

  return (
    <div
      id="quiz-immediate-feedback-panel"
      className={`mt-5 rounded-2xl p-5 border-2 transition-all duration-300 animate-in fade-in-50 slide-in-from-bottom-2 ${
        isCorrect
          ? 'bg-emerald-50/90 border-emerald-300 text-emerald-950 shadow-md shadow-emerald-500/10'
          : 'bg-rose-50/90 border-rose-300 text-rose-950 shadow-md shadow-rose-500/10'
      }`}
    >
      {/* Header Status Badge */}
      <div className="flex items-center justify-between pb-3 border-b border-current/15 mb-3.5">
        <div className="flex items-center gap-2.5">
          {isCorrect ? (
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <XCircle className="w-5 h-5" />
            </div>
          )}
          <div>
            <div className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
              {isCorrect ? (
                <>
                  <span className="text-emerald-700">Excellent! Correct Choice</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-200/80 text-emerald-800">
                    +10 XP
                  </span>
                </>
              ) : (
                <>
                  <span className="text-rose-700">Not Quite — Placement Learning Note</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-200/80 text-rose-800">
                    Review Rationale
                  </span>
                </>
              )}
            </div>
            <p className="text-[11px] opacity-80 mt-0.5">
              {isCorrect
                ? 'Your reasoning matches the exact corporate placement criteria.'
                : 'Understanding why this option is misleading will prevent errors in aptitude exams.'}
            </p>
          </div>
        </div>

        {onRetry && !isCorrect && (
          <button
            id="btn-retry-option"
            onClick={onRetry}
            className="px-3 py-1.5 rounded-lg bg-rose-200/80 hover:bg-rose-200 text-rose-900 text-xs font-bold transition shrink-0"
          >
            Try Another Choice
          </button>
        )}
      </div>

      {/* Rationale for the chosen option */}
      <div className="space-y-3 text-xs leading-relaxed">
        {specificOptionExplanation && (
          <div className="p-3 rounded-xl bg-white/70 backdrop-blur-sm border border-current/10">
            <span className="font-bold block uppercase tracking-wider text-[10px] opacity-75 mb-1 flex items-center gap-1">
              <Lightbulb className="w-3.5 h-3.5" />
              Analysis of Your Selection:
            </span>
            <p className="font-medium">{specificOptionExplanation}</p>
          </div>
        )}

        {/* If incorrect, explicitly reveal why the correct answer is right */}
        {!isCorrect && question.correctAnswer && (
          <div className="p-3 rounded-xl bg-white/90 border border-emerald-300 text-emerald-950">
            <span className="font-bold block uppercase tracking-wider text-[10px] text-emerald-700 mb-1 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Why "{correctStr}" is the Correct Answer:
            </span>
            <p className="font-medium text-emerald-900">
              {correctOptionExplanation || question.explanation}
            </p>
          </div>
        )}

        {/* Kapil's Placement Mentor Rule & Context */}
        {question.ruleReference && (
          <div className="p-3 rounded-xl bg-indigo-900 text-indigo-50 border border-indigo-700 shadow-sm">
            <span className="font-bold block uppercase tracking-wider text-[10px] text-indigo-300 mb-1 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
              Mentor Rule by Kapil Narula:
            </span>
            <p className="text-[11px] leading-relaxed text-indigo-100 font-sans">
              {question.ruleReference}
            </p>
          </div>
        )}

        {/* Fallback general explanation if no specific explanations were set */}
        {!specificOptionExplanation && question.explanation && (
          <div className="p-3 rounded-xl bg-white/70 border border-current/10">
            <span className="font-bold block uppercase tracking-wider text-[10px] opacity-75 mb-1">
              Mentor Explanation:
            </span>
            <p className="font-medium">{question.explanation}</p>
          </div>
        )}
      </div>

      {showNextButton && onNext && (
        <div className="mt-4 pt-3 border-t border-current/15 flex justify-end">
          <button
            id="btn-feedback-next"
            onClick={onNext}
            className={`px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition ${
              isCorrect
                ? 'bg-emerald-700 text-white hover:bg-emerald-800'
                : 'bg-slate-900 text-white hover:bg-slate-800'
            }`}
          >
            <span>Proceed Forward</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
