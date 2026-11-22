import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, Search, Check } from 'lucide-react';
import { mathToPlain } from '../../../utils/mathPlain';

/** Arabic is searched without its marks: « القاسم » finds « القَاسِم ». */
const plain = (text) =>
  mathToPlain(text ?? '')
    .replace(/[\u064B-\u0652\u0640]/g, '')
    .toLowerCase();

/**
 * The lesson menu of « الكفاءات », with a SEARCH box inside it: a class sees more than seventy lessons, and a native
 * menu of seventy lines is read line by line. Type a word of the title, pick; « كل الدروس » stays the first choice.
 * Keyboard: Escape closes, Enter picks the first match.
 */
export default function LessonPicker({ value, lessons, allValue, allLabel, onPick }) {
  const { t } = useTranslation('teacher');
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const box = useRef(null);
  const current = lessons.find((lesson) => lesson.code === value);
  const matches = useMemo(() => {
    const q = plain(query).trim();
    return q ? lessons.filter((lesson) => plain(lesson.title).includes(q)) : lessons;
  }, [lessons, query]);

  useEffect(() => {
    if (!open) return undefined;
    const close = (event) => {
      if (event.key === 'Escape' || (event.type === 'pointerdown' && !box.current?.contains(event.target)))
        setOpen(false);
    };
    document.addEventListener('pointerdown', close);
    document.addEventListener('keydown', close);
    return () => {
      document.removeEventListener('pointerdown', close);
      document.removeEventListener('keydown', close);
    };
  }, [open]);

  const pick = (code) => {
    onPick(code);
    setOpen(false);
    setQuery('');
  };
  const OPTION =
    'flex min-h-[44px] w-full items-center gap-2 rounded-lg px-3 text-start font-inter text-sm font-semibold hover:bg-nav-page';

  return (
    <div className="relative" ref={box}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex min-h-[44px] w-full items-center gap-2 rounded-xl border border-nav-line bg-white px-3 text-start font-inter text-sm font-bold text-nav-ink hover:border-nav-accent"
        data-lp-lesson-picker
      >
        <span className="min-w-0 flex-1 truncate">{current ? mathToPlain(current.title) : allLabel}</span>
        <ChevronDown
          size={16}
          className={`shrink-0 text-nav-muted transition-transform ${open ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>
      {open && (
        <div
          className="absolute inset-x-0 top-full z-30 mt-1 rounded-2xl border border-nav-line bg-white p-2 shadow-lg"
          data-lp-lesson-menu
        >
          <label className="flex min-h-[44px] items-center gap-2 rounded-xl border border-nav-line px-3 focus-within:border-nav-accent">
            <Search size={15} className="shrink-0 text-nav-muted" aria-hidden="true" />
            <input
              autoFocus
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && matches.length > 0) pick(matches[0].code);
              }}
              placeholder={t('learningPoints.searchLesson')}
              aria-label={t('learningPoints.searchLesson')}
              className="min-w-0 flex-1 bg-transparent font-inter text-sm text-nav-ink outline-none"
              data-lp-lesson-search
            />
          </label>
          <ul role="listbox" className="mt-1 max-h-72 overflow-y-auto">
            {!query && (
              <li>
                <button
                  type="button"
                  role="option"
                  aria-selected={value === allValue}
                  onClick={() => pick(allValue)}
                  className={`${OPTION} text-nav-accent`}
                >
                  <span className="flex-1">{allLabel}</span>
                  {value === allValue && <Check size={15} aria-hidden="true" />}
                </button>
              </li>
            )}
            {matches.map((lesson) => (
              <li key={lesson.code}>
                <button
                  type="button"
                  role="option"
                  aria-selected={value === lesson.code}
                  onClick={() => pick(lesson.code)}
                  className={`${OPTION} text-nav-ink`}
                  data-lp-lesson-option={lesson.code}
                >
                  <span className="min-w-0 flex-1 truncate">{mathToPlain(lesson.title)}</span>
                  {value === lesson.code && <Check size={15} className="text-nav-accent" aria-hidden="true" />}
                </button>
              </li>
            ))}
            {matches.length === 0 && (
              <li className="px-3 py-3 font-inter text-sm text-nav-muted">{t('learningPoints.noLessonFound')}</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
