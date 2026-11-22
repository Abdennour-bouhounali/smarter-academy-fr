import { useTranslation } from 'react-i18next';
import { Delete, ArrowLeft, ArrowRight } from 'lucide-react';

/**
 * « لوحة الرموز » — une lettre FIXE, toujours visible à côté du champ (conseil du 2026-11-09).
 * Ce n'est PAS le clavier flottant de MathLive (un singleton global qui couvre la carte) :
 * des boutons de la page qui écrivent dans LE champ de la question (`getField()`).
 *
 *  - `pointerdown` est annulé : toucher une touche ne fait jamais perdre le focus au champ
 *    (sinon, sur tablette, le curseur sautait et le clavier du système se refermait/rouvrait) ;
 *  - l'insertion passe par les commandes de MathLive, puis un `input` est émis pour que le
 *    champ remonte sa valeur comme pour une frappe ;
 *  - la grille est LTR : on écrit une formule de gauche à droite, même dans une page arabe.
 */
export default function MathPad({ keys, getField, disabled = false }) {
  const { t } = useTranslation('student');

  const press = (key) => {
    const field = getField?.();
    if (!field || disabled) return;
    field.focus();
    try {
      if (key.command) field.executeCommand(key.command);
      else field.executeCommand(['insert', key.latex, { format: 'latex', selectionMode: 'placeholder', insertionMode: 'replaceSelection', focus: true }]);
    } catch { /* MathLive pas encore prêt */ }
    field.dispatchEvent(new Event('input', { bubbles: true }));
  };

  const label = (key) => {
    switch (key.id) {
      case 'frac':
        return (
          <span className="inline-flex items-center gap-2">
            <span aria-hidden="true" className="inline-flex flex-col items-center leading-none">
              <span className="block h-3.5 w-4 rounded-sm border-2 border-current" />
              <span className="my-0.5 block h-0.5 w-6 bg-current" />
              <span className="block h-3.5 w-4 rounded-sm border-2 border-current" />
            </span>
            <span>{t('practice.mathPad.frac')}</span>
          </span>
        );
      case 'back': return <Delete size={20} aria-hidden="true" />;
      case 'left': return <ArrowLeft size={20} aria-hidden="true" />;
      case 'right': return <ArrowRight size={20} aria-hidden="true" />;
      case 'minus': return '−';
      case 'comma': return ',';
      case 'sqrt': return '√□';
      case 'power': return <span>a<sup>n</sup></span>;
      default: return key.id;
    }
  };

  const tone = (key) => {
    if (key.id === 'frac') return 'col-span-4 bg-nav-accent text-white hover:bg-[#3350c4] shadow-[0_3px_0_#3730a3]';
    if (key.kind === 'digit') return 'bg-white text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50';
    if (key.kind === 'symbol') return 'bg-nav-accent-soft text-indigo-900 ring-1 ring-indigo-200 hover:bg-indigo-100';
    return 'bg-slate-100 text-slate-700 ring-1 ring-slate-200 hover:bg-slate-200';
  };

  return (
    <div
      dir="ltr"
      role="group"
      aria-label={t('practice.mathPad.label')}
      className={`grid w-full max-w-[15rem] shrink-0 grid-cols-4 gap-1.5 rounded-2xl bg-slate-50 p-2 ring-1 ring-slate-200 ${disabled ? 'opacity-50' : ''}`}
      data-math-pad
    >
      {keys.map((key) => (
        <button
          key={key.id}
          type="button"
          tabIndex={-1}
          disabled={disabled}
          aria-label={key.kind === 'digit' ? key.id : t(`practice.mathPad.${key.id}`)}
          onPointerDown={(e) => e.preventDefault()}
          onClick={() => press(key)}
          className={`flex h-11 items-center justify-center rounded-xl text-lg font-black transition focus:outline-none disabled:cursor-not-allowed ${tone(key)}`}
          data-pad-key={key.id}
        >
          {label(key)}
        </button>
      ))}
    </div>
  );
}
