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
  strengthScore: number; // 0 - 100 (retained for backward compatibility)
  categoryEn?: string; // English category
  categoryAr: string; // تصنيف الكلمة
  length: number; // Character count
  syllables: number; // Syllable count
  partOfSpeechEn?: string; // e.g. "Spatial descriptor", "Technical noun"
  partOfSpeechAr?: string; // e.g. "دلالة مكانية", "دلالة تقنية/وظيفية"
}

export interface RadioTestResult {
  passed: boolean;
  score: number; // 1 - 10
  ratingAr: string; // e.g. "ناجح بامتياز (10/10)"
  ratingEn: string; // e.g. "Passed with Excellence (10/10)"
  verdictAr: string; // e.g. "يُكتب تماماً كما يُسمع دون حروف صامتة أو تشابه ملتبس"
  verdictEn: string; // e.g. "Spelled exactly as heard with zero silent letters or ambiguous homophones"
  hasDoubleLetterCollision: boolean;
  hasSilentLetters: boolean;
}

export interface ComparableSale {
  domain: string;
  price: number;
  priceFormatted: string; // e.g. "$1,500"
  year: number;
  venue?: string; // e.g. "NameBio / GoDaddy", "Sedo"
  similarityAr?: string; // e.g. "نمط مشابه: كلمة مكانية + مصطلح تقني"
  similarityEn?: string; // e.g. "Similar pattern: Spatial anchor + Tech term"
}

export interface RealisticValuationSplit {
  resellerLow: number;
  resellerHigh: number;
  resellerRangeFormatted: string; // e.g. "$50 - $250"
  resellerDescriptionAr: string; // "قيمة إعادة البيع السريعة لمستثمر دومينات في المزادات أو صفقات التصفية السريعة"
  resellerDescriptionEn: string; // "Wholesale/liquid investor resale price in auctions or quick secondary flips"
  endUserLow: number;
  endUserHigh: number;
  endUserRangeFormatted: string; // e.g. "$1,200 - $3,500"
  endUserDescriptionAr: string; // "قيمة الاستخدام النهائي المتوقعة لشركة ناشئة أو مشروع تجاري يحتاج هذا الاسم بعد مفاوضات"
  endUserDescriptionEn: string; // "Retail price for a funded startup or enterprise seeking this exact brand name"
}

export interface DomainArabicBreakdown {
  word1: WordAnalysis;
  word2: WordAnalysis;

  // Section 1: Summary & Structural Classification
  classification?: {
    structureTypeAr: string; // "نطاق مركب من كلمتين (دلالة مكانية + دلالة تقنية)"
    structureTypeEn: string; // "Two-word compound (Spatial anchor + Technical core)"
    idealSectorsAr: string[]; // ["B2B SaaS", "AI Infrastructure", "Cloud Platforms"]
    idealSectorsEn: string[];
    brandImpressionAr: string; // "القوة والاتجاه والرسوخ المؤسسي"
    brandImpressionEn: string; // "Strength, Direction & Institutional Solidity"
    cleanSummaryAr: string; // "نطاق مركب من كلمتين (دلالة مكانية + دلالة تقنية). مثالي لمجالات: B2B SaaS و AI Infrastructure. الانطباع الأولي: القوة والاتجاه."
    cleanSummaryEn: string;
  };

  // Section 2: Phonetic & Structural Metrics
  metrics?: {
    totalLength: number;
    lengthAssessmentAr: string; // "11 حرف - طول مثالي (أقل من 12 حرف لسهولة الكتابة والتذكر)"
    lengthAssessmentEn: string;
    totalSyllables: number;
    syllablesAssessmentAr: string; // "3 مقاطع صوتية - إيقاع لفظي سلس وسريع الحفظ"
    syllablesAssessmentEn: string;
    radioTest: RadioTestResult;
  };

  // Section 3: Compound Synergy & Mental Metaphor
  synergyAnalysis?: {
    metaphorAr: string; // "الدمج يخلق استعارة مجازية تدل على [التوسع والرسوخ + الدقة الحسابية]"
    metaphorEn: string;
    visualFlowAr: string; // "لا توجد حروف مزدوجة بين الكلمتين (t و v)، مما يجعل القراءة البصرية مريحة ويمنع أخطاء الكتابة"
    visualFlowEn: string;
    hasDoubleLetterCollision?: boolean;
  };

  // Section 4: Specific End-Users (2-3 precise operators)
  specificEndUsers?: {
    buyersAr: string[]; // 2-3 specific end users e.g. ["منصات تحليل البيانات", "شركات إدارة السيرفرات السحابية", "أدوات الذكاء الاصطناعي التوليدي"]
    buyersEn: string[];
    primaryOperatorsAr?: string[];
    primaryOperatorsEn?: string[];
    useCaseAr: string; // "شركة ناشئة ممولة (Series A/B) تبحث عن علامة تجارية رصينة لمنتجها الأساسي"
    useCaseEn: string;
  };

  // Section 5: Liquidity, Search Volume & Comps
  liquidityData?: {
    monthlySearchVolumeEstimate: number;
    searchVolumeFormatted: string; // e.g. "~14,500 عملية بحث شهرياً"
    searchVolumeNoteAr: string; // "تقدير عمليات البحث الشهرية التراكمية على الكلمتين في محركات البحث"
    searchVolumeNoteEn: string;
    comparableSales: ComparableSale[];
  };

  // Section 6: Realistic Dual Valuation
  valuationSplit?: RealisticValuationSplit;

  // Backward compatibility fields
  combinedPowerEn?: string;
  combinedPowerAr: string;
  interestedPartiesEn?: {
    companies: string[];
    individuals: string[];
    summary: string;
  };
  interestedPartiesAr: {
    companies: string[];
    individuals: string[];
    summary: string;
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
  valuationSplit?: RealisticValuationSplit;
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
