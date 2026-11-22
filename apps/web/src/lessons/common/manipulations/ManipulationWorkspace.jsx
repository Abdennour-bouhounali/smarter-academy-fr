import { useCallback, useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DEFAULT_MANIPULATION_LEVEL, resolveLevelId } from '@smarter-academy/core/curriculum/manipulationLevels.js';
import ManipulationLevelSelector from './ManipulationLevelSelector';
import { availableLevels, activeLevel, panelKey } from './workspaceLevels';
import { WorkspaceLevelContext } from './workspaceContext';
import { ClassroomHidden } from '../classroom';

/**
 * LE WORKSPACE — UN seul atelier, deux niveaux (§3 et §16 du brief).
 *
 *   ┌──────────────────────────────────────────┐
 *   │  الأنشطة التفاعلية  [ مبتدئ ] [ متقدم ]   │
 *   ├──────────────────────────────────────────┤
 *   │           LA MANIPULATION ACTIVE          │
 *   └──────────────────────────────────────────┘
 *
 * Ce qu'il garantit, et qu'aucune leçon ne réimplémente :
 *
 *   • DÉFAUT DÉBUTANT. `resolveLevelId` borne toute valeur venue d'ailleurs ;
 *     un niveau inconnu retombe sur « مبتدئ », jamais sur un écran vide.
 *   • PAS DE SECONDE PAGE. Le module ne navigue pas, la leçon ne change pas,
 *     rien n'est remonté au-dessus.
 *   • L'ÉTAT SURVIT AU CHANGEMENT DE NIVEAU. Les deux niveaux sont TOUJOURS
 *     rendus, au même endroit de l'arbre React ; le niveau inactif porte
 *     `hidden` — exactement le procédé des unités de ContentModule et pour la
 *     même raison : démonter perdrait les équipes formées, les tailles
 *     essayées, la phase atteinte. Revenir sur « مبتدئ » retrouve la scène
 *     telle qu'on l'a laissée.
 *   • `hidden` (et non `display:none` en CSS) retire aussi le sous-arbre de
 *     l'arbre d'accessibilité et du parcours de tabulation : un lecteur
 *     d'écran ne lit jamais le niveau caché, et Tab ne s'y perd pas.
 *   • UN SEUL SÉLECTEUR. Chaque panneau fournit son niveau par
 *     `WorkspaceLevelContext` : la manipulation qu'il contient sait qu'elle
 *     est dans un workspace et n'affiche pas son propre sélecteur.
 *   • RÉINITIALISATION SÛRE. Quand le MODÈLE mathématique change (la leçon
 *     passe d'autres nombres), la clé `modelKey` remonte les deux niveaux :
 *     c'est le seul cas où l'état doit disparaître, parce qu'il décrirait une
 *     mathématique qui n'est plus à l'écran.
 *
 * USAGE — `levels` est un objet { beginner, advanced } dont chaque valeur est
 * une fonction `({ level, isActive }) => ReactNode`. La FONCTION importe :
 * elle laisse le niveau inactif se rendre sans rien recalculer d'inutile,
 * tout en restant monté.
 *
 *   <ManipulationWorkspace
 *     title="الأنشطة التفاعلية"
 *     levels={{
 *       beginner: () => <Manipulation type="team-builder" total={15} groups={3} />,
 *       advanced: () => <Manipulation type="team-builder" total={420} groups={28} mode="free" />,
 *     }}
 *     onLevelChange={(id) => …}
 *   />
 *
 * CONTRAT DOM (e2e) :
 *   [data-manipulation-workspace] [data-level=<actif>]
 *   [data-manipulation-level-panel=<id>] [hidden] sur les panneaux inactifs
 */
export default function ManipulationWorkspace({
  levels,
  title,
  lead,
  defaultLevel = DEFAULT_MANIPULATION_LEVEL,
  modelKey = '',
  onLevelChange,
  className = '',
}) {
  const { t } = useTranslation('lesson');
  const [level, setLevel] = useState(() => resolveLevelId(defaultLevel));
  const labelId = useId();
  const idPrefix = useId();

  const change = useCallback((next) => {
    const id = resolveLevelId(next);
    setLevel(id);
    onLevelChange?.(id);
  }, [onLevelChange]);

  // Les décisions (quels onglets, lequel est actif, quelle clé de montage)
  // vivent dans `workspaceLevels.js` — pur, donc testé directement.
  const available = availableLevels(levels);
  const active = activeLevel(levels, level);
  if (!active) return null;

  return (
    <section
      className={`space-y-3 rounded-3xl border-indigo-200 bg-white/60 border-2 p-4 ${className}`}
      data-manipulation-workspace
      data-level={active}
      aria-label={title ?? t('manipulation.level.title')}
    >
      <header className="space-y-2">
        {title && <h3 className="font-bold text-slate-900 text-lg">{title}</h3>}
        {available.length > 1 && (
          <ManipulationLevelSelector levels={available} value={active} onChange={change} labelledBy={labelId} idPrefix={idPrefix} controlsPanels />
        )}
        {/* Au projecteur, l'enseignant dit la consigne : la hauteur va aux laboratoires. */}
        {lead && <ClassroomHidden><p className="text-sm text-slate-700">{lead}</p></ClassroomHidden>}
      </header>

      {available.map((id) => {
        const isActive = id === active;
        return (
          <div
            // `modelKey` : changer de modèle mathématique REMONTE les niveaux.
            // C'est la seule réinitialisation, et elle est voulue.
            key={panelKey(id, modelKey)}
            id={`${idPrefix}-panel-${id}`}
            role="tabpanel"
            aria-labelledby={available.length > 1 ? `${idPrefix}-tab-${id}` : undefined}
            data-manipulation-level-panel={id}
            hidden={!isActive}
          >
            <WorkspaceLevelContext.Provider value={id}>
              {levels[id]({ level: id, isActive })}
            </WorkspaceLevelContext.Provider>
          </div>
        );
      })}
    </section>
  );
}
