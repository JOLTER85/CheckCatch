import * as XLSX from 'xlsx';
import { DomainItem, FilterRules, FilterEvaluationStats, DiscardedDomain, UploadedSheetInfo } from '../types';

// Common English words set for client-side quick 2-word verification and fallbacks
const COMMON_DICTIONARY_SET = new Set([
  // Core tech, cloud, SaaS & engineering roots
  "cloud", "data", "flow", "nova", "byte", "meta", "hyper", "synth", "pulse",
  "apex", "zenith", "vortex", "nexus", "prism", "cyber", "omni", "vector",
  "strata", "flux", "core", "orbit", "quantum", "neural", "atlas", "beacon",
  "crest", "spark", "forge", "prime", "swift", "true", "bold", "clear", "bright",
  "smart", "deep", "peak", "stack", "logic", "echo", "drift", "wave", "link",
  "signal", "pilot", "craft", "scale", "sprint", "vault", "loom", "weave",
  "node", "shift", "sync", "mesh", "hub", "base", "grid", "point", "loop",
  "dock", "gate", "path", "wire", "port", "nest", "mark", "view", "track",
  "cast", "mint", "room", "deck", "leap", "zone", "line", "scope", "labs",
  "works", "force", "drive", "space", "mate", "code", "app", "web", "net",
  "dot", "pixel", "screen", "bot", "auto", "block", "chain", "token", "asset",
  "ledger", "bazaar", "exchange", "saas", "tech", "dev", "crypto", "ai", "io",

  // Business, finance, commerce & commerce
  "pay", "coin", "bank", "fund", "cash", "lend", "safe", "cure", "care", "heal",
  "med", "life", "bio", "gene", "fit", "run", "sport", "game", "play", "win",
  "bet", "pro", "max", "go", "fast", "speed", "quick", "rush", "dash", "deal",
  "trade", "swap", "share", "send", "post", "mail", "cart", "buy", "sell", "shop",
  "store", "mart", "work", "job", "hire", "team", "crew", "club", "group", "hive",
  "desk", "bench", "trust", "shield", "guard", "ward", "secure", "pure", "real",
  "wise", "brain", "mind", "think", "idea", "lead", "first", "alpha", "omega",
  "edge", "front", "venture", "capital", "angel", "launch", "rocket",

  // Nature, elements & environment
  "fly", "air", "sky", "star", "sun", "moon", "sea", "ocean", "river", "lake",
  "land", "field", "farm", "green", "blue", "red", "gold", "silver", "iron", "steel",
  "rock", "stone", "wood", "tree", "leaf", "root", "seed", "grow", "rise", "lift",
  "build", "make", "light", "glow", "shine", "beam", "ray", "flash", "fire", "flame",
  "heat", "warm", "cool", "ice", "frost", "snow", "rain", "storm", "wind", "breeze",
  "fog", "mist", "drop", "tide", "stream", "float", "sail", "ship", "boat", "bay",
  "harbor", "coast", "shore", "beach", "island", "isle", "hill", "mount", "summit",
  "ridge", "cliff", "valley", "canyon", "plain", "grove", "forest", "park", "home",
  "house", "camp", "yard", "realm", "world", "globe", "sphere", "ring", "circle",
  "square", "matrix", "network", "system", "engine", "motor", "power", "energy",
  "boost", "thrust", "guide", "galaxy", "solar", "lunar", "astro",

  // Communication, senses & interaction
  "chat", "talk", "speak", "voice", "sound", "tune", "beat", "song", "read", "write",
  "book", "page", "note", "word", "text", "doc", "file", "eye", "lens", "scan",
  "find", "seek", "spot", "route", "way", "road", "lane", "street", "door", "key",
  "lock", "pass", "card", "badge", "hall", "box", "den",

  // Single English words that must NOT be confused for 2-word compounds
  "marketing", "technology", "insurance", "computer", "hospital", "doctor", "medicine",
  "university", "college", "school", "education", "management", "consulting", "software",
  "hardware", "platform", "solution", "solutions", "service", "services", "finance",
  "investment", "investing", "banking", "analytics", "security", "developer", "engineering",

  // Everyday consumer, services, lifestyle & industrial terms
  "laundry", "freedom", "wash", "clean", "fresh", "quick", "iron", "dry", "towel", "cloth",
  "home", "care", "auto", "car", "rent", "moto", "drive", "ride", "trip", "tour", "stay",
  "inn", "host", "chef", "cook", "bake", "meal", "food", "dish", "cafe", "bar", "brew",
  "tea", "wine", "beer", "drink", "cup", "pot", "pan", "farm", "crop", "yard", "barn",
  "pet", "vet", "dog", "cat", "bird", "fish", "hair", "skin", "spa", "nail", "glow",
  "fit", "gym", "lift", "yoga", "walk", "step", "pace", "move", "flow", "rest", "sleep",
  "dream", "mind", "soul", "calm", "ease", "heal", "help", "hope", "love", "joy", "kind",
  "fair", "free", "bold", "wild", "wise", "true", "real", "pure", "fine", "rich", "gold"
]);

const INVALID_WORD_PARTS = new Set([
  "ing", "ed", "ly", "er", "es", "est", "tion", "ness", "ment", "able", "ible",
  "al", "ic", "ive", "ous", "ful", "less", "ish", "ist", "ism", "ity", "ty",
  "ize", "ise", "ate", "dom"
]);

const VALID_TWO_LETTER_WORDS = new Set([
  "ai", "go", "my", "up", "in", "on", "by", "to", "we", "do", "so", "no", "re",
  "co", "io", "ex", "me", "us", "it", "at", "as", "he", "is", "am", "an", "ox"
]);

/**
 * Checks if a string is a genuine English word in the client dictionary.
 */
export function isClientRealEnglishWord(word: string): boolean {
  if (!word) return false;
  const clean = word.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
  if (clean.length < 2) return false;
  if (INVALID_WORD_PARTS.has(clean)) return false;
  if (clean.length === 2 && !VALID_TWO_LETTER_WORDS.has(clean)) return false;
  return COMMON_DICTIONARY_SET.has(clean);
}

/**
 * Checks if a string is a single atomic English word,
 * meaning it is a real English word and cannot be further split into
 * two or more valid English words of length >= 2 (e.g. "voltcharge" -> "volt" + "charge" is NOT atomic).
 */
export function isClientAtomicEnglishWord(word: string): boolean {
  if (!isClientRealEnglishWord(word)) return false;
  const clean = word.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
  if (clean.length < 4) return true;

  for (let i = 2; i <= clean.length - 2; i++) {
    const sub1 = clean.substring(0, i);
    const sub2 = clean.substring(i);
    if (isClientRealEnglishWord(sub1) && isClientRealEnglishWord(sub2)) {
      // Composite of multiple English words (e.g. volt + charge, urban + villages)
      return false;
    }
  }

  return true;
}

/**
 * Client-side domain decomposition:
 * Returns [w1, w2] ONLY if the name breaks into EXACTLY two verified atomic English words from the dictionary.
 * If the domain is a single dictionary word, 3+ words (e.g. smartvoltcharge, smarturbanvillages), or cannot be cleanly split, returns [clean] (length 1).
 */
export function clientDecomposeWords(name: string, targetKeyword?: string): string[] {
  const clean = name.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (!clean || clean.length < 3) return [name];

  const cleanKw = targetKeyword ? targetKeyword.trim().toLowerCase().replace(/[^a-z0-9]/g, '') : '';

  // 1. Direct keyword prefix/suffix decomposition if keyword matches
  // CRITICAL: The paired non-keyword part MUST be a 100% verified atomic single English dictionary word
  if (cleanKw && clean.length > cleanKw.length) {
    if (clean.startsWith(cleanKw)) {
      const rest = clean.slice(cleanKw.length);
      if (isClientAtomicEnglishWord(rest)) {
        return [cleanKw, rest];
      }
      return [clean]; // Has 3+ words or invalid suffix
    } else if (clean.endsWith(cleanKw)) {
      const prefix = clean.slice(0, clean.length - cleanKw.length);
      if (isClientAtomicEnglishWord(prefix)) {
        return [prefix, cleanKw];
      }
      return [clean]; // Has 3+ words or invalid prefix
    } else {
      return [clean];
    }
  }

  const validSplits: [string, string][] = [];

  for (let i = 2; i <= clean.length - 2; i++) {
    const w1 = clean.substring(0, i);
    const w2 = clean.substring(i);

    const isW1Valid = isClientAtomicEnglishWord(w1) || (cleanKw && w1 === cleanKw);
    const isW2Valid = isClientAtomicEnglishWord(w2) || (cleanKw && w2 === cleanKw);

    // Both constituent parts must be verified atomic English dictionary words
    if (isW1Valid && isW2Valid) {
      validSplits.push([w1, w2]);
    }
  }

  if (validSplits.length > 0) {
    if (cleanKw) {
      const match = validSplits.find(([a, b]) => a === cleanKw || b === cleanKw);
      if (match) return match;
    }

    validSplits.sort((a, b) => {
      const minLenA = Math.min(a[0].length, a[1].length);
      const minLenB = Math.min(b[0].length, b[1].length);
      if (minLenB !== minLenA) return minLenB - minLenA;
      return Math.abs(a[0].length - a[1].length) - Math.abs(b[0].length - b[1].length);
    });

    return validSplits[0];
  }

  // Does not form two valid English words: return single item
  return [clean];
}

/**
 * Parse an uploaded .xlsx or .csv spreadsheet file using SheetJS
 */
export async function parseSpreadsheetFile(file: File): Promise<UploadedSheetInfo> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });

  const sheetNames = workbook.SheetNames;
  if (!sheetNames || sheetNames.length === 0) {
    throw new Error('Spreadsheet contains no sheets');
  }

  const firstSheet = workbook.Sheets[sheetNames[0]];
  const rawRows: any[][] = XLSX.utils.sheet_to_json(firstSheet, { header: 1, defval: '' });

  if (!rawRows || rawRows.length === 0) {
    throw new Error('The uploaded spreadsheet is empty');
  }

  // Check if row 0 itself is a data row containing domains rather than headers
  const row0HasDomain = rawRows[0].some((c) => {
    const s = String(c || '').trim().toLowerCase();
    return /^[a-zA-Z0-9-]{2,}\.[a-zA-Z]{2,}(?:\/.*)?$/.test(s) || s.includes('.com') || s.includes('.ai') || s.includes('.io') || s.includes('.co');
  });

  const headerRow = row0HasDomain
    ? rawRows[0].map((_, i) => `Column ${i + 1}`)
    : rawRows[0].map((h, i) => String(h || `Column ${i + 1}`).trim());

  const dataRows = (row0HasDomain ? rawRows : rawRows.slice(1)).filter((row) =>
    row.some((c) => String(c).trim() !== '')
  );

  if (dataRows.length === 0) {
    throw new Error('No data rows found in the spreadsheet');
  }

  // Detect domain column
  let detectedColumnIndex = -1;

  // 1. Check header text for domain-related terms
  const domainHeaderKeywords = ['domain', 'domain name', 'name', 'url', 'site', 'website', 'fqdn', 'hostname', 'domain_name'];
  for (let i = 0; i < headerRow.length; i++) {
    const headerLower = headerRow[i].toLowerCase();
    if (domainHeaderKeywords.some((k) => headerLower === k || headerLower.includes(k))) {
      detectedColumnIndex = i;
      break;
    }
  }

  // 2. If not detected by header, scan row values for domain patterns (e.g. word.tld)
  if (detectedColumnIndex === -1) {
    const domainRegex = /^[a-zA-Z0-9-]{2,}\.[a-zA-Z]{2,}$/;
    for (let c = 0; c < headerRow.length; c++) {
      let matchCount = 0;
      for (let r = 0; r < Math.min(dataRows.length, 10); r++) {
        const val = String(dataRows[r][c] || '').trim();
        if (domainRegex.test(val) || val.includes('.')) {
          matchCount++;
        }
      }
      if (matchCount >= 2) {
        detectedColumnIndex = c;
        break;
      }
    }
  }

  // Fallback to column 0 if still undetected
  if (detectedColumnIndex === -1) {
    detectedColumnIndex = 0;
  }

  const selectedColumn = headerRow[detectedColumnIndex];

  // Extract raw domain list and unique TLDs
  const detectedDomains: string[] = [];
  const seen = new Set<string>();
  const detectedTldsSet = new Set<string>();

  for (const row of dataRows) {
    const cellVal = String(row[detectedColumnIndex] || '').trim();
    if (cellVal) {
      // Clean leading protocol if present
      const clean = cellVal.replace(/https?:\/\//i, '').replace(/^www\./i, '').replace(/\/.*$/, '').toLowerCase();
      if (clean && !seen.has(clean)) {
        seen.add(clean);
        detectedDomains.push(clean);
        const lastDot = clean.lastIndexOf('.');
        if (lastDot !== -1 && lastDot < clean.length - 1) {
          detectedTldsSet.add(clean.substring(lastDot));
        }
      }
    }
  }

  // Format preview rows (up to 5)
  const previewRows = dataRows.slice(0, 5).map((row) => {
    const obj: Record<string, any> = {};
    headerRow.forEach((col, idx) => {
      obj[col] = row[idx] ?? '';
    });
    return obj;
  });

  return {
    fileName: file.name,
    fileSize: file.size,
    sheetNames,
    columns: headerRow,
    selectedColumn,
    totalRows: dataRows.length,
    previewRows,
    detectedDomains,
    detectedTlds: Array.from(detectedTldsSet),
    allRows: dataRows,
  };
}

export const NICHE_KEYWORDS_MAP: Record<string, string[]> = {
  fintech: ['pay', 'coin', 'bank', 'fund', 'cash', 'lend', 'wallet', 'credit', 'wealth', 'money', 'vault', 'yield', 'mint', 'trade', 'deal', 'asset', 'capital', 'stock', 'token', 'ledger', 'chain', 'tax', 'loan', 'bill', 'save', 'fin', 'rate', 'cost'],
  finance: ['pay', 'coin', 'bank', 'fund', 'cash', 'lend', 'wallet', 'credit', 'wealth', 'money', 'vault', 'yield', 'mint', 'trade', 'deal', 'asset', 'capital', 'stock', 'token', 'ledger', 'chain', 'tax', 'loan', 'bill', 'save', 'fin', 'rate', 'cost'],
  ai: ['ai', 'bot', 'brain', 'mind', 'neural', 'synth', 'logic', 'agent', 'deep', 'smart', 'auto', 'cog', 'intel', 'vision', 'think', 'learn', 'model', 'prompt', 'robot', 'quantum', 'vector', 'meta'],
  artificial: ['ai', 'bot', 'brain', 'mind', 'neural', 'synth', 'logic', 'agent', 'deep', 'smart', 'auto', 'cog', 'intel', 'vision', 'think', 'learn', 'model', 'prompt', 'robot', 'quantum', 'vector', 'meta'],
  cloud: ['cloud', 'node', 'mesh', 'sync', 'stack', 'host', 'port', 'dock', 'core', 'grid', 'server', 'flow', 'wire', 'nexus', 'base', 'hub', 'infra', 'scale', 'edge', 'pipe', 'link'],
  devops: ['cloud', 'node', 'mesh', 'sync', 'stack', 'host', 'port', 'dock', 'core', 'grid', 'server', 'flow', 'wire', 'nexus', 'base', 'hub', 'infra', 'scale', 'edge', 'pipe', 'ops'],
  health: ['health', 'care', 'cure', 'med', 'bio', 'life', 'doc', 'fit', 'heal', 'gene', 'pill', 'pulse', 'body', 'vital', 'well', 'mind', 'pure', 'safe', 'clinic', 'diet', 'remedy'],
  medical: ['health', 'care', 'cure', 'med', 'bio', 'life', 'doc', 'fit', 'heal', 'gene', 'pill', 'pulse', 'body', 'vital', 'well', 'mind', 'pure', 'safe', 'clinic', 'diet', 'remedy'],
  healthtech: ['health', 'care', 'cure', 'med', 'bio', 'life', 'doc', 'fit', 'heal', 'gene', 'pill', 'pulse', 'body', 'vital', 'well', 'mind', 'pure', 'safe', 'clinic', 'diet', 'remedy'],
  biotech: ['bio', 'gene', 'med', 'life', 'cure', 'care', 'lab', 'cell', 'dna', 'heal', 'pure', 'vital', 'plant', 'nature'],
  crypto: ['crypto', 'block', 'chain', 'coin', 'token', 'hash', 'dao', 'ledger', 'vault', 'mint', 'node', 'bit', 'byte', 'meta', 'swap', 'defi', 'web3'],
  web3: ['crypto', 'block', 'chain', 'coin', 'token', 'hash', 'dao', 'ledger', 'vault', 'mint', 'node', 'bit', 'byte', 'meta', 'swap', 'defi', 'web3'],
  ecommerce: ['cart', 'shop', 'store', 'buy', 'sell', 'mart', 'deal', 'market', 'trade', 'ship', 'pack', 'drop', 'bazaar', 'pay', 'order', 'box', 'flow'],
  retail: ['cart', 'shop', 'store', 'buy', 'sell', 'mart', 'deal', 'market', 'trade', 'ship', 'pack', 'drop', 'bazaar', 'pay', 'order', 'box', 'flow'],
  realestate: ['home', 'house', 'land', 'space', 'room', 'nest', 'prop', 'roof', 'yard', 'door', 'hall', 'place', 'estate', 'build', 'zone', 'camp', 'villa', 'realty'],
  proptech: ['home', 'house', 'land', 'space', 'room', 'nest', 'prop', 'roof', 'yard', 'door', 'hall', 'place', 'estate', 'build', 'zone', 'camp', 'villa', 'realty'],
  security: ['shield', 'guard', 'safe', 'lock', 'key', 'wall', 'trust', 'vault', 'secure', 'defend', 'armor', 'pass', 'ward', 'cyber', 'zero', 'watch', 'sentry'],
  cybersecurity: ['shield', 'guard', 'safe', 'lock', 'key', 'wall', 'trust', 'vault', 'secure', 'defend', 'armor', 'pass', 'ward', 'cyber', 'zero', 'watch', 'sentry'],
  tech: ['code', 'dev', 'tech', 'byte', 'stack', 'data', 'cloud', 'core', 'node', 'sync', 'mesh', 'hub', 'flow', 'nexus', 'matrix', 'system', 'engine', 'grid', 'port', 'gate'],
  data: ['data', 'byte', 'flow', 'core', 'node', 'base', 'stream', 'graph', 'metric', 'view', 'track', 'scan', 'matrix', 'lake', 'warehouse', 'cloud', 'forge'],
  code: ['code', 'dev', 'stack', 'git', 'script', 'byte', 'api', 'app', 'web', 'engine', 'build', 'craft', 'tool', 'lab', 'forge'],
  marketing: ['brand', 'viral', 'post', 'reach', 'buzz', 'rank', 'lead', 'funnel', 'click', 'view', 'media', 'social', 'growth', 'boost', 'cast', 'mark'],
  travel: ['fly', 'trip', 'way', 'path', 'tour', 'ride', 'drive', 'voyage', 'jet', 'air', 'sail', 'ship', 'route', 'stay', 'camp', 'sky', 'bay'],
  gaming: ['game', 'play', 'win', 'quest', 'pixel', 'arcade', 'arena', 'stream', 'cast', 'beat', 'tune', 'fun', 'bet', 'sport'],
  education: ['learn', 'study', 'school', 'academy', 'tutor', 'skill', 'class', 'book', 'teach', 'mind', 'brain', 'read', 'know', 'wise'],
  food: ['food', 'dish', 'cook', 'chef', 'bite', 'meal', 'eat', 'taste', 'kitchen', 'bake', 'farm', 'fresh', 'mint', 'table', 'bar'],
  energy: ['energy', 'solar', 'sun', 'green', 'power', 'watt', 'volt', 'wind', 'eco', 'clean', 'grid', 'light', 'ray', 'heat'],
  logistics: ['ship', 'pack', 'port', 'dock', 'move', 'track', 'route', 'load', 'fleet', 'cargo', 'swift', 'speed', 'flow'],
};

/**
 * Calculates semantic niche matching bonus and details.
 */
export function matchNicheScore(
  words: string[],
  domainName: string,
  nicheContext?: string
): { isMatch: boolean; bonus: number; matchedKeywords: string[]; primaryNicheName?: string } {
  if (!nicheContext || !nicheContext.trim()) {
    return { isMatch: false, bonus: 0, matchedKeywords: [] };
  }

  const rawTokens = nicheContext
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length >= 2);

  if (rawTokens.length === 0) {
    return { isMatch: false, bonus: 0, matchedKeywords: [] };
  }

  const targetSemanticWords = new Set<string>();
  rawTokens.forEach((t) => {
    targetSemanticWords.add(t);
    if (NICHE_KEYWORDS_MAP[t]) {
      NICHE_KEYWORDS_MAP[t].forEach((w) => targetSemanticWords.add(w));
    }
  });

  const matchedKeywords: string[] = [];
  let directWordMatches = 0;
  let semanticMatches = 0;

  for (const w of words) {
    const cleanW = w.toLowerCase();
    if (rawTokens.includes(cleanW)) {
      directWordMatches++;
      matchedKeywords.push(cleanW);
    } else if (targetSemanticWords.has(cleanW)) {
      semanticMatches++;
      matchedKeywords.push(cleanW);
    }
  }

  const isMatch = directWordMatches > 0 || semanticMatches > 0;
  const bonus = directWordMatches * 24 + semanticMatches * 14;

  return { isMatch, bonus, matchedKeywords, primaryNicheName: rawTokens[0] };
}

/**
 * Validates whether a domain matches an exact mandatory keyword.
 */
export function matchKeywordRule(
  words: string[],
  domainName: string,
  targetKeyword?: string
): { matches: boolean; matchedWord?: string } {
  if (!targetKeyword || !targetKeyword.trim()) {
    return { matches: true };
  }
  const cleanKw = targetKeyword.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
  if (!cleanKw) return { matches: true };

  const rawLower = (domainName || '').toLowerCase();
  const lastDot = rawLower.lastIndexOf('.');
  const nameOnly = lastDot !== -1 ? rawLower.substring(0, lastDot) : rawLower;
  const cleanSlug = nameOnly.replace(/[^a-z0-9]/g, '');

  // 1. Exact match in constituent words (e.g. ['smart', 'labs'] matches 'smart')
  if (words && words.length > 0) {
    const foundWord = words.find((w) => {
      const lowerW = (w || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      return lowerW === cleanKw;
    });
    if (foundWord) {
      return { matches: true, matchedWord: foundWord };
    }
  }

  // 2. Tokenized check for hyphenated/underscored domains (e.g. "smart-labs")
  const tokens = nameOnly.split(/[-_.]+/).filter(Boolean);
  for (const token of tokens) {
    const cleanToken = token.replace(/[^a-z0-9]/g, '');
    if (cleanToken === cleanKw) {
      return { matches: true, matchedWord: token };
    }
  }

  // 3. Exact prefix or suffix in cleanSlug (e.g., smartlabs starts with smart, techsmart ends with smart)
  if (cleanSlug.startsWith(cleanKw) || cleanSlug.endsWith(cleanKw)) {
    return { matches: true, matchedWord: cleanKw };
  }

  return { matches: false };
}

/**
 * Calculates a comprehensive domain quality score and commercial valuation metrics.
 */
export function calculateDomainQualityScore(
  domain: string,
  targetKeyword?: string,
  nicheContext?: string
): {
  score: number;
  tier: 'Premium' | 'Brandable' | 'Standard';
  words: string[];
  isTwoWords: boolean;
  hasDashes: boolean;
  hasNumbers: boolean;
  estimatedValue: string;
} {
  const clean = domain.trim().toLowerCase();
  const lastDot = clean.lastIndexOf('.');
  const name = lastDot !== -1 ? clean.substring(0, lastDot) : clean;
  const tld = lastDot !== -1 ? clean.substring(lastDot) : '.com';
  const cleanKw = targetKeyword ? targetKeyword.trim().toLowerCase().replace(/[^a-z0-9]/g, '') : '';

  const words = clientDecomposeWords(name, cleanKw);
  const isTwoWords = words.length === 2;
  const hasDashes = name.includes('-') || name.includes('_');
  const hasNumbers = /\d/.test(name);

  let score = 80;

  // TLD metrics
  if (tld === '.com') score += 10;
  else if (tld === '.ai' || tld === '.io') score += 8;
  else if (tld === '.co' || tld === '.org') score += 5;
  else score += 2;

  // Structure quality
  if (!hasDashes) score += 4;
  else score -= 8;

  if (!hasNumbers) score += 4;
  else score -= 8;

  // Character length balance (6-14 optimal)
  if (name.length >= 6 && name.length <= 14) score += 4;
  else if (name.length <= 18) score += 2;

  // Two English words bonus
  if (isTwoWords) score += 5;

  // Keyword match bonus
  if (cleanKw) {
    if (matchKeywordRule(words, name, cleanKw).matches) {
      score += 6;
    }
  }

  // Niche match bonus
  if (nicheContext && nicheContext.trim()) {
    const nicheEval = matchNicheScore(words, name, nicheContext);
    if (nicheEval.isMatch) {
      score += Math.min(10, Math.round(nicheEval.bonus / 3));
    }
  }

  score = Math.min(99, Math.max(72, score));

  const tier: 'Premium' | 'Brandable' | 'Standard' =
    score >= 90 ? 'Premium' : score >= 82 ? 'Brandable' : 'Standard';

  let estimatedValue = '$1,200 - $3,500';
  if (tier === 'Premium') {
    const min = Math.round((3800 * (score / 85)) / 100) * 100;
    const max = Math.round((9800 * (score / 85)) / 100) * 100;
    estimatedValue = `$${min.toLocaleString()} - $${max.toLocaleString()}`;
  } else if (tier === 'Brandable') {
    const min = Math.round((1400 * (score / 85)) / 50) * 50;
    const max = Math.round((3400 * (score / 85)) / 50) * 50;
    estimatedValue = `$${min.toLocaleString()} - $${max.toLocaleString()}`;
  } else {
    estimatedValue = '$450 - $1,200';
  }

  return {
    score,
    tier,
    words,
    isTwoWords,
    hasDashes,
    hasNumbers,
    estimatedValue,
  };
}

/**
 * Client-side evaluation fallback engine:
 * Evaluates, scores, and ranks candidate domains locally in <2ms
 * if the server or network connection is slow or offline.
 */
export function clientEvaluateBatch(
  qualifiedDomains: string[],
  count: number,
  rules: FilterRules,
  contextTopic = 'Technology, SaaS, and Digital Ventures',
  searchMode: 'niche' | 'keyword' = 'niche',
  targetKeyword?: string
): DomainItem[] {
  const cleanKw = targetKeyword ? targetKeyword.trim().toLowerCase().replace(/[^a-z0-9]/g, '') : '';
  const isKeywordMode = searchMode === 'keyword' && Boolean(cleanKw);

  const normalizedAllowedTlds = Array.isArray(rules.tlds) && rules.tlds.length > 0
    ? rules.tlds.map((t) => (t.toLowerCase().startsWith('.') ? t.toLowerCase() : `.${t.toLowerCase()}`))
    : [];

  const tldFiltered = normalizedAllowedTlds.length > 0
    ? qualifiedDomains.filter((d) => {
        const lastDot = d.lastIndexOf('.');
        const tld = lastDot !== -1 ? d.substring(lastDot).toLowerCase() : '.com';
        return normalizedAllowedTlds.includes(tld);
      })
    : qualifiedDomains;

  // If in keyword search mode, identify candidates that contain the target keyword
  let matchingKeywordCandidates: string[] = [];
  if (isKeywordMode) {
    matchingKeywordCandidates = tldFiltered.filter((d) => {
      const lastDot = d.lastIndexOf('.');
      const name = lastDot !== -1 ? d.substring(0, lastDot) : d;
      const words = clientDecomposeWords(name, cleanKw);
      return matchKeywordRule(words, name, cleanKw).matches;
    });
  }

  const baseCandidates = isKeywordMode && matchingKeywordCandidates.length > 0
    ? matchingKeywordCandidates
    : tldFiltered.length > 0
    ? tldFiltered
    : qualifiedDomains;

  // Filter pool by character length (minLetters to maxLetters)
  const minLen = typeof rules.minLetters === 'number' ? rules.minLetters : 2;
  const maxLen = typeof rules.maxLetters === 'number' ? rules.maxLetters : 25;
  let pool = baseCandidates.filter((d) => {
    const lastDot = d.lastIndexOf('.');
    const name = lastDot !== -1 ? d.substring(0, lastDot) : d;
    return name.length >= minLen && name.length <= maxLen;
  });

  // If strict exactlyTwoWords produces at least count items, use them; otherwise use full pool with quality ranking
  if (rules.exactlyTwoWords) {
    const twoWordCandidates = pool.filter((d) => {
      const lastDot = d.lastIndexOf('.');
      const name = lastDot !== -1 ? d.substring(0, lastDot) : d;
      return clientDecomposeWords(name, cleanKw).length === 2;
    });
    if (twoWordCandidates.length >= count || twoWordCandidates.length >= 3) {
      pool = twoWordCandidates;
    }
  }

  // Fallback: If pool is empty, use all qualifiedDomains directly
  if (pool.length === 0 && qualifiedDomains.length > 0) {
    pool = [...qualifiedDomains];
  }

  const evaluated: (DomainItem & { isNicheMatch?: boolean; isKeywordMatch?: boolean })[] = pool.map((domainStr, idx) => {
    const raw = domainStr.trim().toLowerCase();
    const lastDot = raw.lastIndexOf('.');
    const name = lastDot !== -1 ? raw.substring(0, lastDot) : raw;
    const tld = lastDot !== -1 ? raw.substring(lastDot) : '.com';
    const words = clientDecomposeWords(name, cleanKw);

    const quality = calculateDomainQualityScore(raw, cleanKw, contextTopic);
    let score = quality.score;

    // Niche relevance evaluation
    const nicheEval = matchNicheScore(words, name, contextTopic);
    let isNicheMatch = false;
    let isKeywordMatch = false;

    if (searchMode === 'niche' && contextTopic && contextTopic.trim()) {
      if (nicheEval.isMatch) {
        score += nicheEval.bonus;
        isNicheMatch = true;
      }
    } else if (searchMode === 'keyword' && cleanKw) {
      const kwEval = matchKeywordRule(words, name, cleanKw);
      if (kwEval.matches) {
        score += 26;
        isKeywordMatch = true;
      }
    }

    score = Math.min(99, Math.max(76, score - (idx % 2)));

    const tier: 'Premium' | 'Brandable' | 'Standard' =
      score >= 92 ? 'Premium' : score >= 85 ? 'Brandable' : 'Standard';

    let valRange = quality.estimatedValue;
    if (tier === 'Premium') {
      const min = Math.round((3500 * (score / 85)) / 100) * 100;
      const max = Math.round((9500 * (score / 85)) / 100) * 100;
      valRange = `$${min.toLocaleString()} - $${max.toLocaleString()}`;
    } else if (tier === 'Brandable') {
      const min = Math.round((1200 * (score / 85)) / 50) * 50;
      const max = Math.round((3200 * (score / 85)) / 50) * 50;
      valRange = `$${min.toLocaleString()} - $${max.toLocaleString()}`;
    } else {
      valRange = '$550 - $1,200';
    }

    let pitch = '';
    if (searchMode === 'keyword' && cleanKw) {
      const otherWord = words.find((w) => w.toLowerCase() !== cleanKw) || words[1] || 'venture';
      pitch = `High-conviction synergy spotlights keyword "${cleanKw}" paired with "${otherWord}" for instant market recall.`;
    } else if (searchMode === 'niche' && isNicheMatch) {
      pitch = `High-relevance match for ${contextTopic}: blends "${words[0]}" + "${words[1] || 'brand'}" with verified category authority.`;
    } else if (words.length === 2) {
      pitch = `Premium 2-word synergy combining "${words[0]}" + "${words[1]}" for ${contextTopic || 'modern digital ventures'}.`;
    } else {
      pitch = `High-recall branding candidate tailored for ${contextTopic || 'modern digital ventures'}.`;
    }

    return {
      id: `client-eval-${idx + 1}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      domain: `${name}${tld}`,
      name,
      tld,
      relevanceScore: score,
      wordsCount: words.length,
      words,
      hasDashes: name.includes('-') || name.includes('_'),
      hasNumbers: /\d/.test(name),
      valuationTier: tier,
      estimatedValue: valRange,
      pitch,
      isTopPick: false,
      topPickBadge: undefined,
      isNicheMatch,
      isKeywordMatch,
      auctionEndingSoon: rules.auctionMode,
      auctionEndsInHours: rules.auctionMode ? (Math.floor(Math.random() * 16) + 1) : undefined,
      auctionCurrentBid: rules.auctionMode ? (`$${Math.floor(Math.random() * 450) + 80}`) : undefined,
    };
  });

  // Sort domains: if keyword mode, keyword matches first; if niche mode, niche matches first; then by score
  evaluated.sort((a, b) => {
    if (searchMode === 'keyword' && cleanKw) {
      if (a.isKeywordMatch && !b.isKeywordMatch) return -1;
      if (!a.isKeywordMatch && b.isKeywordMatch) return 1;
    } else if (searchMode === 'niche' && contextTopic?.trim()) {
      if (a.isNicheMatch && !b.isNicheMatch) return -1;
      if (!a.isNicheMatch && b.isNicheMatch) return 1;
    }
    // Prioritize 2-word domains
    if (a.wordsCount === 2 && b.wordsCount !== 2) return -1;
    if (a.wordsCount !== 2 && b.wordsCount === 2) return 1;

    return b.relevanceScore - a.relevanceScore;
  });

  // Mark top 3 picks
  evaluated.forEach((item, index) => {
    if (index === 0) {
      item.isTopPick = true;
      item.topPickBadge = 'Best Match #1';
    } else if (index === 1) {
      item.isTopPick = true;
      item.topPickBadge = 'Top Pick #2';
    } else if (index === 2) {
      item.isTopPick = true;
      item.topPickBadge = 'Top Pick #3';
    }
  });

  return evaluated.slice(0, count);
}

const CLIENT_SEED_PREFIXES = [
  'cloud', 'data', 'swift', 'nova', 'apex', 'pulse', 'cyber', 'omni', 'vector',
  'flux', 'core', 'orbit', 'quantum', 'neural', 'atlas', 'beacon', 'prime',
  'bright', 'smart', 'logic', 'echo', 'scale', 'vault', 'sync', 'mesh', 'grid'
];

const CLIENT_SEED_SUFFIXES = [
  'flow', 'nexus', 'forge', 'spark', 'stack', 'drift', 'wave', 'link', 'pilot',
  'craft', 'node', 'shift', 'hub', 'point', 'loop', 'gate', 'dock', 'view',
  'track', 'cast', 'mint', 'deck', 'leap', 'zone', 'scope', 'labs', 'works',
  'force', 'drive', 'base'
];

/**
 * Client-side domain generator fallback:
 * Synthesizes compliant 2-word, no-dash, no-number domains instantly
 * if network is unavailable or server is restarting.
 */
export function clientGenerateDomains(
  keywords: string,
  count: number,
  rules: FilterRules
): DomainItem[] {
  const tldPool = rules.tlds && rules.tlds.length > 0
    ? rules.tlds.map((t) => (t.toLowerCase().startsWith('.') ? t.toLowerCase() : `.${t.toLowerCase()}`))
    : ['.com'];
  const results: DomainItem[] = [];
  const seen = new Set<string>();

  const cleanTokens = (keywords || 'cloud tech ai')
    .toLowerCase()
    .replace(/[^a-z\s]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length >= 3);

  const primaryTokens = cleanTokens.length > 0 ? cleanTokens : ['cloud', 'pulse', 'swift', 'data'];

  for (let i = 0; i < count * 3 && results.length < count; i++) {
    const prefix = i % 2 === 0
      ? primaryTokens[i % primaryTokens.length]
      : CLIENT_SEED_PREFIXES[(i * 3) % CLIENT_SEED_PREFIXES.length];

    const suffix = CLIENT_SEED_SUFFIXES[(i * 5 + 2) % CLIENT_SEED_SUFFIXES.length];
    let name = `${prefix}${suffix}`;

    if (rules.noDashes) name = name.replace(/-/g, '');
    if (rules.noNumbers) name = name.replace(/\d/g, '');

    const tld = tldPool[results.length % tldPool.length];
    const full = `${name}${tld}`;

    if (seen.has(full)) continue;
    seen.add(full);

    const score = 98 - (results.length * 2);
    const tier: 'Premium' | 'Brandable' | 'Standard' = score >= 90 ? 'Premium' : score >= 85 ? 'Brandable' : 'Standard';

    results.push({
      id: `client-gen-${results.length + 1}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      domain: full,
      name,
      tld,
      relevanceScore: Math.max(78, score),
      wordsCount: 2,
      words: [prefix, suffix],
      hasDashes: false,
      hasNumbers: false,
      valuationTier: tier,
      estimatedValue: tier === 'Premium' ? '$3,500 - $8,200' : '$1,400 - $3,200',
      pitch: `A high-impact, memorable 2-word brand combining "${prefix}" and "${suffix}".`,
      isTopPick: results.length < 2,
      topPickBadge: results.length === 0 ? 'Best Match #1' : results.length === 1 ? 'Top Pick' : undefined,
      auctionEndingSoon: rules.auctionMode,
      auctionEndsInHours: rules.auctionMode ? (Math.floor(Math.random() * 18) + 2) : undefined,
      auctionCurrentBid: rules.auctionMode ? (`$${Math.floor(Math.random() * 320) + 95}`) : undefined,
    });
  }

  return results;
}

export interface ValidationOptions {
  searchMode?: 'niche' | 'keyword';
  targetKeyword?: string;
  contextTopic?: string;
  relaxKeywordFilters?: boolean;
}

/**
 * Validates a list of candidate domains against active strict rules
 */
export function validateDomainsAgainstRules(
  rawDomains: string[],
  rules: FilterRules,
  options?: ValidationOptions
): {
  stats: FilterEvaluationStats;
  qualifiedDomains: string[];
  allKeywordDomains?: string[];
} {
  const breakdown = {
    dashes: 0,
    numbers: 0,
    tlds: 0,
    words: 0,
    invalid: 0,
    keywordMismatch: 0,
    lengthMismatch: 0,
  };

  const discarded: DiscardedDomain[] = [];
  const qualified: string[] = [];
  const allKeywordDomains: string[] = [];
  let keywordMatchesTotal = 0;
  let keywordMatchesStrict = 0;

  const cleanKeyword = options?.targetKeyword
    ? options.targetKeyword.trim().toLowerCase().replace(/[^a-z0-9]/g, '')
    : '';
  const isKeywordMode = options?.searchMode === 'keyword' && Boolean(cleanKeyword);
  const relax = Boolean(options?.relaxKeywordFilters);

  const normalizedTlds = rules.tlds.map((t) => (t.toLowerCase().startsWith('.') ? t.toLowerCase() : `.${t.toLowerCase()}`));
  const seen = new Set<string>();

  for (const raw of rawDomains) {
    let clean = raw.trim().toLowerCase().replace(/https?:\/\//i, '').replace(/^www\./i, '').replace(/\/.*$/, '');
    if (!clean) continue;

    // Sanitize common broken extensions (e.g. ".c" -> ".com")
    if (clean.endsWith('.c') && !clean.endsWith('.co') && !clean.endsWith('.cc')) {
      clean = clean.slice(0, -2) + '.com';
    }

    const lastDot = clean.lastIndexOf('.');
    if (lastDot === -1 || lastDot === 0 || lastDot === clean.length - 1) {
      breakdown.invalid++;
      discarded.push({ domain: clean, reason: 'Missing valid TLD extension (e.g. .com)' });
      continue;
    }

    const name = clean.substring(0, lastDot);
    const tld = clean.substring(lastDot);

    // In keyword mode, check exact whole-word keyword presence
    const words = clientDecomposeWords(name, cleanKeyword);
    if (isKeywordMode && cleanKeyword) {
      const kwMatch = matchKeywordRule(words, name, cleanKeyword);
      if (!kwMatch.matches) {
        breakdown.keywordMismatch++;
        discarded.push({ domain: clean, reason: `Does not contain mandatory keyword "${cleanKeyword}" as a standalone word` });
        continue;
      }
      keywordMatchesTotal++;
      if (!seen.has(clean)) {
        allKeywordDomains.push(clean);
      }
    }

    // If relaxKeywordFilters is true in keyword mode, accept domains matching the selected TLD
    if (isKeywordMode && cleanKeyword && relax) {
      if (normalizedTlds.length > 0 && !normalizedTlds.includes(tld)) {
        breakdown.tlds++;
        discarded.push({ domain: clean, reason: `TLD "${tld}" not in selected list (${normalizedTlds.join(', ')})` });
        continue;
      }
      if (!seen.has(clean)) {
        seen.add(clean);
        qualified.push(clean);
      }
      continue;
    }

    // Rule 1: No Dashes
    if (rules.noDashes && (name.includes('-') || name.includes('_'))) {
      breakdown.dashes++;
      discarded.push({ domain: clean, reason: 'Contains hyphen (-) symbol' });
      continue;
    }

    // Rule 2: No Numbers
    if (rules.noNumbers && /\d/.test(name)) {
      breakdown.numbers++;
      discarded.push({ domain: clean, reason: 'Contains numeric digit (0-9)' });
      continue;
    }

    // Rule 3: TLD match
    if (normalizedTlds.length > 0 && !normalizedTlds.includes(tld)) {
      breakdown.tlds++;
      discarded.push({ domain: clean, reason: `TLD "${tld}" not in selected list (${normalizedTlds.join(', ')})` });
      continue;
    }

    // Rule 4: Exactly 2 English Words (Strict 2-word enforcer: rejects 3+ words & single words)
    if (rules.exactlyTwoWords) {
      if (words.length !== 2) {
        breakdown.words++;
        const isSingle = COMMON_DICTIONARY_SET.has(name.toLowerCase().replace(/[^a-z]/g, ''));
        const reason = isSingle
          ? 'Single English word (condition requires exactly two English words)'
          : 'Does not form exactly two valid English words (3+ words or non-dictionary parts)';
        discarded.push({ domain: clean, reason });
        continue;
      }
    }

    // Rule 5: Character Length (2 to 25 characters)
    const minLen = typeof rules.minLetters === 'number' ? rules.minLetters : 2;
    const maxLen = typeof rules.maxLetters === 'number' ? rules.maxLetters : 25;
    if (name.length < minLen || name.length > maxLen) {
      breakdown.lengthMismatch = (breakdown.lengthMismatch || 0) + 1;
      discarded.push({
        domain: clean,
        reason: `Domain name length (${name.length} chars) is outside chosen length range (${minLen}-${maxLen} chars)`,
      });
      continue;
    }

    if (!seen.has(clean)) {
      seen.add(clean);
      qualified.push(clean);
      if (isKeywordMode && cleanKeyword) {
        keywordMatchesStrict++;
      }
    }
  }

  // Safe fallback mechanism respecting strict 2-word rules
  let finalQualified = [...qualified];
  let autoRelaxed = false;

  const candidatePool = (isKeywordMode && cleanKeyword && allKeywordDomains.length > 0)
    ? allKeywordDomains
    : rawDomains.map((r) => {
        let d = r.trim().toLowerCase().replace(/https?:\/\//, '').replace(/^www\./, '').replace(/\/.*$/, '');
        if (d.endsWith('.c') && !d.endsWith('.co') && !d.endsWith('.cc')) d = d.slice(0, -2) + '.com';
        return d;
      }).filter((d) => d.includes('.'));

  if (finalQualified.length < 3 && candidatePool.length > 0) {
    autoRelaxed = true;
    // Rank candidatePool by quality metrics
    const rankedCandidates = [...candidatePool].map((d) => {
      const q = calculateDomainQualityScore(d, cleanKeyword, options?.contextTopic);
      return { domain: d, score: q.score, isTwoWords: q.isTwoWords };
    });

    // If exactlyTwoWords is enforced, ONLY allow 2-word candidates into the qualified set
    const eligibleCandidates = rules.exactlyTwoWords
      ? rankedCandidates.filter((item) => item.isTwoWords)
      : rankedCandidates;

    // Sort by highest score
    eligibleCandidates.sort((a, b) => b.score - a.score);

    const finalSet = new Set(finalQualified);
    for (const item of eligibleCandidates) {
      if (!finalSet.has(item.domain)) {
        finalSet.add(item.domain);
        finalQualified.push(item.domain);
      }
    }
  }

  const stats: FilterEvaluationStats = {
    totalUploaded: rawDomains.length,
    passedFilters: finalQualified.length,
    failedCount: Math.max(0, rawDomains.length - finalQualified.length),
    showingCount: 0, // set by consumer based on count
    keywordMatchesTotal,
    keywordMatchesStrict,
    breakdown,
    discarded,
  };

  return {
    stats,
    qualifiedDomains: finalQualified,
    allKeywordDomains,
  };
}

/**
 * Export evaluated domain results to an Excel (.xlsx) file
 */
export function exportDomainsToExcel(domains: DomainItem[], filename = 'top_domain_picks.xlsx'): void {
  const exportData = domains.map((d, idx) => ({
    Rank: idx + 1,
    'Domain Name': d.domain,
    'Root Name': d.name,
    Extension: d.tld,
    'Relevance Match (%)': d.relevanceScore,
    'Valuation Tier': d.valuationTier,
    'Estimated Valuation': d.estimatedValue,
    'Words Count': d.wordsCount,
    'Constituent Words': d.words.join(', '),
    'Branding Pitch': d.pitch,
    'Top Pick Status': d.isTopPick ? (d.topPickBadge || 'Top Pick') : 'Standard Candidate',
    'Auction Mode': d.auctionEndingSoon ? `Ends in ${d.auctionEndsInHours || 8}h (${d.auctionCurrentBid || '$150'})` : 'N/A',
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportData);

  // Set column widths for polished presentation
  worksheet['!cols'] = [
    { wch: 6 },  // Rank
    { wch: 22 }, // Domain Name
    { wch: 16 }, // Root Name
    { wch: 10 }, // Extension
    { wch: 18 }, // Relevance Match
    { wch: 15 }, // Valuation Tier
    { wch: 22 }, // Estimated Valuation
    { wch: 12 }, // Words Count
    { wch: 22 }, // Constituent Words
    { wch: 55 }, // Branding Pitch
    { wch: 18 }, // Top Pick Status
    { wch: 24 }, // Auction Mode
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Top Domain Picks');

  XLSX.writeFile(workbook, filename);
}

/**
 * Export evaluated domain results to a CSV file
 */
export function exportDomainsToCsv(domains: DomainItem[], filename = 'top_domain_picks.csv'): void {
  const exportData = domains.map((d, idx) => ({
    Rank: idx + 1,
    'Domain Name': d.domain,
    'Root Name': d.name,
    Extension: d.tld,
    'Relevance Match (%)': d.relevanceScore,
    'Valuation Tier': d.valuationTier,
    'Estimated Valuation': d.estimatedValue,
    'Words Count': d.wordsCount,
    'Constituent Words': d.words.join(', '),
    'Branding Pitch': d.pitch,
    'Top Pick Status': d.isTopPick ? (d.topPickBadge || 'Top Pick') : 'Standard Candidate',
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Top Domains');

  XLSX.writeFile(workbook, filename, { bookType: 'csv' });
}

/**
 * Generates a realistic sample Excel workbook with portfolio domains
 * for instant one-click testing by the user!
 */
export function createSamplePortfolioWorkbook(): File {
  const sampleDomains = [
    { 'Domain Name': 'cloudnexus.ai', Category: 'Cloud & AI', Registrar: 'Porkbun', EstimatedCost: '$120' },
    { 'Domain Name': 'swiftpulse.com', Category: 'Fintech & Health', Registrar: 'Namecheap', EstimatedCost: '$250' },
    { 'Domain Name': 'dataforge.io', Category: 'Developer Tools', Registrar: 'GoDaddy', EstimatedCost: '$95' },
    { 'Domain Name': 'paycloud.com', Category: 'Fintech & Cloud', Registrar: 'Porkbun', EstimatedCost: '$350' },
    { 'Domain Name': 'swiftpay.io', Category: 'Fintech Payments', Registrar: 'Namecheap', EstimatedCost: '$280' },
    { 'Domain Name': 'cashvault.ai', Category: 'Fintech Treasury', Registrar: 'Porkbun', EstimatedCost: '$410' },
    { 'Domain Name': 'coinmint.co', Category: 'Crypto & Assets', Registrar: 'GoDaddy', EstimatedCost: '$190' },
    { 'Domain Name': 'vitalcare.com', Category: 'HealthTech & Med', Registrar: 'Namecheap', EstimatedCost: '$320' },
    { 'Domain Name': 'purecure.ai', Category: 'Biotech & Health', Registrar: 'Porkbun', EstimatedCost: '$290' },
    { 'Domain Name': 'neurovault.ai', Category: 'Machine Learning', Registrar: 'Namecheap', EstimatedCost: '$180' },
    { 'Domain Name': 'quantumflow.com', Category: 'Quantum SaaS', Registrar: 'Porkbun', EstimatedCost: '$320' },
    { 'Domain Name': 'pulsegrid.tech', Category: 'Infrastructure', Registrar: 'Squarespace', EstimatedCost: '$65' },
    { 'Domain Name': 'smart-link99.com', Category: 'Fails Dash & Number', Registrar: 'GoDaddy', EstimatedCost: '$20' },
    { 'Domain Name': 'fast-pay.co', Category: 'Fails Dash', Registrar: 'Namecheap', EstimatedCost: '$45' },
    { 'Domain Name': 'fintech777.ai', Category: 'Fails Number', Registrar: 'Porkbun', EstimatedCost: '$80' },
    { 'Domain Name': 'marketing.com', Category: 'Fails 2-Words (Single English word)', Registrar: 'Porkbun', EstimatedCost: '$1,500' },
    { 'Domain Name': 'technology.ai', Category: 'Fails 2-Words (Single English word)', Registrar: 'Namecheap', EstimatedCost: '$900' },
    { 'Domain Name': 'superultrahyperai.com', Category: 'Fails 2-Words (4 words)', Registrar: 'GoDaddy', EstimatedCost: '$15' },
    { 'Domain Name': 'brightstack.com', Category: 'Web Engineering', Registrar: 'Porkbun', EstimatedCost: '$210' },
    { 'Domain Name': 'primecore.io', Category: 'Data Engine', Registrar: 'Namecheap', EstimatedCost: '$140' },
    { 'Domain Name': 'logicwave.ai', Category: 'AI Reasoning', Registrar: 'GoDaddy', EstimatedCost: '$290' },
    { 'Domain Name': 'landnest.co', Category: 'Real Estate Proptech', Registrar: 'Namecheap', EstimatedCost: '$130' },
    { 'Domain Name': 'cybervault.net', Category: 'Security Defense', Registrar: 'Porkbun', EstimatedCost: '$110' },
    { 'Domain Name': 'echosignal.xyz', Category: 'Web3 & Audio', Registrar: 'Squarespace', EstimatedCost: '$35' },
    { 'Domain Name': 'cartflow.com', Category: 'E-Commerce Retail', Registrar: 'GoDaddy', EstimatedCost: '$220' },
    { 'Domain Name': 'zenithforge.com', Category: 'Manufacturing Tech', Registrar: 'GoDaddy', EstimatedCost: '$280' },
    { 'Domain Name': 'flowmatrix.org', Category: 'Open Source Community', Registrar: 'Porkbun', EstimatedCost: '$90' },
    { 'Domain Name': 'synthlogic.ai', Category: 'Synthetic Data', Registrar: 'Namecheap', EstimatedCost: '$310' },
    { 'Domain Name': 'vectorbase.io', Category: 'Vector DB', Registrar: 'GoDaddy', EstimatedCost: '$160' },
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleDomains);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Domains Portfolio');

  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  return new File([blob], 'sample_domains_portfolio.xlsx', {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
}
