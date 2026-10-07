import React, { useState } from 'react';
import {
  HelpCircle,
  ChevronDown,
  BookOpen,
  Sparkles,
  ShieldCheck,
  Radio,
  Layers,
  TrendingUp,
} from 'lucide-react';
import { Language } from '../utils/translations';

interface SeoFaqSectionProps {
  lang: Language;
}

export const SeoFaqSection: React.FC<SeoFaqSectionProps> = ({ lang }) => {
  const isAr = lang === 'ar';
  const isFr = lang === 'fr';
  const isEs = lang === 'es';

  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const content = {
    badge: isAr
      ? 'دليل الخبراء والمعايير القياسية'
      : isFr
      ? 'Guide Expert & Normes Industrielles'
      : isEs
      ? 'Guía de Expertos y Estándares'
      : 'Expert Guide & Industry Standards',
    title: isAr
      ? 'الدليل الشامل لتقييم النطاقات الثنائية واختبار الراديو'
      : isFr
      ? 'Guide Complet de Vérification des Domaines à 2 Mots & Test Radio'
      : isEs
      ? 'Guía Completa de Verificación de Dominios de 2 Palabras y Radio Test'
      : 'Complete Guide to Two-Word Domain Verification & Valuation',
    subtitle: isAr
      ? 'كل ما تحتاج لمعرفته حول اصطياد النطاقات البراند، تفكيك الكلمات الإنجليزية، واكتشاف القيمة السوقية الحقيقية.'
      : isFr
      ? 'Tout ce que vous devez savoir pour attraper les domaines de marque, décomposer les mots anglais et évaluer leur valeur.'
      : isEs
      ? 'Todo lo que necesita saber para capturar dominios de marca, descomponer raíces en inglés y estimar su valor real.'
      : 'Everything you need to know about dropcatching brandable domains, dictionary decomposition, and calculating realistic wholesale vs. retail valuations.',
    pillars: [
      {
        icon: Radio,
        title: isAr ? 'اختبار الراديو الصوتي (Radio Test)' : 'The Phonetic Radio Test',
        desc: isAr
          ? 'المعيار الذهبي في تسويق النطاقات؛ يقيس مدى سهولة كتابة الدومين فور سماعه في حديث شفهي دون الحاجة لتهجئته أو توضيح حروفه.'
          : 'The gold standard of brandability; verifies that a listener can instantly and accurately type the domain upon hearing it spoken aloud without spelling confusion.',
      },
      {
        icon: Layers,
        title: isAr ? 'التفكيك القاموسي الدقيق (275K+ Words)' : 'Certified Dictionary Decomposition',
        desc: isAr
          ? 'فحص شامل يعتمد على قاموس معتمد يضم أكثر من 275 ألف جذر لغوي للتأكد من أن الدومين يتألف من كلمتين حقيقيتين واستبعاد الحروف العشوائية (Gibberish).'
          : 'Scans against a verified 275k+ English master dictionary to confirm true two-word compounds while rigorously filtering consonant typos and gibberish strings.',
      },
      {
        icon: TrendingUp,
        title: isAr ? 'التقييم المؤسسي المزدوج (Wholesale vs Retail)' : 'Institutional Dual-Tier Valuation',
        desc: isAr
          ? 'فصل دقيق بين السعر التجاري السريع بين المستثمرين (Wholesale Liquidity) وقيمة البيع النهائي للشركات والمشاريع الريادية (Retail End-User Value).'
          : 'Calculates both immediate wholesale marketplace liquidity for domain dropcatchers and fair market retail acquisition value for funded venture startups.',
      },
    ],
    faqHeading: isAr
      ? 'الأسئلة الشائعة حول تقييم واصطياد الدومينات'
      : isFr
      ? 'Foire Aux Questions sur l\'Évaluation de Domaines'
      : isEs
      ? 'Preguntas Frecuentes sobre la Valoración de Dominios'
      : 'Frequently Asked Questions on Domain Valuation & Verification',
    faqs: [
      {
        q: isAr
          ? 'كيف يتعرف محرك CheckCatch على الكلمات العشوائية (Gibberish)؟'
          : 'How does CheckCatch algorithmically screen out gibberish and junk letters?',
        a: isAr
          ? 'يستخدم المحرك خوارزمية لغوية صارمة تفحص تكرار الحروف الساكنة وصعوبة النطق، وفي حال اكتشاف نص عشوائي أو أحرف متتالية غير مألوفة، يتم تخفيض درجة الاستثمار تلقائياً إلى 0/5 ونسبة البراند إلى 0% وتصنيفه كدومين مهمل (Junk).'
          : 'CheckCatch runs algorithmic linguistic heuristics detecting unnatural consonant density, unpronounceable tri-clusters, and keyboard mash sequences. If detected, the domain is automatically tagged Junk with 0/5 investment score and 0% brand quality.',
      },
      {
        q: isAr
          ? 'ما هو اختبار الراديو (Radio Test) ولماذا يرفع قيمة الدومين؟'
          : 'What is the Radio Test and why does it drastically elevate domain value?',
        a: isAr
          ? 'اختبار الراديو يقيس قابلية نطق وتذكر الدومين بسهولة بالغة. الدومين الذي يجتاز اختبار الراديو لا يحتوي على حروف صامتة ملتبسة أو تهجئات مزدوجة، مما يجعله مثالياً للإعلانات الشفهية، التوصيات الصوتية، والمحادثات التسويقية المباشرة.'
          : 'The Radio Test measures phonetic clarity and mnemonic retention. Domains passing the Radio Test contain no ambiguous homophones or awkward double-letters, making them frictionless for podcasts, radio ads, and direct word-of-mouth referral.',
      },
      {
        q: isAr
          ? 'ما الفرق بين أنواع القوائم: Dropped و Private Seller و Pending Delete و Pre-Release؟'
          : 'What do listing types like Dropped, Private Seller, Pending Delete, and Pre-Release mean?',
        a: isAr
          ? 'دومينات Dropped هي نطاقات انتهت صلاحيتها وأصبحت متاحة للتسجيل المباشر؛ Private Seller هي نطاقات معروضة للبيع من قبل مالك خاص؛ Pending Delete هي نطاقات في مرحلة الحذف النهائي لدى مسجل النطاقات ويمكن اصطيادها قريباً؛ أما Pre-Release فهي مطروحة في مزادات تجديد مبكرة.'
          : 'Dropped domains have completed the expiration cycle and are available for immediate catch; Private Seller domains are listed by independent portfolio holders; Pending Delete domains are in the registry deletion phase ready for dropcatching; and Pre-Release domains are available in early auction renewals.',
      },
      {
        q: isAr
          ? 'لماذا تفضل الشركات والمستثمرون نطاقات .com المكونة من كلمتين؟'
          : 'Why do funded startups and enterprises prioritize two-word .com domains?',
        a: isAr
          ? 'الدومينات المكونة من كلمتين تمثل التوازن الأمثل بين الوضوح الدلالي، السعر المعقول مقارنة بالكلمة الواحدة، والقدرة العالية على بناء هوية تجارية قوية وموثوقة لدى العملاء والمستثمرين حول العالم.'
          : 'Two-word .com domains represent the sweet spot in digital branding: combining unambiguous categorical authority, superior memorability, and institutional credibility at an acquisition price far more attainable than ultra-rare single dictionary words.',
      },
      {
        q: isAr
          ? 'كيف يدعم محرك CheckCatch الفحص المجمع لملفات الإكسل وجداول النطاقات؟'
          : 'How does CheckCatch spreadsheet batch analysis isolate qualified candidates?',
        a: isAr
          ? 'يمكنك رفع أي ملف بصيغة Excel أو CSV يحتوي على آلاف النطاقات، حيث يقوم المحرك باستخراج الأعمدة وفحص تاريخ الانتهاء ونوع القائمة وتطبيق القاموس المعتمد لاستبعاد الشرطات والأرقام والنطاقات غير المؤهلة فورياً.'
          : 'You can upload large Excel (.xlsx) or CSV files containing thousands of portfolio records. CheckCatch automatically detects domain columns, expiration dates, and listing types, verifying candidates against strict 2-word rules in real time.',
      },
    ],
  };

  return (
    <section
      id="domain-seo-guide-section"
      aria-label="Domain Valuation Guide & FAQs"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-slate-200 mt-8"
    >
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-10 space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200">
          <BookOpen className="w-3.5 h-3.5 text-blue-600" />
          <span>{content.badge}</span>
        </div>
        <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
          {content.title}
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
          {content.subtitle}
        </p>
      </div>

      {/* 3 Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">
        {content.pillars.map((pillar, idx) => {
          const Icon = pillar.icon;
          return (
            <article
              key={idx}
              className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-blue-200 transition-colors space-y-3"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 flex items-center justify-center text-blue-700">
                <Icon className="w-5 h-5 stroke-[2.2]" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                {pillar.title}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {pillar.desc}
              </p>
            </article>
          );
        })}
      </div>

      {/* SEO FAQ Section */}
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-200">
          <HelpCircle className="w-5 h-5 text-blue-600" />
          <h3 className="text-base sm:text-lg font-bold text-slate-900">
            {content.faqHeading}
          </h3>
        </div>

        <div className="space-y-3">
          {content.faqs.map((faq, index) => {
            const isOpen = openFaqIndex === index;
            return (
              <div
                key={index}
                className="rounded-xl border border-slate-200 bg-white overflow-hidden transition-all duration-200 shadow-xs"
              >
                <button
                  type="button"
                  id={`seo-faq-btn-${index}`}
                  aria-expanded={isOpen}
                  onClick={() => toggleFaq(index)}
                  className="w-full p-4 text-left rtl:text-right flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-slate-800 hover:text-blue-700 transition-colors cursor-pointer"
                >
                  <span className="flex-1">{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-500 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-blue-600' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div
                    id={`seo-faq-answer-${index}`}
                    className="px-4 pb-4 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/50"
                  >
                    <p>{faq.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
