import { useEffect, useId, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, Lightbulb, BookOpen, StickyNote, Shuffle, Eye, EyeOff } from 'lucide-react';
import { ArrowForward } from '../../../components/common/DirectionalIcons.jsx';
import MathText from '../../../lessons/common/components/MathText.jsx';
import './labKit.css';

/**
 * LE PETIT OUTILLAGE PÉDAGOGIQUE partagé par les laboratoires de l’atelier.
 *
 * Trois pièces, et seulement celles qui simplifient vraiment :
 *
 *   <LabDisclosure kind="why|rule|next|note">  « Pourquoi ? » / « La règle » … repliés par défaut :
 *                                               EXPLORER d'abord, COMPRENDRE à la demande (§15 du cahier)
 *   <ExamplePicker examples onPick>             les exemples choisis, par niveau (Débutant / Intermédiaire / Avancé)
 *   <StepList steps active>                     un raisonnement pas à pas : LaTeX + une phrase par pas
 *
 * Aucune ne calcule : elles affichent ce que les modules purs ont déjà dit.
 * Les chaînes viennent de `mathlab.json › kit.*`.
 */

const DISCLOSURE_ICONS = { why: Lightbulb, rule: BookOpen, next: ArrowForward, note: StickyNote };

/** Un pli : fermé à l'ouverture, un vrai bouton `aria-expanded`. */
export function LabDisclosure({ kind = 'why', title = null, defaultOpen = false, children, dataAttr = null }) {
  const { t } = useTranslation('mathlab');
  const [open, setOpen] = useState(defaultOpen);
  const id = useId();
  const Icon = DISCLOSURE_ICONS[kind] ?? Lightbulb;

  return (
    <div className={`sa-ml-kit-disclosure sa-ml-kit-disclosure--${kind}${open ? ' is-open' : ''}`} {...(dataAttr ? { [dataAttr]: open ? 'open' : 'closed' } : {})}>
      <button
        type="button"
        className="sa-ml-kit-disclosure__toggle"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((value) => !value)}
      >
        <Icon size={15} aria-hidden="true" />
        <span>{title ?? t(`kit.disclosure.${kind}`)}</span>
        <ChevronDown size={15} aria-hidden="true" className="sa-ml-kit-disclosure__chevron" />
      </button>
      {open && <div className="sa-ml-kit-disclosure__body" id={id}>{children}</div>}
    </div>
  );
}

/**
 * Les exemples d'un outil, rangés par niveau. `examples` :
 * `[{ id, level: 'beginner'|'intermediate'|'advanced', label }]`. Un bouton
 * « Exemple au hasard » s'ajoute quand `onRandom` est fourni.
 */
export function ExamplePicker({ examples, onPick, onRandom = null, activeId = null, dataAttr = 'data-ml-example' }) {
  const { t } = useTranslation('mathlab');
  const levels = ['beginner', 'intermediate', 'advanced'].filter((level) => examples.some((example) => example.level === level));

  return (
    <div className="sa-ml-kit-examples" role="group" aria-label={t('kit.examples.label')}>
      <p className="sa-ml-kit-examples__title">{t('kit.examples.label')}</p>
      {levels.map((level) => (
        <div key={level} className="sa-ml-kit-examples__row">
          <span className={`sa-ml-kit-examples__level sa-ml-kit-examples__level--${level}`}>{t(`kit.levels.${level}`)}</span>
          <div className="sa-ml-kit-examples__chips">
            {examples.filter((example) => example.level === level).map((example) => (
              <button
                key={example.id}
                type="button"
                className={`sa-ml-kit-chip${activeId === example.id ? ' is-active' : ''}`}
                aria-pressed={activeId === example.id}
                onClick={() => onPick(example.id)}
                {...{ [dataAttr]: example.id }}
              >
                <span dir={labelDirection(example.label)} className="sa-ml-kit-chip__label">{example.label}</span>
              </button>
            ))}
          </div>
        </div>
      ))}
      {onRandom && (
        <button type="button" className="sa-ml-kit-chip sa-ml-kit-chip--random" onClick={onRandom} data-ml-example-random>
          <Shuffle size={14} aria-hidden="true" />
          {t('kit.examples.random')}
        </button>
      )}
    </div>
  );
}

/**
 * La nature d'une étiquette d'exemple, portée par `dir` : une NOTATION
 * (« (3 + 4) × 5 », « 84 ; 36 », « x + y = 10 ») est posée `ltr` — et la
 * feuille de style lui donne la fonte à chasse fixe ; une étiquette en
 * PHRASE (« Tirage sans remise ») est `auto`, dans la fonte du texte. Une
 * phrase se reconnaît à un mot d'au moins quatre lettres ; une notation n'a
 * que des lettres isolées ou des noms courts (sin, cos, ln).
 */
export function labelDirection(label) {
  return /\p{L}{4,}/u.test(String(label)) ? 'auto' : 'ltr';
}

/**
 * Un raisonnement pas à pas. `steps` : `[{ latex?, text?, operation?, operationLatex?, note?, tone? }]`.
 * `operation` / `operationLatex` : ce qui a CHANGÉ à ce pas (« On soustrait 3 aux deux membres »,
 * `-3`), en pastille orange au-dessus du nouvel état — l'élève voit l'opération,
 * pas seulement la formule suivante.
 * Avec `revealUpTo`, les pas FUTURS ne sont pas rendus du tout (ni grisés, ni cachés en CSS).
 * `active` (optionnel) : l'indice du pas mis en avant — les pas suivants sont
 * masqués quand `revealUpTo` est donné (le déroulé « Ligne suivante »).
 * Le LaTeX est rendu par MathText, donc isolé en LTR ; la phrase suit la page.
 */
export function StepList({ steps, revealUpTo = null, active = null, label = null, dataAttr = 'data-ml-steps' }) {
  const shown = revealUpTo === null ? steps : steps.slice(0, revealUpTo + 1);
  const currentRef = useRef(null);
  const currentIndex = active ?? shown.length - 1;

  // Dans un déroulé, le pas qui vient d'apparaître est amené au centre de l'écran.
  useEffect(() => {
    if (revealUpTo === null || revealUpTo < 0) return;
    const node = currentRef.current;
    if (!node?.scrollIntoView) return;
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    node.scrollIntoView({ block: 'center', inline: 'nearest', behavior: reduced ? 'auto' : 'smooth' });
  }, [revealUpTo]);

  return (
    <ol className="sa-ml-kit-steps" aria-label={label ?? undefined} {...{ [dataAttr]: shown.length }}>
      {shown.map((step, index) => (
        <li
          // L'indice EST l'identité d'un pas : la liste ne se réordonne jamais.
          // eslint-disable-next-line react/no-array-index-key
          key={index}
          ref={index === currentIndex ? currentRef : undefined}
          className={`sa-ml-kit-steps__item${index === currentIndex ? ' is-current' : ''}${step.tone ? ` sa-ml-kit-steps__item--${step.tone}` : ''}`}
        >
          <span className="sa-ml-kit-steps__index" aria-hidden="true">{index + 1}</span>
          <div className="sa-ml-kit-steps__content">
            {step.text && <p className="sa-ml-kit-steps__text">{step.text}</p>}
            {(step.operation || step.operationLatex) && (
              <p className="sa-ml-kit-steps__operation" data-ml-step-operation>
                {step.operation && <span><MathText>{step.operation}</MathText></span>}
                {step.operationLatex && <bdi dir="ltr"><MathText>{`$${step.operationLatex}$`}</MathText></bdi>}
              </p>
            )}
            {step.latex && (
              <div className="sa-ml-kit-steps__math" dir="ltr">
                <MathText>{`$${step.latex}$`}</MathText>
              </div>
            )}
            {step.note && <p className="sa-ml-kit-steps__note">{step.note}</p>}
          </div>
        </li>
      ))}
    </ol>
  );
}

/**
 * Un message que l'élève peut lire — jamais `NaN`, jamais une pile d'appels.
 * `tone` : `error` (refus motivé, `role="alert"`), `info`, `success`.
 */
export function LabMessage({ tone = 'info', children, id = undefined }) {
  return (
    <p id={id} className={`sa-ml-kit-message sa-ml-kit-message--${tone}`} role={tone === 'error' ? 'alert' : undefined}>
      {children}
    </p>
  );
}

/** La préférence « montré / caché » d'un panneau : une commodité par navigateur. */
function readPanelOpen(id, fallback) {
  if (!id) return fallback;
  try {
    const raw = window.localStorage.getItem(`sa-ml-panel:${id}`);

    return raw === null ? fallback : raw === '1';
  } catch {
    return fallback;
  }
}

function writePanelOpen(id, open) {
  if (!id) return;
  try { window.localStorage.setItem(`sa-ml-panel:${id}`, open ? '1' : '0'); } catch { /* aperçu : ignoré */ }
}

/**
 * UN BLOC QU'ON PEUT MASQUER — la règle « tout d'un seul regard » (MATH_LAB §3.5).
 *
 * Quand un outil porte plus que ce qu'un écran montre, l'élève garde ce dont
 * il a besoin sous les yeux et replie le reste : le titre reste, avec un
 * bouton œil « Masquer / Afficher ». Ouvert par défaut (rien n'est caché d'office),
 * l'état est mémorisé par navigateur sous `id` (clé stable, ex.
 * `numberLab.fractions.line`).
 */
export function LabPanel({ id = null, title, children, defaultOpen = true, className = '', dataAttr = null, actions = null }) {
  const { t } = useTranslation('mathlab');
  const [open, setOpen] = useState(() => readPanelOpen(id, defaultOpen));
  const bodyId = useId();
  const toggle = () => setOpen((value) => { writePanelOpen(id, !value); return !value; });

  return (
    <section className={`sa-ml-kit-panel${open ? '' : ' is-collapsed'} ${className}`.trim()} {...(dataAttr ? { [dataAttr]: open ? 'open' : 'closed' } : {})}>
      <header className="sa-ml-kit-panel__head">
        <h4 className="sa-ml-kit-panel__title">{title}</h4>
        {actions}
        <button
          type="button"
          className="sa-ml-kit-panel__toggle"
          aria-expanded={open}
          aria-controls={bodyId}
          onClick={toggle}
          data-ml-panel-toggle={id ?? ''}
        >
          {open ? <EyeOff size={14} aria-hidden="true" /> : <Eye size={14} aria-hidden="true" />}
          <span>{t(open ? 'kit.panel.hide' : 'kit.panel.show')}</span>
        </button>
      </header>
      {open && <div className="sa-ml-kit-panel__body" id={bodyId}>{children}</div>}
    </section>
  );
}
