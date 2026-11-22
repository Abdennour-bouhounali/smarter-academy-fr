import { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { FlaskConical } from 'lucide-react';
import { AuthContext } from '../../../context/AuthContext';
import { preloadMathLabOverlay, useMathLabOverlay } from './MathLabOverlayProvider.jsx';

/**
 * « 🧪 L’atelier » — LE POINT D'ENTRÉE de l’atelier depuis une leçon ou une étape.
 *
 * ── Où il est, et pourquoi PAS ailleurs ─────────────────────────────────
 * Dans la RANGÉE DE REPÈRES du haut, à côté du compteur XP et de
 * « Signaler » : une pastille bordée, de la même famille que ses voisines.
 *
 * Il a d'abord été posé dans la colonne flottante du bas (avec « Mon cahier »,
 * « ma fiche », « Afficher »). C'était une erreur : cette colonne portait déjà
 * trois pastilles, une quatrième la faisait monter à 17 rem de hauteur, et
 * sur un écran court elle passait DEVANT le contenu de la leçon. Un outil
 * qu'on ouvre pour lire une leçon ne doit pas commencer par la cacher.
 *
 * La rangée du haut n'a aucun de ces défauts : elle est `sticky`, donc
 * toujours atteignable sans dérouler ; elle est dans le FLUX, donc elle ne
 * recouvre jamais rien ; et c'est déjà là que l'élève cherche les actions
 * du module. Le même raisonnement avait déjà déplacé « Signaler » du bas de
 * page vers cette rangée.
 *
 * Sans compte, pas d’atelier — comme le cahier, comme le signalement. Le
 * visiteur voit la leçon sans le déclencheur.
 *
 * Aucune permission au-delà : l’atelier est ouvert à l'élève comme à
 * l'enseignant (MATH_LAB.md §2, « Access follows the student space »). Ce
 * n'est pas « mode classe », qui reste réservé aux présentateurs — et il
 * RESTE disponible pendant une séance : c'est au tableau, devant la classe,
 * qu'on a le plus besoin de sortir un instrument au milieu d'une
 * explication. La rangée de repères fait partie de ce que la présentation
 * rend, donc le bouton suit sans rien à portaliser.
 */
/**
 * `scope` : le cycle de la leçon (`levelId` du catalogue — « moyen » pour
 * le collège). Le sélecteur s'ouvre sur l’atelier correspondant (labScope.js) ; un
 * identifiant qui n'est pas un atelier est ignoré par le calque.
 */
export default function MathLabEntryButton({ className = '', scope = null }) {
  // Namespace `lesson`, pas `mathlab` : ce bouton est rendu sur CHAQUE page
  // de leçon, alors que `mathlab` (≈ 250 Ko) est chargé à la demande. Le lire
  // ici suspendrait la leçon entière le temps de télécharger le vocabulaire
  // de quatorze instruments (i18n/index.js).
  const { t } = useTranslation('lesson');
  const { token } = useContext(AuthContext);
  const { open, isOpen } = useMathLabOverlay();

  if (!token) return null;

  const label = t('mathLabEntry.openLab');

  return (
    <button
      type="button"
      onClick={() => open(undefined, { scope })}
      // Le calque est un lot à part : on le demande dès que l'intention se
      // devine (survol, focus clavier, doigt posé), pas au clic.
      onPointerEnter={preloadMathLabOverlay}
      onFocus={preloadMathLabOverlay}
      title={label}
      aria-label={label}
      aria-haspopup="dialog"
      aria-expanded={isOpen}
      data-ml-overlay-trigger
      className={`group inline-flex h-11 min-w-[44px] shrink-0 items-center justify-center rounded-full focus:outline-none ${className}`}
    >
      {/* La même pastille que « Signaler » juste à côté : 44 px de cible,
          36 px de visuel. Le mot apparaît à partir de `sm` — sur un
          téléphone la barre n'a pas la place, et l'étiquette accessible
          porte alors seule le sens. */}
      <span className="flex h-9 items-center gap-1.5 rounded-full border border-blue-200 bg-white px-2.5 font-mono text-xs font-bold text-nav-accent shadow-sm transition-colors group-hover:border-blue-300 group-hover:bg-nav-accent-soft group-hover:text-nav-accent group-focus-visible:ring-2 group-focus-visible:ring-blue-400 sm:px-3">
        <FlaskConical size={14} aria-hidden="true" />
        <span className="hidden sm:inline">{t('mathLabEntry.openLabShort')}</span>
      </span>
    </button>
  );
}
