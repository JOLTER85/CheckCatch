import React, { useState } from 'react';
import { Download, CheckCircle2, ShieldCheck, FileCode, Copy, Check, ArrowDownToLine } from 'lucide-react';

export interface DomainVerificationPayload {
  domain: string;
  verification_id: string;
  quality_score: number;
  created_at: string;
  status: 'Verified' | 'Pending' | 'Rejected';
  validation_hash?: string;
}

interface DomainVerificationFileDownloaderProps {
  domainName?: string;
  qualityScore?: number;
  status?: 'Verified' | 'Pending' | 'Rejected';
  onDownloaded?: (fileName: string) => void;
}

/**
 * Utility function to generate unique CheckCatch verification ID and hash
 */
export function generateVerificationData(
  domain: string = 'example.com',
  score: number = 88,
  status: 'Verified' | 'Pending' | 'Rejected' = 'Verified'
): DomainVerificationPayload {
  const randomSuffix = Math.floor(10000000 + Math.random() * 90000000);
  const verificationId = `CHK-${randomSuffix}-VAL`;
  const timestamp = new Date().toISOString();

  // Pseudo-SHA cryptographic token simulation for deterministic client integrity
  const validationHash = btoa(`${domain}:${verificationId}:${timestamp}`).slice(0, 32);

  return {
    domain: domain.trim().toLowerCase(),
    verification_id: verificationId,
    quality_score: score,
    created_at: timestamp,
    status: status,
    validation_hash: validationHash,
  };
}

/**
 * Client-Side Trigger to Download JSON or TXT file using Blob & URL.createObjectURL
 */
export function triggerClientFileDownload(
  filename: string,
  content: string,
  mimeType: string = 'application/json;charset=utf-8;'
) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = filename;
  link.style.display = 'none';

  document.body.appendChild(link);
  link.click();

  // Cleanup blob memory
  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 100);
}

/**
 * CheckCatch Domain Verification File Download Component
 */
export const DomainVerificationFileDownloader: React.FC<DomainVerificationFileDownloaderProps> = ({
  domainName = 'example.com',
  qualityScore = 88,
  status = 'Verified',
  onDownloaded,
}) => {
  const [copied, setCopied] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [fileFormat, setFileFormat] = useState<'json' | 'txt'>('json');

  // Build the verification payload
  const verificationData: DomainVerificationPayload = generateVerificationData(
    domainName,
    qualityScore,
    status as 'Verified' | 'Pending' | 'Rejected'
  );

  const jsonString = JSON.stringify(
    {
      domain: verificationData.domain,
      verification_id: verificationData.verification_id,
      quality_score: verificationData.quality_score,
      created_at: verificationData.created_at,
      status: verificationData.status,
    },
    null,
    2
  );

  const handleDownload = () => {
    const cleanDomain = verificationData.domain.replace(/[^a-z0-9.-]/gi, '_');
    const fileName =
      fileFormat === 'json'
        ? `checkcatch-verify-${cleanDomain}.json`
        : `checkcatch-verify-${cleanDomain}.txt`;

    const content =
      fileFormat === 'json'
        ? jsonString
        : `CHECKCATCH-DOMAIN-VERIFICATION
Domain: ${verificationData.domain}
Verification ID: ${verificationData.verification_id}
Quality Score: ${verificationData.quality_score}
Status: ${verificationData.status}
Created At: ${verificationData.created_at}
Validation Hash: ${verificationData.validation_hash || ''}`;

    const mime = fileFormat === 'json' ? 'application/json' : 'text/plain';

    triggerClientFileDownload(fileName, content, mime);

    setDownloadSuccess(true);
    if (onDownloaded) onDownloaded(fileName);
    setTimeout(() => setDownloadSuccess(false), 4000);
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      id="domain-verification-box"
      className="bg-white/95 border border-teal-200/90 rounded-2xl p-6 shadow-sm backdrop-blur-xs text-slate-900 space-y-6 max-w-2xl mx-auto"
    >
      {/* Header & Badges */}
      <div className="flex items-start justify-between gap-4 border-b border-teal-50 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-50 to-blue-50 border border-teal-200 flex items-center justify-center text-teal-700 shadow-xs">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              Recommended Validation Method
              <span className="px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-teal-100 text-teal-800 border border-teal-300">
                1. Download the File
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Generate an official verification record and proof of ownership audit
            </p>
          </div>
        </div>

        {/* Format Switcher */}
        <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setFileFormat('json')}
            className={`px-2.5 py-1 rounded-md transition-all ${
              fileFormat === 'json'
                ? 'bg-white text-teal-700 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            JSON
          </button>
          <button
            type="button"
            onClick={() => setFileFormat('txt')}
            className={`px-2.5 py-1 rounded-md transition-all ${
              fileFormat === 'txt'
                ? 'bg-white text-teal-700 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            TXT
          </button>
        </div>
      </div>

      {/* Step-by-Step Instructions */}
      <div className="bg-gradient-to-br from-teal-50/50 via-sky-50/40 to-blue-50/40 border border-teal-100/90 rounded-xl p-4 text-xs space-y-2.5">
        <div className="font-bold text-slate-800 flex items-center gap-2">
          <FileCode className="w-4 h-4 text-teal-700" />
          <span>Verification Instructions:</span>
        </div>
        <ol className="list-decimal list-inside space-y-1.5 text-slate-600 font-medium pl-1 leading-relaxed">
          <li>
            <strong className="text-slate-900 font-bold">Download the verification file</strong>{' '}
            by clicking the primary button below.
          </li>
          <li>
            <strong className="text-slate-900 font-bold">Upload it to your root directory</strong>{' '}
            (e.g., <code className="bg-white/80 px-1.5 py-0.5 rounded border border-teal-200 font-mono text-teal-800 font-semibold">/public/</code> or <code className="bg-white/80 px-1.5 py-0.5 rounded border border-teal-200 font-mono text-teal-800 font-semibold">/root/</code>) or paste its contents into CheckCatch.
          </li>
        </ol>
      </div>

      {/* Code Preview Box */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
          <span className="font-semibold uppercase tracking-wider text-slate-400">
            Output File Structure ({fileFormat.toUpperCase()})
          </span>
          <button
            type="button"
            onClick={handleCopyJson}
            className="flex items-center gap-1 font-semibold text-teal-700 hover:text-teal-900 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-teal-600" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied to clipboard' : 'Copy JSON'}
          </button>
        </div>

        <pre className="bg-slate-900 text-teal-300 font-mono text-xs p-4 rounded-xl overflow-x-auto border border-slate-800 shadow-inner">
          <code>{jsonString}</code>
        </pre>
      </div>

      {/* Primary Action Controls */}
      <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
        <button
          id="download-validation-file-btn"
          type="button"
          onClick={handleDownload}
          className="w-full sm:flex-1 flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 active:scale-[0.99] text-white text-sm font-bold shadow-md shadow-teal-500/20 transition-all cursor-pointer"
        >
          {downloadSuccess ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-teal-200 animate-bounce" />
              <span>File Downloaded Successfully!</span>
            </>
          ) : (
            <>
              <ArrowDownToLine className="w-4 h-4" />
              <span>Download Validation File</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={handleCopyJson}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-50 hover:bg-teal-50 text-slate-700 hover:text-teal-900 border border-slate-200 hover:border-teal-300 text-xs font-bold transition-all shadow-xs"
        >
          <Copy className="w-4 h-4 text-teal-600" />
          <span>Copy Config</span>
        </button>
      </div>
    </div>
  );
};
