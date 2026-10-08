import React, { useState, useMemo, useEffect } from 'react';
import {
  BookOpen,
  Search,
  Clock,
  Calendar,
  User,
  ArrowLeft,
  ArrowRight,
  Share2,
  Check,
  Tag,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  ExternalLink,
  Layers,
  ShieldCheck,
  Radio,
  Zap,
  Quote,
  Copy,
  Table as TableIcon,
  HelpCircle,
  FileCheck,
  Award,
  Flame,
  CheckCircle2,
} from 'lucide-react';
import { Language } from '../utils/translations';
import { BLOG_POSTS, BlogPost } from '../data/blogPosts';
import { CheckCatchLogo } from './CheckCatchLogo';

interface BlogPageProps {
  lang: Language;
  onNavigateHome: () => void;
  initialPostSlug?: string | null;
  onSelectPostSlug?: (slug: string | null) => void;
  onShowToast?: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export const BlogPage: React.FC<BlogPageProps> = ({
  lang,
  onNavigateHome,
  initialPostSlug = null,
  onSelectPostSlug,
  onShowToast,
}) => {
  const isAr = lang === 'ar';
  const [selectedPostSlug, setSelectedPostSlug] = useState<string | null>(initialPostSlug);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCitation, setCopiedCitation] = useState(false);

  // Sync slug selection
  const handleSelectPost = (slug: string) => {
    setSelectedPostSlug(slug);
    if (onSelectPostSlug) {
      onSelectPostSlug(slug);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToList = () => {
    setSelectedPostSlug(null);
    if (onSelectPostSlug) {
      onSelectPostSlug(null);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Currently active article
  const currentPost = useMemo(() => {
    if (!selectedPostSlug) return null;
    return BLOG_POSTS.find((p) => p.slug === selectedPostSlug) || null;
  }, [selectedPostSlug]);

  // Dynamic Schema.org structured data and document meta tags for Blog / Article
  useEffect(() => {
    const existingScript = document.getElementById('dynamic-blog-structured-data');
    if (existingScript) {
      existingScript.remove();
    }

    const previousTitle = document.title;
    const metaDesc = document.querySelector('meta[name="description"]');
    const previousDesc = metaDesc ? metaDesc.getAttribute('content') : '';

    const script = document.createElement('script');
    script.id = 'dynamic-blog-structured-data';
    script.type = 'application/ld+json';

    if (currentPost) {
      // 1. Single Article View: Inject TechArticle + FAQPage + Breadcrumbs
      const postTitle = isAr ? currentPost.title.ar : currentPost.title.en;
      const postSummary = isAr ? currentPost.summary.ar : currentPost.summary.en;
      
      document.title = `${postTitle} | CheckCatch Blog`;
      if (metaDesc) {
        metaDesc.setAttribute('content', postSummary);
      }

      const articleSchema: Record<string, any> = {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'TechArticle',
            '@id': `https://checkcatch.com/blog/${currentPost.slug}#article`,
            'isPartOf': {
              '@type': 'Blog',
              '@id': 'https://checkcatch.com/blog#blog',
              'name': 'CheckCatch Domain Intelligence Blog',
              'url': 'https://checkcatch.com/blog',
            },
            'headline': postTitle,
            'description': postSummary,
            'inLanguage': isAr ? 'ar' : 'en',
            'mainEntityOfPage': `https://checkcatch.com/blog/${currentPost.slug}`,
            'datePublished': currentPost.publishedDate,
            'dateModified': '2026-10-07',
            'author': {
              '@type': 'Person',
              'name': currentPost.author,
              'jobTitle': isAr ? currentPost.authorTitle.ar : currentPost.authorTitle.en,
              'worksFor': {
                '@type': 'Organization',
                'name': 'CheckCatch Research Lab',
                'url': 'https://checkcatch.com',
              },
            },
            'publisher': {
              '@type': 'Organization',
              'name': 'CheckCatch',
              'url': 'https://checkcatch.com',
              'logo': 'https://checkcatch.com/logo.svg',
              'sameAs': [
                'https://twitter.com/CheckCatch',
                'https://www.linkedin.com/company/checkcatch',
                'https://www.crunchbase.com/organization/checkcatch',
                'https://github.com/checkcatch',
                'https://www.producthunt.com/products/checkcatch',
                'https://www.reddit.com/r/domains/',
              ],
            },
            'keywords': currentPost.tags.join(', '),
            'about': [
              {
                '@type': 'Thing',
                'name': 'Domain Name Valuation',
                'sameAs': 'https://en.wikipedia.org/wiki/Domain_name_valuation',
              },
              {
                '@type': 'Thing',
                'name': 'Domain Dropcatching',
                'sameAs': 'https://en.wikipedia.org/wiki/Domain_drop_shepherding',
              },
            ],
          },
          {
            '@type': 'FAQPage',
            '@id': `https://checkcatch.com/blog/${currentPost.slug}#faq`,
            'mainEntity': [
              {
                '@type': 'Question',
                'name': postTitle,
                'acceptedAnswer': {
                  '@type': 'Answer',
                  'text': isAr ? currentPost.directAnswer.ar : currentPost.directAnswer.en,
                },
              },
            ],
          },
          {
            '@type': 'BreadcrumbList',
            '@id': `https://checkcatch.com/blog/${currentPost.slug}#breadcrumb`,
            'itemListElement': [
              {
                '@type': 'ListItem',
                'position': 1,
                'name': 'Home',
                'item': 'https://checkcatch.com/',
              },
              {
                '@type': 'ListItem',
                'position': 2,
                'name': 'Blog',
                'item': 'https://checkcatch.com/blog',
              },
              {
                '@type': 'ListItem',
                'position': 3,
                'name': postTitle,
                'item': `https://checkcatch.com/blog/${currentPost.slug}`,
              },
            ],
          },
        ],
      };

      // Add HowTo schema if it's the dropcatch guide
      if (currentPost.slug === 'how-to-dropcatch-expired-domains-guide') {
        articleSchema['@graph'].push({
          '@type': 'HowTo',
          '@id': `https://checkcatch.com/blog/${currentPost.slug}#howto`,
          'name': isAr ? 'كيف تصطاد الدومينات الساقطة المنتهية خطوة بخطوة' : 'How to Dropcatch Expired High-Value Domains Step-by-Step',
          'description': isAr
            ? 'خطوات عملية لحجز طلبات القنص المسبقة واقتناص الدومينات الثنائية فور إسقاطها من السجل.'
            : 'Actionable step-by-step institutional guide on backordering and catching expiring two-word domains.',
          'step': [
            {
              '@type': 'HowToStep',
              'position': 1,
              'name': isAr ? 'فلترة كتالوج الحذف المعلق (Pending Delete)' : 'Filter Pending Delete Catalog',
              'text': isAr
                ? 'استيراد جدول المزادات وعزل النطاقات في أيام الحذف الخمسة الأخيرة.'
                : 'Import auction catalog and isolate names in their final 5-day registry lock.',
            },
            {
              '@type': 'HowToStep',
              'position': 2,
              'name': isAr ? 'فحص الكلمتين واختبار الراديو' : 'Run 2-Word & Radio Test Audit',
              'text': isAr
                ? 'فحص الاسم مقابل 275 ألف جذر واستبعاد العشوائيات والحروف المتشابهة صوتاً.'
                : 'Screen against 275k dictionary roots and eliminate homophone collisions.',
            },
            {
              '@type': 'HowToStep',
              'position': 3,
              'name': isAr ? 'وضع طلبات القنص المسبقة (Backorders)' : 'Place Multi-Catcher Backorders',
              'text': isAr
                ? 'حجز طلبات القنص عبر شبكات DropCatch و SnapNames و Catched.'
                : 'Place simultaneous backorders across DropCatch, SnapNames, and Catched networks.',
            },
          ],
        });
      }

      script.text = JSON.stringify(articleSchema);
      document.head.appendChild(script);
    } else {
      // 2. Blog Directory / List View: Inject Blog + CollectionPage
      const blogTitle = isAr
        ? 'مدونة CheckCatch لتقييم وقنص الدومينات | أدلة ومؤشرات 2026'
        : 'CheckCatch Domain Intelligence Blog | Dropcatching & Valuation Guides';
      const blogDesc = isAr
        ? 'مقالات ودراسات حالة متقدمة بأسلوب الإجابة المباشرة (BLUF)، واختبار الراديو الصوتي، وقنص الدومينات الساقطة، واستثمار النطاقات الثنائية عالية السيولة.'
        : 'Authoritative research, empirical valuation benchmarks, and tactical guides on two-word domain dropcatching and phonetic radio testing.';

      document.title = blogTitle;
      if (metaDesc) {
        metaDesc.setAttribute('content', blogDesc);
      }

      const blogCollectionSchema = {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'Blog',
            '@id': 'https://checkcatch.com/blog#blog',
            'name': 'CheckCatch Domain Intelligence Blog',
            'url': 'https://checkcatch.com/blog',
            'description': blogDesc,
            'publisher': {
              '@type': 'Organization',
              'name': 'CheckCatch',
              'url': 'https://checkcatch.com',
              'logo': 'https://checkcatch.com/logo.svg',
            },
            'blogPost': BLOG_POSTS.map((post) => ({
              '@type': 'BlogPosting',
              'headline': isAr ? post.title.ar : post.title.en,
              'description': isAr ? post.summary.ar : post.summary.en,
              'url': `https://checkcatch.com/blog/${post.slug}`,
              'datePublished': post.publishedDate,
              'author': {
                '@type': 'Person',
                'name': post.author,
              },
            })),
          },
          {
            '@type': 'BreadcrumbList',
            '@id': 'https://checkcatch.com/blog#breadcrumb',
            'itemListElement': [
              {
                '@type': 'ListItem',
                'position': 1,
                'name': 'Home',
                'item': 'https://checkcatch.com/',
              },
              {
                '@type': 'ListItem',
                'position': 2,
                'name': 'Blog',
                'item': 'https://checkcatch.com/blog',
              },
            ],
          },
        ],
      };

      script.text = JSON.stringify(blogCollectionSchema);
      document.head.appendChild(script);
    }

    return () => {
      const el = document.getElementById('dynamic-blog-structured-data');
      if (el) el.remove();
      document.title = previousTitle;
      if (metaDesc && previousDesc) {
        metaDesc.setAttribute('content', previousDesc);
      }
    };
  }, [currentPost, isAr]);

  // Categories list
  const categories = useMemo(() => {
    const set = new Set<string>();
    BLOG_POSTS.forEach((p) => {
      set.add(isAr ? p.category.ar : p.category.en);
    });
    return ['ALL', ...Array.from(set)];
  }, [isAr]);

  // Filtered posts
  const filteredPosts = useMemo(() => {
    return BLOG_POSTS.filter((post) => {
      const cat = isAr ? post.category.ar : post.category.en;
      const matchesCat = selectedCategory === 'ALL' || cat === selectedCategory;

      const title = isAr ? post.title.ar : post.title.en;
      const summary = isAr ? post.summary.ar : post.summary.en;
      const tags = post.tags.join(' ');
      const query = searchQuery.trim().toLowerCase();

      const matchesSearch =
        !query ||
        title.toLowerCase().includes(query) ||
        summary.toLowerCase().includes(query) ||
        tags.toLowerCase().includes(query);

      return matchesCat && matchesSearch;
    });
  }, [selectedCategory, searchQuery, isAr]);

  const featuredPost = useMemo(() => {
    return BLOG_POSTS.find((p) => p.featured) || BLOG_POSTS[0];
  }, []);

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    if (onShowToast) {
      onShowToast(
        isAr ? 'تم نسخ رابط المقال إلى الحافظة بنجاح!' : 'Article link copied to clipboard!',
        'success'
      );
    }
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopyCitation = (citationText: string) => {
    navigator.clipboard.writeText(citationText);
    setCopiedCitation(true);
    if (onShowToast) {
      onShowToast(
        isAr ? 'تم نسخ المرجع والاقتباس الأكاديمي بنجاح!' : 'Citation reference copied to clipboard!',
        'success'
      );
    }
    setTimeout(() => setCopiedCitation(false), 2500);
  };

  // Helper to render markdown blocks including tables & BLUF callouts
  const renderMarkdownBlock = (paragraph: string, idx: number) => {
    const trimmed = paragraph.trim();

    // Table detection (Markdown table starting with |)
    if (trimmed.includes('|') && trimmed.split('\n').every((line) => line.trim().startsWith('|'))) {
      const lines = trimmed.split('\n').map((l) => l.trim()).filter(Boolean);
      if (lines.length >= 2) {
        const headerRow = lines[0]
          .split('|')
          .slice(1, -1)
          .map((c) => c.trim());
        const bodyRows = lines.slice(2).map((row) =>
          row
            .split('|')
            .slice(1, -1)
            .map((c) => c.trim())
        );

        return (
          <div key={idx} className="my-6 overflow-x-auto rounded-2xl border border-slate-200 shadow-xs bg-white">
            <table className="min-w-full divide-y divide-slate-200 text-xs sm:text-sm text-slate-800">
              <thead className="bg-slate-900 text-white">
                <tr>
                  {headerRow.map((th, hIdx) => (
                    <th
                      key={hIdx}
                      className="px-4 py-3.5 text-left rtl:text-right font-extrabold tracking-wide"
                    >
                      {th.replace(/\*\*/g, '')}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {bodyRows.map((row, rIdx) => (
                  <tr key={rIdx} className={rIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70 hover:bg-blue-50/40 transition-colors'}>
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="px-4 py-3.5 leading-relaxed whitespace-pre-wrap font-medium">
                        {cell.startsWith('`') && cell.endsWith('`') ? (
                          <code className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-900 font-mono text-xs font-bold border border-blue-200">
                            {cell.slice(1, -1)}
                          </code>
                        ) : cell.includes('**') ? (
                          <span>
                            {cell.split('**').map((seg, sIdx) =>
                              sIdx % 2 === 1 ? (
                                <strong key={sIdx} className="font-bold text-slate-950">
                                  {seg}
                                </strong>
                              ) : (
                                seg
                              )
                            )}
                          </span>
                        ) : (
                          cell
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
    }

    // Heading 3
    if (trimmed.startsWith('### ')) {
      return (
        <h3 key={idx} className="text-lg sm:text-xl font-extrabold text-slate-900 pt-5 pb-1 border-b border-slate-100 flex items-center gap-2">
          <span className="w-2 h-5 rounded-full bg-blue-600 shrink-0" />
          <span>{trimmed.replace('### ', '')}</span>
        </h3>
      );
    }

    // Heading 4
    if (trimmed.startsWith('#### ')) {
      return (
        <h4 key={idx} className="text-base font-bold text-slate-900 pt-3">
          {trimmed.replace('#### ', '')}
        </h4>
      );
    }

    // Horizontal Rule
    if (trimmed === '---') {
      return <hr key={idx} className="border-slate-200 my-6" />;
    }

    // Blockquote
    if (trimmed.startsWith('> ')) {
      return (
        <blockquote
          key={idx}
          className="p-4 my-4 rounded-xl bg-blue-50/90 border-l-4 rtl:border-l-0 rtl:border-r-4 border-blue-600 text-slate-900 font-medium leading-relaxed shadow-2xs"
        >
          {trimmed
            .split('\n')
            .map((line, lIdx) => (
              <p key={lIdx} className="my-1">
                {line.replace(/^>\s*/, '').replace(/\*([^*]+)\*/g, '$1')}
              </p>
            ))}
        </blockquote>
      );
    }

    // Unordered list items
    if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
      const items = trimmed.split('\n');
      return (
        <ul key={idx} className="space-y-2 my-3 pl-5 rtl:pl-0 rtl:pr-5 list-disc text-slate-800 font-normal">
          {items.map((it, i) => (
            <li key={i} className="leading-relaxed">
              {it.replace(/^[\*\-]\s*/, '')}
            </li>
          ))}
        </ul>
      );
    }

    // Numbered list items
    if (/^\d+\.\s/.test(trimmed)) {
      const items = trimmed.split('\n');
      return (
        <ol key={idx} className="space-y-2 my-3 pl-5 rtl:pl-0 rtl:pr-5 list-decimal text-slate-800 font-medium">
          {items.map((it, i) => (
            <li key={i} className="leading-relaxed">
              {it.replace(/^\d+\.\s*/, '')}
            </li>
          ))}
        </ol>
      );
    }

    // Standard Paragraph
    return (
      <p key={idx} className="leading-relaxed text-slate-700">
        {trimmed}
      </p>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Blog Top Header Bar */}
      <nav className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onNavigateHome}
              className="flex items-center gap-2 group cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-50 to-blue-50 border border-teal-200 p-1 flex items-center justify-center shadow-xs group-hover:border-blue-400 transition-all">
                <CheckCatchLogo className="w-full h-full" />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-bold tracking-tight text-slate-900 font-sans">
                  CheckCatch
                </span>
                <span className="font-mono text-xs font-bold text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200">
                  /blog
                </span>
              </div>
            </button>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={onNavigateHome}
              className="min-h-[40px] px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>{isAr ? 'العودة لمحرك الفحص والتقييم' : 'Open Domain Engine'}</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {currentPost ? (
          /* ========================================================================= */
          /* ARTICLE DETAIL VIEW                                                      */
          /* ========================================================================= */
          <article className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
            {/* Breadcrumb & Navigation */}
            <div className="flex items-center justify-between flex-wrap gap-3 pb-4 border-b border-slate-200">
              <button
                type="button"
                onClick={handleBackToList}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-blue-600 transition-colors cursor-pointer"
              >
                {isAr ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
                <span>{isAr ? 'العودة لجميع المقالات' : 'Back to All Articles'}</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleCopyCitation(isAr ? currentPost.citationString.ar : currentPost.citationString.en)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-50 border border-blue-200 hover:bg-blue-100 text-blue-800 shadow-xs transition-colors cursor-pointer"
                >
                  {copiedCitation ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Quote className="w-3.5 h-3.5 text-blue-600" />}
                  <span>{copiedCitation ? (isAr ? 'تم نسخ المرجع!' : 'Citation Copied!') : isAr ? 'اقتباس واستشهاد (AI / Cite)' : 'Cite Reference'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleShare}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 shadow-xs transition-colors cursor-pointer"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5 text-slate-500" />}
                  <span>{copiedLink ? (isAr ? 'تم النسخ!' : 'Copied!') : isAr ? 'مشاركة المقال' : 'Share Article'}</span>
                </button>
              </div>
            </div>

            {/* Article Header */}
            <header className="space-y-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  {isAr ? currentPost.category.ar : currentPost.category.en}
                </span>
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{currentPost.readTime}</span>
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{currentPost.publishedDate}</span>
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight">
                {isAr ? currentPost.title.ar : currentPost.title.en}
              </h1>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-medium">
                {isAr ? currentPost.summary.ar : currentPost.summary.en}
              </p>

              {/* BLUF (Bottom Line Up Front) Box */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-50 via-teal-50 to-emerald-50 border border-blue-200/90 shadow-xs space-y-2">
                <div className="flex items-center gap-2 text-xs font-extrabold text-blue-900">
                  <Sparkles className="w-4 h-4 text-blue-600 animate-pulse" />
                  <span>{isAr ? 'خلاصة القول أولاً (BLUF - Bottom Line Up Front):' : 'BLUF (Bottom Line Up Front) Summary:'}</span>
                </div>
                <p className="text-xs sm:text-sm font-bold text-slate-900 leading-relaxed">
                  {isAr ? currentPost.directAnswer.ar : currentPost.directAnswer.en}
                </p>
              </div>

              {/* Author & Lab Credential Row */}
              <div className="flex items-center gap-3 pt-2 text-xs text-slate-600 border-t border-slate-100">
                <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center font-mono text-sm shadow-2xs">
                  CC
                </div>
                <div>
                  <div className="font-bold text-slate-900">{currentPost.author}</div>
                  <div className="text-[11px] text-slate-500">
                    {isAr ? currentPost.authorTitle.ar : currentPost.authorTitle.en}
                  </div>
                </div>
              </div>
            </header>

            {/* Expert Quote Card (if available) */}
            {currentPost.expertQuote && (
              <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950 text-white shadow-md space-y-3 relative overflow-hidden">
                <div className="flex items-start gap-3">
                  <Quote className="w-6 h-6 text-blue-400 shrink-0 mt-1 opacity-90" />
                  <div className="space-y-2">
                    <p className="text-sm sm:text-base font-semibold text-blue-50 italic leading-relaxed">
                      "{isAr ? currentPost.expertQuote.quote.ar : currentPost.expertQuote.quote.en}"
                    </p>
                    <div className="pt-2 border-t border-white/10">
                      <span className="font-bold text-xs text-white block">
                        {currentPost.expertQuote.author}
                      </span>
                      <span className="text-[11px] text-blue-300 block">
                        {isAr ? currentPost.expertQuote.title.ar : currentPost.expertQuote.title.en}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Article Body Content with BLUF subheadings and tables */}
            <div className="prose prose-slate max-w-none bg-white p-6 sm:p-10 rounded-2xl border border-slate-200 shadow-xs space-y-6 text-slate-800 leading-relaxed text-sm sm:text-base">
              {(isAr ? currentPost.content.ar : currentPost.content.en)
                .trim()
                .split('\n\n')
                .map((paragraph, idx) => renderMarkdownBlock(paragraph, idx))}
            </div>

            {/* Academic & AI Citation Reference Box */}
            <div className="p-5 rounded-2xl bg-slate-100 border border-slate-300 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                  <FileCheck className="w-4 h-4 text-slate-600" />
                  <span>{isAr ? 'توثيق المرجع واقتباس الدراسة (Citation):' : 'Cite this Research Study / Academic Reference:'}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyCitation(isAr ? currentPost.citationString.ar : currentPost.citationString.en)}
                  className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedCitation ? (isAr ? 'تم النسخ!' : 'Copied!') : isAr ? 'نسخ النص' : 'Copy'}</span>
                </button>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200 font-mono text-xs text-slate-800 break-all select-all">
                {isAr ? currentPost.citationString.ar : currentPost.citationString.en}
              </div>
            </div>

            {/* Article Tags */}
            <div className="flex items-center gap-2 flex-wrap pt-2">
              <span className="text-xs font-bold text-slate-500">{isAr ? 'الوسوم:' : 'Tags:'}</span>
              {currentPost.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700"
                >
                  #{tag}
                </span>
              ))}
            </div>

            {/* Call To Action Box */}
            <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-blue-900 to-indigo-900 text-white shadow-xl space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-white/15 text-blue-200">
                <Sparkles className="w-3.5 h-3.5 text-blue-300" />
                <span>{isAr ? 'جرب المحرك الآن' : 'Test Your Domains Free'}</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black">
                {isAr
                  ? 'طبق المعايير فوراً على قوائم النطاقات الخاصة بك!'
                  : 'Screen Expiring & Dropcatch Domains with AI Rules'}
              </h3>
              <p className="text-xs sm:text-sm text-blue-100 max-w-xl leading-relaxed">
                {isAr
                  ? 'ارفع جداول بيانات المزادات (.xlsx أو .csv) وافحص النطاقات ضد 275 ألف جذر لغوي واختبار الراديو الصوتي في ثوانٍ.'
                  : 'Import bulk auction files (.xlsx or .csv) to isolate genuine 2-word candidates and avoid gibberish consonant traps instantly.'}
              </p>
              <button
                type="button"
                onClick={onNavigateHome}
                className="min-h-[46px] px-6 py-2.5 rounded-xl font-black text-sm bg-white text-blue-950 hover:bg-blue-50 transition-all shadow-md inline-flex items-center gap-2 cursor-pointer"
              >
                <span>{isAr ? 'فتح محرك الفحص والتقييم' : 'Launch Domain Engine'}</span>
                {isAr ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              </button>
            </div>

            {/* Related Articles List */}
            <div className="pt-8 border-t border-slate-200 space-y-4">
              <h3 className="text-lg font-bold text-slate-900">
                {isAr ? 'مقالات موصى بها في تجارة النطاقات' : 'Related Domain Investment Guides'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {BLOG_POSTS.filter((p) => p.slug !== currentPost.slug)
                  .slice(0, 2)
                  .map((rel) => (
                    <div
                      key={rel.id}
                      onClick={() => handleSelectPost(rel.slug)}
                      className="p-4 rounded-xl bg-white border border-slate-200 hover:border-blue-400 hover:shadow-xs transition-all cursor-pointer space-y-2"
                    >
                      <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                        {isAr ? rel.category.ar : rel.category.en}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900 line-clamp-2">
                        {isAr ? rel.title.ar : rel.title.en}
                      </h4>
                      <p className="text-[11px] text-slate-500 line-clamp-2">
                        {isAr ? rel.summary.ar : rel.summary.en}
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          </article>
        ) : (
          /* ========================================================================= */
          /* BLOG DIRECTORY / LIST VIEW                                               */
          /* ========================================================================= */
          <div className="space-y-10 animate-fadeIn">
            {/* Hero Section */}
            <div className="text-center max-w-3xl mx-auto space-y-4 pt-4">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200">
                <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                <span>
                  {isAr ? 'مركز أخبار ومقالات الدومينات | CheckCatch Intelligence' : 'CheckCatch Domain Intelligence & News Hub'}
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
                {isAr
                  ? 'آخر أخبار ومستجدات الدومينات وأدلة التقييم'
                  : 'Domain Market News, Trends & Valuation Guides'}
              </h1>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-medium">
                {isAr
                  ? 'تغطية شاملة لأحدث صفقات النطاقات المليونية، ونمو نطاقات الذكاء الاصطناعي (.ai)، وتحديثات أسعار Verisign وهيئة ICANN، مع أدلة صياغة النطاقات الثنائية وقنص الدومينات الساقطة بأسلوب الإجابة المباشرة (BLUF).'
                  : 'Comprehensive coverage of record .ai acquisitions, Verisign wholesale price trajectory, ICANN Next Round updates, two-word brandable formulas, and institutional dropcatch playbooks.'}
              </p>

              {/* Breaking Domain News Ticker */}
              <div className="max-w-4xl mx-auto pt-1">
                <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-50 via-orange-50 to-blue-50 border border-amber-200/90 shadow-2xs flex items-center justify-between flex-wrap gap-2 text-xs">
                  <div className="flex items-center gap-2 font-bold text-amber-900">
                    <span className="flex h-2.5 w-2.5 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-600"></span>
                    </span>
                    <Flame className="w-4 h-4 text-amber-600" />
                    <span>{isAr ? 'شريط آخر المستجدات:' : 'Market Wire:'}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => handleSelectPost('domain-market-news-ai-sales-verisign-price-updates-2026')}
                      className="px-2.5 py-1 rounded-lg bg-white border border-amber-200 hover:border-amber-400 font-semibold text-slate-800 text-[11px] hover:text-blue-700 transition-colors cursor-pointer"
                    >
                      {isAr ? '🔥 صفقات قياسية في نطاقات .ai وتحديثات Verisign' : '🔥 Record .ai Acquisitions & Verisign .com Caps'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectPost('ai-domains-investment-valuation-trends-guide')}
                      className="px-2.5 py-1 rounded-lg bg-white border border-amber-200 hover:border-amber-400 font-semibold text-slate-800 text-[11px] hover:text-blue-700 transition-colors cursor-pointer"
                    >
                      {isAr ? '📈 تحليل إيرادات سجل أنغويلا ونطاقات AI' : '📈 Anguilla .ai Registry Revenue Surges Past $35M'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectPost('icann-next-round-new-gtlds-timeline-domainers-impact')}
                      className="px-2.5 py-1 rounded-lg bg-white border border-amber-200 hover:border-amber-400 font-semibold text-slate-800 text-[11px] hover:text-blue-700 transition-colors cursor-pointer hidden sm:inline-block"
                    >
                      {isAr ? '🌐 مستجدات جولة ICANN القادمة للنطاقات الجديدة' : '🌐 ICANN Next Round Applicant Guidebook Milestones'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Search Bar */}
              <div className="max-w-xl mx-auto pt-2">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 rtl:left-auto rtl:right-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={
                      isAr
                        ? 'ابحث في مواضيع القنص، اختبار الراديو، التقييم، أو القاموس...'
                        : 'Search dropcatching, radio test, valuation, or trademark articles...'
                    }
                    className="w-full pl-10 pr-4 rtl:pl-4 rtl:pr-10 py-3 rounded-xl bg-white border border-slate-300 text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 rtl:right-auto rtl:left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center justify-center gap-1.5 sm:gap-2 flex-wrap">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200'
                  }`}
                >
                  {cat === 'ALL' ? (isAr ? 'جميع المواضيع (ALL)' : 'All Topics') : cat}
                </button>
              ))}
            </div>

            {/* Featured Post Hero Banner */}
            {!searchQuery && selectedCategory === 'ALL' && featuredPost && (
              <div
                onClick={() => handleSelectPost(featuredPost.slug)}
                className="p-6 sm:p-8 md:p-10 rounded-3xl bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 text-white shadow-xl hover:shadow-2xl transition-all cursor-pointer relative overflow-hidden group border border-slate-800"
              >
                <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none group-hover:scale-105 transition-transform">
                  <Radio className="w-64 h-64 text-white" />
                </div>
                <div className="relative z-10 max-w-3xl space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                    <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                    <span>{isAr ? 'المقال المميز' : 'Featured Guide'}</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-black leading-tight text-white group-hover:text-blue-200 transition-colors">
                    {isAr ? featuredPost.title.ar : featuredPost.title.en}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
                    {isAr ? featuredPost.summary.ar : featuredPost.summary.en}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-slate-400 pt-2">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{featuredPost.readTime}</span>
                    </span>
                    <span>•</span>
                    <span>{featuredPost.publishedDate}</span>
                    <span>•</span>
                    <span className="text-blue-300 font-bold group-hover:underline flex items-center gap-1">
                      <span>{isAr ? 'اقرأ الدليل كاملاً' : 'Read Full Guide'}</span>
                      {isAr ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Articles Grid */}
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  {isAr ? `المقالات المتاحة (${filteredPosts.length})` : `Published Articles (${filteredPosts.length})`}
                </h2>
                {searchQuery && (
                  <span className="text-xs text-slate-500">
                    {isAr ? `نتائج البحث عن "${searchQuery}"` : `Results for "${searchQuery}"`}
                  </span>
                )}
              </div>

              {filteredPosts.length === 0 ? (
                <div className="py-16 text-center rounded-2xl bg-white border border-slate-200 p-8">
                  <Search className="w-10 h-10 text-slate-400 mx-auto mb-3 stroke-1" />
                  <p className="text-sm font-bold text-slate-800">
                    {isAr ? 'لم يتم العثور على مقالات مطابقة' : 'No articles match your search'}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {isAr ? 'جرب البحث بكلمات أخرى أو اختر جميع المواضيع.' : 'Try adjusting your search query or reset category filter.'}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('ALL');
                    }}
                    className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors cursor-pointer"
                  >
                    {isAr ? 'إعادة ضبط البحث' : 'Reset Search'}
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredPosts.map((post) => (
                    <article
                      key={post.id}
                      onClick={() => handleSelectPost(post.slug)}
                      className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group space-y-4"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 ${
                              post.category.en === 'Market News & Trends'
                                ? 'bg-amber-50 text-amber-900 border-amber-300'
                                : post.category.en === 'AI & Tech Domains'
                                ? 'bg-purple-50 text-purple-900 border-purple-300'
                                : post.category.en === 'Sales Reports & Liquidity'
                                ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                                : post.category.en === 'Domain Naming & Brand Strategy'
                                ? 'bg-indigo-50 text-indigo-900 border-indigo-300'
                                : 'bg-blue-50 text-blue-800 border-blue-200'
                            }`}
                          >
                            {post.category.en === 'Market News & Trends' ? (
                              <Flame className="w-3 h-3 text-amber-600" />
                            ) : post.category.en === 'AI & Tech Domains' ? (
                              <Sparkles className="w-3 h-3 text-purple-600" />
                            ) : null}
                            <span>{isAr ? post.category.ar : post.category.en}</span>
                          </span>
                          <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                            <Clock className="w-3 h-3" />
                            <span>{post.readTime}</span>
                          </span>
                        </div>

                        <h3 className="text-sm sm:text-base font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                          {isAr ? post.title.ar : post.title.en}
                        </h3>

                        <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                          {isAr ? post.summary.ar : post.summary.en}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                        <span className="text-[11px] font-medium">{post.publishedDate}</span>
                        <span className="font-bold text-blue-600 group-hover:underline flex items-center gap-1 text-[11px]">
                          <span>{isAr ? 'قراءة المقال' : 'Read Article'}</span>
                          {isAr ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                        </span>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
