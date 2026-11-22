import { useCallback, useRef } from 'react';
import './labKit.css';

/**
 * LA BARRE DES LABORATOIRES d'un instrument — partagée par les مختبرات qui
 * rassemblent plusieurs outils sous un même toit (الجبر، الاحتمالات والإحصاء،
 * الأعداد والحساب).
 *
 * Un instrument = UN document, UNE route ; les sections ne sont PAS des pages
 * (MATH_LAB.md §5l.2 : un élève qui passe d'un outil à l'autre travaille sur
 * un seul objet). La barre ne change que ce qui est affiché — chaque section
 * garde ses propres valeurs dans l'état du document.
 *
 * Accessibilité : un `tablist` WAI-ARIA avec focus itinérant ; les flèches
 * suivent le SENS DE LECTURE (← avance en arabe), Début/Fin sautent aux
 * extrémités. L'icône n'est jamais seule : chaque puce porte son nom, et la
 * description de la section active est lue sous la barre (et en `title`).
 *
 * @param {object} props
 * @param {Array<{id: string, icon?: import('react').ComponentType, label: string, description?: string, group?: string}>} props.sections
 * @param {string} props.active
 * @param {(id: string) => void} props.onChange
 * @param {string} props.label             nom accessible de la barre
 * @param {string} [props.dataAttr]        attribut `data-*` posé sur chaque puce (valeur = id) — pour les e2e existants
 * @param {Record<string, string>} [props.groupLabels]  titre lisible de chaque groupe
 * @param {boolean} [props.showDescription=true]
 */
export default function LabSectionNav({
  sections, active, onChange, label, dataAttr = 'data-ml-section', groupLabels = null, showDescription = true,
}) {
  const listRef = useRef(null);
  const activeSection = sections.find((section) => section.id === active) ?? sections[0];

  const onKeyDown = useCallback((event) => {
    const keys = ['ArrowLeft', 'ArrowRight', 'Home', 'End'];
    if (!keys.includes(event.key)) return;
    event.preventDefault();
    const rtl = getComputedStyle(listRef.current ?? document.body).direction === 'rtl';
    const index = sections.findIndex((section) => section.id === active);
    let next = index;
    if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = sections.length - 1;
    else {
      const forward = (event.key === 'ArrowLeft') === rtl;
      next = (index + (forward ? 1 : -1) + sections.length) % sections.length;
    }
    const target = sections[next];
    onChange(target.id);
    listRef.current?.querySelector(`[data-kit-tab="${target.id}"]`)?.focus();
  }, [sections, active, onChange]);

  return (
    <nav className="sa-ml-kit-nav" aria-label={label}>
      <div className="sa-ml-kit-nav__scroller">
        <div className="sa-ml-kit-nav__list" role="tablist" aria-label={label} ref={listRef} onKeyDown={onKeyDown}>
          {sections.map((section, index) => {
            const Icon = section.icon;
            const selected = section.id === activeSection?.id;
            const startsGroup = groupLabels && section.group && sections[index - 1]?.group !== section.group;

            return (
              <span key={section.id} className="sa-ml-kit-nav__item">
                {startsGroup && index > 0 && <span className="sa-ml-kit-nav__sep" aria-hidden="true" />}
                {startsGroup && (
                  <span className="sa-ml-kit-nav__group" aria-hidden="true">{groupLabels[section.group]}</span>
                )}
                <button
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  tabIndex={selected ? 0 : -1}
                  className={`sa-ml-kit-nav__tab${selected ? ' is-active' : ''}`}
                  title={section.description || section.label}
                  onClick={() => onChange(section.id)}
                  data-kit-tab={section.id}
                  {...{ [dataAttr]: section.id }}
                >
                  {Icon && <Icon size={16} aria-hidden="true" />}
                  <span>{section.label}</span>
                </button>
              </span>
            );
          })}
        </div>
      </div>
      {showDescription && activeSection?.description && (
        <p className="sa-ml-kit-nav__description" data-ml-section-description>{activeSection.description}</p>
      )}
    </nav>
  );
}
