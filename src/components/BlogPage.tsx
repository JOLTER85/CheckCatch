import React, { useState, useMemo } from 'react';
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

              <button
                type="button"
                onClick={handleShare}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 shadow-xs transition-colors cursor-pointer"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5 text-slate-500" />}
                <span>{copiedLink ? (isAr ? 'تم النسخ!' : 'Copied!') : isAr ? 'مشاركة المقال' : 'Share Article'}</span>
              </button>
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

              <div className="flex items-center gap-3 pt-2 text-xs text-slate-600 border-t border-slate-100">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center font-mono">
                  CC
                </div>
                <div>
                  <div className="font-bold text-slate-900">{currentPost.author}</div>
                  <div className="text-[11px] text-slate-500">
                    {isAr ? 'فريق أبحاث وتقييم النطاقات في CheckCatch' : 'Domain Research & Valuation Unit'}
                  </div>
                </div>
              </div>
            </header>

            {/* Article Body Content */}
            <div className="prose prose-slate max-w-none bg-white p-6 sm:p-10 rounded-2xl border border-slate-200 shadow-xs space-y-6 text-slate-800 leading-relaxed text-sm sm:text-base">
              {(isAr ? currentPost.content.ar : currentPost.content.en)
                .trim()
                .split('\n\n')
                .map((paragraph, idx) => {
                  const trimmed = paragraph.trim();

                  // Heading 3
                  if (trimmed.startsWith('### ')) {
                    return (
                      <h3 key={idx} className="text-lg sm:text-xl font-extrabold text-slate-900 pt-4 pb-1 border-b border-slate-100 flex items-center gap-2">
                        <span className="w-1.5 h-5 rounded-full bg-blue-600 shrink-0" />
                        <span>{trimmed.replace('### ', '')}</span>
                      </h3>
                    );
                  }

                  // Heading 4
                  if (trimmed.startsWith('#### ')) {
                    return (
                      <h4 key={idx} className="text-base font-bold text-slate-900 pt-2">
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
                        className="p-4 my-4 rounded-xl bg-blue-50/70 border-l-4 rtl:border-l-0 rtl:border-r-4 border-blue-600 text-slate-800 italic font-medium"
                      >
                        {trimmed.replace(/^>\s*/, '').replace(/\*([^*]+)\*/g, '$1')}
                      </blockquote>
                    );
                  }

                  // Unordered list items
                  if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
                    const items = trimmed.split('\n');
                    return (
                      <ul key={idx} className="space-y-2 my-3 pl-5 rtl:pl-0 rtl:pr-5 list-disc text-slate-700">
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
                      <ol key={idx} className="space-y-2 my-3 pl-5 rtl:pl-0 rtl:pr-5 list-decimal text-slate-700">
                        {items.map((it, i) => (
                          <li key={i} className="leading-relaxed font-medium">
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
                })}
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

            {/* Related Articles Carousel / List */}
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
                  {isAr ? 'مدونة CheckCatch للمحترفين' : 'CheckCatch Domain Intelligence Blog'}
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
                {isAr
                  ? 'أسرار واستراتيجيات قنص وتقييم النطاقات'
                  : 'Domain Dropcatching & Valuation Playbooks'}
              </h1>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-medium">
                {isAr
                  ? 'مقالات ودراسات حالة متقدمة حول اختبار الراديو، اقتناص الدومينات الساقطة (Dropped & Pending Delete)، واستثمار النطاقات الثنائية عالية السيولة.'
                  : 'In-depth research and tactical guides on phonetic radio tests, bulk auction screening, dropcatch timing, and institutional domain appraisals.'}
              </p>

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

            {/* Featured Post Hero Banner (when no search query active) */}
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
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                            {isAr ? post.category.ar : post.category.en}
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
