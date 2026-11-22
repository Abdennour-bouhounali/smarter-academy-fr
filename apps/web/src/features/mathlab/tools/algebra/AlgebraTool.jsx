import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Scale, ArrowLeftRight, Crosshair, Combine, Parentheses, LineChart,
} from 'lucide-react';
import './algebra.css';
import LabSectionNav from '../../shared/LabSectionNav.jsx';
import {
  normalizeAlgebraData,
  resetTo,
  createAlgebraData,
  updatePath,
  setSection,
  updateSection,
  enforceSizeBudget,
} from './algebraState.js';
import PathSection from './PathSection.jsx';
import SimplifySection from './SimplifySection.jsx';
import FactorSection from './FactorSection.jsx';
import SystemsSection from './SystemsSection.jsx';
import FunctionsSection from './FunctionsSection.jsx';
import { algebraFeatures, clampToFeatures } from './scope.js';

/** Le délai entre un changement et sa remise à la coquille (qui attend encore avant d'enregistrer). */
const SERIALIZE_MS = 300;

const ICONS = {
  equations: Scale,
  inequalities: ArrowLeftRight,
  systems: Crosshair,
  simplify: Combine,
  factor: Parentheses,
  functions: LineChart,
};

/**
 * L'atelier d'algèbre dans la coquille de l'atelier (MathLabToolProps — toolContract.js).
 *
 * V2 : six SECTIONS sous une même barre (shared/LabSectionNav) — un seul
 * document, une seule route. Chaque section garde ses valeurs dans l'état
 * (algebraState.js) ; passer de l'une à l'autre ne perd rien. La section
 * « Équations » est le laboratoire V1, intact : balance, opérations aux deux
 * membres, historique-annulation, solution jamais à l'ouverture (§5e.6).
 *
 * Toute la mathématique est dans les modules purs ; ce composant ne fait que
 * router l'état et remettre le document à la coquille.
 */
export default function AlgebraTool({ initialData, onChange, onReady, capabilities = null }) {
  const { t } = useTranslation('mathlab');
  // Le scope (scope.js) : au collège, ni discriminant, ni « somme et produit », ni second degré.
  const features = useMemo(() => algebraFeatures(capabilities), [capabilities]);
  const [data, setData] = useState(() => clampToFeatures(normalizeAlgebraData(initialData), features));
  const [announcement, setAnnouncement] = useState('');
  // « Tout effacer » remonte les sections : leurs brouillons et messages repartent de zéro.
  const [generation, setGeneration] = useState(0);

  const timerRef = useRef(null);
  const dataRef = useRef(data);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  dataRef.current = data;

  /** Une modification voulue : appliquée tout de suite, remise à la coquille après SERIALIZE_MS. */
  const commit = useCallback((updater) => {
    setData((current) => {
      const next = typeof updater === 'function' ? updater(current) : updater;
      if (next === current) return current;
      const bounded = enforceSizeBudget(next);
      dataRef.current = bounded;
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        timerRef.current = null;
        onChangeRef.current?.(dataRef.current);
      }, SERIALIZE_MS);

      return bounded;
    });
  }, []);

  useEffect(() => () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      onChangeRef.current?.(dataRef.current);
    }
  }, []);

  useEffect(() => {
    onReady?.({
      clear: () => {
        commit(createAlgebraData(undefined, { capabilities }));
        setGeneration((value) => value + 1);
      },
    });

    return () => onReady?.(null);
  }, [onReady, commit, capabilities]);

  const sections = useMemo(() => features.sections.map((id) => ({
    id,
    icon: ICONS[id],
    label: t(`tools.algebra.sections.${id}.label`),
    description: t(`tools.algebra.sections.${id}.description`),
  })), [t, features]);

  const changeSection = useCallback((id) => {
    if (features.sections.includes(id)) commit((current) => setSection(current, id));
  }, [commit, features]);

  const commitEquations = useCallback((updater) => commit((current) => updatePath(current, 'equations', updater)), [commit]);
  const commitInequalities = useCallback((updater) => commit((current) => updatePath(current, 'inequalities', updater)), [commit]);
  const patch = useCallback((key) => (value) => commit((current) => updateSection(current, key, value)), [commit]);
  const patchSystems = useMemo(() => patch('systems'), [patch]);
  const patchSimplify = useMemo(() => patch('simplify'), [patch]);
  const patchFactor = useMemo(() => patch('factor'), [patch]);
  const patchFunctions = useMemo(() => patch('functions'), [patch]);

  const toggleParameters = useCallback(() => {
    commit((current) => ({ ...current, parameters: current.parameters ? null : { a: 2, b: 3, c: 11 } }));
  }, [commit]);

  const changeParameters = useCallback((next, equation) => {
    commit((current) => ({ ...resetTo(current, equation), parameters: next }));
  }, [commit]);

  const section = data.section;
  const key = `${section}-${generation}`;

  return (
    <div className="sa-ml-alg" role="region" aria-label={t('tools.algebra.name')} data-ml-algebra data-ml-alg-section={section}>
      <LabSectionNav
        sections={sections}
        active={section}
        onChange={changeSection}
        label={t('tools.algebra.sectionsLabel')}
        dataAttr="data-ml-alg-tab"
      />

      {section === 'equations' && (
        <PathSection
          key={key}
          mode="equations"
          path={data}
          commitPath={commitEquations}
          parameters={data.parameters}
          onToggleParameters={toggleParameters}
          onChangeParameters={changeParameters}
          announce={setAnnouncement}
        />
      )}
      {section === 'inequalities' && (
        <PathSection key={key} mode="inequalities" path={data.inequalities} commitPath={commitInequalities} announce={setAnnouncement} />
      )}
      {section === 'systems' && <SystemsSection key={key} value={data.systems} onChange={patchSystems} announce={setAnnouncement} />}
      {section === 'simplify' && <SimplifySection key={key} value={data.simplify} onChange={patchSimplify} announce={setAnnouncement} examples={features.simplify.examples} />}
      {section === 'factor' && <FactorSection key={key} value={data.factor} onChange={patchFactor} announce={setAnnouncement} features={features.factor} />}
      {section === 'functions' && <FunctionsSection key={key} value={data.functions} onChange={patchFunctions} features={features.functions} />}

      {/* Tout état mathématique a une forme TEXTUELLE (§34) */}
      <p className="sa-ml-alg__sr" role="status" aria-live="polite">{announcement}</p>
    </div>
  );
}
