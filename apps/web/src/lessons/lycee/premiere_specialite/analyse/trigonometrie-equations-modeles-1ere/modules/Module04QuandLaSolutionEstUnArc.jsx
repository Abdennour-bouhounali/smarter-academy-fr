import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick, PredictionChips } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import MathText from '../../../../../common/components/MathText';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import BarreLab from '../components/BarreLab';
import { parseReel } from '../components/parseBridge';
import {
  COS, INEQUATIONS, fnDe, arcsSolution, mesureArcs, solutionsDansFenetre,
  labelPi, ecritureK, fr, TAU,
} from '../components/trigEqUtils';

/**
 * Module 4 — MANIPULATION : les inéquations trigonométriques (LP3).
 *
 * Étape 1  LE MÊME LABORATOIRE, un signe en plus. L'élève fait glisser la
 *          barre sur une figure qui ne montre plus des points mais un ARC
 *          COLORÉ, et des bandes sur la courbe. Il voit l'arc grandir quand la
 *          barre descend, et se réduire quand elle monte. Le geste EST la
 *          découverte : la solution a changé de nature.
 * Étape 2  la brique `inequation-arc`, puis `methode-inequation-trigo`, puis
 *          la demande : écrire l'ensemble solution d'une inéquation donnée.
 * Étape 3  le piège frontal : croire que le côté se devine. On change le SENS
 *          de l'inégalité sans changer k, et l'arc bascule de l'autre côté.
 *          La brique `regle-arc-se-repete` referme sur ℝ.
 *
 * TOUT EST MESURÉ : la longueur de chaque arc est celle que `arcsSolution`
 * calcule, et le test la vérifie par BALAYAGE de [0 ; 2π[ — jamais recopiée.
 *
 * MANIPULATION JAMAIS GELÉE : la barre reste attrapable après validation, et
 * c'est même là qu'on voit l'arc varier continûment.
 */

/** Les trois inéquations du module, DÉRIVÉES du modèle. */
const [I1, I2, I3] = INEQUATIONS;

/**
 * Les deux AUTRES inéquations du modèle, avec leur arc MESURÉ. Le module s'en
 * sert pour montrer que la démarche ne dépend ni de la fonction ni du sens :
 * les nombres sont dérivés, jamais recopiés d'un corrigé.
 */
const AUTRES = [I2, I3].map((i) => ({
  ...i,
  arcs: arcsSolution(fnDe(i.fn), i.k, i.sens),
  mesure: mesureArcs(arcsSolution(fnDe(i.fn), i.k, i.sens)),
  bornes: solutionsDansFenetre(fnDe(i.fn), i.k, 0, TAU - 1e-9),
}));

/** La longueur de l'arc de I1, MESURÉE. Sert au texte et à la question. */
const MESURE_I1 = mesureArcs(arcsSolution(fnDe(I1.fn), I1.k, I1.sens));
/** Les deux bornes de I1 sur un tour, DÉRIVÉES de l'égalité. */
const BORNES_I1 = solutionsDansFenetre(fnDe(I1.fn), I1.k, 0, TAU - 1e-9);

export default function Module04QuandLaSolutionEstUnArc() {
  const [pred1, setPred1] = useState(null);
  const [k1, setK1] = useState(1);
  const [vus1, setVus1] = useState([1]);

  const [q2, setQ2] = useState(false);

  const [k3, setK3] = useState(I1.k);
  const [sens3, setSens3] = useState('>=');
  const [q3, setQ3] = useState(false);

  // Trois hauteurs distinctes essayées, dont au moins une où l'arc est grand
  // et une où il est petit : l'élève a VU l'arc varier.
  const done1 = vus1.length >= 3 && vus1.some((k) => k <= 0) && vus1.some((k) => k >= 0.5);
  const done2 = q2;
  const done3 = q3;

  const visiter = (v, react) => {
    setK1(v);
    if (vus1.includes(v)) return;
    const suivant = [...vus1, v];
    setVus1(suivant);
    if (!done1 && suivant.length >= 3 && suivant.some((k) => k <= 0) && suivant.some((k) => k >= 0.5)) react?.(true);
  };

  const steps = [
    {
      num: 1,
      title: 'Un signe change, et la figure change de nature',
      subtitle:
        'La même barre, la même courbe — mais on ne cherche plus « où cos x vaut k », on cherche « où cos x est PLUS GRAND que k ». Fais glisser la barre et regarde la partie colorée.',
      done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <PredictionChips
            prompt="quand je vais faire DESCENDRE la barre, la partie colorée va…"
            options={[
              { id: 'grandir', label: 'Grandir' },
              { id: 'retrecir', label: 'Rétrécir' },
              { id: 'idem', label: 'Rester pareille' },
            ]}
            value={pred1}
            onChange={setPred1}
            disabled={done1}
          />
          <BarreLab
            fn={COS}
            k={k1}
            onChangeK={(v) => visiter(v, kit.react)}
            inegalite=">="
            label="La barre et l’arc solution"
          />
          {done1 ? (
            <Feedback tone="ok">
              {pred1 === 'grandir' ? 'Ta prédiction tenait' : pred1 ? 'Ta prédiction ne tenait pas' : 'Regarde la figure'} :
              plus la barre descend, plus la partie colorée est grande. Et surtout, regarde
              CE QUI est coloré : sur le cercle, ce n’est plus deux points, c’est un{' '}
              <strong>morceau de cercle</strong>. Sur la courbe, ce sont des{' '}
              <strong>bandes</strong>, elles aussi régulièrement espacées. La solution a
              changé de nature. Continue à faire glisser : le morceau se déforme
              continûment.
            </Feedback>
          ) : (
            <Feedback tone="info">
              Essaie des hauteurs variées : une où la barre est haute (petit morceau coloré)
              et une où elle est basse ou négative (grand morceau). Hauteurs essayées :{' '}
              {vus1.length}.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Écrire l’ensemble solution',
      done: done2,
      content: (
        <div className="space-y-3">
          <KnowledgeBrick
            id="inequation-arc"
            variant="new"
            lead={<>Ce que tu viens de colorier n’est pas une liste de nombres.</>}
          />
          <KnowledgeBrick
            id="methode-inequation-trigo"
            variant="new"
            lead={<>Et voici comment le trouver sans tâtonner.</>}
          />
          <div className="rounded-xl border border-emerald-100 bg-white p-3 text-sm text-slate-700">
            Sur la figure ci-dessus, avec <MathText>{`$${I1.tex}$`}</MathText> : les deux
            bornes sont <strong>{labelPi(BORNES_I1[0])}</strong> et{' '}
            <strong>{labelPi(BORNES_I1[1])}</strong>, et l’arc coloré est celui qui{' '}
            <strong>entoure 0</strong>.
          </div>
          <NumericQuestion
            prompt="Sur [0 ; 2π[, l’arc solution de cos x ≥ 1/2 est réuni en deux morceaux. Quelle est sa longueur TOTALE, en unités de π ? (elle vaut … × π — réponse au centième)"
            answer={Number((MESURE_I1 / Math.PI).toFixed(2))}
            parse={parseReel}
            requires={['inequation-arc', 'methode-inequation-trigo', 'solutions-sur-r']}
            explain={`Les deux morceaux sont [0 ; ${labelPi(BORNES_I1[0])}] et [${labelPi(BORNES_I1[1])} ; 2π[. Leurs longueurs sont π/3 et π/3, ce qui fait ${labelPi(MESURE_I1)} en tout, soit ${fr(MESURE_I1 / Math.PI, 2)} × π. C'est le TIERS du tour — et sur la figure, c'est bien un tiers de cercle qui est coloré.`}
            explainWrong={`Compte sur la figure : le morceau qui va de 0 à ${labelPi(BORNES_I1[0])} mesure ${labelPi(BORNES_I1[0])}, et celui qui va de ${labelPi(BORNES_I1[1])} à 2π mesure autant. En tout : ${labelPi(MESURE_I1)}, c'est-à-dire ${fr(MESURE_I1 / Math.PI, 2)} fois π.`}
            solved={done2}
            onAnswered={() => setQ2(true)}
          />
        </div>
      ),
    },
    {
      num: 3,
      title: 'Le côté ne se devine pas : il se lit',
      subtitle:
        'Même hauteur, mais tu peux changer le SENS de l’inégalité. Essaie les deux, et regarde l’arc basculer d’un côté à l’autre du cercle.',
      done: done3,
      content: (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2 items-center" role="group" aria-label="Choisir le sens de l’inégalité">
            {[
              { id: '>=', label: 'cos x ⩾ k' },
              { id: '<=', label: 'cos x ⩽ k' },
            ].map((o) => (
              <button
                key={o.id}
                type="button"
                onClick={() => setSens3(o.id)}
                aria-pressed={sens3 === o.id}
                className={`h-11 px-4 rounded-lg font-bold text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                  sens3 === o.id ? 'bg-emerald-600 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {o.label}
              </button>
            ))}
            <span className="text-[13px] text-slate-500">
              le sens est un CHOIX d’énoncé, pas une position à glisser
            </span>
          </div>
          <BarreLab
            fn={COS}
            k={k3}
            onChangeK={setK3}
            inegalite={sens3}
            disabled={!done2}
            label="Comparer les deux sens de l’inégalité"
          />
          <Feedback tone="info">
            À hauteur <strong>k = {ecritureK(k3)}</strong>, l’arc de{' '}
            <strong>cos x {sens3 === '>=' ? '⩾' : '⩽'} {ecritureK(k3)}</strong> mesure{' '}
            <strong>{fr(mesureArcs(arcsSolution(COS, k3, sens3)), 2)}</strong> par tour, et
            celui de l’autre sens mesure{' '}
            <strong>{fr(mesureArcs(arcsSolution(COS, k3, sens3 === '>=' ? '<=' : '>=')), 2)}</strong>.
            Les deux ensemble font un tour entier : ils se partagent le cercle.
          </Feedback>
          <div className="rounded-xl border border-slate-200 bg-white p-3 overflow-x-auto">
            <div className="text-sm text-slate-600 mb-2">
              La même démarche, sur deux autres inéquations — l’une sur le sinus, l’autre
              dans l’autre sens :
            </div>
            <table className="w-full text-center text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-600">
                  <th className="px-2 py-1 text-left">inéquation</th>
                  <th className="px-2 py-1">les deux bornes</th>
                  <th className="px-2 py-1">longueur de l’arc</th>
                </tr>
              </thead>
              <tbody>
                {AUTRES.map((a) => (
                  <tr key={a.id} className="border-t">
                    <th className="px-2 py-1 text-left font-normal">
                      <MathText>{`$${a.tex}$`}</MathText>
                    </th>
                    <td className="px-2 py-1 font-mono">
                      {a.bornes.map((b) => labelPi(b)).join(' et ')}
                    </td>
                    <td className="px-2 py-1 font-mono">{labelPi(a.mesure) ?? fr(a.mesure, 2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <KnowledgeBrick
            id="regle-arc-se-repete"
            variant="new"
            lead={<>Un dernier point avant de conclure : ce qui vaut sur un tour vaut sur ℝ.</>}
          />
          <TapQuestion
            prompt="Sur [0 ; 2π[, on a résolu cos x ⩾ 1/2 et trouvé [0 ; π/3] ∪ [5π/3 ; 2π[. Que devient l’ensemble solution si l’on résout sur ℝ tout entier ?"
            options={[
              'Le même arc, répété à chaque tour : on ajoute « + 2kπ » à chacune des bornes',
              'Le même arc, sans rien changer : sur ℝ c’est pareil',
              'Un arc deux fois plus long',
              'Il n’y a plus de solution sur ℝ'
            ]}
            correct={0}
            cols={1}
            requires={['regle-arc-se-repete', 'inequation-arc', 'periodicite', 'mem-plus-deux-k-pi']}
            explain="Exactement comme pour l’égalité : ajouter un tour ne change ni le point du cercle ni son abscisse, donc l’inégalité reste vraie. L’ensemble solution sur ℝ est donc la réunion de ces mêmes morceaux, décalés de 2π, de 4π, de −2π… Sur la courbe, ce sont les bandes que tu as vues se répéter."
            explainWrong="Regarde la figure de droite : les bandes colorées ne s’arrêtent pas au premier tour, elles reviennent à intervalles réguliers. Ce n’est ni « pareil » (il y a bien plus de solutions), ni « deux fois plus long » (chaque bande garde la même largeur), ni vide."
            solved={done3}
            onAnswered={() => setQ3(true)}
          />
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(4)}
      moduleNumber={4}
      moduleTitle="Quand la solution est un arc"
      moduleSubtitle="Des points isolés à un morceau de cercle"
      estimatedTime="12 min"
      brief={{
        tag: 'Atelier',
        title: 'Le signe = laisse la place au signe ⩾',
        tone: 'indigo',
        body: (
          <p>
            Jusqu’ici la barre <strong>coupait</strong> : elle donnait des points. Maintenant on
            va lui demander autre chose — non plus « où la courbe la touche », mais{' '}
            <strong>où la courbe est au-dessus d’elle</strong>. La réponse ne sera plus du tout
            de la même nature.
          </p>
        ),
      }}
      steps={steps}
      footer={
        <KnowledgeSnapshot moduleNumber={4}>
          <strong>Changement de sujet.</strong> Tu sais résoudre. Les deux modules qui restent
          te donnent deux outils : un calcul exact que tu peux RETROUVER au lieu de
          l’apprendre, et une façon de décrire un phénomène qui se répète.
        </KnowledgeSnapshot>
      }
    />
  );
}
