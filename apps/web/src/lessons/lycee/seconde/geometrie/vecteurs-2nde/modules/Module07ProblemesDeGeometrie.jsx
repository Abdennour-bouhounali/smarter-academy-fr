import React, { useState } from 'react';
import { ContentModule, NumericQuestion, TapQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import VectorScene, { VecName, SCENE_COLORS } from '../components/VectorScene';
import Stepper from '../components/Stepper';
import {
  SCENES, RANGE, vec, add, sub, equal, isParallelogram, fourthVertex, colinearFactor,
  formatVec, formatNum, inRange, parseDecSigned,
} from '../components/vecteurUtils';

/**
 * Module 7 — LABORATOIRE : les vecteurs comme outil.
 *
 * Activity              fermer un parallélogramme ; retrouver le déplacement
 *                       manquant ; prouver un alignement.
 * Mathematical objective utiliser AB = DC pour PRODUIRE un point ; la somme
 *                       pour retrouver un vecteur ; la colinéarité pour
 *                       démontrer.
 * Student action        placer D (glisser, steppers) ; calculer v ; conclure.
 * Mathematical state    trois points connus, un à construire ; u connu, v
 *                       inconnu ; trois points à tester.
 * Visual consequence    les deux flèches AB et DC deviennent identiques ; le
 *                       tableau des coordonnées ; le vecteur AC en multiple de AB.
 * Misconception targeted l'ordre des sommets (ABCD ⟺ AB = DC, pas AB = CD) ;
 *                       lire v = arrivée − départ en oubliant u.
 */
const { A, B, C } = SCENES.problemes.para;
const D_CIBLE = fourthVertex(A, B, C);
const AB = vec(A, B);
const { depart, u: U2, arrivee } = SCENES.problemes.manquant;
const V2 = sub(vec(depart, arrivee), U2);
const ETAPE = add(depart, U2);
const { A: A3, B: B3, C: C3 } = SCENES.problemes.alignes;
const ESCAPE_AFTER = 12;

export default function Module07ProblemesDeGeometrie() {
  const [D, setD] = useState({ x: 3, y: 1 });
  const [moves, setMoves] = useState(0);
  const done1 = isParallelogram(A, B, C, D);
  const DC = vec(D, C);

  const [q2a, setQ2a] = useState(false);
  const [q2b, setQ2b] = useState(false);
  const [q3, setQ3] = useState(false);

  const placeD = (p, react) => {
    if (!inRange(p, RANGE)) return;
    setD(p);
    setMoves((n) => n + 1);
    if (isParallelogram(A, B, C, p)) react(true);
  };

  const steps = [
    {
      num: 1,
      title: 'Le quatrième sommet',
      subtitle: `A ${formatVec(A)}, B ${formatVec(B)}, C ${formatVec(C)}. Place D pour que ABCD ait ses côtés opposés parallèles et de même longueur.`,
      done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <p className="text-sm text-slate-700">
            ABCD, sommets dans l’ordre du contour : les côtés opposés sont [AB] et [DC]. Il faut donc{' '}
            <VecName>AB</VecName> = <VecName>DC</VecName>.
          </p>
          <VectorScene
            range={RANGE}
            points={[
              { id: 'A', name: 'A', x: A.x, y: A.y },
              { id: 'B', name: 'B', x: B.x, y: B.y },
              { id: 'C', name: 'C', x: C.x, y: C.y },
              { id: 'D', name: 'D', x: D.x, y: D.y, color: done1 ? '#d97706' : '#4f46e5' },
            ]}
            arrows={[
              { id: 'ab', from: A, to: B, color: SCENE_COLORS.main, name: 'AB' },
              { id: 'dc', from: D, to: C, color: done1 ? SCENE_COLORS.main : SCENE_COLORS.second, name: 'DC' },
              ...(done1 ? [
                { id: 'bc', from: B, to: C, ghost: true },
                { id: 'ad', from: A, to: D, ghost: true },
              ] : []),
            ]}
            draggableId={done1 ? null : 'D'}
            onPointChange={(p) => placeD(p, kit.react)}
            disabled={done1}
            ariaLabel={`Parallélogramme à fermer — D en ${formatVec(D)}`}
          />
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <Stepper label="D — x" value={D.x} onChange={(x) => placeD({ ...D, x }, kit.react)} min={RANGE.xMin} max={RANGE.xMax} disabled={done1} />
            <Stepper label="D — y" value={D.y} onChange={(y) => placeD({ ...D, y }, kit.react)} min={RANGE.yMin} max={RANGE.yMax} disabled={done1} />
          </div>
          <p className="text-sm flex flex-wrap items-center gap-2 font-mono tabular-nums" aria-live="polite">
            <span className="px-3 py-1 rounded-lg bg-violet-100 text-violet-900 font-bold"><VecName>AB</VecName> {formatVec(AB)}</span>
            <span className={`px-3 py-1 rounded-lg font-bold ${done1 ? 'bg-violet-100 text-violet-900' : 'bg-emerald-100 text-emerald-900'}`}><VecName>DC</VecName> {formatVec(DC)}</span>
          </p>
          {!done1 && moves >= ESCAPE_AFTER && (
            <button type="button" onClick={() => placeD(D_CIBLE, kit.react)}
              className="min-h-[44px] px-4 rounded-xl border-2 border-slate-300 bg-white text-sm font-semibold text-slate-700 hover:border-indigo-400">
              Je bloque — montre-moi
            </button>
          )}
          {done1 ? (
            <Feedback tone="ok">
              D {formatVec(D_CIBLE)} : <VecName>DC</VecName> = <VecName>AB</VecName> = {formatVec(AB)}, le
              quadrilatère se ferme. Par le calcul : D = C − <VecName>AB</VecName>, soit
              ({formatNum(C.x)} − {formatNum(AB.x)} ; {formatNum(C.y)} − {formatNum(AB.y)}).
            </Feedback>
          ) : null}
          {/* D vient d'être placé pour que DC = AB : la méthode du quatrième
              sommet est ce que l'élève vient de construire, pas une formule
              annoncée avant le geste. */}
          {done1 && (
            <KnowledgeBrick
              id="methode-parallelogramme"
              variant="new"
              lead={<>Tu viens de placer D jusqu’à ce que <VecName>DC</VecName> devienne exactement <VecName>AB</VecName>.</>}
            />
          )}
          {!done1 && (
            <Feedback tone="info">
              {equal(DC, vec(C, D))
                ? ''
                : `Il manque (${formatNum(AB.x - DC.x)} ; ${formatNum(AB.y - DC.y)}) à DC pour valoir AB. `}
              Déplace D jusqu’à ce que la flèche verte ait les coordonnées {formatVec(AB)}.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Le déplacement manquant',
      subtitle: `Le robot part de ${formatVec(depart)}, exécute u = ${formatVec(U2)}, puis un ordre inconnu v, et arrive en ${formatVec(arrivee)}.`,
      done: q2a && q2b,
      content: (
        <div className="space-y-3">
          <VectorScene
            range={RANGE}
            points={[
              { id: 'dep', name: 'départ', x: depart.x, y: depart.y, icon: '🤖' },
              { id: 'mid', name: '', x: ETAPE.x, y: ETAPE.y, color: '#7c3aed' },
              { id: 'arr', name: 'arrivée', x: arrivee.x, y: arrivee.y, color: '#059669' },
            ]}
            arrows={[
              { id: 'u', from: depart, to: ETAPE, color: SCENE_COLORS.main, name: 'u' },
              { id: 'v', from: ETAPE, to: arrivee, color: SCENE_COLORS.second, name: 'v', dashed: true },
              { id: 'tot', from: depart, to: arrivee, ghost: true, name: 'total' },
            ]}
            ariaLabel="Le robot fait u puis un déplacement inconnu v"
          />
          {/* La figure vient d'afficher u, v (inconnu) et le trajet total en
              fantôme : la méthode « v = total − u » est ce que l'élève a
              sous les yeux avant de la mettre en œuvre. */}
          <KnowledgeBrick
            id="methode-deplacement-manquant"
            variant="new"
            lead={<>Regarde la figure : le robot fait u, puis v, et le trajet total (en fantôme) va du départ à l’arrivée.</>}
          />
          <NumericQuestion
            prompt={<>Abscisse de <VecName>v</VecName> ?</>}
            expected={V2.x}
            parse={parseDecSigned}
            display={formatNum(V2.x)}
            width="w-24"
            requires={['regle-somme', 'mem-arrivee-moins-depart', 'methode-deplacement-manquant']}
            explain={`Le trajet total vaut ${formatVec(vec(depart, arrivee))} = u + v. Donc v = total − u : ${formatNum(vec(depart, arrivee).x)} − ${formatNum(U2.x)} = ${formatNum(V2.x)}.`}
            explainFor={(n) => (n === vec(depart, arrivee).x
              ? `${formatNum(n)} est l’abscisse du trajet TOTAL (départ → arrivée). Il faut lui retirer celle de u : 6 − 4 = 2.`
              : n === U2.x + vec(depart, arrivee).x ? 'Tu as ajouté u au total. v = total − u : 6 − 4 = 2.' : null)}
            solved={q2a}
            onAnswered={() => setQ2a(true)}
          />
          {q2a && (
            <NumericQuestion
              prompt={<>Ordonnée de <VecName>v</VecName> ?</>}
              expected={V2.y}
              parse={parseDecSigned}
              display={formatNum(V2.y)}
              width="w-24"
              requires={['regle-somme', 'mem-arrivee-moins-depart', 'methode-deplacement-manquant']}
              explain={`Sur les ordonnées : total ${formatNum(vec(depart, arrivee).y)} − ${formatNum(U2.y)} = ${formatNum(V2.y)}. Le robot redescend.`}
              explainFor={(n) => (n === 3 ? 'Signe : le total monte de 0, u monte de 3, donc v doit descendre de 3 : 0 − 3 = −3.' : null)}
              solved={q2b}
              onAnswered={() => setQ2b(true)}
            />
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Prouver un alignement',
      subtitle: `A ${formatVec(A3)}, B ${formatVec(B3)}, C ${formatVec(C3)}. Les trois points sont-ils alignés ?`,
      done: q3,
      content: (
        <div className="space-y-3">
          <VectorScene
            range={RANGE}
            points={[
              { id: 'A', name: 'A', x: A3.x, y: A3.y },
              { id: 'B', name: 'B', x: B3.x, y: B3.y },
              { id: 'C', name: 'C', x: C3.x, y: C3.y },
            ]}
            arrows={[
              { id: 'ab', from: A3, to: B3, color: SCENE_COLORS.main, name: 'AB', width: 4 },
              { id: 'ac', from: A3, to: C3, color: SCENE_COLORS.sum, name: 'AC', width: 2 },
            ]}
            ariaLabel="Trois points A, B, C et les vecteurs AB et AC"
          />
          {/* La figure vient d'afficher AB et AC : la méthode (colinéaires
              ⟺ alignés) est ce que l'élève va vérifier dans la question. */}
          <KnowledgeBrick
            id="methode-alignement"
            variant="new"
            lead={<>Regarde les deux flèches AB et AC, tracées depuis le même point A.</>}
          />
          <TapQuestion
            prompt="Quelle justification est correcte ?"
            options={[
              `Oui : AB = ${formatVec(vec(A3, B3))} et AC = ${formatVec(vec(A3, C3))} = ${formatNum(colinearFactor(vec(A3, B3), vec(A3, C3)))}·AB, donc AB et AC sont colinéaires et A, B, C alignés.`,
              'Non : AB et AC n’ont pas les mêmes coordonnées, donc ils ne sont pas alignés.',
              'Oui : sur la figure, les trois points ont l’air sur la même droite.',
              'Non : AB et AC n’ont pas la même longueur.',
            ]}
            correct={0}
            cols={1}
            requires={['methode-alignement', 'regle-colineaire']}
            explain="Trois points sont alignés exactement quand deux vecteurs qui les relient (AB et AC) sont colinéaires — ici AC = 3·AB. Des coordonnées différentes ou des longueurs différentes n’empêchent rien : c’est la DIRECTION qui compte, et la figure seule ne prouve rien."
            explainWrong="Les coordonnées de AB (3 ; 2) et AC (9 ; 6) sont différentes, et pourtant AC = 3·AB : même direction, donc alignés. Une figure suggère, un calcul prouve."
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(7)}
      moduleNumber={7}
      moduleTitle="Problèmes de géométrie"
      moduleSubtitle="Les vecteurs comme outil"
      estimatedTime="10 min"
      brief={{
        tag: 'Laboratoire',
        title: 'À quoi ça sert ?',
        tone: 'rose',
        body: (
          <p>
            Un point inconnu, un déplacement manquant, un alignement à prouver : trois problèmes de
            géométrie qui deviennent des calculs sur deux nombres.
          </p>
        ),
      }}
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={7} />}
    />
  );
}
