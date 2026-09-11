import React, { useState } from 'react';
import { FilterRules, AppMode, FilterEvaluationStats, SearchTargetMode } from '../types';
import {
  Target,
  SlidersHorizontal,
  Check,
  RefreshCw,
  Clock,
  Hash,
  Minus,
  BookOpen,
  FileSpreadsheet,
  KeyRound,
  Sparkles,
  Type,
} from 'lucide-react';
import { ExcelUploadAnalyzer } from './ExcelUploadAnalyzer';
import { Language, translations } from '../utils/translations';

interface FilterControlsProps {
  mode: AppMode;
  setMode: (val: AppMode) => void;
  keywords: string;
  setKeywords: (val: string) => void;
  count: number;
  setCount: (val: number) => void;
  rules: FilterRules;
  setRules: React.Dispatch<React.SetStateAction<FilterRules>>;
  onGenerate: () => void;
  isLoading: boolean;
  onAnalyzeUploaded: (
    qualifiedDomains: string[],
    contextTopic: string,
    stats: FilterEvaluationStats,
    searchMode: SearchTargetMode,
    targetKeyword: string
  ) => void;
  evaluationStats: FilterEvaluationStats | null;
  setEvaluationStats: React.Dispatch<React.SetStateAction<FilterEvaluationStats | null>>;
  onErrorToast: (msg: string) => void;
  onSuccessToast: (msg: string) => void;
  lang: Language;
}

const POPULAR_TLDS = [
  { ext: '.com', label: '.com (Gold Standard)' },
  { ext: '.ai', label: '.ai (Artificial Intelligence)' },
  { ext: '.io', label: '.io (Tech & SaaS)' },
  { ext: '.co', label: '.co (Modern Brand)' },
  { ext: '.net', label: '.net (Infrastructure)' },
  { ext: '.org', label: '.org (Organization)' },
  { ext: '.tech', label: '.tech (Developer)' },
  { ext: '.xyz', label: '.xyz (Modern Web)' },
];

const PRESET_TOPICS = [
  'AI tools, SaaS, finance, cloud',
  'DevOps, automation, infrastructure',
  'Fintech, payments, crypto ledger',
  'HealthTech, wellness, biometrics',
  'Cybersecurity, privacy, zero trust',
  'E-commerce, direct-to-consumer brand',
];

export const FilterControls: React.FC<FilterControlsProps> = ({
  mode,
  setMode,
  keywords,
  setKeywords,
  count,
  setCount,
  rules,
  setRules,
  onGenerate,
  isLoading,
  onAnalyzeUploaded,
  evaluationStats,
  setEvaluationStats,
  onErrorToast,
  onSuccessToast,
  lang,
}) => {
  const t = translations[lang];

  const isInitialCustom = ![3, 5, 10].includes(count);
  const [isCustomMode, setIsCustomMode] = useState<boolean>(isInitialCustom);
  const [genSearchMode, setGenSearchMode] = useState<'keyword' | 'niche'>('keyword');

  const toggleRule = (key: keyof FilterRules) => {
    setRules((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const toggleTld = (tld: string) => {
    setRules((prev) => {
      const exists = prev.tlds.includes(tld);
      if (exists) {
        if (prev.tlds.length <= 1) return prev;
        return { ...prev, tlds: prev.tlds.filter((t) => t !== tld) };
      } else {
        return { ...prev, tlds: [...prev.tlds, tld] };
      }
    });
  };

  const selectComOnly = () => {
    setRules((prev) => ({
      ...prev,
      tlds: ['.com'],
    }));
  };

  const selectAllTlds = () => {
    setRules((prev) => ({
      ...prev,
      tlds: POPULAR_TLDS.map((t) => t.ext),
    }));
  };

  const selectTopTldsOnly = () => {
    setRules((prev) => ({
      ...prev,
      tlds: ['.com', '.ai', '.io', '.co'],
    }));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      if (!isLoading) {
        onGenerate();
      }
    }
  };

  return (
    <div
      id="controls-panel"
      className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6 shadow-sm"
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
    >
      {/* Header */}
      <div className="pb-3 border-b border-slate-100 mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-blue-600" />
          <h2 className="text-xs font-bold tracking-wide text-slate-800 uppercase">
            CheckCatch
          </h2>
        </div>
      </div>

      <div className="space-y-6">
        {/* Excel / CSV Spreadsheet Analyzer Component (Direct primary dropzone) */}
        <ExcelUploadAnalyzer
          rules={rules}
          count={count}
          isLoading={isLoading}
          onAnalyze={onAnalyzeUploaded}
          evaluationStats={evaluationStats}
          setEvaluationStats={setEvaluationStats}
          onErrorToast={onErrorToast}
          onSuccessToast={onSuccessToast}
          lang={lang}
        />

        {/* Target Domain Output Count (Top 3, Top 5, Top 10, Custom 1 to 25) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-slate-700">
              {t.controls.countLabel}
            </label>
            <span className="text-[11px] font-mono text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              {count} {lang === 'ar' ? 'دومين' : 'domains'}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {/* Option 1: Top 3 */}
            <button
              id="domain-count-btn-3"
              type="button"
              onClick={() => {
                setCount(3);
                setIsCustomMode(false);
              }}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                count === 3 && !isCustomMode
                  ? 'bg-blue-600 text-white border-blue-600 font-black shadow-xs'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
              }`}
            >
              {t.controls.countTop3}
            </button>

            {/* Option 2: Top 5 */}
            <button
              id="domain-count-btn-5"
              type="button"
              onClick={() => {
                setCount(5);
                setIsCustomMode(false);
              }}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                count === 5 && !isCustomMode
                  ? 'bg-blue-600 text-white border-blue-600 font-black shadow-xs'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
              }`}
            >
              {t.controls.countTop5}
            </button>

            {/* Option 3: Top 10 */}
            <button
              id="domain-count-btn-10"
              type="button"
              onClick={() => {
                setCount(10);
                setIsCustomMode(false);
              }}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                count === 10 && !isCustomMode
                  ? 'bg-blue-600 text-white border-blue-600 font-black shadow-xs'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
              }`}
            >
              {t.controls.countTop10}
            </button>

            {/* Option 4: Custom 1 to 25 */}
            <button
              id="domain-count-btn-custom"
              type="button"
              onClick={() => {
                setIsCustomMode(true);
                if (count === 3 || count === 5 || count === 10) {
                  setCount(7);
                }
              }}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                isCustomMode || ![3, 5, 10].includes(count)
                  ? 'bg-blue-600 text-white border-blue-600 font-black shadow-xs'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
              }`}
            >
              {isCustomMode || ![3, 5, 10].includes(count)
                ? `${lang === 'ar' ? 'اختياري' : 'Custom'}: ${count}`
                : t.controls.countCustom}
            </button>
          </div>

          {/* Interactive Range & Stepper for Custom (1 to 25) */}
          {(isCustomMode || ![3, 5, 10].includes(count)) && (
            <div className="mt-3 p-3.5 rounded-xl bg-slate-50 border border-blue-200 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-700 font-semibold">{t.controls.countCustomRange}</span>
                <span className="font-mono font-black text-blue-700 text-sm bg-blue-100/60 px-2.5 py-0.5 rounded border border-blue-200">
                  {count} {lang === 'ar' ? 'دومين' : 'domains'}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setCount(Math.max(1, count - 1))}
                  className="w-8 h-8 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 flex items-center justify-center font-bold text-base select-none transition-colors shadow-xs"
                >
                  -
                </button>

                <input
                  type="range"
                  min={1}
                  max={25}
                  step={1}
                  value={count}
                  onChange={(e) => setCount(Number(e.target.value))}
                  className="flex-1 accent-blue-600 cursor-pointer h-2 bg-slate-200 rounded-lg appearance-none"
                />

                <button
                  type="button"
                  onClick={() => setCount(Math.min(25, count + 1))}
                  className="w-8 h-8 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 flex items-center justify-center font-bold text-base select-none transition-colors shadow-xs"
                >
                  +
                </button>
              </div>

              <div className="flex justify-between text-[10px] text-slate-500 font-mono px-1">
                <span>1</span>
                <span>5</span>
                <span>10</span>
                <span>15</span>
                <span>20</span>
                <span>25</span>
              </div>
            </div>
          )}
        </div>

        {/* Strict Filter Checkboxes & Rules */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-slate-700">
              {t.controls.rulesHeading}
            </label>
            <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              CheckCatch Rules
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Exactly 2 English Words */}
            <div
              id="filter-two-words-rule"
              onClick={() => toggleRule('exactlyTwoWords')}
              className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                rules.exactlyTwoWords
                  ? 'bg-emerald-50/70 border-emerald-300 text-slate-900 shadow-xs'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              <div
                className={`mt-0.5 w-4 h-4 rounded flex items-center justify-center border transition-colors ${
                  rules.exactlyTwoWords
                    ? 'bg-emerald-600 border-emerald-600 text-white'
                    : 'border-slate-300 bg-white'
                }`}
              >
                {rules.exactlyTwoWords && <Check className="w-3 h-3 stroke-[3]" />}
              </div>
              <div className="text-xs">
                <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                  {t.controls.ruleTwoWordsTitle}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  {t.controls.ruleTwoWordsDesc}
                </div>
              </div>
            </div>

            {/* No Dashes */}
            <div
              id="filter-no-dashes-rule"
              onClick={() => toggleRule('noDashes')}
              className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                rules.noDashes
                  ? 'bg-blue-50/70 border-blue-300 text-slate-900 shadow-xs'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              <div
                className={`mt-0.5 w-4 h-4 rounded flex items-center justify-center border transition-colors ${
                  rules.noDashes
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'border-slate-300 bg-white'
                }`}
              >
                {rules.noDashes && <Check className="w-3 h-3 stroke-[3]" />}
              </div>
              <div className="text-xs">
                <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                  <Minus className="w-3.5 h-3.5 text-blue-600" />
                  {t.controls.ruleNoDashesTitle}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  {t.controls.ruleNoDashesDesc}
                </div>
              </div>
            </div>

            {/* No Numbers */}
            <div
              id="filter-no-numbers-rule"
              onClick={() => toggleRule('noNumbers')}
              className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                rules.noNumbers
                  ? 'bg-blue-50/70 border-blue-300 text-slate-900 shadow-xs'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              <div
                className={`mt-0.5 w-4 h-4 rounded flex items-center justify-center border transition-colors ${
                  rules.noNumbers
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'border-slate-300 bg-white'
                }`}
              >
                {rules.noNumbers && <Check className="w-3 h-3 stroke-[3]" />}
              </div>
              <div className="text-xs">
                <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                  <Hash className="w-3.5 h-3.5 text-blue-600" />
                  {t.controls.ruleNoNumbersTitle}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  {t.controls.ruleNoNumbersDesc}
                </div>
              </div>
            </div>

            {/* Ending Today / Auction Mode */}
            <div
              id="filter-auction-mode-rule"
              onClick={() => toggleRule('auctionMode')}
              className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                rules.auctionMode
                  ? 'bg-emerald-50/70 border-emerald-300 text-slate-900 shadow-xs'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              <div
                className={`mt-0.5 w-4 h-4 rounded flex items-center justify-center border transition-colors ${
                  rules.auctionMode
                    ? 'bg-emerald-600 border-emerald-600 text-white'
                    : 'border-slate-300 bg-white'
                }`}
              >
                {rules.auctionMode && <Check className="w-3 h-3 stroke-[3]" />}
              </div>
              <div className="text-xs">
                <div className="font-semibold text-emerald-800 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-600" />
                  {lang === 'ar' ? 'مزادات تنتهي اليوم' : 'Ending Today / Auctions'}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  {lang === 'ar'
                    ? 'محاكاة الدومينات القريبة من الانتهاء مع تقديرات القيمة'
                    : 'Simulate expiring / auction domains with price estimates'}
                </div>
              </div>
            </div>
          </div>

          {/* Option 5: Domain Character Length Filter (2 to 25 characters) */}
          <div
            id="filter-char-length-container"
            className="mt-2.5 p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-3"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Type className="w-4 h-4 text-blue-600 shrink-0" />
                <div>
                  <div className="text-xs font-semibold text-slate-800">
                    {t.controls.ruleCharLengthTitle}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {t.controls.ruleCharLengthDesc}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <span className="font-mono text-xs font-bold text-blue-700 bg-blue-100/60 px-2.5 py-1 rounded-lg border border-blue-200">
                  {((rules.minLetters ?? 2) === 2 && (rules.maxLetters ?? 25) === 25)
                    ? t.controls.ruleCharLengthAll
                    : t.controls.ruleCharLengthRange(rules.minLetters ?? 2, rules.maxLetters ?? 25)}
                </span>
                {((rules.minLetters ?? 2) !== 2 || (rules.maxLetters ?? 25) !== 25) && (
                  <button
                    type="button"
                    onClick={() => {
                      setRules((prev) => ({
                        ...prev,
                        minLetters: 2,
                        maxLetters: 25,
                      }));
                    }}
                    className="text-[10px] text-blue-600 hover:text-blue-800 underline font-medium"
                  >
                    {lang === 'ar' ? 'إعادة تعيين' : 'Reset'}
                  </button>
                )}
              </div>
            </div>

            {/* Quick length presets */}
            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
              <span className="text-[10px] text-slate-500">{lang === 'ar' ? 'أطوال شائعة:' : 'Quick ranges:'}</span>
              {[
                { label: lang === 'ar' ? 'الكل (2 - 25)' : 'All (2-25)', min: 2, max: 25 },
                { label: lang === 'ar' ? 'قصير جداً (4 - 7)' : 'Short (4-7)', min: 4, max: 7 },
                { label: lang === 'ar' ? 'مثالي (8 - 12)' : 'Ideal (8-12)', min: 8, max: 12 },
                { label: lang === 'ar' ? 'متوسط (10 - 15)' : 'Medium (10-15)', min: 10, max: 15 },
                { label: lang === 'ar' ? 'أقصى حد (حتى 20)' : 'Max 20', min: 2, max: 20 },
              ].map((preset) => {
                const isActive = (rules.minLetters ?? 2) === preset.min && (rules.maxLetters ?? 25) === preset.max;
                return (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => {
                      setRules((prev) => ({
                        ...prev,
                        minLetters: preset.min,
                        maxLetters: preset.max,
                      }));
                    }}
                    className={`text-[10px] px-2.5 py-1 rounded-lg border font-medium transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white border-blue-600 font-bold shadow-xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>

            {/* Dual Sliders / Range Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-slate-200">
              {/* Min Length Slider */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-600">
                    {lang === 'ar' ? 'الحد الأدنى للحروف:' : 'Minimum Length:'}
                  </span>
                  <span className="font-mono font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {rules.minLetters ?? 2} {lang === 'ar' ? 'حروف' : 'chars'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const currentMin = rules.minLetters ?? 2;
                      const newMin = Math.max(2, currentMin - 1);
                      setRules((prev) => ({
                        ...prev,
                        minLetters: newMin,
                        maxLetters: Math.max(newMin, prev.maxLetters ?? 25),
                      }));
                    }}
                    className="w-6 h-6 rounded bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 flex items-center justify-center font-bold text-xs select-none shadow-xs"
                  >
                    -
                  </button>
                  <input
                    id="slider-min-letters"
                    type="range"
                    min={2}
                    max={25}
                    step={1}
                    value={rules.minLetters ?? 2}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setRules((prev) => ({
                        ...prev,
                        minLetters: val,
                        maxLetters: Math.max(val, prev.maxLetters ?? 25),
                      }));
                    }}
                    className="flex-1 accent-blue-600 cursor-pointer h-1.5 bg-slate-200 rounded appearance-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const currentMin = rules.minLetters ?? 2;
                      const newMin = Math.min(25, currentMin + 1);
                      setRules((prev) => ({
                        ...prev,
                        minLetters: newMin,
                        maxLetters: Math.max(newMin, prev.maxLetters ?? 25),
                      }));
                    }}
                    className="w-6 h-6 rounded bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 flex items-center justify-center font-bold text-xs select-none shadow-xs"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Max Length Slider */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-600">
                    {lang === 'ar' ? 'الحد الأقصى للحروف:' : 'Maximum Length:'}
                  </span>
                  <span className="font-mono font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {rules.maxLetters ?? 25} {lang === 'ar' ? 'حروف' : 'chars'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const currentMax = rules.maxLetters ?? 25;
                      const newMax = Math.max(2, currentMax - 1);
                      setRules((prev) => ({
                        ...prev,
                        maxLetters: newMax,
                        minLetters: Math.min(newMax, prev.minLetters ?? 2),
                      }));
                    }}
                    className="w-6 h-6 rounded bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 flex items-center justify-center font-bold text-xs select-none shadow-xs"
                  >
                    -
                  </button>
                  <input
                    id="slider-max-letters"
                    type="range"
                    min={2}
                    max={25}
                    step={1}
                    value={rules.maxLetters ?? 25}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setRules((prev) => ({
                        ...prev,
                        maxLetters: val,
                        minLetters: Math.min(val, prev.minLetters ?? 2),
                      }));
                    }}
                    className="flex-1 accent-blue-600 cursor-pointer h-1.5 bg-slate-200 rounded appearance-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const currentMax = rules.maxLetters ?? 25;
                      const newMax = Math.min(25, currentMax + 1);
                      setRules((prev) => ({
                        ...prev,
                        maxLetters: newMax,
                        minLetters: Math.min(newMax, prev.minLetters ?? 2),
                      }));
                    }}
                    className="w-6 h-6 rounded bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 flex items-center justify-center font-bold text-xs select-none shadow-xs"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* TLD Filters with .com prioritized */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-slate-700">
                {t.controls.tldHeading} ({rules.tlds.length})
              </label>
              {rules.tlds.length === 1 && rules.tlds.includes('.com') && (
                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {lang === 'ar' ? 'تم اختيار .com فقط (الافتراضي)' : '.com Only (Default)'}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-[11px]">
              <button
                type="button"
                onClick={selectComOnly}
                className={`font-semibold transition-colors ${
                  rules.tlds.length === 1 && rules.tlds.includes('.com')
                    ? 'text-emerald-700 underline font-bold'
                    : 'text-slate-500 hover:text-emerald-700'
                }`}
              >
                {t.controls.tldComOnly}
              </button>
              <span className="text-slate-300">•</span>
              <button
                type="button"
                onClick={selectTopTldsOnly}
                className="text-slate-500 hover:text-slate-800 font-medium"
              >
                {t.controls.coreTlds}
              </button>
              <span className="text-slate-300">•</span>
              <button
                type="button"
                onClick={selectAllTlds}
                className="text-slate-500 hover:text-slate-800"
              >
                {t.controls.selectAll}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {POPULAR_TLDS.map((tldItem) => {
              const isChecked = rules.tlds.includes(tldItem.ext);
              const isCom = tldItem.ext === '.com';
              return (
                <button
                  key={tldItem.ext}
                  id={`tld-checkbox-${tldItem.ext.replace('.', '')}`}
                  type="button"
                  onClick={() => toggleTld(tldItem.ext)}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                    isChecked
                      ? isCom
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-900 shadow-xs'
                        : 'bg-blue-50 border-blue-300 text-blue-900 shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-sm font-bold">{tldItem.ext}</span>
                    {isCom && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200 font-sans font-bold">
                        {lang === 'ar' ? 'الأول' : '1st'}
                      </span>
                    )}
                  </div>
                  <div
                    className={`w-4 h-4 rounded flex items-center justify-center border transition-colors ${
                      isChecked
                        ? isCom
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'bg-blue-600 border-blue-600 text-white'
                        : 'border-slate-300 bg-white'
                    }`}
                  >
                    {isChecked && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Generate Button (Mode A only) */}
        {mode === 'generator' && (
          <div className="pt-2">
            <button
              id="generate-domains-button"
              type="button"
              disabled={isLoading}
              onClick={onGenerate}
              className={`w-full py-3.5 px-6 rounded-xl font-bold text-sm flex items-center justify-center gap-2.5 transition-all active:scale-[0.99] border ${
                isLoading
                  ? 'bg-slate-200 cursor-not-allowed text-slate-400 border-slate-300'
                  : 'bg-blue-600 hover:bg-blue-500 text-white border-blue-600 shadow-md shadow-blue-200'
              }`}
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>{t.controls.generatingBtn}</span>
                </>
              ) : (
                <>
                  <Target className="w-4 h-4 text-white stroke-[2.5]" />
                  <span>{t.controls.generateBtn(count)}</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
