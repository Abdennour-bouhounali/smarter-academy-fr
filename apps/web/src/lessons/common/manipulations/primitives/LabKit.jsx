import { Minus, Plus, Check } from 'lucide-react';

/**
 * LE KIT VISUEL DES LABOS (2026-10-14, 1AM) — les pièces HTML partagées par les manipulations pour élèves de 11–13 ans :
 * une carte de consigne (puce de question, grande phrase, lampe), des cartes de réponse larges, une carte de commande
 * (titre, GRANDE lecture, deux boutons ronds −/+, l'indice du geste), des pilules de nom, le cadre lavande de la scène
 * et une note douce. Contrat : MANIPULATION_CONTRACT.md §8ter.
 *
 * Règles du kit :
 * - aucun texte en dur : tout libellé vient du type (lesson.manipulation.json) ;
 * - les attributs `data-*` / `aria-*` du type passent tels quels (`...rest`, `lessProps`, `moreProps`) : un labo garde
 *   son contrat DOM en adoptant le kit ;
 * - cibles ≥ 44 px (les ronds −/+ font 56 px, 48 px en `row`) ; chiffres et unités en îlot LTR (`bdi dir="ltr"`) ;
 * - la note (`LabNote`) GUIDE le geste, elle ne donne JAMAIS la règle à découvrir (« discover, don't be told »).
 */

const ring = 'outline-none focus-visible:ring-4 focus-visible:ring-indigo-300';

/** Une carte blanche, coins larges, ombre douce teintée indigo. */
export function LabCard({ as: Tag = 'div', className = '', children, ...rest }) {
  return (
    <Tag className={`rounded-3xl border border-indigo-100 bg-white shadow-[0_12px_32px_-20px_rgba(67,56,202,0.45)] ${className}`} {...rest}>
      {children}
    </Tag>
  );
}

/** Le cadre lavande d'une scène dessinée. */
export function StageFrame({ className = '', children, ...rest }) {
  return (
    <div className={`relative rounded-3xl border border-indigo-100 bg-gradient-to-b from-[#F4F5FF] via-[#F1F2FF] to-[#ECEEFF] ${className}`} {...rest}>
      {children}
    </div>
  );
}

/** La puce de question (« من الأطول؟ ») : une icône lucide + un texte court. */
function QuestionChip({ icon: Icon, children, className = '' }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-sm font-bold text-indigo-700 ${className}`}>
      {Icon && <Icon className="h-4 w-4" aria-hidden="true" />}
      {children}
    </span>
  );
}

/**
 * La carte de consigne. `chip` (la puce de question) et `aside` (des jalons, un compteur) partagent la rangée du haut ;
 * `title` est la phrase de l'histoire (grande, épaisse) ; `lamp` ('off' | 'on' | null) l'allume
 * quand elle devient vraie ; `instruction` dit le geste ; `children` (les cartes de réponse…) vient dessous.
 * `size` 'lg' (≥ 520 px) ou 'md' (téléphone) ; `titleClassName` remplace la taille du titre (un labo très étroit).
 *
 * CONTEXTE PUIS QUESTION (MANIPULATION_DNA §17.9, 2026-10-14) : `context` (une ou deux phrases simples qui donnent TOUS
 * les nombres) ouvre la carte, `aside` à côté ; `title` est alors LA question directe qui nomme le but et l'état final
 * (« اربط الأقلام حتى تستطيع كتابة عدد الأقلام. ») ; `aside` (jalons, compteurs, lectures) passe SOUS la question. Un labo
 * §17.9 ne passe pas de `chip` (une puce qui ne fait que nommer le labo est un titre déguisé).
 * DOM : [data-lab-context], [data-lab-question], [data-lab-aside].
 */
export function PromptCard({ chip, chipIcon, aside, context, contextProps = {}, title, lamp = null, instruction, size = 'lg', titleClassName, className = '', children, titleProps = {}, ...rest }) {
  const on = lamp === 'on';
  return (
    <LabCard className={`${size === 'lg' ? 'space-y-3 p-5' : 'space-y-2 p-3'} ${className}`} {...rest}>
      {(chip || (aside && !context)) && (
        <div className="flex flex-wrap items-center justify-between gap-2">
          {chip && <QuestionChip icon={chipIcon}>{chip}</QuestionChip>}
          {!context && aside}
        </div>
      )}
      {context && (
        <p className={`font-semibold leading-relaxed text-slate-700 ${size === 'lg' ? 'text-lg' : 'text-[15px]'}`} data-lab-context {...contextProps}>{context}</p>
      )}
      {title && (
        <p className={`flex items-start gap-2.5 font-black leading-snug text-indigo-950 ${titleClassName ?? (size === 'lg' ? 'text-2xl' : 'text-lg')}`} data-lab-question={context ? '' : undefined} {...titleProps}>
          {lamp && (
            <span aria-hidden="true"
              className={`mt-1.5 inline-flex shrink-0 items-center justify-center rounded-full border-2 transition-all duration-300 motion-reduce:transition-none ${size === 'lg' ? 'h-6 w-6' : 'h-5 w-5'} ${on ? 'border-emerald-500 bg-emerald-400 text-white shadow-[0_0_12px_rgba(52,211,153,0.9)]' : 'border-slate-300 bg-slate-100 text-transparent'}`}>
              <Check className="h-3.5 w-3.5" strokeWidth={3.5} />
            </span>
          )}
          <span>{title}</span>
        </p>
      )}
      {context && aside && <div className="flex flex-wrap items-center gap-2" data-lab-aside>{aside}</div>}
      {instruction && <p className={`font-semibold text-slate-600 ${size === 'lg' ? 'text-base' : 'text-xs'}`}>{instruction}</p>}
      {children}
    </LabCard>
  );
}

/** La grille des cartes de réponse (dans une carte au fond très clair, comme un plateau). */
export function ChoiceTray({ cols = 3, className = '', children, ...rest }) {
  const grid = cols === 1 ? 'grid-cols-1' : cols === 2 ? 'grid-cols-2' : cols === 3 ? 'grid-cols-3' : 'grid-cols-4';
  return (
    <div className={`grid rounded-2xl border border-indigo-50 bg-[#FAFAFF] gap-2.5 p-2.5 ${grid} ${className}`} {...rest}>
      {children}
    </div>
  );
}

const CHOICE_STATES = {
  idle: 'border-indigo-100 bg-white text-indigo-950 shadow-[0_4px_0_0_#E0E3FF] hover:-translate-y-0.5 hover:border-indigo-300 active:translate-y-0.5 active:shadow-none',
  selected: 'border-indigo-500 bg-indigo-50 text-indigo-950 shadow-[0_4px_0_0_#C7CBFF]',
  right: 'border-emerald-500 bg-emerald-500 text-white shadow-[0_4px_0_0_#059669]',
  tried: 'border-rose-200 bg-rose-50 text-rose-700 line-through decoration-2',
  locked: 'border-slate-200 bg-white/70 text-slate-400',
};

/**
 * Une carte de réponse : grande, épaisse, « posée » sur un rebord (ombre basse), qui s'enfonce sous le doigt.
 * `state` : 'idle' | 'selected' | 'right' | 'tried' | 'locked' ; `ltr` : contenu en îlot LTR (un calcul) ;
 * `size` : 'lg' (≥ 520 px), 'md' (téléphone), 'sm' (sous 300 px de large).
 */
export function ChoiceCard({ state = 'idle', ltr = false, size = 'lg', className = '', children, ...rest }) {
  return (
    <button type="button"
      className={`flex items-center justify-center whitespace-nowrap rounded-2xl border-2 font-black transition-all duration-150 motion-reduce:transition-none disabled:cursor-default ${size === 'lg' ? 'min-h-[56px] px-3 text-2xl' : size === 'md' ? 'min-h-[46px] px-1.5 text-base' : 'min-h-[44px] px-1 text-sm'} ${CHOICE_STATES[state] ?? CHOICE_STATES.idle} ${ring} ${className}`}
      {...rest}>
      {ltr ? <bdi dir="ltr" className="tabular-nums">{children}</bdi> : children}
    </button>
  );
}

/** Un bouton rond (−/+). `primary` : plein indigo dégradé ; sinon contour. */
export function RoundButton({ primary = false, size = 56, className = '', children, ...rest }) {
  return (
    <button type="button"
      style={{ width: size, height: size }}
      className={`flex shrink-0 items-center justify-center rounded-full border-2 transition-all duration-150 motion-reduce:transition-none disabled:cursor-not-allowed disabled:opacity-40 ${primary ? 'border-indigo-600 bg-gradient-to-b from-indigo-500 to-indigo-600 text-white shadow-[0_8px_18px_-8px_rgba(79,70,229,0.9)] hover:brightness-110 active:scale-95' : 'border-indigo-200 bg-white text-indigo-700 hover:border-indigo-400 active:scale-95'} ${ring} ${className}`}
      {...rest}>
      {children}
    </button>
  );
}

/**
 * La carte de commande : `title`, la GRANDE lecture `value` `unit`, les ronds −/+ (`onLess`/`onMore`, désactivables,
 * libellés `lessLabel`/`moreLabel`, attributs `lessProps`/`moreProps`), et l'indice du geste (`hint` + `hintIcon`).
 * `layout` 'card' (colonne, à côté de la scène) ou 'row' (une rangée − lecture + sous la scène, téléphone).
 */
export function StepperCard({
  title, value, unit, onLess, onMore, lessDisabled = false, moreDisabled = false, lessLabel, moreLabel,
  lessProps = {}, moreProps = {}, readoutProps = {}, hint, hintIcon: HintIcon, layout = 'card', className = '', children, ...rest
}) {
  const readout = (
    <div className={`flex items-baseline justify-center gap-1.5 rounded-2xl border border-indigo-100 bg-[#F5F6FF] ${layout === 'row' ? 'min-w-[120px] flex-1 px-3 py-1.5' : 'px-4 py-2.5'}`} {...readoutProps}>
      <bdi dir="ltr" className="flex items-baseline gap-1.5">
        <span className={`font-black tabular-nums text-indigo-900 ${layout === 'row' ? 'text-3xl' : 'text-5xl'}`}>{value}</span>
        {unit && <span className={`font-extrabold text-indigo-700 ${layout === 'row' ? 'text-lg' : 'text-2xl'}`}>{unit}</span>}
      </bdi>
    </div>
  );
  const minus = (
    <RoundButton onClick={onLess} disabled={lessDisabled} aria-label={lessLabel} size={layout === 'row' ? 48 : 56} {...lessProps}>
      <Minus className="h-6 w-6" strokeWidth={3} aria-hidden="true" />
    </RoundButton>
  );
  const plus = (
    <RoundButton primary onClick={onMore} disabled={moreDisabled} aria-label={moreLabel} size={layout === 'row' ? 48 : 56} {...moreProps}>
      <Plus className="h-6 w-6" strokeWidth={3} aria-hidden="true" />
    </RoundButton>
  );
  if (layout === 'row') {
    return (
      <LabCard className={`flex items-center gap-2 p-2 ${className}`} {...rest}>
        <div className="flex w-full items-center gap-2" dir="ltr">{minus}{readout}{plus}</div>
        {children}
      </LabCard>
    );
  }
  return (
    <LabCard className={`flex flex-col gap-3 p-4 ${className}`} {...rest}>
      {title && <p className="text-center text-lg font-black text-indigo-950">{title}</p>}
      {readout}
      <div className="flex items-center justify-center gap-4" dir="ltr">{minus}{plus}</div>
      {hint && (
        <p className="flex items-center gap-2 rounded-2xl bg-[#F5F6FF] px-2.5 py-2 text-xs font-bold leading-snug text-slate-600">
          {HintIcon && <HintIcon className="h-5 w-5 shrink-0 text-indigo-500" aria-hidden="true" />}
          <span>{hint}</span>
        </p>
      )}
      {children}
    </LabCard>
  );
}

/** La pilule de nom sous un personnage ou un objet. `active` : pleine (celui que l'élève tient). */
export function NamePill({ active = false, className = '', children, ...rest }) {
  return (
    <span className={`inline-flex items-center justify-center whitespace-nowrap rounded-full px-4 py-1 text-base font-black ${active ? 'bg-gradient-to-b from-indigo-500 to-indigo-600 text-white shadow-[0_6px_14px_-8px_rgba(79,70,229,0.9)]' : 'bg-indigo-100 text-indigo-900'} ${className}`} {...rest}>
      {children}
    </span>
  );
}

/**
 * Le bandeau de verdict (une ligne écrite par le geste) : vert juste, ambre « presque », rose refusé, indigo neutre.
 * La taille passe par `size` ('md' | 'sm' | 'xs') — une classe `text-*` dans `className` perdrait contre la classe de base.
 */
export function VerdictBanner({ tone = 'indigo', icon: Icon, size = 'md', className = '', children, ...rest }) {
  const tones = {
    emerald: 'border-emerald-300 bg-emerald-50 text-emerald-900',
    amber: 'border-amber-300 bg-amber-50 text-amber-900',
    rose: 'border-rose-300 bg-rose-50 text-rose-900',
    indigo: 'border-indigo-100 bg-[#F5F6FF] text-indigo-950',
  };
  // opaque : un verdict peut flotter sur une scène (HUD) — il reste lisible
  return (
    <div role="status" aria-live="polite" className={`flex items-start gap-2.5 rounded-2xl border-2 px-4 py-2.5 font-extrabold leading-snug ${size === 'sm' ? 'text-sm' : size === 'xs' ? 'text-[13px]' : 'text-base'} ${tones[tone] ?? tones.indigo} ${className}`} {...rest}>
      {Icon && <Icon className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />}
      <div className="min-w-0">{children}</div>
    </div>
  );
}
