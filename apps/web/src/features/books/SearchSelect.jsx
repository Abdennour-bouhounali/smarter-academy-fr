import { forwardRef, useEffect, useId, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Search, X, Check } from 'lucide-react';
import { filterOptions } from './dzSearch';

/**
 * Une liste à choisir EN CHERCHANT — la wilaya (par numéro ou par nom) et la
 * commune du formulaire de commande. Téléphone d'abord :
 * - < sm : la liste s'ouvre en PLEIN ÉCRAN (le clavier du téléphone ne cache
 *   jamais la recherche, en haut), avec un bouton fermer ;
 * - ≥ sm : un menu déroulant sous le champ.
 * Clavier : ↑ ↓ pour se déplacer, Entrée pour choisir, Échap pour fermer.
 *
 * `options` : `{ value, label, code?, terms }` — `code` s'affiche en pastille et
 * se cherche par chiffres ; `terms` (nom arabe + translittération latine) se
 * cherchent par nom, mais SEUL `label` (arabe) s'affiche.
 * `extras(query)` : des résultats EN PLUS, sous un intertitre (la wilaya trouvée
 * par le nom d'une de ses communes) — `{ key, code, label, hint, pick }`.
 * `ref.open()` ouvre la liste (le formulaire enchaîne wilaya → commune).
 *
 * Le bouton « retour » d'Android FERME la liste au lieu de quitter la page (et de
 * perdre le formulaire) : l'ouverture pose une entrée d'historique sur la même URL.
 */
/** Le `history.back()` d'une liste qui vient de se fermer, tant qu'il n'est pas arrivé. */
let pendingBack = null;

const SearchSelect = forwardRef(function SearchSelect(
  { id, label, value, options, onChange, extras, extrasTitle, placeholder, searchPlaceholder, emptyText, disabled, disabledHint, loading, invalid, describedBy },
  ref,
) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const triggerRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const rootRef = useRef(null);
  const panelRef = useRef(null);
  const listId = useId();

  const selected = options.find((o) => o.value === value) ?? null;
  const items = useMemo(() => {
    const main = filterOptions(options, query).map((o) => ({ ...o, key: o.value, pick: () => onChange(o.value) }));
    const more = extras ? extras(query).map((x) => ({ ...x, extra: true })) : [];
    return [...main, ...more];
  }, [options, query, extras, onChange]);
  const firstExtra = items.findIndex((item) => item.extra);

  useImperativeHandle(ref, () => ({
    open: () => !disabled && setOpen(true),
    focus: () => triggerRef.current?.focus(),
  }), [disabled]);

  // À l'ouverture : recherche vide, curseur sur l'option choisie, focus dans la recherche.
  useEffect(() => {
    if (!open) return undefined;
    setQuery('');
    const index = Math.max(0, options.findIndex((o) => o.value === value));
    setActive(index);
    const raf = requestAnimationFrame(() => {
      inputRef.current?.focus({ preventScroll: true });
      listRef.current?.querySelector(`[data-index="${index}"]`)?.scrollIntoView({ block: 'center' });
    });
    // Plein écran sur téléphone : la page derrière ne défile pas.
    const small = window.matchMedia?.('(max-width: 639px)').matches;
    const previous = document.body.style.overflow;
    if (small) document.body.style.overflow = 'hidden';
    const outside = (event) => {
      if (!rootRef.current?.contains(event.target) && !panelRef.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener('pointerdown', outside);
    // Même URL, état du routeur conservé : seul « retour » est intercepté. Si une
    // autre liste vient de se fermer, son `history.back()` n'est pas encore arrivé :
    // on attend qu'il arrive, sinon il fermerait CETTE liste (wilaya → commune).
    let popped = false;
    let pushed = false;
    let cancelled = false;
    const onPop = () => { popped = true; setOpen(false); };
    const arm = () => {
      if (cancelled) return;
      window.history.pushState({ ...(window.history.state ?? {}), saPicker: id }, '');
      pushed = true;
      window.addEventListener('popstate', onPop);
    };
    if (pendingBack) pendingBack.then(arm); else arm();
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      document.body.style.overflow = previous;
      document.removeEventListener('pointerdown', outside);
      window.removeEventListener('popstate', onPop);
      if (pushed && !popped && window.history.state?.saPicker === id) {
        pendingBack = new Promise((resolve) => {
          const done = () => { window.removeEventListener('popstate', done); clearTimeout(timer); pendingBack = null; resolve(); };
          const timer = setTimeout(done, 600);
          window.addEventListener('popstate', done);
        });
        window.history.back();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => { setActive(0); }, [query]);

  useEffect(() => {
    if (!open) return;
    listRef.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [active, open]);

  const close = (refocus = true) => {
    setOpen(false);
    if (refocus) triggerRef.current?.focus({ preventScroll: true });
  };

  const choose = (item) => {
    close();
    item.pick();
  };

  const onKeyDown = (event) => {
    if (event.key === 'ArrowDown') { event.preventDefault(); setActive((i) => Math.min(items.length - 1, i + 1)); }
    else if (event.key === 'ArrowUp') { event.preventDefault(); setActive((i) => Math.max(0, i - 1)); }
    else if (event.key === 'Enter') { event.preventDefault(); if (items[active]) choose(items[active]); }
    else if (event.key === 'Escape') { event.preventDefault(); close(); }
    else if (event.key === 'Tab') { setOpen(false); }
  };

  // Téléphone : la feuille plein écran est rendue dans <body> — sinon la barre du site
  // (z-50, hors du contexte d'empilement de la page) la recouvre.
  const asSheet = open && typeof window !== 'undefined' && window.matchMedia?.('(max-width: 639px)').matches;
  const activeId = items[active] ? `${listId}-${active}` : undefined;

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={triggerRef}
        id={id}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        onClick={() => setOpen((o) => !o)}
        className={`flex h-14 w-full items-center gap-3 rounded-xl border bg-white px-3.5 text-start font-inter text-base transition focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:cursor-not-allowed disabled:border-dashed disabled:bg-slate-50 ${invalid ? 'border-rose-400' : open ? 'border-blue-500' : 'border-slate-300'}`}
      >
        {selected?.code != null && (
          <span dir="ltr" className="flex h-8 min-w-8 flex-none items-center justify-center rounded-lg bg-blue-50 px-1.5 font-space text-sm font-bold tabular-nums text-blue-700">
            {String(selected.code).padStart(2, '0')}
          </span>
        )}
        <span className={`min-w-0 flex-1 truncate ${selected ? 'font-semibold text-slate-900' : 'text-slate-400'}`}>
          {selected ? selected.label : disabled ? disabledHint : loading ? '…' : placeholder}
        </span>
        <ChevronDown size={18} className={`flex-none text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>

      {open && wrap(
        <div ref={panelRef}>
          {/* Fond sombre : téléphone seulement (plein écran). */}
          <div className="fixed inset-0 z-[60] bg-slate-900/40 sm:hidden" aria-hidden="true" onPointerDown={() => close()} />
          <div
            className="fixed inset-0 z-[61] flex flex-col bg-white sm:absolute sm:inset-auto sm:top-full sm:mt-2 sm:w-full sm:rounded-2xl sm:border sm:border-slate-200 sm:shadow-xl"
            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 sm:hidden">
              <p className="font-space text-lg font-bold text-slate-900">{label}</p>
              <button type="button" onClick={() => close()} aria-label="إغلاق" className="flex h-11 w-11 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100">
                <X size={22} />
              </button>
            </div>
            <div className="relative p-3 sm:p-2">
              <Search size={18} className="pointer-events-none absolute inset-y-0 start-6 my-auto text-slate-400 sm:start-5" aria-hidden="true" />
              <input
                ref={inputRef}
                type="search"
                role="combobox"
                aria-expanded="true"
                aria-controls={listId}
                aria-activedescendant={activeId}
                aria-autocomplete="list"
                aria-label={searchPlaceholder}
                autoComplete="off"
                enterKeyHint="done"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={onKeyDown}
                placeholder={searchPlaceholder}
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pe-3 ps-10 font-inter text-base text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none"
              />
            </div>
            <ul ref={listRef} id={listId} role="listbox" aria-label={label} className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 pb-2 sm:max-h-72 sm:flex-none">
              {items.length === 0 && <li role="presentation" className="px-3 py-6 text-center font-inter text-sm text-slate-500">{emptyText}</li>}
              {items.map((option, index) => {
                const isSelected = !option.extra && option.value === value;
                return [
                  index === firstExtra && (
                    <li key="extras-title" role="presentation" className="mt-2 border-t border-slate-100 px-3 pb-1 pt-3 font-inter text-xs font-semibold text-slate-500">{extrasTitle}</li>
                  ),
                  <li
                    key={option.key}
                    id={`${listId}-${index}`}
                    data-index={index}
                    role="option"
                    aria-selected={isSelected}
                    onPointerEnter={() => setActive(index)}
                    onClick={() => choose(option)}
                    className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-xl px-3 py-2 font-inter text-base ${index === active ? 'bg-blue-50' : ''} ${isSelected ? 'font-bold text-blue-700' : 'text-slate-800'}`}
                  >
                    {option.code != null && (
                      <span dir="ltr" className="w-8 flex-none text-center font-space text-sm font-bold tabular-nums text-slate-400">
                        {String(option.code).padStart(2, '0')}
                      </span>
                    )}
                    <span className="min-w-0 flex-1">
                      {option.label}
                      {option.hint && <span className="block font-inter text-xs font-normal text-slate-500">{option.hint}</span>}
                    </span>
                    {isSelected && <Check size={18} className="flex-none" aria-hidden="true" />}
                  </li>,
                ];
              })}
            </ul>
          </div>
        </div>,
      )}
    </div>
  );

  function wrap(node) {
    return asSheet ? createPortal(<div dir="rtl">{node}</div>, document.body) : node;
  }
});

export default SearchSelect;
