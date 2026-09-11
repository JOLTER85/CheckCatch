import React, { useState, useEffect } from 'react';
import {
  Search,
  CheckCircle2,
  XCircle,
  Sparkles,
  ExternalLink,
  Copy,
  Check,
  Bookmark,
  TrendingUp,
  ShieldCheck,
  BarChart3,
  Globe,
  Award,
  AlertTriangle,
  Layers,
  Clock,
  Link2,
  Info
} from 'lucide-react';
import { SingleDomainVerificationResult } from '../types';
import { verifyAndValueDomain } from '../utils/singleDomainVerification';
import { Language } from '../utils/translations';

interface SingleDomainVerifierProps {
  lang?: Language;
  onSaveDomain?: (result: SingleDomainVerificationResult) => void;
  onShowToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

const EXAMPLE_DOMAINS = [
  { domain: 'CheckCatch.com', label: 'CheckCatch.com', valid: true },
  { domain: 'CloudVault.com', label: 'CloudVault.com', valid: true },
  { domain: 'DataFlow.io', label: 'DataFlow.io', valid: true },
  { domain: 'SmartPay.com', label: 'SmartPay.com', valid: true },
  { domain: 'FastCar123.com', label: 'FastCar123.com (Test Fail)', valid: false },
];

export const SingleDomainVerifier: React.FC<SingleDomainVerifierProps> = ({
  onSaveDomain,
  onShowToast,
}) => {
  const [domainInput, setDomainInput] = useState('CheckCatch.com');
  const [isVerifying, setIsVerifying] = useState(false);
  const [result, setResult] = useState<SingleDomainVerificationResult | null>(() => {
    return verifyAndValueDomain('CheckCatch.com');
  });
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'breakdown' | 'seo'>('overview');

  const executeVerification = async (targetDomain: string) => {
    const trimmed = targetDomain.trim();
    if (!trimmed) {
      onShowToast('Please enter a domain name to verify', 'error');
      return;
    }

    setIsVerifying(true);

    // Instant client validation baseline
    const localResult = verifyAndValueDomain(trimmed);
    setResult(localResult);

    try {
      // Server-side check for 275,000-word validation and AI enrichment
      const res = await fetch('/api/verify-domain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: trimmed }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.result) {
          setResult(data.result);
        }
      }
    } catch {
      // Fallback already active from client evaluation
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeVerification(domainInput);
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.domain);
    setCopied(true);
    onShowToast(`Copied "${result.domain}" to clipboard!`);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="single-domain-verifier" className="w-full max-w-5xl mx-auto space-y-6">
      {/* Hero Header & Brand Presentation */}
      <div className="text-center space-y-3 pt-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 border border-emerald-300 text-emerald-800 shadow-xs">
          <span className="font-mono font-bold tracking-tight text-emerald-700">CheckCatch.com</span>
          <span className="text-emerald-400">•</span>
          <span className="text-slate-700">Two-Word Domain Verification & Valuation Engine</span>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
          Check the Quality.{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-teal-600 to-emerald-600">
            Catch the Name.
          </span>
        </h1>

        <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
          An intelligent discovery and evaluation tool that specifically checks, verifies, and values domain names consisting exclusively of two valid English dictionary words.
        </p>
      </div>

      {/* Hero Search Input Box with Verify & Value Action */}
      <div className="relative">
        <form
          onSubmit={handleSubmit}
          className="p-2 sm:p-2.5 rounded-2xl bg-white border border-slate-300 shadow-xl backdrop-blur-md transition-all focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20"
        >
          <div className="flex flex-col sm:flex-row items-stretch gap-2">
            <div className="relative flex-1 flex items-center">
              <div className="absolute left-4 text-slate-400">
                <Search className="w-5 h-5 text-blue-600" />
              </div>
              <input
                id="hero-domain-search-input"
                type="text"
                value={domainInput}
                onChange={(e) => setDomainInput(e.target.value)}
                placeholder="Type or paste domain (e.g. CheckCatch.com, CloudVault.com, BrandName.com)..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3.5 text-sm sm:text-base text-slate-900 placeholder-slate-400 font-mono focus:outline-none focus:border-blue-500 transition-all"
                dir="ltr"
              />
            </div>

            <button
              id="hero-verify-value-button"
              type="submit"
              disabled={isVerifying}
              className="px-6 py-3.5 rounded-xl font-bold text-sm sm:text-base text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-md shadow-blue-500/20 active:scale-[0.99] flex items-center justify-center gap-2 shrink-0 cursor-pointer"
            >
              {isVerifying ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Verifying & Valuing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 fill-white stroke-[2.5]" />
                  <span>Verify & Value</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Quick Example Domain Chips */}
        <div className="flex items-center gap-2 flex-wrap mt-2.5 px-2 text-xs">
          <span className="text-slate-500 font-medium">Quick Examples:</span>
          {EXAMPLE_DOMAINS.map((ex) => (
            <button
              key={ex.domain}
              type="button"
              onClick={() => {
                setDomainInput(ex.domain);
                executeVerification(ex.domain);
              }}
              className={`px-2.5 py-1 rounded-lg border font-mono text-[11px] transition-all cursor-pointer ${
                domainInput.toLowerCase() === ex.domain.toLowerCase()
                  ? 'bg-blue-50 text-blue-700 border-blue-300 font-bold shadow-xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:text-slate-900'
              }`}
            >
              {ex.label}
            </button>
          ))}
        </div>
      </div>

      {/* Output Dashboard / Results Card */}
      {result && (
        <div
          id="verification-results-dashboard"
          className="rounded-3xl bg-white border border-slate-200 shadow-xl overflow-hidden transition-all"
        >
          {/* Top Status Bar with PASS / FAIL Status Indicator */}
          <div
            className={`p-4 sm:p-6 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
              result.isValidTwoWord
                ? 'bg-emerald-50/70 border-emerald-200'
                : 'bg-rose-50/70 border-rose-200'
            }`}
          >
            <div className="flex items-center gap-3.5">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center border shadow-inner ${
                  result.isValidTwoWord
                    ? 'bg-emerald-100 border-emerald-300 text-emerald-700'
                    : 'bg-rose-100 border-rose-300 text-rose-700'
                }`}
              >
                {result.isValidTwoWord ? (
                  <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
                ) : (
                  <XCircle className="w-6 h-6 stroke-[2.5]" />
                )}
              </div>

              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-mono tracking-tight">
                    {result.domain}
                  </h2>
                  <span
                    id="verification-status-badge"
                    className={`px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border shadow-xs ${
                      result.isValidTwoWord
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : 'bg-rose-100 text-rose-800 border-rose-300'
                    }`}
                  >
                    {result.isValidTwoWord ? 'PASS • Valid 2-Word Domain' : 'FAIL • Rule Violation'}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 mt-1">
                  {result.isValidTwoWord
                    ? 'Verified Success: Consists strictly of 2 real English dictionary words with zero hyphens and zero numbers.'
                    : (result.failureReason || 'Failed strict two-word verification criteria.')}
                </p>
              </div>
            </div>

            {/* Quick CTAs: Copy & Catch This Domain */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleCopy}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>

              <a
                id="catch-this-domain-primary-cta"
                href={result.registrarLinks.namecheap}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Catch This Domain</span>
                <ExternalLink className="w-3 h-3 ml-0.5" />
              </a>
            </div>
          </div>

          {/* Key Metrics Grid: Valuation, Brandability Grade, Search Intent, SEO */}
          <div className="p-4 sm:p-6 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 border-b border-slate-100">
            {/* Metric 1: Estimated Market Value ($USD) */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">Estimated Market Value</span>
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
                {result.estimatedValueFormatted}
                <span className="text-xs text-slate-500 font-normal ml-1.5 font-sans">USD</span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Tier: {result.valuationTier}</span>
              </div>
            </div>

            {/* Metric 2: Brandability Grade & Score */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">Brandability Score</span>
                <Award className="w-4 h-4 text-amber-500" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">
                  {result.brandabilityScore}
                </span>
                <span className="text-xs text-slate-500 font-mono">/ 100</span>
                <span
                  className={`ml-auto px-2 py-0.5 rounded-md text-xs font-extrabold ${
                    result.brandabilityGrade === 'A+' || result.brandabilityGrade === 'A'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                      : 'bg-amber-50 text-amber-800 border border-amber-300'
                  }`}
                >
                  Grade {result.brandabilityGrade}
                </span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-2">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${result.brandabilityScore}%` }}
                />
              </div>
            </div>

            {/* Metric 3: Search Volume Intent */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">Search Volume & Intent</span>
                <BarChart3 className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">
                {result.searchVolumeIntent.monthlySearchesEstimate.toLocaleString()}
                <span className="text-xs text-slate-500 font-normal ml-1 font-sans">/mo</span>
              </div>
              <div className="text-[11px] text-blue-700 font-semibold truncate">
                {result.searchVolumeIntent.intentLevel} • {result.searchVolumeIntent.category}
              </div>
            </div>

            {/* Metric 4: SEO & Backlink Insights */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">SEO & Authority</span>
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="flex items-baseline gap-3">
                <div>
                  <span className="text-xs text-slate-500 mr-1">DA:</span>
                  <span className="text-xl sm:text-2xl font-extrabold text-slate-900 font-mono">
                    {result.seoInsights.domainAuthority}
                  </span>
                </div>
                <div className="text-slate-300">|</div>
                <div>
                  <span className="text-xs text-slate-500 mr-1">BL:</span>
                  <span className="text-xl sm:text-2xl font-extrabold text-slate-900 font-mono">
                    {result.seoInsights.backlinks.toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="text-[11px] text-indigo-700 flex items-center gap-1 truncate font-medium">
                <Clock className="w-3 h-3 shrink-0" />
                <span>{result.seoInsights.domainAge}</span>
              </div>
            </div>
          </div>

          {/* Detailed Breakdown: Word 1 + Word 2 Analysis */}
          <div className="p-4 sm:p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Compound Two-Word Breakdown
                </h3>
              </div>
              <span className="text-xs text-slate-500 font-medium">
                {result.words.length === 2 ? 'Strict 2-Word Compound' : 'Single or Irregular'}
              </span>
            </div>

            {/* Word Breakdown Cards */}
            {result.isValidTwoWord && result.word1Analysis && result.word2Analysis ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Word 1 Card */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 relative overflow-hidden">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] uppercase font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Word 1 (Prefix / Anchor)
                    </span>
                    <span className="text-xs font-mono text-slate-500">
                      {result.word1Analysis.length} letters
                    </span>
                  </div>

                  <div className="text-xl font-extrabold text-slate-900 font-mono capitalize">
                    "{result.word1Analysis.word}"
                  </div>

                  <div className="mt-2 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-slate-700">
                      <span className="text-slate-500">Grammar Role:</span>
                      <span className="font-semibold text-slate-900">{result.word1Analysis.partOfSpeech}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-700">
                      <span className="text-slate-500">English Meaning:</span>
                      <span className="text-slate-900 text-right">{result.word1Analysis.meaning}</span>
                    </div>
                  </div>
                </div>

                {/* Word 2 Card */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 relative overflow-hidden">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] uppercase font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      Word 2 (Suffix / Action)
                    </span>
                    <span className="text-xs font-mono text-slate-500">
                      {result.word2Analysis.length} letters
                    </span>
                  </div>

                  <div className="text-xl font-extrabold text-slate-900 font-mono capitalize">
                    "{result.word2Analysis.word}"
                  </div>

                  <div className="mt-2 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-slate-700">
                      <span className="text-slate-500">Grammar Role:</span>
                      <span className="font-semibold text-slate-900">{result.word2Analysis.partOfSpeech}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-700">
                      <span className="text-slate-500">English Meaning:</span>
                      <span className="text-slate-900 text-right">{result.word2Analysis.meaning}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 shrink-0 text-rose-600" />
                <div>
                  <div className="font-bold">Rule Non-Conformance Detected:</div>
                  <p className="text-rose-700 mt-0.5">{result.failureReason}</p>
                </div>
              </div>
            )}

            {/* Verification Checklist Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              <div
                className={`p-2.5 rounded-xl border text-xs flex items-center gap-2 ${
                  result.validationChecks.hasTwoEnglishWords
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800 font-medium'
                    : 'bg-rose-50 border-rose-200 text-rose-800 font-medium'
                }`}
              >
                {result.validationChecks.hasTwoEnglishWords ? (
                  <Check className="w-3.5 h-3.5 stroke-[3] text-emerald-600" />
                ) : (
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                )}
                <span>2 English Words</span>
              </div>

              <div
                className={`p-2.5 rounded-xl border text-xs flex items-center gap-2 ${
                  result.validationChecks.hasNoNumbers
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800 font-medium'
                    : 'bg-rose-50 border-rose-200 text-rose-800 font-medium'
                }`}
              >
                {result.validationChecks.hasNoNumbers ? (
                  <Check className="w-3.5 h-3.5 stroke-[3] text-emerald-600" />
                ) : (
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                )}
                <span>Zero Numbers (0-9)</span>
              </div>

              <div
                className={`p-2.5 rounded-xl border text-xs flex items-center gap-2 ${
                  result.validationChecks.hasNoDashes
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800 font-medium'
                    : 'bg-rose-50 border-rose-200 text-rose-800 font-medium'
                }`}
              >
                {result.validationChecks.hasNoDashes ? (
                  <Check className="w-3.5 h-3.5 stroke-[3] text-emerald-600" />
                ) : (
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                )}
                <span>Zero Hyphens (-)</span>
              </div>

              <div
                className={`p-2.5 rounded-xl border text-xs flex items-center gap-2 ${
                  result.validationChecks.isCleanAlphabetical
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800 font-medium'
                    : 'bg-rose-50 border-rose-200 text-rose-800 font-medium'
                }`}
              >
                {result.validationChecks.isCleanAlphabetical ? (
                  <Check className="w-3.5 h-3.5 stroke-[3] text-emerald-600" />
                ) : (
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                )}
                <span>Pure Letters (A-Z)</span>
              </div>
            </div>

            {/* Strategic Commercial Pitch */}
            {result.pitch && (
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed">
                <span className="font-bold text-blue-700 mr-1.5">Commercial Summary:</span>
                {result.pitch}
              </div>
            )}

            {/* Direct Registrar Catch & Register Actions */}
            <div className="pt-2 border-t border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-700">
                  Catch & Register with Verified Registrars:
                </span>
                <span className="text-[11px] text-emerald-700 font-semibold font-mono">Live Search Links</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <a
                  href={result.registrarLinks.namecheap}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 text-xs font-semibold text-slate-800 transition-all flex items-center justify-between shadow-xs"
                >
                  <span>Namecheap</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>

                <a
                  href={result.registrarLinks.godaddy}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 text-xs font-semibold text-slate-800 transition-all flex items-center justify-between shadow-xs"
                >
                  <span>GoDaddy</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>

                <a
                  href={result.registrarLinks.dynadot}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 text-xs font-semibold text-slate-800 transition-all flex items-center justify-between shadow-xs"
                >
                  <span>Dynadot</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>

                <a
                  href={result.registrarLinks.dropcatch}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 text-xs font-semibold text-slate-800 transition-all flex items-center justify-between shadow-xs"
                >
                  <span>DropCatch</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
