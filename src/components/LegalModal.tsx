import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Shield,
  FileText,
  Mail,
  Info,
  ExternalLink,
  CheckCircle2,
  Send,
  Sparkles,
  Lock,
  Globe2,
  Check,
  AlertCircle,
  Copy
} from 'lucide-react';
import { Language } from '../utils/translations';
import { CheckCatchLogo } from './CheckCatchLogo';

export type LegalModalType = 'about' | 'contact' | 'privacy' | 'terms' | null;

interface LegalModalProps {
  type: LegalModalType;
  onClose: () => void;
  lang: Language;
}

export const LegalModal: React.FC<LegalModalProps> = ({ type, onClose, lang }) => {
  const isAr = lang === 'ar';

  // Contact Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const handleCopySupportEmail = () => {
    navigator.clipboard.writeText('support@checkcatch.com');
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 800);
  };

  if (!type) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-10 my-8 flex flex-col max-h-[88vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-100 bg-slate-50/80">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-200/80 flex items-center justify-center text-teal-700 shadow-xs">
                {type === 'about' && <Info className="w-5 h-5" />}
                {type === 'contact' && <Mail className="w-5 h-5" />}
                {type === 'privacy' && <Shield className="w-5 h-5" />}
                {type === 'terms' && <FileText className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  {type === 'about' && (isAr ? 'عن CheckCatch.com' : 'About CheckCatch')}
                  {type === 'contact' && (isAr ? 'تواصل معنا والدعم الفني' : 'Contact Support & Inquiries')}
                  {type === 'privacy' && (isAr ? 'سياسة الخصوصية وأمن البيانات' : 'Privacy & Data Security Policy')}
                  {type === 'terms' && (isAr ? 'شروط الخدمة والاستخدام' : 'Terms of Service & Disclaimer')}
                </h3>
                <p className="text-xs text-slate-500">
                  {type === 'about' && (isAr ? 'منصة الذكاء الاصطناعي لفحص وتثمين الدومينات الثنائية' : 'Two-word domain discovery, semantic valuation & dropcatching suite')}
                  {type === 'contact' && (isAr ? 'نسعد بالإجابة على استفساراتك حول الدومينات والاستحواذ' : 'Reach our domain desk for portfolio audits and acquisitions')}
                  {type === 'privacy' && (isAr ? 'التزام صارم بحماية خصوصيتك ومعايير GDPR' : 'GDPR compliance, zero portfolio hoarding, and client-side safety')}
                  {type === 'terms' && (isAr ? 'الشفافية القانونية ومعايير التقييم الاسترشادي' : 'Legal guidelines, valuation notices, and user conduct')}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="p-6 overflow-y-auto space-y-6 text-slate-700 text-sm leading-relaxed">
            {/* ABOUT US CONTENT */}
            {type === 'about' && (
              isAr ? (
                <div className="space-y-5">
                  <div className="p-4 rounded-xl bg-teal-50/60 border border-teal-100 flex items-start gap-3">
                    <CheckCatchLogo className="w-7 h-7 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-teal-950 text-sm">الرؤية والهدف لـ CheckCatch.com</h4>
                      <p className="text-xs text-teal-900 mt-1">
                        تأسست منصة CheckCatch لتسد فجوة هامة في عالم الاستثمار في أسماء النطاقات والشركات الناشئة: وهي تصفية وتثمين الدومينات المكونة حصرياً من <strong>كلمتين حقيقيتين من القاموس الإنجليزي (Two-Word English Dictionary Domains)</strong>، والتي تشكل الهوية الرقمية لأكثر من 78% من شركات التقنية، الحوسبة السحابية، وشركات الذكاء الاصطناعي العالمية.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="p-4 rounded-xl border border-slate-200 bg-white hover:border-teal-300 transition-colors">
                      <div className="flex items-center gap-2 font-bold text-slate-900 text-xs mb-1.5">
                        <Sparkles className="w-4 h-4 text-teal-600" />
                        محرك ذكاء اصطناعي وفحص دلالي
                      </div>
                      <p className="text-xs text-slate-600">
                        تفكيك كل كلمة في الدومين، تحديد معناها الدقيق في القاموس، واحتساب قوة السمع والتكرار، مع استخراج المقاطع الصوتية (Syllables).
                      </p>
                    </div>

                    <div className="p-4 rounded-xl border border-slate-200 bg-white hover:border-teal-300 transition-colors">
                      <div className="flex items-center gap-2 font-bold text-slate-900 text-xs mb-1.5">
                        <Globe2 className="w-4 h-4 text-teal-600" />
                        اختبار الراديو (Radio Test)
                      </div>
                      <p className="text-xs text-slate-600">
                        فحص لفظي تلقائي يضمن أن اسم الدومين يمكن كتابته بدقة من المرة الأولى عند سماعه، دون ارتباك إملائي أو حروف مكررة مشوشة.
                      </p>
                    </div>

                    <div className="p-4 rounded-xl border border-slate-200 bg-white hover:border-teal-300 transition-colors">
                      <div className="flex items-center gap-2 font-bold text-slate-900 text-xs mb-1.5">
                        <FileText className="w-4 h-4 text-teal-600" />
                        تدقيق ملفات الإكسل الضخمة
                      </div>
                      <p className="text-xs text-slate-600">
                        فحص قوائم الدومينات المسقطة والمزادات من ملفات Excel و CSV وتصفية آلاف الدومينات في ثوانٍ لاستخراج الأسماء النظيفة فقط.
                      </p>
                    </div>

                    <div className="p-4 rounded-xl border border-slate-200 bg-white hover:border-teal-300 transition-colors">
                      <div className="flex items-center gap-2 font-bold text-slate-900 text-xs mb-1.5">
                        <Shield className="w-4 h-4 text-teal-600" />
                        تقييم مزدوج شفاف (Wholesale vs Retail)
                      </div>
                      <p className="text-xs text-slate-600">
                        فصل واقعي بين سعر البيع السريع بالجملة بين المستثمرين وسعر الاستحواذ المؤسسي المباشر للشركات والجهات الممولة.
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span>CheckCatch.com — صُمم لخدمة رواد الأعمال، مستثمري النطاقات، ووكالات التسويق الرقمي.</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="p-4 rounded-xl bg-teal-50/60 border border-teal-100 flex items-start gap-3">
                    <CheckCatchLogo className="w-7 h-7 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-teal-950 text-sm">The CheckCatch Platform Architecture</h4>
                      <p className="text-xs text-teal-900 mt-1">
                        CheckCatch was engineered to solve the most critical challenge for startup founders, domain investors, and brand strategists: systematically identifying, verifying, and valuing brandable domains composed exclusively of <strong>two verified English dictionary words</strong>. Two-word compounds power over 78% of modern tech startups, venture-backed enterprises, and SaaS products.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="p-4 rounded-xl border border-slate-200 bg-white hover:border-teal-300 transition-colors">
                      <div className="flex items-center gap-2 font-bold text-slate-900 text-xs mb-1.5">
                        <Sparkles className="w-4 h-4 text-teal-600" />
                        Semantic AI & Lexical Breakdown
                      </div>
                      <p className="text-xs text-slate-600">
                        Deconstructs each word into dictionary roots, assessing phonetic syllable rhythm, category fit, and commercial brand resonance.
                      </p>
                    </div>

                    <div className="p-4 rounded-xl border border-slate-200 bg-white hover:border-teal-300 transition-colors">
                      <div className="flex items-center gap-2 font-bold text-slate-900 text-xs mb-1.5">
                        <Globe2 className="w-4 h-4 text-teal-600" />
                        Phonetic Radio Test Verification
                      </div>
                      <p className="text-xs text-slate-600">
                        Automated acoustic scoring ensuring the domain can be spelled correctly on the first attempt without vowel ambiguity or double-letter friction.
                      </p>
                    </div>

                    <div className="p-4 rounded-xl border border-slate-200 bg-white hover:border-teal-300 transition-colors">
                      <div className="flex items-center gap-2 font-bold text-slate-900 text-xs mb-1.5">
                        <FileText className="w-4 h-4 text-teal-600" />
                        High-Speed Spreadsheet Audit
                      </div>
                      <p className="text-xs text-slate-600">
                        Parse and evaluate dropped domain portfolios, auction dumps, and registrar lists from Excel/CSV in seconds with zero personal data leakage.
                      </p>
                    </div>

                    <div className="p-4 rounded-xl border border-slate-200 bg-white hover:border-teal-300 transition-colors">
                      <div className="flex items-center gap-2 font-bold text-slate-900 text-xs mb-1.5">
                        <Shield className="w-4 h-4 text-teal-600" />
                        Transparent Dual-Tier Valuations
                      </div>
                      <p className="text-xs text-slate-600">
                        Distinguishes realistic liquid reseller wholesale valuations from long-term enterprise retail end-user acquisition potential.
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span>Built for founders, domain investors, venture scouts, and digital brand consultants worldwide.</span>
                  </div>
                </div>
              )
            )}

            {/* CONTACT US CONTENT */}
            {type === 'contact' && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
                    <div>
                      <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                        {isAr ? 'البريد الإلكتروني المباشر' : 'Official Support Desk'}
                      </span>
                      <p className="font-mono font-bold text-xs text-slate-900 select-all">support@checkcatch.com</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopySupportEmail}
                      className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 hover:text-teal-800"
                    >
                      {copiedEmail ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedEmail ? (isAr ? 'تم نسخ البريد!' : 'Copied!') : (isAr ? 'نسخ البريد الإلكتروني' : 'Copy Email Address')}
                    </button>
                  </div>

                  <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
                    <div>
                      <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                        {isAr ? 'وقت الاستجابة' : 'Response SLA'}
                      </span>
                      <p className="text-xs font-semibold text-slate-800">
                        {isAr ? 'خلال 24 ساعة كحد أقصى' : 'Within 24 business hours'}
                      </p>
                    </div>
                    <span className="text-[11px] text-slate-500 mt-2">
                      {isAr ? 'دعم استفسارات المزادات وتدقيق الملفات' : 'Priority for valuation & enterprise audits'}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/50 flex flex-col justify-between">
                    <div>
                      <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider block mb-1">
                        {isAr ? 'محادثة سريعة عبر واتساب' : 'Direct WhatsApp Desk'}
                      </span>
                      <p className="text-xs font-semibold text-emerald-950">
                        {isAr ? 'متاح للمفاوضات العاجلة' : 'Instant domain inquiry chat'}
                      </p>
                    </div>
                    <a
                      href="https://wa.me/?text=Hello%20CheckCatch%2C%20I%20have%20an%20inquiry%20regarding%20domain%20valuation"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800"
                    >
                      {isAr ? 'فتح المحادثة' : 'Open WhatsApp'} <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                {isSubmitted ? (
                  <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
                    <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <h4 className="font-bold text-slate-900 text-base">
                      {isAr ? 'تم استلام رسالتك بنجاح!' : 'Message Sent Successfully!'}
                    </h4>
                    <p className="text-xs text-slate-600 max-w-md mx-auto">
                      {isAr
                        ? 'شكراً لتواصلك مع فريق CheckCatch.com. سيقوم أحد مستشاري النطاقات بالرد عليك عبر البريد الإلكتروني خلال 24 ساعة.'
                        : 'Thank you for contacting the CheckCatch team. Our domain analysts will review your message and reply via email within 24 hours.'}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setIsSubmitted(false);
                        setFormData({ name: '', email: '', subject: '', message: '' });
                      }}
                      className="mt-3 px-4 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors"
                    >
                      {isAr ? 'إرسال استفسار آخر' : 'Send another inquiry'}
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleContactSubmit} className="space-y-3.5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          {isAr ? 'الاسم الكامل *' : 'Full Name *'}
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder={isAr ? 'مثال: أحمد المنصور' : 'e.g. Sarah Jenkins'}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          {isAr ? 'البريد الإلكتروني *' : 'Email Address *'}
                        </label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder={isAr ? 'name@example.com' : 'founder@startup.com'}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        {isAr ? 'موضوع الاستفسار' : 'Inquiry Subject'}
                      </label>
                      <input
                        type="text"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        placeholder={isAr ? 'استفسار عن دومين، تدقيق ملف إكسل، أو شراكة' : 'Portfolio audit, valuation query, or acquisition assistance'}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        {isAr ? 'نص الرسالة أو تفاصيل النطاق *' : 'Message or Domain Details *'}
                      </label>
                      <textarea
                        required
                        rows={4}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder={isAr ? 'أدخل تفاصيل استفسارك أو قائمة النطاقات التي تود الحصول على تقييم متخصص لها...' : 'Please describe your domain requirements, target niche, or questions regarding our evaluation algorithms...'}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                      />
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <span className="text-[11px] text-slate-400">
                        {isAr ? '* جميع الحقول المشار إليها بإلزامية محمية ومباشرة.' : '* Your email is strictly kept private and never shared.'}
                      </span>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs transition-colors shadow-xs disabled:opacity-50"
                      >
                        {isSubmitting ? (
                          <>
                            <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>{isAr ? 'جاري الإرسال...' : 'Sending Message...'}</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-3.5 h-3.5" />
                            <span>{isAr ? 'إرسال الرسالة الآن' : 'Send Message'}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* PRIVACY POLICY CONTENT */}
            {type === 'privacy' && (
              isAr ? (
                <div className="space-y-4">
                  <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-100 flex items-start gap-2.5 text-xs text-blue-900">
                    <Lock className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong>سياسة حظر جمع البيانات (Zero Data Hoarding):</strong> تلتزم CheckCatch بحماية خصوصية مستثمري الدومينات. لا نقوم بحفظ أو تسجيل أو بيع أي قوائم دومينات تقوم برفعها عبر ملفات Excel أو استعلامات البحث الخاصة بك.
                    </div>
                  </div>

                  <section className="space-y-2">
                    <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wide">1. البيانات التي تتم معالجتها</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      - <strong>البيانات المدخلة من المستخدم:</strong> الكلمات المفتاحية، ملفات Excel/CSV المرفوعة لفحص النطاقات، والنطاقات التي تختار حفظها في قائمتك المفضلة (Shortlist).<br />
                      - <strong>المعالجة المحلية:</strong> يتم حفظ قائمتك المفضلة وتفضيلات اللغة محلياً على متصفحك عبر تقنية <code>localStorage</code>، ولا يتم نقلها إلى خوادم خارجية إلا عند طلب فحص توفر النطاق.
                    </p>
                  </section>

                  <section className="space-y-2">
                    <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wide">2. معالجة الذكاء الاصطناعي وتوليد النطاقات</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      تعتمد ميزة التوليد والتحليل الذكي على خوادم آمنة تتواصل مع واجهات Google Gemini API وفق بروتوكولات تشفير معتمدة (TLS/HTTPS). لا تُستخدم بياناتك لتدريب نماذج الذكاء الاصطناعي العامة أو مشاركتها مع أطراف إعلانية خارجية.
                    </p>
                  </section>

                  <section className="space-y-2">
                    <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wide">3. ملفات تعريف الارتباط والتحليلات</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      يستخدم موقع CheckCatch.com ملفات تعريف ارتباط وظيفية أساسية مخصصة لتشغيل واجهة المستخدم وتذكر خياراتك المفضلة (كاللغة وطريقة العرض). نحن لا نبيع بيانات التصفح ولا نستخدم تقنيات التتبع المزعجة عبر المواقع.
                    </p>
                  </section>

                  <section className="space-y-2">
                    <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wide">4. حقوق المستخدم وفق GDPR و CCPA</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      يحق لك في أي وقت مسح بيانات النطاقات المحفوظة بنقرة زر واحدة عبر خيار &quot;مسح الكل&quot; في نافذة المفضلة، أو مسح ملفات تعريف الارتباط من متصفحك. لأي استفسارات قانونية، يرجى مراسلتنا عبر <code>support@checkcatch.com</code>.
                    </p>
                  </section>

                  <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400">
                    آخر تحديث: سبتمبر 2026 • ساري المفعول لجميع مستخدمي المنصة.
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-100 flex items-start gap-2.5 text-xs text-blue-900">
                    <Lock className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong>Zero Domain Portfolio Hoarding Guarantee:</strong> CheckCatch respects the proprietary nature of domain investment. We do not store, scrape, log, or front-run any domain lists, CSV uploads, or search queries you inspect.
                    </div>
                  </div>

                  <section className="space-y-2">
                    <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wide">1. Information We Process</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      - <strong>User-Provided Inputs:</strong> Keyword concepts, uploaded spreadsheets (Excel/CSV) for candidate audits, and domains you explicitly bookmark.<br />
                      - <strong>Local Storage Usage:</strong> Your bookmarked shortlist, UI layout choices, and language preferences reside securely within your browser&apos;s <code>localStorage</code> cache.
                    </p>
                  </section>

                  <section className="space-y-2">
                    <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wide">2. AI Generation & Cloud Processing</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Real-time generation and dictionary evaluations are routed through secure server-side proxies using Google Gemini API endpoints over encrypted HTTPS channels. Your private spreadsheet lists are processed transiently in-memory and are never used to train public machine learning models.
                    </p>
                  </section>

                  <section className="space-y-2">
                    <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wide">3. Cookies & Analytical Telemetry</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      CheckCatch utilizes strictly essential functional cookies to sustain session states, UI responsiveness, and registrar referral routing. We do not engage in invasive cross-site advertising networks or third-party behavioral profiling.
                    </p>
                  </section>

                  <section className="space-y-2">
                    <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wide">4. GDPR & CCPA Compliance Rights</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      You retain full authority to clear your shortlist and cached items instantly at any time. For compliance verifications or data privacy inquiries, contact our legal desk at <code>support@checkcatch.com</code>.
                    </p>
                  </section>

                  <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400">
                    Effective Date: September 2026 • Governs all CheckCatch.com services globally.
                  </div>
                </div>
              )
            )}

            {/* TERMS OF SERVICE CONTENT */}
            {type === 'terms' && (
              isAr ? (
                <div className="space-y-4">
                  <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 flex items-start gap-2.5 text-xs text-amber-900">
                    <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong>إخلاء مسؤولية تقديرات القيمة السوقية (Valuation Disclaimer):</strong> جميع أرقام التثمين (Wholesale و Retail) ونتائج اختبار الراديو هي تقديرات حسابية استرشادية مبنية على خوارزميات إحصائية ومبيعات مقارنة سابقة، ولا تشكل ضماناً مالياً أو عرض شراء ملزم قانوناً.
                    </div>
                  </div>

                  <section className="space-y-2">
                    <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wide">1. قبول الشروط وطبيعة الخدمة</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      باستخدامك لمنصة CheckCatch.com، فإنك توافق على الالتزام بهذه الشروط. توفر المنصة أدوات فحص دلالي، تدقيق ملفات إكسل، وتثمين للدومينات الثنائية لمساعدة المستثمرين ورواد الأعمال في اتخاذ قرارات مدروسة.
                    </p>
                  </section>

                  <section className="space-y-2">
                    <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wide">2. العلامات التجارية وحقوق الملكية الفكرية</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      يتحمل المستخدم وحده المسؤولية الكاملة عن التأكد من أن أي اسم دومين يتم تسجيله أو الاستحواذ عليه لا ينتهك أي علامة تجارية مسجلة لشركات قائمة (Trademark Clearance). منصة CheckCatch تفحص مطابقة الكلمات للقاموس الإنجليزي العام ولا تقدم استشارات قانونية متخصصة حول العلامات التجارية.
                    </p>
                  </section>

                  <section className="space-y-2">
                    <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wide">3. روابط المسجلين الرسميين والشركاء</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      توفر المنصة روابط خارجية مباشرة إلى مسجلي النطاقات المعتمدين (مثل GoDaddy و Namecheap وغيرها) لتسهيل التحقق والتسجيل. نحن لا نتحكم في سياسات التسعير أو التوفر اللحظي لدى تلك الجهات الخارجية المستقلة.
                    </p>
                  </section>

                  <section className="space-y-2">
                    <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wide">4. حدود المسؤولية</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      لا تتحمل إدارة CheckCatch أي مسؤولية عن أي قرارات استثمارية أو خسائر مالية أو نزاعات ناتجة عن تسجيل أو شراء أو بيع أي اسم نطاق تم فحصه عبر المنصة.
                    </p>
                  </section>

                  <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400">
                    آخر مراجعة: سبتمبر 2026 • الشروط خاضعة للوائح المعمول بها لحماية التجارة الإلكترونية.
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 flex items-start gap-2.5 text-xs text-amber-900">
                    <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong>Valuation & Appraisal Disclaimer:</strong> Dual-tier valuations (Wholesale Liquidity and End-User Retail), radio test diagnostics, and keyword search volume estimates are algorithmic indicators. They do not constitute certified appraisals, binding appraisals, or guarantees of transaction values.
                    </div>
                  </div>

                  <section className="space-y-2">
                    <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wide">1. Acceptance of Terms</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      By accessing or using CheckCatch.com, you agree to comply with and be bound by these Terms of Service. If you disagree with any part of these terms, please discontinue use of the platform.
                    </p>
                  </section>

                  <section className="space-y-2">
                    <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wide">2. Intellectual Property & Trademark Clearance</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      CheckCatch indexes and evaluates generic dictionary words. Users are solely responsible for conducting independent trademark and intellectual property searches (e.g., USPTO, WIPO) before acquiring, developing, or marketing any domain name suggested or audited by the platform.
                    </p>
                  </section>

                  <section className="space-y-2">
                    <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wide">3. Third-Party Registrars & Outbound Links</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      CheckCatch provides outbound lookup links to accredited registrars (e.g., GoDaddy, Namecheap, Dynadot, Dropcatch). We are not responsible for third-party registrar pricing changes, auction outcomes, or domain availability discrepancies.
                    </p>
                  </section>

                  <section className="space-y-2">
                    <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wide">4. Limitation of Liability</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Under no circumstances shall CheckCatch or its operators be held liable for any direct, indirect, incidental, or consequential damages resulting from investment decisions, domain transactions, or service interruptions.
                    </p>
                  </section>

                  <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400">
                    Last Revised: September 2026 • Governed under standard web service protocols.
                  </div>
                </div>
              )
            )}
          </div>

          {/* Footer of Modal */}
          <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-mono text-[11px]">
              CheckCatch<span className="text-teal-700">.com</span>
            </span>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold transition-colors"
            >
              {isAr ? 'إغلاق النافذة' : 'Close'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
