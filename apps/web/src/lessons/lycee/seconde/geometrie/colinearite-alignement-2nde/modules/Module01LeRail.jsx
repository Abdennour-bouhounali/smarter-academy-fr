import React, { useState } from 'react';
import { ContentModule, TapQuestion, PredictionChips, KnowledgeBrick } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import VectorPlane, { Lamp, ComponentStepper } from '../components/VectorPlane';
import { compareDirections, formatVec, isZeroVec } from '../components/colinUtils';

/**
 * Module 1 — TRIGGER : « Le rail » (signature).
 *
 * ACTION            l'élève déplace l'extrémité de v (glisser, flèches, − / +
 *                   sur chaque coordonnée) ; u(2 ; 1) et son rail sont fixes.
 * CHANGEMENT        v tourne, s'allonge, se retourne ; trois voyants
 *                   (direction, sens, longueur) se recalculent aussitôt.
 * OBSERVATION       v peut être plus long, plus court, ou partir dans le sens
 *                   contraire et rester SUR le rail : le voyant « direction »
 *                   reste allumé ; il s'éteint dès que v quitte le rail.
 * SENS MATHÉMATIQUE « même direction » ne regarde ni la longueur ni le sens.
 *                   Deux vecteurs non nuls de même direction sont dits
 *                   colinéaires — le mot arrive à l'étape 4, comme le nom de
 *                   « sur le même rail ».
 * Controlled variable : les coordonnées de v (entières, v ≠ 0).
 * Expected observation (aha) : (−4 ; −2) roule sur le rail de (2 ; 1) — à
 *   l'envers et deux fois plus long ; (4 ; 3) le quitte alors que « les deux
 *   coordonnées ont grandi ».
 * Misconception targeted : « même direction » = même sens ; colinéaires =
 *   même longueur.
 * Laissé aux modules suivants : l'alignement (M2), k et la proportionnalité
 *   des coordonnées (M3), le déterminant (M4).
 */
const U = { x: 2, y: 1 };
const RANGE = { xMin: -6, xMax: 6, yMin: -6, yMax: 6 };

export default function Module01LeRail() {
  const [prediction, setPrediction] = useState(null);
  const [v, setV] = useState({ x: 3, y: -1 });
  const [seen, setSeen] = useState(() => new Set());
  const [zeroTried, setZeroTried] = useState(false);
  const [named, setNamed] = useState(false);

  const cmp = compareDirections(U, v);
  const done1 = seen.has('longueur');
  const done2 = seen.has('contraire');
  const done3 = seen.has('autre');

  /** Un déplacement de v : on enregistre le phénomène produit — pour l'étape en cours seulement. */
  const moveV = (next, react) => {
    if (isZeroVec(next)) { setZeroTried(true); return; }
    setZeroTried(false);
    setV(next);
    const c = compareDirections(U, next);
    let bucket = null;
    if (c.direction && !c.longueur) bucket = 'longueur';
    if (done1 && c.direction && c.sens === 'contraire') bucket = 'contraire';
    if (done1 && done2 && c.direction === false) bucket = 'autre';
    if (bucket && !seen.has(bucket)) {
      const s = new Set(seen); s.add(bucket); setSeen(s);
      react?.(true);
    }
  };

  const lab = (kit) => (
    <div className="space-y-3">
      <VectorPlane
        range={RANGE}
        points={[{ id: 'v', x: v.x, y: v.y }]}
        draggableId="v"
        onPointChange={(p) => moveV({ x: p.x, y: p.y }, kit.react)}
        rails={[{ id: 'rail-u', through: { x: 0, y: 0 }, dir: U, color: 'violet' }]}
        vectors={[
          { id: 'u', from: { x: 0, y: 0 }, to: U, color: 'violet', width: 5 },
          { id: 'v', from: { x: 0, y: 0 }, to: v, color: 'emerald', width: 3 },
        ]}
        legend={[{ id: 'u', label: 'u', value: formatVec(U), color: 'violet' }, { id: 'v', label: 'v', value: formatVec(v), color: 'emerald' }]}
        ariaLabel={`Repère : u (2 ; 1) et son rail, v ${formatVec(v)} — déplace l’extrémité de v`}
      />
      <div className="flex flex-wrap gap-3 justify-center">
        <ComponentStepper label="x de v" value={v.x} min={RANGE.xMin} max={RANGE.xMax} onChange={(x) => moveV({ x, y: v.y }, kit.react)} tone="emerald" />
        <ComponentStepper label="y de v" value={v.y} min={RANGE.yMin} max={RANGE.yMax} onChange={(y) => moveV({ x: v.x, y }, kit.react)} tone="emerald" />
      </div>
      <div className="flex gap-2 flex-wrap" aria-label="Comparaison de u et v">
        <Lamp label="Direction" on={cmp.direction === true} onText="la même" offText="différente" />
        <Lamp label="Sens" neutral={cmp.sens === null} on={cmp.sens === 'meme'} onText="le même" offText="contraire" tone="amber" />
        <Lamp label="Longueur" on={cmp.longueur} onText="la même" offText="différente" tone="amber" />
      </div>
      {zeroTried && <Feedback tone="info">(0 ; 0) est le vecteur nul : il n’a ni direction ni sens. Choisis un autre point pour l’extrémité de v.</Feedback>}
    </div>
  );

  return (
    <ContentModule
      ctx={MODULE_CTX} navLinks={getNavLinks(1)} moduleNumber={1}
      moduleTitle="Le rail"
      moduleSubtitle="Deux flèches partent du même point. Déplace la seconde : quand roule-t-elle sur le rail de la première ?"
      estimatedTime="9 min"
      brief={{ tag: '🛤️ Mission 01', title: 'Le vecteur u (2 ; 1) roule sur son rail, la droite en pointillé. Le vecteur v est libre.', tone: 'indigo', body: <p>Déplace l’extrémité de v (glisse le point, ou règle ses coordonnées). Quand les deux flèches roulent-elles sur le même rail ?</p> }}
      steps={[
        {
          num: 1, title: 'Pose v sur le rail, plus long ou plus court que u', subtitle: 'Le voyant « direction » doit s’allumer alors que le voyant « longueur » reste éteint.', done: done1,
          content: (kit) => (
            <div className="space-y-3">
              <PredictionChips prompt="deux vecteurs de longueurs différentes peuvent-ils avoir la même direction ?" options={[{ id: 'oui', label: 'Oui' }, { id: 'non', label: 'Non, il faut la même longueur' }]} value={prediction} onChange={setPrediction} disabled={done1} />
              {lab(kit)}
              {done1 ? (
                <Feedback tone="ok">{prediction === 'oui' ? 'Ta prédiction : oui. Le rail confirme' : prediction === 'non' ? 'Ta prédiction : non. Le rail te contredit' : 'Le rail tranche'} : v {formatVec(v)} roule sur le rail de u {formatVec(U)} avec une autre longueur. La direction ne regarde pas la longueur.</Feedback>
              ) : (
                <Feedback tone="info">{cmp.direction ? 'v est sur le rail… mais de la même longueur que u. Allonge-le ou raccourcis-le.' : 'v n’est pas sur le rail. Essaie (4 ; 2), ou (6 ; 3).'}</Feedback>
              )}
            </div>
          ),
        },
        {
          num: 2, title: 'Fais partir v dans le sens contraire, toujours sur le rail', subtitle: 'Direction allumée, sens « contraire ».', done: done2,
          content: (kit) => (
            <div className="space-y-3">
              {lab(kit)}
              {done2 ? (
                <Feedback tone="ok">v {formatVec(v)} part à l’envers et reste sur le rail : <strong>même direction, sens contraire</strong>. « Direction » et « sens » sont deux choses différentes — un demi-tour ne change pas la direction.</Feedback>
              ) : (
                <Feedback tone="info">{cmp.direction ? 'Sur le rail, mais dans le même sens que u. Passe de l’autre côté de l’origine.' : 'Reviens sur le rail, de l’autre côté de l’origine : (−2 ; −1), (−4 ; −2)…'}</Feedback>
              )}
            </div>
          ),
        },
        {
          num: 3, title: 'Quitte le rail', subtitle: 'Éteins le voyant « direction ». Essaie (4 ; 3) : les deux coordonnées ont grandi, et pourtant…', done: done3,
          content: (kit) => (
            <div className="space-y-3">
              {lab(kit)}
              {done3 ? (
                <Feedback tone="ok">v {formatVec(v)} a quitté le rail : les deux directions sont différentes. {v.x === 4 && v.y === 3 ? 'De (2 ; 1) à (4 ; 3), les deux coordonnées ont grandi — mais pas du même facteur : ×2 pour x, ×3 pour y. ' : ''}Sur le rail, chaque coordonnée de v vaut celle de u multipliée par un <em>même</em> nombre.</Feedback>
              ) : (
                <Feedback tone="info">v est encore sur le rail. Décale une seule coordonnée.</Feedback>
              )}
            </div>
          ),
        },
        {
          num: 4, title: 'Le nom du rail', done: named,
          content: (
            <div className="space-y-3">
              <p className="text-sm text-slate-600">Deux vecteurs non nuls qui ont la même direction — le même rail, quels que soient leur longueur et leur sens — sont dits <span className="font-bold text-slate-900">colinéaires</span>. Tu as fabriqué {[...seen].length} façons d’être ou de ne pas l’être : plus long, à l’envers, hors du rail.</p>
              <KnowledgeBrick
                id="colin-direction"
                variant="new"
                compact
                lead={<>Tu viens de poser v plus long, à l’envers, puis hors du rail de u : la propriété qu’ils partagent sur le rail porte un nom.</>}
              />
              <KnowledgeBrick
                id="colin-vocabulaire-direction-sens"
                variant="new"
                compact
                lead={<>Trois mots pour ce que tu as manipulé : direction, sens, longueur.</>}
              />
              <KnowledgeBrick
                id="colin-vecteur-nul"
                variant="new"
                compact
                lead={<>Le point (0 ; 0) que tu ne pouvais pas choisir pour v : le vecteur nul.</>}
              />
              <TapQuestion
                prompt="u(2 ; 1) et w(−6 ; −3) sont-ils colinéaires ? (Teste-le sur le rail si tu hésites.)"
                options={['Oui : même direction, sens contraire', 'Non : w part dans l’autre sens', 'Non : w est trois fois plus long']} cols={1} correct={0}
                explain="w = (−6 ; −3) roule sur le rail de u, à l’envers et trois fois plus long : colinéaires. Ni le sens ni la longueur ne comptent."
                explainWrong="Regarde le rail : (−6 ; −3) est dessus. Le sens contraire et la longueur triple ne changent pas la direction — w et u sont colinéaires."
                requires={['colin-direction', 'colin-vocabulaire-direction-sens', 'colin-vecteur-nul']}
                solved={named} onAnswered={() => setNamed(true)} />
              {named && (
                <KnowledgeBrick
                  id="mem-colin-rail"
                  variant="new"
                  lead={<>C’est le réflexe de toute la leçon : ni le sens, ni la longueur ne comptent — seule la direction.</>}
                />
              )}
            </div>
          ),
        },
      ]}
      footer={(
        <KnowledgeSnapshot moduleNumber={1}>
          Mais pour (37 ; 22) et (−111 ; −66), l’œil ne suffit plus : il faut un critère.
        </KnowledgeSnapshot>
      )}
    />
  );
}
