import React, { useState, useMemo } from 'react';
import {
  TypeSafeDomainEvaluation,
  CATEGORY_LABELS,
  evaluateDomainWithTypeSafeRules,
  getExternalDomainBuyUrl,
} from '../utils/typesafeEngine';
import { Language } from '../utils/translations';
import {
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  Star,
  Tag,
  Filter,
  Search,
  CheckCircle2,
  ExternalLink,
  Copy,
  Check,
  TrendingUp,
  Layers,
  Award,
} from 'lucide-react';

interface BulkTypeSafeCheckerProps {
  lang: Language;
  onSuccessToast: (msg: string) => void;
  onErrorToast: (msg: string) => void;
}

const QUICK_SAMPLE_DOMAINS = [
  'cloudnexus.com',
  'swiftpay.ai',
  'healthbio.net',
  'applecloud.com',
  'cashvault.io',
  'neuralforge.ai',
  'nikestore.com',
  'cartflow.com',
];

export const BulkTypeSafeChecker: React.FC<BulkTypeSafeCheckerProps> = ({
  lang,
  onSuccessToast,
  onErrorToast,
}) => {
  const isAr = lang === 'ar';

  const [analyzerTab, setAnalyzerTab] = useState<'single' | 'bulk'>('single');
  const [singleDomainInput, setSingleDomainInput] = useState<string>('cloudnexus.com');
  const [bulkInputText, setBulkInputText] = useState<string>(QUICK_SAMPLE_DOMAINS.join('\n'));
  const [results, setResults] = useState<TypeSafeDomainEvaluation[]>(() => [
    evaluateDomainWithTypeSafeRules('cloudnexus.com'),
    evaluateDomainWithTypeSafeRules('swiftpay.ai'),
    evaluateDomainWithTypeSafeRules('applecloud.com'),
  ]);
  const [isScanning, setIsScanning] = useState(false);
  const [totalLatencyMs, setTotalLatencyMs] = useState<number>(95);
  const [smartFilterHighSafeOnly, setSmartFilterHighSafeOnly] = useState<boolean>(false);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [copiedDomain, setCopiedDomain] = useState<string | null>(null);

  const handleAnalyzeSingleDomain = async (domainToCheck?: string) => {
    const raw = (domainToCheck !== undefined ? domainToCheck : singleDomainInput).trim();
    if (!raw || raw.length < 2) {
      onErrorToast(
        isAr
          ? 'يرجى إدخال اسم الدومين لتقييمه (مثال: cloudnexus.com)'
          : 'Please enter a domain name to analyze (e.g., cloudnexus.com)'
      );
      return;
    }

    const formattedDomain = raw.includes('.') ? raw.toLowerCase() : `${raw.toLowerCase()}.com`;
    setSingleDomainInput(formattedDomain);
    setIsScanning(true);
    const startMs = performance.now();

    // Instant local evaluation for zero-lag UI feedback
    const localEval = evaluateDomainWithTypeSafeRules(formattedDomain);
    setResults((prev) => {
      const filtered = prev.filter((item) => item.domain.toLowerCase() !== formattedDomain);
      return [localEval, ...filtered].slice(0, 50);
    });

    try {
      const response = await fetch('/api/check-domain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: formattedDomain }),
      });

      if (response.ok) {
        const serverEval: TypeSafeDomainEvaluation = await response.json();
        if (serverEval && serverEval.domain) {
          setResults((prev) => {
            const filtered = prev.filter((item) => item.domain.toLowerCase() !== serverEval.domain.toLowerCase());
            return [serverEval, ...filtered].slice(0, 50);
          });
          setTotalLatencyMs(serverEval.latencyMs || Math.max(15, Math.round(performance.now() - startMs)));
        }
      } else {
        setTotalLatencyMs(Math.max(15, Math.round(performance.now() - startMs)));
      }
    } catch {
      setTotalLatencyMs(Math.max(15, Math.round(performance.now() - startMs)));
    } finally {
      setIsScanning(false);
      onSuccessToast(
        isAr
          ? `تم تحليل وتقييم الدومين "${formattedDomain}" عبر TypeSafe AI بنجاح!`
          : `Successfully analyzed "${formattedDomain}" via TypeSafe AI!`
      );
    }
  };

  const handleRunBulkCheck = async (overrideText?: string) => {
    const rawText = overrideText !== undefined ? overrideText : bulkInputText;
    const rawList = rawText
      .split(/[\n,;]+/)
      .map((s) => s.trim().toLowerCase())
      .filter((s) => s.length >= 2)
      .map((s) => (s.includes('.') ? s : `${s}.com`));

    if (rawList.length === 0) {
      onErrorToast(
        isAr
          ? 'يرجى إدخال دومين واحد على الأقل للفحص'
          : 'Please enter at least one domain to analyze'
      );
      return;
    }

    setIsScanning(true);
    const startMs = performance.now();

    const instantResults = rawList.slice(0, 150).map((d) => evaluateDomainWithTypeSafeRules(d));
    setResults(instantResults);

    try {
      const response = await fetch('/api/check-domains-bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          domains: rawList.slice(0, 150),
        }),
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success && Array.isArray(data.results)) {
          setResults(data.results);
          setTotalLatencyMs(data.totalLatencyMs || Math.round(performance.now() - startMs));
        }
      } else {
        setTotalLatencyMs(Math.max(18, Math.round(performance.now() - startMs)));
      }
    } catch {
      setTotalLatencyMs(Math.max(18, Math.round(performance.now() - startMs)));
    } finally {
      setIsScanning(false);
      onSuccessToast(
        isAr
          ? `تم تحليل وتقييم ${instantResults.length} دومين عبر TypeSafe AI!`
          : `Analyzed ${instantResults.length} domains via TypeSafe AI!`
      );
    }
  };

  const handleCopy = (domain: string) => {
    navigator.clipboard.writeText(domain);
    setCopiedDomain(domain);
    setTimeout(() => setCopiedDomain(null), 2000);
    onSuccessToast(isAr ? `تم نسخ "${domain}"` : `Copied "${domain}"`);
  };

  const filteredResults = useMemo(() => {
    return results.filter((item) => {
      if (smartFilterHighSafeOnly) {
        if (item.hasRisk || item.score < 4) return false;
      }
      if (selectedCategoryFilter !== 'all' && item.category !== selectedCategoryFilter) {
        return false;
      }
      return true;
    });
  }, [results, smartFilterHighSafeOnly, selectedCategoryFilter]);

  return (
    <section
      id="ai-domain-analyzer-section"
      className="rounded-2xl bg-white border border-teal-200/90 p-5 sm:p-6 shadow-md space-y-6"
      dir={isAr ? 'rtl' : 'ltr'}
    >
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-xs">
              <Sparkles className="w-3.5 h-3.5" />
              {isAr ? 'أداة التقييم والتحليل الذكي للدومينات (AI Domain Analyzer)' : 'AI Domain Analyzer • Powered by TypeSafe AI'}
            </span>
            <span className="text-xs font-mono font-semibold text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200 tabular-nums">
              {isAr ? `زمن الفحص: ~${totalLatencyMs}ms` : `Response: ~${totalLatencyMs}ms`}
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
            {isAr
              ? 'افحص أي دومين بالذكاء الاصطناعي: الأمان من العلامات التجارية، نسبة الجودة، التصنيف، ودرجة الاستثمار'
              : 'Evaluate Any Domain with TypeSafe AI: Trademark Safety, Brand Quality %, Industry Category & Investment Score'}
          </h2>
        </div>

        {/* Mode Switcher: Single vs Bulk */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 self-start lg:self-auto">
          <button
            id="analyzer-tab-single-btn"
            type="button"
            onClick={() => setAnalyzerTab('single')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
              analyzerTab === 'single'
                ? 'bg-white text-teal-900 shadow-xs border border-teal-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {isAr ? 'فحص دومين مفرد' : 'Single Domain Check'}
          </button>
          <button
            id="analyzer-tab-bulk-btn"
            type="button"
            onClick={() => setAnalyzerTab('bulk')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
              analyzerTab === 'bulk'
                ? 'bg-white text-teal-900 shadow-xs border border-teal-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {isAr ? 'الفحص بالجملة (Bulk)' : 'Bulk Domain Check'}
          </button>
        </div>
      </div>

      {/* Input Area */}
      {analyzerTab === 'single' ? (
        <div className="space-y-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAnalyzeSingleDomain();
            }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-teal-600 absolute top-1/2 -translate-y-1/2 left-4 pointer-events-none" />
              <input
                id="ai-domain-analyzer-input"
                type="text"
                dir="ltr"
                value={singleDomainInput}
                onChange={(e) => setSingleDomainInput(e.target.value)}
                placeholder="e.g. cloudnexus.com, swiftpay.ai, applecloud.com..."
                className="w-full min-h-[50px] pl-12 pr-4 py-3 rounded-xl bg-slate-50 border-2 border-slate-200 focus:border-teal-500 focus:bg-white text-base font-mono font-bold text-slate-900 placeholder-slate-400 focus:outline-none transition-all shadow-xs"
              />
            </div>
            <button
              id="ai-domain-analyzer-submit-btn"
              type="submit"
              disabled={isScanning}
              className="min-h-[50px] px-6 py-3 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-bold text-sm shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
            >
              <Sparkles className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
              <span>
                {isScanning
                  ? isAr
                    ? 'جاري التحليل...'
                    : 'Analyzing...'
                  : isAr
                  ? 'تقييم وتحليل الدومين بالذكاء الاصطناعي'
                  : 'Analyze Domain with AI'}
              </span>
            </button>
          </form>

          {/* Quick Test Pills */}
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <span className="font-semibold text-slate-500">
              {isAr ? 'جرّب فحص دومين فوري:' : 'Quick test domains:'}
            </span>
            {QUICK_SAMPLE_DOMAINS.slice(0, 6).map((sample) => (
              <button
                key={sample}
                type="button"
                dir="ltr"
                onClick={() => handleAnalyzeSingleDomain(sample)}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-teal-50 text-slate-700 hover:text-teal-900 border border-slate-200 hover:border-teal-300 font-mono text-xs transition-colors"
              >
                {sample}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          <div className="lg:col-span-8 space-y-2">
            <div className="flex items-center justify-between">
              <label
                htmlFor="bulk-typesafe-textarea"
                className="text-xs font-bold text-slate-700 flex items-center gap-1.5"
              >
                <Layers className="w-4 h-4 text-teal-600" />
                <span>
                  {isAr
                    ? 'أدخل قائمة الدومينات لتحليلها دفعة واحدة (دومين في كل سطر):'
                    : 'Enter list of domains for parallel AI evaluation (one per line):'}
                </span>
              </label>
              <button
                type="button"
                onClick={() => {
                  const sampleText = QUICK_SAMPLE_DOMAINS.join('\n');
                  setBulkInputText(sampleText);
                  handleRunBulkCheck(sampleText);
                }}
                className="text-xs font-semibold text-teal-700 hover:text-teal-900 underline cursor-pointer"
              >
                {isAr ? 'تحميل قائمة تجريبية وفحصها' : 'Load sample list & analyze'}
              </button>
            </div>
            <textarea
              id="bulk-typesafe-textarea"
              rows={4}
              dir="ltr"
              value={bulkInputText}
              onChange={(e) => setBulkInputText(e.target.value)}
              placeholder="cloudnexus.com&#10;swiftpay.ai&#10;applecloud.com"
              className="w-full rounded-xl bg-slate-50 border border-slate-200 p-3 font-mono text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
            />
          </div>
          <div className="lg:col-span-4 flex flex-col justify-end h-full pt-6">
            <button
              id="run-bulk-typesafe-btn"
              type="button"
              onClick={() => handleRunBulkCheck()}
              disabled={isScanning}
              className="w-full min-h-[48px] py-3 px-4 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
              <span>
                {isScanning
                  ? isAr
                    ? 'جاري الفحص المتوازي...'
                    : 'Analyzing in parallel...'
                  : isAr
                  ? 'بدء التقييم الذكي للقائمة'
                  : 'Analyze Domains List'}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Smart Filters Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
            <Filter className="w-4 h-4 text-teal-600" />
            <span>{isAr ? 'فلاتر التقييم الذكية:' : 'Smart Evaluation Filters:'}</span>
          </div>

          <button
            id="smart-filter-score4-safe-btn"
            type="button"
            onClick={() => setSmartFilterHighSafeOnly(!smartFilterHighSafeOnly)}
            className={`min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
              smartFilterHighSafeOnly
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-teal-50'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            <span>
              {isAr
                ? 'إظهار الدومينات ذات التقييم 4 فأكثر وخالية من المخاطر'
                : 'Show Score ≥ 4 & Trademark-Safe Only'}
            </span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <Tag className="w-3.5 h-3.5 text-slate-500" />
          <select
            id="smart-category-filter-select"
            value={selectedCategoryFilter}
            onChange={(e) => setSelectedCategoryFilter(e.target.value)}
            aria-label={isAr ? 'تصفية حسب المجال' : 'Filter by industry category'}
            className="min-h-[36px] rounded-lg bg-white border border-slate-300 px-2.5 py-1 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="all">{isAr ? 'جميع المجالات (All Categories)' : 'All Categories'}</option>
            <option value="tech_ai">Tech / AI</option>
            <option value="finance">Finance</option>
            <option value="ecommerce">E-Commerce</option>
            <option value="health">Health</option>
            <option value="crypto">Crypto</option>
            <option value="general_junk">General</option>
          </select>
        </div>
      </div>

      {/* Attractive Evaluation Cards Grid (بطاقات التقييم الذكية) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredResults.map((item) => {
          const catMeta = CATEGORY_LABELS[item.category] || CATEGORY_LABELS.tech_ai;
          const qualityPercent = Math.round((item.brandProbability || 0.85) * 100);
          const buyUrl = getExternalDomainBuyUrl(item.domain);

          return (
            <div
              key={item.domain}
              className={`rounded-2xl p-5 border transition-all flex flex-col justify-between space-y-4 shadow-xs hover:shadow-md ${
                item.hasRisk
                  ? 'bg-rose-50/30 border-rose-200'
                  : item.score >= 4
                  ? 'bg-white border-teal-300 ring-1 ring-teal-500/20'
                  : 'bg-white border-slate-200'
              }`}
            >
              <div className="space-y-3.5">
                {/* Top Row: Category Badge & Safety Shield Badge */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  {/* 🏷️ التصنيف والمجال المناسب (category) */}
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border ${catMeta.badgeClass}`}
                  >
                    <Tag className="w-3.5 h-3.5 shrink-0" />
                    <span>{isAr ? catMeta.ar : catMeta.en}</span>
                  </span>

                  {/* 🛡️ شارة الأمان من العلامات التجارية (has_trademark_risk) */}
                  {item.hasRisk ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-100 text-rose-900 border border-rose-300">
                      <span aria-hidden="true">🔴</span>
                      <ShieldAlert className="w-3.5 h-3.5 text-rose-700 shrink-0" />
                      <span>
                        {isAr
                          ? `خطر علامة تجارية (${item.matchedTrademark || 'مسجلة'})`
                          : `Trademark Risk (${item.matchedTrademark || 'Protected'})`}
                      </span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-900 border border-emerald-300">
                      <span aria-hidden="true">🟢</span>
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{isAr ? 'آمن من العلامات التجارية' : 'Trademark Safe'}</span>
                    </span>
                  )}
                </div>

                {/* Domain Name & Copy */}
                <div className="flex items-center justify-between gap-2 pt-1">
                  <h3
                    className="text-xl font-extrabold font-mono text-slate-900 tracking-tight break-all"
                    dir="ltr"
                  >
                    {item.domain}
                  </h3>
                  <button
                    type="button"
                    onClick={() => handleCopy(item.domain)}
                    className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors shrink-0"
                    title={isAr ? 'نسخ الدومين' : 'Copy domain'}
                  >
                    {copiedDomain === item.domain ? (
                      <Check className="w-4 h-4 text-emerald-700" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* Metrics Grid: Quality Percentage (is_brandable) & Investment Score (investment_score) */}
                <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/90">
                  {/* نسبة الجودة والسهولة (is_brandable) */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-600 flex items-center gap-1">
                        <TrendingUp className="w-3.5 h-3.5 text-teal-600" />
                        {isAr ? 'نسبة الجودة والسهولة' : 'Brand Quality'}
                      </span>
                    </div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-lg font-extrabold font-mono text-teal-800 tabular-nums">
                        {qualityPercent}%
                      </span>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          item.brandable
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {item.brandable
                          ? isAr
                            ? 'قابل للبراند'
                            : 'Brandable'
                          : isAr
                          ? 'متوسط'
                          : 'Moderate'}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          qualityPercent >= 80 ? 'bg-teal-600' : 'bg-amber-500'
                        }`}
                        style={{ width: `${qualityPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* درجة التقييم الاستثماري (investment_score) */}
                  <div className="space-y-1.5">
                    <div className="text-xs font-bold text-slate-600 flex items-center gap-1">
                      <Award className="w-3.5 h-3.5 text-amber-500" />
                      <span>{isAr ? 'درجة التقييم' : 'Investment Score'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-lg font-extrabold font-mono text-slate-900 tabular-nums">
                        {item.score}/5
                      </span>
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((starNum) => (
                          <Star
                            key={starNum}
                            className={`w-3.5 h-3.5 ${
                              starNum <= item.score
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-slate-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="text-[11px] font-semibold text-slate-600">
                      {item.score >= 4
                        ? isAr
                          ? 'قيمة استثمارية عالية'
                          : 'High Resale Potential'
                        : item.score === 3
                        ? isAr
                          ? 'قيمة متوسطة جيدة'
                          : 'Moderate Potential'
                        : isAr
                        ? 'قيمة محدودة'
                        : 'Low Potential'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Button: اشترِ الدومين الآن (External Link) */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                <a
                  href={buyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full min-h-[44px] py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs hover:shadow transition-all"
                >
                  <span>{isAr ? 'اشترِ الدومين الآن' : 'Buy Domain Now (اشترِ الدومين الآن)'}</span>
                  <ExternalLink className="w-4 h-4 shrink-0" />
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
