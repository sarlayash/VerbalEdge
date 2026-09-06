import React, { useState, useEffect } from 'react';
import { Certificate, Badge, Learner } from '../types';
import {
  CheckCircle2,
  XCircle,
  ShieldAlert,
  ArrowLeft,
  Award,
  ExternalLink,
  Calendar,
  User,
  Hash,
  Download,
  QrCode,
  Copy,
  Check,
  ShieldCheck,
} from 'lucide-react';
import { CertificateView } from './CertificateView';
import { BadgeCard } from './BadgeCard';
import { generateQrCode } from '../utils/qr';
import { getFullVerificationUrl } from '../utils/verificationUrl';

interface VerificationViewProps {
  credentialId: string;
  onBack: () => void;
  findCredential: (id: string) => { type: 'certificate' | 'badge'; data: Certificate | Badge; learner: Learner } | null;
}

export const VerificationView: React.FC<VerificationViewProps> = ({
  credentialId,
  onBack,
  findCredential,
}) => {
  const [searchId, setSearchId] = useState(credentialId);
  const [copied, setCopied] = useState(false);
  const [downloadingQr, setDownloadingQr] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const result = findCredential(searchId);

  const activeId = result
    ? result.type === 'certificate'
      ? (result.data as Certificate).certId
      : (result.data as Badge).badgeId
    : '';

  useEffect(() => {
    if (result && result.data.isValid && activeId) {
      const fullUrl = getFullVerificationUrl(activeId);
      generateQrCode(fullUrl, 480).then((url) => {
        if (url) setQrDataUrl(url);
      });
    } else {
      setQrDataUrl('');
    }
  }, [result, activeId]);

  const handleDownloadQr = () => {
    if (!qrDataUrl || !activeId) return;
    setDownloadingQr(true);
    const link = document.createElement('a');
    link.download = `${activeId}_verification_qr.png`;
    link.href = qrDataUrl;
    link.click();
    setTimeout(() => setDownloadingQr(false), 1500);
  };

  const handleCopyLink = async () => {
    if (!activeId) return;
    const fullUrl = getFullVerificationUrl(activeId);
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback if clipboard API unavailable
      const input = document.createElement('input');
      input.value = fullUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        {/* Navigation */}
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 mb-6 bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Workshop
        </button>

        {/* Verification Status Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-6 sm:p-10 mb-8">
          <div className="flex flex-col items-center text-center pb-6 border-b border-slate-100">
            {result && result.data.isValid ? (
              <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-4 ring-8 ring-emerald-50">
                <CheckCircle2 className="w-12 h-12 text-emerald-500" />
              </div>
            ) : (
              <div className="w-20 h-20 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mb-4 ring-8 ring-rose-50">
                <XCircle className="w-12 h-12 text-rose-500" />
              </div>
            )}

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase mb-2 bg-slate-100 text-slate-700">
              VerbalEdge Credential Verification
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {result && result.data.isValid
                ? 'Officially Authenticated & Verified'
                : 'Credential Record Not Found or Revoked'}
            </h1>
            <p className="text-sm text-slate-500 max-w-md mt-1">
              Issued by VerbalEdge Academy — Powered by Kapil
            </p>
          </div>

          {/* Quick Search Bar */}
          <div className="my-6">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Verify Another Certificate or Badge Number:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                placeholder="e.g. VE-CRT-D1-7701 or VE-BDG-D1-7701"
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 font-code text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                onClick={() => setSearchId(searchId.trim())}
                className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition"
              >
                Verify
              </button>
            </div>
          </div>

          {/* Verification Details Table */}
          {result ? (
            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    <User className="w-3.5 h-3.5 text-indigo-500" />
                    Recipient Name
                  </div>
                  <div className="text-lg font-bold text-slate-900">
                    {result.data.learnerName}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    <Hash className="w-3.5 h-3.5 text-indigo-500" />
                    Credential ID
                  </div>
                  <div className="text-sm font-mono font-bold text-indigo-600">
                    {result.type === 'certificate'
                      ? (result.data as Certificate).certId
                      : (result.data as Badge).badgeId}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    <Award className="w-3.5 h-3.5 text-indigo-500" />
                    Workshop / Title
                  </div>
                  <div className="text-base font-bold text-slate-900">
                    {result.data.title}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    VerbalEdge 3-Day Placement Readiness
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                    Issue Date & Trainer
                  </div>
                  <div className="text-base font-bold text-slate-900">
                    {result.data.issuedDate}
                  </div>
                  <div className="text-xs text-slate-600 mt-0.5 font-medium">
                    Trainer: Kapil Narula (Authorized Signatory)
                  </div>
                </div>
              </div>

              {/* Status Banner */}
              <div
                className={`p-4 rounded-2xl flex items-center justify-between ${
                  result.data.isValid
                    ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                    : 'bg-rose-50 text-rose-900 border border-rose-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  {result.data.isValid ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  ) : (
                    <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
                  )}
                  <span className="text-sm font-semibold">
                    {result.data.isValid
                      ? 'Cryptographically validated against VerbalEdge registry'
                      : 'This credential is listed as revoked or invalid'}
                  </span>
                </div>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-white shadow-sm uppercase tracking-wider">
                  {result.data.isValid ? 'ACTIVE' : 'REVOKED'}
                </span>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-slate-500">
              <p className="font-semibold text-slate-800">
                No matching badge or certificate found for "{searchId}"
              </p>
              <p className="text-xs mt-1">
                Please ensure the full ID (e.g. VE-CRT-D1-7701 or VE-BDG-D1-7701) is entered correctly.
              </p>
            </div>
          )}
        </div>

        {/* Live Credential Preview */}
        {result && result.data.isValid && (
          <div className="mt-8">
            <h3 className="text-lg font-bold text-slate-900 mb-4 text-center">
              Verified Original Document
            </h3>
            {result.type === 'certificate' ? (
              <CertificateView certificate={result.data as Certificate} fullView />
            ) : (
              <div className="flex justify-center">
                <BadgeCard badge={result.data as Badge} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
