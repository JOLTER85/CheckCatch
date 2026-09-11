export type Language = 'en' | 'ar' | 'fr' | 'es';

export interface Translations {
  nav: {
    tagline: string;
    rulesActive: string;
    shortlist: string;
    savedCount: string;
    language: string;
  };
  hero: {
    badge: string;
    titlePrimary: string;
    titleHighlight: string;
    titleSecondary: string;
    description: string;
  };
  modes: {
    generator: string;
    generatorDesc: string;
    analyzer: string;
    analyzerDesc: string;
    verifier: string;
    verifierDesc: string;
  };
  controls: {
    topicLabel: string;
    topicPlaceholder: string;
    quickPresets: string;
    countLabel: string;
    countTop3: string;
    countTop5: string;
    countTop10: string;
    countCustom: string;
    countCustomRange: string;
    rulesHeading: string;
    ruleTwoWordsTitle: string;
    ruleTwoWordsDesc: string;
    ruleNoDashesTitle: string;
    ruleNoDashesDesc: string;
    ruleNoNumbersTitle: string;
    ruleNoNumbersDesc: string;
    ruleCharLengthTitle: string;
    ruleCharLengthDesc: string;
    ruleCharLengthAll: string;
    ruleCharLengthRange: (min: number, max: number) => string;
    tldHeading: string;
    tldComOnly: string;
    coreTlds: string;
    selectAll: string;
    searchByWord: string;
    searchByNiche: string;
    generateBtn: (count: number) => string;
    generatingBtn: string;
  };
  results: {
    showingCount: (current: number, total: number) => string;
    spreadsheetResults: (count: number) => string;
    allTlds: string;
    searchPlaceholder: string;
    sortBy: string;
    sortMatch: string;
    sortTop: string;
    sortTopPicks: string;
    sortValuation: string;
    sortAlpha: string;
    exportBtn: string;
    exportExcel: string;
    exportCsv: string;
    cardView: string;
    tableView: string;
    expandAllAnalysis: string;
    collapseAllAnalysis: string;
    noResultsTitle: string;
    noResultsDesc: string;
  };
  domainCard: {
    topPick: string;
    bestDomainBadge: string;
    selectBest: string;
    selectedBest: string;
    nicheMatch: string;
    valuation: string;
    registrars: string;
    breakdownToggle: string;
    breakdownHide: string;
    breakdownHeading: string;
    word1: string;
    word2: string;
    scoreLabel: string;
    dictionaryMeaning: string;
    commercialStrength: string;
    compoundSynergyTitle: string;
    targetSectorsTitle: string;
    potentialBuyersTitle: string;
    liquidityDemandTitle: string;
    meaning: string;
    commercialPower: string;
    synergy: string;
    interestedSectors: string;
    potentialBuyers: string;
    liquiditySpeed: string;
    copy: string;
    copied: string;
  };
  savedDrawer: {
    title: string;
    emptyTitle: string;
    emptyDesc: string;
    copyAll: string;
    exportCsv: string;
    clearAll: string;
  };
  table: {
    rank: string;
    domainAndAnalysis: string;
    tld: string;
    matchScore: string;
    validationBadges: string;
    valuationTier: string;
    actions: string;
    check: string;
    showAnalysis: string;
    hideAnalysis: string;
    wordsBadge: (count: number) => string;
    noDashes: string;
    noNumbers: string;
    endingInHours: (hours: number) => string;
    analysisHeading: (domain: string) => string;
    synergyHeading: string;
    interestedSectorsHeading: string;
    potentialBuyersHeading: string;
    tierPremium: string;
    tierBrandable: string;
    tierStandard: string;
  };
  excelAnalyzer: {
    dropTitle: string;
    dropSubtitle: string;
    browse: string;
    loadSample: string;
    domainColumn: string;
    previewRows: string;
    hidePreview: string;
    targetModeTitle: string;
    searchByKeyword: string;
    searchByNiche: string;
    targetKeywordLabel: string;
    targetKeywordPlaceholder: string;
    contextTopicLabel: string;
    contextTopicPlaceholder: string;
    relaxFilters: string;
    relaxFiltersDesc: string;
    runAuditBtn: (count: number) => string;
    runningAudit: string;
    viewDiscarded: string;
    statsTotal: string;
    statsPassed: string;
    statsFailed: string;
  };
  footer: {
    description: string;
    verifiedNotice: string;
    rights: string;
    socials: {
      connect: string;
      instagram: string;
      facebook: string;
      whatsapp: string;
      whatsappInquiry: string;
      whatsappOnline: string;
      whatsappChatMessage: string;
      copiedNotice: string;
    };
  };
}

export const translations: Record<Language, Translations> = {
  en: {
    nav: {
      tagline: 'Check the Quality. Catch the Name.',
      rulesActive: 'Strict Rules: 2 Words • No Numbers • No Hyphens',
      shortlist: 'Shortlist',
      savedCount: 'saved',
      language: 'Language',
    },
    hero: {
      badge: 'Two-Word Domain Verification & Valuation Engine',
      titlePrimary: 'Check the Quality.',
      titleHighlight: 'Catch the Name.',
      titleSecondary: '',
      description:
        'An intelligent discovery and evaluation tool that specifically checks, verifies, and values domain names consisting exclusively of two valid English dictionary words.',
    },
    modes: {
      generator: 'Domain Generator',
      generatorDesc: 'Generate curated 2-word domain candidates',
      analyzer: 'Spreadsheet Audit',
      analyzerDesc: 'Filter & rank domains from your Excel/CSV',
      verifier: 'Single Domain Verifier',
      verifierDesc: 'Inspect & evaluate any individual domain',
    },
    controls: {
      topicLabel: 'Niche, Keywords or Concept Description',
      topicPlaceholder: 'e.g. AI tools, Fintech payment gateway, Cloud security, SaaS analytics...',
      quickPresets: 'Quick Ideas:',
      countLabel: 'Domain Output Count',
      countTop3: 'Top 3',
      countTop5: 'Top 5',
      countTop10: 'Top 10',
      countCustom: 'Custom (1 - 25)',
      countCustomRange: 'Choose domain count (1 to 25):',
      rulesHeading: 'Strict Verification Filters',
      ruleTwoWordsTitle: 'Exactly 2 English Words',
      ruleTwoWordsDesc: 'Must be two distinct, high-recall dictionary words',
      ruleNoDashesTitle: 'Zero Hyphens',
      ruleNoDashesDesc: 'Clean continuous spelling without any dashes (-)',
      ruleNoNumbersTitle: 'Zero Digits / Numbers',
      ruleNoNumbersDesc: 'Pure alphabetical characters only (no 0-9)',
      ruleCharLengthTitle: 'Domain Character Length',
      ruleCharLengthDesc: 'Filter name length from 2 to 25 characters',
      ruleCharLengthAll: 'Any length (2 - 25)',
      ruleCharLengthRange: (min: number, max: number) => `${min} to ${max} characters`,
      tldHeading: 'Supported Domain Extensions',
      tldComOnly: '.com Only',
      coreTlds: 'Core (.com, .ai, .io)',
      selectAll: 'Select All',
      searchByWord: 'Search by Word',
      searchByNiche: 'Search by Niche',
      generateBtn: (count: number) => `Check & Catch Top ${count} Domains`,
      generatingBtn: 'Verifying & evaluating domain candidates...',
    },
    results: {
      showingCount: (current: number, total: number) => `Showing ${current} of ${total} domains`,
      spreadsheetResults: (count: number) => `Displaying Top ${count} picks from your uploaded spreadsheet`,
      allTlds: 'All TLDs',
      searchPlaceholder: 'Search domains or keywords...',
      sortBy: 'Sort by',
      sortMatch: 'Highest Match',
      sortTop: 'Top Picks First',
      sortTopPicks: 'Top Picks First',
      sortValuation: 'Highest Valuation Tier',
      sortAlpha: 'Alphabetical (A-Z)',
      exportBtn: 'Export',
      exportExcel: 'Excel (.xlsx)',
      exportCsv: 'CSV (.csv)',
      cardView: 'Cards',
      tableView: 'Table',
      expandAllAnalysis: 'Expand All Breakdowns',
      collapseAllAnalysis: 'Collapse All Breakdowns',
      noResultsTitle: 'No matching domains found',
      noResultsDesc: 'Try adjusting your search query, TLD filter, or generate new candidates.',
    },
    domainCard: {
      topPick: 'Top Pick',
      bestDomainBadge: 'Best Match Pick',
      selectBest: 'Select as Best',
      selectedBest: 'Selected as Best',
      nicheMatch: 'Niche Match',
      valuation: 'Valuation',
      registrars: 'Check Registrars',
      breakdownToggle: 'Semantic Breakdown',
      breakdownHide: 'Hide Breakdown',
      breakdownHeading: 'Two-Word Semantic & Value Analysis',
      word1: 'Word 1',
      word2: 'Word 2',
      scoreLabel: 'Score',
      dictionaryMeaning: 'Dictionary Meaning',
      commercialStrength: 'Commercial Strength',
      compoundSynergyTitle: 'Compound Synergy & Brand Positioning:',
      targetSectorsTitle: 'Target Sectors & Potential Companies',
      potentialBuyersTitle: 'Potential Buyers & End Users',
      liquidityDemandTitle: 'Liquidity & Acquisition Demand:',
      meaning: 'Meaning & Concept',
      commercialPower: 'Commercial Power',
      synergy: 'Combined Domain Synergy',
      interestedSectors: 'Target Industries & Companies',
      potentialBuyers: 'Target Acquirers & Profiles',
      liquiditySpeed: 'Liquidity & Resale Potential',
      copy: 'Copy',
      copied: 'Copied!',
    },
    savedDrawer: {
      title: 'Shortlisted Domains',
      emptyTitle: 'No saved domains yet',
      emptyDesc: 'Click the star icon on any domain card or table row to add it to your shortlist.',
      copyAll: 'Copy All',
      exportCsv: 'Export CSV',
      clearAll: 'Clear All',
    },
    table: {
      rank: '#',
      domainAndAnalysis: 'Domain & Semantic Breakdown',
      tld: 'TLD',
      matchScore: 'Match Score',
      validationBadges: 'Validation Rules',
      valuationTier: 'Valuation Tier',
      actions: 'Actions',
      check: 'Check',
      showAnalysis: 'Word Analysis & Target Buyers',
      hideAnalysis: 'Hide Word Analysis',
      wordsBadge: (c: number) => `${c} Words`,
      noDashes: 'No Dashes',
      noNumbers: 'No Numbers',
      endingInHours: (h: number) => `Ending in ${h}h`,
      analysisHeading: (d: string) => `Two-Word Semantic Breakdown for "${d}" & Potential Buyers`,
      synergyHeading: '💡 Combined Domain Synergy & Recall:',
      interestedSectorsHeading: 'Interested Industry Sectors & Companies:',
      potentialBuyersHeading: 'Target Acquirers & Investor Profiles:',
      tierPremium: 'Premium',
      tierBrandable: 'Brandable',
      tierStandard: 'Standard',
    },
    excelAnalyzer: {
      dropTitle: 'Drop your Excel (.xlsx) or CSV file here, or browse',
      dropSubtitle: 'Supports .xlsx, .xls, and .csv with automatic domain column detection',
      browse: 'browse',
      loadSample: 'Load Sample Portfolio (.xlsx)',
      domainColumn: 'Selected Domain Column:',
      previewRows: 'Preview First 5 Rows',
      hidePreview: 'Hide File Preview',
      targetModeTitle: 'Target Discovery Strategy',
      searchByKeyword: 'Search by Target Word (e.g. cloud, pay, ai)',
      searchByNiche: 'Search by General Niche / Industry',
      targetKeywordLabel: 'Specific Seed Word to Search For',
      targetKeywordPlaceholder: 'e.g. cloud, pay, data, ai, flow, vault, smart...',
      contextTopicLabel: 'Portfolio Theme or Target Industry',
      contextTopicPlaceholder: 'e.g. Fintech, AI tools, Cloud security, SaaS analytics...',
      relaxFilters: 'Allow Single-Word Domains if exact keyword match',
      relaxFiltersDesc: 'Include premium 1-word domains containing the target keyword',
      runAuditBtn: (count: number) => `Filter & Rank Top ${count} Two-Word Domains`,
      runningAudit: 'Evaluating and scoring spreadsheet candidates...',
      viewDiscarded: 'View Filtered Out / Discarded Domains',
      statsTotal: 'Total Uploaded',
      statsPassed: 'Strict 2-Word Passed',
      statsFailed: 'Filtered Out',
    },
    footer: {
      description: 'CheckCatch.com — Premium 2-word domain intelligence desk and spreadsheet audit platform.',
      verifiedNotice: 'Direct verification with official registrar lookup endpoints.',
      rights: 'All rights reserved.',
      socials: {
        connect: 'Connect with Us',
        instagram: 'Instagram',
        facebook: 'Facebook',
        whatsapp: 'WhatsApp',
        whatsappInquiry: 'Chat on WhatsApp',
        whatsappOnline: 'Online for Domain Inquiries',
        whatsappChatMessage: 'Hello CheckCatch.com, I am interested in domain evaluation and acquisition assistance.',
        copiedNotice: 'WhatsApp link copied!',
      },
    },
  },
  ar: {
    nav: {
      tagline: 'منصة فحص واصطياد الدومينات الثنائية وتقييمها التجاري',
      rulesActive: 'المعايير المطبقة: كلمتان • بدون أرقام • بدون فواصل',
      shortlist: 'المفضلة',
      savedCount: 'محفوظ',
      language: 'اللغة',
    },
    hero: {
      badge: 'محرك فحص وتثمين الدومينات الثنائية',
      titlePrimary: 'تحقق من الجودة.',
      titleHighlight: 'واقتنص أفضل اسم.',
      titleSecondary: '',
      description:
        'محرك فحص وتقييم ذكي يتحقق حصرياً من أسماء الدومينات المكونة من كلمتين إنجليزيتين حقيقيتين من القاموس مع احتساب القيمة السوقية وقوة العلامة التجارية.',
    },
    modes: {
      generator: 'مُوَلِّد النطاقات',
      generatorDesc: 'ابتكار وتقييم دومينات مقترحة جديدة',
      analyzer: 'تدقيق ملفات الإكسل',
      analyzerDesc: 'فحص وتصفية قوائم الدومينات من ملفك',
      verifier: 'فاحص الدومين الفردي',
      verifierDesc: 'فحص وتثمين أي دومين بالكامل',
    },
    controls: {
      topicLabel: 'المجال، الكلمات المفتاحية أو وصف المشروع',
      topicPlaceholder: 'مثال: أدوات الذكاء الاصطناعي، بوابات الدفع، الأمن السحابي، برمجيات SaaS...',
      quickPresets: 'اقتراحات سريعة:',
      countLabel: 'عدد الدومينات المطلوبة',
      countTop3: 'أفضل 3 دومينات',
      countTop5: 'أفضل 5 دومينات',
      countTop10: 'أفضل 10 دومينات',
      countCustom: 'اختياري (1 إلى 25)',
      countCustomRange: 'اختر عدد الدومينات المطلوب (من 1 إلى 25):',
      rulesHeading: 'شروط ومعايير الفحص الصارمة',
      ruleTwoWordsTitle: 'كلمتان إنجليزيتان فقط',
      ruleTwoWordsDesc: 'يجب أن يتكون الدومين من كلمتين قاموسيتين واضحتين',
      ruleNoDashesTitle: 'خالٍ من الشرطات (-)',
      ruleNoDashesDesc: 'كتابة متصلة وسلسة بدون أي فواصل أو شرطات',
      ruleNoNumbersTitle: 'خالٍ من الأرقام (0-9)',
      ruleNoNumbersDesc: 'حروف هجائية فقط لضمان الهيبة وسهولة التذكر',
      ruleCharLengthTitle: 'عدد حروف اسم الدومين',
      ruleCharLengthDesc: 'تحديد طول اسم الدومين المطلوب من حرفين إلى 25 حرفاً',
      ruleCharLengthAll: 'جميع الأطوال (2 - 25 حرفاً)',
      ruleCharLengthRange: (min: number, max: number) => `من ${min} إلى ${max} حرفاً`,
      tldHeading: 'الامتدادات المدعومة',
      tldComOnly: '.com فقط',
      coreTlds: 'الأساسية (.com, .ai, .io)',
      selectAll: 'تحديد الكل',
      searchByWord: 'بحث بالكلمة',
      searchByNiche: 'بحث بالنيش',
      generateBtn: (count: number) => `فحص واصطياد أفضل ${count} دومينات`,
      generatingBtn: 'جاري فحص وتدقيق النطاقات بالمعايير المحددة...',
    },
    results: {
      showingCount: (current: number, total: number) => `عرض ${current} من أصل ${total} دومين`,
      spreadsheetResults: (count: number) => `عرض أفضل ${count} دومينات تم اصطيادها من ملفك`,
      allTlds: 'جميع الامتدادات',
      searchPlaceholder: 'بحث في النتائج أو الكلمات...',
      sortBy: 'ترتيب حسب',
      sortMatch: 'الأعلى تطابقاً',
      sortTop: 'أفضل الترشيحات أولاً',
      sortTopPicks: 'أفضل الترشيحات أولاً',
      sortValuation: 'أعلى تصنيف مالي',
      sortAlpha: 'أبجدياً (A-Z)',
      exportBtn: 'تصدير',
      exportExcel: 'ملف إكسل (.xlsx)',
      exportCsv: 'ملف CSV (.csv)',
      cardView: 'بطاقات',
      tableView: 'جدول',
      expandAllAnalysis: 'عرض تحليل جميع الدومينات',
      collapseAllAnalysis: 'إخفاء التحليل التفصيلي',
      noResultsTitle: 'لم يتم العثور على دومينات مطابقة',
      noResultsDesc: 'جرب تعديل كلمة البحث، أو تغيير فلتر الامتداد، أو توليد قائمة جديدة.',
    },
    domainCard: {
      topPick: 'ترشيح مميز',
      bestDomainBadge: 'أفضل دومين مختار',
      selectBest: 'اختيار كأفضل',
      selectedBest: 'الدومين المختار',
      nicheMatch: 'نسبة التطابق',
      valuation: 'التقييم التجاري',
      registrars: 'فحص التوفر لدى المسجلين',
      breakdownToggle: 'التحليل الدلالي والتجاري',
      breakdownHide: 'إخفاء التحليل',
      breakdownHeading: 'التحليل الدلالي والتجاري للكلمتين',
      word1: 'الكلمة الأولى',
      word2: 'الكلمة الثانية',
      scoreLabel: 'التقييم',
      dictionaryMeaning: 'المعنى المعجمي',
      commercialStrength: 'القوة التجارية',
      compoundSynergyTitle: 'التكامل الاسمي والتمركز التجاري:',
      targetSectorsTitle: 'القطاعات المستهدفة والشركات المهتمة',
      potentialBuyersTitle: 'المشترون والمستثمرون المحتملون',
      liquidityDemandTitle: 'السيولة وسرعة التداول والاستحواذ:',
      meaning: 'المعنى والدلالة',
      commercialPower: 'القوة التجارية والتسويقية',
      synergy: 'قوة وتناغم الكلمتين معاً',
      interestedSectors: 'الشركات والقطاعات المهتمة',
      potentialBuyers: 'المستثمرون والجهات المستهدفة',
      liquiditySpeed: 'سرعة البيع والقيمة السوقية',
      copy: 'نسخ',
      copied: 'تم النسخ!',
    },
    savedDrawer: {
      title: 'قائمة النطاقات المحفوظة',
      emptyTitle: 'لا توجد دومينات محفوظة حتى الآن',
      emptyDesc: 'انقر على رمز النجمة بجانب أي دومين في البطاقات أو الجدول لإضافته إلى قائمتك المفضلة.',
      copyAll: 'نسخ الكل',
      exportCsv: 'تصدير CSV',
      clearAll: 'مسح الكل',
    },
    table: {
      rank: '#',
      domainAndAnalysis: 'الدومين والتحليل اللغوي والتجاري',
      tld: 'الامتداد',
      matchScore: 'نسبة التطابق',
      validationBadges: 'معايير الفحص',
      valuationTier: 'تصنيف القيمة',
      actions: 'إجراءات',
      check: 'فحص التوفر',
      showAnalysis: 'تفصيل الكلمتين والجهات المهتمة',
      hideAnalysis: 'إخفاء تفصيل الكلمتين',
      wordsBadge: (c: number) => `${c} كلمات`,
      noDashes: 'خالٍ من الشرطات',
      noNumbers: 'خالٍ من الأرقام',
      endingInHours: (h: number) => `ينتهي خلال ${h} س`,
      analysisHeading: (d: string) => `تحليل كلمتي الدومين "${d}" والجهات المستهدفة`,
      synergyHeading: '💡 قوة جمع الكلمتين معاً في الدومين:',
      interestedSectorsHeading: 'الشركات والقطاعات المهتمة بهذا الدومين:',
      potentialBuyersHeading: 'المستثمرون ورواد الأعمال المستهدفون:',
      tierPremium: 'ممتاز (Premium)',
      tierBrandable: 'براند (Brandable)',
      tierStandard: 'قياسي (Standard)',
    },
    excelAnalyzer: {
      dropTitle: 'اسحب وأفلت ملف الإكسل (.xlsx) أو CSV هنا، أو استعرض',
      dropSubtitle: 'يدعم ملفات .xlsx و .xls و .csv مع كشف عمود الدومينات تلقائياً',
      browse: 'استعراض الملفات',
      loadSample: 'تحميل ملف تجريبي جاهز (.xlsx)',
      domainColumn: 'عمود الدومينات المختار:',
      previewRows: 'معاينة أول 5 أسطر',
      hidePreview: 'إخفاء معاينة الملف',
      targetModeTitle: 'استراتيجية البحث والفرز',
      searchByKeyword: 'بحث بكلمة مستهدفة (مثل: cloud, pay, ai)',
      searchByNiche: 'بحث بالتصنيف والنيش العام',
      targetKeywordLabel: 'الكلمة المفتاحية المراد فحصها',
      targetKeywordPlaceholder: 'مثال: cloud, pay, data, ai, flow, vault, smart...',
      contextTopicLabel: 'مجال الملف أو القطاع المستهدف',
      contextTopicPlaceholder: 'مثال: Fintech, AI tools, Cloud security, SaaS analytics...',
      relaxFilters: 'السماح بالنطاقات ذات الكلمة الواحدة إذا طابقت الكلمة تماماً',
      relaxFiltersDesc: 'تضمين الدومينات الفائقة ذات الكلمة الواحدة المطابقة للكلمة',
      runAuditBtn: (count: number) => `تصفية وتصنيف أفضل ${count} دومينات ثنائية`,
      runningAudit: 'جاري فحص وتصنيف دومينات الملف...',
      viewDiscarded: 'عرض النطاقات المستبعدة والمخالفة للشروط',
      statsTotal: 'إجمالي النطاقات',
      statsPassed: 'المؤهل (كلمتان)',
      statsFailed: 'المستبعد',
    },
    footer: {
      description: 'CheckCatch.com — منصة تدقيق واصطياد النطاقات الثنائية وفحص ملفات الإكسل.',
      verifiedNotice: 'روابط فحص واستعلام مباشرة عبر واجهات مسجلي النطاقات الرسميين.',
      rights: 'جميع الحقوق محفوظة.',
      socials: {
        connect: 'تواصل وتابعنا',
        instagram: 'إنستغرام',
        facebook: 'فيسبوك',
        whatsapp: 'واتساب',
        whatsappInquiry: 'محادثة عبر واتساب',
        whatsappOnline: 'متاح للاستفسارات والوساطة',
        whatsappChatMessage: 'مرحباً، أود الاستفسار بخصوص تدقيق واصطياد الدومينات عبر منصة CheckCatch.com',
        copiedNotice: 'تم نسخ رابط محادثة واتساب!',
      },
    },
  },
  fr: {
    nav: {
      tagline: 'Vérifiez la Qualité. Attrapez le Nom.',
      rulesActive: 'Règles Strictes : 2 Mots • Aucun Chiffre • Aucun Tiret',
      shortlist: 'Favoris',
      savedCount: 'enregistrés',
      language: 'Langue',
    },
    hero: {
      badge: 'Moteur de Vérification & Évaluation de Domaines à Deux Mots',
      titlePrimary: 'Vérifiez la Qualité.',
      titleHighlight: 'Attrapez le Nom.',
      titleSecondary: '',
      description:
        'Un outil intelligent de découverte et d’évaluation qui vérifie et estime exclusivement les noms de domaine composés de deux mots anglais valides du dictionnaire.',
    },
    modes: {
      generator: 'Générateur de Domaines',
      generatorDesc: 'Générer des candidats de domaines à 2 mots sélectionnés',
      analyzer: 'Audit de Fichiers Excel/CSV',
      analyzerDesc: 'Filtrer & classer les domaines de votre feuille de calcul',
      verifier: 'Vérificateur Individuel',
      verifierDesc: 'Inspecter & évaluer un nom de domaine spécifique',
    },
    controls: {
      topicLabel: 'Niche, Mots-clés ou Description du Projet',
      topicPlaceholder: 'ex. Outils IA, passerelle de paiement Fintech, sécurité Cloud, SaaS...',
      quickPresets: 'Idées Rapides :',
      countLabel: 'Nombre de Domaines Souhaité',
      countTop3: 'Top 3',
      countTop5: 'Top 5',
      countTop10: 'Top 10',
      countCustom: 'Personnalisé (1 - 25)',
      countCustomRange: 'Choisissez le nombre de domaines (1 à 25) :',
      rulesHeading: 'Filtres de Vérification Stricts',
      ruleTwoWordsTitle: 'Exactement 2 Mots Anglais',
      ruleTwoWordsDesc: 'Doit comporter deux mots distincts du dictionnaire anglais',
      ruleNoDashesTitle: 'Zéro Tiret (-)',
      ruleNoDashesDesc: 'Orthographe continue sans aucun tiret ni trait d’union',
      ruleNoNumbersTitle: 'Zéro Chiffre (0-9)',
      ruleNoNumbersDesc: 'Caractères alphabétiques uniquement pour une mémorisation parfaite',
      ruleCharLengthTitle: 'Nombre de Caractères du Domaine',
      ruleCharLengthDesc: 'Filtrer la longueur du nom de 2 à 25 caractères',
      ruleCharLengthAll: 'Toutes les longueurs (2 - 25)',
      ruleCharLengthRange: (min: number, max: number) => `${min} à ${max} caractères`,
      tldHeading: 'Extensions Prises en Charge',
      tldComOnly: '.com Uniquement',
      coreTlds: 'Principales (.com, .ai, .io)',
      selectAll: 'Tout Sélectionner',
      searchByWord: 'Recherche par Mot',
      searchByNiche: 'Recherche par Niche',
      generateBtn: (count: number) => `Vérifier & Attraper le Top ${count} Domaines`,
      generatingBtn: 'Vérification et évaluation des domaines en cours...',
    },
    results: {
      showingCount: (current: number, total: number) => `Affichage de ${current} sur ${total} domaines`,
      spreadsheetResults: (count: number) => `Affichage des ${count} meilleurs domaines de votre fichier`,
      allTlds: 'Toutes les Extensions',
      searchPlaceholder: 'Rechercher des domaines ou mots-clés...',
      sortBy: 'Trier par',
      sortMatch: 'Meilleure Correspondance',
      sortTop: 'Meilleurs Choix d’Abord',
      sortTopPicks: 'Meilleurs Choix d’Abord',
      sortValuation: 'Plus Haute Valeur Estimée',
      sortAlpha: 'Alphabétique (A-Z)',
      exportBtn: 'Exporter',
      exportExcel: 'Fichier Excel (.xlsx)',
      exportCsv: 'Fichier CSV (.csv)',
      cardView: 'Cartes',
      tableView: 'Tableau',
      expandAllAnalysis: 'Développer Toutes les Analyses',
      collapseAllAnalysis: 'Réduire les Analyses',
      noResultsTitle: 'Aucun domaine correspondant trouvé',
      noResultsDesc: 'Essayez d’ajuster votre recherche, de changer l’extension ou de générer une nouvelle liste.',
    },
    domainCard: {
      topPick: 'Choix Top',
      bestDomainBadge: 'Meilleur Domaine Sélectionné',
      selectBest: 'Choisir comme Meilleur',
      selectedBest: 'Domaine Sélectionné',
      nicheMatch: 'Pertinence Niche',
      valuation: 'Estimation',
      registrars: 'Vérifier chez les Registraires',
      breakdownToggle: 'Analyse Sémantique & Acquéreurs',
      breakdownHide: 'Masquer l’Analyse',
      breakdownHeading: 'Analyse Sémantique & Valeur des Deux Mots',
      word1: 'Mot 1',
      word2: 'Mot 2',
      scoreLabel: 'Score',
      dictionaryMeaning: 'Définition Lexicale',
      commercialStrength: 'Force Commerciale',
      compoundSynergyTitle: 'Synergie Composée & Positionnement :',
      targetSectorsTitle: 'Secteurs Cibles & Entreprises Potentielles',
      potentialBuyersTitle: 'Profils d’Acquéreurs & Investisseurs Visés',
      liquidityDemandTitle: 'Liquidité & Potentiel d’Acquisition :',
      meaning: 'Sens & Signification',
      commercialPower: 'Puissance Commerciale',
      synergy: 'Synergie des Deux Mots',
      interestedSectors: 'Secteurs & Entreprises Cibles',
      potentialBuyers: 'Profils d’Acquéreurs & Investisseurs',
      liquiditySpeed: 'Liquidité & Potentiel de Revente',
      copy: 'Copier',
      copied: 'Copié !',
    },
    savedDrawer: {
      title: 'Domaines Favoris',
      emptyTitle: 'Aucun domaine enregistré',
      emptyDesc: 'Cliquez sur l’étoile d’un domaine pour l’ajouter à votre liste de favoris.',
      copyAll: 'Tout Copier',
      exportCsv: 'Exporter CSV',
      clearAll: 'Tout Effacer',
    },
    table: {
      rank: '#',
      domainAndAnalysis: 'Domaine & Analyse Sémantique',
      tld: 'Ext',
      matchScore: 'Score',
      validationBadges: 'Règles de Validation',
      valuationTier: 'Niveau d’Estimation',
      actions: 'Actions',
      check: 'Vérifier',
      showAnalysis: 'Analyse des Mots & Acheteurs Cibles',
      hideAnalysis: 'Masquer l’Analyse',
      wordsBadge: (c: number) => `${c} Mots`,
      noDashes: 'Sans Tiret',
      noNumbers: 'Sans Chiffre',
      endingInHours: (h: number) => `Fin dans ${h}h`,
      analysisHeading: (d: string) => `Décomposition Sémantique pour "${d}" & Acquéreurs Potentiels`,
      synergyHeading: '💡 Synergie des Deux Mots & Mémorisation :',
      interestedSectorsHeading: 'Secteurs d’Activité & Entreprises Intéressées :',
      potentialBuyersHeading: 'Profils d’Acquéreurs & Investisseurs Visés :',
      tierPremium: 'Premium',
      tierBrandable: 'Brandable',
      tierStandard: 'Standard',
    },
    excelAnalyzer: {
      dropTitle: 'Déposez votre fichier Excel (.xlsx) ou CSV ici, ou parcourez',
      dropSubtitle: 'Prend en charge .xlsx, .xls et .csv avec détection automatique de la colonne domaine',
      browse: 'parcourir',
      loadSample: 'Charger un Fichier Exemple (.xlsx)',
      domainColumn: 'Colonne Domaine Sélectionnée :',
      previewRows: 'Aperçu des 5 Premières Lignes',
      hidePreview: 'Masquer l’Aperçu',
      targetModeTitle: 'Stratégie de Découverte',
      searchByKeyword: 'Recherche par Mot Cible (ex. cloud, pay, ai)',
      searchByNiche: 'Recherche par Niche / Secteur Général',
      targetKeywordLabel: 'Mot-Clé Spécifique à Rechercher',
      targetKeywordPlaceholder: 'ex. cloud, pay, data, ai, flow, vault, smart...',
      contextTopicLabel: 'Thème du Portefeuille ou Industrie Cible',
      contextTopicPlaceholder: 'ex. Fintech, Outils IA, Sécurité Cloud, Analytique SaaS...',
      relaxFilters: 'Autoriser les domaines à 1 mot si correspondance exacte',
      relaxFiltersDesc: 'Inclure les domaines premium à 1 mot contenant le mot-clé cible',
      runAuditBtn: (count: number) => `Filtrer & Classer le Top ${count} Domaines à 2 Mots`,
      runningAudit: 'Évaluation et classement des domaines du fichier...',
      viewDiscarded: 'Voir les Domaines Écartés / Rejetés',
      statsTotal: 'Total Téléchargé',
      statsPassed: 'Qualifiés (2 Mots)',
      statsFailed: 'Écartés',
    },
    footer: {
      description: 'CheckCatch.com — Plateforme d’audit de feuilles de calcul et d’évaluation de domaines à 2 mots.',
      verifiedNotice: 'Vérification directe auprès des registraires officiels.',
      rights: 'Tous droits réservés.',
      socials: {
        connect: 'Suivez-nous & Contact',
        instagram: 'Instagram',
        facebook: 'Facebook',
        whatsapp: 'WhatsApp',
        whatsappInquiry: 'Discuter sur WhatsApp',
        whatsappOnline: 'En ligne pour vos demandes de domaines',
        whatsappChatMessage: 'Bonjour CheckCatch.com, je souhaite obtenir des conseils pour l’évaluation et l’acquisition de domaines.',
        copiedNotice: 'Lien WhatsApp copié !',
      },
    },
  },
  es: {
    nav: {
      tagline: 'Comprueba la Calidad. Atrapa el Nombre.',
      rulesActive: 'Reglas Estrictas: 2 Palabras • Sin Números • Sin Guiones',
      shortlist: 'Guardados',
      savedCount: 'guardados',
      language: 'Idioma',
    },
    hero: {
      badge: 'Motor de Verificación y Valoración de Dominios de Dos Palabras',
      titlePrimary: 'Comprueba la Calidad.',
      titleHighlight: 'Atrapa el Nombre.',
      titleSecondary: '',
      description:
        'Una herramienta inteligente de descubrimiento y evaluación que verifica y valora exclusivamente nombres de dominio compuestos por dos palabras válidas del diccionario en inglés.',
    },
    modes: {
      generator: 'Generador de Dominios',
      generatorDesc: 'Genera candidatos de dominios de 2 palabras seleccionados',
      analyzer: 'Auditoría de Excel/CSV',
      analyzerDesc: 'Filtra y clasifica dominios de tu hoja de cálculo',
      verifier: 'Verificador Individual',
      verifierDesc: 'Inspecciona y evalúa cualquier dominio individual',
    },
    controls: {
      topicLabel: 'Nicho, Palabras Clave o Descripción del Concepto',
      topicPlaceholder: 'ej. Herramientas IA, pasarela Fintech, seguridad Cloud, analítica SaaS...',
      quickPresets: 'Ideas Rápidas:',
      countLabel: 'Cantidad de Dominios Deseada',
      countTop3: 'Top 3',
      countTop5: 'Top 5',
      countTop10: 'Top 10',
      countCustom: 'Personalizado (1 - 25)',
      countCustomRange: 'Elige la cantidad de dominios (1 a 25):',
      rulesHeading: 'Filtros de Verificación Estrictos',
      ruleTwoWordsTitle: 'Exactamente 2 Palabras en Inglés',
      ruleTwoWordsDesc: 'Deben ser dos palabras distintas del diccionario de alta recordación',
      ruleNoDashesTitle: 'Cero Guiones (-)',
      ruleNoDashesDesc: 'Ortografía continua y limpia sin guiones ni separadores',
      ruleNoNumbersTitle: 'Cero Dígitos / Números (0-9)',
      ruleNoNumbersDesc: 'Solo caracteres alfabéticos para máxima autoridad y recuerdo',
      ruleCharLengthTitle: 'Longitud de Caracteres del Dominio',
      ruleCharLengthDesc: 'Filtra la longitud del nombre de 2 a 25 caracteres',
      ruleCharLengthAll: 'Cualquier longitud (2 - 25)',
      ruleCharLengthRange: (min: number, max: number) => `${min} a ${max} caracteres`,
      tldHeading: 'Extensiones de Dominio Compatibles',
      tldComOnly: 'Solo .com',
      coreTlds: 'Principales (.com, .ai, .io)',
      selectAll: 'Seleccionar Todo',
      searchByWord: 'Buscar por Palabra',
      searchByNiche: 'Buscar por Nicho',
      generateBtn: (count: number) => `Verificar y Atrapar los Mejores ${count} Dominios`,
      generatingBtn: 'Verificando y evaluando candidatos de dominio...',
    },
    results: {
      showingCount: (current: number, total: number) => `Mostrando ${current} de ${total} dominios`,
      spreadsheetResults: (count: number) => `Mostrando las mejores ${count} opciones de tu archivo subido`,
      allTlds: 'Todas las Extensiones',
      searchPlaceholder: 'Buscar dominios o palabras clave...',
      sortBy: 'Ordenar por',
      sortMatch: 'Mayor Coincidencia',
      sortTop: 'Mejores Opciones Primero',
      sortTopPicks: 'Mejores Opciones Primero',
      sortValuation: 'Mayor Valoración Estimada',
      sortAlpha: 'Alfabético (A-Z)',
      exportBtn: 'Exportar',
      exportExcel: 'Archivo Excel (.xlsx)',
      exportCsv: 'Archivo CSV (.csv)',
      cardView: 'Tarjetas',
      tableView: 'Tabla',
      expandAllAnalysis: 'Expandir Todos los Análisis',
      collapseAllAnalysis: 'Contraer Todos los Análisis',
      noResultsTitle: 'No se encontraron dominios coincidentes',
      noResultsDesc: 'Intenta ajustar tu búsqueda, cambiar el filtro de extensión o generar nuevos candidatos.',
    },
    domainCard: {
      topPick: 'Opción Destacada',
      bestDomainBadge: 'Mejor Dominio Seleccionado',
      selectBest: 'Elegir como Mejor',
      selectedBest: 'Dominio Seleccionado',
      nicheMatch: 'Afinidad de Nicho',
      valuation: 'Valoración Comercial',
      registrars: 'Verificar en Registradores',
      breakdownToggle: 'Desglose Semántico',
      breakdownHide: 'Ocultar Desglose',
      breakdownHeading: 'Análisis Semántico y de Valor de Dos Palabras',
      word1: 'Palabra 1',
      word2: 'Palabra 2',
      scoreLabel: 'Puntuación',
      dictionaryMeaning: 'Significado de Diccionario',
      commercialStrength: 'Fuerza Comercial',
      compoundSynergyTitle: 'Sinergia Compuesta y Posicionamiento de Marca:',
      targetSectorsTitle: 'Sectores Objetivo y Empresas Potenciales',
      potentialBuyersTitle: 'Compradores Potenciales e Inversores',
      liquidityDemandTitle: 'Liquidez y Demanda de Adquisición:',
      meaning: 'Significado y Concepto',
      commercialPower: 'Poder Comercial',
      synergy: 'Sinergia Combinada del Dominio',
      interestedSectors: 'Industrias y Empresas Objetivo',
      potentialBuyers: 'Compradores e Inversores Objetivo',
      liquiditySpeed: 'Liquidez y Potencial de Reventa',
      copy: 'Copiar',
      copied: '¡Copiado!',
    },
    savedDrawer: {
      title: 'Dominios Guardados',
      emptyTitle: 'Aún no hay dominios guardados',
      emptyDesc: 'Haz clic en la estrella de cualquier tarjeta o fila de tabla para agregarlo a tus favoritos.',
      copyAll: 'Copiar Todo',
      exportCsv: 'Exportar CSV',
      clearAll: 'Borrar Todo',
    },
    table: {
      rank: '#',
      domainAndAnalysis: 'Dominio y Desglose Semántico',
      tld: 'Ext',
      matchScore: 'Puntuación',
      validationBadges: 'Reglas de Validación',
      valuationTier: 'Nivel de Valoración',
      actions: 'Acciones',
      check: 'Verificar',
      showAnalysis: 'Análisis de Palabras y Compradores',
      hideAnalysis: 'Ocultar Análisis',
      wordsBadge: (c: number) => `${c} Palabras`,
      noDashes: 'Sin Guiones',
      noNumbers: 'Sin Números',
      endingInHours: (h: number) => `Termina en ${h}h`,
      analysisHeading: (d: string) => `Desglose Semántico de Dos Palabras para "${d}" y Compradores Potenciales`,
      synergyHeading: '💡 Sinergia Combinada y Recordación:',
      interestedSectorsHeading: 'Sectores Industriales y Empresas Interesadas:',
      potentialBuyersHeading: 'Compradores e Inversores Objetivo:',
      tierPremium: 'Premium',
      tierBrandable: 'De Marca (Brandable)',
      tierStandard: 'Estándar (Standard)',
    },
    excelAnalyzer: {
      dropTitle: 'Arrastra tu archivo Excel (.xlsx) o CSV aquí, o examina',
      dropSubtitle: 'Compatible con .xlsx, .xls y .csv con detección automática de columna de dominio',
      browse: 'examinar',
      loadSample: 'Cargar Portafolio de Ejemplo (.xlsx)',
      domainColumn: 'Columna de Dominio Seleccionada:',
      previewRows: 'Vista Previa Primeras 5 Filas',
      hidePreview: 'Ocultar Vista Previa',
      targetModeTitle: 'Estrategia de Descubrimiento',
      searchByKeyword: 'Buscar por Palabra Objetivo (ej. cloud, pay, ai)',
      searchByNiche: 'Buscar por Nicho / Industria General',
      targetKeywordLabel: 'Palabra Semilla Específica a Buscar',
      targetKeywordPlaceholder: 'ej. cloud, pay, data, ai, flow, vault, smart...',
      contextTopicLabel: 'Tema del Portafolio o Industria Objetivo',
      contextTopicPlaceholder: 'ej. Fintech, Herramientas IA, Seguridad Cloud, Analítica SaaS...',
      relaxFilters: 'Permitir dominios de 1 palabra si coinciden exactamente',
      relaxFiltersDesc: 'Incluir dominios premium de 1 palabra que contengan la palabra clave objetivo',
      runAuditBtn: (count: number) => `Filtrar y Clasificar los Mejores ${count} Dominios de 2 Palabras`,
      runningAudit: 'Evaluando y puntuando candidatos de la hoja de cálculo...',
      viewDiscarded: 'Ver Dominios Descartados / Filtrados',
      statsTotal: 'Total Subidos',
      statsPassed: 'Aprobados (2 Palabras)',
      statsFailed: 'Descartados',
    },
    footer: {
      description: 'CheckCatch.com — Plataforma de auditoría de hojas de cálculo y evaluación de dominios de 2 palabras.',
      verifiedNotice: 'Verificación directa mediante consultas oficiales con registradores.',
      rights: 'Todos los derechos reservados.',
      socials: {
        connect: 'Conéctate con Nosotros',
        instagram: 'Instagram',
        facebook: 'Facebook',
        whatsapp: 'WhatsApp',
        whatsappInquiry: 'Chatear por WhatsApp',
        whatsappOnline: 'En línea para Consultas de Dominios',
        whatsappChatMessage: 'Hola CheckCatch.com, me interesa la evaluación y asesoría en adquisición de dominios.',
        copiedNotice: '¡Enlace de WhatsApp copiado!',
      },
    },
  },
};
