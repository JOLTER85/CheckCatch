import React, { useState } from 'react';
import {
  Sparkles,
  Copy,
  Check,
  Download,
  ExternalLink,
  XCircle,
  FileText,
  Bot,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import { Language } from '../utils/translations';

interface LlmsTxtModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

const LLMS_TXT_CONTENT = `# CheckCatch.com

> CheckCatch is a professional two-word domain verification, phonetic radio test analysis, and institutional valuation engine. It isolates high-conviction brandable domain names from bulk dropcatch auctions and spreadsheets.

CheckCatch specializes in two-word English compound domain names, screening candidate names against a 275,000+ certified English atomic root dictionary, verifying pronounceability through the Phonetic Radio Test, filtering consonant-heavy gibberish, and calculating realistic dual-tier wholesale (investor liquidity) vs. retail (venture startup acquisition) market valuations.

## Overview

- **Website:** https://checkcatch.com
- **Blog & Guides:** https://checkcatch.com/blog
- **Primary Focus:** Two-Word Brandable .com Domains, Domain Dropcatching, Radio Test Scoring, Expired Auctions
- **Supported Languages:** English, Arabic (العربية), French (Français), Spanish (Español)
- **Target Audience:** Domain Investors, Dropcatchers, Venture Founders, Startup Brand Strategists, Portfolio Brokers

## Core Capabilities & Features

- [Two-Word Domain Verification Engine](https://checkcatch.com/): Algorithmic decomposition of compound domain names into validated English dictionary words.
- [Batch Spreadsheet Analyzer](https://checkcatch.com/): High-throughput auditing of Excel (.xlsx) and CSV (.csv) catalogs with thousands of expiring and dropcatch domains.
- [Phonetic Radio Test Diagnostics](https://checkcatch.com/blog/the-radio-test-domain-valuation-secret): Phonotactic analysis verifying friction-free word-of-mouth pronunciation, homophone elimination, and syllable cadence.
- [Institutional Dual-Tier Valuation](https://checkcatch.com/blog/wholesale-vs-retail-domain-pricing): Calculates realistic 10%-15% wholesale liquidation pricing and end-user retail acquisition value.
- [Anti-Gibberish & Consonant Screening](https://checkcatch.com/blog/detecting-gibberish-junk-consonant-traps): Zero-tolerance filtering of keyboard-mash spam, consonant clusters, and unpronounceable zombie names.
- [Domain Blog & Knowledge Base](https://checkcatch.com/blog): In-depth research playbooks covering dropcatch windows, auction types (Dropped, Private Seller, Pending Delete, Pre-Release), and UDRP trademark safety.

## Key Guides & Educational Playbooks

- [The Complete 2026 Guide to Domain Dropcatching](https://checkcatch.com/blog/how-to-dropcatch-expired-domains-guide): Technical breakdown of domain expiration cycles (Grace Period, Redemption, Pending Delete), drop windows (11:00 AM PST), and backordering strategies.
- [The Radio Test: Why Pronounceability Determines 90% of Value](https://checkcatch.com/blog/the-radio-test-domain-valuation-secret): Why advertising agencies, VCs, and podcast creators pay premium multiples for friction-free verbal domains.
- [The Two-Word Domain Playbook for Tech & Startups](https://checkcatch.com/blog/two-word-brandable-domains-investor-playbook): Why compound .coms are the sweet spot of branding (e.g., PayPal, DropBox, CoinBase) with formulaic rules (Action Verb + Noun, Adjective + Tech Noun).
- [Avoiding the Gibberish Trap](https://checkcatch.com/blog/detecting-gibberish-junk-consonant-traps): Algorithmic heuristics detecting unnatural consonant density and unpronounceable letter mashups.
- [Wholesale vs. Retail Domain Valuation](https://checkcatch.com/blog/wholesale-vs-retail-domain-pricing): The 10% wholesale rule, Buy-It-Now (BIN) pricing, and lease-to-own strategies for domainers.
- [Trademark Screening for Domain Investors](https://checkcatch.com/blog/trademark-udrp-protection-guide-for-domainers): Shielding domain portfolios from ICANN UDRP disputes, USPTO/WIPO screening, and avoiding famous brand traps.
- [Mastering Auction Catalogs](https://checkcatch.com/blog/mastering-expired-auctions-pending-delete-dropped): Deciphering Dropped, Private Seller, Pending Delete, and Pre-Release columns across bulk CSV files.

## Technical Rules & Strict Constraints

- **Strict Two Words:** Exactly 2 recognized English dictionary roots (e.g., SwiftPay.com, CloudNexus.com).
- **Zero Hyphens:** Names containing hyphens (-) or underscores (_) are automatically disqualified.
- **Zero Digits:** Numerical characters (0-9) are excluded to ensure pure brandability.
- **Character Length:** Recommended sweet spot is 6 to 15 characters.
- **Top-Level Domains:** Primary liquidity and institutional backing is anchored on .com.
- **Trademark Policy:** Strict exclusion of famous global trademarks, tech portals, and recognized corporate brands.

## Optional & Developer Resources

- [Sitemap](https://checkcatch.com/sitemap.xml): Full XML sitemap with multilingual alternate routes.
- [Full LLM Knowledge Ingestion](https://checkcatch.com/llms-full.txt): Complete uncompressed textual knowledge base including full article texts for generative AI search grounding.`;

export const LlmsTxtModal: React.FC<LlmsTxtModalProps> = ({
  isOpen,
  onClose,
  lang,
}) => {
  const isAr = lang === 'ar';
  const [activeTab, setActiveTab] = useState<'standard' | 'full'>('standard');
  const [isCopied, setIsCopied] = useState(false);

  if (!isOpen) return null;

  const contentToDisplay = LLMS_TXT_CONTENT;

  const handleCopy = () => {
    navigator.clipboard.writeText(contentToDisplay);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownload = () => {
    const filename = activeTab === 'standard' ? 'llms.txt' : 'llms-full.txt';
    const blob = new Blob([contentToDisplay], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div
      id="llms-txt-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div
        id="llms-txt-modal-content"
        className="bg-white border border-slate-200 rounded-3xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white">
                  {isAr ? 'مولد ملف llms.txt القياسي (ذكاء اصطناعي)' : 'Standard llms.txt Generator & Viewer'}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/30 text-blue-200 border border-blue-400/30">
                  GEO Ready
                </span>
              </div>
              <p className="text-xs text-blue-200/80">
                {isAr
                  ? 'المعيار العالمي لتهيئة الموقع لمحركات ChatGPT و Perplexity و Claude'
                  : 'Global standard for Generative Engine Optimization (GEO) & AI crawlers'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        {/* Info banner */}
        <div className="p-4 bg-blue-50/70 border-b border-blue-100 flex items-center justify-between text-xs text-blue-900 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
            <span>
              {isAr
                ? 'ملف llms.txt منشور ويعمل مباشرة على: https://checkcatch.com/llms.txt'
                : 'Live and active at: https://checkcatch.com/llms.txt'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/llms.txt"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-bold text-blue-700 hover:underline"
            >
              <span>{isAr ? 'فتح الملف الأصلي' : 'View Live File'}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Action bar: Copy / Download */}
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50 flex-wrap gap-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
            <FileText className="w-4 h-4 text-slate-500" />
            <span>{isAr ? 'الصيغة: Markdown نظيف وخفيف' : 'Format: Clean Markdown for LLMs'}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="min-h-[36px] px-3.5 py-1.5 rounded-xl text-xs font-bold bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
              <span>{isCopied ? (isAr ? 'تم النسخ!' : 'Copied!') : isAr ? 'نسخ النص' : 'Copy'}</span>
            </button>

            <button
              type="button"
              onClick={handleDownload}
              className="min-h-[36px] px-3.5 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-white" />
              <span>{isAr ? 'تحميل llms.txt' : 'Download llms.txt'}</span>
            </button>
          </div>
        </div>

        {/* Code viewer box */}
        <div className="p-4 sm:p-6 flex-1 overflow-y-auto bg-slate-900 text-slate-100 font-mono text-xs leading-relaxed selection:bg-blue-500 selection:text-white">
          <pre className="whitespace-pre-wrap font-mono">
            {contentToDisplay}
          </pre>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
          <span className="flex items-center gap-1 text-[11px]">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>
              {isAr
                ? 'متوافق مع محركات OpenAI GPT-4o, Claude 3.5, Perplexity Pro'
                : 'Compatible with OpenAI GPT-4o, Claude 3.5 Sonnet, Perplexity Pro'}
            </span>
          </span>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-200 text-xs font-semibold text-slate-800 hover:bg-slate-300 cursor-pointer"
          >
            {isAr ? 'إغلاق' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
