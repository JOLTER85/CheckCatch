export interface FilterRules {
  exactlyTwoWords: boolean;
  noDashes: boolean;
  noNumbers: boolean;
  tlds: string[];
  auctionMode: boolean;
  minLetters?: number; // 2 to 25
  maxLetters?: number; // 2 to 25
}

export type ValuationTier = 'Premium' | 'Brandable' | 'Standard';

export interface WordAnalysis {
  word: string;
  meaningEn?: string; // English dictionary meaning
  meaningAr: string; // شرح معنى الكلمة بالعربي
  strengthEn?: string; // English commercial & brand strength
  strengthAr: string; // قوة الكلمة تسويقياً وتقنياً واستثمارياً
  strengthScore: number; // 0 - 100
  categoryEn?: string; // English category
  categoryAr: string; // تصنيف الكلمة
}

export interface DomainArabicBreakdown {
  word1: WordAnalysis;
  word2: WordAnalysis;
  combinedPowerEn?: string; // English synergy
  combinedPowerAr: string; // قوة التركيبة بين الكلمتين
  interestedPartiesEn?: {
    companies: string[];
    individuals: string[];
    summary: string;
  };
  interestedPartiesAr: {
    companies: string[]; // الشركات والقطاعات المستهدفة
    individuals: string[]; // رواد الأعمال والمستثمرون المهتمون
    summary: string; // ملخص الجهات المهتمة وسبب رغبتهم في الشراء
  };
}

export interface DomainItem {
  id: string;
  domain: string;
  name: string;
  tld: string;
  relevanceScore: number; // 0 - 100
  wordsCount: number;
  words: string[];
  hasDashes: boolean;
  hasNumbers: boolean;
  valuationTier: ValuationTier;
  estimatedValue: string;
  pitch: string;
  isTopPick: boolean;
  topPickBadge?: string;
  auctionEndingSoon?: boolean;
  auctionEndsInHours?: number;
  auctionCurrentBid?: string;
  arabicBreakdown?: DomainArabicBreakdown;
}

export interface GenerateRequest {
  keywords: string;
  count: number;
  rules: FilterRules;
}

export interface GenerateResponse {
  domains: DomainItem[];
  querySummary: string;
  generatedAt: string;
  success: boolean;
  error?: string;
  usedFallback?: boolean;
}

export interface SavedDomain extends DomainItem {
  savedAt: number;
}

export type AppMode = 'generator' | 'analyzer';
export type SearchTargetMode = 'niche' | 'keyword';

export interface DiscardedDomain {
  domain: string;
  reason: string;
}

export interface FilterEvaluationStats {
  totalUploaded: number;
  passedFilters: number;
  failedCount: number;
  showingCount: number;
  keywordMatchesTotal?: number;
  keywordMatchesStrict?: number;
  breakdown: {
    dashes: number;
    numbers: number;
    tlds: number;
    words: number;
    invalid: number;
    keywordMismatch?: number;
    lengthMismatch?: number;
  };
  discarded: DiscardedDomain[];
}

export interface UploadedSheetInfo {
  fileName: string;
  fileSize: number;
  sheetNames: string[];
  columns: string[];
  selectedColumn: string;
  totalRows: number;
  previewRows: Record<string, any>[];
  detectedDomains: string[];
  detectedTlds?: string[];
  allRows?: any[][];
}

export interface AnalyzeUploadedRequest {
  candidateDomains: string[];
  count: number;
  rules: FilterRules;
  contextTopic?: string;
  searchMode?: SearchTargetMode;
  targetKeyword?: string;
  relaxKeywordFilters?: boolean;
}

export interface AnalyzeUploadedResponse {
  success: boolean;
  domains: DomainItem[];
  allEvaluated?: DomainItem[];
  totalQualified: number;
  usedFallback?: boolean;
  generatedAt: string;
  error?: string;
}

export interface SingleDomainVerificationResult {
  domain: string;
  name: string;
  tld: string;
  isValidTwoWord: boolean;
  status: 'PASS' | 'FAIL';
  failureReason?: string;
  validationChecks: {
    hasTwoEnglishWords: boolean;
    hasNoNumbers: boolean;
    hasNoDashes: boolean;
    isCleanAlphabetical: boolean;
  };
  words: string[];
  word1Analysis?: {
    word: string;
    length: number;
    partOfSpeech: string;
    meaning: string;
    meaningAr?: string;
    frequencyTier: 'High' | 'Medium' | 'Rare';
  };
  word2Analysis?: {
    word: string;
    length: number;
    partOfSpeech: string;
    meaning: string;
    meaningAr?: string;
    frequencyTier: 'High' | 'Medium' | 'Rare';
  };
  brandabilityScore: number; // 0 - 100
  brandabilityGrade: 'A+' | 'A' | 'B' | 'C' | 'D';
  estimatedMarketValue: number; // in USD
  estimatedValueFormatted: string; // e.g. "$14,500"
  valuationTier: ValuationTier;
  searchVolumeIntent: {
    monthlySearchesEstimate: number;
    intentLevel: 'High Commercial' | 'Moderate' | 'Niche';
    category: string;
  };
  seoInsights: {
    domainAuthority: number; // e.g. 38
    backlinks: number; // e.g. 1,420
    domainAge: string; // e.g. "8 Years" or "Available Drop"
  };
  registrarLinks: {
    namecheap: string;
    godaddy: string;
    dynadot: string;
    dropcatch: string;
  };
  pitch: string;
  pitchAr?: string;
}
