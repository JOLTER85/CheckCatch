import React from 'react';
import { SavedDomain } from '../types';
import { getRegistrarLinks } from '../utils/registrars';
import { X, Bookmark, Copy, Trash2, ExternalLink, Download } from 'lucide-react';
import { Language, translations } from '../utils/translations';

interface SavedDomainsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  savedDomains: SavedDomain[];
  onRemove: (id: string) => void;
  onClearAll: () => void;
  onCopyDomain: (domain: string) => void;
  onCopyAll: () => void;
  lang?: Language;
}

export const SavedDomainsDrawer: React.FC<SavedDomainsDrawerProps> = ({
  isOpen,
  onClose,
  savedDomains,
  onRemove,
  onClearAll,
  onCopyDomain,
  onCopyAll,
  lang = 'en',
}) => {
  if (!isOpen) return null;

  const t = translations[lang];

  const exportCsv = () => {
    if (savedDomains.length === 0) return;
    const headers = ['Domain', 'TLD', 'Match Score', 'Tier', 'Est. Valuation', 'Pitch'];
    const rows = savedDomains.map((d) => [
      d.domain,
      d.tld,
      `${d.relevanceScore}%`,
      d.valuationTier,
      `"${d.estimatedValue}"`,
      `"${d.pitch.replace(/"/g, '""')}"`,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `checkcatch-shortlist-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      id="saved-drawer-overlay"
      className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs transition-opacity"
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
    >
      <div
        id="saved-domains-modal"
        className="w-full max-w-md bg-white border-l border-slate-200 h-full flex flex-col shadow-2xl p-6 overflow-hidden animate-in slide-in-from-right duration-300"
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-blue-600" />
            <h3 className="text-base font-bold text-slate-900">
              {t.savedDrawer.title} ({savedDomains.length})
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {savedDomains.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-400">
            <Bookmark className="w-12 h-12 text-slate-300 mb-3 stroke-1" />
            <p className="text-sm font-bold text-slate-700">
              {t.savedDrawer.emptyTitle}
            </p>
            <p className="text-xs text-slate-500 mt-1 max-w-xs">
              {t.savedDrawer.emptyDesc}
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between py-3 border-b border-slate-100 text-xs">
              <div className="flex items-center gap-2">
                <button
                  onClick={onCopyAll}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors font-medium border border-slate-200"
                >
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span>{t.savedDrawer.copyAll}</span>
                </button>
                <button
                  onClick={exportCsv}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors font-medium border border-slate-200"
                >
                  <Download className="w-3.5 h-3.5 text-slate-500" />
                  <span>{t.savedDrawer.exportCsv}</span>
                </button>
              </div>
              <button
                onClick={onClearAll}
                className="text-rose-600 hover:text-rose-700 font-medium flex items-center gap-1 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{t.savedDrawer.clearAll}</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 py-2 space-y-2">
              {savedDomains.map((item) => {
                const registrars = getRegistrarLinks(item.domain);
                return (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start justify-between gap-2 shadow-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-slate-900" dir="ltr">
                          {item.domain}
                        </span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-300">
                          {item.relevanceScore}%
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-700 mt-1 line-clamp-1 font-medium">
                        {item.pitch}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => onCopyDomain(item.domain)}
                          className="text-[11px] font-bold text-emerald-800 hover:text-emerald-900 flex items-center gap-1"
                        >
                          <Copy className="w-3 h-3 text-emerald-800" />
                          <span>{t.domainCard.copy}</span>
                        </button>
                        <span className="text-slate-300">•</span>
                        <a
                          href={registrars[0].url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                        >
                          <span>{t.domainCard.register}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>

                    <button
                      onClick={() => onRemove(item.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                      title="Remove"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
