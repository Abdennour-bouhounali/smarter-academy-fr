import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, PredictionChips, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import DroitePlanLab from '../components/DroitePlanLab';
import {
  ORIENTATION_DEPART, ETAT_DEPART, verdictLabo, cheminVers,
  POSITION_DROITE_PLAN, parseSigned, fr,
} from '../components/planUtils';

/**
 * Module 1 — DÉCLENCHEUR, et l'interaction SIGNATURE : « La droite qui
 * traverse, ou pas » (components/DroitePlanLab.jsx).
 *
 * Étape 1  ATTRAPER LA BOÎTE ET LE PLAN. Le premier geste n'est pas une
 *          question : c'est la découverte qu'on peut tourner la figure et faire
 *          monter le plan. Sans ce geste-là, tout ce que la leçon dira sur
 *          « le dessin ment » serait une affirmation à croire.
 * Étape 2  COMPTER LES POINTS COMMUNS. L'élève fait basculer la droite et lit
 *          le compteur : 1, puis 0, puis une infinité. Trois réponses, jamais
 *          une quatrième.
 * Étape 3  LE NOMBRE QUI DÉCIDE. Le produit scalaire s'affiche à côté du
 *          compteur, et l'élève constate qu'il tombe à zéro juste avant les
 *          deux derniers cas — sans les distinguer l'un de l'autre.
 * Étape 4  la question qui reste ouverte : qu'est-ce qui manque pour trancher
 *          entre « à côté » et « dedans » ? Le module la DEMANDE, il ne la
 *          donne pas.
 *
 * Rien ne s'appelle « vecteur normal », « représentation paramétrique » ni
 * « équation cartésienne » ici : le module se termine en DEMANDANT ce que les
 * suivants nommeront (§6bis.1). Les deux briques posées décrivent ce que
 * l'élève a VU — les trois positions, et le nombre unique qui bascule.
 *
 * CONNAISSANCES AVANT LA DEMANDE. L'ordre est geste → observation → brique →
 * demande :
 *   étape 1  tourner et monter le plan → aucune brique : rien n'a encore été
 *            constaté de mathématique
 *   étape 2  compter les points communs → brique `trois-positions-droite-plan`
 *   étape 3  lire le produit qui bascule → brique `un-nombre-decide`
 *   étape 4  la question, désormais légitime.
 *
 * ATTEIGNABILITÉ, PROUVÉE AVANT D'ÊTRE EXIGÉE. L'étape 2 demande d'atteindre
 * les trois positions au glisser. `cheminVers` exhibe le chemin de chacune, et
 * un test le rejoue cran par cran (components/planUtils.test.js). Le cas le
 * plus délicat, « contenue dans le plan », exige que trois cliquets coïncident ;
 * il est à DEUX crans de l'état de départ, et il est atteignable aux trois
 * hauteurs. Sans cette preuve, la consigne aurait pu être un ordre impossible.
 *
 * MANIPULATION JAMAIS GELÉE. Le laboratoire reste pilotable une fois l'étape
 * validée : `disabled` ne porte que les verrous d'ANTÉRIORITÉ. Seuls les
 * `PredictionChips` se figent — une prédiction s'enregistre une fois.
 */

/** Les états cités par le module, tous CALCULÉS, jamais écrits à la main. */
const V_DEPART = verdictLabo(ETAT_DEPART);
const CHEMIN_PARALLELE = cheminVers(POSITION_DROITE_PLAN.parallele);
const CHEMIN_CONTENUE = cheminVers(POSITION_DROITE_PLAN.contenue);
const ETAT_CONTENUE = CHEMIN_CONTENUE.cible;
const V_CONTENUE = verdictLabo(ETAT_CONTENUE);

export default function Module01LaDroiteQuiTraverse() {
  // Étape 1 : la rotation et le plan qui monte, et rien d'autre.
  const [o1, setO1] = useState(ORIENTATION_DEPART);
  const [e1, setE1] = useState(ETAT_DEPART);
  const [tournee, setTournee] = useState(false);
  const [montee, setMontee] = useState(false);
  const [q1, setQ1] = useState(false);

  // Étape 2 : les trois positions, atteintes au glisser.
  const [pred, setPred] = useState(null);
  const [o2, setO2] = useState(ORIENTATION_DEPART);
  const [e2, setE2] = useState(ETAT_DEPART);
  const [vues, setVues] = useState(() => new Set([V_DEPART.position]));
  const [q2, setQ2] = useState(false);

  // Étape 3 : le nombre qui décide.
  const [o3, setO3] = useState(ORIENTATION_DEPART);
  const [e3, setE3] = useState(ETAT_DEPART);
  const [q3a, setQ3a] = useState(false);
  const [q3b, setQ3b] = useState(false);

  const [q4, setQ4] = useState(false);

  const done1 = tournee && montee && q1;
  const troisVues = vues.size === 3;
  const done2 = troisVues && q2;
  const done3 = q3a && q3b;

  /** Étape 1 : l'objectif tombe dès que la figure a VRAIMENT bougé. */
  const tourner1 = (o, react) => {
    setO1(o);
    if (tournee) return;
    if (o.yaw !== ORIENTATION_DEPART.yaw || o.pitch !== ORIENTATION_DEPART.pitch) {
      setTournee(true);
      react?.(true);
    }
  };

  const monter1 = (e, react) => {
    setE1(e);
    if (montee) return;
    if (e.h !== ETAT_DEPART.h) {
      setMontee(true);
      react?.(true);
    }
  };

  /** Étape 2 : on RETIENT chaque position déjà rencontrée. */
  const bouger2 = (e, react) => {
    setE2(e);
    const position = verdictLabo(e).position;
    if (vues.has(position)) return;
    const suivant = new Set(vues);
    suivant.add(position);
    setVues(suivant);
    react?.(true);
  };

  const steps = [
    {
      num: 1,
      title: 'Attrape le plan, et fais-le monter',
      subtitle:
        'Dans la boîte, une surface bleue et un trait rouge. Pose le doigt sur la surface bleue et fais-la monter ; pose-le ailleurs, et c’est la boîte entière qui tourne.',
      done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-3 text-sm text-indigo-900">
            La surface bleue est un morceau de <strong>plan</strong> : une surface parfaitement
            plate, qui se prolonge à l’infini dans toutes ses directions — on n’en dessine qu’un
            carré, faute de place. Le trait rouge est une <strong>droite</strong>, elle aussi
            infinie. <strong>Attrape le plan et fais-le monter</strong>, puis fais tourner la boîte
            pour regarder la scène d’un autre angle.
          </div>
          <DroitePlanLab
            orientation={o1}
            onOrientation={(o) => tourner1(o, kit.react)}
            etat={e1}
            onEtat={(e) => monter1(e, kit.react)}
            montrer="points"
          />
          <div className="flex flex-wrap gap-2 text-[13px]">
            <span className={`px-2.5 py-1 rounded-lg font-semibold ${montee ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>
              {montee ? '✓' : '○'} le plan a bougé
            </span>
            <span className={`px-2.5 py-1 rounded-lg font-semibold ${tournee ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>
              {tournee ? '✓' : '○'} la boîte a tourné
            </span>
          </div>
          {tournee && montee ? (
            <>
              <Feedback tone="ok">
                Le plan monte, la boîte tourne, et le trait rouge n’a pas bougé d’un millimètre dans
                l’espace — c’est ton point de vue qui a changé.{' '}
                <strong>Un dessin plat n’est pas la scène</strong> : garde-le en tête, la leçon
                entière repose là-dessus.
              </Feedback>
              <TapQuestion
                prompt="Tu viens de tourner la boîte. Le trait rouge a-t-il changé de position dans l’espace ?"
                options={[
                  'Non : c’est le point de vue qui a changé, pas la droite',
                  'Oui, puisqu’il n’est plus au même endroit sur l’écran',
                  'Oui, puisqu’il a changé de longueur apparente',
                  'On ne peut pas savoir',
                ]}
                correct={0}
                cols={1}
                requires={['perspective-cavaliere', 'arete-cachee']}
                explain="Tourner la figure ne déplace rien : c’est l’équivalent de tourner autour d’une table pour regarder un objet d’un autre côté. Ce qui change est le dessin, pas la scène — exactement comme les arêtes qui passent du pointillé au trait plein."
                explainWrong="Regarde les pointillés pendant que tu tournes : aucune arête n’apparaît ni ne disparaît, elles changent seulement d’aspect. Si la boîte ne bouge pas, le trait rouge qu’elle contient ne bouge pas non plus."
                solved={q1}
                onAnswered={() => setQ1(true)}
              />
            </>
          ) : (
            <Feedback tone="info">
              Fais monter le plan bleu — glisse le doigt dessus. Puis pose le doigt ailleurs sur la
              figure et fais tourner la boîte. Tu peux aussi utiliser les flèches du clavier ou les
              boutons sous la figure.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Combien de points communs ?',
      subtitle:
        'Attrape un bout du trait rouge et fais-le basculer. Sous la figure, un compteur donne le nombre de points que la droite et le plan ont en commun. Trouve les trois réponses possibles.',
      done: done2,
      content: (kit) => (
        <div className="space-y-3">
          <PredictionChips
            prompt="en faisant basculer la droite et monter le plan, combien de valeurs différentes le compteur de points communs pourra-t-il prendre ?"
            options={[
              { id: 'deux', label: 'Deux : soit ils se rencontrent, soit non' },
              { id: 'trois', label: 'Trois' },
              { id: 'beaucoup', label: 'Beaucoup : 1, 2, 3 points…' },
            ]}
            value={pred}
            onChange={setPred}
            disabled={done2}
          />
          <div className="rounded-xl border border-sky-200 bg-sky-50 p-3 text-sm text-sky-900">
            Les deux pastilles rouges sont les <strong>bouts de la droite</strong> : attrape-en une
            et fais-la monter ou descendre. La droite bascule, et le compteur suit.
          </div>
          <DroitePlanLab
            orientation={o2}
            onOrientation={setO2}
            etat={e2}
            onEtat={(e) => bouger2(e, kit.react)}
            montrer="points"
            disabled={!done1}
          />
          <div className="rounded-xl border-2 border-slate-200 bg-white p-3">
            <div className="text-[13px] font-semibold text-slate-700 mb-1.5">
              Les positions que tu as déjà rencontrées :
            </div>
            <div className="flex flex-wrap gap-2 text-[13px]">
              {[
                { id: POSITION_DROITE_PLAN.secante, label: '1 point commun' },
                { id: POSITION_DROITE_PLAN.parallele, label: '0 point commun' },
                { id: POSITION_DROITE_PLAN.contenue, label: 'une infinité' },
              ].map((c) => (
                <span key={c.id}
                  className={`px-2.5 py-1 rounded-lg font-semibold ${vues.has(c.id) ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}>
                  {vues.has(c.id) ? '✓' : '○'} {c.label}
                </span>
              ))}
            </div>
          </div>
          {!troisVues && done1 && (
            <Feedback tone="info">
              Il t’en manque. Pour <strong>0 point commun</strong>, mets les deux bouts de la droite
              à la <strong>même hauteur</strong> que l’un l’autre, mais pas à celle du plan. Pour
              <strong> une infinité</strong>, mets les deux bouts ET le plan à la{' '}
              <strong>même hauteur</strong> : la droite se couche alors dedans.
            </Feedback>
          )}
          {troisVues && (
            <>
              <Feedback tone="ok">
                {pred === 'trois' ? 'Ta prédiction tenait' : pred ? 'Ta prédiction ne tenait pas' : 'Le constat'} :
                il n’y a que <strong>trois</strong> réponses possibles — 1, 0, ou une infinité.
                Jamais 2, jamais 3. Continue de faire basculer la droite : tu ne trouveras pas de
                quatrième cas.
              </Feedback>
              <TapQuestion
                prompt="Pourquoi une droite et un plan ne peuvent-ils pas avoir exactement DEUX points communs ?"
                options={[
                  'Parce qu’avec deux points communs, la droite entière serait couchée dans le plan : il y en aurait alors une infinité',
                  'Parce que deux points, cela ferait une droite, et une droite n’est pas un point',
                  'Parce que le plan est trop petit pour en contenir deux',
                  'C’est possible, mais le laboratoire ne le montre pas',
                ]}
                cols={1}
                correct={0}
                requires={['droites-paralleles', 'secantes']}
                explain="Par deux points ne passe qu’une seule droite. Si deux points de la droite sont dans le plan, alors la droite qu’ils déterminent y est aussi — donc tous ses points. On saute directement de 1 à l’infini."
                explainWrong="Essaie sur la figure : dès que tu poses deux bouts de la droite dans le plan, le compteur affiche « une infinité », jamais 2. Le plan n’y est pour rien — c’est qu’une droite est entièrement déterminée par deux de ses points."
                solved={q2}
                onAnswered={() => setQ2(true)}
              />
              <KnowledgeBrick
                id="trois-positions-droite-plan"
                variant="new"
                lead={<>Les trois positions que tu viens de produire, en une phrase. Refais-les en la lisant.</>}
              />
            </>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Un seul nombre bascule avec elle',
      subtitle:
        'La figure affiche maintenant un calcul à côté du compteur. Refais basculer la droite et regarde ce nombre-là.',
      done: done3,
      content: (kit) => (
        <div className="space-y-3">
          <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-3 text-sm text-indigo-900">
            Le premier cadre multiplie la <strong>direction de la droite</strong> par une direction
            <strong> perpendiculaire au plan</strong>, coordonnée par coordonnée, puis additionne :
            c’est le produit scalaire que tu connais, avec ses trois termes. Fais basculer la
            droite et surveille ce nombre.
          </div>
          <DroitePlanLab
            orientation={o3}
            onOrientation={setO3}
            etat={e3}
            onEtat={setE3}
            montrer="calcul"
            disabled={!done2}
          />
          <NumericQuestion
            prompt={
              <>
                Mets les deux bouts de la droite à la <strong>même hauteur</strong>, de sorte que le
                compteur n’affiche plus 1 point commun. Que vaut alors le produit affiché dans le
                premier cadre ?
              </>
            }
            expected={0}
            parse={parseSigned}
            display="0"
            requires={['formule-scalaire-espace', 'trois-positions-droite-plan']}
            explain="Dès que la droite cesse de percer le plan, le produit tombe à 0 — exactement 0, pas « à peu près ». C’est le seul nombre de la figure qui bascule en même temps que la position."
            explainFor={(n) => (
              n === V_DEPART.un
                ? `${fr(V_DEPART.un)} est ce que le produit vaut au DÉPART, quand la droite perce encore le plan. Mets les deux bouts à la même hauteur et regarde-le retomber.`
                : n === 1
                ? 'Le produit n’est pas le nombre de points communs : ce sont deux cadres différents. Lis celui de gauche, sous « direction × direction perpendiculaire ».'
                : null
            )}
            solved={q3a}
            onAnswered={() => setQ3a(true)}
          />
          {q3a && (
            <TapQuestion
              prompt="Maintenant, laisse les deux bouts à la même hauteur et fais MONTER le plan jusqu’à ce que la droite se couche dedans. Que fait le produit pendant ce temps ?"
              options={[
                'Il reste à 0 : il ne distingue pas « à côté du plan » de « couchée dedans »',
                'Il redevient différent de 0 dès que la droite est dedans',
                'Il devient négatif',
                'Il devient infini, comme le nombre de points communs',
              ]}
              cols={1}
              correct={0}
              requires={['trois-positions-droite-plan', 'formule-scalaire-espace']}
              explain={`Le produit vaut 0 dans les deux cas — quand la droite passe à côté comme quand elle est couchée dedans. Il décide donc si la droite perce, mais il ne suffit pas à trancher entre les deux autres cas. Il manque une information.`}
              explainWrong="Regarde les deux cadres pendant que tu montes le plan : le compteur passe de 0 à « une infinité », mais le produit ne bouge pas — il reste à 0. Ce sont deux informations différentes."
              solved={q3b}
              onAnswered={() => setQ3b(true)}
            />
          )}
          {done3 && (
            <>
              <Feedback tone="ok">
                Un seul nombre bascule avec la position — et il ne suffit pas. Quand il n’est pas
                nul, la droite perce, sans discussion. Quand il est nul, deux situations très
                différentes se cachent derrière le même 0.
              </Feedback>
              <KnowledgeBrick
                id="un-nombre-decide"
                variant="new"
                lead={<>Ce que le tableau des trois cas montre, et ce qu’il ne montre pas. Refais basculer la droite en le lisant.</>}
              />
            </>
          )}
        </div>
      ),
    },
    {
      num: 4,
      title: 'Que manque-t-il pour trancher ?',
      done: q4,
      content: (
        <div className="space-y-3">
          <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4 text-sm text-indigo-900 space-y-2">
            <p className="font-semibold">Le bilan de ce que tu viens de produire :</p>
            <ul className="list-disc list-inside space-y-1">
              <li>trois positions, et seulement trois : 1 point commun, 0, ou une infinité ;</li>
              <li>
                un produit non nul (au départ, {fr(V_DEPART.un)}) signifie que la droite{' '}
                <strong>perce</strong> le plan ;
              </li>
              <li>
                un produit nul laisse <strong>deux</strong> possibilités : à côté, ou couchée
                dedans — et le produit ne les distingue pas ;
              </li>
              <li>
                depuis la position de départ, il suffit de{' '}
                <strong>{CHEMIN_PARALLELE.etapes.length} crans</strong> pour la faire passer à
                côté, et de <strong>{CHEMIN_CONTENUE.etapes.length}</strong> pour la coucher dedans.
              </li>
            </ul>
          </div>
          <TapQuestion
            prompt="Le produit vaut 0. Quelle information supplémentaire, et une seule, permettrait de trancher entre « à côté du plan » et « couchée dedans » ?"
            options={[
              'Savoir si UN point de la droite appartient au plan',
              'Calculer la longueur de la droite',
              'Recalculer le même produit avec l’autre bout de la droite',
              'Regarder le dessin sous un autre angle',
            ]}
            correct={0}
            cols={1}
            requires={['trois-positions-droite-plan', 'un-nombre-decide']}
            explain="Un seul point suffit, et n’importe lequel de la droite. S’il est dans le plan, la droite entière l’est ; s’il n’y est pas, elle passe à côté. Ce second test a un nom et une écriture : le module suivant les pose."
            explainWrong={`Recalculer le même produit avec l’autre bout donnerait le même résultat : le produit ne dépend que de la DIRECTION de la droite, pas de l’endroit où elle passe. Et le dessin, tu l’as vu, dépend de l’angle — sur le laboratoire, la même position se lit différemment selon la rotation. Ce qu’il faut, c’est un fait sur un POINT.`}
            solved={q4}
            onAnswered={() => setQ4(true)}
          />
          {q4 && (
            <Feedback tone="info">
              Deux tests, donc, et dans cet ordre. Le module suivant leur donne leur nom, leur
              écriture, et la direction perpendiculaire au plan que le premier cadre utilisait déjà
              sans la nommer. Sur le laboratoire, la position « couchée dedans » s’obtient à la
              hauteur {fr(ETAT_CONTENUE.h)} : les deux bouts et le plan y sont alignés, et le
              compteur affiche bien {V_CONTENUE.pointsCommuns}.
            </Feedback>
          )}
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      moduleTitle="La droite qui traverse, ou pas"
      moduleSubtitle="Un plan qu’on monte, une droite qu’on fait basculer, un compteur qui n’a que trois réponses"
      estimatedTime="11 min"
      brief={{
        tag: 'Déclencheur',
        title: 'Combien de fois une droite peut-elle rencontrer un plan ?',
        tone: 'indigo',
        body: (
          <p>
            Une droite est infinie, un plan aussi. On pourrait croire qu’ils se rencontrent
            n’importe comment. Attrape-les, fais-les bouger, et compte.
          </p>
        ),
      }}
      steps={steps}
      footer={
        <KnowledgeSnapshot moduleNumber={1}>
          <strong>Le mot juste.</strong> La direction perpendiculaire au plan, que le premier cadre
          utilisait sans la nommer, et le second test que tu viens de réclamer ont chacun un nom
          officiel. Module suivant : trois positions, un seul calcul.
        </KnowledgeSnapshot>
      }
    />
  );
}
