import React, { useRef } from 'react';
import { Badge } from '../types';
import { Award, Download, ExternalLink, QrCode, ShieldCheck, Sparkles } from 'lucide-react';
import { downloadElementAsPng, downloadElementAsPdf } from '../utils/export';

interface BadgeCardProps {
  badge: Badge;
  onOpenVerify?: (id: string) => void;
  compact?: boolean;
}

export const BadgeCard: React.FC<BadgeCardProps> = ({ badge, onOpenVerify, compact = false }) => {
  const badgeDomId = `badge-render-${badge.badgeId}`;
  const [downloading, setDownloading] = React.useState(false);

  const getDayTheme = (day: number) => {
    switch (day) {
      case 1:
        return {
          gradient: 'from-indigo-600 via-blue-600 to-indigo-800',
          border: 'border-indigo-400/40',
          glow: 'shadow-indigo-500/20',
          accent: 'bg-indigo-500',
          textAccent: 'text-indigo-400',
          subtitle: 'Day 1 Challenger',
        };
      case 2:
        return {
          gradient: 'from-teal-600 via-emerald-600 to-cyan-800',
          border: 'border-teal-400/40',
          glow: 'shadow-teal-500/20',
          accent: 'bg-teal-500',
          textAccent: 'text-teal-400',
          subtitle: 'Day 2 Communicator',
        };
      case 3:
      default:
        return {
          gradient: 'from-amber-500 via-amber-600 to-yellow-700',
          border: 'border-amber-300/50',
          glow: 'shadow-amber-500/30',
          accent: 'bg-amber-400',
          textAccent: 'text-amber-300',
          subtitle: 'Day 3 Placement Warrior',
        };
    }
  };

  const theme = getDayTheme(badge.day);

  const handleDownloadPng = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setDownloading(true);
    await downloadElementAsPng(badgeDomId, `${badge.badgeId}_badge`);
    setDownloading(false);
  };

  const handleDownloadPdf = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setDownloading(true);
    await downloadElementAsPdf(badgeDomId, `${badge.badgeId}_badge`, 'p');
    setDownloading(false);
  };

  return (
    <div className="flex flex-col items-center">
      {/* Visual Badge Card */}
      <div
        id={badgeDomId}
        className={`relative w-full max-w-[340px] rounded-2xl p-6 bg-gradient-to-b ${theme.gradient} text-white shadow-xl ${theme.glow} border ${theme.border} transition-all duration-300 hover:scale-[1.02] flex flex-col items-center text-center overflow-hidden`}
      >
        {/* Subtle background glow */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-28 h-28 bg-black/20 rounded-full blur-xl pointer-events-none" />

        {/* Top header */}
        <div className="w-full flex items-center justify-between text-xs font-semibold tracking-wider text-white/80 mb-4 pb-2 border-b border-white/15">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            {badge.workshopName.toUpperCase()}
          </span>
          <span className="bg-black/30 px-2 py-0.5 rounded-full font-code text-[11px] text-white/90">
            DAY {badge.day}
          </span>
        </div>

        {/* Badge Medallion Icon */}
        <div className="relative my-2">
          <div className="w-24 h-24 rounded-full bg-white/10 backdrop-blur-md p-2 flex items-center justify-center border-2 border-white/30 shadow-inner">
            <div className="w-20 h-20 rounded-full bg-black/20 flex flex-col items-center justify-center border border-white/20">
              <Award className="w-10 h-10 text-yellow-300 drop-shadow-md" />
            </div>
          </div>
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-white text-slate-900 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow">
            Verified
          </div>
        </div>

        {/* Title and Learner */}
        <h3 className="text-xl font-black tracking-tight mt-3 text-white">
          {badge.title}
        </h3>
        <p className="text-xs text-white/80 font-medium mt-0.5">Presented to</p>
        <p className="text-base font-bold text-yellow-200 tracking-wide mt-0.5">
          {badge.learnerName}
        </p>

        {/* Workshop Credential details */}
        <div className="w-full bg-black/25 rounded-xl p-3 my-4 border border-white/10 flex items-center justify-between gap-3 text-left">
          <div className="flex-1 min-w-0">
            <div className="text-[10px] uppercase tracking-wider text-white/60">Badge ID</div>
            <div className="font-code text-xs font-semibold text-white truncate">{badge.badgeId}</div>
            <div className="text-[10px] uppercase tracking-wider text-white/60 mt-1">Mentor</div>
            <div className="text-xs font-medium text-white/90">{badge.trainer}</div>
          </div>

          {/* QR Code thumbnail */}
          {badge.qrCodeDataUrl ? (
            <div className="bg-white p-1 rounded-lg shrink-0 shadow">
              <img src={badge.qrCodeDataUrl} alt="QR Code" className="w-14 h-14" />
            </div>
          ) : (
            <div className="w-14 h-14 bg-white/20 rounded-lg flex items-center justify-center shrink-0">
              <QrCode className="w-8 h-8 text-white/70" />
            </div>
          )}
        </div>

        {/* Footer date & status */}
        <div className="w-full flex items-center justify-between text-[11px] text-white/70 pt-1">
          <span>Issued: {badge.issuedDate}</span>
          <span className="flex items-center gap-1 font-semibold text-white">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
            Authenticated
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      {!compact && (
        <div className="flex items-center gap-2 mt-4">
          <button
            id={`btn-dl-png-${badge.badgeId}`}
            onClick={handleDownloadPng}
            disabled={downloading}
            className="px-3.5 py-1.5 rounded-lg bg-slate-900 text-white hover:bg-slate-800 text-xs font-medium flex items-center gap-1.5 shadow transition"
          >
            <Download className="w-3.5 h-3.5 text-indigo-400" />
            PNG
          </button>
          <button
            id={`btn-dl-pdf-${badge.badgeId}`}
            onClick={handleDownloadPdf}
            disabled={downloading}
            className="px-3.5 py-1.5 rounded-lg bg-white text-slate-800 hover:bg-slate-100 border border-slate-200 text-xs font-medium flex items-center gap-1.5 shadow-sm transition"
          >
            <Download className="w-3.5 h-3.5 text-rose-500" />
            PDF
          </button>
          {onOpenVerify && (
            <button
              id={`btn-verify-${badge.badgeId}`}
              onClick={() => onOpenVerify(badge.badgeId)}
              className="px-3.5 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-medium flex items-center gap-1.5 transition"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Verify QR
            </button>
          )}
        </div>
      )}
    </div>
  );
};
