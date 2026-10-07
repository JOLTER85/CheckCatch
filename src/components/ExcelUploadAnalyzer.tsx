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
  Clock,
  Tag,
} from 'lucide-react';
import { FilterRules, FilterEvaluationStats, UploadedSheetInfo, SearchTargetMode } from '../types';
import { Language, translations } from '../utils/translations';
import {
  parseSpreadsheetFile,
  validateDomainsAgainstRules,
  createSamplePortfolioWorkbook,
  formatSpreadsheetDate,
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
    relaxKeywordFilters?: boolean,
    metadataMap?: Record<string, { endDate?: string; expirationDate?: string; domainType?: string; rawRow?: Record<string, any> }>
  ) => void;
  evaluationStats: FilterEvaluationStats | null;
  setEvaluationStats: React.Dispatch<React.SetStateAction<FilterEvaluationStats | null>>;
  onErrorToast: (msg: string) => void;
  onSuccessToast: (msg: string) => void;
  lang?: Language;
}

const STANDARD_DOMAIN_TYPES = [
  'ALL',
  'Dropped',
  'Private Seller',
  'Pending Delete',
  'Pre-Release',
];

function normalizeTypeToken(str?: string): string {
  if (!str) return '';
  return str.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function isTypeMatch(itemType?: string, filterType?: string): boolean {
  if (!filterType || filterType === 'ALL') return true;
  const nFilter = normalizeTypeToken(filterType);
  const nItem = normalizeTypeToken(itemType);
  if (!nItem) return false;
  return nItem === nFilter || nItem.includes(nFilter) || nFilter.includes(nItem);
}

function isDateMatch(itemDate?: string, filterDate?: string): boolean {
  if (!filterDate || filterDate === 'ALL') return true;
  if (!itemDate) return false;
  const cleanItem = itemDate.trim().toLowerCase();
  const cleanFilter = filterDate.trim().toLowerCase();
  return cleanItem.startsWith(cleanFilter) || cleanItem === cleanFilter;
}

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
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('ALL');
  const [selectedDateFilter, setSelectedDateFilter] = useState<string>('ALL');
  const [showDiscardedModal, setShowDiscardedModal] = useState(false);
  const [showDataPreview, setShowDataPreview] = useState(false);
  const [serverStats, setServerStats] = useState<FilterEvaluationStats | null>(null);
  const [serverQualified, setServerQualified] = useState<string[] | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Available domain types derived from standard options + types detected in the spreadsheet
  const availableTypes = useMemo(() => {
    const list = [...STANDARD_DOMAIN_TYPES];
    if (sheetInfo?.detectedTypes) {
      for (const t of sheetInfo.detectedTypes) {
        if (!t) continue;
        const normalized = normalizeTypeToken(t);
        const alreadyPresent = list.some((st) => normalizeTypeToken(st) === normalized);
        if (!alreadyPresent) {
          list.push(t);
        }
      }
    }
    return list;
  }, [sheetInfo?.detectedTypes]);

  // Distinct dates detected in the spreadsheet
  const availableDates = useMemo(() => {
    if (sheetInfo?.detectedDates && sheetInfo.detectedDates.length > 0) {
      return sheetInfo.detectedDates;
    }
    const dates = new Set<string>();
    if (sheetInfo?.domainMetadataMap) {
      Object.values(sheetInfo.domainMetadataMap).forEach((m: any) => {
        if (m && m.endDate) {
          const d = String(m.endDate).split(' ')[0];
          if (d) dates.add(d);
        }
      });
    }
    return Array.from(dates).filter(Boolean).sort();
  }, [sheetInfo]);

  // Domain count by type
  const typeCounts = useMemo(() => {
    if (!sheetInfo) return {};
    const counts: Record<string, number> = {};
    for (const t of availableTypes) {
      if (t === 'ALL') {
        counts[t] = sheetInfo.detectedDomains.length;
      } else {
        counts[t] = sheetInfo.detectedDomains.filter((d) => {
          const meta = sheetInfo.domainMetadataMap?.[d.toLowerCase()];
          const domType = meta?.domainType || (sheetInfo.selectedTypeColumn ? meta?.rawRow?.[sheetInfo.selectedTypeColumn] : '');
          return isTypeMatch(String(domType || ''), t);
        }).length;
      }
    }
    return counts;
  }, [sheetInfo, availableTypes]);

  // Domain count by date
  const dateCounts = useMemo(() => {
    if (!sheetInfo) return {};
    const counts: Record<string, number> = {};
    counts['ALL'] = sheetInfo.detectedDomains.length;
    for (const d of availableDates) {
      counts[d] = sheetInfo.detectedDomains.filter((dom) => {
        const meta = sheetInfo.domainMetadataMap?.[dom.toLowerCase()];
        const domDate = meta?.endDate || (sheetInfo.selectedDateColumn ? meta?.rawRow?.[sheetInfo.selectedDateColumn] : '');
        return isDateMatch(String(domDate || ''), d);
      }).length;
    }
    return counts;
  }, [sheetInfo, availableDates]);

  // Filtered candidate domains based on active Type and End Date filters
  const filteredCandidateDomains = useMemo(() => {
    if (!sheetInfo) return [];
    return sheetInfo.detectedDomains.filter((d) => {
      const meta = sheetInfo.domainMetadataMap?.[d.toLowerCase()];
      const domType = meta?.domainType || (sheetInfo.selectedTypeColumn ? meta?.rawRow?.[sheetInfo.selectedTypeColumn] : '');
      const domDate = meta?.endDate || (sheetInfo.selectedDateColumn ? meta?.rawRow?.[sheetInfo.selectedDateColumn] : '');

      const matchesType = isTypeMatch(String(domType || ''), selectedTypeFilter);
      const matchesDate = isDateMatch(String(domDate || ''), selectedDateFilter);
      return matchesType && matchesDate;
    });
  }, [sheetInfo, selectedTypeFilter, selectedDateFilter]);

  // Reset server validation cache whenever rules, type filter or date filter change
  useEffect(() => {
    setServerStats(null);
    setServerQualified(null);
  }, [rules, selectedTypeFilter, selectedDateFilter]);

  // Validate candidate domains against the master 275k English dictionary via server validation endpoint
  useEffect(() => {
    if (!sheetInfo || filteredCandidateDomains.length === 0) {
      setServerStats(null);
      setServerQualified(null);
      return;
    }

    let cancelled = false;
    fetch('/api/validate-spreadsheet-domains', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        rawDomains: filteredCandidateDomains,
        rules,
        searchMode: 'niche',
        targetKeyword: '',
        contextTopic: selectedTypeFilter !== 'ALL' ? selectedTypeFilter : 'Portfolio Domains',
        relaxKeywordFilters: false,
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
  }, [filteredCandidateDomains, rules, count, selectedTypeFilter, setEvaluationStats]);

  // Re-calculate validation whenever sheetInfo, rules, or filtered candidates change
  const validationResult = useMemo(() => {
    if (!sheetInfo || filteredCandidateDomains.length === 0) {
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
    const res = validateDomainsAgainstRules(filteredCandidateDomains, rules, {
      searchMode: 'niche',
      targetKeyword: '',
      contextTopic: selectedTypeFilter !== 'ALL' ? selectedTypeFilter : 'Portfolio',
      relaxKeywordFilters: false,
    });
    res.stats.showingCount = Math.min(count, res.qualifiedDomains.length);
    return res;
  }, [sheetInfo, filteredCandidateDomains, rules, count, selectedTypeFilter, serverStats, serverQualified]);

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

    const dateColIdx = sheetInfo.selectedDateColumn ? sheetInfo.columns.indexOf(sheetInfo.selectedDateColumn) : -1;
    const typeColIdx = sheetInfo.selectedTypeColumn ? sheetInfo.columns.indexOf(sheetInfo.selectedTypeColumn) : -1;
    const newMetadataMap: Record<string, { endDate?: string; expirationDate?: string; domainType?: string; rawRow?: Record<string, any> }> = {};

    if (sheetInfo.allRows && Array.isArray(sheetInfo.allRows)) {
      for (const row of sheetInfo.allRows) {
        const val = String(row[colIdx] || '').trim();
        const clean = val.replace(/https?:\/\//i, '').replace(/^www\./i, '').replace(/\/.*$/, '').toLowerCase();
        if (clean && !seen.has(clean)) {
          seen.add(clean);
          detected.push(clean);
        }
        if (clean) {
          const endDateStr = dateColIdx !== -1 && row[dateColIdx] !== undefined ? formatSpreadsheetDate(row[dateColIdx]) : '';
          const typeStr = typeColIdx !== -1 && row[typeColIdx] !== undefined ? String(row[typeColIdx] ?? '').trim() : '';
          const rowObj: Record<string, any> = {};
          sheetInfo.columns.forEach((col, idx) => {
            rowObj[col] = row[idx] ?? '';
          });
          const entry = {
            endDate: endDateStr || undefined,
            expirationDate: endDateStr || undefined,
            domainType: typeStr || undefined,
            rawRow: rowObj,
          };
          newMetadataMap[clean] = entry;
          const baseClean = clean.split('.')[0].replace(/[^a-z0-9-]/g, '');
          if (baseClean && !newMetadataMap[baseClean]) {
            newMetadataMap[baseClean] = entry;
          }
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
      domainMetadataMap: Object.keys(newMetadataMap).length > 0 ? newMetadataMap : sheetInfo.domainMetadataMap,
    };
    setSheetInfo(updated);
    const val = validateDomainsAgainstRules(detected, rules);
    setEvaluationStats(val.stats);
  };

  const handleTypeColumnChange = (newTypeColumn: string) => {
    if (!sheetInfo) return;
    const typeColIdx = newTypeColumn ? sheetInfo.columns.indexOf(newTypeColumn) : -1;
    const domColIdx = sheetInfo.columns.indexOf(sheetInfo.selectedColumn);
    const dateColIdx = sheetInfo.selectedDateColumn ? sheetInfo.columns.indexOf(sheetInfo.selectedDateColumn) : -1;

    const newMetadataMap: Record<string, { endDate?: string; expirationDate?: string; domainType?: string; rawRow?: Record<string, any> }> = {};
    const newTypes = new Set<string>();

    if (sheetInfo.allRows && Array.isArray(sheetInfo.allRows)) {
      for (const row of sheetInfo.allRows) {
        const val = String(row[domColIdx] || '').trim();
        const clean = val.replace(/https?:\/\//i, '').replace(/^www\./i, '').replace(/\/.*$/, '').toLowerCase();
        if (clean) {
          const endDateStr = dateColIdx !== -1 && row[dateColIdx] !== undefined ? formatSpreadsheetDate(row[dateColIdx]) : '';
          const typeStr = typeColIdx !== -1 && row[typeColIdx] !== undefined ? String(row[typeColIdx] ?? '').trim() : '';
          if (typeStr) newTypes.add(typeStr);

          const rowObj: Record<string, any> = {};
          sheetInfo.columns.forEach((col, idx) => {
            rowObj[col] = row[idx] ?? '';
          });
          const entry = {
            endDate: endDateStr || undefined,
            expirationDate: endDateStr || undefined,
            domainType: typeStr || undefined,
            rawRow: rowObj,
          };
          newMetadataMap[clean] = entry;
          const baseClean = clean.split('.')[0].replace(/[^a-z0-9-]/g, '');
          if (baseClean && !newMetadataMap[baseClean]) {
            newMetadataMap[baseClean] = entry;
          }
        }
      }
    }

    setServerStats(null);
    setServerQualified(null);
    setSheetInfo({
      ...sheetInfo,
      selectedTypeColumn: newTypeColumn || undefined,
      detectedTypes: Array.from(newTypes),
      domainMetadataMap: Object.keys(newMetadataMap).length > 0 ? newMetadataMap : sheetInfo.domainMetadataMap,
    });
  };

  const handleDateColumnChange = (newDateColumn: string) => {
    if (!sheetInfo) return;
    const dateColIdx = newDateColumn ? sheetInfo.columns.indexOf(newDateColumn) : -1;
    const domColIdx = sheetInfo.columns.indexOf(sheetInfo.selectedColumn);
    const typeColIdx = sheetInfo.selectedTypeColumn ? sheetInfo.columns.indexOf(sheetInfo.selectedTypeColumn) : -1;

    const newMetadataMap: Record<string, { endDate?: string; expirationDate?: string; domainType?: string; rawRow?: Record<string, any> }> = {};
    const newDates = new Set<string>();

    if (sheetInfo.allRows && Array.isArray(sheetInfo.allRows)) {
      for (const row of sheetInfo.allRows) {
        const val = String(row[domColIdx] || '').trim();
        const clean = val.replace(/https?:\/\//i, '').replace(/^www\./i, '').replace(/\/.*$/, '').toLowerCase();
        if (clean) {
          const endDateStr = dateColIdx !== -1 && row[dateColIdx] !== undefined ? formatSpreadsheetDate(row[dateColIdx]) : '';
          if (endDateStr) {
            const datePart = endDateStr.split(' ')[0];
            if (datePart) newDates.add(datePart);
          }
          const typeStr = typeColIdx !== -1 && row[typeColIdx] !== undefined ? String(row[typeColIdx] ?? '').trim() : '';

          const rowObj: Record<string, any> = {};
          sheetInfo.columns.forEach((col, idx) => {
            rowObj[col] = row[idx] ?? '';
          });
          const entry = {
            endDate: endDateStr || undefined,
            expirationDate: endDateStr || undefined,
            domainType: typeStr || undefined,
            rawRow: rowObj,
          };
          newMetadataMap[clean] = entry;
          const baseClean = clean.split('.')[0].replace(/[^a-z0-9-]/g, '');
          if (baseClean && !newMetadataMap[baseClean]) {
            newMetadataMap[baseClean] = entry;
          }
        }
      }
    }

    setServerStats(null);
    setServerQualified(null);
    setSheetInfo({
      ...sheetInfo,
      selectedDateColumn: newDateColumn || undefined,
      detectedDates: Array.from(newDates).filter(Boolean).sort(),
      domainMetadataMap: Object.keys(newMetadataMap).length > 0 ? newMetadataMap : sheetInfo.domainMetadataMap,
    });
  };

  const handleRunAnalysis = () => {
    const candidates = validationResult?.qualifiedDomains || [];

    if (!candidates || candidates.length === 0) {
      onErrorToast(
        lang === 'ar'
          ? `لم يتم العثور على أي دومينات ثنائية مطابقة للشروط في النوع [${selectedTypeFilter === 'ALL' ? 'الكل' : selectedTypeFilter}] والتاريخ [${selectedDateFilter === 'ALL' ? 'كل التواريخ' : selectedDateFilter}].`
          : `No two-word domains matched the strict filters for Type [${selectedTypeFilter}] and Date [${selectedDateFilter}].`
      );
      return;
    }

    const effectiveStats = validationResult?.stats || {
      totalUploaded: filteredCandidateDomains.length,
      passedFilters: candidates.length,
      failedCount: Math.max(0, filteredCandidateDomains.length - candidates.length),
      showingCount: Math.min(count, candidates.length),
      breakdown: { dashes: 0, numbers: 0, tlds: 0, words: 0, invalid: 0, keywordMismatch: 0 },
      discarded: [],
    };

    onAnalyze(
      candidates,
      selectedTypeFilter !== 'ALL' ? selectedTypeFilter : 'Curated Portfolio',
      effectiveStats,
      'niche',
      '',
      false,
      sheetInfo?.domainMetadataMap
    );
  };

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
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
              {/* Selected Domain Column */}
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-teal-600" />
                <span className="text-xs font-semibold text-slate-700">
                  {t.excelAnalyzer.domainColumn}
                </span>
                <select
                  id="select-domain-column"
                  value={sheetInfo.selectedColumn}
                  onChange={(e) => handleColumnChange(e.target.value)}
                  className="bg-white border border-slate-300 text-slate-800 text-xs font-semibold rounded-lg px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-teal-500"
                >
                  {sheetInfo.columns.map((col) => (
                    <option key={col} value={col}>
                      {col}
                    </option>
                  ))}
                </select>
              </div>

              {/* Selected Type Column */}
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-semibold text-slate-700">
                  {lang === 'ar' ? 'عمود النوع (Type):' : 'Type Column:'}
                </span>
                <select
                  id="select-type-column"
                  value={sheetInfo.selectedTypeColumn || ''}
                  onChange={(e) => handleTypeColumnChange(e.target.value)}
                  className="bg-white border border-slate-300 text-slate-800 text-xs font-semibold rounded-lg px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="">{lang === 'ar' ? '(تلقائي / غير محدد)' : '(None / Auto-detect)'}</option>
                  {sheetInfo.columns.map((col) => (
                    <option key={col} value={col}>
                      {col}
                    </option>
                  ))}
                </select>
                {sheetInfo.selectedTypeColumn && (
                  <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                    {sheetInfo.selectedTypeColumn}
                  </span>
                )}
              </div>

              {/* Selected End Date Column */}
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-rose-600" />
                <span className="text-xs font-semibold text-slate-700">
                  {lang === 'ar' ? 'عمود تاريخ الانتهاء:' : 'End Date Column:'}
                </span>
                <select
                  id="select-date-column"
                  value={sheetInfo.selectedDateColumn || ''}
                  onChange={(e) => handleDateColumnChange(e.target.value)}
                  className="bg-white border border-slate-300 text-slate-800 text-xs font-semibold rounded-lg px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-rose-500"
                >
                  <option value="">{lang === 'ar' ? '(تلقائي / غير محدد)' : '(None / Auto-detect)'}</option>
                  {sheetInfo.columns.map((col) => (
                    <option key={col} value={col}>
                      {col}
                    </option>
                  ))}
                </select>
                {sheetInfo.selectedDateColumn && (
                  <span className="text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                    {sheetInfo.selectedDateColumn}
                  </span>
                )}
              </div>
            </div>

            <button
              id="toggle-raw-preview-btn"
              type="button"
              onClick={() => setShowDataPreview(!showDataPreview)}
              className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900 transition-colors self-end md:self-auto"
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

      {/* Domain Type & End Date Filter Card (Replaces Target Discovery Strategy) */}
      <div id="type-and-date-filters-card" className="space-y-4 p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 shadow-xs">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wide">
              {lang === 'ar' ? 'فلاتر الدومين: نوع الدومين وتاريخ الانتهاء' : 'Selected Domain & End Date Filters'}
            </h3>
          </div>
          {sheetInfo && (
            <span className="text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              {filteredCandidateDomains.length} / {sheetInfo.detectedDomains.length} {lang === 'ar' ? 'مطابق للفلتر' : 'matching filter'}
            </span>
          )}
        </div>

        {/* 1. Filter by Domain Type (Selected Domain Column) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between flex-wrap gap-1">
            <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-indigo-700" />
              <span>
                {lang === 'ar'
                  ? 'Selected Domain Column (نوع الدومين):'
                  : 'Selected Domain Column (Type):'}
              </span>
            </label>
            <span className="text-xs text-slate-700 font-semibold">
              {lang === 'ar' ? 'اختر أحد الخيارات للفلترة الفورية:' : 'Select an option to filter instantly:'}
            </span>
          </div>

          {/* Type Choice Pills */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {availableTypes.map((typeOption) => {
              const countForType = typeCounts[typeOption] ?? 0;
              const isSelected = selectedTypeFilter === typeOption;

              // High-contrast, WCAG AAA compliant color scheme for each type
              let colorClass = '';
              let badgeClass = '';

              if (typeOption === 'Dropped') {
                if (isSelected) {
                  colorClass = 'bg-emerald-800 text-white border-emerald-900 shadow-sm scale-[1.02]';
                  badgeClass = 'bg-emerald-950 text-emerald-100 font-black';
                } else if (countForType > 0) {
                  colorClass = 'bg-emerald-50 hover:bg-emerald-100 text-emerald-950 border-emerald-300 font-extrabold';
                  badgeClass = 'bg-emerald-200 text-emerald-950 font-black border border-emerald-400';
                } else {
                  colorClass = 'bg-slate-100 text-slate-700 border-slate-300';
                  badgeClass = 'bg-slate-200 text-slate-800 font-bold';
                }
              } else if (typeOption === 'Private Seller') {
                if (isSelected) {
                  colorClass = 'bg-indigo-800 text-white border-indigo-900 shadow-sm scale-[1.02]';
                  badgeClass = 'bg-indigo-950 text-indigo-100 font-black';
                } else if (countForType > 0) {
                  colorClass = 'bg-indigo-50 hover:bg-indigo-100 text-indigo-950 border-indigo-300 font-extrabold';
                  badgeClass = 'bg-indigo-200 text-indigo-950 font-black border border-indigo-400';
                } else {
                  colorClass = 'bg-slate-100 text-slate-700 border-slate-300';
                  badgeClass = 'bg-slate-200 text-slate-800 font-bold';
                }
              } else if (typeOption === 'Pending Delete') {
                if (isSelected) {
                  colorClass = 'bg-rose-800 text-white border-rose-900 shadow-sm scale-[1.02]';
                  badgeClass = 'bg-rose-950 text-rose-100 font-black';
                } else if (countForType > 0) {
                  colorClass = 'bg-rose-50 hover:bg-rose-100 text-rose-950 border-rose-300 font-extrabold';
                  badgeClass = 'bg-rose-200 text-rose-950 font-black border border-rose-400';
                } else {
                  colorClass = 'bg-slate-100 text-slate-700 border-slate-300';
                  badgeClass = 'bg-slate-200 text-slate-800 font-bold';
                }
              } else if (typeOption === 'Pre-Release') {
                if (isSelected) {
                  colorClass = 'bg-amber-800 text-white border-amber-900 shadow-sm scale-[1.02]';
                  badgeClass = 'bg-amber-950 text-amber-100 font-black';
                } else if (countForType > 0) {
                  colorClass = 'bg-amber-50 hover:bg-amber-100 text-amber-950 border-amber-300 font-extrabold';
                  badgeClass = 'bg-amber-200 text-amber-950 font-black border border-amber-400';
                } else {
                  colorClass = 'bg-slate-100 text-slate-700 border-slate-300';
                  badgeClass = 'bg-slate-200 text-slate-800 font-bold';
                }
              } else {
                if (isSelected) {
                  colorClass = 'bg-blue-800 text-white border-blue-900 shadow-sm scale-[1.02]';
                  badgeClass = 'bg-blue-950 text-blue-100 font-black';
                } else if (countForType > 0) {
                  colorClass = 'bg-slate-50 hover:bg-slate-100 text-slate-950 border-slate-300 font-extrabold';
                  badgeClass = 'bg-slate-200 text-slate-950 font-black border border-slate-400';
                } else {
                  colorClass = 'bg-slate-100 text-slate-700 border-slate-300';
                  badgeClass = 'bg-slate-200 text-slate-800 font-bold';
                }
              }

              return (
                <button
                  key={typeOption}
                  id={`type-filter-${typeOption.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                  type="button"
                  onClick={() => {
                    setSelectedTypeFilter(typeOption);
                    setServerStats(null);
                    setServerQualified(null);
                  }}
                  className={`min-h-[42px] px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border ${colorClass}`}
                >
                  <span>{typeOption === 'ALL' ? (lang === 'ar' ? 'ALL (الكل)' : 'ALL') : typeOption}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold ${badgeClass}`}>
                    {countForType}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Filter by End Date (End Date Column) */}
        <div className="space-y-2 pt-3 border-t border-slate-200">
          <div className="flex items-center justify-between flex-wrap gap-1">
            <label htmlFor="select-end-date-filter" className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-rose-700" />
              <span>
                {lang === 'ar'
                  ? 'End Date Column (تاريخ الانتهاء):'
                  : 'End Date Column (Auction End):'}
              </span>
            </label>
            <span className="text-xs text-slate-700 font-semibold">
              {lang === 'ar' ? 'العام: كل التواريخ (ALL)، أو اختر تاريخاً محدداً من القائمة' : 'General: ALL dates, or choose a specific date'}
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <div className="relative flex-1 min-w-[200px]">
              <select
                id="select-end-date-filter"
                value={selectedDateFilter}
                onChange={(e) => {
                  setSelectedDateFilter(e.target.value);
                  setServerStats(null);
                  setServerQualified(null);
                }}
                className="min-h-[44px] w-full rounded-xl bg-white border border-slate-300 px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-xs cursor-pointer"
              >
                <option value="ALL">
                  {lang === 'ar' ? 'ALL — كل التواريخ' : 'ALL — All Dates'} ({sheetInfo?.detectedDomains?.length || 0} {lang === 'ar' ? 'دومين' : 'domains'})
                </option>
                {availableDates.map((d) => (
                  <option key={d} value={d}>
                    📅 {d} ({dateCounts[d] ?? 0} {lang === 'ar' ? 'دومين' : 'domains'})
                  </option>
                ))}
              </select>
            </div>

            {selectedDateFilter !== 'ALL' && (
              <button
                type="button"
                onClick={() => {
                  setSelectedDateFilter('ALL');
                  setServerStats(null);
                  setServerQualified(null);
                }}
                className="min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-extrabold bg-slate-200 hover:bg-slate-300 text-slate-900 border border-slate-300 transition-colors shrink-0"
              >
                {lang === 'ar' ? 'إعادة ضبط التاريخ (ALL)' : 'Reset Date (ALL)'}
              </button>
            )}
          </div>

          {/* Quick Date Chips if 10 or fewer distinct dates */}
          {availableDates.length > 0 && availableDates.length <= 10 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-xs text-slate-700 font-semibold">{lang === 'ar' ? 'تواريخ سريعة:' : 'Quick dates:'}</span>
              <button
                type="button"
                onClick={() => {
                  setSelectedDateFilter('ALL');
                  setServerStats(null);
                  setServerQualified(null);
                }}
                className={`min-h-[32px] text-xs px-2.5 py-1 rounded-lg border font-mono transition-all flex items-center gap-1 ${
                  selectedDateFilter === 'ALL'
                    ? 'bg-rose-800 text-white border-rose-900 font-bold shadow-xs'
                    : 'bg-white text-slate-900 font-bold border-slate-300 hover:bg-slate-100'
                }`}
              >
                <span>ALL</span>
              </button>
              {availableDates.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => {
                    setSelectedDateFilter(d);
                    setServerStats(null);
                    setServerQualified(null);
                  }}
                  className={`min-h-[32px] text-xs px-2.5 py-1 rounded-lg border font-mono transition-all flex items-center gap-1 ${
                    selectedDateFilter === d
                      ? 'bg-rose-800 text-white border-rose-900 font-bold shadow-xs'
                      : 'bg-white text-slate-900 font-bold border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  <span>{d}</span>
                  <span className="font-extrabold">({dateCounts[d] ?? 0})</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Live Filter Summary message */}
        {sheetInfo && (
          <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-200/80 flex items-center justify-between text-xs text-blue-900 font-medium flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
              <span>
                {lang === 'ar'
                  ? `الفلتر المطبق: النوع [${selectedTypeFilter === 'ALL' ? 'الكل' : selectedTypeFilter}] • تاريخ الانتهاء [${selectedDateFilter === 'ALL' ? 'كل التواريخ' : selectedDateFilter}] • المتبقي للفحص: ${filteredCandidateDomains.length} دومين`
                  : `Active Filter: Type [${selectedTypeFilter}] • End Date [${selectedDateFilter}] • Pool: ${filteredCandidateDomains.length} domain(s)`}
              </span>
            </div>
            {(selectedTypeFilter !== 'ALL' || selectedDateFilter !== 'ALL') && (
              <button
                type="button"
                onClick={() => {
                  setSelectedTypeFilter('ALL');
                  setSelectedDateFilter('ALL');
                  setServerStats(null);
                  setServerQualified(null);
                }}
                className="text-[11px] font-bold text-blue-700 hover:underline shrink-0"
              >
                {lang === 'ar' ? 'إعادة ضبط الفلاتر' : 'Reset All'}
              </button>
            )}
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
              </div>

              {/* Preview badge showing X total uploaded -> Y passed -> Showing Top Z */}
              <div className="mt-1.5 text-sm md:text-base font-extrabold text-slate-900 flex flex-wrap items-center gap-1.5">
                <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-800 border border-slate-200 font-semibold">
                  {validationResult.stats.totalUploaded} {lang === 'ar' ? 'إجمالي الدومينات المفلترة' : lang === 'fr' ? 'total filtré' : 'filtered candidate pool'}
                </span>
                <span className="text-blue-600 font-black">→</span>
                <span className="px-2.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold">
                  {validationResult.stats.passedFilters > 0
                    ? `${validationResult.stats.passedFilters} ${lang === 'ar' ? 'مؤهل (كلمتان)' : lang === 'fr' ? 'qualifiés (2 mots)' : 'qualified candidates'}`
                    : lang === 'ar' ? '0 مؤهل' : lang === 'fr' ? '0 qualifié' : '0 passed'}
                </span>
                <span className="text-blue-600 font-black">→</span>
                <span className="px-2.5 py-0.5 rounded-lg bg-blue-600 text-white font-black shadow-xs">
                  {lang === 'ar'
                    ? `عرض أفضل ${Math.min(count, validationResult.stats.passedFilters)} نتائج`
                    : lang === 'fr'
                    ? `Affichage du Top ${Math.min(count, validationResult.stats.passedFilters)} résultats`
                    : `Showing Top ${Math.min(count, validationResult.stats.passedFilters)} results`}
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
            {Boolean(validationResult.stats.breakdown.lengthMismatch && validationResult.stats.breakdown.lengthMismatch > 0) && (
              <span className="px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200 text-slate-700">
                ✗ {validationResult.stats.breakdown.lengthMismatch} {lang === 'ar' ? 'خارج نطاق عدد الحروف المحدد' : lang === 'fr' ? 'hors longueur' : 'outside char length range'}
              </span>
            )}
            {validationResult.stats.failedCount === 0 && (
              <span className="text-emerald-800 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-800" />
                {lang === 'ar'
                  ? 'جميع دومينات الفلتر مطابقة للشروط الصارمة بالكامل!'
                  : lang === 'fr'
                  ? 'Tous les domaines du filtre respectent les règles strictes !'
                  : 'All domains in active filter satisfy every active filter rule!'}
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
