import React from 'react';
import {
  CheckCatchLogo
} from './CheckCatchLogo';
import {
  Shield,
  FileText,
  Mail,
  Info,
  Instagram,
  Facebook,
  MessageCircle,
  ExternalLink,
  ShieldCheck,
  Search,
  Sparkles
} from 'lucide-react';
import { Language, translations } from '../utils/translations';
import { LegalModalType } from './LegalModal';

interface FooterProps {
  lang: Language;
  onOpenLegal: (type: LegalModalType) => void;
  lastGeneratedAt?: string | null;
}

export const Footer: React.FC<FooterProps> = ({
  lang,
  onOpenLegal,
  lastGeneratedAt,
}) => {
  const t = translations[lang] || translations.en;
  const isAr = lang === 'ar';

  return (
    <footer id="main-footer" className="border-t border-slate-200 py-10 bg-white text-xs text-slate-600 mt-auto shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Top Tier: Brand, Elevator Pitch, Fast Links, Socials */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-8 border-b border-slate-200">
          {/* Brand & Purpose (5 columns) */}
          <div className="md:col-span-5 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-50 to-blue-50 border border-teal-200/80 p-1 flex items-center justify-center shadow-xs">
                <CheckCatchLogo className="w-full h-full" />
              </div>
              <span className="font-mono font-bold text-lg text-slate-900 tracking-tight">
                CheckCatch<span className="text-teal-700">.com</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed max-w-sm">
              {t.footer.description}
            </p>
            <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
              <span>{isAr ? 'فحص دقيق بمعايير القاموس واختبار الراديو' : 'Rigorous 2-word dictionary & radio-test audits'}</span>
            </div>
          </div>

          {/* Legal & Informational Links (4 columns) */}
          <div className="md:col-span-4 space-y-3">
            <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider block">
              {isAr ? 'الصفحات القانونية والمعلوماتية' : 'Legal & Platform Information'}
            </span>
            <ul className="grid grid-cols-2 gap-2 text-xs">
              <li>
                <button
                  id="footer-about-btn"
                  type="button"
                  onClick={() => onOpenLegal('about')}
                  className="flex items-center gap-1.5 text-slate-600 hover:text-teal-700 hover:underline transition-colors text-left"
                >
                  <Info className="w-3.5 h-3.5 text-teal-600" />
                  <span>{isAr ? 'عن CheckCatch' : 'About Us'}</span>
                </button>
              </li>
              <li>
                <button
                  id="footer-contact-btn"
                  type="button"
                  onClick={() => onOpenLegal('contact')}
                  className="flex items-center gap-1.5 text-slate-600 hover:text-teal-700 hover:underline transition-colors text-left"
                >
                  <Mail className="w-3.5 h-3.5 text-teal-600" />
                  <span>{isAr ? 'اتصل بنا' : 'Contact Us'}</span>
                </button>
              </li>
              <li>
                <button
                  id="footer-privacy-btn"
                  type="button"
                  onClick={() => onOpenLegal('privacy')}
                  className="flex items-center gap-1.5 text-slate-600 hover:text-teal-700 hover:underline transition-colors text-left"
                >
                  <Shield className="w-3.5 h-3.5 text-teal-600" />
                  <span>{isAr ? 'سياسة الخصوصية' : 'Privacy Policy'}</span>
                </button>
              </li>
              <li>
                <button
                  id="footer-terms-btn"
                  type="button"
                  onClick={() => onOpenLegal('terms')}
                  className="flex items-center gap-1.5 text-slate-600 hover:text-teal-700 hover:underline transition-colors text-left"
                >
                  <FileText className="w-3.5 h-3.5 text-teal-600" />
                  <span>{isAr ? 'شروط الخدمة' : 'Terms of Service'}</span>
                </button>
              </li>
            </ul>

            <div className="pt-2 text-[11px] text-slate-400">
              {isAr ? (
                <span>البريد الإلكتروني المباشر: <code className="text-slate-600">support@checkcatch.com</code></span>
              ) : (
                <span>Support Inquiries: <code className="text-slate-600">support@checkcatch.com</code></span>
              )}
            </div>
          </div>

          {/* Social Channels & Instant Inquiries (3 columns) */}
          <div className="md:col-span-3 space-y-3">
            <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider block">
              {t.footer.socials.connect}
            </span>
            <div className="flex flex-col gap-2">
              {/* WhatsApp Button */}
              <a
                id="social-whatsapp-link"
                href={`https://wa.me/?text=${encodeURIComponent(t.footer.socials.whatsappChatMessage)}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={t.footer.socials.whatsapp}
                className="group flex items-center justify-between px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-300/80 hover:border-emerald-400 hover:bg-emerald-100/70 text-emerald-900 transition-all shadow-xs"
              >
                <div className="flex items-center gap-2">
                  <div className="relative w-5 h-5 rounded-lg flex items-center justify-center bg-white text-emerald-600 shadow-xs">
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 animate-ping opacity-75" />
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500" />
                  </div>
                  <div className="flex flex-col items-start text-left">
                    <span className="text-xs font-bold leading-tight">{t.footer.socials.whatsapp}</span>
                    <span className="text-[9px] text-emerald-700 font-semibold leading-tight">
                      {t.footer.socials.whatsappOnline}
                    </span>
                  </div>
                </div>
                <ExternalLink className="w-3 h-3 text-emerald-700 opacity-60 group-hover:opacity-100" />
              </a>

              {/* Instagram & Facebook row */}
              <div className="grid grid-cols-2 gap-2">
                <a
                  id="social-instagram-link"
                  href="https://www.instagram.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={t.footer.socials.instagram}
                  className="group flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-pink-400 hover:bg-pink-50 text-slate-700 hover:text-pink-700 transition-all shadow-xs text-xs font-semibold"
                >
                  <Instagram className="w-3.5 h-3.5 text-pink-600" />
                  <span>{t.footer.socials.instagram}</span>
                </a>

                <a
                  id="social-facebook-link"
                  href="https://www.facebook.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={t.footer.socials.facebook}
                  className="group flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-blue-400 hover:bg-blue-50 text-slate-700 hover:text-blue-700 transition-all shadow-xs text-xs font-semibold"
                >
                  <Facebook className="w-3.5 h-3.5 text-blue-600" />
                  <span>{t.footer.socials.facebook}</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Verified Registrars */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-500 text-[11px]">
          <div>
            <span>© {new Date().getFullYear()} CheckCatch.com. {t.footer.rights}</span>
          </div>
          <div className="flex items-center gap-3">
            <span>{t.footer.verifiedNotice}</span>
            {lastGeneratedAt && (
              <>
                <span className="text-slate-300">•</span>
                <span>
                  {isAr ? 'آخر فحص:' : 'Updated:'}{' '}
                  {new Date(lastGeneratedAt).toLocaleTimeString()}
                </span>
              </>
            )}
          </div>
        </div>

      </div>
    </footer>
  );
};
