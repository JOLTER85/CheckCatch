import React, { useState } from 'react';
import { DomainItem } from '../types';
import { getRegistrarLinks } from '../utils/registrars';
import { generateDomainArabicBreakdown } from '../utils/domainArabicAnalysis';
import {
  Copy,
  Check,
  ExternalLink,
  Star,
  Clock,
  DollarSign,
  ChevronDown,
  Crown,
  BookOpen,
  Building2,
  Users,
  Target,
} from 'lucide-react';
import { Language, translations } from '../utils/translations';

interface DomainCardProps {
  domain: DomainItem;
  rank: number;
  isSaved: boolean;
  isSelected?: boolean;
  forceOpenBreakdown?: boolean;
  onSelectAsBest?: (domain: DomainItem) => void;
  onToggleSave: (domain: DomainItem) => void;
  onCopyDomain: (domain: string) => void;
  lang?: Language;
}

export const DomainCard: React.FC<DomainCardProps> = ({
  domain,
  rank,
  isSaved,
  isSelected = false,
  forceOpenBreakdown,
  onSelectAsBest,
  onToggleSave,
  onCopyDomain,
  lang = 'en',
}) => {
  const [copied, setCopied] = useState(false);
  const [showRegistrars, setShowRegistrars] = useState(false);

  const t = translations[lang];

  // Styling based on top picks & valuation tier
  const isTopPick = domain.isTopPick || rank <= 3;
  const isPremium = domain.valuationTier === 'Premium';
  const isBrandable = domain.valuationTier === 'Brandable';

  // Open breakdown by default for selected best, rank 1, or forceOpenBreakdown
  const [isBreakdownOpen, setIsBreakdownOpen] = useState<boolean>(
    isSelected || rank === 1 || Boolean(forceOpenBreakdown)
  );

  React.useEffect(() => {
    if (isSelected || forceOpenBreakdown) {
      setIsBreakdownOpen(true);
    }
  }, [isSelected, forceOpenBreakdown]);

  const arabicBreakdown = domain.arabicBreakdown || generateDomainArabicBreakdown(domain);

  const handleCopy = () => {
    onCopyDomain(domain.domain);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const registrars = getRegistrarLinks(domain.domain);

  const tldColors: Record<string, string> = {
    '.com': 'bg-emerald-50 text-emerald-700 border-emerald-300',
    '.ai': 'bg-purple-50 text-purple-700 border-purple-300',
    '.io': 'bg-cyan-50 text-cyan-700 border-cyan-300',
    '.co': 'bg-blue-50 text-blue-700 border-blue-300',
    '.net': 'bg-amber-50 text-amber-700 border-amber-300',
    '.org': 'bg-indigo-50 text-indigo-700 border-indigo-300',
    '.tech': 'bg-teal-50 text-teal-700 border-teal-300',
    '.xyz': 'bg-pink-50 text-pink-700 border-pink-300',
  };

  const currentTldBadge = tldColors[domain.tld] || 'bg-slate-100 text-slate-700 border-slate-300';

  const formatValuation = (val: any): string => {
    if (!val) return '$1,500 – $3,500';
    if (typeof val === 'string') return val;
    if (typeof val === 'object' && val !== null) {
      const min = typeof val.min === 'number' ? `$${val.min.toLocaleString()}` : val.min;
      const max = typeof val.max === 'number' ? `$${val.max.toLocaleString()}` : val.max;
      if (min && max) return `${min} – ${max}`;
      return min || max || '$1,500 – $3,500';
    }
    return String(val);
  };

  return (
    <div
      id={`domain-card-${domain.id}`}
      className={`group relative rounded-2xl p-5 transition-all duration-200 border flex flex-col justify-between ${
        isSelected
          ? 'bg-white border-teal-500 shadow-lg shadow-teal-500/10 ring-2 ring-teal-500/30'
          : isTopPick
          ? 'bg-white border-teal-100 shadow-sm hover:border-teal-400 hover:shadow-md'
          : 'bg-white hover:bg-teal-50/20 border-slate-200 hover:border-teal-300 shadow-xs'
      }`}
    >
      {/* Selected Best Banner */}
      {isSelected && (
        <div className="mb-3 px-3 py-1.5 rounded-xl bg-gradient-to-r from-teal-50 to-blue-50 border border-teal-200 flex items-center justify-between text-xs font-bold text-teal-900 shadow-xs animate-fadeIn">
          <div className="flex items-center gap-1.5">
            <Crown className="w-4 h-4 fill-teal-600 text-teal-600" />
            <span>
              {lang === 'ar'
                ? 'أفضل ترشيح مختار • تم التحقق من القيمة الاستثمارية'
                : lang === 'fr'
                ? 'Meilleur choix sélectionné • Valeur d\'investissement vérifiée'
                : 'Selected Best Match • Verified Two-Word Valuation'}
            </span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-600 text-white font-bold">
            {lang === 'ar' ? `الترتيب #${rank}` : `Rank #${rank}`}
          </span>
        </div>
      )}

      {/* Top Badges Bar */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Selected Best Domain Badge */}
            {isSelected ? (
              <span
                id={`badge-selected-best-${domain.id}`}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-gradient-to-r from-teal-600 to-blue-600 text-white shadow-xs"
              >
                <Crown className="w-3.5 h-3.5 fill-white text-white" />
                {t.domainCard.bestDomainBadge}
              </span>
            ) : isTopPick ? (
              <span
                id={`badge-top-pick-${domain.id}`}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-50 text-teal-800 border border-teal-300 shadow-xs"
              >
                <Target className="w-3.5 h-3.5 text-teal-600" />
                {domain.topPickBadge || (rank === 1 ? 'Top Pick #1' : `Top Pick #${rank}`)}
              </span>
            ) : null}

            {/* Valuation Tier Badge */}
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold border ${
                isPremium
                  ? 'bg-teal-50 text-teal-800 border-teal-300'
                  : isBrandable
                  ? 'bg-blue-50 text-blue-800 border-blue-300'
                  : 'bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              <DollarSign className="w-3 h-3 text-teal-600" />
              {domain.valuationTier}
            </span>

            {/* Auction Ending Soon Badge if applicable */}
            {domain.auctionEndingSoon && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200 animate-pulse">
                <Clock className="w-3 h-3 text-rose-600" />
                Ending in {domain.auctionEndsInHours || 3}h
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {/* Select as Best Domain Button */}
            {onSelectAsBest && (
              <button
                id={`select-best-btn-${domain.id}`}
                type="button"
                onClick={() => {
                  onSelectAsBest(domain);
                  setIsBreakdownOpen(true);
                }}
                className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-teal-50 text-teal-800 border-teal-300 shadow-xs font-bold'
                    : 'bg-slate-50 hover:bg-teal-50 text-slate-700 hover:text-teal-900 border-slate-200 hover:border-teal-300'
                }`}
                title={isSelected ? t.domainCard.selectedBest : t.domainCard.selectBest}
              >
                <Crown
                  className={`w-3.5 h-3.5 ${
                    isSelected ? 'fill-teal-600 text-teal-600' : 'text-slate-400'
                  }`}
                />
                <span className="hidden sm:inline">
                  {isSelected ? t.domainCard.selectedBest : t.domainCard.selectBest}
                </span>
              </button>
            )}

            <button
              id={`save-btn-${domain.id}`}
              type="button"
              onClick={() => onToggleSave(domain)}
              className={`p-1.5 rounded-lg border transition-colors ${
                isSaved
                  ? 'bg-amber-50 text-amber-600 border-amber-300'
                  : 'text-slate-400 hover:text-slate-700 bg-slate-50 border-slate-200 hover:border-slate-300'
              }`}
              title={isSaved ? 'Remove from shortlist' : 'Save to shortlist'}
              aria-label={isSaved ? 'Saved to shortlist' : 'Save to shortlist'}
            >
              <Star
                className={`w-4 h-4 ${isSaved ? 'fill-amber-500 text-amber-500' : ''}`}
              />
            </button>
          </div>
        </div>

        {/* Main Domain Heading */}
        <div className="mb-3">
          <div className="flex items-baseline gap-1.5 flex-wrap" dir="ltr">
            <span className="font-mono text-xl sm:text-2xl font-bold tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
              {domain.name}
            </span>
            <span
              className={`font-mono text-sm px-2 py-0.5 rounded-md border font-semibold ${currentTldBadge}`}
            >
              {domain.tld}
            </span>
          </div>

          {/* Pitch rationale */}
          <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed font-normal">
            {domain.pitch}
          </p>
        </div>

        {/* Semantic Breakdown Section */}
        <div className="my-3 border-y border-slate-100 py-2.5">
          <button
            id={`toggle-arabic-analysis-${domain.id}`}
            type="button"
            onClick={() => setIsBreakdownOpen(!isBreakdownOpen)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 text-slate-800 transition-colors"
          >
            <div className="flex items-center gap-2">
              <BookOpen className="w-3.5 h-3.5 text-blue-600" />
              <span>{t.domainCard.breakdownToggle}</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-slate-500">
              <span>{isBreakdownOpen ? t.domainCard.breakdownHide : t.domainCard.breakdownToggle}</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  isBreakdownOpen ? 'rotate-180' : ''
                }`}
              />
            </div>
          </button>

          {isBreakdownOpen && (
            <div
              id={`arabic-breakdown-${domain.id}`}
              className="mt-2.5 p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-3 shadow-inner"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                  <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                  <span>{t.domainCard.breakdownHeading}</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white text-slate-700 border border-slate-200 font-semibold shadow-xs">
                  {arabicBreakdown.word1.categoryEn || 'Compound Brand'}
                </span>
              </div>

              {/* The Two Words: Meanings & Strengths */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* Word 1 */}
                <div className="p-2.5 rounded-lg bg-white border border-slate-200 space-y-1.5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span
                      className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200"
                      dir="ltr"
                    >
                      {t.domainCard.word1}: {arabicBreakdown.word1.word}
                    </span>
                    <span className="text-[10px] text-slate-500 font-semibold">
                      {t.domainCard.scoreLabel}: <strong className="text-emerald-700">{arabicBreakdown.word1.strengthScore}%</strong>
                    </span>
                  </div>
                  <div className="text-xs text-slate-800 font-medium leading-relaxed">
                    <span className="text-slate-500 font-normal">{t.domainCard.dictionaryMeaning}: </span>
                    <strong className="text-slate-900 font-bold">
                      {lang === 'ar'
                        ? arabicBreakdown.word1.meaningAr
                        : arabicBreakdown.word1.meaningEn || arabicBreakdown.word1.meaningAr}
                    </strong>
                  </div>
                  <div className="text-[11px] text-slate-700 leading-relaxed bg-slate-50 p-2 rounded border border-slate-200">
                    <span className="text-emerald-700 font-bold block mb-0.5">
                      ⚡ {t.domainCard.commercialStrength}:
                    </span>
                    {lang === 'ar'
                      ? arabicBreakdown.word1.strengthAr
                      : arabicBreakdown.word1.strengthEn || arabicBreakdown.word1.strengthAr}
                  </div>
                </div>

                {/* Word 2 */}
                <div className="p-2.5 rounded-lg bg-white border border-slate-200 space-y-1.5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span
                      className="font-mono text-xs font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200"
                      dir="ltr"
                    >
                      {t.domainCard.word2}: {arabicBreakdown.word2.word}
                    </span>
                    <span className="text-[10px] text-slate-500 font-semibold">
                      {t.domainCard.scoreLabel}: <strong className="text-blue-700">{arabicBreakdown.word2.strengthScore}%</strong>
                    </span>
                  </div>
                  <div className="text-xs text-slate-800 font-medium leading-relaxed">
                    <span className="text-slate-500 font-normal">{t.domainCard.dictionaryMeaning}: </span>
                    <strong className="text-slate-900 font-bold">
                      {lang === 'ar'
                        ? arabicBreakdown.word2.meaningAr
                        : arabicBreakdown.word2.meaningEn || arabicBreakdown.word2.meaningAr}
                    </strong>
                  </div>
                  <div className="text-[11px] text-slate-700 leading-relaxed bg-slate-50 p-2 rounded border border-slate-200">
                    <span className="text-blue-700 font-bold block mb-0.5">
                      ⚡ {t.domainCard.commercialStrength}:
                    </span>
                    {lang === 'ar'
                      ? arabicBreakdown.word2.strengthAr
                      : arabicBreakdown.word2.strengthEn || arabicBreakdown.word2.strengthAr}
                  </div>
                </div>
              </div>

              {/* Combined Synergy */}
              <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-[11px] text-slate-700 leading-relaxed shadow-xs">
                <strong className="text-blue-700 block mb-1">
                  {t.domainCard.compoundSynergyTitle}
                </strong>
                {lang === 'ar'
                  ? arabicBreakdown.combinedPowerAr
                  : arabicBreakdown.combinedPowerEn || arabicBreakdown.combinedPowerAr}
              </div>

              {/* Interested Companies & Buyers */}
              <div className="space-y-2 pt-1 border-t border-slate-200">
                <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>{t.domainCard.targetSectorsTitle}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(lang === 'ar'
                    ? arabicBreakdown.interestedPartiesAr.companies
                    : (arabicBreakdown.interestedPartiesEn?.companies || arabicBreakdown.interestedPartiesAr.companies)
                  ).map((company, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-white text-slate-700 border border-slate-200 shadow-xs"
                    >
                      {company}
                    </span>
                  ))}
                </div>

                <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5 pt-1">
                  <Users className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{t.domainCard.potentialBuyersTitle}</span>
                </div>
                <ul className="text-[11px] text-slate-700 space-y-1 list-disc list-inside">
                  {(lang === 'ar'
                    ? arabicBreakdown.interestedPartiesAr.individuals
                    : (arabicBreakdown.interestedPartiesEn?.individuals || arabicBreakdown.interestedPartiesAr.individuals)
                  ).map((person, idx) => (
                    <li key={idx} className="leading-relaxed">
                      {person}
                    </li>
                  ))}
                </ul>

                <div className="p-2 rounded-lg bg-white border border-slate-200 text-[11px] text-slate-600 leading-relaxed shadow-xs">
                  <span className="text-blue-700 font-bold">
                    {t.domainCard.liquidityDemandTitle}{' '}
                  </span>
                  {lang === 'ar'
                    ? arabicBreakdown.interestedPartiesAr.summary
                    : (arabicBreakdown.interestedPartiesEn?.summary || arabicBreakdown.interestedPartiesAr.summary)}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Stats Row: Match % & Est Value */}
        <div className="grid grid-cols-2 gap-2 my-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200">
          <div>
            <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
              {t.domainCard.nicheMatch}
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-sm font-bold text-emerald-700">
                {domain.relevanceScore}%
              </span>
              <div className="w-12 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ width: `${domain.relevanceScore}%` }}
                />
              </div>
            </div>
          </div>

          <div>
            <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
              {t.domainCard.valuation}
            </div>
            <div className="text-sm font-bold text-slate-900 mt-0.5">
              {domain.auctionEndingSoon && domain.auctionCurrentBid
                ? domain.auctionCurrentBid
                : formatValuation(domain.estimatedValue)}
            </div>
          </div>
        </div>

        {/* Registrar Quick Links Toggle */}
        <div>
          <button
            type="button"
            onClick={() => setShowRegistrars(!showRegistrars)}
            className="w-full text-xs font-semibold py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 flex items-center justify-between transition-colors shadow-xs"
          >
            <span className="flex items-center gap-1.5">
              <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
              {t.domainCard.registrars}
            </span>
            <ChevronDown
              className={`w-3.5 h-3.5 text-slate-500 transition-transform ${
                showRegistrars ? 'rotate-180' : ''
              }`}
            />
          </button>

          {showRegistrars && (
            <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-2 rounded-xl bg-slate-50 border border-slate-200 text-[11px]">
              {registrars.map((reg) => (
                <a
                  key={reg.name}
                  href={reg.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-lg bg-white hover:bg-blue-50 border border-slate-200 text-slate-800 hover:text-blue-700 text-center font-medium truncate transition-colors flex items-center justify-center gap-1 shadow-xs"
                >
                  <span>{reg.name}</span>
                  <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Card Footer Actions: Copy Domain */}
      <div className="pt-3 mt-3 border-t border-slate-200 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={handleCopy}
          className="flex-1 py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-emerald-700 font-bold">{t.domainCard.copied}</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-slate-500" />
              <span>{t.domainCard.copy}</span>
            </>
          )}
        </button>

        <a
          href={registrars[0]?.url || `https://www.namecheap.com/domains/registration/results/?domain=${domain.domain}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
        >
          <span>Namecheap</span>
          <ExternalLink className="w-3 h-3 text-white" />
        </a>
      </div>
    </div>
  );
};
