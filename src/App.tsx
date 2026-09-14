import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { FilterControls } from './components/FilterControls';
import { DomainCard } from './components/DomainCard';
import { DomainTable } from './components/DomainTable';
import { SavedDomainsDrawer } from './components/SavedDomainsDrawer';
import { ToastContainer, ToastMessage } from './components/Toast';
import { CheckCatchLogo } from './components/CheckCatchLogo';
import { Footer } from './components/Footer';
import { LegalModal, LegalModalType } from './components/LegalModal';
import {
  DomainItem,
  FilterRules,
  SavedDomain,
  GenerateResponse,
  AppMode,
  FilterEvaluationStats,
  SearchTargetMode,
} from './types';
import {
  exportDomainsToExcel,
  exportDomainsToCsv,
  clientEvaluateBatch,
  clientGenerateDomains,
  enforceStrictDomainItem,
} from './utils/spreadsheet';
import { Language, translations } from './utils/translations';
import {
  Sparkles,
  LayoutGrid,
  Table as TableIcon,
  Search,
  ArrowUpDown,
  Download,
  Copy,
  FileSpreadsheet,
  ChevronDown,
  BookOpen,
  Instagram,
  Facebook,
  MessageCircle,
  ExternalLink,
  AlertCircle,
} from 'lucide-react';

const INITIAL_RULES: FilterRules = {
  exactlyTwoWords: true,
  noDashes: true,
  noNumbers: true,
  tlds: ['.com'],
  auctionMode: false,
  minLetters: 2,
  maxLetters: 25,
};

export default function App() {
  const [lang, setLang] = useState<Language>(() => {
    try {
      return (localStorage.getItem('checkcatch_lang') as Language) || 'en';
    } catch {
      return 'en';
    }
  });

  const t = translations[lang];

  useEffect(() => {
    try {
      localStorage.setItem('checkcatch_lang', lang);
      document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = lang;
    } catch (e) {
      console.error(e);
    }
  }, [lang]);

  const [mode, setMode] = useState<AppMode>('analyzer');
  const [keywords, setKeywords] = useState('AI tools, SaaS, finance, cloud');
  const [count, setCount] = useState(3);
  const [rules, setRules] = useState<FilterRules>(INITIAL_RULES);
  const [generatorDomains, setGeneratorDomains] = useState<DomainItem[]>([]);
  const [spreadsheetDomains, setSpreadsheetDomains] = useState<DomainItem[]>([]);
  const domains = mode === 'analyzer' ? spreadsheetDomains : generatorDomains;
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'match' | 'valuation' | 'alphabetical' | 'top'>('match');
  const [activeTldFilter, setActiveTldFilter] = useState<string>('all');
  const [savedDomains, setSavedDomains] = useState<SavedDomain[]>(() => {
    try {
      const stored = localStorage.getItem('saved_domains');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [isSavedDrawerOpen, setIsSavedDrawerOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [lastGeneratedAt, setLastGeneratedAt] = useState<string | null>(null);
  const [hasServerApiKey, setHasServerApiKey] = useState<boolean>(true);
  const [usedFallback, setUsedFallback] = useState<boolean>(false);
  const [evaluationStats, setEvaluationStats] = useState<FilterEvaluationStats | null>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [selectedBestDomainId, setSelectedBestDomainId] = useState<string | null>(null);
  const [expandAllBreakdowns, setExpandAllBreakdowns] = useState<boolean>(false);
  const [hasAnalyzedSpreadsheet, setHasAnalyzedSpreadsheet] = useState<boolean>(false);
  const [legalModalType, setLegalModalType] = useState<LegalModalType>(null);

  // Synchronize URL hash with legal pages (/about, /contact, /privacy, /terms or #about, #contact, etc.)
  useEffect(() => {
    const handleHashOrPathChange = () => {
      const hash = window.location.hash.replace('#', '').toLowerCase();
      const path = window.location.pathname.replace('/', '').toLowerCase();
      const target = hash || path;
      if (target === 'about' || target === 'contact' || target === 'privacy' || target === 'terms') {
        setLegalModalType(target as LegalModalType);
      }
    };

    handleHashOrPathChange();
    window.addEventListener('hashchange', handleHashOrPathChange);
    window.addEventListener('popstate', handleHashOrPathChange);
    return () => {
      window.removeEventListener('hashchange', handleHashOrPathChange);
      window.removeEventListener('popstate', handleHashOrPathChange);
    };
  }, []);

  const openLegalModal = (type: LegalModalType) => {
    setLegalModalType(type);
    if (type) {
      window.history.pushState(null, '', `#${type}`);
    } else {
      window.history.pushState(null, '', window.location.pathname);
    }
  };

  const closeLegalModal = () => {
    setLegalModalType(null);
    if (window.location.hash) {
      window.history.pushState(null, '', window.location.pathname);
    }
  };

  // Sync saved domains to local storage
  useEffect(() => {
    try {
      localStorage.setItem('saved_domains', JSON.stringify(savedDomains));
    } catch (e) {
      console.error('Failed to persist saved domains', e);
    }
  }, [savedDomains]);

  // Check health on mount
  useEffect(() => {
    fetch('/api/health')
      .then((r) => r.json())
      .then((data) => {
        if (data.hasApiKey !== undefined) {
          setHasServerApiKey(data.hasApiKey);
        }
      })
      .catch(() => {});
  }, []);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = `${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 3200);
  };

  const handleGenerate = async () => {
    setIsLoading(true);

    try {
      const response = await fetch('/api/generate-domains', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keywords,
          count,
          rules,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const data: GenerateResponse = await response.json();
      if (data.success && Array.isArray(data.domains) && data.domains.length > 0) {
        const cleanDomains = data.domains.map((d: DomainItem) => enforceStrictDomainItem(d, rules.tlds));
        setGeneratorDomains(cleanDomains);
        setSelectedBestDomainId(cleanDomains[0].id);
        setLastGeneratedAt(data.generatedAt);
        setUsedFallback(Boolean(data.usedFallback));
        showToast(
          lang === 'ar'
            ? `تم فحص وتثمين ${cleanDomains.length} دومينات مختارة`
            : `Generated ${cleanDomains.length} verified domain candidates`
        );
      } else {
        throw new Error(data.error || 'Failed to generate domains');
      }
    } catch (err: any) {
      console.warn('Deploying local synthesizer:', err?.message || err);
      const localGenerated = clientGenerateDomains(keywords, count, rules).map((d: DomainItem) =>
        enforceStrictDomainItem(d, rules.tlds)
      );
      setGeneratorDomains(localGenerated);
      if (localGenerated.length > 0) {
        setSelectedBestDomainId(localGenerated[0].id);
      }
      setLastGeneratedAt(new Date().toISOString());
      setUsedFallback(true);
      showToast(
        lang === 'ar'
          ? `تم تجهيز ${localGenerated.length} دومينات معتمدة`
          : `Generated ${localGenerated.length} qualified domains`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyzeUploaded = async (
    qualifiedDomains: string[],
    contextTopic: string,
    stats: FilterEvaluationStats,
    searchMode: SearchTargetMode = 'niche',
    targetKeyword: string = '',
    relaxKeywordFilters: boolean = false
  ) => {
    setIsLoading(true);
    setHasAnalyzedSpreadsheet(true);

    if (!qualifiedDomains || qualifiedDomains.length === 0) {
      setSpreadsheetDomains([]);
      setSelectedBestDomainId(null);
      setEvaluationStats({
        ...stats,
        showingCount: 0,
      });
      setIsLoading(false);
      showToast(
        lang === 'ar'
          ? 'لم يتم العثور على أي دومين يطابق الشروط الصارمة (كلمتين فقط مع الكلمة المختارة)'
          : 'No domains matched the strict 2-word criteria with the chosen keyword',
        'info'
      );
      return;
    }

    try {
      const candidatePayload = qualifiedDomains.slice(0, 200);
      const response = await fetch('/api/analyze-domains', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateDomains: candidatePayload,
          count,
          rules,
          contextTopic,
          searchMode,
          targetKeyword,
          relaxKeywordFilters,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const data = await response.json();
      if (data.success && Array.isArray(data.domains)) {
        const cleanDataDomains = data.domains.map((d: DomainItem) => enforceStrictDomainItem(d, rules.tlds));
        const allowedSpreadsheetSet = new Set(
          qualifiedDomains.map((d) => {
            let cl = d.toLowerCase().trim().replace(/https?:\/\//, '').replace(/^www\./, '').split('/')[0];
            if (cl.includes('.')) cl = cl.substring(0, cl.lastIndexOf('.'));
            return cl.replace(/[^a-z0-9-]/g, '');
          })
        );
        const strictSpreadsheet = cleanDataDomains.filter((d: DomainItem) =>
          allowedSpreadsheetSet.has(d.name.toLowerCase().trim())
        );

        setSpreadsheetDomains(strictSpreadsheet);
        if (strictSpreadsheet.length > 0) {
          setSelectedBestDomainId(strictSpreadsheet[0].id);
        } else {
          setSelectedBestDomainId(null);
        }
        setLastGeneratedAt(data.generatedAt || new Date().toISOString());
        setUsedFallback(Boolean(data.usedFallback));
        setEvaluationStats({
          ...stats,
          showingCount: strictSpreadsheet.length,
        });
        if (strictSpreadsheet.length === 0) {
          showToast(
            lang === 'ar'
              ? 'لم تتطابق أي نطاقات من الملف مع الفلاتر الصارمة'
              : 'No domains from file matched active strict filters',
            'info'
          );
        } else {
          showToast(
            lang === 'ar'
              ? `تم تصنيف أفضل ${strictSpreadsheet.length} نطاقات من ملفك`
              : `Ranked Top ${strictSpreadsheet.length} picks from your spreadsheet!`
          );
        }
      } else {
        throw new Error(data.error || 'Evaluation yielded no candidates');
      }
    } catch (err: any) {
      console.warn('Batch evaluation network fallback:', err?.message || err);
      const localEvaluated = clientEvaluateBatch(
        qualifiedDomains,
        count,
        rules,
        contextTopic,
        searchMode,
        targetKeyword
      ).map((d: DomainItem) => enforceStrictDomainItem(d, rules.tlds));
      setSpreadsheetDomains(localEvaluated);
      if (localEvaluated.length > 0) {
        setSelectedBestDomainId(localEvaluated[0].id);
      } else {
        setSelectedBestDomainId(null);
      }
      setLastGeneratedAt(new Date().toISOString());
      setUsedFallback(true);
      setEvaluationStats({
        ...stats,
        showingCount: localEvaluated.length,
      });
      showToast(
        lang === 'ar'
          ? `تم تصنيف أفضل ${localEvaluated.length} دومينات من الملف`
          : `Ranked Top ${localEvaluated.length} picks from spreadsheet`
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    handleGenerate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCopyDomain = (domain: string) => {
    navigator.clipboard.writeText(domain);
    showToast(
      lang === 'ar'
        ? `تم نسخ "${domain}" إلى الحافظة!`
        : `Copied "${domain}" to clipboard!`
    );
  };

  const handleCopyAllGenerated = () => {
    if (domains.length === 0) return;
    const all = domains.map((d) => d.domain).join('\n');
    navigator.clipboard.writeText(all);
    showToast(
      lang === 'ar'
        ? `تم نسخ ${domains.length} دومينات إلى الحافظة!`
        : `Copied all ${domains.length} domains to clipboard!`
    );
  };

  const handleExportExcel = () => {
    if (domains.length === 0) {
      showToast(lang === 'ar' ? 'لا توجد نطاقات لتصديرها' : 'No domains to export', 'info');
      return;
    }
    exportDomainsToExcel(
      domains,
      `checkcatch_${mode === 'analyzer' ? 'portfolio' : 'curated'}_${Date.now()}.xlsx`
    );
    showToast(
      lang === 'ar'
        ? 'تم تصدير الدومينات إلى ملف Excel (.xlsx) بنجاح!'
        : 'Exported domains to Excel (.xlsx) successfully!'
    );
    setShowExportMenu(false);
  };

  const handleExportCsvAdvanced = () => {
    if (domains.length === 0) {
      showToast(lang === 'ar' ? 'لا توجد نطاقات لتصديرها' : 'No domains to export', 'info');
      return;
    }
    exportDomainsToCsv(
      domains,
      `checkcatch_${mode === 'analyzer' ? 'portfolio' : 'curated'}_${Date.now()}.csv`
    );
    showToast(
      lang === 'ar'
        ? 'تم تصدير الدومينات إلى ملف CSV (.csv) بنجاح!'
        : 'Exported domains to CSV (.csv) successfully!'
    );
    setShowExportMenu(false);
  };

  const handleToggleSave = (item: DomainItem) => {
    const exists = savedDomains.some((s) => s.id === item.id);
    if (exists) {
      setSavedDomains((prev) => prev.filter((s) => s.id !== item.id));
      showToast(
        lang === 'ar'
          ? `تمت إزالة "${item.domain}" من المحفوظات`
          : `Removed "${item.domain}" from shortlist`,
        'info'
      );
    } else {
      const newSaved: SavedDomain = { ...item, savedAt: Date.now() };
      setSavedDomains((prev) => [newSaved, ...prev]);
      showToast(
        lang === 'ar'
          ? `تم حفظ "${item.domain}" في المفضلة!`
          : `Saved "${item.domain}" to shortlist!`
      );
    }
  };

  const savedDomainIds = useMemo(() => new Set(savedDomains.map((s) => s.id)), [savedDomains]);

  // Filter & Sort domains
  const filteredAndSortedDomains = useMemo(() => {
    let list = [...domains];

    // Search query filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      list = list.filter(
        (d) =>
          d.domain.toLowerCase().includes(query) ||
          d.pitch.toLowerCase().includes(query) ||
          d.words.some((w) => w.toLowerCase().includes(query))
      );
    }

    // TLD chip filter
    if (activeTldFilter !== 'all') {
      list = list.filter((d) => d.tld === activeTldFilter);
    }

    // Sorting
    list.sort((a, b) => {
      if (sortBy === 'top') {
        if (a.isTopPick && !b.isTopPick) return -1;
        if (!a.isTopPick && b.isTopPick) return 1;
        return b.relevanceScore - a.relevanceScore;
      }
      if (sortBy === 'match') {
        return b.relevanceScore - a.relevanceScore;
      }
      if (sortBy === 'alphabetical') {
        return a.domain.localeCompare(b.domain);
      }
      if (sortBy === 'valuation') {
        const tierRank = { Premium: 3, Brandable: 2, Standard: 1 };
        const diff = (tierRank[b.valuationTier] || 0) - (tierRank[a.valuationTier] || 0);
        if (diff !== 0) return diff;
        return b.relevanceScore - a.relevanceScore;
      }
      return 0;
    });

    return list;
  }, [domains, searchQuery, activeTldFilter, sortBy]);

  const uniqueTldsInResults = useMemo(() => {
    const set = new Set(domains.map((d) => d.tld));
    return Array.from(set);
  }, [domains]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#f0faf8] via-[#f4f9fc] to-[#edf7f6] text-slate-900 font-sans selection:bg-teal-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        savedCount={savedDomains.length}
        onOpenSaved={() => setIsSavedDrawerOpen(true)}
        hasApiKey={hasServerApiKey}
        lang={lang}
        onToggleLang={setLang}
        onOpenLegal={openLegalModal}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        {/* Smart 2-Word Domain Discovery Engine */}
        <section id="batch-analyzer-and-generator-section" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-bold bg-gradient-to-r from-teal-50 to-blue-50 border border-teal-200/80 text-teal-800 shadow-xs">
                <FileSpreadsheet className="w-3.5 h-3.5 text-teal-600" />
                <span>{lang === 'ar' ? 'محرك فحص واكتشاف الدومينات الثنائية' : 'Two-Word Domain Verification & Valuation Engine'}</span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                {lang === 'ar'
                  ? 'فحص وتصفية الدومينات بدقة واختيار أفضل الأسماء المكونة من كلمتين'
                  : 'We Analyze Thousands of Domains to Deliver Only the Finest 2-Word English Names.'}
              </h2>
            </div>
          </div>

          {/* Input & Controls Panel */}
          <FilterControls
            mode={mode}
            setMode={setMode}
            keywords={keywords}
            setKeywords={setKeywords}
            count={count}
            setCount={setCount}
            rules={rules}
            setRules={setRules}
            onGenerate={handleGenerate}
            isLoading={isLoading}
            onAnalyzeUploaded={handleAnalyzeUploaded}
            evaluationStats={evaluationStats}
            setEvaluationStats={setEvaluationStats}
            onErrorToast={(msg) => showToast(msg, 'error')}
            onSuccessToast={(msg) => showToast(msg, 'success')}
            lang={lang}
          />
        </section>

        {/* Results Area */}
        <section id="results-display-section" className="space-y-5">
          {/* Results Action & Filter Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-white/95 border border-teal-100/90 shadow-sm backdrop-blur-xs">
            <div className="flex items-center gap-3 flex-wrap">
              {mode === 'analyzer' ? (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-50 text-teal-800 border border-teal-300 flex items-center gap-1.5">
                    <FileSpreadsheet className="w-3.5 h-3.5 text-teal-700" />
                    {lang === 'ar' ? 'نتائج الملف فقط' : 'Spreadsheet Only'}
                  </span>
                  <span className="text-xs font-semibold text-slate-800">
                    {t.results.showingCount(filteredAndSortedDomains.length, domains.length)}
                  </span>
                  {evaluationStats && (
                    <span className="text-xs text-slate-500">
                      ({evaluationStats.passedFilters} {lang === 'ar' ? 'مؤهل بالملف' : 'qualified in file'})
                    </span>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-900">
                    {lang === 'ar' ? 'الدومينات المعتمدة' : 'Curated Results'}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                    {filteredAndSortedDomains.length} / {domains.length}
                  </span>
                </div>
              )}

              {/* TLD quick filter tabs */}
              <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/80 text-xs flex-wrap">
                <button
                  type="button"
                  onClick={() => setActiveTldFilter('all')}
                  className={`min-h-[38px] px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center justify-center ${
                    activeTldFilter === 'all'
                      ? 'bg-blue-600 text-white font-bold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                  }`}
                >
                  {t.results.allTlds}
                </button>
                {uniqueTldsInResults.map((tld) => (
                  <button
                    key={tld}
                    type="button"
                    onClick={() => setActiveTldFilter(tld)}
                    className={`min-h-[38px] px-2.5 py-1.5 rounded-lg font-mono text-xs transition-all flex items-center justify-center ${
                      activeTldFilter === tld
                        ? 'bg-blue-600 text-white font-bold shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                    }`}
                  >
                    {tld}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
              {/* In-results Search */}
              <div className="relative flex-1 sm:w-48 min-w-[140px]">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="results-search-input"
                  type="text"
                  value={searchQuery}
                  aria-label={t.results.searchPlaceholder || (lang === 'ar' ? 'بحث في النتائج' : 'Search generated results')}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t.results.searchPlaceholder}
                  className="min-h-[44px] w-full bg-slate-50/90 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all shadow-xs"
                />
              </div>

              {/* Sort selector */}
              <div className="min-h-[44px] flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 shadow-xs">
                <ArrowUpDown className="w-4 h-4 text-teal-600 shrink-0" />
                <select
                  id="sort-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  aria-label={lang === 'ar' ? 'ترتيب النطاقات حسب' : 'Sort domains by'}
                  className="bg-transparent text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none cursor-pointer py-1"
                >
                  <option value="match" className="bg-white text-slate-800">
                    {t.results.sortMatch}
                  </option>
                  <option value="top" className="bg-white text-slate-800">
                    {t.results.sortTop}
                  </option>
                  <option value="valuation" className="bg-white text-slate-800">
                    {t.results.sortValuation}
                  </option>
                  <option value="alphabetical" className="bg-white text-slate-800">
                    {t.results.sortAlpha}
                  </option>
                </select>
              </div>

              {/* Copy All */}
              <button
                id="copy-all-btn"
                type="button"
                onClick={handleCopyAllGenerated}
                aria-label={lang === 'ar' ? 'نسخ جميع الدومينات' : 'Copy all domains'}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-slate-50 hover:bg-teal-50 border border-slate-200 hover:border-teal-300 text-slate-700 hover:text-teal-900 transition-colors shadow-xs"
                title={lang === 'ar' ? 'نسخ جميع الدومينات' : 'Copy all domains'}
              >
                <Copy className="w-4 h-4 text-teal-700" />
              </button>

              {/* Export Dropdown with Excel (.xlsx) and CSV (.csv) */}
              <div className="relative">
                <button
                  id="export-dropdown-btn"
                  type="button"
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  className="min-h-[44px] flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-teal-50 to-blue-50 hover:from-teal-100 hover:to-blue-100 text-teal-900 border border-teal-200 text-xs font-bold transition-all shadow-xs"
                  title="Export Picks"
                >
                  <Download className="w-4 h-4 text-teal-700" />
                  <span>{t.results.exportBtn}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-teal-600" />
                </button>

                {showExportMenu && (
                  <div
                    id="export-dropdown-menu"
                    className="absolute right-0 mt-1.5 w-52 bg-white border border-teal-100 rounded-xl shadow-xl p-1.5 z-40 space-y-1 animate-in fade-in"
                  >
                    <button
                      id="export-excel-action-btn"
                      type="button"
                      onClick={handleExportExcel}
                      className="min-h-[44px] w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-semibold text-slate-800 hover:text-teal-800 hover:bg-teal-50 transition-colors text-left"
                    >
                      <FileSpreadsheet className="w-4 h-4 text-teal-600 shrink-0" />
                      <div>
                        <div>{t.results.exportExcel}</div>
                        <div className="text-[10px] text-slate-500 font-normal">
                          .xlsx with valuations & analysis
                        </div>
                      </div>
                    </button>
                    <button
                      id="export-csv-action-btn"
                      type="button"
                      onClick={handleExportCsvAdvanced}
                      className="min-h-[44px] w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-semibold text-slate-800 hover:text-blue-700 hover:bg-blue-50 transition-colors text-left"
                    >
                      <Download className="w-4 h-4 text-blue-600 shrink-0" />
                      <div>
                        <div>{t.results.exportCsv}</div>
                        <div className="text-[10px] text-slate-500 font-normal">
                          .csv spreadsheet format
                        </div>
                      </div>
                    </button>
                  </div>
                )}
              </div>

              {/* Expand / Collapse All Semantic Breakdowns */}
              <button
                id="toggle-expand-all-breakdowns-btn"
                type="button"
                onClick={() => setExpandAllBreakdowns(!expandAllBreakdowns)}
                className={`min-h-[44px] px-3 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs ${
                  expandAllBreakdowns
                    ? 'bg-teal-50 text-teal-800 border-teal-300'
                    : 'bg-slate-50 text-slate-700 hover:text-slate-900 border-slate-200 hover:bg-slate-100'
                }`}
                title={expandAllBreakdowns ? t.results.collapseAllAnalysis : t.results.expandAllAnalysis}
              >
                <BookOpen className="w-4 h-4 text-teal-600" />
                <span className="hidden sm:inline">
                  {expandAllBreakdowns ? t.results.collapseAllAnalysis : t.results.expandAllAnalysis}
                </span>
              </button>

              {/* View Mode Toggle: Cards vs Table */}
              <div className="min-h-[44px] flex items-center bg-slate-100 border border-slate-200 rounded-xl p-0.5">
                <button
                  id="view-mode-card-btn"
                  type="button"
                  onClick={() => setViewMode('card')}
                  aria-label={t.results.cardView}
                  className={`min-h-[40px] min-w-[40px] flex items-center justify-center p-2 rounded-lg transition-colors ${
                    viewMode === 'card'
                      ? 'bg-white text-blue-600 shadow-xs border border-slate-200 font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title={t.results.cardView}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  id="view-mode-table-btn"
                  type="button"
                  onClick={() => setViewMode('table')}
                  aria-label={t.results.tableView}
                  className={`min-h-[40px] min-w-[40px] flex items-center justify-center p-2 rounded-lg transition-colors ${
                    viewMode === 'table'
                      ? 'bg-white text-blue-600 shadow-xs border border-slate-200 font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title={t.results.tableView}
                >
                  <TableIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Render Cards or Table */}
          {isLoading && domains.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center animate-pulse">
                <Sparkles className="w-7 h-7 text-blue-600 animate-spin" />
              </div>
              <div>
                <p className="text-base font-bold text-slate-900">
                  {lang === 'ar' ? 'جاري فحص وانتقاء النطاقات وتثمينها...' : 'Evaluating & Curating Two-Word Domains...'}
                </p>
                <p className="text-xs text-slate-500 max-w-sm mt-1">
                  {lang === 'ar'
                    ? 'تطبيق القواعد الصارمة، فحص الكلمات وتثمين القيمة الاستثمارية'
                    : 'Applying 2-word rules, semantic checks, and calculating valuations'}
                </p>
              </div>
            </div>
          ) : mode === 'analyzer' && spreadsheetDomains.length === 0 ? (
            hasAnalyzedSpreadsheet ? (
              <div id="no-matching-domains-banner" className="py-16 text-center rounded-2xl bg-amber-50/70 border border-amber-200 p-8 space-y-3 shadow-xs">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center mx-auto text-amber-700">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <p className="text-base font-bold text-slate-900">
                  {lang === 'ar' ? 'لم يتم العثور على أي نتائج مطابقة للشروط' : 'No Domains Matched Strict 2-Word Criteria'}
                </p>
                <p className="text-xs text-slate-600 max-w-lg mx-auto leading-relaxed">
                  {lang === 'ar'
                    ? 'لم يتم العثور في الملف على أي دومين يتكون من الكلمة المختارة وكلمة إنجليزية ثانية صحيحة فقط (كلمتين اثنتين). تم استبعاد الدومينات التي تحتوي على 3 كلمات أو أكثر، أو كلمات غير إنجليزية، أو لا تحتوي على الكلمة المطلوبة.'
                    : 'No domains in your uploaded file meet the strict criteria of containing the selected keyword paired with exactly one valid English dictionary word (strictly two words). Domains with 3+ words or non-dictionary elements were disqualified.'}
                </p>
              </div>
            ) : (
              <div className="py-16 text-center rounded-2xl bg-white border border-slate-200 p-8 space-y-3 shadow-xs">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center mx-auto text-blue-600">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <p className="text-base font-bold text-slate-900">
                  {lang === 'ar' ? 'ارفع جدول النطاقات للتحليل والفرز' : 'Upload Spreadsheet to Rank Top Picks'}
                </p>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  {lang === 'ar'
                    ? 'اسحب وأفلت ملف Excel (.xlsx) أو CSV أعلاه لاكتشاف أقوى النطاقات الثنائية المطابقة للشروط الصارمة.'
                    : 'Drop your Excel (.xlsx) or CSV file above to isolate and rank qualified two-word brandable domains.'}
                </p>
              </div>
            )
          ) : filteredAndSortedDomains.length === 0 ? (
            <div className="py-16 text-center rounded-2xl bg-white border border-slate-200 p-8 shadow-xs">
              <Search className="w-10 h-10 text-slate-400 mx-auto mb-3 stroke-1" />
              <p className="text-sm font-semibold text-slate-700">
                {lang === 'ar' ? 'لا توجد نتائج مطابقة لبحثك' : 'No domains match your search filter'}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {lang === 'ar'
                  ? 'جرّب مسح نص البحث أو إعادة ضبط فلتر الامتدادات.'
                  : 'Try clearing your search term or resetting the TLD filter.'}
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setActiveTldFilter('all');
                }}
                className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors"
              >
                {lang === 'ar' ? 'إعادة ضبط الفلاتر' : 'Reset Search Filters'}
              </button>
            </div>
          ) : viewMode === 'card' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAndSortedDomains.map((item, index) => (
                <DomainCard
                  key={item.id}
                  domain={item}
                  rank={index + 1}
                  isSaved={savedDomainIds.has(item.id)}
                  isSelected={selectedBestDomainId ? selectedBestDomainId === item.id : index === 0}
                  forceOpenBreakdown={expandAllBreakdowns}
                  onSelectAsBest={(dom) => {
                    setSelectedBestDomainId(dom.id);
                    showToast(
                      lang === 'ar'
                        ? `تم اختيار "${dom.domain}" كأفضل دومين`
                        : `Selected "${dom.domain}" as best match`
                    );
                  }}
                  onToggleSave={handleToggleSave}
                  onCopyDomain={handleCopyDomain}
                  lang={lang}
                />
              ))}
            </div>
          ) : (
            <DomainTable
              domains={filteredAndSortedDomains}
              savedDomainIds={savedDomainIds}
              selectedBestDomainId={selectedBestDomainId || (filteredAndSortedDomains[0]?.id ?? null)}
              forceOpenBreakdown={expandAllBreakdowns}
              onSelectAsBest={(dom) => {
                setSelectedBestDomainId(dom.id);
                showToast(
                  lang === 'ar'
                    ? `تم اختيار "${dom.domain}" كأفضل دومين`
                    : `Selected "${dom.domain}" as best match`
                );
              }}
              onToggleSave={handleToggleSave}
              onCopyDomain={handleCopyDomain}
              lang={lang}
            />
          )}
        </section>
      </main>

      {/* Footer */}
      <Footer
        lang={lang}
        onOpenLegal={openLegalModal}
        lastGeneratedAt={lastGeneratedAt}
      />

      {/* Legal & Informational Pages Modal */}
      <LegalModal
        type={legalModalType}
        onClose={closeLegalModal}
        lang={lang}
      />

      {/* Saved Domains Drawer */}
      <SavedDomainsDrawer
        isOpen={isSavedDrawerOpen}
        onClose={() => setIsSavedDrawerOpen(false)}
        savedDomains={savedDomains}
        onRemove={(id) => {
          setSavedDomains((prev) => prev.filter((s) => s.id !== id));
          showToast(
            lang === 'ar' ? 'تمت الإزالة من المحفوظات' : 'Removed from shortlist',
            'info'
          );
        }}
        onClearAll={() => {
          setSavedDomains([]);
          showToast(
            lang === 'ar' ? 'تم مسح جميع المحفوظات' : 'Cleared all shortlisted domains',
            'info'
          );
        }}
        onCopyDomain={handleCopyDomain}
        onCopyAll={() => {
          if (savedDomains.length === 0) return;
          const all = savedDomains.map((s) => s.domain).join('\n');
          navigator.clipboard.writeText(all);
          showToast(
            lang === 'ar'
              ? `تم نسخ ${savedDomains.length} دومينات محفوظة!`
              : `Copied ${savedDomains.length} shortlisted domains!`
          );
        }}
        lang={lang}
      />

      {/* Toast Notifications */}
      <ToastContainer
        toasts={toasts}
        onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))}
      />
    </div>
  );
}
