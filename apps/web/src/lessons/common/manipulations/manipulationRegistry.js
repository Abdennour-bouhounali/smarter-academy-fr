import { lazy } from 'react';
import { MANIPULATION_TYPE_IDS } from '@smarter-academy/core/curriculum/manipulationTypes.js';

/**
 * Le registre FERMÉ type → composant (le pendant React de
 * packages/core/curriculum/manipulationTypes.js, qui porte les types sans
 * React pour l'outillage). Un `lesson.config.js` nomme un type dans
 * `resources[]` ; un module rend `<Manipulation type=… />` ; jamais du code
 * arbitraire venu du contenu.
 *
 * `manipulationRegistry.test.js` vérifie que chaque type du registre pur a
 * son composant ici, et réciproquement.
 */
export const MANIPULATION_COMPONENTS = {
  'divisor-explorer': lazy(() => import('./divisibility/DivisorExplorer')),
  'divisor-explorer-books': lazy(() => import('./divisibility/DivisorExplorerBooks')),
  'team-builder': lazy(() => import('./divisibility/TeamBuilder')),
  'factor-pairs': lazy(() => import('./divisibility/FactorPairs')),
  'divisor-properties': lazy(() => import('./divisibility/DivisorProperties')),
  'common-divisors': lazy(() => import('./divisibility/CommonDivisors')),
  'pgcd-differences': lazy(() => import('./divisibility/DifferenceAlgorithm')),
  'euclidean-algorithm': lazy(() => import('./divisibility/EuclidAlgorithm')),
  'coprime-explorer': lazy(() => import('./divisibility/CoprimeExplorer')),
  'fraction-reduction': lazy(() => import('./divisibility/FractionReduction')),
  // Unité 2 « الحساب على الجذور » (2026-09-30).
  'square-root-side': lazy(() => import('./roots/SquareRootSide')),
  'square-fold': lazy(() => import('./roots/SquareFold')),
  'square-tiling': lazy(() => import('./roots/SquareTiling')),
  'pitch-expansion': lazy(() => import('./algebra/PitchExpansion')),
  'turf-factoring': lazy(() => import('./algebra/TurfFactoring')),
  // Unité 4 « معادلات ومتراجحات » (2026-10-01).
  'equation-balance': lazy(() => import('./equations/EquationBalance')),
  'vanishing-pitch': lazy(() => import('./equations/VanishingPitch')),
  'solution-ray': lazy(() => import('./equations/SolutionRay')),
  'growth-race': lazy(() => import('./equations/GrowthRace')),
  // Unité 5 « جمل معادلتين » (2026-10-01).
  'pair-scoreboard': lazy(() => import('./systems/PairScoreboard')),
  'elimination-cards': lazy(() => import('./systems/EliminationCards')),
  'story-modeller': lazy(() => import('./systems/StoryModeller')),
  // Unité 6 « الدالة الخطية والتناسبية » (2026-10-02).
  'ratio-ride': lazy(() => import('./proportion/RatioRide')),
  'linear-machine': lazy(() => import('./proportion/LinearMachine')),
  'origin-line': lazy(() => import('./proportion/OriginLine')),
  'percent-tag': lazy(() => import('./proportion/PercentTag')),
  // Unité 7 « الدالة التآلفية » (2026-10-02).
  'affine-meter': lazy(() => import('./affine/AffineMeter')),
  'affine-line': lazy(() => import('./affine/AffineLine')),
  'slope-stairs': lazy(() => import('./affine/SlopeStairs')),
  'line-crossing': lazy(() => import('./affine/LineCrossing')),
  'plan-compare': lazy(() => import('./affine/PlanCompare')),
  // Unité 8 « الإحصاء » (2026-10-02).
  'cumul-gate': lazy(() => import('./stats/CumulGate')),
  'stat-balance': lazy(() => import('./stats/StatBalance')),
  'sheet-lab': lazy(() => import('./stats/SheetLab')),
  'group-tanks': lazy(() => import('./stats/GroupTanks')),
  // Unité 9 « خاصية طالس » (2026-10-02).
  'thales-beam': lazy(() => import('./geometry/ThalesBeam')),
  'parallel-level': lazy(() => import('./geometry/ParallelLevel')),
  'segment-divider': lazy(() => import('./geometry/SegmentDivider')),
  'shadow-stick': lazy(() => import('./geometry/ShadowStick')),
  'shadow-world': lazy(() => import('./geometry/ShadowWorld')),
  // Le labo à UN couloir du lecteur de mission (leçon talis-hisab-atwal, 2026-11-10) : `shadow-world` reste celui de la page et de l'enseignant.
  'shadow-meet': lazy(() => import('./geometry/ShadowMeet')),
  'cone-cylinder': lazy(() => import('./geometry/ConeCylinder')),
  // Unité 10 « حساب المثلثات في المثلث القائم » (2026-10-04).
  'ramp-ratios': lazy(() => import('./geometry/RampRatios')),
  'trig-calculator': lazy(() => import('./geometry/TrigCalculator')),
  'angle-compass': lazy(() => import('./geometry/AngleCompass')),
  'clinometer': lazy(() => import('./geometry/Clinometer')),
  // Unités 11 « الأشعة والانسحاب » et 12 « الأشعة في معلم » (2026-10-04).
  'translation-glide': lazy(() => import('./vectors/TranslationGlide')),
  'parallelogram-pin': lazy(() => import('./vectors/ParallelogramPin')),
  'vector-sum': lazy(() => import('./vectors/VectorSum')),
  'vector-chain': lazy(() => import('./vectors/VectorChain')),
  'bridge-path': lazy(() => import('./vectors/BridgePath')),
  'component-steps': lazy(() => import('./vectors/ComponentSteps')),
  'component-calc': lazy(() => import('./vectors/ComponentCalc')),
  'midpoint-distance': lazy(() => import('./vectors/MidpointDistance')),
  'shape-prover': lazy(() => import('./vectors/ShapeProver')),
  'route-compare': lazy(() => import('./vectors/RouteCompare')),
  // Unité 13 « الدوران - الزوايا - المضلّعات المنتظمة » (2026-10-04).
  'rotation-dial': lazy(() => import('./rotation/RotationDial')),
  'shape-turn': lazy(() => import('./rotation/ShapeTurn')),
  'inscribed-angle': lazy(() => import('./rotation/InscribedAngle')),
  'polygon-forge': lazy(() => import('./rotation/PolygonForge')),
  'lamp-ring': lazy(() => import('./rotation/LampRing')),
  'sphere-probe': lazy(() => import('./space/SphereProbe')),
  'orange-peel': lazy(() => import('./space/OrangePeel')),
  'section-slicer': lazy(() => import('./space/SectionSlicer')),
  'scale-blocks': lazy(() => import('./space/ScaleBlocks')),
  'bucket-fill': lazy(() => import('./space/BucketFill')),
  // 1AM, unité 2 « الجمع والطرح » (2026-10-14).
  'story-bars': lazy(() => import('./operations/StoryBars')),
  // 1AM, unité 3 « الضرب والقسمة » (2026-10-14).
  'division-jumps': lazy(() => import('./operations/DivisionJumps')),
  'digit-cards': lazy(() => import('./operations/DigitCards')),
  // 1AM, unité 4 « الكتابات الكسرية » (2026-10-14).
  'fraction-knife': lazy(() => import('./operations/FractionKnife')),
  'fair-share': lazy(() => import('./operations/FairShare')),
  // 1AM, unité 1 « الأعداد الطبيعية والأعداد العشرية » (2026-10-14).
  'rank-exchange': lazy(() => import('./operations/RankExchange')),
  // 1AM, unité 1 — le كسر عشري et l'écriture à virgule (2026-10-15).
  'decimal-comma': lazy(() => import('./operations/DecimalComma')),
  // 1AM, unité 1 — comparer et ranger des nombres décimaux : la graduation de la règle sous la main (2026-10-15).
  'ruler-compare': lazy(() => import('./operations/RulerCompare')),
  // 1AM, unité 11 « السطوح المستوية : الأطوال، المحيطات، المساحات » : le carreau sous la main (2026-10-15).
  'tile-yard': lazy(() => import('./surface/TileYard')),
  // 2AM, unité 2 « الكسور والعمليات عليها » (2026-10-14).
  'egg-trays': lazy(() => import('./operations/EggTrays')),
  // 3AM, unité 4 « الحساب الحرفي » : le terme sous la main — réduire, supprimer des parenthèses (2026-10-20).
  'like-terms': lazy(() => import('./algebra/LikeTerms')),
  // 3AM, unité 4 « الحساب الحرفي » : la coupure sous la main — l'aire d'un terrain comptée de deux façons, développer (2026-10-21).
  'area-split': lazy(() => import('./algebra/AreaSplit')),
  // 3AM, unité 11 « خاصية فيثاغورس، جيب تمام زاوية » : les bassins carrés sous la main (2026-10-20).
  'pythagoras-tanks': lazy(() => import('./geometry/PythagorasTanks')),
  // 3AM, unité 3 « القوى ذات أسس نسبية صحيحة » : l'exposant sous la main — le train des puissances (2026-10-21).
  'power-train': lazy(() => import('./operations/PowerTrain')),
  // 3AM, unité 5 « المساويات – المتباينات – المعادلات » : le nombre d'une opération sous la main — le مضمار des deux membres (2026-10-21).
  'equality-lanes': lazy(() => import('./operations/EqualityLanes')),
  'loom-threads': lazy(() => import('./algebra/LoomThreads')),
  // 3AM, unité 5, leçon « حصر عدد عشري موجب » : la masse sous la main — ميزان العطّار dont l'écran arrondit (2026-10-26).
  'scoop-scale': lazy(() => import('./operations/ScoopScale')),
  // 2AM, unité 2, leçon 7 « جمع وطرح كسرين » : la distance sous la main — عدّاد المسلك (2026-10-29).
  'trail-odometer': lazy(() => import('./operations/TrailOdometer')),
  // 2AM, unité 2, leçon 9 « مقارنة كسرين » : la hauteur d'un laser lue dans deux graduations — ليزر المستوى (2026-10-29).
  'level-laser': lazy(() => import('./operations/LevelLaser')),
  // 2AM, unité 3, leçon 5 « جمع وطرح عددين نسبيين » : la charge d'un montgolfière sous la main — أكياس المنطاد (2026-10-29).
  'balloon-ballast': lazy(() => import('./operations/BalloonBallast')),
  'tug-rope': lazy(() => import('./operations/TugRope')),
  // 2AM, unité 3, leçon 1 « التعليم على مستقيم مدرّج » : l'origine et la graduation sous la main — مسطرة الكورنيش (2026-10-29).
  'corniche-ruler': lazy(() => import('./operations/CornicheRuler')),
  // 2AM, unité 3, leçon 4 « تعليم نقطة في المستوي » : le piquet d'origine sous la main — شبكة الحفرية (2026-10-29).
  'dig-grid': lazy(() => import('./operations/DigGrid')),
  // 1AM, unité 1, leçon 3 « الأعداد العشرية ونصف المستقيم المدرّج » : l'unité de longueur étirée puis le drapeau sur le ruban — شريط القفز (2026-10-30).
  'jump-tape': lazy(() => import('./operations/JumpTape')),
  // 1AM, unité 5, leçon 1 « الأعداد النسبية وسياقات استعمالها » : le niveau d'une jauge verticale tenu par la main, lu comme un nombre relatif — ميزان الصقيع (2026-10-30).
  'frost-gauge': lazy(() => import('./operations/FrostGauge')),
  // 1AM, unité 6, leçon 1 « البحث عن أعداد ناقصة » : la carte INVERSE d'une machine d'atelier et le nombre manquant, remonté puis vérifié — الحزام المعاكس (2026-10-30).
  'rewind-belt': lazy(() => import('./operations/RewindBelt')),
  // 1AM, unité 6, leçon 2 « تطبيق قاعدة حرفية » : la valeur d'un cadran tombe dans chaque fente d'une lettre — قرص الحروف (2026-10-30).
  'letter-dial': lazy(() => import('./operations/LetterDial')),
  // 1AM, unité 5, leçon 2 « التعليم على مستقيم مدرّج » : la foulée portée des deux côtés de l'origine — خطوة الطابع (2026-10-30).
  'stride-stamp': lazy(() => import('./operations/StrideStamp')),
  // 1AM, unité 5, leçon 3 « التعليم في المستوي » : un drone conduit sur UN axe à la fois au-dessus du plan d'une cour d'école — مسيّرة الساحة (2026-10-30).
  'courtyard-drone': lazy(() => import('./operations/CourtyardDrone')),
  // 2AM, unité 3, leçon 5 « المسافة بين نقطتين على مستقيم مدرّج » : l'ouverture d'un compas sous la main — مسماك الفرق (2026-10-29).
  'gap-caliper': lazy(() => import('./operations/GapCaliper')),
  // 2AM, unité 2, leçon 8 « جداء كسرين » : les deux facteurs sous la main — ستائر النافذة (2026-10-29).
  'window-blinds': lazy(() => import('./operations/WindowBlinds')),
  // 2AM, unité 4, leçon 1 « إنتاج عبارة حرفية واستعمالها » : le nombre de cellules sous la main — خلايا الشمع (2026-10-29).
  'wax-cells': lazy(() => import('./operations/WaxCells')),
  // 2AM, unité 4, leçon 2 « حلّ مشكل باستعمال معادلة » : l'inconnue (capacité du moule, contenu du réservoir) sous la main — خطّ العصير (2026-10-29).
  'juice-line': lazy(() => import('./operations/JuiceLine')),
  // 2AM, unité 4, leçon 3 « اختبار مساواة أو متباينة » : la charge d'un camion (des comptes de sacs) pesée contre la règle d'une pancarte — حمولة الجسر (2026-10-29).
  'bridge-load': lazy(() => import('./operations/BridgeLoad')),
  // 2AM, unité 2, leçon 6 « الكسر: نسبة وحاصل قسمة وقيم مقرّبة » : le quotient sous la main — حبال المرسى (2026-10-28).
  'mooring-lines': lazy(() => import('./operations/MooringLines')),
  // 3AM, unité 5 : le signe d'un terme sous la main — la عبّارة des caisses d'une équation (2026-10-21).
  'term-ferry': lazy(() => import('./algebra/TermFerry')),
  // 3AM, unité 1 « الأعداد النسبية » : le temps signé sous la main — le شريط المصعد (2026-10-26).
  'elevator-reel': lazy(() => import('./operations/ElevatorReel')),
  'sign-machine': lazy(() => import('./operations/SignMachine')),
  // 3AM, unité 4 « الحساب الحرفي », leçon 3 : la valeur sous la main — le مسار الكريات (2026-10-26).
  'marble-run': lazy(() => import('./algebra/MarbleRun')),
  // 2AM, unité 3 « الأعداد النسبية » : la distance à zéro sous la main — le مسبار (2026-10-21).
  'zero-probe': lazy(() => import('./operations/ZeroProbe')),
  // 3AM, unité 6 « التناسبية » : le pourcentage sous la main — l'inconnue est le nombre de cases peintes d'un plateau de 100 (2026-10-21).
  'hundred-grid': lazy(() => import('./proportion/HundredGrid')),
  // 3AM, unité 6 « التناسبية » : la punaise sur sa rainure et la règle sur deux nœuds — du tableau au graphique d'une situation proportionnelle (2026-10-21).
  'pin-rails': lazy(() => import('./proportion/PinRails')),
  // 3AM, unité 1, 3e leçon : le code manquant sous la main — les خزائن الأمانات (2026-10-26).
  'code-lockers': lazy(() => import('./operations/CodeLockers')),
  // 3AM, unité 1, 2e leçon : les signes et l'ordre des cartes sous la main — le مسار الروبوت (2026-10-26).
  'robot-track': lazy(() => import('./operations/RobotTrack')),
  // 3AM, unité 2 « العمليات على الكسور والأعداد الناطقة » : la division par un rapport sous la main — la manivelle de la درّاجة (2026-10-25).
  'gear-crank': lazy(() => import('./proportion/GearCrank')),
  // 2AM, unité 1, leçon 1 : l'ordre des opérations sous la main — le خطّ الترامواي (2026-10-28).
  'tram-route': lazy(() => import('./operations/TramRoute')),
  // 2AM, unité 1, leçon 2 : les parenthèses sous la main — la حاسبة التعاونية (2026-10-29).
  'coop-calculator': lazy(() => import('./operations/CoopCalculator')),
  // 2AM, unité 1, leçon 3 : la dernière opération nomme la chaîne — le مقصّ السلسلة (2026-10-29).
  'chain-cutter': lazy(() => import('./operations/ChainCutter')),
  'kit-packer': lazy(() => import('./operations/KitPacker')),
  // 3AM, unité 2 : le numérateur sous la main — la machine à teinter (آلة مزج الألوان, 2026-10-26).
  'shade-match': lazy(() => import('./operations/ShadeMatch')),
  // 3AM, unité 2, leçon 3 : l'espacement sous la main — le مشط الشتلات (2026-10-26).
  'seed-rake': lazy(() => import('./operations/SeedRake')),
  // 3AM, unité 2, leçon 4 : la position d'une écriture sous la main — le حبل الأعداد (2026-10-26).
  'number-line-pegs': lazy(() => import('./operations/NumberLinePegs')),
  // 3AM, unité 2, leçon 5 : le signe prédit, le diviseur retourné, l'ordre des fusions — la لوحة الدمج (2026-10-26).
  'merge-board': lazy(() => import('./operations/MergeBoard')),
  // 3AM, unité 4, leçon 4 : l'aiguille qui lit une différence — le مقياس الفرق (2026-10-26).
  'difference-meter': lazy(() => import('./operations/DifferenceMeter')),
  // 3AM, unité 3, leçon 2 : le ruban entre deux plaques d'unités — la مسطرة التحويل (2026-10-26).
  'unit-ladder': lazy(() => import('./operations/UnitLadder')),
  // 3AM, unité 3, leçon 1 : l'exposant de 10 sous la main — la عدسة القوى (2026-10-26).
  'size-ladder': lazy(() => import('./operations/SizeLadder')),
  'ten-zoom': lazy(() => import('./operations/TenZoom')),
  // 2AM, unité 5 « التناسبية » : le nombre qui manque sous la main — les موازين الرابع المتناسب (2026-10-21).
  'fourth-gauges': lazy(() => import('./operations/FourthGauges')),
};

const REGISTERED_TYPE_IDS = Object.freeze(Object.keys(MANIPULATION_COMPONENTS));

export function assertRegistryComplete() {
  const missing = MANIPULATION_TYPE_IDS.filter((id) => !MANIPULATION_COMPONENTS[id]);
  const extra = REGISTERED_TYPE_IDS.filter((id) => !MANIPULATION_TYPE_IDS.includes(id));
  return { missing, extra };
}
