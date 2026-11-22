import { createContext, useContext } from 'react';
import { useClassroomMode } from './ClassroomContext';

/**
 * Le CADRE de présentation d'un contenu écrit pour la page (texte, questions,
 * exercices — tout ce qui est stylé en classes Tailwind, en rem) :
 *
 *   <ClassroomFrame>{contenu de leçon inchangé}</ClassroomFrame>
 *
 * Hors présentation : un wrapper transparent (`display: contents`), le
 * contenu est rendu tel quel. En présentation : une mesure de lecture bornée
 * (`maxWidth`, centrée) et un AGRANDISSEMENT par `zoom` = base × échelle
 * effective. `zoom` est une propriété de mise en page — le contenu est
 * RÉ-AGENCÉ à la nouvelle taille (les lignes se recassent, les grilles se
 * réorganisent) ; ce n'est ni le zoom du navigateur ni un `transform` qui
 * étirerait une image figée. L'échelle vient du moteur d'ajustement
 * (usePresentationFit) : si le contenu déborde, elle baisse ; le moteur
 * mesure le PARENT du cadre, dont la hauteur reflète le contenu zoomé.
 *
 * Le wrapper existe dans les DEUX modes : entrer en présentation ne change
 * pas la forme de l'arbre, donc rien ne se remonte et aucun état n'est perdu.
 * Un cadre DANS un cadre (un exercice dans un module présenté) n'agrandit
 * pas une seconde fois.
 *
 * Une manipulation qui calcule elle-même sa mise en page pour la zone offerte
 * (la bibliothèque) NE se met PAS dans un cadre : elle lit `--sa-classroom-*`.
 */
const CLASSROOM_FRAME_BASE = 1.3;

const FrameContext = createContext(false);

export default function ClassroomFrame({ base = CLASSROOM_FRAME_BASE, maxWidth = 1120, className = '', children }) {
  const { isClassroomMode, scale } = useClassroomMode();
  const inFrame = useContext(FrameContext);
  const framed = isClassroomMode && !inFrame;
  const zoom = framed ? Math.round(base * scale * 1000) / 1000 : undefined;
  return (
    <FrameContext.Provider value={inFrame || framed}>
      <div
        className={`sa-classroom-frame ${framed ? 'sa-classroom-frame--active' : ''} ${className}`}
        style={framed ? { zoom, maxWidth } : undefined}
        data-classroom-frame={framed ? zoom : undefined}
      >
        {children}
      </div>
    </FrameContext.Provider>
  );
}

/**
 * Du chrome de page qui n'a rien à faire sur un projecteur (cahier,
 * signalement, fil d'Ariane…) : rendu hors présentation, retiré pendant.
 * Un `&&` conditionnel garde la place de l'élément dans la liste des
 * enfants, donc ses voisins ne se remontent pas.
 */
export function ClassroomHidden({ children }) {
  const { isClassroomMode } = useClassroomMode();
  return isClassroomMode ? null : children;
}
