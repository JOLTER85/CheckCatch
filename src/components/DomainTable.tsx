import React, { useState } from 'react';
import { DomainItem } from '../types';
import { getRegistrarLinks } from '../utils/registrars';
import { generateDomainArabicBreakdown } from '../utils/domainArabicAnalysis';
import { Language, translations } from '../utils/translations';
import {
  Copy,
  Check,
  ExternalLink,
  Star,
  Award,
  ShieldCheck,
  Clock,
  DollarSign,
  Crown,
  Sparkles,
  ChevronDown,
  BookOpen,
  Building2,
  Users,
  Layers,
  Radio,
  TrendingUp,
  Coins,
  CheckCircle2,
  Search,
} from 'lucide-react';

interface DomainTableProps {
  domains: DomainItem[];
  savedDomainIds: Set<string>;
  selectedBestDomainId?: string | null;
  forceOpenBreakdown?: boolean;
  onSelectAsBest?: (domain: DomainItem) => void;
  onToggleSave: (domain: DomainItem) => void;
  onCopyDomain: (domain: string) => void;
  lang?: Language;
}

const DomainTableComponent: React.FC<DomainTableProps> = ({
  domains,
  savedDomainIds,
  selectedBestDomainId,
  forceOpenBreakdown,
  onSelectAsBest,
  onToggleSave,
  onCopyDomain,
  lang = 'en',
}) => {
  const t = translations[lang];
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    if (domains.length > 0) {
      initial.add(selectedBestDomainId || domains[0].id);
    }
    return initial;
  });

  React.useEffect(() => {
    if (forceOpenBreakdown) {
      setExpandedIds(new Set(domains.map((d) => d.id)));
    } else if (selectedBestDomainId) {
      setExpandedIds((prev) => new Set(prev).add(selectedBestDomainId));
    }
  }, [forceOpenBreakdown, selectedBestDomainId, domains]);

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleCopy = (domain: DomainItem) => {
    onCopyDomain(domain.domain);
    setCopiedId(domain.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const tldColors: Record<string, string> = {
    '.com': 'bg-emerald-50 text-emerald-800 border-emerald-300',
    '.ai': 'bg-purple-50 text-purple-800 border-purple-300',
    '.io': 'bg-cyan-50 text-cyan-800 border-cyan-300',
    '.co': 'bg-blue-50 text-blue-800 border-blue-300',
    '.net': 'bg-amber-50 text-amber-800 border-amber-300',
    '.org': 'bg-indigo-50 text-indigo-800 border-indigo-300',
    '.tech': 'bg-teal-50 text-teal-800 border-teal-300',
    '.xyz': 'bg-pink-50 text-pink-800 border-pink-300',
  };

  const renderBreakdown = (item: DomainItem, arabicBreakdown: ReturnType<typeof generateDomainArabicBreakdown>) => (
    <div
      className={`p-3.5 sm:p-4 rounded-xl bg-white border border-slate-200 space-y-3.5 shadow-xs text-slate-800 ${
        lang === 'ar' ? 'text-right' : 'text-left'
      }`}
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
    >
      <div className="flex items-center justify-between border-b border-slate-200 pb-2 flex-wrap gap-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
          <BookOpen className="w-4 h-4 text-blue-600 shrink-0" />
          <span>{t.domainCard.breakdownHeading}</span>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-50 text-slate-700 border border-slate-200 font-semibold">
          {lang === 'ar'
            ? (arabicBreakdown.classification?.structureTypeAr || 'نطاق مركب من كلمتين')
            : (arabicBreakdown.classification?.structureTypeEn || 'Two-word compound')}
        </span>
      </div>

      {/* 1. Summary & Structural Classification */}
      <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
        <div className="flex items-center gap-1.5 font-bold text-slate-900">
          <Layers className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
          <span>{t.domainCard.summaryClassificationTitle}</span>
        </div>
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[11px] text-slate-500 font-semibold">{t.domainCard.structureType}:</span>
          <span className="px-2 py-0.5 rounded bg-white text-indigo-800 text-[11px] font-bold border border-indigo-200">
            {lang === 'ar'
              ? (arabicBreakdown.classification?.structureTypeAr || 'نطاق مركب من كلمتين')
              : (arabicBreakdown.classification?.structureTypeEn || 'Two-word compound')}
          </span>
        </div>
        <div>
          <span className="text-[11px] text-slate-500 font-semibold block my-1">{t.domainCard.idealSectors}:</span>
          <div className="flex flex-wrap gap-1.5">
            {(lang === 'ar'
              ? (arabicBreakdown.classification?.idealSectorsAr || arabicBreakdown.interestedPartiesAr.companies)
              : (arabicBreakdown.classification?.idealSectorsEn || arabicBreakdown.interestedPartiesEn?.companies || [])
            ).map((s, si) => (
              <span key={si} className="px-2 py-0.5 rounded bg-white border border-slate-200 text-[10px] text-slate-700">
                {s}
              </span>
            ))}
          </div>
        </div>
        <div className="text-[11px] text-slate-600 pt-1">
          <span className="font-semibold text-slate-700">{t.domainCard.brandImpression}: </span>
          <strong className="text-slate-900">
            {lang === 'ar'
              ? (arabicBreakdown.classification?.brandImpressionAr || 'القوة والاتجاه والرسوخ المؤسسي')
              : (arabicBreakdown.classification?.brandImpressionEn || 'Strength and Institutional Resonance')}
          </strong>
        </div>
      </div>

      {/* 2. Phonetic & Visual Metrics */}
      <div className="space-y-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
            <Radio className="w-3.5 h-3.5 text-emerald-800 shrink-0" />
            <span>{t.domainCard.phoneticVisualTitle}</span>
          </div>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3 h-3 text-emerald-800" />
            {lang === 'ar'
              ? (arabicBreakdown.metrics?.radioTest.ratingAr || 'ناجح بامتياز (10/10)')
              : (arabicBreakdown.metrics?.radioTest.ratingEn || 'Passed (10/10)')}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
          <div className="p-2 rounded bg-slate-50 border border-slate-200">
            <span className="text-slate-500 font-semibold block">{t.domainCard.lengthLabel}:</span>
            <span className="text-slate-900 font-medium">
              {lang === 'ar'
                ? (arabicBreakdown.metrics?.lengthAssessmentAr || `${item.domain.replace(/\..+$/, '').length} حرف`)
                : (arabicBreakdown.metrics?.lengthAssessmentEn || `${item.domain.replace(/\..+$/, '').length} letters`)}
            </span>
          </div>
          <div className="p-2 rounded bg-slate-50 border border-slate-200">
            <span className="text-slate-500 font-semibold block">{t.domainCard.syllablesLabel}:</span>
            <span className="text-slate-900 font-medium">
              {lang === 'ar'
                ? (arabicBreakdown.metrics?.syllablesAssessmentAr || 'مقاطع متوازنة وسهلة اللفظ')
                : (arabicBreakdown.metrics?.syllablesAssessmentEn || 'Balanced syllables')}
            </span>
          </div>
        </div>

        {/* Words Grid: Keep English Words in LTR */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Word 1 */}
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
            <div className="flex items-center justify-between flex-wrap gap-1">
              <span
                className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200"
                dir="ltr"
              >
                {t.domainCard.word1}: {arabicBreakdown.word1.word}
              </span>
              <span className="text-[11px] text-slate-700 font-bold">
                {t.domainCard.scoreLabel}: <strong className="text-emerald-800">
                  {arabicBreakdown.word1.strengthScore}%
                </strong>
              </span>
            </div>
            <div className="text-xs text-slate-800 font-medium">
              <span className="text-slate-700 font-medium">{t.domainCard.dictionaryMeaning}: </span>
              <strong className="text-slate-900 font-bold">
                {lang === 'ar'
                  ? arabicBreakdown.word1.meaningAr
                  : arabicBreakdown.word1.meaningEn || arabicBreakdown.word1.meaningAr}
              </strong>
            </div>
            <div className="text-xs text-slate-800 leading-relaxed bg-white p-2 rounded border border-slate-200 font-medium">
              <span className="text-emerald-800 font-bold block mb-0.5">
                ⚡ {t.domainCard.commercialStrength}:
              </span>
              {lang === 'ar'
                ? arabicBreakdown.word1.strengthAr
                : arabicBreakdown.word1.strengthEn || arabicBreakdown.word1.strengthAr}
            </div>
          </div>

          {/* Word 2 */}
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
            <div className="flex items-center justify-between flex-wrap gap-1">
              <span
                className="font-mono text-xs font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200"
                dir="ltr"
              >
                {t.domainCard.word2}: {arabicBreakdown.word2.word}
              </span>
              <span className="text-[11px] text-slate-700 font-bold">
                {t.domainCard.scoreLabel}: <strong className="text-blue-800">
                  {arabicBreakdown.word2.strengthScore}%
                </strong>
              </span>
            </div>
            <div className="text-xs text-slate-800 font-medium">
              <span className="text-slate-700 font-medium">{t.domainCard.dictionaryMeaning}: </span>
              <strong className="text-slate-900 font-bold">
                {lang === 'ar'
                  ? arabicBreakdown.word2.meaningAr
                  : arabicBreakdown.word2.meaningEn || arabicBreakdown.word2.meaningAr}
              </strong>
            </div>
            <div className="text-xs text-slate-800 leading-relaxed bg-white p-2 rounded border border-slate-200 font-medium">
              <span className="text-blue-800 font-bold block mb-0.5">
                ⚡ {t.domainCard.commercialStrength}:
              </span>
              {lang === 'ar'
                ? arabicBreakdown.word2.strengthAr
                : arabicBreakdown.word2.strengthEn || arabicBreakdown.word2.strengthAr}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Compound Synergy & Mental Metaphor */}
      <div className="p-3 rounded-lg bg-amber-50/40 border border-amber-200 text-xs text-amber-950 space-y-1.5">
        <div className="flex items-center gap-1.5 font-bold text-amber-900">
          <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span>{t.domainCard.synergyMetaphorTitle}</span>
        </div>
        <p className="leading-relaxed">
          <strong className="text-amber-800">{t.domainCard.metaphorLabel}: </strong>
          {lang === 'ar'
            ? (arabicBreakdown.synergyAnalysis?.metaphorAr || arabicBreakdown.combinedPowerAr)
            : (arabicBreakdown.synergyAnalysis?.metaphorEn || arabicBreakdown.combinedPowerEn || arabicBreakdown.combinedPowerAr)}
        </p>
        <p className="leading-relaxed text-[11px] text-slate-700">
          <strong>{t.domainCard.visualFlowLabel}: </strong>
          {lang === 'ar'
            ? (arabicBreakdown.synergyAnalysis?.visualFlowAr || 'تدفق بصري مريح دون تكرار أحرف متتالية.')
            : (arabicBreakdown.synergyAnalysis?.visualFlowEn || 'Smooth visual cadence across word boundary.')}
        </p>
      </div>

      {/* 4. Target End-Users */}
      <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-2">
        <div className="flex items-center gap-1.5 font-bold text-slate-900">
          <Building2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
          <span>{t.domainCard.endUsersTitle}</span>
        </div>
        <ul className="text-xs text-slate-700 space-y-1 list-disc list-inside">
          {(lang === 'ar'
            ? (arabicBreakdown.specificEndUsers?.primaryOperatorsAr || arabicBreakdown.interestedPartiesAr.individuals)
            : (arabicBreakdown.specificEndUsers?.primaryOperatorsEn || arabicBreakdown.interestedPartiesEn?.individuals || [])
          ).map((op, opi) => (
            <li key={opi}>
              <strong className="text-slate-900">{op}</strong>
            </li>
          ))}
        </ul>
        <div className="p-2 rounded bg-white border border-slate-200 text-[11px] text-blue-900 leading-relaxed">
          <strong className="text-blue-700">{t.domainCard.useCaseLabel}: </strong>
          {lang === 'ar'
            ? (arabicBreakdown.specificEndUsers?.useCaseAr || 'نطاق مثالي كبوابة رسمية للمنتج.')
            : (arabicBreakdown.specificEndUsers?.useCaseEn || 'Ideal as primary brand gateway.')}
        </div>
      </div>

      {/* 5. Comps & Liquidity */}
      <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-2 text-xs">
        <div className="flex items-center justify-between flex-wrap gap-1">
          <div className="flex items-center gap-1.5 font-bold text-slate-900">
            <TrendingUp className="w-3.5 h-3.5 text-teal-600 shrink-0" />
            <span>{t.domainCard.compsLiquidityTitle}</span>
          </div>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-teal-50 text-teal-800 border border-teal-200">
            <Search className="w-3 h-3 text-teal-600 shrink-0" />
            {lang === 'ar'
              ? (arabicBreakdown.liquidityData?.searchVolumeFormattedAr || arabicBreakdown.liquidityData?.searchVolumeFormatted || '~12,000 بحث/شهر')
              : (arabicBreakdown.liquidityData?.searchVolumeFormattedEn || `~${arabicBreakdown.liquidityData?.monthlySearchVolumeEstimate?.toLocaleString() || '12,000'} monthly searches`)}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
          {(arabicBreakdown.liquidityData?.comparableSales || []).map((comp, ci) => (
            <div
              key={ci}
              className="p-2 rounded bg-white border border-slate-200 flex items-center justify-between text-[11px]"
            >
              <div>
                <span className="font-mono font-bold text-slate-900" dir="ltr">
                  {comp.domain}
                </span>
                <span className="text-[10px] text-slate-500 mx-1">
                  ({comp.year})
                </span>
              </div>
              <span className="font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                {comp.priceFormatted}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 6. Dual-Tier Valuation */}
      <div className="p-3 rounded-lg bg-white border border-slate-200 space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
          <Coins className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span>{t.domainCard.dualValuationTitle}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
              {t.domainCard.resellerWholesale}
            </span>
            <div className="text-base font-mono font-extrabold text-slate-900">
              {arabicBreakdown.valuationSplit?.resellerRangeFormatted || '$50 - $250'}
            </div>
            <p className="text-[10px] text-slate-600 mt-1 leading-relaxed">
              {lang === 'ar'
                ? (arabicBreakdown.valuationSplit?.resellerDescriptionAr || 'سعر البيع السريع بالجملة بين المستثمرين.')
                : (arabicBreakdown.valuationSplit?.resellerDescriptionEn || 'Wholesale liquidation range.')}
            </p>
          </div>

          <div className="p-2.5 rounded bg-emerald-50/60 border border-emerald-200">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block mb-1">
              {t.domainCard.endUserRetail}
            </span>
            <div className="text-base font-mono font-extrabold text-emerald-800">
              {arabicBreakdown.valuationSplit?.endUserRangeFormatted || '$1,200 - $3,500'}
            </div>
            <p className="text-[10px] text-emerald-900/80 mt-1 leading-relaxed">
              {lang === 'ar'
                ? (arabicBreakdown.valuationSplit?.endUserDescriptionAr || 'القيمة عند التفاوض المباشر مع شركة تجارية.')
                : (arabicBreakdown.valuationSplit?.endUserDescriptionEn || 'Direct end-user enterprise value.')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div id="domains-table-wrapper" className="w-full">
      {/* Mobile-First Card List (Visible on mobile/tablet < md screens) */}
      <div className="block md:hidden space-y-3" id="domains-mobile-list">
        {domains.map((item, index) => {
          const isSaved = savedDomainIds.has(item.id);
          const isSelected = selectedBestDomainId === item.id;
          const isTop = item.isTopPick || index <= 2;
          const isCopied = copiedId === item.id;
          const isExpanded = expandedIds.has(item.id);
          const registrars = getRegistrarLinks(item.domain);
          const arabicBreakdown = item.arabicBreakdown || generateDomainArabicBreakdown(item);

          return (
            <div
              key={`mobile-${item.id}`}
              id={`mobile-domain-card-${item.id}`}
              className={`rounded-2xl border p-4 transition-all duration-200 bg-white shadow-xs ${
                isSelected
                  ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-md'
                  : isTop
                  ? 'border-teal-200/80'
                  : 'border-slate-200'
              }`}
            >
              {/* Header: Rank + Badges + Star */}
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <div className="flex items-center gap-2 flex-wrap">
                  {isSelected ? (
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-blue-600 text-white font-extrabold text-xs shadow-xs">
                      ★
                    </span>
                  ) : (
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-100 text-slate-800 font-bold text-xs border border-slate-200">
                      {index + 1}
                    </span>
                  )}

                  {isSelected && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-600 text-white flex items-center gap-1 shadow-xs">
                      <Crown className="w-3 h-3 fill-white" /> {t.domainCard.bestDomainBadge}
                    </span>
                  )}

                  {isTop && !isSelected && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
                      {item.topPickBadge || (lang === 'ar' ? `ترشيح #${index + 1}` : `Top Pick #${index + 1}`)}
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => onToggleSave(item)}
                  aria-label={isSaved ? `Remove ${item.domain} from shortlist` : `Save ${item.domain} to shortlist`}
                  className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-colors ${
                    isSaved
                      ? 'bg-amber-50 text-amber-600 border-amber-300'
                      : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-700'
                  }`}
                >
                  <Star className={`w-4 h-4 ${isSaved ? 'fill-amber-500 text-amber-500' : ''}`} />
                </button>
              </div>

              {/* Domain Name + TLD */}
              <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
                <span className="font-mono text-base font-bold text-slate-900 tracking-tight break-all" dir="ltr">
                  {item.domain}
                </span>
                <span
                  className={`font-mono font-bold px-2 py-0.5 rounded border text-xs ${
                    tldColors[item.tld] || 'bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                  dir="ltr"
                >
                  {item.tld}
                </span>
              </div>

              {/* Pitch Summary */}
              <p className="text-xs text-slate-600 mb-3 line-clamp-2 leading-relaxed font-medium">
                {lang === 'ar'
                  ? (arabicBreakdown.classification?.cleanSummaryAr || item.pitch)
                  : (arabicBreakdown.classification?.cleanSummaryEn || item.pitch)}
              </p>

              {/* Stats Bar: Match Score & Valuation */}
              <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 mb-3">
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-500">{t.domainCard.nicheMatch}</div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-xs font-bold text-emerald-800 font-mono">{item.relevanceScore}%</span>
                    <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${item.relevanceScore}%` }} />
                    </div>
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-500">{t.domainCard.valuation}</div>
                  <div className="text-xs font-bold text-slate-900 font-mono mt-0.5">
                    {item.auctionEndingSoon ? item.auctionCurrentBid : item.estimatedValue}
                  </div>
                </div>
              </div>

              {/* Badges */}
              <div className="flex items-center gap-1.5 flex-wrap mb-3">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-[10px] text-slate-700 font-medium">
                  <ShieldCheck className="w-2.5 h-2.5 text-emerald-800" />
                  {t.table.wordsBadge(item.wordsCount)}
                </span>
                {!item.hasDashes && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-[10px] text-slate-700 font-medium">
                    <ShieldCheck className="w-2.5 h-2.5 text-emerald-800" />
                    {t.table.noDashes}
                  </span>
                )}
                {!item.hasNumbers && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-[10px] text-slate-700 font-medium">
                    <ShieldCheck className="w-2.5 h-2.5 text-emerald-800" />
                    {t.table.noNumbers}
                  </span>
                )}
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border ${
                    item.valuationTier === 'Premium'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : item.valuationTier === 'Brandable'
                      ? 'bg-blue-50 text-blue-800 border-blue-300'
                      : 'bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  <Award className="w-2.5 h-2.5" />
                  {item.valuationTier}
                </span>
              </div>

              {/* Mobile Action Buttons (All min-h-[44px] touch target compliant) */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => handleCopy(item)}
                  className={`min-h-[44px] px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border ${
                    isCopied
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-800" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                  <span>{isCopied ? t.domainCard.copied : t.domainCard.copy}</span>
                </button>

                <a
                  href={registrars[0].url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-h-[44px] px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                >
                  <span>{t.table.check}</span>
                  <ExternalLink className="w-3.5 h-3.5 text-white" />
                </a>
              </div>

              {/* Select As Best & Toggle Breakdown buttons */}
              <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => toggleExpand(item.id)}
                  className="min-h-[40px] flex-1 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-50 hover:bg-slate-100 text-blue-700 border border-slate-200 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                  <span>{isExpanded ? t.table.hideAnalysis : t.table.showAnalysis}</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                </button>

                {onSelectAsBest && (
                  <button
                    type="button"
                    onClick={() => {
                      onSelectAsBest(item);
                      setExpandedIds((prev) => new Set(prev).add(item.id));
                    }}
                    className={`min-h-[40px] px-3 py-2 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1 transition-colors ${
                      isSelected
                        ? 'bg-blue-50 text-blue-700 border-blue-300 font-bold'
                        : 'bg-slate-50 text-slate-700 hover:text-slate-900 border-slate-200'
                    }`}
                  >
                    <Crown className="w-3.5 h-3.5 text-blue-600" />
                    <span>{isSelected ? t.domainCard.selectedBest : t.domainCard.selectBest}</span>
                  </button>
                )}
              </div>

              {/* Mobile Inline Breakdown */}
              {isExpanded && (
                <div className="mt-3 pt-3 border-t border-slate-200">
                  {renderBreakdown(item, arabicBreakdown)}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Desktop Classic Table (Hidden on small mobile screens < md) */}
      <div
        id="domains-table-container"
        className="hidden md:block w-full overflow-x-auto rounded-2xl border border-teal-100 bg-white/95 shadow-sm"
      >
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-teal-100 bg-gradient-to-r from-teal-50/70 to-blue-50/70 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
              <th className="py-3.5 px-4 w-12 text-center">{t.table.rank}</th>
              <th className="py-3.5 px-4">{t.table.domainAndAnalysis}</th>
              <th className="py-3.5 px-4">{t.table.tld}</th>
              <th className="py-3.5 px-4">{t.table.matchScore}</th>
              <th className="py-3.5 px-4">{t.table.validationBadges}</th>
              <th className="py-3.5 px-4">{t.table.valuationTier}</th>
              <th className={`py-3.5 px-4 ${lang === 'ar' ? 'text-left' : 'text-right'}`}>
                {t.table.actions}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {domains.map((item, index) => {
              const isSaved = savedDomainIds.has(item.id);
              const isSelected = selectedBestDomainId === item.id;
              const isTop = item.isTopPick || index <= 2;
              const isCopied = copiedId === item.id;
              const isExpanded = expandedIds.has(item.id);
              const registrars = getRegistrarLinks(item.domain);
              const arabicBreakdown = item.arabicBreakdown || generateDomainArabicBreakdown(item);

              return (
                <React.Fragment key={item.id}>
                  <tr
                    id={`table-row-${item.id}`}
                    className={`transition-colors hover:bg-slate-50 ${
                      isSelected
                        ? 'bg-blue-50/60 border-l-4 border-l-blue-600'
                        : isTop
                        ? 'bg-slate-50/40'
                        : ''
                    }`}
                  >
                    {/* Rank / Top Pick Icon */}
                    <td className="py-3.5 px-4 text-center align-top">
                      {isSelected ? (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white font-extrabold text-[11px] shadow-xs">
                          ★
                        </span>
                      ) : isTop ? (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px] border border-emerald-300">
                          {index + 1}
                        </span>
                      ) : (
                        <span className="text-slate-500 font-mono">{index + 1}</span>
                      )}
                    </td>

                    {/* Domain & Pitch */}
                    <td className="py-3.5 px-4 align-top">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className="font-mono text-sm font-bold text-slate-900 tracking-tight"
                          dir="ltr"
                        >
                          {item.domain}
                        </span>
                        {isSelected ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-600 text-white flex items-center gap-1 shadow-xs">
                            <Crown className="w-3 h-3 fill-white" /> {t.domainCard.bestDomainBadge}
                          </span>
                        ) : isTop ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
                            {item.topPickBadge ||
                              (index === 0
                                ? lang === 'ar'
                                  ? 'أفضل ترشيح #1'
                                  : 'Best Match #1'
                                : lang === 'ar'
                                ? `ترشيح #${index + 1}`
                                : `Top Pick #${index + 1}`)}
                          </span>
                        ) : null}
                      </div>
                      <p className="text-[11px] text-slate-600 mt-1 line-clamp-2 max-w-md font-medium leading-relaxed">
                        {lang === 'ar'
                          ? (arabicBreakdown.classification?.cleanSummaryAr || item.pitch)
                          : (arabicBreakdown.classification?.cleanSummaryEn || item.pitch)}
                      </p>

                      {/* Quick Button to toggle Breakdown */}
                      <div className="mt-2 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => toggleExpand(item.id)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-semibold bg-slate-50 hover:bg-slate-100 text-blue-700 border border-slate-200 transition-colors shadow-xs min-h-[36px]"
                        >
                          <BookOpen className="w-3 h-3 text-blue-600" />
                          <span>{isExpanded ? t.table.hideAnalysis : t.table.showAnalysis}</span>
                          <ChevronDown
                            className={`w-3 h-3 transition-transform ${
                              isExpanded ? 'rotate-180' : ''
                            }`}
                          />
                        </button>

                        {onSelectAsBest && (
                          <button
                            type="button"
                            onClick={() => {
                              onSelectAsBest(item);
                              setExpandedIds((prev) => new Set(prev).add(item.id));
                            }}
                            className={`inline-flex items-center gap-1 px-2 py-1.5 rounded-md text-[11px] font-semibold border transition-colors min-h-[36px] ${
                              isSelected
                                ? 'bg-blue-50 text-blue-700 border-blue-300 font-bold'
                                : 'bg-slate-50 text-slate-600 hover:text-slate-900 border-slate-200'
                            }`}
                          >
                            <Crown className="w-3 h-3 text-blue-600" />
                            <span>{isSelected ? t.domainCard.selectedBest : t.domainCard.selectBest}</span>
                          </button>
                        )}
                      </div>
                    </td>

                    {/* TLD Extension */}
                    <td className="py-3.5 px-4 align-top">
                      <span
                        className={`font-mono font-semibold px-2 py-0.5 rounded border text-xs ${
                          tldColors[item.tld] || 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                        dir="ltr"
                      >
                        {item.tld}
                      </span>
                    </td>

                    {/* Relevance Score */}
                    <td className="py-3.5 px-4 align-top">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-emerald-800 font-mono">
                          {item.relevanceScore}%
                        </span>
                        <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full"
                            style={{ width: `${item.relevanceScore}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Rule Validation Badges */}
                    <td className="py-3.5 px-4 align-top">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-[10px] text-slate-700 font-medium">
                          <ShieldCheck className="w-2.5 h-2.5 text-emerald-800" />
                          {t.table.wordsBadge(item.wordsCount)}
                        </span>
                        {!item.hasDashes && (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-[10px] text-slate-700 font-medium">
                            <ShieldCheck className="w-2.5 h-2.5 text-emerald-800" />
                            {t.table.noDashes}
                          </span>
                        )}
                        {!item.hasNumbers && (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-[10px] text-slate-700 font-medium">
                            <ShieldCheck className="w-2.5 h-2.5 text-emerald-800" />
                            {t.table.noNumbers}
                          </span>
                        )}
                        {item.auctionEndingSoon && (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-rose-50 border border-rose-200 text-[10px] text-rose-700 font-semibold">
                            <Clock className="w-2.5 h-2.5 text-rose-600" />
                            {t.table.endingInHours(item.auctionEndsInHours || 24)}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Valuation Tier & Est. Value */}
                    <td className="py-3.5 px-4 align-top">
                      <div className="flex flex-col gap-1">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border w-fit ${
                            item.valuationTier === 'Premium'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : item.valuationTier === 'Brandable'
                              ? 'bg-blue-50 text-blue-800 border-blue-300'
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          <Award className="w-3 h-3" />
                          {item.valuationTier === 'Premium'
                            ? t.table.tierPremium
                            : item.valuationTier === 'Brandable'
                            ? t.table.tierBrandable
                            : t.table.tierStandard}
                        </span>
                        <span className="font-mono text-xs font-bold text-slate-900">
                          {item.auctionEndingSoon ? item.auctionCurrentBid : item.estimatedValue}
                        </span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className={`py-3.5 px-4 align-top ${lang === 'ar' ? 'text-left' : 'text-right'}`}>
                      <div className={`flex items-center gap-1.5 ${lang === 'ar' ? 'justify-start' : 'justify-end'}`}>
                        {/* Copy Domain */}
                        <button
                          id={`table-copy-${item.id}`}
                          type="button"
                          onClick={() => handleCopy(item)}
                          aria-label={`Copy domain ${item.domain}`}
                          className={`min-h-[38px] min-w-[38px] p-2 rounded-lg border transition-all flex items-center justify-center ${
                            isCopied
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold'
                              : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700 hover:text-slate-900'
                          }`}
                          title="Copy Domain"
                        >
                          {isCopied ? <Check className="w-4 h-4 text-emerald-800" /> : <Copy className="w-4 h-4" />}
                        </button>

                        {/* Check Availability */}
                        <a
                          id={`table-check-${item.id}`}
                          href={registrars[0].url}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Check availability of ${item.domain} on registrar`}
                          className="min-h-[38px] inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors"
                          title="Check Availability on Registrar"
                        >
                          <span>{t.table.check}</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>

                        {/* Shortlist */}
                        <button
                          id={`table-save-${item.id}`}
                          type="button"
                          onClick={() => onToggleSave(item)}
                          aria-label={isSaved ? `Remove ${item.domain} from shortlist` : `Save ${item.domain} to shortlist`}
                          className={`min-h-[38px] min-w-[38px] p-2 rounded-lg border transition-colors flex items-center justify-center ${
                            isSaved
                              ? 'bg-amber-50 text-amber-600 border-amber-300'
                              : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-400 hover:text-slate-700'
                          }`}
                          title={isSaved ? 'Remove from shortlist' : 'Save to shortlist'}
                        >
                          <Star
                            className={`w-4 h-4 ${
                              isSaved ? 'fill-amber-500 text-amber-500' : ''
                            }`}
                          />
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* Inline Semantic Breakdown Sub-Row */}
                  {isExpanded && (
                    <tr className="bg-slate-50/60 border-b border-slate-200">
                      <td colSpan={7} className="p-4">
                        {renderBreakdown(item, arabicBreakdown)}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const DomainTable = React.memo(DomainTableComponent);
