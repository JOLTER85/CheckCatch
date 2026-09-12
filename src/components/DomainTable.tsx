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

export const DomainTable: React.FC<DomainTableProps> = ({
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

  return (
    <div
      id="domains-table-container"
      className="w-full overflow-x-auto rounded-2xl border border-teal-100 bg-white/95 shadow-sm"
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
                    <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1 max-w-sm">
                      {item.pitch}
                    </p>

                    {/* Quick Button to toggle Breakdown */}
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => toggleExpand(item.id)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-slate-50 hover:bg-slate-100 text-blue-700 border border-slate-200 transition-colors shadow-xs"
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
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold border transition-colors ${
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
                      <span className="font-bold text-emerald-700 font-mono">
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
                        <ShieldCheck className="w-2.5 h-2.5 text-emerald-600" />
                        {t.table.wordsBadge(item.wordsCount)}
                      </span>
                      {!item.hasDashes && (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-[10px] text-slate-700 font-medium">
                          <ShieldCheck className="w-2.5 h-2.5 text-emerald-600" />
                          {t.table.noDashes}
                        </span>
                      )}
                      {!item.hasNumbers && (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-[10px] text-slate-700 font-medium">
                          <ShieldCheck className="w-2.5 h-2.5 text-emerald-600" />
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
                        className={`p-1.5 rounded-lg border transition-all ${
                          isCopied
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300 font-bold'
                            : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700 hover:text-slate-900'
                        }`}
                        title="Copy Domain"
                      >
                        {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>

                      {/* Check Availability */}
                      <a
                        id={`table-check-${item.id}`}
                        href={registrars[0].url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-xs transition-colors"
                        title="Check Availability on Registrar"
                      >
                        <span>{t.table.check}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>

                      {/* Shortlist */}
                      <button
                        id={`table-save-${item.id}`}
                        type="button"
                        onClick={() => onToggleSave(item)}
                        className={`p-1.5 rounded-lg border transition-colors ${
                          isSaved
                            ? 'bg-amber-50 text-amber-600 border-amber-300'
                            : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-400 hover:text-slate-700'
                        }`}
                        title={isSaved ? 'Remove from shortlist' : 'Save to shortlist'}
                      >
                        <Star
                          className={`w-3.5 h-3.5 ${
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
                      <div
                        className={`p-4 rounded-xl bg-white border border-slate-200 space-y-3 shadow-xs ${
                          lang === 'ar' ? 'text-right' : 'text-left'
                        }`}
                        dir={lang === 'ar' ? 'rtl' : 'ltr'}
                      >
                        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                            <BookOpen className="w-4 h-4 text-blue-600" />
                            <span>{t.domainCard.breakdownHeading}</span>
                          </div>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-50 text-slate-700 border border-slate-200 font-semibold">
                            {arabicBreakdown.word1.categoryEn || 'Compound Brand'}
                          </span>
                        </div>

                        {/* Words Grid: Keep English Words in LTR */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {/* Word 1 */}
                          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span
                                className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200"
                                dir="ltr"
                              >
                                {t.domainCard.word1}: {arabicBreakdown.word1.word}
                              </span>
                              <span className="text-[11px] text-slate-500 font-semibold">
                                {t.domainCard.scoreLabel}: <strong className="text-emerald-700">
                                  {arabicBreakdown.word1.strengthScore}%
                                </strong>
                              </span>
                            </div>
                            <div className="text-xs text-slate-800">
                              <span className="text-slate-500">{t.domainCard.dictionaryMeaning}: </span>
                              <strong className="text-slate-900">
                                {lang === 'ar'
                                  ? arabicBreakdown.word1.meaningAr
                                  : arabicBreakdown.word1.meaningEn || arabicBreakdown.word1.meaningAr}
                              </strong>
                            </div>
                            <div className="text-xs text-slate-700 leading-relaxed bg-white p-2 rounded border border-slate-200">
                              <span className="text-emerald-700 font-bold block mb-0.5">
                                ⚡ {t.domainCard.commercialStrength}:
                              </span>
                              {lang === 'ar'
                                ? arabicBreakdown.word1.strengthAr
                                : arabicBreakdown.word1.strengthEn || arabicBreakdown.word1.strengthAr}
                            </div>
                          </div>

                          {/* Word 2 */}
                          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span
                                className="font-mono text-xs font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200"
                                dir="ltr"
                              >
                                {t.domainCard.word2}: {arabicBreakdown.word2.word}
                              </span>
                              <span className="text-[11px] text-slate-500 font-semibold">
                                {t.domainCard.scoreLabel}: <strong className="text-blue-700">
                                  {arabicBreakdown.word2.strengthScore}%
                                </strong>
                              </span>
                            </div>
                            <div className="text-xs text-slate-800">
                              <span className="text-slate-500">{t.domainCard.dictionaryMeaning}: </span>
                              <strong className="text-slate-900">
                                {lang === 'ar'
                                  ? arabicBreakdown.word2.meaningAr
                                  : arabicBreakdown.word2.meaningEn || arabicBreakdown.word2.meaningAr}
                              </strong>
                            </div>
                            <div className="text-xs text-slate-700 leading-relaxed bg-white p-2 rounded border border-slate-200">
                              <span className="text-blue-700 font-bold block mb-0.5">
                                ⚡ {t.domainCard.commercialStrength}:
                              </span>
                              {lang === 'ar'
                                ? arabicBreakdown.word2.strengthAr
                                : arabicBreakdown.word2.strengthEn || arabicBreakdown.word2.strengthAr}
                            </div>
                          </div>
                        </div>

                        {/* Synergy */}
                        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed">
                          <strong className="text-blue-700 block mb-1">
                            {t.domainCard.compoundSynergyTitle}
                          </strong>
                          {lang === 'ar'
                            ? arabicBreakdown.combinedPowerAr
                            : arabicBreakdown.combinedPowerEn || arabicBreakdown.combinedPowerAr}
                        </div>

                        {/* Companies & Individuals */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 border-t border-slate-200">
                          <div>
                            <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5 mb-1.5">
                              <Building2 className="w-3.5 h-3.5 text-blue-600" />
                              <span>{t.domainCard.targetSectorsTitle}</span>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {(lang === 'ar'
                                ? arabicBreakdown.interestedPartiesAr.companies
                                : (arabicBreakdown.interestedPartiesEn?.companies || arabicBreakdown.interestedPartiesAr.companies)
                              ).map((c, i) => (
                                <span
                                  key={i}
                                  className="px-2 py-0.5 rounded bg-slate-50 border border-slate-200 text-[10px] text-slate-700"
                                >
                                  {c}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div>
                            <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5 mb-1.5">
                              <Users className="w-3.5 h-3.5 text-emerald-600" />
                              <span>{t.domainCard.potentialBuyersTitle}</span>
                            </div>
                            <ul className="text-xs text-slate-700 space-y-1 list-disc list-inside">
                              {(lang === 'ar'
                                ? arabicBreakdown.interestedPartiesAr.individuals
                                : (arabicBreakdown.interestedPartiesEn?.individuals || arabicBreakdown.interestedPartiesAr.individuals)
                              ).map((ind, i) => (
                                <li key={i}>{ind}</li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        {/* Liquidity Demand Summary */}
                        <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600 leading-relaxed">
                          <span className="text-blue-700 font-bold">
                            {t.domainCard.liquidityDemandTitle}{' '}
                          </span>
                          {lang === 'ar'
                            ? arabicBreakdown.interestedPartiesAr.summary
                            : (arabicBreakdown.interestedPartiesEn?.summary || arabicBreakdown.interestedPartiesAr.summary)}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
