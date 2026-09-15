import express from "express";
import compression from "compression";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import englishWords from "an-array-of-english-words";
import {
  BoundedCache,
  wordValidityCache,
  atomicWordCache,
  twoWordDecomposeCache,
  domainVerificationCache,
  nicheMatchCache,
  mapInParallelChunks,
} from "./src/services/domainEvaluationEngine";

dotenv.config();

const app = express();
const PORT = 3000;

// Enable Gzip/Brotli response compression for API payloads and static assets
app.use(compression());

app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));

// Security & best practices response headers
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://*.googletagmanager.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: https: https://www.googletagmanager.com; connect-src 'self' https: https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com; frame-src 'self' https://www.googletagmanager.com;"
  );

  // In production environments (when not viewed in dev iframe preview), enforce frame isolation & opener policies
  const isEmbed = req.headers["sec-fetch-dest"] === "iframe" || process.env.NODE_ENV !== "production";
  if (!isEmbed) {
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  }
  next();
});

// Fast timeout wrapper to prevent API endpoints from hanging when upstream AI models have latency
function withTimeout<T>(promise: Promise<T>, ms: number, label = "Operation"): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms)
    ),
  ]);
}

// Cleanly extracts human-readable diagnostics without printing raw JSON error blobs
function formatSafeLog(err: any): string {
  if (!err) return "temporary upstream unavailability";
  const str = String(err?.message || err || "");
  if (err?.status === 503 || str.includes("503") || str.includes("high demand") || str.includes("UNAVAILABLE")) {
    return "Gemini model experiencing temporary capacity spike (HTTP 503)";
  }
  if (err?.status === 429 || str.includes("429") || str.includes("RESOURCE_EXHAUSTED")) {
    return "Gemini API rate limit reached (HTTP 429)";
  }
  if (str.includes("timed out")) {
    return "Gemini API upstream latency timeout";
  }
  // Strip braces and quotes to prevent log monitors from misclassifying benign fallbacks as crashes
  return str.replace(/[{}\[\]"]/g, "").slice(0, 100);
}

// Comprehensive curated dictionary for high-converting 2-word domain generation and fallbacks
export const HIGH_VALUE_ENGLISH_WORDS = [
  "hub", "labs", "lab", "cloud", "flow", "grid", "scale", "wave", "link", "core",
  "base", "desk", "sync", "shift", "spot", "craft", "stack", "prime", "point",
  "vault", "sphere", "mint", "zone", "pulse", "force", "dock", "scope", "nest",
  "mark", "view", "track", "cast", "room", "deck", "leap", "line", "crest",
  "works", "drive", "space", "mate", "code", "app", "web", "net", "dot", "pixel",
  "screen", "bot", "auto", "block", "chain", "token", "asset", "ledger", "bazaar",
  "exchange", "saas", "tech", "dev", "crypto", "ai", "io", "pay", "coin", "bank",
  "fund", "cash", "lend", "safe", "cure", "care", "heal", "med", "life", "bio",
  "gene", "fit", "run", "sport", "game", "play", "win", "bet", "pro", "max",
  "fast", "speed", "quick", "rush", "dash", "deal", "trade", "swap", "share",
  "send", "post", "mail", "cart", "buy", "sell", "shop", "store", "mart", "work",
  "job", "hire", "team", "crew", "club", "group", "hive", "bench", "trust",
  "shield", "guard", "ward", "secure", "pure", "real", "wise", "brain", "mind",
  "think", "idea", "lead", "first", "alpha", "omega", "edge", "front", "venture",
  "capital", "angel", "launch", "rocket", "star", "sun", "moon", "sea", "ocean",
  "river", "lake", "land", "field", "farm", "green", "blue", "red", "gold",
  "silver", "iron", "steel", "rock", "stone", "wood", "tree", "leaf", "root",
  "seed", "grow", "rise", "lift", "build", "make", "light", "glow", "shine",
  "beam", "ray", "flash", "fire", "flame", "heat", "warm", "cool", "ice", "frost",
  "snow", "rain", "storm", "wind", "breeze", "fog", "mist", "drop", "tide",
  "stream", "float", "sail", "ship", "boat", "bay", "harbor", "coast", "shore",
  "beach", "island", "isle", "hill", "mount", "summit", "ridge", "cliff", "valley",
  "canyon", "plain", "grove", "forest", "park", "home", "house", "camp", "yard",
  "realm", "world", "globe", "ring", "circle", "square", "matrix", "network",
  "system", "engine", "motor", "power", "energy", "boost", "thrust", "guide",
  "galaxy", "solar", "lunar", "astro", "chat", "talk", "speak", "voice", "sound",
  "tune", "beat", "song", "read", "write", "book", "page", "note", "word",
  "text", "doc", "file", "eye", "lens", "scan", "find", "seek", "route", "way",
  "road", "lane", "street", "door", "key", "lock", "pass", "card", "badge", "hall", "box"
];

export const HIGH_VALUE_ENGLISH_WORDS_SET = new Set(HIGH_VALUE_ENGLISH_WORDS.map((w) => w.toLowerCase()));

const TECH_PREFIXES = [
  "cloud", "data", "flow", "nova", "byte", "meta", "hyper", "synth", "pulse",
  "apex", "zenith", "vortex", "nexus", "prism", "cyber", "omni", "vector",
  "strata", "flux", "core", "orbit", "quantum", "neural", "atlas", "beacon",
  "crest", "spark", "forge", "prime", "swift", "true", "bold", "clear", "bright",
  "smart", "deep", "peak", "stack", "logic", "echo", "drift", "wave", "link",
  "signal", "pilot", "craft", "scale", "sprint", "vault", "loom", "weave"
];

const TECH_SUFFIXES = [
  "stack", "forge", "scale", "node", "shift", "wave", "sync", "mesh", "hub",
  "base", "pulse", "grid", "craft", "point", "loop", "dock", "spark", "link",
  "gate", "path", "wire", "port", "nest", "mark", "view", "track", "cast",
  "flow", "mint", "vault", "room", "deck", "leap", "zone", "line", "crest",
  "scope", "labs", "core", "works", "force", "pilot", "drive", "space", "mate"
];

const SAAS_VALUATIONS = [
  { tier: "Premium", min: 3500, max: 9500 },
  { tier: "Brandable", min: 1200, max: 3200 },
  { tier: "Standard", min: 450, max: 950 },
];

function sanitizeDomainSlug(raw: string, rules: { noDashes: boolean; noNumbers: boolean }): string {
  let cleaned = raw.toLowerCase().trim();
  cleaned = cleaned.replace(/https?:\/\//, "").replace(/^www\./, "");
  // remove any extension if attached in name
  cleaned = cleaned.split(".")[0] || cleaned;
  if (rules.noDashes) {
    cleaned = cleaned.replace(/[-_]/g, "");
  }
  if (rules.noNumbers) {
    cleaned = cleaned.replace(/[0-9]/g, "");
  }
  // keep only letters and optionally dash
  cleaned = cleaned.replace(/[^a-z0-9-]/g, "");
  return cleaned;
}

function generateAlgorithmicDomains(
  keywords: string,
  count: number,
  rules: {
    exactlyTwoWords: boolean;
    noDashes: boolean;
    noNumbers: boolean;
    tlds: string[];
    auctionMode: boolean;
  }
) {
  const tldPool = Array.isArray(rules.tlds) && rules.tlds.length > 0
    ? rules.tlds.map((t) => t.toLowerCase().startsWith(".") ? t.toLowerCase() : `.${t.toLowerCase()}`)
    : [".com"];
  const userKeywords = keywords
    .toLowerCase()
    .split(/[\s,;]+/)
    .map((k) => k.replace(/[^a-z0-9]/g, ""))
    .filter((k) => k.length > 1);

  // Validate user keywords or extract their constituent atomic words
  const cleanUserWords: string[] = [];
  for (const kw of userKeywords) {
    if (isAtomicEnglishWord(kw)) {
      cleanUserWords.push(kw);
    } else {
      const decomp = decomposeIntoTwoEnglishWords(kw);
      if (decomp) {
        cleanUserWords.push(...decomp);
      }
    }
  }

  const poolA = cleanUserWords.length > 0
    ? [...new Set([...cleanUserWords, ...TECH_PREFIXES])]
    : TECH_PREFIXES;
  const poolB = [...TECH_SUFFIXES, ...TECH_PREFIXES];

  const results: any[] = [];
  const seenDomains = new Set<string>();

  let attempts = 0;
  while (results.length < count && attempts < 350) {
    attempts++;
    const tld = tldPool[Math.floor(Math.random() * tldPool.length)];
    let word1 = poolA[Math.floor(Math.random() * poolA.length)];
    let word2 = poolB[Math.floor(Math.random() * poolB.length)];

    if (word1 === word2) {
      word2 = poolB[(poolB.indexOf(word2) + 1) % poolB.length];
    }

    let words = [word1, word2];
    let slug = `${word1}${word2}`;

    if (!rules.noDashes && Math.random() < 0.25) {
      slug = `${word1}-${word2}`;
    }

    if (!rules.noNumbers && Math.random() < 0.2) {
      const num = Math.floor(Math.random() * 9) + 1;
      slug = `${slug}${num}`;
    }

    // Verify negative constraints
    if (rules.noDashes && slug.includes("-")) continue;
    if (rules.noNumbers && /\d/.test(slug)) continue;

    // Verify strict 2-word composition
    if (rules.exactlyTwoWords) {
      if (slug.includes("-") || /\d/.test(slug)) continue;
      const decomp = decomposeIntoTwoEnglishWords(slug, word1);
      if (!decomp) continue;
      words = [decomp[0], decomp[1]];
    }

    const fullDomain = `${slug}${tld}`;
    if (seenDomains.has(fullDomain)) continue;
    seenDomains.add(fullDomain);

    const isTop = results.length === 0 || results.length === 1;
    const matchScore = Math.floor(88 + Math.random() * 11);
    const tier = isTop ? "Premium" : results.length % 2 === 0 ? "Brandable" : "Standard";
    const valObj = SAAS_VALUATIONS.find((v) => v.tier === tier) || SAAS_VALUATIONS[1];
    const valLow = Math.round(valObj.min / 100) * 100;
    const valHigh = Math.round(valObj.max / 100) * 100;

    const auctionEndsInHours = rules.auctionMode
      ? Math.floor(Math.random() * 18) + 1
      : undefined;
    const auctionCurrentBid = rules.auctionMode
      ? `$${Math.floor(Math.random() * 850) + 75}`
      : undefined;

    results.push({
      id: `domain-${results.length + 1}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      domain: fullDomain,
      name: slug,
      tld,
      relevanceScore: matchScore,
      wordsCount: 2,
      words: [words[0], words[1]],
      hasDashes: slug.includes("-"),
      hasNumbers: /\d/.test(slug),
      valuationTier: tier,
      estimatedValue: `$${valLow.toLocaleString()} - $${valHigh.toLocaleString()}`,
      pitch: `High-recall ${words[0]} & ${words[1]} pairing tailored for modern ${keywords || "technology"} ventures with instant brand recognition.`,
      isTopPick: isTop,
      topPickBadge: isTop ? (results.length === 0 ? "Best Match #1" : "Top Pick") : undefined,
      auctionEndingSoon: rules.auctionMode,
      auctionEndsInHours,
      auctionCurrentBid,
    });
  }

  return results;
}

// Gemini integration helper with automatic model fallback, retry, and clean error handling
async function generateWithGemini(
  keywords: string,
  count: number,
  rules: {
    exactlyTwoWords: boolean;
    noDashes: boolean;
    noNumbers: boolean;
    tlds: string[];
    auctionMode: boolean;
  }
) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });

  const normalizedAllowedTlds = Array.isArray(rules.tlds) && rules.tlds.length > 0
    ? rules.tlds.map((t) => (t.toLowerCase().startsWith(".") ? t.toLowerCase() : `.${t.toLowerCase()}`))
    : [".com"];
  const tldList = normalizedAllowedTlds.join(", ");
  const isOnlyCom = normalizedAllowedTlds.length === 1 && normalizedAllowedTlds[0] === ".com";
  const tldConstraint = isOnlyCom
    ? "### CRITICAL DOMAIN CONSTRAINTS ###\n1. STRICT TLD ENFORCEMENT: You MUST ONLY generate, output, and evaluate domains using the \".com\" extension.\n2. NO ALTERNATIVE TLDS: Do NOT output domains ending in .cc, .tools, .io, .net, .co, or any other extension.\n3. UI TEXT/DESCRIPTIONS: When writing descriptions or evaluating domains, only refer to them as \".com\" domains (e.g., \"This provides top-tier .com authority\"). Never mention alternative TLDs.\n4. FORMATTING: All returned domain names must strictly be formatted as \"wordword.com\"."
    : `Permitted TLD Extensions: ONLY use these extensions: ${tldList}. Distribute creatively among them.`;

  const prompt = `Generate/Select the top ${count} premium ${isOnlyCom ? '.com' : tldList} domains. Each domain MUST be formed by combining the keyword '${keywords || "innovative tech"}' with a REAL, HIGH-VALUE ENGLISH DICTIONARY NOUN OR ADJECTIVE (e.g., Hub, Labs, Flow, Stack, Vault, Base, Mint, Sphere). NO fake words, NO typos, NO non-English combinations.

STRICT FILTERS AND MANDATORY CONSTRAINTS:
1. Two Words Rule: MANDATORY: Every domain name (excluding TLD) MUST consist of EXACTLY TWO valid, real English words fused smoothly together (e.g. ${keywords ? keywords.toLowerCase().replace(/[^a-z]/g, '') : "cloud"}hub).
2. No Dashes Rule: ${rules.noDashes ? "MANDATORY: NEVER include dashes '-' or hyphens." : "Hyphens allowed only if natural."}
3. No Numbers Rule: ${rules.noNumbers ? "MANDATORY: NEVER include any digits or numbers (0-9)." : "Numbers allowed if relevant."}
4. ${tldConstraint}
5. Auction Simulation Mode: ${rules.auctionMode ? "User requested domains ending today / auction simulation. Include realistic remaining auction hours (1 to 24 hours) and current bid estimates." : "Standard registration."}

For each domain:
- Provide the full domain (e.g., "${keywords ? keywords.toLowerCase().replace(/[^a-z]/g, '') : "software"}hub.com")
- Name without TLD (e.g., "${keywords ? keywords.toLowerCase().replace(/[^a-z]/g, '') : "software"}hub")
- TLD (e.g., ".com")
- Category/niche relevance score (integer 85 to 99)
- Number of words in name (MUST BE 2)
- Array of the individual English words that form the name (e.g. ["${keywords ? keywords.toLowerCase().replace(/[^a-z]/g, '') : "software"}", "hub"])
- hasDashes boolean
- hasNumbers boolean
- Valuation tier: "Premium" | "Brandable" | "Standard"
- Estimated valuation range (e.g. "$2,500 - $4,800")
- Pitch: 1 concise sentence explaining brand appeal and domain liquidity
- isTopPick: true for the top 1 or 2 best domains, false for others
- topPickBadge: e.g. "Best Match #1", "Top Pick", or null
${rules.auctionMode ? '- auctionEndsInHours: integer 1-24\n- auctionCurrentBid: e.g. "$185"' : ""}

Order them by quality and relevance, with the absolute best ones first.`;

  const modelsToTry = ["gemini-3.8-flash", "gemini-3.1-flash-lite", "gemini-flash-latest"];
  let lastError: any = null;
  let parsed: any = null;

  for (const model of modelsToTry) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const response: any = await withTimeout(
          ai.models.generateContent({
            model,
            contents: prompt,
            config: {
              temperature: 0.8,
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.ARRAY,
                description: "List of top generated domain names",
                items: {
                  type: Type.OBJECT,
                  properties: {
                    domain: { type: Type.STRING, description: "Full domain name e.g. cloudnexus.ai" },
                    name: { type: Type.STRING, description: "Domain name without TLD e.g. cloudnexus" },
                    tld: { type: Type.STRING, description: "TLD extension e.g. .ai or .com" },
                    relevanceScore: { type: Type.INTEGER, description: "Match percentage between 80 and 99" },
                    wordsCount: { type: Type.INTEGER, description: "Count of English words" },
                    words: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                      description: "The constituent English words"
                    },
                    hasDashes: { type: Type.BOOLEAN },
                    hasNumbers: { type: Type.BOOLEAN },
                    valuationTier: {
                      type: Type.STRING,
                      description: "Premium, Brandable, or Standard"
                    },
                    estimatedValue: { type: Type.STRING, description: "Valuation range string e.g. $3,200 - $5,400" },
                    pitch: { type: Type.STRING, description: "One sentence branding rationale" },
                    isTopPick: { type: Type.BOOLEAN },
                    topPickBadge: { type: Type.STRING, description: "Badge text or empty" },
                    auctionEndsInHours: { type: Type.INTEGER },
                    auctionCurrentBid: { type: Type.STRING }
                  },
                  required: [
                    "domain",
                    "name",
                    "tld",
                    "relevanceScore",
                    "wordsCount",
                    "words",
                    "hasDashes",
                    "hasNumbers",
                    "valuationTier",
                    "estimatedValue",
                    "pitch",
                    "isTopPick"
                  ]
                }
              }
            }
          }),
          10000,
          `Gemini ${model} generation`
        );

        const text = response.text;
        if (text) {
          const json = JSON.parse(text);
          if (Array.isArray(json) && json.length > 0) {
            parsed = json;
            break; // Success!
          }
        }
      } catch (err: any) {
        lastError = err;
        const isTransient = err?.status === 503 || err?.status === 429 ||
          String(err?.message || "").includes("503") ||
          String(err?.message || "").includes("high demand") ||
          String(err?.message || "").includes("timed out");

        if (isTransient && attempt < 2) {
          await new Promise((resolve) => setTimeout(resolve, 600));
          continue;
        }
        break; // Next model
      }
    }
    if (parsed) break;
  }

  if (!parsed) {
    const safeReason = formatSafeLog(lastError);
    const cleanErr = new Error(safeReason);
    (cleanErr as any).safeReason = safeReason;
    throw cleanErr;
  }

  // Strictly enforce rules in post-validation
  const validDomains: any[] = [];
  for (let i = 0; i < parsed.length; i++) {
    const item = parsed[i];
    // Force strict compliance with user's selected TLDs (.com default)
    let rawString = String(item.name || item.domain || "").toLowerCase().trim();
    let slug = rawString.split('.')[0].replace(/[^a-z0-9-]/g, ""); // Hard strip of TLDs
    
    let targetTld = ".com";
    if (normalizedAllowedTlds.length === 1) {
      targetTld = normalizedAllowedTlds[0];
    } else if (normalizedAllowedTlds.length > 1) {
      let rawTld = item.tld ? item.tld.toLowerCase().trim() : "";
      if (!rawTld.startsWith(".")) rawTld = `.${rawTld}`;
      targetTld = normalizedAllowedTlds.includes(rawTld)
        ? rawTld
        : normalizedAllowedTlds[i % normalizedAllowedTlds.length];
    }
    if (!targetTld.startsWith(".")) targetTld = `.${targetTld}`;

    if (rules.noDashes && slug.includes("-")) {
      slug = slug.replace(/-/g, "");
    }
    if (rules.noNumbers && /\d/.test(slug)) {
      slug = slug.replace(/\d/g, "");
    }

    // Strict 2-word English Dictionary validation and sanitization
    let words = Array.isArray(item.words) && item.words.length === 2 ? item.words : null;
    if (rules.exactlyTwoWords) {
      const verifiedWords = decomposeIntoTwoEnglishWords(slug, keywords);
      if (verifiedWords) {
        words = verifiedWords;
      } else {
        // Sanitize: replace with verified high-value English word pairing
        const cleanKw = keywords ? keywords.toLowerCase().replace(/[^a-z]/g, "") : "tech";
        const fallbackWord = HIGH_VALUE_ENGLISH_WORDS[i % HIGH_VALUE_ENGLISH_WORDS.length] || "hub";
        slug = `${cleanKw}${fallbackWord}`;
        words = [cleanKw, fallbackWord];
      }
    } else {
      words = words || decomposeIntoWords(slug, keywords);
    }

    let pitch = item.pitch || `High-appeal branding synergy pairing "${words[0]}" and "${words[1]}" for modern digital initiatives.`;
    // UI Text Fix for Hallucinated extensions
    if (pitch) {
      const wrongDomainRegex = new RegExp(`${slug}\\.[a-z]+`, 'gi');
      pitch = pitch.replace(wrongDomainRegex, `${slug}${targetTld}`);
      pitch = pitch.replace(/(?:\s|^)\.(cc|tools|io|net|co|org|biz|info|xyz|me)\b/gi, ` ${targetTld}`);
    }

    const fullDomain = `${slug}${targetTld}`;
    const isTop = i === 0 || i === 1;

    validDomains.push({
      id: `domain-${i + 1}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      domain: fullDomain,
      name: slug,
      tld: targetTld,
      relevanceScore: Math.min(99, Math.max(75, Number(item.relevanceScore) || 92)),
      wordsCount: rules.exactlyTwoWords ? 2 : (item.wordsCount || 2),
      words,
      hasDashes: slug.includes("-"),
      hasNumbers: /\d/.test(slug),
      valuationTier: (["Premium", "Brandable", "Standard"].includes(item.valuationTier) ? item.valuationTier : (isTop ? "Premium" : "Brandable")),
      estimatedValue: item.estimatedValue || "$1,800 - $3,500",
      pitch,
      isTopPick: isTop,
      topPickBadge: isTop ? (i === 0 ? "Best Match #1" : "Top Pick") : (item.topPickBadge || undefined),
      auctionEndingSoon: rules.auctionMode,
      auctionEndsInHours: rules.auctionMode ? (item.auctionEndsInHours || Math.floor(Math.random() * 14) + 1) : undefined,
      auctionCurrentBid: rules.auctionMode ? (item.auctionCurrentBid || `$${Math.floor(Math.random() * 450) + 80}`) : undefined,
    });

    if (validDomains.length >= count) break;
  }

  // If Gemini produced fewer items than requested, pad with algorithmic engine
  if (validDomains.length < count) {
    const needed = count - validDomains.length;
    const padding = generateAlgorithmicDomains(keywords, needed, rules);
    validDomains.push(...padding);
  }

  return validDomains;
}

// Master English dictionary using 274,937 real English words
const MASTER_ENGLISH_DICTIONARY = new Set<string>(englishWords);

// Modern venture/tech/business root words commonly utilized in brandable domains
const MODERN_TECH_ROOTS = [
  "saas", "tech", "app", "web", "net", "dev", "bot", "crypto", "ai", "io", "ops",
  "bio", "eco", "cyber", "meta", "sync", "hub", "lab", "labs", "pro", "fit", "fin",
  "med", "doc", "docs", "stack", "pay", "vibe", "zen", "node", "grid", "mesh",
  "link", "flow", "byte", "flux", "pulse", "core", "spark", "forge", "nova", "apex"
];
for (const w of MODERN_TECH_ROOTS) {
  MASTER_ENGLISH_DICTIONARY.add(w);
}

// Suffixes and non-standalone grammatical affixes that must not count as independent words
const INVALID_WORD_PARTS = new Set([
  "ing", "ed", "ly", "er", "es", "est", "tion", "ness", "ment", "able", "ible",
  "al", "ic", "ive", "ous", "ful", "less", "ish", "ist", "ism", "ity", "ty",
  "ize", "ise", "ate", "dom"
]);

// Real, standalone 2-letter English words permitted in domain compounds
const VALID_TWO_LETTER_WORDS = new Set([
  "ai", "go", "my", "up", "in", "on", "by", "to", "we", "do", "so", "no", "re",
  "co", "io", "ex", "me", "us", "it", "at", "as", "he", "is", "am", "an", "ox"
]);

/**
 * Checks if a string is a 100% genuine, valid English word.
 * Rejects grammatical fragments, single letters, affixes, or gibberish.
 * Uses O(1) memory cache to eliminate repeated calculations.
 */
export function isRealEnglishWord(word: string): boolean {
  if (!word) return false;
  const clean = word.toLowerCase().trim().replace(/[^a-z]/g, "");
  if (clean.length < 2) return false;

  const cached = wordValidityCache.get(clean);
  if (cached !== undefined) return cached;

  let isValid = false;
  if (!INVALID_WORD_PARTS.has(clean)) {
    if (clean.length > 2 || VALID_TWO_LETTER_WORDS.has(clean)) {
      isValid = MASTER_ENGLISH_DICTIONARY.has(clean) || HIGH_VALUE_ENGLISH_WORDS_SET.has(clean);
    }
  }

  wordValidityCache.set(clean, isValid);
  return isValid;
}

/**
 * Checks if a string is a single atomic English word,
 * meaning it is a real English word and cannot be further split into
 * two or more valid English words of length >= 2 (e.g. "voltcharge" -> "volt" + "charge" is NOT atomic).
 * Uses bounded O(1) atomic cache.
 */
export function isAtomicEnglishWord(word: string): boolean {
  if (!word) return false;
  const clean = word.toLowerCase().trim().replace(/[^a-z]/g, "");
  if (clean.length < 2) return false;

  const cached = atomicWordCache.get(clean);
  if (cached !== undefined) return cached;

  if (!isRealEnglishWord(clean)) {
    atomicWordCache.set(clean, false);
    return false;
  }
  if (clean.length < 4) {
    atomicWordCache.set(clean, true);
    return true;
  }

  let isAtomic = true;
  for (let i = 2; i <= clean.length - 2; i++) {
    const sub1 = clean.substring(0, i);
    const sub2 = clean.substring(i);
    if (isRealEnglishWord(sub1) && isRealEnglishWord(sub2)) {
      // Compound of multiple English words (e.g. volt + charge, urban + villages)
      isAtomic = false;
      break;
    }
  }

  atomicWordCache.set(clean, isAtomic);
  return isAtomic;
}

/**
 * Strictly decomposes a domain slug into EXACTLY TWO valid, correctly spelled English words.
 * Returns [word1, word2] if and only if both words are genuine atomic English words in the dictionary.
 * Returns null if the domain is a single word, 3+ words (e.g. smartvoltcharge, smarturbanvillages), gibberish, or invalid.
 * Fast O(1) cache lookups prevent expensive loop re-evaluations across recurring domain searches.
 */
export function decomposeIntoTwoEnglishWords(slug: string, targetKeyword?: string): [string, string] | null {
  const clean = slug.toLowerCase().replace(/[^a-z]/g, "");
  if (!clean || clean.length < 4) return null;

  const cleanKw = targetKeyword ? targetKeyword.trim().toLowerCase().replace(/[^a-z]/g, "") : "";
  const cacheKey = cleanKw ? `${clean}#${cleanKw}` : clean;

  const cached = twoWordDecomposeCache.get(cacheKey);
  if (cached !== undefined) return cached;

  // 1. If a target keyword is present, check direct prefix/suffix split
  // CRITICAL: The paired non-keyword part MUST be a 100% verified atomic single English word
  if (cleanKw && clean.length > cleanKw.length) {
    if (clean.startsWith(cleanKw)) {
      const rest = clean.slice(cleanKw.length);
      if (isAtomicEnglishWord(rest)) {
        const res: [string, string] = [cleanKw, rest];
        twoWordDecomposeCache.set(cacheKey, res);
        return res;
      }
      twoWordDecomposeCache.set(cacheKey, null);
      return null;
    } else if (clean.endsWith(cleanKw)) {
      const prefix = clean.slice(0, clean.length - cleanKw.length);
      if (isAtomicEnglishWord(prefix)) {
        const res: [string, string] = [prefix, cleanKw];
        twoWordDecomposeCache.set(cacheKey, res);
        return res;
      }
      twoWordDecomposeCache.set(cacheKey, null);
      return null;
    } else {
      twoWordDecomposeCache.set(cacheKey, null);
      return null;
    }
  }

  const validSplits: [string, string][] = [];

  for (let i = 2; i <= clean.length - 2; i++) {
    const w1 = clean.substring(0, i);
    const w2 = clean.substring(i);

    // BOTH w1 and w2 MUST be genuine atomic English dictionary words
    const isW1Valid = isAtomicEnglishWord(w1) || (cleanKw && w1 === cleanKw);
    const isW2Valid = isAtomicEnglishWord(w2) || (cleanKw && w2 === cleanKw);

    if (isW1Valid && isW2Valid) {
      validSplits.push([w1, w2]);
    }
  }

  if (validSplits.length > 0) {
    if (cleanKw) {
      const kwSplit = validSplits.find(([a, b]) => a === cleanKw || b === cleanKw);
      if (kwSplit) {
        twoWordDecomposeCache.set(cacheKey, kwSplit);
        return kwSplit;
      }
    }

    validSplits.sort((a, b) => {
      const minLenA = Math.min(a[0].length, a[1].length);
      const minLenB = Math.min(b[0].length, b[1].length);
      if (minLenB !== minLenA) return minLenB - minLenA;
      return Math.abs(a[0].length - a[1].length) - Math.abs(b[0].length - b[1].length);
    });

    twoWordDecomposeCache.set(cacheKey, validSplits[0]);
    return validSplits[0];
  }

  twoWordDecomposeCache.set(cacheKey, null);
  return null;
}

/**
 * Returns constituent words, strictly respecting real English word boundaries.
 */
function decomposeIntoWords(name: string, targetKeyword?: string): string[] {
  const two = decomposeIntoTwoEnglishWords(name, targetKeyword);
  if (two) return two;
  const clean = name.toLowerCase().replace(/[^a-z]/g, "");
  return [clean || name];
}

const SERVER_NICHE_MAP: Record<string, string[]> = {
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

function serverMatchNiche(words: string[], domainName: string, nicheContext?: string) {
  if (!nicheContext || !nicheContext.trim()) return { isMatch: false, bonus: 0, matched: [] as string[] };
  const cleanTopic = nicheContext.trim().toLowerCase();
  const wordsKey = words.join(",");
  const cacheKey = `${cleanTopic}#${wordsKey}`;
  const cached = nicheMatchCache.get(cacheKey);
  if (cached) return cached;

  const tokens = cleanTopic.split(/[^a-z0-9]+/).filter((t) => t.length >= 2);
  if (tokens.length === 0) return { isMatch: false, bonus: 0, matched: [] as string[] };

  const tokensSet = new Set(tokens);
  const targetSemantic = new Set<string>();
  tokens.forEach((t) => {
    targetSemantic.add(t);
    if (SERVER_NICHE_MAP[t]) {
      SERVER_NICHE_MAP[t].forEach((w) => targetSemantic.add(w));
    }
  });

  const matched: string[] = [];
  let direct = 0;
  let semantic = 0;

  for (const w of words) {
    const cleanW = w.toLowerCase();
    if (tokensSet.has(cleanW)) {
      direct++;
      matched.push(cleanW);
    } else if (targetSemantic.has(cleanW)) {
      semantic++;
      matched.push(cleanW);
    }
  }

  const isMatch = direct > 0 || semantic > 0;
  const bonus = direct * 24 + semantic * 14;
  const result = { isMatch, bonus, matched };
  nicheMatchCache.set(cacheKey, result);
  return result;
}

function serverMatchKeyword(words: string[], domainName: string, keyword?: string): { matches: boolean; matchedWord?: string } {
  if (!keyword || !keyword.trim()) return { matches: true };
  const cleanKw = keyword.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
  if (!cleanKw) return { matches: true };

  const rawLower = (domainName || '').toLowerCase();
  const lastDot = rawLower.lastIndexOf('.');
  const nameOnly = lastDot !== -1 ? rawLower.substring(0, lastDot) : rawLower;
  const cleanSlug = nameOnly.replace(/[^a-z0-9]/g, '');

  // 1. Exact match in constituent words array (e.g. ['smart', 'labs'] matches 'smart')
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

// Algorithmic evaluation engine with parallel execution (Promise.all) and O(1) dictionary caching
async function evaluateAlgorithmicBatch(
  candidates: string[],
  count: number,
  rules: {
    exactlyTwoWords: boolean;
    noDashes: boolean;
    noNumbers: boolean;
    tlds: string[];
    auctionMode: boolean;
  },
  contextTopic?: string,
  searchMode: 'niche' | 'keyword' = 'niche',
  targetKeyword?: string
) {
  const cleanKw = targetKeyword ? targetKeyword.trim().toLowerCase().replace(/[^a-z0-9]/g, '') : '';
  const isKeywordMode = searchMode === 'keyword' && Boolean(cleanKw);

  const normalizedAllowedTlds = Array.isArray(rules.tlds) && rules.tlds.length > 0
    ? rules.tlds.map((t) => (t.toLowerCase().startsWith(".") ? t.toLowerCase() : `.${t.toLowerCase()}`))
    : [];

  // Filter candidates by permitted TLDs first
  const tldFiltered = normalizedAllowedTlds.length > 0
    ? candidates.filter((c) => {
        const lastDot = c.lastIndexOf('.');
        const tld = lastDot !== -1 ? c.substring(lastDot).toLowerCase() : '.com';
        return normalizedAllowedTlds.includes(tld);
      })
    : candidates;

  // If in keyword search mode, identify candidates that contain the target keyword
  let matchingKeywordCandidates: string[] = [];
  if (isKeywordMode) {
    matchingKeywordCandidates = tldFiltered.filter((c) => {
      const lastDot = c.lastIndexOf('.');
      const name = lastDot !== -1 ? c.substring(0, lastDot) : c;
      const words = decomposeIntoWords(name, cleanKw);
      return serverMatchKeyword(words, name, cleanKw).matches;
    });
  }

  // Base pool of candidates: strictly use keyword matches when in keyword mode
  const pool = isKeywordMode
    ? matchingKeywordCandidates
    : tldFiltered;

  // If exactlyTwoWords rule is active, strictly filter to genuine 2-word domains
  const filteredCandidates = rules.exactlyTwoWords
    ? pool.filter((c) => {
        const lastDot = c.lastIndexOf('.');
        const name = lastDot !== -1 ? c.substring(0, lastDot) : c;
        const twoWords = decomposeIntoTwoEnglishWords(name, cleanKw);
        if (!twoWords) return false;
        if (isKeywordMode && cleanKw && !twoWords.some(w => w.toLowerCase() === cleanKw)) {
          return false;
        }
        return true;
      })
    : pool;

  // Parallel processing using Promise.all in non-blocking chunks
  const evaluated = await mapInParallelChunks(
    filteredCandidates,
    40,
    async (rawDomain, idx) => {
      const trimmed = rawDomain.trim().toLowerCase();
      const lastDot = trimmed.lastIndexOf(".");
      const name = lastDot !== -1 ? trimmed.substring(0, lastDot) : trimmed;
      const tld = lastDot !== -1 ? trimmed.substring(lastDot) : ".com";

      // Execute semantic checks, decomposition, and valuation logic in parallel
      const [twoWords, wordsList] = await Promise.all([
        Promise.resolve(decomposeIntoTwoEnglishWords(name, cleanKw)),
        Promise.resolve(decomposeIntoWords(name, cleanKw)),
      ]);

      const words = twoWords || wordsList;
      const wordsCount = words.length;

      const [nicheRes, kwRes] = await Promise.all([
        Promise.resolve(serverMatchNiche(words, name, contextTopic)),
        Promise.resolve(serverMatchKeyword(words, name, cleanKw)),
      ]);

      // Linguistic and commercial score calculation
      let score = 84;
      if (tld === ".com") score += 10;
      else if (tld === ".ai" || tld === ".io") score += 8;
      else if (tld === ".co") score += 5;

      if (name.length >= 6 && name.length <= 11) score += 3;

      let isNicheMatch = false;
      let isKeywordMatch = false;

      if (searchMode === 'niche' && contextTopic && contextTopic.trim()) {
        if (nicheRes.isMatch) {
          score += nicheRes.bonus;
          isNicheMatch = true;
        }
      } else if (searchMode === 'keyword' && cleanKw) {
        if (kwRes.matches) {
          score += 26;
          isKeywordMatch = true;
        }
      }

      score = Math.min(99, Math.max(76, score - (idx % 2)));

      const tier = score >= 92 ? "Premium" : score >= 85 ? "Brandable" : "Standard";
      const valObj = SAAS_VALUATIONS.find((v) => v.tier === tier) || SAAS_VALUATIONS[1];
      const valLow = Math.round((valObj.min * (score / 85)) / 50) * 50;
      const valHigh = Math.round((valObj.max * (score / 85)) / 50) * 50;

      const auctionEndsInHours = rules.auctionMode
        ? Math.floor(Math.random() * 16) + 1
        : undefined;
      const auctionCurrentBid = rules.auctionMode
        ? `$${Math.floor(Math.random() * 480) + 95}`
        : undefined;

      let pitch = "";
      if (searchMode === "keyword" && cleanKw) {
        const otherWord = words.find((w) => w.toLowerCase() !== cleanKw) || words[1] || "brand";
        pitch = `High-conviction 2-word synergy spotlights keyword "${cleanKw}" paired with "${otherWord}" for instant market recall.`;
      } else if (searchMode === "niche" && isNicheMatch) {
        pitch = `High-relevance fit for ${contextTopic}: blends "${words[0]}" + "${words[1]}" with verified category authority.`;
      } else if (words.length === 2) {
        pitch = `Premium 2-word synergy combining "${words[0]}" + "${words[1]}" with high brand recall for ${contextTopic || "modern digital ventures"}.`;
      } else {
        pitch = `Commercial brand candidate tailored for ${contextTopic || "modern digital ventures"}.`;
      }

      return {
        id: `eval-${idx + 1}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        domain: `${name}${tld}`,
        name,
        tld,
        relevanceScore: score,
        wordsCount,
        words,
        hasDashes: name.includes("-"),
        hasNumbers: /\d/.test(name),
        valuationTier: tier,
        estimatedValue: `$${valLow.toLocaleString()} - $${valHigh.toLocaleString()}`,
        pitch,
        isTopPick: false,
        topPickBadge: undefined as string | undefined,
        isNicheMatch,
        isKeywordMatch,
        auctionEndingSoon: rules.auctionMode,
        auctionEndsInHours,
        auctionCurrentBid,
      };
    }
  );

  // Sort: if niche mode, niche matches sorted first; if keyword mode, keyword matches first
  evaluated.sort((a, b) => {
    if (searchMode === 'niche' && contextTopic?.trim()) {
      if (a.isNicheMatch && !b.isNicheMatch) return -1;
      if (!a.isNicheMatch && b.isNicheMatch) return 1;
    } else if (searchMode === 'keyword' && cleanKw) {
      if (a.isKeywordMatch && !b.isKeywordMatch) return -1;
      if (!a.isKeywordMatch && b.isKeywordMatch) return 1;
    }
    return b.relevanceScore - a.relevanceScore;
  });

  // Mark top 3 picks
  evaluated.forEach((item, index) => {
    if (index === 0) {
      item.isTopPick = true;
      item.topPickBadge = "Best Match #1";
    } else if (index === 1) {
      item.isTopPick = true;
      item.topPickBadge = "Top Pick #2";
    } else if (index === 2) {
      item.isTopPick = true;
      item.topPickBadge = "Top Pick #3";
    }
  });

  return evaluated.slice(0, count);
}

// AI evaluation helper for uploaded lists
async function evaluateUploadedWithGemini(
  candidates: string[],
  count: number,
  rules: {
    exactlyTwoWords: boolean;
    noDashes: boolean;
    noNumbers: boolean;
    tlds: string[];
    auctionMode: boolean;
  },
  contextTopic?: string,
  searchMode: 'niche' | 'keyword' = 'niche',
  targetKeyword?: string
) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });

  const normalizedAllowedTlds = Array.isArray(rules.tlds) && rules.tlds.length > 0
    ? rules.tlds.map((t) => (t.toLowerCase().startsWith(".") ? t.toLowerCase() : `.${t.toLowerCase()}`))
    : [];

  const validCandidates = normalizedAllowedTlds.length > 0
    ? candidates.filter((c) => {
        const lastDot = c.lastIndexOf(".");
        const tld = lastDot !== -1 ? c.substring(lastDot).toLowerCase() : ".com";
        return normalizedAllowedTlds.includes(tld);
      })
    : candidates;

  const candidateSet = new Set(validCandidates.map((c) => c.toLowerCase().trim()));
  // Provide up to 40 candidates in prompt
  const domainBatch = validCandidates.slice(0, 40).join(", ");

  let strategyDirective = `Evaluation criteria for target niche "${contextTopic || "Technology, Cloud, AI, and SaaS"}":
- Focus specifically on identifying and ranking the best domains that fit the "${contextTopic || "Technology, Cloud, AI, and SaaS"}" niche. Prioritize domains that have direct commercial application for this specific industry.`;

  if (searchMode === 'keyword' && targetKeyword && targetKeyword.trim()) {
    strategyDirective = `Evaluation criteria with mandatory keyword focus "${targetKeyword}":
- The client is searching specifically for domains containing the keyword "${targetKeyword}".
- Prioritize, rank, and pitch the highest-value domains formed by combining "${targetKeyword}" with a REAL, HIGH-VALUE ENGLISH DICTIONARY NOUN OR ADJECTIVE (e.g., Hub, Labs, Flow, Stack, Vault, Base, Mint, Sphere). NO fake words, NO typos, NO non-English combinations.`;
  }

  const prompt = `You are an elite domain portfolio evaluator and venture branding strategist.
You are evaluating a private portfolio of candidate domains uploaded by a client in an Excel/CSV spreadsheet.

CRITICAL MANDATORY INSTRUCTIONS:
1. You MUST ONLY evaluate, score, and rank domains that appear in the "Candidate Domains" list below.
2. You are STRICTLY FORBIDDEN from generating, creating, hallucinating, modifying, chopping, shortening, or suggesting ANY domain name that is not in the Candidate Domains list below.
3. Every single object in your returned JSON array MUST have its "domain" field matching an EXACT domain from the Candidate Domains list.
4. If a domain is not in Candidate Domains, DO NOT return it under any circumstances.
5. STRICT 2-WORD ENGLISH RULE: Every selected domain MUST consist of EXACTLY TWO valid, correctly spelled English words (e.g. "cloudnexus", "swiftpulse", "dataforge").
   Each domain MUST be formed by combining the keyword '${targetKeyword || ""}' with a REAL, HIGH-VALUE ENGLISH DICTIONARY NOUN OR ADJECTIVE (e.g., Hub, Labs, Flow, Stack, Vault, Base, Mint, Sphere).
   STRICTLY DISQUALIFY AND NEVER SELECT:
   - Non-English gibberish words, typos, or partial suffixes
   - 3 or 4 or more words (e.g. "freedomlaundrycohub.com" has 4 words -> DISQUALIFY; "bestcloudserviceapp.com" has 4 words -> DISQUALIFY)
   - Single English words (e.g. "marketing", "technology", "insurance", "apple", "doctor", "computer")
   Only domains with EXACTLY TWO real English dictionary words are allowed!
6. CRITICAL EMPTY RESULT RULE: If NO domain in Candidate Domains meets the strict 2-word criteria (keyword + exactly one valid English word), you MUST RETURN AN EMPTY JSON ARRAY: []
   NEVER modify or truncate a 3-word candidate to make it 2 words (e.g. if candidate is "smartgymfit.com", DO NOT return "smartgym.com").
7. For each returned domain, provide the two constituent English words in the "words" field as an array: ["word1", "word2"]. Both word1 and word2 must be real individual English words.
8. STRICT TLD EXTENSION RULE: The user selected ONLY these extensions: ${normalizedAllowedTlds.length > 0 ? normalizedAllowedTlds.join(", ") : ".com"}. Any domain with another extension must be strictly disqualified.
${normalizedAllowedTlds.length === 1 && normalizedAllowedTlds[0] === ".com" ? "\n9. CRITICAL TLD ENFORCEMENT: You MUST ONLY evaluate and describe domains using the \".com\" extension. Do NOT mention alternative extensions in descriptions (e.g. no .cc, .tools, .io)." : ""}

Candidate Domains:
${domainBatch}

${strategyDirective}
- Relevance Score: Integer 76 to 99 reflecting brand appeal, market liquidity, and commercial recall.
- Valuation Tier: "Premium", "Brandable", or "Standard".
- Estimated Valuation: e.g. "$2,800 - $5,400".
- Pitch: 1 concise sentence explaining commercial brand appeal.
- Constituent Words: array of the 2 constituent English words.
- Sort with highest scoring domains FIRST.
- Mark top 3 domains with isTopPick: true and appropriate topPickBadge ("Best Match #1", "Top Pick #2", "Top Pick #3").`;

  const modelsToTry = ["gemini-3.8-flash", "gemini-3.1-flash-lite", "gemini-flash-latest"];
  let parsed: any = null;
  let lastError: any = null;

  for (const model of modelsToTry) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const response: any = await withTimeout(
          ai.models.generateContent({
            model,
            contents: prompt,
            config: {
              temperature: 0.3,
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.ARRAY,
                description: "Evaluated domains from Candidate Domains only, sorted best to worst",
                items: {
                  type: Type.OBJECT,
                  properties: {
                    domain: { type: Type.STRING },
                    name: { type: Type.STRING },
                    tld: { type: Type.STRING },
                    relevanceScore: { type: Type.INTEGER },
                    wordsCount: { type: Type.INTEGER },
                    words: { type: Type.ARRAY, items: { type: Type.STRING } },
                    valuationTier: { type: Type.STRING },
                    estimatedValue: { type: Type.STRING },
                    pitch: { type: Type.STRING },
                    isTopPick: { type: Type.BOOLEAN },
                    topPickBadge: { type: Type.STRING }
                  },
                  required: [
                    "domain",
                    "relevanceScore",
                    "valuationTier",
                    "estimatedValue",
                    "pitch"
                  ]
                }
              }
            }
          }),
          10000,
          `Gemini ${model} batch evaluation`
        );

        const text = response.text;
        if (text) {
          const json = JSON.parse(text);
          if (Array.isArray(json) && json.length > 0) {
            // STRICT FILTER: keep ONLY items whose domain is in candidateSet
            const verified = json.filter((item: any) => {
              const d = String(item.domain || "").toLowerCase().trim();
              return candidateSet.has(d);
            });
            if (verified.length > 0) {
              parsed = verified;
              break;
            }
          }
        }
      } catch (err: any) {
        lastError = err;
        const isTransient = err?.status === 503 || err?.status === 429 ||
          String(err?.message || "").includes("503") ||
          String(err?.message || "").includes("high demand") ||
          String(err?.message || "").includes("timed out");

        if (isTransient && attempt < 2) {
          await new Promise((resolve) => setTimeout(resolve, 600));
          continue;
        }
        break; // Next model
      }
    }
    if (parsed && parsed.length > 0) break;
  }

  if (!parsed || parsed.length === 0) {
    const safeReason = formatSafeLog(lastError);
    const cleanErr = new Error(safeReason);
    (cleanErr as any).safeReason = safeReason;
    throw cleanErr;
  }

  // Format verified candidates into standard DomainItem structures
  const formatted: any[] = [];
  const seen = new Set<string>();
  const cleanKw = (targetKeyword || "").trim().toLowerCase().replace(/[^a-z0-9]/g, "");

  parsed.forEach((item: any, idx: number) => {
    const rawDomain = String(item.domain || "").toLowerCase().trim();
    if (!candidateSet.has(rawDomain) || seen.has(rawDomain)) {
      return;
    }
    seen.add(rawDomain);

    const lastDot = rawDomain.lastIndexOf(".");
    // CRITICAL FIX: Domain name MUST be derived exclusively from the candidate domain in the spreadsheet, NEVER from AI hallucinated item.name
    const rawName = lastDot !== -1 ? rawDomain.substring(0, lastDot) : rawDomain;
    let cleanName = rawName.replace(/https?:\/\//i, "").replace(/^www\./i, "").split("/")[0];
    if (cleanName.includes(".")) {
      cleanName = cleanName.substring(0, cleanName.lastIndexOf("."));
    }
    cleanName = cleanName.replace(/[^a-z0-9-]/g, "");

    const rawTld = lastDot !== -1 ? rawDomain.substring(lastDot) : (item.tld || ".com");
    let tld = rawTld.toLowerCase().startsWith(".") ? rawTld.toLowerCase() : `.${rawTld.toLowerCase()}`;
    
    // Strict TLD filter: disqualify any domain whose TLD is not in selected list
    if (normalizedAllowedTlds.length > 0 && !normalizedAllowedTlds.includes(tld)) {
      return;
    }
    if (!tld.startsWith(".")) tld = `.${tld}`;

    // Strict 2-word English check: verify against 275k dictionary
    let words = Array.isArray(item.words) && item.words.length === 2 ? item.words : null;
    if (rules.exactlyTwoWords) {
      const verifiedTwo = decomposeIntoTwoEnglishWords(cleanName, targetKeyword);
      if (!verifiedTwo) {
        // Disqualify: does not meet strict 2 English words requirement (e.g. 3+ words or single word)
        return;
      }
      words = verifiedTwo;
    } else {
      words = words || decomposeIntoWords(cleanName, targetKeyword);
    }

    if (!words || words.length !== 2) {
      return;
    }

    // In keyword mode, verify that one of the two words is the mandatory keyword
    if (searchMode === 'keyword' && cleanKw) {
      if (!words.some(w => w.toLowerCase() === cleanKw)) {
        return;
      }
    }

    const isTop = idx < 3;
    const topBadge = idx === 0 ? "Best Match #1" : idx === 1 ? "Top Pick #2" : idx === 2 ? "Top Pick #3" : undefined;
    const finalFullDomain = `${cleanName}${tld}`;
    
    let finalPitch = item.pitch || `High commercial visibility combining "${words[0]}" and "${words[1] || ''}" for ${contextTopic || "modern ventures"}.`;
    // UI Sanitization
    const wrongDomainRegex = new RegExp(`${cleanName}\\.[a-z]+`, 'gi');
    finalPitch = finalPitch.replace(wrongDomainRegex, finalFullDomain);
    finalPitch = finalPitch.replace(/(?:\s|^)\.(cc|tools|io|net|co|org|biz|info|xyz|me)\b/gi, ` ${tld}`);

    formatted.push({
      id: `ai-eval-${idx + 1}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      domain: finalFullDomain,
      name: cleanName,
      tld: tld,
      relevanceScore: Math.min(99, Math.max(75, Number(item.relevanceScore) || 90)),
      wordsCount: words.length,
      words,
      hasDashes: cleanName.includes("-"),
      hasNumbers: /\d/.test(cleanName),
      valuationTier: (["Premium", "Brandable", "Standard"].includes(item.valuationTier) ? item.valuationTier : (isTop ? "Premium" : "Brandable")),
      estimatedValue: item.estimatedValue || "$2,200 - $4,500",
      pitch: finalPitch,
      isTopPick: isTop,
      topPickBadge: isTop ? topBadge : (item.topPickBadge || undefined),
      auctionEndingSoon: rules.auctionMode,
      auctionEndsInHours: rules.auctionMode ? (Math.floor(Math.random() * 16) + 1) : undefined,
      auctionCurrentBid: rules.auctionMode ? (`$${Math.floor(Math.random() * 450) + 80}`) : undefined,
    });
  });

  // If fewer than requested, pad EXCLUSIVELY with remaining items from validCandidates
  if (formatted.length < count && validCandidates.length > formatted.length) {
    const existing = new Set(formatted.map((f) => f.domain.toLowerCase().trim()));
    const remaining = validCandidates.filter((c) => !existing.has(c.toLowerCase().trim()));
    const fallbackList = await evaluateAlgorithmicBatch(remaining, count - formatted.length, rules, contextTopic, searchMode, targetKeyword);
    formatted.push(...fallbackList);
  }

  return formatted.slice(0, count);
}

// API Routes
app.post("/api/generate-domains", async (req, res) => {
  try {
    const { keywords = "AI SaaS cloud", count = 10, rules = {} } = req.body;

    const normalizedRules = {
      exactlyTwoWords: Boolean(rules.exactlyTwoWords ?? true),
      noDashes: Boolean(rules.noDashes ?? true),
      noNumbers: Boolean(rules.noNumbers ?? true),
      tlds: Array.isArray(rules.tlds) && rules.tlds.length > 0
        ? rules.tlds.map((t: string) => (t.toLowerCase().startsWith(".") ? t.toLowerCase() : `.${t.toLowerCase()}`))
        : [".com"],
      auctionMode: Boolean(rules.auctionMode ?? false),
      minLetters: typeof rules.minLetters === "number" ? rules.minLetters : 2,
      maxLetters: typeof rules.maxLetters === "number" ? rules.maxLetters : 25,
    };

    const targetCount = Math.min(30, Math.max(1, Number(count) || 10));

    let domains: any[] = [];
    let usedFallback = false;

    try {
      domains = await generateWithGemini(keywords, targetCount, normalizedRules);
    } catch (aiErr: any) {
      const reason = formatSafeLog(aiErr);
      console.info(`[Autonomous Synthesizer] Active: ${reason}. Fast algorithmic 2-word generator engaged.`);
      usedFallback = true;
      domains = generateAlgorithmicDomains(keywords, targetCount, normalizedRules);
    }

    return res.json({
      success: true,
      domains,
      usedFallback,
      querySummary: keywords || "Curated Top Tech Domains",
      generatedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error(`[API Issue] /api/generate-domains: ${formatSafeLog(err)}`);
    return res.status(500).json({
      success: false,
      error: "Unable to generate domains at this time. Please try again shortly.",
    });
  }
});

// Single Domain Verification & Valuation Engine (Parallelized with Promise.all & In-Memory Cache)
app.post("/api/verify-domain", async (req, res) => {
  try {
    const { domain = "" } = req.body;
    if (!domain || typeof domain !== "string") {
      return res.status(400).json({ success: false, error: "Please provide a domain name to verify." });
    }

    let cleaned = domain.trim().toLowerCase();
    cleaned = cleaned.replace(/https?:\/\//, "").replace(/^www\./, "").replace(/\/.*$/, "");

    // 1. Instant Cache Check
    const cachedResult = domainVerificationCache.get(cleaned);
    if (cachedResult) {
      return res.json({
        success: true,
        result: cachedResult,
        fromCache: true,
      });
    }

    let name = cleaned;
    let tld = ".com";
    const lastDot = cleaned.lastIndexOf(".");
    if (lastDot !== -1) {
      name = cleaned.substring(0, lastDot);
      tld = cleaned.substring(lastDot);
    } else {
      cleaned = `${name}.com`;
    }

    const targetDomain = `${name}${tld}`;

    // 2. Parallel execution: Linguistic checks, Character validity, and Dictionary verification
    const [formatChecks, twoWords] = await Promise.all([
      Promise.resolve({
        hasNoNumbers: !/\d/.test(name),
        hasNoDashes: !/[-_]/.test(name),
        isCleanAlphabetical: /^[a-z]+$/.test(name),
      }),
      Promise.resolve(decomposeIntoTwoEnglishWords(name)),
    ]);

    const { hasNoNumbers, hasNoDashes, isCleanAlphabetical } = formatChecks;

    let isValidTwoWord = false;
    let failureReason: string | undefined = undefined;
    let words: string[] = [name];

    if (!hasNoNumbers) {
      failureReason = "Contains numbers or digits. CheckCatch requires 100% alphabetical English words.";
    } else if (!hasNoDashes) {
      failureReason = "Contains hyphens or dashes. Two-word verification requires continuous spelling.";
    } else if (!isCleanAlphabetical) {
      failureReason = "Contains special characters. Only standard English alphabetical letters allowed.";
    } else if (name.length < 4) {
      failureReason = "Domain name is too short to be a valid 2-word English compound.";
    } else if (twoWords) {
      isValidTwoWord = true;
      words = twoWords;
    } else {
      if (MASTER_ENGLISH_DICTIONARY.has(name)) {
        failureReason = "Single English dictionary word detected. CheckCatch engine specifically checks and values Two-Word Compound Domains.";
      } else {
        failureReason = "Could not split into two valid English dictionary words. Check spelling or vocabulary roots.";
      }
    }

    const word1 = words[0] || "";
    const word2 = words[1] || "";

    // 3. Parallel Valuation & SEO Engine execution
    const [brandabilityMetrics, seoMetrics, registrarLinks] = await Promise.all([
      // Task 1: Valuation and brandability calculation
      (async () => {
        let score = 50;
        if (isValidTwoWord) {
          score = 82;
          const totalLen = name.length;
          if (totalLen >= 8 && totalLen <= 11) score += 9;
          else if (totalLen >= 6 && totalLen <= 14) score += 5;

          if (tld === ".com") score += 8;
          else if (tld === ".ai") score += 7;
          else if (tld === ".io") score += 5;
          else if (tld === ".co") score += 4;

          score = Math.min(99, Math.max(75, score));
        } else {
          if (!hasNoNumbers) score -= 25;
          if (!hasNoDashes) score -= 20;
          score = Math.max(15, Math.min(score, 45));
        }

        let grade: 'A+' | 'A' | 'B' | 'C' | 'D' = 'C';
        if (score >= 90) grade = 'A+';
        else if (score >= 80) grade = 'A';
        else if (score >= 65) grade = 'B';
        else if (score >= 50) grade = 'C';
        else grade = 'D';

        let tier: 'Premium' | 'Brandable' | 'Standard' = 'Standard';
        if (grade === 'A+') tier = 'Premium';
        else if (grade === 'A') tier = 'Brandable';

        let estimatedValue = 650;
        if (isValidTwoWord) {
          if (tld === '.com') {
            estimatedValue = grade === 'A+' ? 12500 + (score - 90) * 1200 : grade === 'A' ? 5400 + (score - 80) * 550 : 2200 + (score - 65) * 180;
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
        estimatedValue = Math.round(estimatedValue / 100) * 100;

        return { score, grade, tier, estimatedValue };
      })(),

      // Task 2: Search Volume and SEO estimates
      (async () => {
        const isAgedName = isValidTwoWord && tld === '.com';
        return {
          domainAuthority: isValidTwoWord ? Math.min(58, Math.max(24, Math.round(82 * 0.45))) : 8,
          backlinks: isValidTwoWord ? Math.round(82 * 28 + (isAgedName ? 950 : 150)) : 45,
          domainAge: isValidTwoWord ? (isAgedName ? "7-9 Years (Estimated)" : "Available / Expiring Drop") : "Unranked / New",
        };
      })(),

      // Task 3: Registrar Links
      Promise.resolve({
        namecheap: `https://www.namecheap.com/domains/registration/results/?domain=${encodeURIComponent(targetDomain)}`,
        godaddy: `https://www.godaddy.com/domainsearch/find?checkAvail=1&domainToCheck=${encodeURIComponent(targetDomain)}`,
        dynadot: `https://www.dynadot.com/domain/search?keyword=${encodeURIComponent(targetDomain)}`,
        dropcatch: `https://www.dropcatch.com/domain/${encodeURIComponent(targetDomain)}`
      }),
    ]);

    const { score, grade, tier, estimatedValue } = brandabilityMetrics;

    const evaluationResult = {
      domain: targetDomain,
      name,
      tld,
      isValidTwoWord,
      status: isValidTwoWord ? 'PASS' : 'FAIL',
      failureReason,
      validationChecks: {
        hasTwoEnglishWords: isValidTwoWord,
        hasNoNumbers,
        hasNoDashes,
        isCleanAlphabetical,
      },
      words: isValidTwoWord ? [word1, word2] : [name],
      brandabilityScore: score,
      brandabilityGrade: grade,
      estimatedMarketValue: estimatedValue,
      estimatedValueFormatted: `$${estimatedValue.toLocaleString('en-US')}`,
      valuationTier: tier,
      searchVolumeIntent: {
        monthlySearchesEstimate: isValidTwoWord ? Math.round(score * 180 + 3200) : 450,
        intentLevel: score >= 88 ? 'High Commercial' : score >= 75 ? 'Moderate' : 'Niche',
        category: 'Digital Innovation & Enterprise',
      },
      seoInsights: seoMetrics,
      registrarLinks,
      pitch: isValidTwoWord
        ? `Verified 2-word English compound joining "${word1}" and "${word2}" with high brand recall on ${tld}.`
        : `Validation exception: ${failureReason}`,
    };

    // Cache computed evaluation
    domainVerificationCache.set(cleaned, evaluationResult);

    return res.json({
      success: true,
      result: evaluationResult,
      fromCache: false,
    });
  } catch (err: any) {
    console.error("Single domain verification error:", err);
    return res.status(500).json({ success: false, error: err.message || "Failed to verify domain" });
  }
});

// Batch evaluation API for uploaded Excel/CSV lists
app.post("/api/analyze-domains", async (req, res) => {
  try {
    const {
      candidateDomains = [],
      count = 10,
      rules = {},
      contextTopic = "Modern Technology, SaaS, and AI Ventures",
      searchMode = "niche",
      targetKeyword = "",
    } = req.body;

    if (!Array.isArray(candidateDomains) || candidateDomains.length === 0) {
      return res.status(400).json({
        success: false,
        error: "No candidate domains provided in the uploaded list.",
      });
    }

    const normalizedRules = {
      exactlyTwoWords: Boolean(rules.exactlyTwoWords ?? true),
      noDashes: Boolean(rules.noDashes ?? true),
      noNumbers: Boolean(rules.noNumbers ?? true),
      tlds: Array.isArray(rules.tlds) && rules.tlds.length > 0
        ? rules.tlds.map((t: string) => t.toLowerCase().startsWith(".") ? t.toLowerCase() : `.${t.toLowerCase()}`)
        : [".com"],
      auctionMode: Boolean(rules.auctionMode ?? false),
      minLetters: typeof rules.minLetters === "number" ? rules.minLetters : 2,
      maxLetters: typeof rules.maxLetters === "number" ? rules.maxLetters : 25,
    };

    const targetCount = Math.min(30, Math.max(1, Number(count) || 10));
    const cleanKw = targetKeyword ? String(targetKeyword).trim().toLowerCase() : "";

    // Strictly filter candidates according to active rules
    const qualified: string[] = [];
    const seen = new Set<string>();

    for (const raw of candidateDomains) {
      if (!raw || typeof raw !== "string") continue;
      let clean = raw.trim().toLowerCase();
      clean = clean.replace(/https?:\/\//, "").replace(/^www\./, "").replace(/\/.*$/, "");
      if (!clean) continue;

      const lastDot = clean.lastIndexOf(".");
      const name = lastDot !== -1 ? clean.substring(0, lastDot) : clean;
      const tld = lastDot !== -1 ? clean.substring(lastDot) : ".com";

      // Character length check (2 to 25 characters)
      if (name.length < normalizedRules.minLetters || name.length > normalizedRules.maxLetters) {
        continue;
      }

      // Dash check
      if (normalizedRules.noDashes && (name.includes("-") || name.includes("_"))) {
        continue;
      }
      // Number check
      if (normalizedRules.noNumbers && /\d/.test(name)) {
        continue;
      }
      // TLD check
      if (normalizedRules.tlds.length > 0 && !normalizedRules.tlds.includes(tld)) {
        continue;
      }
      // Two English words check: strictly verify against 275k dictionary
      const twoWords = decomposeIntoTwoEnglishWords(name, cleanKw);
      if (normalizedRules.exactlyTwoWords) {
        if (!twoWords) {
          continue;
        }
      }

      // If in keyword search mode, enforce keyword presence as one of the two verified words
      if (searchMode === "keyword" && cleanKw) {
        if (!twoWords || !twoWords.some(w => w.toLowerCase() === cleanKw)) {
          continue;
        }
      }

      const full = `${name}${tld}`;
      if (!seen.has(full)) {
        seen.add(full);
        qualified.push(full);
      }
    }

    if (qualified.length === 0) {
      return res.json({
        success: true,
        domains: [],
        totalQualified: 0,
        message: searchMode === "keyword" && cleanKw
          ? `No uploaded domains containing keyword "${cleanKw}" paired with a valid English word were found.`
          : "No uploaded domains matching strict 2-word rules were found in your file.",
        usedFallback: false,
        generatedAt: new Date().toISOString(),
      });
    }

    let evaluatedDomains: any[] = [];
    let usedFallback = false;

    // Send at most top 30 candidates to Gemini to ensure prompt remains compact and response is fast
    const candidateSlice = qualified.slice(0, 30);

    try {
      evaluatedDomains = await evaluateUploadedWithGemini(
        candidateSlice,
        targetCount,
        normalizedRules,
        contextTopic,
        searchMode as 'niche' | 'keyword',
        cleanKw
      );
    } catch (aiErr: any) {
      const reason = formatSafeLog(aiErr);
      console.info(`[Autonomous Evaluator] Active: ${reason}. Fast algorithmic batch evaluation engaged.`);
      usedFallback = true;
      evaluatedDomains = await evaluateAlgorithmicBatch(
        qualified,
        targetCount,
        normalizedRules,
        contextTopic,
        searchMode as 'niche' | 'keyword',
        cleanKw
      );
    }

    // If AI evaluated fewer items than requested, pad from algorithmic evaluation
    if (evaluatedDomains.length < targetCount && qualified.length > evaluatedDomains.length) {
      const fallbackList = await evaluateAlgorithmicBatch(
        qualified,
        targetCount,
        normalizedRules,
        contextTopic,
        searchMode as 'niche' | 'keyword',
        cleanKw
      );
      const existingNames = new Set(evaluatedDomains.map((d: any) => d.domain.toLowerCase().trim()));
      for (const item of fallbackList) {
        const itemDomain = item.domain.toLowerCase().trim();
        if (!existingNames.has(itemDomain)) {
          existingNames.add(itemDomain);
          evaluatedDomains.push(item);
          if (evaluatedDomains.length >= targetCount) break;
        }
      }
    }

    // ABSOLUTE STRICT GUARANTEE: Filter out any domain that is NOT in the uploaded spreadsheet list
    // AND verify strict 2-word requirement and keyword match
    const candidateVerifySet = new Set(qualified.map((d) => d.toLowerCase().trim()));
    let verifiedStrictDomains = evaluatedDomains.filter((d: any) => {
      const domStr = String(d.domain || "").toLowerCase().trim();
      if (!candidateVerifySet.has(domStr)) return false;
      const lastDot = domStr.lastIndexOf(".");
      const name = lastDot !== -1 ? domStr.substring(0, lastDot) : domStr;
      if (normalizedRules.exactlyTwoWords) {
        const twoWords = decomposeIntoTwoEnglishWords(name, cleanKw);
        if (!twoWords) return false;
        if (searchMode === "keyword" && cleanKw && !twoWords.some(w => w.toLowerCase() === cleanKw)) {
          return false;
        }
      }
      return true;
    });

    // If any got filtered out, fill with algorithmic evaluation exclusively from qualified spreadsheet domains
    if (verifiedStrictDomains.length < targetCount && qualified.length > verifiedStrictDomains.length) {
      const existing = new Set(verifiedStrictDomains.map((d: any) => d.domain.toLowerCase().trim()));
      const remainingCandidates = qualified.filter((c) => !existing.has(c.toLowerCase().trim()));
      const extraPicks = await evaluateAlgorithmicBatch(
        remainingCandidates,
        targetCount - verifiedStrictDomains.length,
        normalizedRules,
        contextTopic,
        searchMode as 'niche' | 'keyword',
        cleanKw
      );
      verifiedStrictDomains.push(...extraPicks);
    }

    return res.json({
      success: true,
      domains: verifiedStrictDomains.slice(0, targetCount),
      totalQualified: qualified.length,
      usedFallback,
      querySummary: `Analyzed ${qualified.length} qualified domains exclusively from spreadsheet`,
      generatedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error(`[API Issue] /api/analyze-uploaded-domains: ${formatSafeLog(err)}`);
    return res.status(500).json({
      success: false,
      error: "Failed to analyze uploaded domains. Please check the file and try again.",
    });
  }
});

// Fast, comprehensive parallel domain validation against the master English dictionary with caching
app.post("/api/validate-spreadsheet-domains", async (req, res) => {
  try {
    const {
      rawDomains = [],
      rules = {},
      searchMode = "niche",
      targetKeyword = "",
      contextTopic = "",
      relaxKeywordFilters = false,
      page = 1,
      limit,
    } = req.body;

    const normalizedRules = {
      exactlyTwoWords: Boolean(rules.exactlyTwoWords ?? true),
      noDashes: Boolean(rules.noDashes ?? true),
      noNumbers: Boolean(rules.noNumbers ?? true),
      tlds: Array.isArray(rules.tlds) && rules.tlds.length > 0
        ? rules.tlds
        : [".com", ".ai", ".io", ".co"],
      auctionMode: Boolean(rules.auctionMode ?? false),
    };

    const cleanKw = targetKeyword ? String(targetKeyword).trim().toLowerCase().replace(/[^a-z0-9]/g, '') : "";
    const isKeywordMode = searchMode === "keyword" && Boolean(cleanKw);

    const discarded: { domain: string; reason: string }[] = [];
    const qualified: string[] = [];
    const seen = new Set<string>();
    const allKeywordDomains: string[] = [];
    let keywordMatchesTotal = 0;
    let keywordMatchesStrict = 0;

    const breakdown = {
      dashes: 0,
      numbers: 0,
      tlds: 0,
      words: 0,
      invalid: 0,
      keywordMismatch: 0,
    };

    // Parallel chunked validation preventing event loop lag on large uploads
    await mapInParallelChunks(rawDomains, 150, async (raw) => {
      if (!raw || typeof raw !== "string") return;
      let clean = raw.trim().toLowerCase();
      clean = clean.replace(/https?:\/\//, "").replace(/^www\./, "").replace(/\/.*$/, "");
      if (!clean) return;

      const lastDot = clean.lastIndexOf(".");
      if (lastDot === -1 || lastDot === 0 || lastDot === clean.length - 1) {
        breakdown.invalid++;
        discarded.push({ domain: clean, reason: "Missing valid TLD extension" });
        return;
      }

      const name = clean.substring(0, lastDot);
      const tld = clean.substring(lastDot);

      // In keyword search mode, verify keyword containment first
      const words = decomposeIntoWords(name, cleanKw);
      if (isKeywordMode && cleanKw) {
        const kwRes = serverMatchKeyword(words, name, cleanKw);
        if (!kwRes.matches) {
          breakdown.keywordMismatch = (breakdown.keywordMismatch || 0) + 1;
          discarded.push({ domain: clean, reason: `Does not contain mandatory keyword "${cleanKw}"` });
          return;
        }
        keywordMatchesTotal++;
        if (!seen.has(clean)) {
          allKeywordDomains.push(clean);
        }
      }

      // If relaxKeywordFilters is active, accept keyword-matching domains that match the selected TLD
      if (isKeywordMode && cleanKw && relaxKeywordFilters) {
        if (normalizedRules.tlds.length > 0 && !normalizedRules.tlds.includes(tld)) {
          breakdown.tlds++;
          discarded.push({ domain: clean, reason: `TLD "${tld}" not in selected list` });
          return;
        }
        if (!seen.has(clean)) {
          seen.add(clean);
          qualified.push(clean);
        }
        return;
      }

      if (normalizedRules.noDashes && (name.includes("-") || name.includes("_"))) {
        breakdown.dashes++;
        discarded.push({ domain: clean, reason: "Contains hyphen (-)" });
        return;
      }

      if (normalizedRules.noNumbers && /\d/.test(name)) {
        breakdown.numbers++;
        discarded.push({ domain: clean, reason: "Contains numeric digit" });
        return;
      }

      if (normalizedRules.tlds.length > 0 && !normalizedRules.tlds.includes(tld)) {
        breakdown.tlds++;
        discarded.push({ domain: clean, reason: `TLD "${tld}" not in selected list` });
        return;
      }

      const twoWords = decomposeIntoTwoEnglishWords(name, cleanKw);
      if (normalizedRules.exactlyTwoWords) {
        if (!twoWords) {
          breakdown.words++;
          const cleanSlug = name.replace(/[^a-z]/g, "");
          const isSingle = MASTER_ENGLISH_DICTIONARY.has(cleanSlug);
          const reason = isSingle
            ? "Single English word (rule requires exactly two English words)"
            : "Does not form two valid English words (3+ words or non-dictionary parts)";
          discarded.push({ domain: clean, reason });
          return;
        }
      }

      if (isKeywordMode && cleanKw) {
        if (!twoWords || !twoWords.some(w => w.toLowerCase() === cleanKw)) {
          breakdown.keywordMismatch = (breakdown.keywordMismatch || 0) + 1;
          discarded.push({ domain: clean, reason: `Does not contain keyword "${cleanKw}" paired with a valid English word` });
          return;
        }
      }

      const full = `${name}${tld}`;
      if (!seen.has(full)) {
        seen.add(full);
        qualified.push(full);
        if (isKeywordMode && cleanKw) {
          keywordMatchesStrict++;
        }
      }
    });

    const parsedLimit = typeof limit === "number" && limit > 0 ? limit : undefined;
    const parsedPage = typeof page === "number" && page > 0 ? page : 1;

    const paginatedQualified = parsedLimit
      ? qualified.slice((parsedPage - 1) * parsedLimit, parsedPage * parsedLimit)
      : qualified;

    const stats = {
      totalUploaded: rawDomains.length,
      passedFilters: qualified.length,
      failedCount: Math.max(0, rawDomains.length - qualified.length),
      breakdown,
      discarded,
      showingCount: paginatedQualified.length,
      keywordMatchesTotal,
      keywordMatchesStrict,
      allKeywordDomains,
      autoRelaxed: false,
    };

    return res.json({
      success: true,
      qualifiedDomains: paginatedQualified,
      allKeywordDomains,
      stats,
      discarded,
      pagination: parsedLimit ? {
        page: parsedPage,
        limit: parsedLimit,
        totalQualified: qualified.length,
        totalPages: Math.ceil(qualified.length / parsedLimit),
      } : undefined,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// NDJSON Streaming endpoint for real-time progressive evaluation of large domain lists
app.post("/api/evaluate-domains-stream", async (req, res) => {
  try {
    const {
      candidateDomains = [],
      count = 20,
      rules = {},
      contextTopic = "Modern Technology, SaaS, and AI Ventures",
      searchMode = "niche",
      targetKeyword = "",
      chunkSize = 25,
    } = req.body;

    if (!Array.isArray(candidateDomains) || candidateDomains.length === 0) {
      return res.status(400).json({ success: false, error: "No candidate domains provided." });
    }

    res.setHeader("Content-Type", "application/x-ndjson");
    res.setHeader("Transfer-Encoding", "chunked");
    res.setHeader("Cache-Control", "no-cache, no-transform");

    const normalizedRules = {
      exactlyTwoWords: Boolean(rules.exactlyTwoWords ?? true),
      noDashes: Boolean(rules.noDashes ?? true),
      noNumbers: Boolean(rules.noNumbers ?? true),
      tlds: Array.isArray(rules.tlds) && rules.tlds.length > 0
        ? rules.tlds
        : [".com", ".ai", ".io", ".co"],
      auctionMode: Boolean(rules.auctionMode ?? false),
    };

    const targetChunkSize = Math.max(5, Math.min(100, Number(chunkSize) || 25));
    const cleanKw = targetKeyword ? String(targetKeyword).trim().toLowerCase().replace(/[^a-z0-9]/g, "") : "";

    for (let i = 0; i < candidateDomains.length; i += targetChunkSize) {
      const slice = candidateDomains.slice(i, i + targetChunkSize);
      const evaluatedChunk = await evaluateAlgorithmicBatch(
        slice,
        slice.length,
        normalizedRules,
        contextTopic,
        searchMode as "niche" | "keyword",
        cleanKw
      );

      const payload = JSON.stringify({
        chunkIndex: Math.floor(i / targetChunkSize),
        offset: i,
        count: evaluatedChunk.length,
        totalCandidates: candidateDomains.length,
        domains: evaluatedChunk,
      }) + "\n";

      res.write(payload);
      await new Promise((resolve) => setImmediate(resolve));
    }

    res.end();
  } catch (err: any) {
    console.error("Stream evaluation error:", err);
    if (!res.headersSent) {
      res.status(500).json({ success: false, error: err.message });
    } else {
      res.end();
    }
  }
});

// Cache telemetry & diagnostics API
app.get("/api/cache-stats", (req, res) => {
  res.json({
    status: "ok",
    caches: {
      wordValidity: wordValidityCache.getStats(),
      atomicWords: atomicWordCache.getStats(),
      twoWordDecomposition: twoWordDecomposeCache.getStats(),
      domainVerification: domainVerificationCache.getStats(),
      nicheMatch: nicheMatchCache.getStats(),
    },
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    hasApiKey: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY"),
  });
});

// Vite middleware or production static serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    // Serve static assets with high performance Cache-Control headers
    app.use(
      express.static(distPath, {
        maxAge: "1y",
        immutable: true,
        setHeaders: (res, filePath) => {
          if (filePath.endsWith(".html")) {
            res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
          } else {
            res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
          }
        },
      })
    );
    app.get("*", (req, res) => {
      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Domain Finder Server running on http://localhost:${PORT}`);
  });
}

startServer();
