import React, { useState, useRef, useMemo, useEffect } from 'react';
import {
  FileSpreadsheet,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Eye,
  RefreshCw,
  Sliders,
  ChevronDown,
  XCircle,
  KeyRound,
  Target,
} from 'lucide-react';
import { FilterRules, FilterEvaluationStats, UploadedSheetInfo, SearchTargetMode } from '../types';
import { Language, translations } from '../utils/translations';
import {
  parseSpreadsheetFile,
  validateDomainsAgainstRules,
  createSamplePortfolioWorkbook,
} from '../utils/spreadsheet';

interface ExcelUploadAnalyzerProps {
  rules: FilterRules;
  count: number;
  isLoading: boolean;
  onAnalyze: (
    qualifiedDomains: string[],
    contextTopic: string,
    stats: FilterEvaluationStats,
    searchMode: SearchTargetMode,
    targetKeyword: string,
    relaxKeywordFilters?: boolean
  ) => void;
  evaluationStats: FilterEvaluationStats | null;
  setEvaluationStats: React.Dispatch<React.SetStateAction<FilterEvaluationStats | null>>;
  onErrorToast: (msg: string) => void;
  onSuccessToast: (msg: string) => void;
  lang?: Language;
}

const POPULAR_NICHES: Record<Language, string[]> = {
  en: [
    'Fintech & Payments',
    'AI & Machine Learning',
    'Cloud & DevOps',
    'HealthTech & Bio',
    'Cybersecurity',
    'Web3 & Crypto',
    'E-Commerce & Retail',
    'Real Estate & PropTech',
  ],
  ar: [
    'التقنية المالية والمدفوعات (Fintech)',
    'الذكاء الاصطناعي والتعلم الآلي (AI)',
    'الحوسبة السحابية (Cloud & DevOps)',
    'التقنية الصحية والطبية (HealthTech)',
    'الأمن السيبراني (Cybersecurity)',
    'الويب 3 والكريبتو (Web3)',
    'التجارة الإلكترونية (E-Commerce)',
    'التقنية العقارية (PropTech)',
  ],
  fr: [
    'Fintech & Paiements',
    'IA & Apprentissage Automatique',
    'Cloud & DevOps',
    'Santé & Biotech',
    'Cybersécurité',
    'Web3 & Crypto',
    'E-Commerce & Vente',
    'PropTech & Immobilier',
  ],
  es: [
    'Fintech y Pagos',
    'IA y Aprendizaje Automático',
    'Cloud y DevOps',
    'Salud y Biotecnología',
    'Ciberseguridad',
    'Web3 y Cripto',
    'Comercio Electrónico',
    'Bienes Raíces y PropTech',
  ],
};

const POPULAR_KEYWORDS = [
  'AI',
  'Tech',
  'App',
  'Data',
  'Cloud',
  'Smart',
  'Bot',
  'Lab',
  'My',
  'Pro',
  'Hub',
  'Go',
  'Now',
  'Best',
  'Group',
  'Pay',
  'Capital',
  'Invest',
  'Coin',
  'Fund',
  'Health',
  'Care',
  'Home',
  'Shop',
  'Store',
  'Bet',
];

export const ExcelUploadAnalyzer: React.FC<ExcelUploadAnalyzerProps> = ({
  rules,
  count,
  isLoading,
  onAnalyze,
  setEvaluationStats,
  onErrorToast,
  onSuccessToast,
  lang = 'en',
}) => {
  const t = translations[lang] || translations.en;
  const [sheetInfo, setSheetInfo] = useState<UploadedSheetInfo | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [searchMode, setSearchMode] = useState<SearchTargetMode>('keyword');
  const [contextTopic, setContextTopic] = useState('Fintech, AI, and modern SaaS ventures');
  const [targetKeyword, setTargetKeyword] = useState('');
  const [relaxKeywordFilters, setRelaxKeywordFilters] = useState(false);
  const [showDiscardedModal, setShowDiscardedModal] = useState(false);
  const [showDataPreview, setShowDataPreview] = useState(false);
  const [serverStats, setServerStats] = useState<FilterEvaluationStats | null>(null);
  const [serverQualified, setServerQualified] = useState<string[] | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Calculate matching keyword domains directly from sheetInfo for instant UI feedback
  const rawDomainsWithKeyword = useMemo(() => {
    if (!sheetInfo || !targetKeyword.trim()) return [];
    const kw = targetKeyword.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!kw) return [];
    return sheetInfo.detectedDomains.filter((d) => {
      const clean = d.toLowerCase().replace(/https?:\/\//, '').replace(/^www\./, '').replace(/\/.*$/, '');
      const lastDot = clean.lastIndexOf('.');
      const name = lastDot !== -1 ? clean.substring(0, lastDot) : clean;
      return clean.includes(kw) || name.includes(kw) || clean.replace(/[^a-z0-9]/g, '').includes(kw);
    });
  }, [sheetInfo, targetKeyword]);

  // Reset server validation cache whenever rules, searchMode or keyword change
  useEffect(() => {
    setServerStats(null);
    setServerQualified(null);
  }, [rules, searchMode, targetKeyword]);

  // Validate candidates against the master 275k English dictionary via the server validation endpoint
  useEffect(() => {
    if (!sheetInfo || sheetInfo.detectedDomains.length === 0) {
      setServerStats(null);
      setServerQualified(null);
      return;
    }

    let cancelled = false;
    fetch('/api/validate-spreadsheet-domains', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        rawDomains: sheetInfo.detectedDomains,
        rules,
        searchMode,
        targetKeyword,
        contextTopic,
        relaxKeywordFilters,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled && data.success && data.stats) {
          const stats: FilterEvaluationStats = {
            ...data.stats,
            showingCount: Math.min(count, data.qualifiedDomains.length),
          };
          setServerStats(stats);
          setServerQualified(data.qualifiedDomains);
          setEvaluationStats(stats);
        }
      })
      .catch((err) => {
        console.warn('Server pre-validation fallback:', err);
      });

    return () => {
      cancelled = true;
    };
  }, [sheetInfo?.detectedDomains, rules, count, searchMode, targetKeyword, contextTopic, relaxKeywordFilters, setEvaluationStats]);

  // Re-calculate validation whenever sheetInfo, rules, searchMode, or keyword change
  const validationResult = useMemo(() => {
    if (!sheetInfo || sheetInfo.detectedDomains.length === 0) {
      return null;
    }
    if (serverStats && serverQualified) {
      const normTlds = rules.tlds.map((t) => (t.toLowerCase().startsWith('.') ? t.toLowerCase() : `.${t.toLowerCase()}`));
      const tldStrict = normTlds.length > 0
        ? serverQualified.filter((d) => {
            const lastDot = d.lastIndexOf('.');
            const tld = lastDot !== -1 ? d.substring(lastDot).toLowerCase() : '.com';
            return normTlds.includes(tld);
          })
        : serverQualified;

      return {
        stats: {
          ...serverStats,
          passedFilters: tldStrict.length,
          showingCount: Math.min(count, tldStrict.length),
        },
        qualifiedDomains: tldStrict,
      };
    }
    const res = validateDomainsAgainstRules(sheetInfo.detectedDomains, rules, {
      searchMode,
      targetKeyword,
      contextTopic,
      relaxKeywordFilters,
    });
    res.stats.showingCount = Math.min(count, res.qualifiedDomains.length);
    return res;
  }, [sheetInfo, rules, count, searchMode, targetKeyword, contextTopic, relaxKeywordFilters, serverStats, serverQualified]);

  // Handle file selection
  const processSelectedFile = async (file: File) => {
    const validExtensions = ['.xlsx', '.xls', '.csv'];
    const lowerName = file.name.toLowerCase();
    const isValid = validExtensions.some((ext) => lowerName.endsWith(ext));

    if (!isValid) {
      onErrorToast(
        lang === 'ar'
          ? 'يرجى رفع ملف بصيغة Excel (.xlsx, .xls) أو CSV (.csv) صالحة.'
          : lang === 'fr'
          ? 'Veuillez télécharger un fichier Excel (.xlsx, .xls) ou CSV (.csv) valide.'
          : 'Please upload a valid Excel (.xlsx, .xls) or CSV (.csv) file.'
      );
      return;
    }

    try {
      setServerStats(null);
      setServerQualified(null);
      const parsed = await parseSpreadsheetFile(file);
      setSheetInfo(parsed);
      const val = validateDomainsAgainstRules(parsed.detectedDomains, rules);
      val.stats.showingCount = Math.min(count, val.qualifiedDomains.length);
      setEvaluationStats(val.stats);
      onSuccessToast(
        lang === 'ar'
          ? `تم تحميل ${parsed.fileName} مع اكتشاف ${parsed.detectedDomains.length} دومين فريد!`
          : lang === 'fr'
          ? `${parsed.fileName} chargé avec ${parsed.detectedDomains.length} domaines uniques détectés !`
          : `Loaded ${parsed.fileName} with ${parsed.detectedDomains.length} unique domains found!`
      );
    } catch (err: any) {
      console.error(err);
      onErrorToast(err.message || 'Failed to parse spreadsheet');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await processSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await processSelectedFile(e.target.files[0]);
    }
  };

  const handleLoadSample = async () => {
    const sampleFile = createSamplePortfolioWorkbook();
    await processSelectedFile(sampleFile);
  };

  const handleColumnChange = (newColumn: string) => {
    if (!sheetInfo) return;
    const colIdx = sheetInfo.columns.indexOf(newColumn);
    if (colIdx === -1) return;

    const detected: string[] = [];
    const seen = new Set<string>();

    if (sheetInfo.allRows && Array.isArray(sheetInfo.allRows)) {
      for (const row of sheetInfo.allRows) {
        const val = String(row[colIdx] || '').trim();
        const clean = val.replace(/https?:\/\//i, '').replace(/^www\./i, '').replace(/\/.*$/, '').toLowerCase();
        if (clean && !seen.has(clean)) {
          seen.add(clean);
          detected.push(clean);
        }
      }
    } else {
      for (const row of sheetInfo.previewRows) {
        const val = String(row[newColumn] || '').trim();
        const clean = val.replace(/https?:\/\//i, '').replace(/^www\./i, '').replace(/\/.*$/, '').toLowerCase();
        if (clean && !seen.has(clean)) {
          seen.add(clean);
          detected.push(clean);
        }
      }
    }

    setServerStats(null);
    setServerQualified(null);
    const updated: UploadedSheetInfo = {
      ...sheetInfo,
      selectedColumn: newColumn,
      detectedDomains: detected,
    };
    setSheetInfo(updated);
    const val = validateDomainsAgainstRules(detected, rules);
    setEvaluationStats(val.stats);
  };

  const handleRunAnalysis = () => {
    const candidates = validationResult?.qualifiedDomains || [];

    if (!candidates || candidates.length === 0) {
      if (searchMode === 'keyword' && targetKeyword.trim()) {
        onErrorToast(
          lang === 'ar'
            ? `لم يتم العثور على أي دومين يجمع بين الكلمة المختارة "${targetKeyword.trim()}" وكلمة إنجليزية صحيحة أخرى (كلمتين فقط) في الملف المرفوع.`
            : lang === 'fr'
            ? `Aucun domaine de 2 mots combinant "${targetKeyword.trim()}" et un mot anglais valide n'a été trouvé dans le fichier.`
            : `No 2-word domains combining "${targetKeyword.trim()}" and a valid English word were found in your uploaded file.`
        );
      } else {
        onErrorToast(
          lang === 'ar'
            ? 'لم يتم العثور على أي دومينات مطابقة للشروط الصارمة في الملف المرفوع.'
            : lang === 'fr'
            ? 'Aucun domaine conforme aux filtres stricts dans le fichier.'
            : 'No domains matching the strict filters were found in your uploaded file.'
        );
      }
      return;
    }

    const effectiveStats = validationResult?.stats || {
      totalUploaded: sheetInfo?.detectedDomains?.length || 0,
      passedFilters: candidates.length,
      failedCount: Math.max(0, (sheetInfo?.detectedDomains?.length || 0) - candidates.length),
      showingCount: Math.min(count, candidates.length),
      breakdown: { dashes: 0, numbers: 0, tlds: 0, words: 0, invalid: 0, keywordMismatch: 0 },
      discarded: [],
    };

    onAnalyze(
      candidates,
      contextTopic,
      effectiveStats,
      searchMode,
      targetKeyword,
      relaxKeywordFilters
    );
  };

  const currentNiches = POPULAR_NICHES[lang] || POPULAR_NICHES.en;

  return (
    <div id="excel-upload-analyzer-panel" className="space-y-5">
      {/* Drag & Drop File Zone - Compact 50% Size */}
      <div
        id="file-drop-zone"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl py-3 px-4 md:py-3.5 md:px-5 cursor-pointer transition-all duration-200 ${
          isDragging
            ? 'border-teal-500 bg-teal-50/70 scale-[1.005]'
            : sheetInfo
            ? 'border-teal-400 bg-teal-50/50 hover:border-teal-500 hover:bg-teal-50/80'
            : 'border-teal-200/80 bg-gradient-to-r from-teal-50/40 via-sky-50/30 to-blue-50/30 hover:border-teal-400 hover:bg-teal-50/50'
        }`}
      >
        <input
          id="spreadsheet-file-input"
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          aria-label={t.excelAnalyzer.uploadPrompt || 'Upload Excel or CSV spreadsheet file'}
          onChange={handleFileInputChange}
          className="hidden"
        />

        <div className="flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-xs transition-transform ${
                sheetInfo
                  ? 'bg-teal-100 text-teal-800 border border-teal-300'
                  : 'bg-gradient-to-br from-teal-100 to-blue-100 text-teal-800 border border-teal-200'
              }`}
            >
              {sheetInfo ? (
                <FileCheck className="w-5 h-5 text-teal-700" />
              ) : (
                <UploadCloud className="w-5 h-5 text-teal-700" />
              )}
            </div>

            <div>
              {sheetInfo ? (
                <>
                  <div className="font-bold text-xs sm:text-sm text-slate-900 flex items-center gap-2">
                    <span className="truncate max-w-[200px] sm:max-w-xs">{sheetInfo.fileName}</span>
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-semibold bg-teal-100 text-teal-800 border border-teal-200">
                      {(sheetInfo.fileSize / 1024).toFixed(1)} KB
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    {sheetInfo.totalRows} {lang === 'ar' ? 'سطراً' : lang === 'fr' ? 'lignes' : 'rows'} •{' '}
                    {t.excelAnalyzer.domainColumn}{' '}
                    <strong className="text-teal-700 font-bold">{sheetInfo.selectedColumn}</strong>
                  </p>
                </>
              ) : (
                <>
                  <div className="font-bold text-xs sm:text-sm text-slate-900">
                    {t.excelAnalyzer.dropTitle}
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {t.excelAnalyzer.dropSubtitle}
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Instant sample button or replace hint */}
          <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
            {!sheetInfo ? (
              <button
                id="load-sample-spreadsheet-btn"
                type="button"
                onClick={handleLoadSample}
                className="min-h-[44px] inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-white hover:bg-teal-50 border border-teal-200 text-teal-800 hover:text-teal-900 transition-colors shadow-xs"
              >
                <FileSpreadsheet className="w-4 h-4 text-teal-600" />
                {t.excelAnalyzer.loadSample}
              </button>
            ) : (
              <span className="inline-flex items-center min-h-[44px] text-xs text-teal-800 font-bold px-3 py-2 rounded-xl bg-teal-100/70 border border-teal-300">
                {lang === 'ar'
                  ? 'انقر للاستبدال'
                  : lang === 'fr'
                  ? 'Cliquer pour remplacer'
                  : 'Click to replace'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* When a file is loaded: Column selector & Data preview toggle */}
      {sheetInfo && (
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-semibold text-slate-700">
                {t.excelAnalyzer.domainColumn}
              </span>
              <select
                id="select-domain-column"
                value={sheetInfo.selectedColumn}
                onChange={(e) => handleColumnChange(e.target.value)}
                className="bg-white border border-slate-300 text-slate-800 text-xs font-semibold rounded-lg px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {sheetInfo.columns.map((col) => (
                  <option key={col} value={col}>
                    {col}
                  </option>
                ))}
              </select>
            </div>

            <button
              id="toggle-raw-preview-btn"
              type="button"
              onClick={() => setShowDataPreview(!showDataPreview)}
              className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900 transition-colors"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{showDataPreview ? t.excelAnalyzer.hidePreview : t.excelAnalyzer.previewRows}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showDataPreview ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* First 5 rows table preview */}
          {showDataPreview && (
            <div className="mt-2 overflow-x-auto rounded-lg border border-slate-200 shadow-xs">
              <table className="w-full text-left rtl:text-right text-xs">
                <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    {sheetInfo.columns.map((col) => (
                      <th
                        key={col}
                        className={`p-2 font-mono ${
                          col === sheetInfo.selectedColumn ? 'text-emerald-800 bg-emerald-50' : ''
                        }`}
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {sheetInfo.previewRows.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-slate-50">
                      {sheetInfo.columns.map((col) => (
                        <td
                          key={col}
                          className={`p-2 font-mono text-[11px] truncate max-w-xs ${
                            col === sheetInfo.selectedColumn
                              ? 'text-emerald-800 font-semibold bg-emerald-50/50'
                              : 'text-slate-600'
                          }`}
                        >
                          {String(row[col] ?? '')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Target Mode Switcher: Search by Word (Default) vs Search by Niche */}
      <div className="space-y-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-blue-600" />
            <span>{t.excelAnalyzer.targetModeTitle}</span>
          </label>
        </div>

        {/* Dual Mode Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 p-1 bg-slate-100 rounded-xl border border-slate-200 gap-1.5">
          <button
            id="search-mode-keyword-btn"
            type="button"
            onClick={() => {
              setSearchMode('keyword');
              setServerStats(null);
              setServerQualified(null);
            }}
            className={`min-h-[44px] flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-bold transition-all ${
              searchMode === 'keyword'
                ? 'bg-blue-600 text-white shadow-xs border border-blue-600'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white'
            }`}
          >
            <KeyRound className="w-4 h-4 text-white shrink-0" />
            <div className="text-left rtl:text-right">
              <div className="leading-tight">{t.controls.searchByWord}</div>
              <div className="text-[10px] opacity-90 font-normal">{t.excelAnalyzer.searchByKeyword}</div>
            </div>
          </button>

          <button
            id="search-mode-niche-btn"
            type="button"
            onClick={() => {
              setSearchMode('niche');
              setServerStats(null);
              setServerQualified(null);
            }}
            className={`min-h-[44px] flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-bold transition-all ${
              searchMode === 'niche'
                ? 'bg-blue-600 text-white shadow-xs border border-blue-600'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white'
            }`}
          >
            <Target className="w-4 h-4 text-white shrink-0" />
            <div className="text-left rtl:text-right">
              <div className="leading-tight">{t.controls.searchByNiche}</div>
              <div className="text-[10px] opacity-90 font-normal">{t.excelAnalyzer.searchByNiche}</div>
            </div>
          </button>
        </div>

        {/* Dynamic Input based on Active Search Mode (Keyword first, Niche second) */}
        {searchMode === 'keyword' ? (
          <div id="keyword-mode-input-section" className="space-y-2 pt-1">
            <div className="flex items-center justify-between flex-wrap gap-1">
              <label htmlFor="target-keyword-input" className="block text-xs font-semibold text-slate-700">
                {t.excelAnalyzer.targetKeywordLabel}
              </label>
              <span className="text-[10px] text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                {lang === 'ar'
                  ? 'يبحث عن أفضل دومين يحتوي على تلك الكلمة'
                  : lang === 'fr'
                  ? 'Cherche les meilleurs domaines contenant ce mot'
                  : 'Finds top domains containing this word'}
              </span>
            </div>
            <div className="relative">
              <input
                id="target-keyword-input"
                type="text"
                value={targetKeyword}
                aria-label={t.excelAnalyzer.targetKeywordLabel || 'Target Keyword'}
                onChange={(e) => {
                  setTargetKeyword(e.target.value);
                  setServerStats(null);
                  setServerQualified(null);
                }}
                placeholder={t.excelAnalyzer.targetKeywordPlaceholder}
                className="min-h-[44px] w-full rounded-xl bg-white border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-mono shadow-xs"
              />
            </div>

            {/* Arabic Input Detection Notice */}
            {targetKeyword && /[\u0600-\u06FF]/.test(targetKeyword) && (
              <p className="text-[11px] text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>يرجى كتابة الكلمة بالأحرف الإنجليزية (مثل: cloud, pay, data, ai) للبحث في أسماء الدومينات.</span>
              </p>
            )}

            {/* Quick Keyword Suggestion Chips */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[10px] text-slate-500">{t.controls.quickPresets}</span>
              {POPULAR_KEYWORDS.map((kw) => (
                <button
                  key={kw}
                  type="button"
                  onClick={() => {
                    setTargetKeyword(kw);
                    setServerStats(null);
                    setServerQualified(null);
                  }}
                  className={`min-h-[36px] text-xs font-mono px-2.5 py-1.5 rounded-lg border transition-all flex items-center justify-center ${
                    targetKeyword.trim().toLowerCase() === kw.toLowerCase()
                      ? 'bg-blue-600 text-white border-blue-600 font-bold shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  {kw}
                </button>
              ))}
            </div>

            {/* Live Matches Found In Uploaded Spreadsheet */}
            {sheetInfo && targetKeyword.trim() && (
              <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-xs space-y-2 mt-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {rawDomainsWithKeyword.length > 0 ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-800 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    )}
                    <span className="text-xs font-bold text-slate-800">
                      {rawDomainsWithKeyword.length > 0
                        ? lang === 'ar'
                          ? `تم العثور على ${rawDomainsWithKeyword.length} دومين يحتوي على "${targetKeyword.trim()}" في ملفك`
                          : lang === 'fr'
                          ? `${rawDomainsWithKeyword.length} domaine(s) trouvé(s) avec "${targetKeyword.trim()}" dans votre fichier`
                          : `Found ${rawDomainsWithKeyword.length} domain(s) containing "${targetKeyword.trim()}" in your file`
                        : lang === 'ar'
                        ? `لم يتم العثور على دومينات تحتوي على "${targetKeyword.trim()}" في ملفك المرفوع`
                        : lang === 'fr'
                        ? `Aucun domaine contenant "${targetKeyword.trim()}" trouvé dans votre fichier`
                        : `No domains containing "${targetKeyword.trim()}" found in uploaded file`}
                    </span>
                  </div>
                  {rawDomainsWithKeyword.length > 0 && (
                    <span className="text-[10px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-bold">
                      {rawDomainsWithKeyword.length} matches
                    </span>
                  )}
                </div>

                {/* If all keyword domains were excluded by strict 2-word rules, offer instant relaxation */}
                {rawDomainsWithKeyword.length > 0 && validationResult && validationResult.qualifiedDomains.length === 0 && (
                  <div className="pt-2 border-t border-slate-100 space-y-2">
                    <p className="text-[11px] text-amber-800 leading-relaxed">
                      {lang === 'ar'
                        ? 'الدومينات المحتوية على كلمتك لم تجتز شرط الكلمتين الإنجليزيتين الصارم. انقر لتضمينها وتقييمها:'
                        : lang === 'fr'
                        ? 'Les domaines contenant votre mot n’ont pas passé la règle stricte des 2 mots. Cliquez pour les évaluer :'
                        : 'Domains containing your keyword did not meet the strict 2-word rule. Click to evaluate anyway:'}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setRelaxKeywordFilters(true);
                        setServerStats(null);
                        setServerQualified(null);
                      }}
                      className="w-full py-1.5 px-3 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-xs flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>
                        {lang === 'ar'
                          ? `تضمين وتقييم كافة الـ ${rawDomainsWithKeyword.length} دومين المحتوية على "${targetKeyword.trim()}"`
                          : lang === 'fr'
                          ? `Inclure & évaluer les ${rawDomainsWithKeyword.length} domaine(s) contenant "${targetKeyword.trim()}"`
                          : `Include & evaluate all ${rawDomainsWithKeyword.length} domain(s) with "${targetKeyword.trim()}"`}
                      </span>
                    </button>
                  </div>
                )}

                {/* Relaxed filters checkbox toggle */}
                {rawDomainsWithKeyword.length > 0 && (
                  <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                    <input
                      id="relax-keyword-checkbox"
                      type="checkbox"
                      checked={relaxKeywordFilters}
                      onChange={(e) => {
                        setRelaxKeywordFilters(e.target.checked);
                        setServerStats(null);
                        setServerQualified(null);
                      }}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4 bg-white"
                    />
                    <label htmlFor="relax-keyword-checkbox" className="text-[11px] text-slate-700 cursor-pointer select-none">
                      {t.excelAnalyzer.relaxFiltersDesc}
                    </label>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div id="niche-mode-input-section" className="space-y-2 pt-1">
            <div className="flex items-center justify-between flex-wrap gap-1">
              <label htmlFor="target-context-input" className="block text-xs font-semibold text-slate-700">
                {t.excelAnalyzer.contextTopicLabel}
              </label>
              <span className="text-[10px] text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                {lang === 'ar'
                  ? 'يبحث عن أفضل دومينات من ذلك النيش'
                  : lang === 'fr'
                  ? 'Recherche les meilleurs domaines de ce secteur'
                  : 'Ranks best domains for this niche'}
              </span>
            </div>
            <div className="relative">
              <input
                id="target-context-input"
                type="text"
                value={contextTopic}
                aria-label={t.excelAnalyzer.contextTopicLabel || 'Target Niche or Industry Concept'}
                onChange={(e) => setContextTopic(e.target.value)}
                placeholder={t.excelAnalyzer.contextTopicPlaceholder}
                className="min-h-[44px] w-full rounded-xl bg-white border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-xs"
              />
            </div>

            {/* Quick Niche Suggestion Chips */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[10px] text-slate-500">{t.controls.quickPresets}</span>
              {currentNiches.map((niche) => (
                <button
                  key={niche}
                  type="button"
                  onClick={() => setContextTopic(niche)}
                  className={`min-h-[36px] text-xs px-3 py-1.5 rounded-lg border transition-all flex items-center justify-center ${
                    contextTopic.toLowerCase().includes(niche.toLowerCase().split(' ')[0])
                      ? 'bg-blue-600 text-white border-blue-600 font-bold shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  {niche}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Strict Rule Filter Live Preview Badge */}
      {validationResult && (
        <div id="filter-preview-badge-card" className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  {lang === 'ar' ? 'ملخص تدقيق الشروط الصارمة' : lang === 'fr' ? 'Résumé de Vérification Stricte' : 'Strict Rule Verification Summary'}
                </h4>
                {searchMode === 'keyword' && targetKeyword && (
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-bold">
                    "{targetKeyword}"
                  </span>
                )}
              </div>

              {/* Preview badge showing X total uploaded -> Y passed -> Showing Top Z */}
              <div className="mt-1.5 text-sm md:text-base font-extrabold text-slate-900 flex flex-wrap items-center gap-1.5">
                <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-800 border border-slate-200 font-semibold">
                  {validationResult.stats.totalUploaded} {lang === 'ar' ? 'إجمالي الملف' : lang === 'fr' ? 'total fichier' : 'total in file'}
                </span>
                <span className="text-blue-600 font-black">→</span>
                <span className="px-2.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold">
                  {validationResult.stats.passedFilters > 0
                    ? `${validationResult.stats.passedFilters} ${lang === 'ar' ? 'مؤهل (كلمتان)' : lang === 'fr' ? 'qualifiés (2 mots)' : 'qualified candidates'}`
                    : rawDomainsWithKeyword.length > 0
                    ? `${rawDomainsWithKeyword.length} ${lang === 'ar' ? 'مطابق للكلمة' : lang === 'fr' ? 'correspondances' : 'keyword matches'}`
                    : lang === 'ar' ? '0 مؤهل' : lang === 'fr' ? '0 qualifié' : '0 passed'}
                </span>
                <span className="text-blue-600 font-black">→</span>
                <span className="px-2.5 py-0.5 rounded-lg bg-blue-600 text-white font-black shadow-xs">
                  {lang === 'ar'
                    ? `عرض أفضل ${Math.min(count, validationResult.stats.passedFilters || rawDomainsWithKeyword.length)} نتائج`
                    : lang === 'fr'
                    ? `Affichage du Top ${Math.min(count, validationResult.stats.passedFilters || rawDomainsWithKeyword.length)} résultats`
                    : `Showing Top ${Math.min(count, validationResult.stats.passedFilters || rawDomainsWithKeyword.length)} results`}
                </span>
              </div>
            </div>

            {/* Filter failure stats & modal trigger */}
            {validationResult.stats.failedCount > 0 && (
              <button
                id="view-discarded-domains-btn"
                type="button"
                onClick={() => setShowDiscardedModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 transition-all self-start sm:self-auto shadow-xs"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <span>{validationResult.stats.failedCount} {lang === 'ar' ? 'مستبعد' : lang === 'fr' ? 'Écartés' : 'Discarded'}</span>
                <span className="text-[10px] text-amber-700">({lang === 'ar' ? 'الأسباب' : lang === 'fr' ? 'raisons' : 'reasons'})</span>
              </button>
            )}
          </div>

          {/* Quick filter chips breakdown */}
          <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2 text-[11px]">
            <span className="text-slate-500">{lang === 'ar' ? 'استبعادات الشروط:' : lang === 'fr' ? 'Exclusions :' : 'Rule exclusions:'}</span>
            {validationResult.stats.breakdown.dashes > 0 && (
              <span className="px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200 text-slate-700">
                ✗ {validationResult.stats.breakdown.dashes} {lang === 'ar' ? 'شرطات (-)' : lang === 'fr' ? 'tirets' : 'hyphens'}
              </span>
            )}
            {validationResult.stats.breakdown.numbers > 0 && (
              <span className="px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200 text-slate-700">
                ✗ {validationResult.stats.breakdown.numbers} {lang === 'ar' ? 'أرقام (0-9)' : lang === 'fr' ? 'chiffres' : 'digits'}
              </span>
            )}
            {validationResult.stats.breakdown.tlds > 0 && (
              <span className="px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200 text-slate-700">
                ✗ {validationResult.stats.breakdown.tlds} {lang === 'ar' ? 'امتدادات غير محددة' : lang === 'fr' ? 'extensions non sélectionnées' : 'unsupported TLDs'}
              </span>
            )}
            {validationResult.stats.breakdown.words > 0 && (
              <span className="px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200 text-slate-700">
                ✗ {validationResult.stats.breakdown.words} {lang === 'ar' ? 'ليست كلمتين' : lang === 'fr' ? 'non-2 mots' : 'non-2-word names'}
              </span>
            )}
            {Boolean(validationResult.stats.breakdown.keywordMismatch && validationResult.stats.breakdown.keywordMismatch > 0) && (
              <span className="px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-800 font-medium">
                ✗ {validationResult.stats.breakdown.keywordMismatch} {lang === 'ar' ? `لا يحتوي على "${targetKeyword}"` : lang === 'fr' ? `sans le mot "${targetKeyword}"` : `missing "${targetKeyword}"`}
              </span>
            )}
            {Boolean(validationResult.stats.breakdown.lengthMismatch && validationResult.stats.breakdown.lengthMismatch > 0) && (
              <span className="px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200 text-slate-700">
                ✗ {validationResult.stats.breakdown.lengthMismatch} {lang === 'ar' ? 'خارج نطاق عدد الحروف المحدد' : lang === 'fr' ? 'hors longueur' : 'outside char length range'}
              </span>
            )}
            {validationResult.stats.failedCount === 0 && (
              <span className="text-emerald-800 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-800" />
                {lang === 'ar'
                  ? 'جميع دومينات الملف مطابقة للشروط الصارمة بالكامل!'
                  : lang === 'fr'
                  ? 'Tous les domaines du fichier respectent les règles strictes !'
                  : 'All domains in spreadsheet satisfy every active filter rule!'}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Run Analysis Action Button */}
      <div>
        <button
          id="run-batch-analysis-button"
          type="button"
          disabled={
            isLoading ||
            !sheetInfo ||
            !validationResult ||
            validationResult.qualifiedDomains.length === 0
          }
          onClick={handleRunAnalysis}
          className={`w-full py-3.5 px-6 rounded-xl font-bold text-sm flex items-center justify-center gap-2.5 transition-all active:scale-[0.99] border ${
            isLoading ||
            !sheetInfo ||
            !validationResult ||
            validationResult.qualifiedDomains.length === 0
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed border-slate-300'
              : 'bg-blue-600 hover:bg-blue-500 text-white font-black border-blue-600 shadow-md shadow-blue-200'
          }`}
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-white" />
              <span>{t.excelAnalyzer.runningAudit}</span>
            </>
          ) : (
            <>
              <FileCheck className="w-4 h-4 text-white stroke-[2.5]" />
              <span>
                {sheetInfo
                  ? validationResult && validationResult.qualifiedDomains.length === 0
                    ? lang === 'ar'
                      ? 'لا توجد دومينات مؤهلة (تتكون من كلمتين مع الكلمة المختارة)'
                      : lang === 'fr'
                      ? 'Aucun domaine éligible à 2 mots dans le fichier'
                      : 'No 2-word domains matching keyword in file'
                    : t.excelAnalyzer.runAuditBtn(
                        Math.min(count, validationResult?.qualifiedDomains?.length || count)
                      )
                  : lang === 'ar'
                  ? 'ارفع ملف إكسل لتدقيق واصطياد أفضل الدومينات'
                  : lang === 'fr'
                  ? 'Téléchargez un fichier Excel/CSV pour classer les meilleurs domaines'
                  : 'Upload spreadsheet to filter & rank top 2-word domains'}
              </span>
            </>
          )}
        </button>
      </div>

      {/* Discarded Domains Modal */}
      {showDiscardedModal && validationResult && (
        <div
          id="discarded-domains-modal-backdrop"
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setShowDiscardedModal(false)}
        >
          <div
            id="discarded-domains-modal"
            className="bg-white border border-slate-200 rounded-2xl max-w-xl w-full max-h-[80vh] flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  {lang === 'ar'
                    ? `الدومينات المستبعدة (${validationResult.stats.discarded.length})`
                    : lang === 'fr'
                    ? `Domaines Écartés (${validationResult.stats.discarded.length})`
                    : `Discarded Domains (${validationResult.stats.discarded.length})`}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowDiscardedModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-2 flex-1 divide-y divide-slate-100">
              <p className="text-xs text-slate-600 pb-2">
                {lang === 'ar'
                  ? 'تم استبعاد هذه الدومينات تلقائياً لأنها خالفت الشروط الصارمة (تحتوي على شرطات، أرقام، امتدادات غير محددة، أو ليست كلمتين إنجليزيتين).'
                  : lang === 'fr'
                  ? 'Ces domaines ont été exclus car ils enfreignent les règles strictes (tirets, chiffres, extensions non sélectionnées ou non composés de 2 mots).'
                  : 'These domains were automatically excluded because they violated active strict constraints (dashes, digits, unselected TLDs, or non-2-word names).'}
              </p>
              {validationResult.stats.discarded.map((item, idx) => (
                <div key={idx} className="pt-2 flex items-center justify-between gap-3 text-xs">
                  <span className="font-mono text-slate-900 font-semibold">{item.domain}</span>
                  <span className="text-amber-700 text-[11px] font-medium text-right rtl:text-left">{item.reason}</span>
                </div>
              ))}
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setShowDiscardedModal(false)}
                className="px-4 py-1.5 rounded-xl bg-slate-200 text-xs font-semibold text-slate-800 hover:bg-slate-300"
              >
                {lang === 'ar' ? 'إغلاق' : lang === 'fr' ? 'Fermer' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
