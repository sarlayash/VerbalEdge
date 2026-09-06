import React, { useState, useEffect } from 'react';
import { Certificate } from '../types';
import { Award, CheckCircle2, Download, ExternalLink, Printer, ShieldCheck, Sparkles } from 'lucide-react';
import { downloadElementAsPng, downloadElementAsPdf } from '../utils/export';
import { generateQrCode } from '../utils/qr';
import { getFullVerificationUrl } from '../utils/verificationUrl';

interface CertificateViewProps {
  certificate: Certificate;
  onOpenVerify?: (id: string) => void;
  fullView?: boolean;
}

export const CertificateView: React.FC<CertificateViewProps> = ({
  certificate,
  onOpenVerify,
  fullView = false,
}) => {
  const domId = `cert-render-${certificate.certId}`;
  const [downloading, setDownloading] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>(certificate.qrCodeDataUrl || '');
  const isGold = certificate.theme === 'gold' || certificate.type === 'grand';

  useEffect(() => {
    // Generate valid full scannable verification URL for mobile phone camera scanning
    const fullUrl = getFullVerificationUrl(certificate.certId);
    generateQrCode(fullUrl).then((url) => {
      if (url) setQrCodeUrl(url);
    });
  }, [certificate.certId]);

  const handleDownloadPng = async () => {
    setDownloading(true);
    await downloadElementAsPng(domId, `${certificate.certId}_certificate`);
    setDownloading(false);
  };

  const handleDownloadPdf = async () => {
    setDownloading(true);
    await downloadElementAsPdf(domId, `${certificate.certId}_certificate`, 'l');
    setDownloading(false);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto">
      {/* Certificate Frame */}
      <div
        id={domId}
        className={`printable-certificate relative w-full aspect-[1.414/1] min-h-[480px] sm:min-h-[540px] rounded-2xl p-6 sm:p-10 shadow-2xl overflow-hidden flex flex-col justify-between select-none ${
          isGold
            ? 'bg-gradient-to-br from-[#1a1500] via-[#241c04] to-[#120e00] text-amber-100 border-4 border-[#d4af37]'
            : 'bg-white text-slate-800 border-4 border-indigo-900 shadow-indigo-100'
        }`}
      >
        {/* Decorative Luxury Outer Border & Corners */}
        <div
          className={`absolute inset-3 pointer-events-none border-2 ${
            isGold ? 'border-amber-400/40' : 'border-indigo-200'
          } rounded-xl`}
        />
        <div
          className={`absolute inset-5 pointer-events-none border ${
            isGold ? 'border-amber-500/20' : 'border-slate-100'
          } rounded-lg`}
        />

        {/* Guilloche / Watermark Icon */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.035] pointer-events-none">
          <Award className="w-96 h-96" />
        </div>

        {/* Certificate Header */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-md ${
                isGold
                  ? 'bg-gradient-to-br from-amber-400 to-yellow-600 text-slate-950 font-bold'
                  : 'bg-indigo-600 text-white'
              }`}
            >
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div
                className={`font-cert tracking-widest text-xs uppercase font-bold ${
                  isGold ? 'text-amber-300' : 'text-indigo-600'
                }`}
              >
                VerbalEdge Academy
              </div>
              <div className="text-[11px] opacity-70 tracking-wider">
                Powered by Kapil
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="font-code text-[11px] opacity-80 uppercase tracking-widest">
              Credential ID
            </div>
            <div
              className={`font-code font-bold text-xs sm:text-sm tracking-wider ${
                isGold ? 'text-amber-300' : 'text-indigo-900'
              }`}
            >
              {certificate.certId}
            </div>
          </div>
        </div>

        {/* Main Certificate Body */}
        <div className="relative z-10 text-center my-auto py-4">
          <div
            className={`font-cert uppercase text-xs sm:text-sm tracking-[0.25em] font-semibold mb-2 ${
              isGold ? 'text-amber-300' : 'text-indigo-600'
            }`}
          >
            {isGold ? 'Grand Master Award of Excellence' : 'Certificate of Achievement'}
          </div>

          <h2
            className={`font-cert text-2xl sm:text-4xl font-extrabold tracking-wide uppercase my-2 ${
              isGold ? 'gold-gradient-text' : 'text-slate-900'
            }`}
          >
            {certificate.title}
          </h2>

          <p className="text-xs sm:text-sm opacity-80 italic my-2">
            This officially certifies that
          </p>

          {/* Recipient Name */}
          <div className="my-3 sm:my-4 w-full text-center px-4">
            <h1
              className={`font-serif-display text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight leading-snug max-w-xl mx-auto break-words ${
                isGold ? 'text-yellow-200' : 'text-indigo-950'
              }`}
            >
              {certificate.learnerName}
            </h1>
            <div
              className={`h-0.5 w-48 sm:w-64 mx-auto mt-2 rounded-full ${
                isGold
                  ? 'bg-gradient-to-r from-transparent via-amber-400 to-transparent'
                  : 'bg-gradient-to-r from-transparent via-indigo-500 to-transparent'
              }`}
            />
          </div>

          {/* Description */}
          <p className="max-w-xl mx-auto text-xs sm:text-sm opacity-85 leading-relaxed mt-3 sm:mt-4 px-2">
            has successfully completed all rigorous verbal ability, executive articulation, and campus placement
            readiness challenges with distinction in the{' '}
            <strong className={isGold ? 'text-amber-200' : 'text-indigo-900'}>
              VerbalEdge 3-Day Placement Readiness Challenge
            </strong>
            {isGold && ' — fulfilling all 3 progressive modules.'}
          </p>
        </div>

        {/* Certificate Footer */}
        <div className="relative z-10 pt-4 border-t border-current/15 grid grid-cols-3 items-end text-xs">
          {/* Issue Date & Verification */}
          <div className="text-left">
            <div className="text-[10px] uppercase opacity-70 tracking-wider">Date of Issue</div>
            <div className="font-semibold text-xs sm:text-sm">{certificate.issuedDate}</div>
            <div className="flex items-center gap-1 mt-1 text-[11px] text-emerald-500 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              Verified Status: Authenticated
            </div>
          </div>

          {/* Official Seal / QR Center */}
          <div className="flex flex-col items-center justify-center">
            {qrCodeUrl ? (
              <div className="bg-white p-1 rounded-xl shadow-lg border border-black/10">
                <img
                  src={qrCodeUrl}
                  alt="Verify QR"
                  className="w-14 h-14 sm:w-16 sm:h-16 block"
                />
              </div>
            ) : (
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-slate-100 rounded-xl flex items-center justify-center border border-black/10">
                <ShieldCheck className="w-7 h-7 text-indigo-600" />
              </div>
            )}
            <div className="text-[9px] uppercase tracking-widest mt-1 opacity-70 font-semibold">
              Scan to Authenticate
            </div>
          </div>

          {/* Digital Signature */}
          <div className="text-right">
            <div className="font-serif-display italic text-lg sm:text-2xl text-indigo-400 font-bold mb-0.5">
              {certificate.digitalSignature}
            </div>
            <div
              className={`font-semibold text-xs sm:text-sm pt-1 border-t ${
                isGold ? 'border-amber-400/40 text-amber-200' : 'border-slate-300 text-slate-800'
              }`}
            >
              Kapil Narula
            </div>
            <div className="text-[10px] opacity-70 tracking-wider">
              Lead Trainer & Founder, VerbalEdge
            </div>
          </div>
        </div>
      </div>

      {/* Action Toolbar */}
      <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
        <button
          id={`btn-cert-png-${certificate.certId}`}
          onClick={handleDownloadPng}
          disabled={downloading}
          className="px-4 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-sm font-semibold flex items-center gap-2 shadow-lg transition"
        >
          <Download className="w-4 h-4 text-indigo-400" />
          Download PNG
        </button>
        <button
          id={`btn-cert-pdf-${certificate.certId}`}
          onClick={handleDownloadPdf}
          disabled={downloading}
          className="px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 text-sm font-semibold flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition"
        >
          <Download className="w-4 h-4 text-amber-300" />
          Download PDF
        </button>
        <button
          id={`btn-cert-print-${certificate.certId}`}
          onClick={handlePrint}
          className="px-4 py-2 rounded-xl bg-white text-slate-800 hover:bg-slate-100 border border-slate-200 text-sm font-semibold flex items-center gap-2 shadow-sm transition"
        >
          <Printer className="w-4 h-4 text-slate-600" />
          Print
        </button>
        {onOpenVerify && (
          <button
            id={`btn-cert-verify-${certificate.certId}`}
            onClick={() => onOpenVerify(certificate.certId)}
            className="px-4 py-2 rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 text-sm font-semibold flex items-center gap-2 border border-emerald-200 transition"
          >
            <ExternalLink className="w-4 h-4" />
            Verify on Portal
          </button>
        )}
      </div>
    </div>
  );
};
