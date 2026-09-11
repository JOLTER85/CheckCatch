import { SingleDomainVerificationResult, ValuationTier } from '../types';
import { getDomainArabicAnalysis } from './domainArabicAnalysis';

// Comprehensive dictionary for high-precision English domain verification
const COMPREHENSIVE_ENGLISH_WORDS = new Set([
  // Core tech, cloud, SaaS, AI, and systems
  "check", "catch", "cloud", "data", "flow", "nova", "byte", "meta", "hyper", "synth", "pulse",
  "apex", "zenith", "vortex", "nexus", "prism", "cyber", "omni", "vector", "strata", "flux",
  "core", "orbit", "quantum", "neural", "atlas", "beacon", "crest", "spark", "forge", "prime",
  "swift", "true", "bold", "clear", "bright", "smart", "deep", "peak", "stack", "logic",
  "echo", "drift", "wave", "link", "signal", "pilot", "craft", "scale", "sprint", "vault",
  "loom", "weave", "node", "shift", "sync", "mesh", "hub", "base", "grid", "point", "loop",
  "dock", "gate", "path", "wire", "port", "nest", "mark", "view", "track", "cast", "mint",
  "room", "deck", "leap", "zone", "line", "scope", "labs", "works", "force", "drive", "space",
  "mate", "code", "app", "web", "net", "dot", "pixel", "screen", "bot", "auto", "block",
  "chain", "token", "asset", "saas", "tech", "dev", "crypto", "tool", "stack", "build",

  // Business, finance, commerce, brand & trust
  "brand", "name", "pay", "coin", "bank", "fund", "cash", "lend", "safe", "cure", "care", "heal",
  "med", "life", "bio", "gene", "fit", "run", "sport", "game", "play", "win", "bet", "pro",
  "max", "go", "fast", "speed", "quick", "rush", "dash", "deal", "trade", "swap", "share",
  "send", "post", "mail", "cart", "buy", "sell", "shop", "store", "mart", "work", "job", "hire",
  "team", "crew", "club", "group", "hive", "desk", "bench", "trust", "shield", "guard", "ward",
  "secure", "pure", "real", "wise", "brain", "mind", "think", "idea", "lead", "first", "alpha",
  "omega", "edge", "front", "venture", "capital", "angel", "launch", "rocket", "growth", "scale",
  "click", "tap", "boost", "thrust", "rank", "rate", "audit", "quote", "price", "worth", "value",

  // Everyday actions & descriptive roots
  "find", "seek", "spot", "hunt", "grab", "fetch", "keep", "save", "hold", "pick", "choose",
  "take", "give", "help", "drop", "lift", "rise", "grow", "make", "shape", "form", "plan",
  "test", "prove", "show", "tell", "read", "write", "chat", "talk", "speak", "voice", "sound",
  "tune", "beat", "song", "note", "word", "text", "doc", "file", "page", "book", "card",
  "pass", "lock", "key", "door", "gate", "wall", "roof", "room", "home", "house", "space",

  // Nature, colors & physical elements
  "blue", "green", "red", "gold", "silver", "iron", "steel", "rock", "stone", "wood", "tree",
  "leaf", "root", "seed", "light", "glow", "shine", "beam", "ray", "flash", "fire", "flame",
  "heat", "warm", "cool", "ice", "frost", "snow", "rain", "storm", "wind", "breeze", "fog",
  "mist", "sun", "moon", "star", "sky", "air", "sea", "ocean", "river", "lake", "stream",
  "tide", "wave", "shore", "coast", "bay", "hill", "mount", "peak", "ridge", "cliff", "isle",
  "island", "land", "field", "farm", "park", "yard", "globe", "world", "earth", "solar",

  // Consumer & lifestyle
  "auto", "car", "moto", "ride", "drive", "trip", "tour", "stay", "rest", "sleep", "dream",
  "chef", "cook", "bake", "meal", "food", "dish", "cafe", "bar", "brew", "tea", "wine", "beer",
  "cup", "pot", "pet", "dog", "cat", "bird", "fish", "hair", "skin", "spa", "glow", "ease",
  "calm", "fair", "free", "wild", "fine", "rich", "clean", "fresh", "wash", "dry", "towel",

  // Single dictionary words that are NOT 2-word compounds
  "marketing", "technology", "insurance", "computer", "hospital", "doctor", "medicine",
  "university", "college", "school", "education", "management", "consulting", "software",
  "hardware", "platform", "solution", "solutions", "service", "services", "finance",
  "investment", "investing", "banking", "analytics", "security", "developer", "engineering"
]);

const GRAMMATICAL_PARTS: Record<string, { pos: string; meaning: string; category: string }> = {
  check: { pos: "Verb / Noun", meaning: "Verify, audit, examine for quality and accuracy", category: "Audit & Verification" },
  catch: { pos: "Verb / Noun", meaning: "Acquire, capture, seize high-value opportunities", category: "Acquisition & Speed" },
  cloud: { pos: "Noun / Tech", meaning: "Scalable remote servers and distributed computing", category: "Cloud & Infrastructure" },
  data: { pos: "Noun", meaning: "High-value digital information and analytics intelligence", category: "Data & AI" },
  flow: { pos: "Noun / Verb", meaning: "Smooth continuous movement, velocity, and seamless pipeline", category: "Process & UX" },
  vault: { pos: "Noun", meaning: "Secure reinforced chamber for asset custody and privacy", category: "Security & Wealth" },
  smart: { pos: "Adjective", meaning: "Intelligent, automated, responsive, and innovative", category: "AI & Innovation" },
  fast: { pos: "Adjective / Adv", meaning: "Rapid execution, high speed, and minimal latency", category: "Performance" },
  quick: { pos: "Adjective", meaning: "Instant response and immediate turn-around", category: "Performance" },
  pay: { pos: "Verb / Noun", meaning: "Financial settlement, payment processing, and checkout", category: "Fintech & Payments" },
  safe: { pos: "Adjective / Noun", meaning: "Protected, trustworthy, risk-free environment", category: "Trust & Security" },
  brand: { pos: "Noun / Verb", meaning: "Distinctive commercial identity and marketplace reputation", category: "Branding" },
  name: { pos: "Noun", meaning: "High-recall moniker, title, and digital address", category: "Identity" },
  point: { pos: "Noun", meaning: "Precise destination, focal point, and score marker", category: "Precision" },
  lead: { pos: "Verb / Noun", meaning: "Front-runner position, commercial prospect, and guidance", category: "Growth & Sales" },
  link: { pos: "Noun / Verb", meaning: "Connection, relationship, and networked bridge", category: "Networking" },
  stack: { pos: "Noun", meaning: "Integrated software components and layered technology", category: "Engineering" },
  sync: { pos: "Verb / Noun", meaning: "Real-time harmonization, state consistency, and alignment", category: "Data Sync" },
  mesh: { pos: "Noun", meaning: "Interconnected network grid of distributed nodes", category: "Decentralized" },
  hub: { pos: "Noun", meaning: "Central focal point, community nexus, and distribution center", category: "Community" },
  core: { pos: "Noun", meaning: "Essential foundational heart and central processing engine", category: "Architecture" },
  prime: { pos: "Adjective", meaning: "Highest grade, premium quality, and leading tier", category: "Prestige" },
  apex: { pos: "Noun", meaning: "The highest peak, pinnacle of performance and achievement", category: "Prestige" },
  true: { pos: "Adjective", meaning: "Authentic, accurate, genuine, and reliable", category: "Trust" },
  bold: { pos: "Adjective", meaning: "Daring, confident, striking, and visionary", category: "Branding" },
  bright: { pos: "Adjective", meaning: "Luminous, intelligent, optimistic, and clear", category: "Creativity" },
  pulse: { pos: "Noun", meaning: "Rhythmic heartbeat, live vitality, and continuous telemetry", category: "Monitoring" },
  spark: { pos: "Noun / Verb", meaning: "Catalyst of innovation, sudden brilliance, and ignition", category: "Idea & Energy" },
  craft: { pos: "Noun / Verb", meaning: "Meticulous artisanship, master design, and precision build", category: "Design & Quality" },
  scale: { pos: "Noun / Verb", meaning: "Exponential growth, broad reach, and dimensional sizing", category: "Growth" },
  wave: { pos: "Noun", meaning: "Surging trend, kinetic momentum, and modern frequency", category: "Momentum" },
  shift: { pos: "Verb / Noun", meaning: "Strategic pivot, evolutionary change, and dynamic transition", category: "Transformation" }
};

/**
 * Decomposes domain slug into 2 English words if strictly valid
 */
export function decomposeTwoWordsStrict(slug: string): { words: string[]; valid: boolean; reason?: string } {
  const clean = slug.toLowerCase().trim();

  if (!clean || clean.length < 4) {
    return { words: [clean], valid: false, reason: "Domain name is too short to contain 2 valid English words." };
  }

  // Check for numbers
  if (/\d/.test(clean)) {
    return { words: [clean], valid: false, reason: "Contains numbers/digits. CheckCatch requires 100% alphabetical English words." };
  }

  // Check for hyphens or underscores
  if (/[-_]/.test(clean)) {
    return { words: [clean], valid: false, reason: "Contains hyphens or symbols. Strict 2-word verification requires continuous letters." };
  }

  // Check for non-alphabetical
  if (/[^a-z]/.test(clean)) {
    return { words: [clean], valid: false, reason: "Contains special characters. Only standard English alphabetical letters allowed." };
  }

  // Look for clean split points into 2 dictionary words
  const validSplits: [string, string][] = [];

  for (let i = 2; i <= clean.length - 2; i++) {
    const w1 = clean.substring(0, i);
    const w2 = clean.substring(i);

    if (COMPREHENSIVE_ENGLISH_WORDS.has(w1) && COMPREHENSIVE_ENGLISH_WORDS.has(w2)) {
      validSplits.push([w1, w2]);
    }
  }

  if (validSplits.length === 0) {
    // Check if it's a known single dictionary word
    if (COMPREHENSIVE_ENGLISH_WORDS.has(clean)) {
      return {
        words: [clean],
        valid: false,
        reason: "Single English word detected. CheckCatch engine specifically checks and values Two-Word Compound Domains."
      };
    }

    return {
      words: [clean],
      valid: false,
      reason: "Could not split into two valid English dictionary words. Check spelling or vocabulary roots."
    };
  }

  // If multiple splits, pick the most balanced word lengths
  validSplits.sort((a, b) => {
    const balanceA = Math.abs(a[0].length - a[1].length);
    const balanceB = Math.abs(b[0].length - b[1].length);
    return balanceA - balanceB;
  });

  return { words: validSplits[0], valid: true };
}

/**
 * Verify & Value single domain engine
 */
export function verifyAndValueDomain(rawInput: string): SingleDomainVerificationResult {
  let cleaned = (rawInput || '').trim().toLowerCase();
  cleaned = cleaned.replace(/https?:\/\//, '').replace(/^www\./, '').replace(/\/.*$/, '');

  let name = cleaned;
  let tld = '.com';

  const lastDot = cleaned.lastIndexOf('.');
  if (lastDot !== -1) {
    name = cleaned.substring(0, lastDot);
    tld = cleaned.substring(lastDot);
  } else {
    // default to .com if no extension provided
    cleaned = `${name}.com`;
  }

  const hasNoNumbers = !/\d/.test(name);
  const hasNoDashes = !/[-_]/.test(name);
  const isCleanAlphabetical = /^[a-z]+$/.test(name);

  const decomposition = decomposeTwoWordsStrict(name);
  const isValidTwoWord = decomposition.valid && hasNoNumbers && hasNoDashes && isCleanAlphabetical;
  const status = isValidTwoWord ? 'PASS' : 'FAIL';

  const words = decomposition.words;
  const word1 = words[0] || '';
  const word2 = words[1] || '';

  // Calculate Brandability Score (0-100)
  let score = 50;

  if (isValidTwoWord) {
    score = 80; // Baseline for verified 2-word domain

    // Length Sweet spot: 7 - 12 characters is gold standard for 2-word domains
    const totalLen = name.length;
    if (totalLen >= 8 && totalLen <= 11) {
      score += 10;
    } else if (totalLen >= 6 && totalLen <= 14) {
      score += 6;
    }

    // TLD Power Bonus
    if (tld === '.com') score += 8;
    else if (tld === '.ai') score += 7;
    else if (tld === '.io') score += 5;
    else if (tld === '.co') score += 4;

    // Commercial intent keyword check
    const highPowerWords = new Set([
      'check', 'catch', 'cloud', 'data', 'pay', 'vault', 'safe', 'smart', 'flow',
      'fast', 'brand', 'name', 'stack', 'lead', 'sync', 'point', 'tech', 'trust',
      'mint', 'pulse', 'prime', 'apex', 'core', 'code', 'scale', 'fund', 'coin'
    ]);

    if (highPowerWords.has(word1)) score += 3;
    if (highPowerWords.has(word2)) score += 3;

    // Cap at 99 unless absolute perfection
    score = Math.min(99, Math.max(72, score));
  } else {
    // Penalties for failed rules
    if (!hasNoNumbers) score -= 25;
    if (!hasNoDashes) score -= 20;
    if (words.length === 1) score = 45;
    if (!decomposition.valid) score = Math.min(score, 38);
    score = Math.max(15, score);
  }

  // Brandability Grade
  let grade: 'A+' | 'A' | 'B' | 'C' | 'D' = 'C';
  if (score >= 90) grade = 'A+';
  else if (score >= 80) grade = 'A';
  else if (score >= 65) grade = 'B';
  else if (score >= 50) grade = 'C';
  else grade = 'D';

  // Valuation Tier
  let tier: ValuationTier = 'Standard';
  if (grade === 'A+') tier = 'Premium';
  else if (grade === 'A') tier = 'Brandable';
  else tier = 'Standard';

  // Estimated Market Value Calculation ($USD)
  let estimatedValue = 650;
  if (isValidTwoWord) {
    if (tld === '.com') {
      if (grade === 'A+') {
        estimatedValue = 12500 + (score - 90) * 1200;
      } else if (grade === 'A') {
        estimatedValue = 5400 + (score - 80) * 550;
      } else {
        estimatedValue = 2200 + (score - 65) * 180;
      }
    } else if (tld === '.ai') {
      estimatedValue = grade === 'A+' ? 14000 : 6500;
    } else if (tld === '.io') {
      estimatedValue = grade === 'A+' ? 7800 : 3400;
    } else {
      estimatedValue = 1800;
    }
  } else {
    estimatedValue = hasNoDashes && hasNoNumbers ? 350 : 80;
  }

  // Round estimated value to clean hundreds
  estimatedValue = Math.round(estimatedValue / 100) * 100;
  const estimatedValueFormatted = `$${estimatedValue.toLocaleString('en-US')}`;

  // Word 1 & Word 2 metadata
  const w1Meta = GRAMMATICAL_PARTS[word1] || { pos: "Noun / Root", meaning: "Recognized English semantic root", category: "Core Concept" };
  const w2Meta = GRAMMATICAL_PARTS[word2] || { pos: "Noun / Suffix", meaning: "Recognized English dictionary word", category: "Anchor Modifier" };

  // Arabic breakdown helper
  const arabicAnalysis = isValidTwoWord ? getDomainArabicAnalysis(name, [word1, word2]) : null;

  // SEO Insights (realistic baseline indicators)
  const isAgedName = isValidTwoWord && tld === '.com';
  const domainAuthority = isValidTwoWord ? Math.min(58, Math.max(24, Math.round(score * 0.45))) : 8;
  const backlinks = isValidTwoWord ? Math.round(score * 28 + (isAgedName ? 950 : 150)) : 45;
  const domainAge = isValidTwoWord ? (isAgedName ? "7-9 Years (Estimated)" : "Available / Expiring Drop") : "Unranked / New";

  // Search volume intent
  const monthlySearches = isValidTwoWord ? Math.round(score * 180 + 3200) : 450;
  const intentLevel = score >= 88 ? 'High Commercial' : score >= 75 ? 'Moderate' : 'Niche';
  const category = w1Meta.category || 'Technology & Digital Services';

  // Registrar links
  const targetDomain = `${name}${tld}`;
  const registrarLinks = {
    namecheap: `https://www.namecheap.com/domains/registration/results/?domain=${encodeURIComponent(targetDomain)}`,
    godaddy: `https://www.godaddy.com/domainsearch/find?checkAvail=1&domainToCheck=${encodeURIComponent(targetDomain)}`,
    dynadot: `https://www.dynadot.com/domain/search?keyword=${encodeURIComponent(targetDomain)}`,
    dropcatch: `https://www.dropcatch.com/domain/${encodeURIComponent(targetDomain)}`
  };

  const pitch = isValidTwoWord
    ? `Exceptional two-word English pairing uniting "${word1}" (${w1Meta.pos}) and "${word2}" (${w2Meta.pos}). Delivers immediate brand authority, natural recall, and strong commercial intent on ${tld}.`
    : `Domain evaluation detected rule exceptions: ${decomposition.reason || 'Not a clean two-word dictionary compound'}.`;

  return {
    domain: targetDomain,
    name,
    tld,
    isValidTwoWord,
    status,
    failureReason: isValidTwoWord ? undefined : decomposition.reason,
    validationChecks: {
      hasTwoEnglishWords: decomposition.valid,
      hasNoNumbers,
      hasNoDashes,
      isCleanAlphabetical,
    },
    words: isValidTwoWord ? [word1, word2] : [name],
    word1Analysis: isValidTwoWord ? {
      word: word1,
      length: word1.length,
      partOfSpeech: w1Meta.pos,
      meaning: w1Meta.meaning,
      meaningAr: arabicAnalysis?.word1.meaningAr,
      frequencyTier: 'High',
    } : undefined,
    word2Analysis: isValidTwoWord ? {
      word: word2,
      length: word2.length,
      partOfSpeech: w2Meta.pos,
      meaning: w2Meta.meaning,
      meaningAr: arabicAnalysis?.word2.meaningAr,
      frequencyTier: 'High',
    } : undefined,
    brandabilityScore: score,
    brandabilityGrade: grade,
    estimatedMarketValue: estimatedValue,
    estimatedValueFormatted,
    valuationTier: tier,
    searchVolumeIntent: {
      monthlySearchesEstimate: monthlySearches,
      intentLevel,
      category,
    },
    seoInsights: {
      domainAuthority,
      backlinks,
      domainAge,
    },
    registrarLinks,
    pitch,
    pitchAr: arabicAnalysis?.combinedPowerAr,
  };
}
