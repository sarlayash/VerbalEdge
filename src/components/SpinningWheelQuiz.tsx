import React, { useState, useRef, useEffect } from 'react';
import {
  RotateCcw,
  Sparkles,
  Trophy,
  Zap,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  BookOpen,
  Send,
  Target,
  Flame,
  X,
  Volume2,
  VolumeX,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { WheelSector, ChallengeQuestion } from '../types';
import { WHEEL_SECTORS } from '../data/wheelQuizData';
import { InteractiveQuizFeedback } from './InteractiveQuizFeedback';
import { sounds } from '../utils/audio';

interface SpinningWheelQuizProps {
  onAwardBonusXp?: (xp: number, reason: string) => void;
  onClose?: () => void;
  standalone?: boolean;
}

export const SpinningWheelQuiz: React.FC<SpinningWheelQuizProps> = ({
  onAwardBonusXp,
  onClose,
  standalone = false,
}) => {
  const [rotation, setRotation] = useState<number>(0);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [selectedSector, setSelectedSector] = useState<WheelSector | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | number | undefined>(undefined);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [multiplier, setMultiplier] = useState<number>(1);
  const [totalXpEarned, setTotalXpEarned] = useState<number>(0);
  const [quizScore, setQuizScore] = useState<{ answered: number; correct: number }>({
    answered: 0,
    correct: 0,
  });
  const [showQuestionModal, setShowQuestionModal] = useState<boolean>(false);
  const [spinHistory, setSpinHistory] = useState<string[]>([]);
  const [bonusClaimed, setBonusClaimed] = useState<boolean>(false);

  const wheelRef = useRef<SVGSVGElement>(null);
  const audioIntervalRef = useRef<any>(null);

  const numSectors = WHEEL_SECTORS.length;
  const arcDegree = 360 / numSectors; // 45 degrees per sector

  // Cleanup audio interval on unmount
  useEffect(() => {
    return () => {
      if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
    };
  }, []);

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#4F46E5', '#059669', '#EAB308', '#DB2777', '#0284C7'],
      });
    } catch {
      // Fallback if canvas-confetti is not loaded
    }
  };

  const handleSpin = () => {
    if (isSpinning) return;

    setIsSpinning(true);
    setShowQuestionModal(false);
    setSelectedSector(null);
    setSelectedOption(undefined);
    setBonusClaimed(false);

    // Pick a random sector (0 to numSectors - 1)
    const targetSectorIndex = Math.floor(Math.random() * numSectors);

    // Pointer is positioned at the top (270 degrees in SVG coordinate space or -90 deg from 0)
    // To land targetSectorIndex at the top pointer (index 0 at top):
    // Center of sector i is at i * 45 + 22.5 degrees.
    // When wheel rotates clockwise by R degrees, the sector at the pointer is:
    // (360 - (R % 360) + 270) % 360 / 45 ...
    // Let's compute exact target rotation:
    const minSpins = 6;
    const extraSpins = Math.floor(Math.random() * 3);
    const totalSpins = minSpins + extraSpins;
    
    // Sector center offset
    const sectorCenter = targetSectorIndex * arcDegree + arcDegree / 2;
    // We want this sectorCenter to align with the top pointer (at 270 degrees in SVG circle or 90 deg counter-clockwise)
    const targetAngle = (360 - sectorCenter + 270) % 360;
    
    // Ensure we always spin forward past the current rotation
    const baseRotation = Math.ceil(rotation / 360) * 360;
    const finalRotation = baseRotation + totalSpins * 360 + targetAngle;

    // Simulate clicking sound while spinning
    if (soundEnabled) {
      let tickCount = 0;
      const maxTicks = 45;
      audioIntervalRef.current = setInterval(() => {
        sounds.playWheelTick();
        tickCount += 1;
        if (tickCount >= maxTicks) {
          clearInterval(audioIntervalRef.current);
        }
      }, 90);
    }

    setRotation(finalRotation);

    // Wait for the 4.5s transition to finish
    setTimeout(() => {
      setIsSpinning(false);
      if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);

      const landed = WHEEL_SECTORS[targetSectorIndex];
      setSelectedSector(landed);
      setSpinHistory((prev) => [landed.label, ...prev.slice(0, 4)]);

      if (landed.category === 'Multiplier' && landed.multiplier) {
        setMultiplier(landed.multiplier);
        sounds.playGrandFanfare();
        triggerConfetti();
      } else if (landed.category === 'BonusXP' && landed.xpValue) {
        const xpToAdd = landed.xpValue * multiplier;
        setTotalXpEarned((x) => x + xpToAdd);
        if (onAwardBonusXp) {
          onAwardBonusXp(xpToAdd, `Spinning Wheel Jackpot (+${xpToAdd} XP)`);
        }
        sounds.playGrandFanfare();
        triggerConfetti();
      } else {
        sounds.playSuccess();
      }

      setShowQuestionModal(true);
    }, 4600);
  };

  const handleSelectQuizOption = (option: string) => {
    if (selectedOption !== undefined) return; // already selected
    setSelectedOption(option);

    if (!selectedSector?.question) return;

    const isCorrect = option === selectedSector.question.correctAnswer;
    if (isCorrect) {
      sounds.playSuccess();
      triggerConfetti();
      const baseXP = selectedSector.xpValue || 50;
      const awarded = baseXP * multiplier;
      setTotalXpEarned((x) => x + awarded);
      setQuizScore((s) => ({ answered: s.answered + 1, correct: s.correct + 1 }));
      if (onAwardBonusXp) {
        onAwardBonusXp(awarded, `Correct Quiz: ${selectedSector.label} (+${awarded} XP)`);
      }
      // Reset multiplier after use
      if (multiplier > 1) {
        setMultiplier(1);
      }
    } else {
      sounds.playIncorrect();
      setQuizScore((s) => ({ answered: s.answered + 1, correct: s.correct }));
    }
  };

  const renderIcon = (name: string, className: string = 'w-4 h-4') => {
    switch (name) {
      case 'BookOpen':
        return <BookOpen className={className} />;
      case 'Send':
        return <Send className={className} />;
      case 'Sparkles':
        return <Sparkles className={className} />;
      case 'Trophy':
        return <Trophy className={className} />;
      case 'Target':
        return <Target className={className} />;
      case 'CheckCircle2':
        return <CheckCircle2 className={className} />;
      case 'Flame':
        return <Flame className={className} />;
      case 'Zap':
        return <Zap className={className} />;
      default:
        return <Sparkles className={className} />;
    }
  };

  return (
    <div
      id="spinning-wheel-container"
      className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl relative overflow-hidden"
    >
      {/* Background ambient gradient glow */}
      <div className="absolute -top-24 -left-24 w-72 h-72 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Header bar */}
      <div className="flex items-center justify-between pb-5 border-b border-slate-800 mb-6 relative z-10">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 flex items-center gap-1 shadow-sm">
              <Sparkles className="w-3 h-3 fill-current" />
              Gamified Verbal Arena
            </span>
            {multiplier > 1 && (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-rose-500 text-white animate-pulse flex items-center gap-1">
                <Zap className="w-3 h-3 fill-current" />
                {multiplier}X Multiplier Active!
              </span>
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white mt-1">
            Placement Challenge Spin Wheel
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Spin the wheel to unlock high-yield verbal aptitude questions, win bonus XP, and master key placement concepts with instant rationales.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition"
            title={soundEnabled ? 'Mute Sounds' : 'Enable Sounds'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Stats ribbon */}
      <div className="grid grid-cols-3 gap-3 mb-6 relative z-10">
        <div className="bg-slate-800/70 border border-slate-700/60 rounded-2xl p-3 text-center">
          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Bonus XP Won</div>
          <div className="text-lg font-black text-amber-400 flex items-center justify-center gap-1 mt-0.5">
            <Trophy className="w-4 h-4 text-amber-400" />
            +{totalXpEarned}
          </div>
        </div>
        <div className="bg-slate-800/70 border border-slate-700/60 rounded-2xl p-3 text-center">
          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Quiz Accuracy</div>
          <div className="text-lg font-black text-emerald-400 flex items-center justify-center gap-1 mt-0.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            {quizScore.answered > 0
              ? `${Math.round((quizScore.correct / quizScore.answered) * 100)}%`
              : '100%'}
          </div>
        </div>
        <div className="bg-slate-800/70 border border-slate-700/60 rounded-2xl p-3 text-center">
          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Active Multiplier</div>
          <div className="text-lg font-black text-indigo-400 flex items-center justify-center gap-1 mt-0.5">
            <Zap className="w-4 h-4 text-indigo-400" />
            {multiplier}x
          </div>
        </div>
      </div>

      {/* Main Wheel Canvas & Layout */}
      <div className="flex flex-col lg:flex-row items-center gap-8 relative z-10">
        {/* The Wheel Visual */}
        <div className="relative flex flex-col items-center justify-center shrink-0">
          {/* Top Ticker Pointer Needle */}
          <div className="absolute -top-3 z-30 flex flex-col items-center">
            <div className="w-6 h-8 bg-amber-400 shadow-xl rounded-b-full clip-triangle border-2 border-slate-900 transform transition-transform duration-100 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-900" />
            </div>
          </div>

          {/* SVG Wheel */}
          <div className="relative p-2.5 rounded-full bg-gradient-to-tr from-amber-500 via-indigo-600 to-rose-500 shadow-2xl">
            <svg
              ref={wheelRef}
              width="360"
              height="360"
              viewBox="0 0 400 400"
              className="rounded-full select-none"
              style={{
                transform: `rotate(${rotation}deg)`,
                transition: isSpinning
                  ? 'transform 4.5s cubic-bezier(0.15, 0.9, 0.2, 1)'
                  : 'none',
              }}
            >
              <defs>
                <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.4" />
                </filter>
              </defs>

              {/* Outer Golden Border Rim */}
              <circle cx="200" cy="200" r="196" fill="#1E293B" stroke="#F59E0B" strokeWidth="6" />

              {/* Sectors */}
              {WHEEL_SECTORS.map((sector, index) => {
                const startAngle = index * arcDegree;
                const endAngle = startAngle + arcDegree;
                const radius = 188;
                const cx = 200;
                const cy = 200;

                // Arc coordinates
                const startRad = ((startAngle - 90) * Math.PI) / 180;
                const endRad = ((endAngle - 90) * Math.PI) / 180;

                const x1 = cx + radius * Math.cos(startRad);
                const y1 = cy + radius * Math.sin(startRad);
                const x2 = cx + radius * Math.cos(endRad);
                const y2 = cy + radius * Math.sin(endRad);

                const pathData = `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2} Z`;

                // Angle for the text label and icon
                const textAngle = startAngle + arcDegree / 2;
                const textRad = ((textAngle - 90) * Math.PI) / 180;
                const textDist = 125;
                const tx = cx + textDist * Math.cos(textRad);
                const ty = cy + textDist * Math.sin(textRad);

                return (
                  <g key={sector.id}>
                    <path
                      d={pathData}
                      fill={sector.color}
                      stroke="#0F172A"
                      strokeWidth="2.5"
                    />
                    <g transform={`translate(${tx}, ${ty}) rotate(${textAngle})`}>
                      <text
                        x="0"
                        y="-4"
                        fill={sector.textColor}
                        textAnchor="middle"
                        fontSize="12"
                        fontWeight="900"
                        fontFamily="system-ui, sans-serif"
                        letterSpacing="0.5px"
                      >
                        {sector.label}
                      </text>
                      <text
                        x="0"
                        y="9"
                        fill={sector.textColor}
                        textAnchor="middle"
                        fontSize="8.5"
                        fontWeight="600"
                        opacity="0.85"
                        fontFamily="system-ui, sans-serif"
                      >
                        {sector.sublabel}
                      </text>
                    </g>
                  </g>
                );
              })}

              {/* Decorative Outer Rim Pegs / Bulbs */}
              {Array.from({ length: 16 }).map((_, i) => {
                const angle = (i * 360) / 16;
                const rad = ((angle - 90) * Math.PI) / 180;
                const px = 200 + 192 * Math.cos(rad);
                const py = 200 + 192 * Math.sin(rad);
                return (
                  <circle
                    key={i}
                    cx={px}
                    cy={py}
                    r="3.5"
                    fill="#FEF08A"
                    stroke="#D97706"
                    strokeWidth="1"
                  />
                );
              })}
            </svg>

            {/* Center Spinning Hub Button */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <button
                id="btn-spin-wheel-center"
                disabled={isSpinning}
                onClick={handleSpin}
                className={`pointer-events-auto w-20 h-20 rounded-full shadow-2xl border-4 border-amber-300 font-black text-xs uppercase tracking-wider flex flex-col items-center justify-center transition transform active:scale-95 ${
                  isSpinning
                    ? 'bg-slate-800 text-slate-400 cursor-not-allowed'
                    : 'bg-gradient-to-b from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 shadow-amber-500/50 hover:scale-105 cursor-pointer'
                }`}
              >
                <RotateCcw
                  className={`w-5 h-5 mb-0.5 text-slate-950 ${isSpinning ? 'animate-spin' : ''}`}
                />
                <span>{isSpinning ? 'SPINNING' : 'SPIN'}</span>
              </button>
            </div>
          </div>

          {/* Action button below the wheel for easy touch */}
          <button
            id="btn-spin-wheel-bottom"
            disabled={isSpinning}
            onClick={handleSpin}
            className={`mt-6 px-8 py-3 rounded-2xl font-black text-sm uppercase tracking-wider shadow-lg flex items-center gap-2.5 transition ${
              isSpinning
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30 hover:scale-105 cursor-pointer'
            }`}
          >
            <RotateCcw className={`w-4 h-4 ${isSpinning ? 'animate-spin' : ''}`} />
            <span>{isSpinning ? 'Wheel is Rotating...' : 'Spin the Verbal Wheel'}</span>
          </button>
        </div>

        {/* Right side: Sector Landing card / Interactive Question & Explanation */}
        <div className="flex-1 w-full">
          {selectedSector ? (
            <div
              id="wheel-sector-outcome-card"
              className="bg-slate-800/90 border border-slate-700 rounded-3xl p-6 shadow-xl animate-in fade-in-50 zoom-in-95 duration-300"
            >
              {/* Sector Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-700/80 mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-white shadow-md"
                    style={{ backgroundColor: selectedSector.color }}
                  >
                    {renderIcon(selectedSector.iconName, 'w-5 h-5')}
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-extrabold tracking-wider text-amber-400 block">
                      Wheel Landed On
                    </span>
                    <h3 className="text-lg font-black text-white">
                      {selectedSector.label}: {selectedSector.sublabel}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {selectedSector.category === 'Multiplier' && (
                    <span className="px-3 py-1 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-bold flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5" />
                      2X Multiplier!
                    </span>
                  )}
                  {selectedSector.xpValue && (
                    <span className="px-3 py-1 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1">
                      <Trophy className="w-3.5 h-3.5" />
                      +{selectedSector.xpValue * multiplier} XP
                    </span>
                  )}
                </div>
              </div>

              {/* Content depending on sector type */}
              {selectedSector.question ? (
                <div>
                  <div className="mb-4">
                    <span className="inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-indigo-950 text-indigo-300 border border-indigo-700 mb-2">
                      {selectedSector.question.type.replace('_', ' ')}
                    </span>
                    <h4 className="text-base font-bold text-slate-100 leading-snug">
                      {selectedSector.question.question}
                    </h4>
                    {selectedSector.question.instructions && (
                      <p className="text-xs text-slate-400 mt-1 italic">
                        {selectedSector.question.instructions}
                      </p>
                    )}
                  </div>

                  {/* Interactive Options with Instant Selection */}
                  <div className="space-y-2.5 mb-4">
                    {selectedSector.question.options?.map((option, idx) => {
                      const isSelected = selectedOption === option;
                      const isTargetCorrect = option === selectedSector.question?.correctAnswer;
                      const hasChosen = selectedOption !== undefined;

                      let btnStyle =
                        'border-slate-700 bg-slate-800/70 hover:bg-slate-700/80 hover:border-slate-600 text-slate-200';

                      if (hasChosen) {
                        if (isSelected && isTargetCorrect) {
                          btnStyle = 'border-emerald-500 bg-emerald-950/60 text-emerald-200 shadow-sm';
                        } else if (isSelected && !isTargetCorrect) {
                          btnStyle = 'border-rose-500 bg-rose-950/60 text-rose-200 shadow-sm';
                        } else if (isTargetCorrect) {
                          btnStyle = 'border-emerald-600/60 bg-emerald-950/30 text-emerald-300';
                        } else {
                          btnStyle = 'border-slate-800 bg-slate-900/40 text-slate-500 opacity-60';
                        }
                      }

                      return (
                        <button
                          key={idx}
                          disabled={hasChosen}
                          onClick={() => handleSelectQuizOption(option)}
                          className={`w-full text-left p-3.5 rounded-xl border-2 text-xs font-medium transition flex items-start gap-3 ${btnStyle}`}
                        >
                          <span
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${
                              hasChosen && isTargetCorrect
                                ? 'bg-emerald-600 text-white'
                                : hasChosen && isSelected && !isTargetCorrect
                                ? 'bg-rose-600 text-white'
                                : 'bg-slate-700 text-slate-300'
                            }`}
                          >
                            {String.fromCharCode(65 + idx)}
                          </span>
                          <span className="flex-1 mt-0.5">{option}</span>
                          {hasChosen && isTargetCorrect && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          )}
                          {hasChosen && isSelected && !isTargetCorrect && (
                            <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Immediate Feedback Component with Detailed Explanations for Correct and Incorrect */}
                  {selectedOption !== undefined && (
                    <InteractiveQuizFeedback
                      question={selectedSector.question}
                      selectedOption={selectedOption}
                      isCorrect={selectedOption === selectedSector.question.correctAnswer}
                      onRetry={() => setSelectedOption(undefined)}
                    />
                  )}
                </div>
              ) : (
                /* Non-question sector (e.g. Jackpot XP) */
                <div className="py-6 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-amber-400/20 text-amber-400 flex items-center justify-center mx-auto mb-3 border border-amber-400/30">
                    <Trophy className="w-8 h-8 animate-bounce" />
                  </div>
                  <h4 className="text-xl font-black text-white">Jackpot XP Unlocked!</h4>
                  <p className="text-xs text-slate-300 max-w-sm mx-auto mt-1 mb-4">
                    You landed on the Golden Wheel Prize! An instant +{selectedSector.xpValue || 100}{' '}
                    XP has been added to your VerbalEdge workshop profile.
                  </p>
                  <button
                    onClick={handleSpin}
                    className="px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs transition shadow-md"
                  >
                    Spin Again for Quiz Drill
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Idle initial view */
            <div className="bg-slate-800/40 border border-dashed border-slate-700 rounded-3xl p-8 text-center">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto mb-3">
                <Sparkles className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-200">Ready to Test Your Instincts?</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-6">
                Click <strong>"SPIN"</strong> to test yourself with instant placement questions, detailed grammatical and behavioral explanations, and bonus score boosts.
              </p>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-700">
                <Target className="w-4 h-4 text-indigo-400" />
                8 High-Frequency Verbal Categories
              </div>
            </div>
          )}

          {/* Recent wheel outcomes history */}
          {spinHistory.length > 0 && (
            <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
              <span className="font-bold text-slate-500">Recent Spins:</span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {spinHistory.map((h, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded-md bg-slate-800 text-[11px] font-medium text-slate-300 border border-slate-700"
                  >
                    {h}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
