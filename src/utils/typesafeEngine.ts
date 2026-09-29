export type TypeSafeCategory =
  | 'tech_ai'
  | 'finance'
  | 'ecommerce'
  | 'health'
  | 'crypto'
  | 'general_junk';

export type RecommendedAction = 'RECOMMENDED_BUY' | 'CONSIDER' | 'AVOID';

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
  category: TypeSafeCategory;
  categoryLabelEn: string;
  categoryLabelAr: string;
  hasRisk: boolean; // has_trademark_risk
  matchedTrademark?: string;
  brandable: boolean; // is_brandable
  brandProbability: number; // 0.0 to 1.0 quality & ease percentage
  recommendedAction: RecommendedAction;
  rawAnalysis: TypeSafeRawAnalysis;
  latencyMs?: number;
}

// Protected global trademarks list for instant trademark risk detection
export const PROTECTED_TRADEMARKS: string[] = [
  'apple', 'iphone', 'ipad', 'macbook', 'airpods',
  'google', 'youtube', 'android', 'pixel', 'waymo', 'gemini',
  'microsoft', 'windows', 'xbox', 'azure', 'copilot', 'github', 'linkedin',
  'amazon', 'aws', 'kindle', 'alexa', 'primevideo',
  'meta', 'facebook', 'instagram', 'whatsapp', 'oculus', 'threads',
  'nike', 'adidas', 'puma', 'reebok', 'gucci', 'rolex', 'louisvuitton', 'chanel', 'prada',
  'tesla', 'spacex', 'starlink', 'openai', 'chatgpt', 'anthropic', 'claude',
  'netflix', 'disney', 'marvel', 'pixar', 'spotify', 'tiktok', 'snapchat',
  'paypal', 'stripe', 'visa', 'mastercard', 'amex', 'coinbase', 'binance',
  'samsung', 'sony', 'playstation', 'nintendo', 'intel', 'nvidia', 'amd', 'cisco', 'oracle', 'ibm',
  'uber', 'airbnb', 'doordash', 'lyft', 'shopify', 'salesforce', 'adobe', 'slack', 'zoom',
  'coca', 'cocacola', 'pepsi', 'starbucks', 'mcdonalds', 'walmart', 'target', 'costco',
  'ferrari', 'porsche', 'lamborghini', 'mercedes', 'bmw', 'toyota', 'honda', 'ford'
];

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
    'signal', 'echo', 'beam', 'pixel', 'engine', 'system', 'compute', 'server', 'dock'
  ],
  finance: [
    'pay', 'bank', 'fund', 'cash', 'lend', 'wealth', 'capital', 'venture', 'asset',
    'invest', 'trade', 'deal', 'fin', 'fintech', 'credit', 'loan', 'tax', 'rate',
    'yield', 'stock', 'bond', 'vault', 'safe', 'trust', 'guard', 'shield', 'equity',
    'ledger', 'treasury', 'money', 'penny', 'gold', 'silver', 'prime', 'mint'
  ],
  ecommerce: [
    'shop', 'store', 'cart', 'buy', 'sell', 'mart', 'market', 'bazaar', 'retail',
    'order', 'pack', 'ship', 'box', 'goods', 'brand', 'sale', 'offer', 'price',
    'merch', 'drop', 'mall', 'checkout', 'basket', 'club', 'spot', 'zone', 'room'
  ],
  health: [
    'health', 'med', 'care', 'cure', 'bio', 'gene', 'life', 'heal', 'fit', 'vital',
    'well', 'clinic', 'doc', 'pharma', 'remedy', 'pure', 'mind', 'body', 'soul',
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
 * Deterministic TypeSafe AI SystemOne evaluation engine.
 */
export function evaluateDomainWithTypeSafeRules(
  rawDomain: string,
  existingRelevanceScore?: number,
  existingWordsCount?: number
): TypeSafeDomainEvaluation {
  const start = Date.now();
  const clean = (rawDomain || '').trim().toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
  const lastDot = clean.lastIndexOf('.');
  const slug = lastDot !== -1 ? clean.substring(0, lastDot) : clean;
  const tld = lastDot !== -1 ? clean.substring(lastDot) : '.com';
  const alphaSlug = slug.replace(/[^a-z0-9]/g, '');

  // 1. Check Trademark Risk (has_trademark_risk)
  let matchedTrademark: string | undefined;
  for (const tm of PROTECTED_TRADEMARKS) {
    if (alphaSlug.includes(tm)) {
      matchedTrademark = tm.charAt(0).toUpperCase() + tm.slice(1);
      break;
    }
  }
  const hasRisk = Boolean(matchedTrademark);
  const riskProbability = hasRisk ? 0.96 : 0.02;

  // 2. Determine Primary Industry Category (category)
  let bestCategory: TypeSafeCategory = 'tech_ai';
  let maxHits = 0;

  (Object.keys(CATEGORY_KEYWORDS) as Array<Exclude<TypeSafeCategory, 'general_junk'>>).forEach((cat) => {
    const keywords = CATEGORY_KEYWORDS[cat];
    let hits = 0;
    for (const kw of keywords) {
      if (alphaSlug.includes(kw)) {
        hits += kw.length >= 4 ? 2 : 1;
      }
    }
    if (hits > maxHits) {
      maxHits = hits;
      bestCategory = cat;
    }
  });

  const hasDashes = slug.includes('-') || slug.includes('_');
  const hasNumbers = /\d/.test(slug);
  const isReasonableLength = alphaSlug.length >= 4 && alphaSlug.length <= 15;

  if (maxHits === 0) {
    if (hasDashes || hasNumbers || alphaSlug.length > 18) {
      bestCategory = 'general_junk';
    } else {
      bestCategory = 'tech_ai';
    }
  }

  // 3. Brandability & Quality Percentage (is_brandable)
  let brandProb = 0.85;
  if (tld === '.com') brandProb += 0.08;
  else if (tld === '.ai' || tld === '.io') brandProb += 0.06;
  else if (tld === '.co' || tld === '.net' || tld === '.org') brandProb += 0.02;
  else brandProb -= 0.05;

  if (alphaSlug.length >= 5 && alphaSlug.length <= 12) brandProb += 0.05;
  else if (alphaSlug.length > 15) brandProb -= 0.15;

  if (hasDashes) brandProb -= 0.30;
  if (hasNumbers) brandProb -= 0.25;
  if (hasRisk) brandProb -= 0.35;
  if (existingWordsCount && existingWordsCount !== 2) brandProb -= 0.18;

  brandProb = Number(Math.min(0.99, Math.max(0.12, brandProb)).toFixed(2));
  const brandable = brandProb >= 0.72 && !hasDashes && !hasNumbers;

  // 4. Investment Score (1 to 5) (investment_score)
  let score = 4;
  if (hasRisk || bestCategory === 'general_junk' || (hasDashes && hasNumbers)) {
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

  if (existingRelevanceScore !== undefined && !hasRisk && !hasDashes && !hasNumbers) {
    if (existingRelevanceScore >= 94) score = 5;
    else if (existingRelevanceScore >= 86) score = Math.max(score, 4);
  }

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
      probability: maxHits > 0 ? 0.92 : 0.74,
    },
    investment_score: {
      value: score,
    },
  };

  const catMeta = CATEGORY_LABELS[bestCategory] || CATEGORY_LABELS.tech_ai;

  return {
    domain: `${slug}${tld}`,
    score,
    category: bestCategory,
    categoryLabelEn: catMeta.en,
    categoryLabelAr: catMeta.ar,
    hasRisk,
    matchedTrademark,
    brandable,
    brandProbability: brandProb,
    recommendedAction,
    rawAnalysis,
    latencyMs: Math.max(1, Date.now() - start),
  };
}
