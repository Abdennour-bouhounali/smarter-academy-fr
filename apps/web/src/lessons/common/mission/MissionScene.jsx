import FoldStripScene from './FoldStripScene';
import CourtyardSlabsScene from './CourtyardSlabsScene';
import PaintWallScene from './PaintWallScene';
import TifoBannerScene from './TifoBannerScene';
import NightCinemaScene from './NightCinemaScene';
import ShadowSquareScene from './ShadowSquareScene';
import NeighbourhoodPitchScene from './NeighbourhoodPitchScene';
import TurfRollsScene from './TurfRollsScene';
import StandsPitchScene from './StandsPitchScene';
import LockerBalanceScene from './LockerBalanceScene';
import PitchPlannerScene from './PitchPlannerScene';
import PhoneCreditScene from './PhoneCreditScene';
import FamilyHeightsScene from './FamilyHeightsScene';
import CivilRegistryScene from './CivilRegistryScene';
import KioskCardsScene from './KioskCardsScene';
import MuseumDeskScene from './MuseumDeskScene';
import PartyTableScene from './PartyTableScene';
import RugMarketScene from './RugMarketScene';
import FountainPlazaScene from './FountainPlazaScene';
import ClubCounterScene from './ClubCounterScene';

/**
 * LA SCÈNE d'une mission (rollout 2026-11-08) : chaque leçon dessine la sienne, choisie par `mission.scene` dans sa config
 * (les scènes des leçons 1–7 de l'unité 1 — `'library'`, `'library-wall'`, `'construction-wall'`, `'flower-shop'`, `'school-bags'`, `'sewing-workshop'`, `'math-club'` — et celle de la leçon 8, `'bakery'`, ainsi que `'garden-bed'` et `'carpet-loom'`, les scènes des leçons 1 et 2 de l'unité 2, sont supprimées avec leur lecteur de mission : ces leçons sont v2, LESSON_V2.md §2 ; `'fold-strip'` — la bande pliée de la foire scientifique de la leçon muadalat-x-murabba, `'courtyard-slabs'` — la cour de l'école pavée de dalles carrées de la leçon amaliyat-judhur, `'courtyard-big'` — la même cour repavée de dalles plus grandes, leçon tawzif-khawass-judhur, `'paint-wall'` — le mur du stade repeint devant un tréteau en X, leçon aksiya-talis, `'tifo-banner'` — la banderole du derby étendue dans la salle des jeunes, leçon inshaat-talis, `'night-cinema'` — le ciné-club de nuit de la place du quartier, leçon talis-hisab-atwal, `'shadow-square'` — la place à l'heure de l'ombre, la synthèse wadiya-idmajiya-talis). Une nouvelle scène =
 * un composant `<Nom>Scene({ fill, label, className })` dessiné en code, ajouté à ce registre ; `fill` ∈ [0, 1] suit les outils gagnés.
 */
const SCENES = {
  'fold-strip': FoldStripScene,
  'courtyard-slabs': CourtyardSlabsScene,
  // la MÊME cour, repavée de dalles plus GRANDES (leçon tawzif-khawass-judhur, conseil du 2026-11-10) : une variante, pas une scène de plus
  'courtyard-big': CourtyardBigScene,
  // unité 9, leçon 2 aksiya-talis (conseil du 2026-11-10, L2.8) : le mur du stade repeint, le tréteau en X et son niveau — primitives communes de
  // l'unité dans thalesSceneKit.jsx, une scène mince par leçon
  'paint-wall': PaintWallScene,
  // unité 9, leçon 3 inshaat-talis (2026-11-10) : la banderole du « tifo » au sol, le compas et la règle non graduée — mêmes primitives
  'tifo-banner': TifoBannerScene,
  // unité 9, leçon 1 talis-hisab-atwal (2026-11-10) : le ciné-club de nuit — le projecteur, son faisceau, la planche blanche, le grand écran
  'night-cinema': NightCinemaScene,
  // unité 9, la synthèse wadiya-idmajiya-talis (2026-11-10) : la place à l'heure de l'ombre — une tour SANS symbole, la perche, un rayon
  'shadow-square': ShadowSquareScene,
  // unité 3, leçon 1 nashr-tabsit (2026-11-11) : le terrain du quartier et les bancs le long du couloir coupé — primitives communes de l'unité
  // dans pitchSceneKit.jsx, une scène mince par leçon
  'neighbourhood-pitch': NeighbourhoodPitchScene,
  // unité 3, leçon 3 tahlil-ibara (conseil du 2026-11-11) : les rouleaux de gazon empilés le long du grillage, des RANGÉES de gazon posées au fil
  // des outils — primitives communes de l'unité dans pitchSceneKit.jsx, une scène mince par leçon
  'turf-rolls': TurfRollsScene,
  // unité 3, leçon 2 mutatabiqat-shahira (conseil du 2026-11-11) : les gradins le long de deux côtés voisins du terrain carré, le coin commun
  // JAMAIS mis en valeur — primitives communes de l'unité dans pitchSceneKit.jsx, une scène mince par leçon
  'stands-pitch': StandsPitchScene,
  // unité 4 (« commit 0 » du 2026-11-11) : quatre emplacements, chacun remplacé par le constructeur de sa leçon (un fichier par scène)
  'locker-balance': LockerBalanceScene,
  'pitch-planner': PitchPlannerScene,
  'phone-credit': PhoneCreditScene,
  'family-heights': FamilyHeightsScene,
  // unité 5 (« commit 0 » du 2026-11-11) : trois emplacements, chacun remplacé par le constructeur de sa leçon (un fichier par scène)
  'civil-registry': CivilRegistryScene,
  'kiosk-cards': KioskCardsScene,
  'museum-desk': MuseumDeskScene,
  // unité 5, la synthèse wadiya-idmajiya-jumal (2026-11-12) : la table du goûter de l'école — rangées ÉGALES de jus et de gâteaux, un plateau de restes
  'party-table': PartyTableScene,
  // unité 2, la synthèse wadiya-idmajiya-judhur (2026-11-12) : le marché des tapis — un tapis deux fois plus long que large, un ruban à mesurer
  'rug-market': RugMarketScene,
  // unité 3, la synthèse wadiya-idmajiya-harfi (2026-11-12) : la place à la fontaine — une نافورة carrée et son ممرّ dallé de même largeur tout autour
  'fountain-plaza': FountainPlazaScene,
  // unité 4, la synthèse wadiya-idmajiya-muadalat (2026-11-12) : le guichet du club — deux panneaux de prix aux étiquettes vides, tickets et abonnement
  'club-counter': ClubCounterScene,
};

function CourtyardBigScene(props) {
  return <CourtyardSlabsScene {...props} slabs={3} scene="courtyard-big" />;
}

export default function MissionScene({ scene, ...props }) {
  // every lesson on the mission player names its scene; an unknown name draws nothing rather than another lesson's scene
  const Scene = SCENES[scene];
  return Scene ? <Scene {...props} /> : null;
}
