import React, { useState, useRef, useEffect } from 'react';
import { Bookmark, ShieldCheck, Globe, ChevronDown, Check, Info, Mail } from 'lucide-react';
import { Language, translations } from '../utils/translations';
import { CheckCatchLogo } from './CheckCatchLogo';
import { LegalModalType } from './LegalModal';

interface NavbarProps {
  savedCount: number;
  onOpenSaved: () => void;
  hasApiKey: boolean;
  lang?: Language;
  onToggleLang?: (lang: Language) => void;
  onOpenLegal?: (type: LegalModalType) => void;
}

const LANGUAGES: { code: Language; label: string; flag: string; nativeName: string }[] = [
  { code: 'en', label: 'English', flag: '🇬🇧', nativeName: 'English (EN)' },
  { code: 'ar', label: 'العربية', flag: '🇸🇦', nativeName: 'العربية (AR)' },
  { code: 'fr', label: 'Français', flag: '🇫🇷', nativeName: 'Français (FR)' },
  { code: 'es', label: 'Español', flag: '🇪🇸', nativeName: 'Español (ES)' },
];

export const Navbar: React.FC<NavbarProps> = ({
  savedCount,
  onOpenSaved,
  lang = 'en',
  onToggleLang,
  onOpenLegal,
}) => {
  const t = translations[lang] || translations.en;
  const isAr = lang === 'ar';
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const langMenuRef = useRef<HTMLDivElement>(null);

  const currentLangObj = LANGUAGES.find((l) => l.code === lang) || LANGUAGES[0];

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(e.target as Node)) {
        setIsLangMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleSelectLang = (selectedCode: Language) => {
    if (onToggleLang) {
      onToggleLang(selectedCode);
    }
    setIsLangMenuOpen(false);
  };

  return (
    <header
      id="app-header"
      className="sticky top-0 z-40 w-full border-b border-teal-100/80 bg-white/95 backdrop-blur-md shadow-xs"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo & Editorial Title */}
        <div className="flex items-center gap-3">
          <a
            href="/"
            className="flex items-center gap-2.5 group transition-opacity hover:opacity-95"
            title="CheckCatch.com"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-50 to-blue-50 border border-teal-200/70 p-1 flex items-center justify-center shadow-xs group-hover:border-blue-400 group-hover:shadow-blue-100 transition-all">
              <CheckCatchLogo className="w-full h-full" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-bold tracking-tight text-slate-900 font-sans">
                  CheckCatch
                </span>
                <span className="font-mono text-xs font-bold text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded-md border border-teal-200">
                  .com
                </span>
              </div>
              <span className="text-[11px] text-slate-500 hidden md:block">
                {t.nav.tagline}
              </span>
            </div>
          </a>
        </div>

        {/* Right Controls: About, Contact, Strict Rules Badge, Language Selector & Shortlist */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Informational Quick Links */}
          {onOpenLegal && (
            <div className="hidden md:flex items-center gap-1.5 border-r rtl:border-r-0 rtl:border-l border-slate-200 pr-2.5 rtl:pr-0 rtl:pl-2.5">
              <button
                id="nav-about-btn"
                type="button"
                onClick={() => onOpenLegal('about')}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-teal-800 hover:bg-teal-50/60 transition-all"
              >
                <Info className="w-3.5 h-3.5 text-teal-600" />
                <span>{isAr ? 'عن المنصة' : 'About'}</span>
              </button>
              <button
                id="nav-contact-btn"
                type="button"
                onClick={() => onOpenLegal('contact')}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-teal-800 hover:bg-teal-50/60 transition-all"
              >
                <Mail className="w-3.5 h-3.5 text-teal-600" />
                <span>{isAr ? 'اتصل بنا' : 'Contact'}</span>
              </button>
            </div>
          )}

          {/* Rules indicator */}
          <div className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-50/80 border border-teal-200/80 text-xs font-semibold text-teal-900">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
            <span>{t.nav.rulesActive}</span>
          </div>

          {/* Language Switcher Dropdown */}
          <div className="relative" ref={langMenuRef}>
            <button
              id="language-switcher-btn"
              type="button"
              onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white hover:bg-teal-50/50 border border-slate-200 hover:border-teal-300 text-slate-700 text-xs font-semibold transition-all shadow-xs active:scale-95"
              aria-label="Select Language"
              aria-expanded={isLangMenuOpen}
            >
              <Globe className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden sm:inline-flex items-center gap-1.5">
                <span>{currentLangObj.flag}</span>
                <span>{currentLangObj.nativeName}</span>
              </span>
              <span className="inline-flex sm:hidden items-center gap-1">
                <span>{currentLangObj.flag}</span>
                <span className="uppercase font-mono">{currentLangObj.code}</span>
              </span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isLangMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Language Dropdown Menu */}
            {isLangMenuOpen && (
              <div
                id="language-dropdown-menu"
                className="absolute right-0 rtl:left-0 rtl:right-auto mt-2 w-48 rounded-xl bg-white border border-teal-100 shadow-xl p-1.5 z-50 space-y-1 animate-in fade-in slide-in-from-top-1 duration-150"
              >
                <div className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-teal-700 border-b border-teal-50 mb-1">
                  {t.nav.language}
                </div>
                {LANGUAGES.map((item) => {
                  const isSelected = item.code === lang;
                  return (
                    <button
                      key={item.code}
                      id={`lang-option-${item.code}`}
                      type="button"
                      onClick={() => handleSelectLang(item.code)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                        isSelected
                          ? 'bg-gradient-to-r from-teal-50 to-blue-50 text-blue-700 font-bold border border-teal-200'
                          : 'text-slate-700 hover:text-slate-900 hover:bg-teal-50/50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-base">{item.flag}</span>
                        <span>{item.nativeName}</span>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-blue-600" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Saved Domains Shortlist Drawer Toggle */}
          <button
            id="saved-domains-button"
            onClick={onOpenSaved}
            className="relative flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-white hover:bg-blue-50/50 border border-slate-200 hover:border-blue-300 text-slate-700 text-xs font-semibold transition-all shadow-xs active:scale-95"
            title={t.nav.shortlist}
          >
            <Bookmark className="w-3.5 h-3.5 text-blue-600" />
            <span>{t.nav.shortlist}</span>
            {savedCount > 0 && (
              <span
                id="saved-badge-counter"
                className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center shadow-xs"
              >
                {savedCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
