export type TypeSafeCategory =
  | 'tech_ai'
  | 'finance'
  | 'ecommerce'
  | 'health'
  | 'crypto'
  | 'general_junk';

export type RecommendedAction = 'RECOMMENDED_BUY' | 'CONSIDER' | 'AVOID';

export type ValuationClass = 'High Value' | 'Moderate Value' | 'Low Value';

export interface TypeSafeRawAnalysis {
  is_brandable: {
    value: boolean;
    probability: number;
  };
  has_trademark_risk: {
    value: boolean;
    probability: number;
    matchedTrademark?: string;
  };
  category: {
    value: TypeSafeCategory;
    probability: number;
  };
  investment_score: {
    value: number; // 1 to 5
  };
}

export interface TypeSafeDomainEvaluation {
  domain: string;
  score: number; // 1 to 5 (investment_score)
  valuationTier: ValuationClass;
  isHighValue: boolean;
  isSingleWordComOverride?: boolean;
  category: TypeSafeCategory;
  categoryLabelEn: string;
  categoryLabelAr: string;
  hasRisk: boolean; // has_trademark_risk
  matchedTrademark?: string;
  brandable: boolean; // is_brandable
  brandProbability: number; // 0.0 to 1.0 quality & ease percentage
  recommendedAction: RecommendedAction;
  rawAnalysis: TypeSafeRawAnalysis;
  trademarkDisclaimerAr: string;
  trademarkDisclaimerEn: string;
  latencyMs?: number;
}

export const TRADEMARK_DISCLAIMER_AR =
  'إخلاء مسؤولية: فحص العلامات التجارية هو فحص تقريبي عبر الذكاء الاصطناعي لأغراض استرشادية فقط وليس استشارة قانونية رسمية.';

export const TRADEMARK_DISCLAIMER_EN =
  'Disclaimer: Trademark risk screening is an approximate AI-based check for informational purposes only and does not constitute formal legal advice.';

// Distinctive global trademarks (flagged even when used as substrings in compound domains)
export const PROTECTED_TRADEMARKS: string[] = [
  'apple', 'iphone', 'ipad', 'macbook', 'airpods',
  'google', 'youtube', 'android', 'pixel', 'waymo', 'gemini',
  'microsoft', 'windows', 'xbox', 'azure', 'copilot', 'github', 'linkedin',
  'amazon', 'aws', 'kindle', 'alexa', 'primevideo',
  'facebook', 'instagram', 'whatsapp', 'oculus', 'threads',
  'nike', 'adidas', 'reebok', 'gucci', 'rolex', 'louisvuitton', 'chanel', 'prada',
  'tesla', 'spacex', 'starlink', 'openai', 'chatgpt', 'anthropic', 'claude',
  'netflix', 'disney', 'marvel', 'pixar', 'spotify', 'tiktok', 'snapchat',
  'paypal', 'mastercard', 'amex', 'coinbase', 'binance',
  'samsung', 'playstation', 'nintendo', 'nvidia', 'cisco',
  'airbnb', 'doordash', 'lyft', 'shopify', 'salesforce',
  'cocacola', 'pepsi', 'starbucks', 'mcdonalds', 'walmart', 'costco',
  'ferrari', 'porsche', 'lamborghini', 'mercedes', 'toyota', 'honda',
  'hubspot', 'zendesk', 'cloudflare', 'robinhood'
];

// Famous established global brands, major web portals, and iconic companies that are also dictionary/short words
export const FAMOUS_ESTABLISHED_BRANDS: Record<string, string> = {
  ask: 'Ask.com (Global Brand)',
  apple: 'Apple Inc.',
  google: 'Google',
  meta: 'Meta Platforms',
  amazon: 'Amazon',
  nike: 'Nike',
  target: 'Target Corp.',
  uber: 'Uber Technologies',
  chase: 'Chase Bank',
  shell: 'Shell Global',
  time: 'TIME Magazine',
  forbes: 'Forbes Media',
  fortune: 'Fortune Media',
  slack: 'Slack Technologies',
  zoom: 'Zoom Video',
  notion: 'Notion Labs',
  figma: 'Figma',
  canva: 'Canva',
  stripe: 'Stripe',
  visa: 'Visa Inc.',
  oracle: 'Oracle Corp.',
  adobe: 'Adobe Inc.',
  intel: 'Intel Corp.',
  amd: 'AMD',
  ibm: 'IBM',
  dell: 'Dell Technologies',
  sony: 'Sony Corp.',
  ford: 'Ford Motor',
  bmw: 'BMW',
  audi: 'Audi',
  puma: 'Puma',
  zara: 'Zara',
  ikea: 'IKEA',
  ebay: 'eBay',
  yahoo: 'Yahoo!',
  bing: 'Microsoft Bing',
  yelp: 'Yelp',
  zillow: 'Zillow',
  indeed: 'Indeed',
  booking: 'Booking.com',
  expedia: 'Expedia',
  kayak: 'Kayak',
  dropbox: 'Dropbox',
  reddit: 'Reddit',
  quora: 'Quora',
  twitch: 'Twitch',
  discord: 'Discord',
  pinterest: 'Pinterest',
  revolut: 'Revolut',
  asana: 'Asana',
  trello: 'Trello',
  vercel: 'Vercel',
  supabase: 'Supabase',
  cnn: 'CNN',
  bbc: 'BBC',
  espn: 'ESPN',
  hbo: 'HBO',
};

// Curated short single dictionary words for the .com High-Value Override Logic
export const SHORT_SINGLE_DICTIONARY_WORDS: Set<string> = new Set([
  // Ultra-short 2-4 letter dictionary words
  'ai', 'go', 'up', 'on', 'in', 'we', 'my', 'do', 'so', 'no', 'me', 'us', 'it', 'ox',
  'ask', 'car', 'cars', 'news', 'pay', 'buy', 'app', 'web', 'net', 'dev', 'bot', 'pro',
  'max', 'fit', 'run', 'win', 'bet', 'job', 'jobs', 'work', 'tax', 'law', 'art', 'map',
  'jet', 'air', 'fly', 'sea', 'sun', 'sky', 'pet', 'pets', 'dog', 'cat', 'man', 'men',
  'mom', 'dad', 'kid', 'kids', 'toy', 'toys', 'box', 'bag', 'hat', 'cup', 'tea', 'bar',
  'pub', 'gym', 'spa', 'med', 'bio', 'doc', 'dna', 'lab', 'labs', 'hub', 'key', 'way',
  'day', 'now', 'new', 'one', 'top', 'big', 'red', 'blue', 'gold', 'gas', 'oil', 'ice',
  'auto', 'bank', 'cash', 'coin', 'fund', 'loan', 'save', 'deal', 'swap', 'shop', 'mart',
  'mall', 'cart', 'sale', 'sell', 'ship', 'pack', 'drop', 'care', 'cure', 'heal', 'life',
  'mind', 'body', 'soul', 'diet', 'calm', 'pure', 'safe', 'home', 'land', 'room', 'nest',
  'yard', 'door', 'roof', 'rent', 'city', 'town', 'park', 'farm', 'tree', 'wood', 'rock',
  'iron', 'fire', 'wind', 'rain', 'snow', 'star', 'moon', 'wave', 'tide', 'lake', 'bay',
  'talk', 'chat', 'call', 'mail', 'post', 'send', 'link', 'code', 'data', 'tech', 'byte',
  'node', 'grid', 'mesh', 'sync', 'flow', 'core', 'base', 'desk', 'spot', 'zone', 'view',
  'scan', 'find', 'seek', 'book', 'read', 'page', 'note', 'word', 'text', 'file', 'film',
  'song', 'tune', 'beat', 'game', 'play', 'golf', 'club', 'team', 'crew', 'hire', 'lead',
  'idea', 'wise', 'real', 'true', 'fast', 'rush', 'dash', 'glow', 'beam', 'tour', 'trip',
  'ride', 'sail', 'boat', 'port', 'dock', 'food', 'dish', 'cook', 'chef', 'meal', 'wine',
  'beer', 'bake', 'mint', 'seed', 'grow', 'rise', 'lift', 'make', 'lock', 'pass', 'card',
  'time', 'uber', 'zoom', 'visa', 'ford', 'dell', 'sony',
  // High-value 5-7 letter single dictionary words
  'cloud', 'voice', 'money', 'smart', 'prime', 'first', 'alpha', 'trust', 'guard', 'cyber',
  'brain', 'robot', 'agent', 'model', 'scale', 'spark', 'pulse', 'forge', 'nexus', 'orbit',
  'trade', 'stock', 'forex', 'asset', 'worth', 'value', 'price', 'brand', 'store', 'order',
  'learn', 'study', 'class', 'tutor', 'sport', 'sports', 'shoes', 'watch', 'style', 'dress',
  'house', 'homes', 'villa', 'build', 'legal', 'court', 'hotel', 'hotels', 'media', 'music',
  'video', 'photo', 'phone', 'solar', 'power', 'green', 'water', 'earth', 'world', 'globe',
  'space', 'insure', 'health', 'wealth', 'credit', 'invest', 'market', 'crypto', 'travel',
  'energy', 'doctor', 'clinic', 'pharma', 'casino', 'luxury', 'retail', 'search', 'loans',
  'funds', 'banks', 'deals', 'games', 'books', 'foods', 'gifts', 'cards', 'tools', 'parts'
]);

export const CATEGORY_LABELS: Record<TypeSafeCategory, { en: string; ar: string; badgeClass: string }> = {
  tech_ai: {
    en: 'Tech / AI',
    ar: 'التقنية والذكاء الاصطناعي (Tech / AI)',
    badgeClass: 'bg-indigo-50 text-indigo-800 border-indigo-200',
  },
  finance: {
    en: 'Finance',
    ar: 'المالية والتقنية المالية (Finance)',
    badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  },
  ecommerce: {
    en: 'E-Commerce',
    ar: 'التجارة الإلكترونية (E-Commerce)',
    badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
  },
  health: {
    en: 'Health',
    ar: 'الصحة والتقنية الحيوية (Health)',
    badgeClass: 'bg-rose-50 text-rose-800 border-rose-200',
  },
  crypto: {
    en: 'Crypto & Web3',
    ar: 'العملات الرقمية والبلوكتشين (Crypto)',
    badgeClass: 'bg-purple-50 text-purple-800 border-purple-200',
  },
  general_junk: {
    en: 'General / Low Tier',
    ar: 'عام / منخفض القيمة (General)',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
  },
};

const CATEGORY_KEYWORDS: Record<Exclude<TypeSafeCategory, 'general_junk'>, string[]> = {
  tech_ai: [
    'ai', 'tech', 'cloud', 'data', 'code', 'dev', 'bot', 'neural', 'synth', 'logic',
    'cyber', 'node', 'grid', 'mesh', 'stack', 'sync', 'flow', 'quantum', 'vector',
    'matrix', 'core', 'nexus', 'forge', 'spark', 'pulse', 'scale', 'hub', 'labs', 'lab',
    'app', 'web', 'net', 'saas', 'ops', 'smart', 'auto', 'agent', 'prompt', 'vision', 'deep',
    'orbit', 'apex', 'zenith', 'prime', 'shift', 'wave', 'link', 'pilot', 'craft', 'scope',
    'signal', 'echo', 'beam', 'pixel', 'engine', 'system', 'compute', 'server', 'dock',
    'ask', 'search', 'news', 'media', 'voice', 'video', 'music', 'photo', 'phone'
  ],
  finance: [
    'pay', 'bank', 'fund', 'cash', 'lend', 'wealth', 'capital', 'venture', 'asset',
    'invest', 'trade', 'deal', 'fin', 'fintech', 'credit', 'loan', 'tax', 'rate',
    'yield', 'stock', 'bond', 'vault', 'safe', 'trust', 'guard', 'shield', 'equity',
    'ledger', 'treasury', 'money', 'penny', 'gold', 'silver', 'prime', 'mint', 'insure'
  ],
  ecommerce: [
    'shop', 'store', 'cart', 'buy', 'sell', 'mart', 'market', 'bazaar', 'retail',
    'order', 'pack', 'ship', 'box', 'goods', 'brand', 'sale', 'offer', 'price',
    'merch', 'drop', 'mall', 'checkout', 'basket', 'club', 'spot', 'zone', 'room',
    'car', 'cars', 'auto', 'hotel', 'hotels', 'travel', 'tour', 'trip', 'shoes', 'watch', 'luxury'
  ],
  health: [
    'health', 'med', 'care', 'cure', 'bio', 'gene', 'life', 'heal', 'fit', 'vital',
    'well', 'clinic', 'doc', 'doctor', 'pharma', 'remedy', 'pure', 'mind', 'body', 'soul',
    'calm', 'sleep', 'diet', 'nutri', 'gym', 'yoga', 'dna', 'cell', 'pulse'
  ],
  crypto: [
    'crypto', 'coin', 'token', 'chain', 'block', 'defi', 'web3', 'dao', 'hash',
    'swap', 'stake', 'wallet', 'dex', 'nft', 'bit', 'ether', 'sol', 'zk', 'node'
  ],
};

/**
 * Generates an external registration link for buying the domain.
 */
export function getExternalDomainBuyUrl(domain: string): string {
  const clean = (domain || '').trim().toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
  const normalized = clean.includes('.') ? clean : `${clean}.com`;
  return `https://www.namecheap.com/domains/registration/results/?domain=${encodeURIComponent(normalized)}`;
}

/**
 * Checks whether a domain slug is a short single dictionary word (e.g., ask, news, car).
 * Accepts an optional external dictionary predicate from the backend for 274k-word coverage.
 */
export function isShortSingleDictionaryWord(
  slug: string,
  externalIsSingleWordFn?: (word: string) => boolean
): boolean {
  const clean = (slug || '').trim().toLowerCase();
  if (!/^[a-z]{2,7}$/.test(clean)) return false;
  if (SHORT_SINGLE_DICTIONARY_WORDS.has(clean)) return true;
  if (externalIsSingleWordFn && externalIsSingleWordFn(clean)) return true;
  return false;
}

/**
 * Detects if a domain conflicts with a famous established global brand or trademark,
 * including famous brands that are also dictionary words (e.g., ask.com, time.com, target.com).
 */
export function detectTrademarkOrFamousBrand(alphaSlug: string): {
  hasRisk: boolean;
  matchedTrademark?: string;
} {
  if (!alphaSlug) return { hasRisk: false };

  // 1. Exact match against famous established global brands & major portals (e.g. ask.com, time.com, target.com, uber.com)
  if (FAMOUS_ESTABLISHED_BRANDS[alphaSlug]) {
    return {
      hasRisk: true,
      matchedTrademark: FAMOUS_ESTABLISHED_BRANDS[alphaSlug],
    };
  }

  // 2. Substring match against distinctive protected trademarks (e.g. applecloud.com, nikestore.com)
  for (const tm of PROTECTED_TRADEMARKS) {
    if (alphaSlug.includes(tm)) {
      return {
        hasRisk: true,
        matchedTrademark: FAMOUS_ESTABLISHED_BRANDS[tm] || (tm.charAt(0).toUpperCase() + tm.slice(1)),
      };
    }
  }

  return { hasRisk: false };
}

/**
 * Deterministic TypeSafe AI SystemOne evaluation engine with Single-Word .com Override Logic.
 */
export function evaluateDomainWithTypeSafeRules(
  rawDomain: string,
  existingRelevanceScore?: number,
  existingWordsCount?: number,
  externalIsSingleWordFn?: (word: string) => boolean
): TypeSafeDomainEvaluation {
  const start = Date.now();
  const clean = (rawDomain || '').trim().toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
  const lastDot = clean.lastIndexOf('.');
  const slug = lastDot !== -1 ? clean.substring(0, lastDot) : clean;
  const tld = lastDot !== -1 ? clean.substring(lastDot) : '.com';
  const alphaSlug = slug.replace(/[^a-z0-9]/g, '');

  const hasDashes = slug.includes('-') || slug.includes('_');
  const hasNumbers = /\d/.test(slug);

  // 1. Check Trademark & Famous Global Brand Risk (has_trademark_risk)
  const tmDetection = detectTrademarkOrFamousBrand(alphaSlug);
  const hasRisk = tmDetection.hasRisk;
  const matchedTrademark = tmDetection.matchedTrademark;
  const riskProbability = hasRisk ? 0.96 : 0.02;

  // 2. Check Programmatic Override Logic:
  // If the domain is a short single dictionary word (e.g. ask, news, car) AND has .com extension ->
  // Automatically force Investment Score = 5/5 and Valuation = High Value!
  const isSingleShortWord =
    !hasDashes &&
    !hasNumbers &&
    isShortSingleDictionaryWord(alphaSlug, externalIsSingleWordFn);
  const isSingleWordComOverride = isSingleShortWord && tld === '.com';

  // 3. Determine Primary Industry Category (category)
  let bestCategory: TypeSafeCategory = 'tech_ai';
  let maxHits = 0;

  (Object.keys(CATEGORY_KEYWORDS) as Array<Exclude<TypeSafeCategory, 'general_junk'>>).forEach((cat) => {
    const keywords = CATEGORY_KEYWORDS[cat];
    let hits = 0;
    for (const kw of keywords) {
      if (alphaSlug === kw) {
        hits += 4;
      } else if (alphaSlug.includes(kw)) {
        hits += kw.length >= 4 ? 2 : 1;
      }
    }
    if (hits > maxHits) {
      maxHits = hits;
      bestCategory = cat;
    }
  });

  const isReasonableLength = alphaSlug.length >= 2 && alphaSlug.length <= 15;

  if (maxHits === 0) {
    if ((hasDashes || hasNumbers || alphaSlug.length > 18) && !isSingleWordComOverride) {
      bestCategory = 'general_junk';
    } else {
      bestCategory = 'tech_ai';
    }
  }

  // 4. Brandability & Quality Percentage (is_brandable)
  let brandProb = 0.85;
  if (tld === '.com') brandProb += 0.08;
  else if (tld === '.ai' || tld === '.io') brandProb += 0.06;
  else if (tld === '.co' || tld === '.net' || tld === '.org') brandProb += 0.02;
  else brandProb -= 0.05;

  if (alphaSlug.length >= 2 && alphaSlug.length <= 12) brandProb += 0.05;
  else if (alphaSlug.length > 15) brandProb -= 0.15;

  if (hasDashes) brandProb -= 0.30;
  if (hasNumbers) brandProb -= 0.25;
  if (hasRisk && !isSingleWordComOverride) brandProb -= 0.35;
  if (existingWordsCount && existingWordsCount !== 2 && !isSingleShortWord) brandProb -= 0.18;

  if (isSingleWordComOverride) {
    brandProb = 0.99;
  } else {
    brandProb = Number(Math.min(0.99, Math.max(0.12, brandProb)).toFixed(2));
  }

  const brandable = isSingleWordComOverride || (brandProb >= 0.72 && !hasDashes && !hasNumbers);

  // 5. Investment Score (1 to 5) & Valuation Tier
  let score = 4;
  if (isSingleWordComOverride) {
    // Programmatic Override: Single short dictionary word + .com -> 5/5 & High Value
    score = 5;
  } else if (hasRisk || bestCategory === 'general_junk' || (hasDashes && hasNumbers)) {
    score = 1;
  } else if (hasDashes || hasNumbers || alphaSlug.length > 17) {
    score = 2;
  } else if (brandProb >= 0.90 && (tld === '.com' || tld === '.ai' || tld === '.io') && isReasonableLength) {
    score = 5;
  } else if (brandProb >= 0.81 && isReasonableLength) {
    score = 4;
  } else {
    score = 3;
  }

  if (existingRelevanceScore !== undefined && !hasRisk && !hasDashes && !hasNumbers && !isSingleWordComOverride) {
    if (existingRelevanceScore >= 94) score = 5;
    else if (existingRelevanceScore >= 86) score = Math.max(score, 4);
  }

  const isHighValue = isSingleWordComOverride || score >= 4;
  const valuationTier: ValuationClass = isSingleWordComOverride || score >= 4
    ? 'High Value'
    : score === 3
    ? 'Moderate Value'
    : 'Low Value';

  // Recommendation
  let recommendedAction: RecommendedAction = 'AVOID';
  if (!hasRisk && score >= 4 && brandProb > 0.80) {
    recommendedAction = 'RECOMMENDED_BUY';
  } else if (!hasRisk && score >= 3) {
    recommendedAction = 'CONSIDER';
  }

  const rawAnalysis: TypeSafeRawAnalysis = {
    is_brandable: {
      value: brandable,
      probability: brandProb,
    },
    has_trademark_risk: {
      value: hasRisk,
      probability: riskProbability,
      matchedTrademark,
    },
    category: {
      value: bestCategory,
      probability: maxHits > 0 || isSingleWordComOverride ? 0.95 : 0.78,
    },
    investment_score: {
      value: score,
    },
  };

  const catMeta = CATEGORY_LABELS[bestCategory] || CATEGORY_LABELS.tech_ai;

  return {
    domain: `${slug}${tld}`,
    score,
    valuationTier,
    isHighValue,
    isSingleWordComOverride,
    category: bestCategory,
    categoryLabelEn: catMeta.en,
    categoryLabelAr: catMeta.ar,
    hasRisk,
    matchedTrademark,
    brandable,
    brandProbability: brandProb,
    recommendedAction,
    rawAnalysis,
    trademarkDisclaimerAr: TRADEMARK_DISCLAIMER_AR,
    trademarkDisclaimerEn: TRADEMARK_DISCLAIMER_EN,
    latencyMs: Math.max(1, Date.now() - start),
  };
}
