import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, PredictionChips, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import TheodoliteLab from '../components/TheodoliteLab';
import {
  TRIANGLE_DEPART, CIBLES, angles, natureTexte, deplacer,
  parseSigned, fr,
} from '../components/theodoliteUtils';

/**
 * Module 1 — DÉCLENCHEUR, et l'interaction SIGNATURE : le théodolite
 * (components/TheodoliteLab.jsx).
 *
 * Étape 1  l'instrument. L'élève déplace un sommet et voit les SIX mesures
 *          bouger ensemble : trois angles, trois longueurs, un seul calcul.
 * Étape 2  LA MISSION — atteindre « rectangle en B », puis « isocèle non
 *          rectangle ». Les deux cibles sont PROUVÉES atteignables au cliquet
 *          par un parcours en largeur (theodoliteUtils.test.js).
 * Étape 3  le zéro exact contre le presque-zéro : la pastille bascule alors
 *          que la figure n'a presque pas bougé.
 * Étape 4  la question qui reste ouverte : d'où sortent ces six nombres ?
 *
 * Rien ne s'appelle « formule du cosinus », « carré scalaire » ni « forme
 * normale » avant les modules 2 à 4 : ce module se termine en DEMANDANT ce que
 * le suivant nommera (§6bis.1). Les deux briques posées ici décrivent ce que
 * l'élève a VU — un seul calcul pour deux instruments, et un zéro qui est un
 * vrai zéro — sans donner les formules.
 *
 * DISTINCTION AVEC LA LEÇON AMONT. Là-bas, un cliquet ANGULAIRE faisait tourner
 * une flèche autour d'un point fixe pour lire UN nombre. Ici, un cliquet de
 * GRILLE déforme un triangle pour lire une CLASSIFICATION. Le geste, la
 * variable pilotée et la sortie sont tous différents.
 *
 * CONNAISSANCES AVANT LA DEMANDE. L'ordre est geste → observation → brique →
 * demande :
 *   étape 1  déplacer et voir les six cases bouger → brique `instrument-unique`
 *   étape 3  voir la pastille basculer sur un écart d'un degré → brique
 *            `zero-exact-vs-presque`
 *   étapes 2 et 4  les questions, désormais légitimes.
 *
 * MANIPULATION JAMAIS GELÉE. Le laboratoire reste pilotable une fois l'étape
 * validée — c'est précisément après avoir atteint sa cible que l'élève doit
 * pouvoir la PERDRE et comprendre pourquoi. `disabled` ne porte que les verrous
 * d'ANTÉRIORITÉ. Seuls les `PredictionChips` se figent.
 */

/**
 * Le triangle de l'étape 3 : PRESQUE rectangle en C — le produit y vaut 1, et
 * l'angle 88,99°. Un SEUL cran l'amène à l'angle droit exact, et ce cran est
 * `deplacer(PRESQUE, 'A', 1, 0)` : c'est le sommet A qu'il faut pousser d'une
 * case vers la droite, PAS le sommet C.
 *
 * Le premier jet annonçait « remonte C d'une case » : ce coup mène en fait à
 * un produit de −4, et la pastille resterait sur « quelconque ». La leçon
 * aurait donné une consigne qui ne marche pas. Défaut attrapé par le test
 * « M1 — le triangle de l'étape 3 est à UN CRAN de l'angle droit ».
 */
const PRESQUE = { A: { x: -5, y: -3 }, B: { x: 2, y: 5 }, C: { x: 3, y: -2 } };
const DROIT = deplacer(PRESQUE, 'A', 1, 0);

export default function Module01LeTheodolite() {
  const [t1, setT1] = useState(TRIANGLE_DEPART);
  const [s1, setS1] = useState('C');
  const [vus1, setVus1] = useState(0);
  const [q1, setQ1] = useState(false);

  const [t2, setT2] = useState(TRIANGLE_DEPART);
  const [s2, setS2] = useState('C');
  const [pred, setPred] = useState(null);
  const [cible1, setCible1] = useState(false);
  const [cible2, setCible2] = useState(false);

  const [qEqui, setQEqui] = useState(false);

  const [t3, setT3] = useState(PRESQUE);
  // Le sommet piloté au départ de l'étape 3 est A : c'est LUI qui porte le
  // cran menant à l'angle droit exact.
  const [s3, setS3] = useState('A');
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);

  // Étape 1 : il faut avoir bougé la figure au moins trois fois ET lu une mesure.
  const done1 = vus1 >= 3 && q1;
  const done2 = cible1 && cible2 && qEqui;
  const done3 = q3;

  /** L'angle en A du triangle de départ — RECALCULÉ, jamais écrit à la main. */
  const angleADepart = angles(TRIANGLE_DEPART).find((a) => a.id === 'A').deg;

  const changer1 = (suivant) => {
    setT1(suivant);
    setVus1((n) => n + 1);
  };

  const changer2 = (suivant, react) => {
    setT2(suivant);
    if (!cible1 && CIBLES[0].atteinte(suivant)) {
      setCible1(true);
      react?.(true);
    }
    // La seconde cible ne compte qu'une fois la première atteinte : la mission
    // est une SUITE de deux constructions, pas un tirage au sort.
    if (cible1 && !cible2 && CIBLES[1].atteinte(suivant)) {
      setCible2(true);
      react?.(true);
    }
  };

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      moduleTitle="Le théodolite"
      moduleSubtitle="Un triangle qu’on déforme, un instrument qui lit tout — et une pastille qui change de mot"
      estimatedTime="10 min"
      brief={{
        tag: 'Déclencheur',
        title: 'Et si un seul calcul remplaçait le rapporteur ET la règle ?',
        tone: 'indigo',
        body: (
          <p>
            Voici un triangle et un instrument branché dessus. Déplace ses sommets et regarde les six
            cases du panneau : trois pour les angles, trois pour les longueurs.{' '}
            <strong>Elles sortent toutes du même calcul.</strong>
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Six cases qui bougent ensemble',
          subtitle:
            'Choisis un sommet, déplace-le d’une case, et regarde le panneau. Fais-le au moins trois fois, puis lis l’angle en A du triangle de départ.',
          done: done1,
          content: (
            <div className="space-y-3">
              {/* CONNAISSANCES AVANT LA DEMANDE. Cette description vient AVANT
                  la question, et non dans son `explain` : l'élève doit savoir
                  ce que le panneau affiche avant qu'on ne lui demande de le lire. */}
              <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-3 text-sm text-indigo-900">
                Comment lire le panneau : les trois premières cases donnent les angles aux sommets
                A, B et C, avec juste en dessous le produit scalaire dont chacune sort. Les trois
                suivantes donnent les longueurs des côtés, avec leur carré. Un sommet qui bouge fait
                bouger les six d’un coup — c’est le signe qu’un seul calcul les alimente toutes.
              </div>
              <TheodoliteLab
                triangle={t1}
                onChange={changer1}
                sommetActif={s1}
                onSommetActif={setS1}
              />
              <div className="rounded-lg bg-slate-50 border border-slate-200 px-3 py-2 text-[13px] text-slate-600">
                Déplacements effectués : <strong>{vus1}</strong> sur 3.
              </div>
              <NumericQuestion
                prompt={
                  <>
                    Ramène le triangle à sa position de départ si tu l’as bougé —
                    A(−3 ; −2), B(2 ; −2), C(0 ; 3) — et lis l’<strong>angle en A</strong>, en
                    degrés, tel que le panneau l’affiche.
                  </>
                }
                expected={Number(fr(angleADepart).replace('−', '-').replace(',', '.'))}
                parse={parseSigned}
                display={fr(angleADepart)}
                requires={['vocab-produit-scalaire', 'formule-normes-angle']}
                explain={`Le panneau affiche ${fr(angleADepart)}°. Ce nombre n’a été mesuré nulle part sur le dessin : il sort du produit scalaire des deux flèches issues de A.`}
                explainFor={(n) => (n > 180 ? 'Un angle d’un triangle vaut toujours moins de 180° : c’est peut-être une longueur que tu as lue, ou un carré.' : null)}
                solved={q1}
                onAnswered={() => setQ1(true)}
              />
              {done1 && (
                <>
                  <Feedback tone="ok">
                    Aucun rapporteur n’est intervenu, et aucune règle graduée non plus. Le panneau ne
                    connaît que six coordonnées — et il en tire tout le reste.
                  </Feedback>
                  <KnowledgeBrick
                    id="instrument-unique"
                    variant="new"
                    lead={<>Ce que tu viens de voir, en une phrase. Continue de déplacer les sommets en la lisant.</>}
                  />
                </>
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'Deux missions à atteindre',
          subtitle:
            'Mission 1 : un triangle rectangle en B. Mission 2 : un triangle isocèle qui n’est PAS rectangle. La pastille sous le panneau te dit où tu en es.',
          done: done2,
          content: (kit) => (
            <div className="space-y-3">
              <PredictionChips
                prompt="pour rendre l’angle en B droit, que devra afficher le panneau ?"
                options={[
                  { id: 'zero', label: 'Le produit scalaire en B devra valoir exactement 0' },
                  { id: 'egal', label: 'Les trois angles devront être égaux' },
                  { id: 'grand', label: 'Le produit scalaire en B devra être le plus grand des trois' },
                ]}
                value={pred}
                onChange={setPred}
                disabled={done2}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className={`rounded-xl border-2 p-3 text-sm ${cible1 ? 'border-emerald-300 bg-emerald-50 text-emerald-900' : 'border-slate-200 bg-white text-slate-700'}`}>
                  <div className="font-semibold">{cible1 ? '✓ ' : '1. '}{CIBLES[0].titre}</div>
                  <div className="text-xs opacity-80">{CIBLES[0].consigne}</div>
                </div>
                <div className={`rounded-xl border-2 p-3 text-sm ${cible2 ? 'border-emerald-300 bg-emerald-50 text-emerald-900' : cible1 ? 'border-slate-200 bg-white text-slate-700' : 'border-slate-200 bg-slate-50 text-slate-400'}`}>
                  <div className="font-semibold">{cible2 ? '✓ ' : '2. '}{CIBLES[1].titre}</div>
                  <div className="text-xs opacity-80">{CIBLES[1].consigne}</div>
                </div>
              </div>
              <TheodoliteLab
                triangle={t2}
                onChange={(s) => changer2(s, kit.react)}
                sommetActif={s2}
                onSommetActif={setS2}
                disabled={!done1}
              />
              {cible1 && cible2 ? (
                <>
                  <Feedback tone="ok">
                    {pred === 'zero' ? 'Ta prédiction tenait' : pred ? 'Ta prédiction ne tenait pas' : 'Le constat'} :
                    la pastille s’allume sur « rectangle » exactement quand un produit scalaire
                    tombe à <strong>0</strong>, et sur « isocèle » exactement quand deux carrés
                    deviennent égaux. Elle ne regarde jamais la figure — elle lit les nombres.
                  </Feedback>
                  <TapQuestion
                    prompt="Pourquoi la pastille n’affiche-t-elle JAMAIS « équilatéral », quoi qu’on fasse ?"
                    options={[
                      'Parce qu’aucun triangle à sommets tous entiers n’a ses trois côtés de même longueur',
                      'Parce que le cadre est trop petit pour en contenir un',
                      'Parce que le produit scalaire ne sait pas comparer trois longueurs',
                      'Parce qu’il faudrait déplacer les trois sommets en même temps',
                    ]}
                    correct={0}
                    cols={1}
                    requires={['instrument-unique']}
                    explain="C’est une impossibilité, pas un manque de chance : sur une grille à coordonnées entières, aucun triangle n’a ses trois côtés exactement égaux. Le plus proche laisse encore près de 1 % d’écart. Une pastille qui proposerait ce mot annoncerait une cible que rien ne peut atteindre."
                    explainWrong="Ce n’est pas une affaire de cadre ni de manipulation : agrandir la grille ou déplacer trois sommets à la fois n’y changerait rien. Et l’instrument compare parfaitement trois longueurs — c’est le cas lui-même qui n’existe pas sur des coordonnées entières."
                    solved={qEqui}
                    onAnswered={() => setQEqui(true)}
                  />
                </>
              ) : (
                <Feedback tone="info">
                  {cible1 ? 'Mission 1 réussie ✓ — passe à la seconde.' : 'Mission 1 en cours.'}{' '}
                  Un seul cran suffit parfois : regarde le produit scalaire en B et vise le 0. Pour
                  la seconde mission, ce sont deux <strong>carrés</strong> qu’il faut rendre égaux,
                  sans qu’aucun produit ne tombe à 0.
                </Feedback>
              )}
            </div>
          ),
        },
        {
          num: 3,
          title: 'Zéro, ou presque zéro',
          subtitle:
            'Ce triangle-ci a l’air rectangle en C. Regarde le produit scalaire en C, puis déplace le sommet A d’une seule case vers la droite et regarde la pastille.',
          done: done3,
          content: (
            <div className="space-y-3">
              <TheodoliteLab
                triangle={t3}
                onChange={setT3}
                sommetActif={s3}
                onSommetActif={setS3}
                disabled={!done2}
              />
              <TapQuestion
                prompt={
                  <>
                    Au départ de cette étape, le panneau annonçait un angle en C de{' '}
                    <strong>{fr(angles(PRESQUE).find((a) => a.id === 'C').deg)}°</strong> et un produit
                    scalaire de <strong>{fr(angles(PRESQUE).find((a) => a.id === 'C').produit)}</strong>.
                    Ce triangle est-il rectangle en C ?
                  </>
                }
                options={[
                  'Non : le produit vaut 1 et non 0, donc l’angle n’est pas droit — même s’il en a l’air',
                  'Oui : sur un dessin, un degré d’écart ne compte pas',
                  'Oui : le produit est très petit, donc on peut le considérer comme nul',
                  'On ne peut pas conclure sans mesurer au rapporteur',
                ]}
                correct={0}
                cols={1}
                requires={['instrument-unique']}
                explain={`Le produit scalaire en C vaut ${fr(angles(PRESQUE).find((a) => a.id === 'C').produit)}. Un seul entier sépare cette figure de l’angle droit, et pourtant il l’en sépare complètement : ${fr(angles(PRESQUE).find((a) => a.id === 'C').deg)}° n’est pas 90°. Déplace A d’une case vers la droite et le produit tombe à ${fr(angles(DROIT).find((a) => a.id === 'C').produit)} : la pastille bascule.`}
                explainWrong="« Très petit » n’est pas « nul ». Le produit scalaire rend des entiers ici : 1 et 0 sont deux nombres différents, et rien ne permet de les confondre. Quant au rapporteur, il verrait encore moins bien que le calcul."
                solved={q3}
                onAnswered={() => setQ3(true)}
              />
              {q3 && (
                <>
                  <Feedback tone="ok">
                    Un cran de plus, et le produit passe de{' '}
                    {fr(angles(PRESQUE).find((a) => a.id === 'C').produit)} à{' '}
                    {fr(angles(DROIT).find((a) => a.id === 'C').produit)} : la pastille passe de «{' '}
                    {natureTexte(PRESQUE)} » à « {natureTexte(DROIT)} ». La figure, elle, a à peine
                    changé.
                  </Feedback>
                  <KnowledgeBrick
                    id="zero-exact-vs-presque"
                    variant="new"
                    lead={<>La différence entre un zéro et un presque-zéro. Refais le cran en la lisant.</>}
                  />
                </>
              )}
            </div>
          ),
        },
        {
          num: 4,
          title: 'Alors, d’où sortent ces six nombres ?',
          done: q4,
          content: (
            <div className="space-y-3">
              <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4 text-sm text-indigo-900 space-y-2">
                <p className="font-semibold">Le bilan de ce que tu viens de voir :</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>six coordonnées entrent, six mesures sortent — trois angles, trois longueurs ;</li>
                  <li>chaque angle est accompagné d’un produit scalaire, et vaut 90° exactement quand ce produit vaut 0 ;</li>
                  <li>chaque longueur est accompagnée d’un carré, et deux côtés sont égaux quand ces carrés le sont ;</li>
                  <li>la forme du triangle se lit donc entièrement sur des nombres.</li>
                </ul>
              </div>
              <TapQuestion
                prompt="Il manque encore deux choses pour se passer de l’instrument. Lesquelles ?"
                options={[
                  'La formule qui transforme un produit scalaire en angle, et celle qui le transforme en longueur',
                  'Un rapporteur plus précis et une règle plus fine',
                  'La façon de dessiner un triangle sur une grille',
                  'La liste de tous les triangles possibles dans le cadre',
                ]}
                correct={0}
                cols={1}
                requires={['instrument-unique', 'zero-exact-vs-presque']}
                explain="Le panneau sait faire les deux conversions ; toi, pas encore. La première — du produit scalaire vers l’angle — est le module suivant. La seconde — du produit scalaire vers la longueur — celui d’après."
                explainWrong="Rien de tout cela n’est un problème d’instrument de dessin : le panneau n’en utilise aucun. Ce qui manque, ce sont les deux formules que l’instrument applique en coulisse."
                solved={q4}
                onAnswered={() => setQ4(true)}
              />
            </div>
          ),
        },
      ]}
      footer={
        <KnowledgeSnapshot moduleNumber={1}>
          <strong>La première formule.</strong> Le panneau tirait un angle d’un produit scalaire et
          de deux longueurs. Une division suffit — module suivant.
        </KnowledgeSnapshot>
      }
    />
  );
}
