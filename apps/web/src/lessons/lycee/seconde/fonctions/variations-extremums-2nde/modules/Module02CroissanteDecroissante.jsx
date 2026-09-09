import React, { useState } from 'react';
import { ContentModule, BatchChoiceQuestion, PredictionChips, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import MathText from '../../../../../common/components/MathText';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import TwoProbes from '../components/TwoProbes';
import { TRAIL, TRAIL_RANGE, imageOf, formatDec } from '../components/variationsUtils';

/**
 * Module 2 — DÉCOUVERTE : croissante, décroissante — la définition par les inégalités.
 * Step 1  sur [0 ; 3] : trois paires a < b, toujours h(a) < h(b) → croissante.
 * Step 2  sur [3 ; 6] : a < b et h(a) > h(b) → décroissante.
 * Step 3  à cheval sur le sommet : a < b avec h(a) < h(b) ET une autre paire avec h(a) > h(b) → pas monotone sur [0 ; 6].
 * Step 4  la définition, en mots et en inégalités.
 *
 * CONNAISSANCES AVANT LA DEMANDE (docs/architecture/KNOWLEDGE_DEPENDENCY.md).
 *   La définition par inégalités et le mot « monotone » vivaient dans les
 *   `Feedback` de fin d'étape et dans l'« À retenir » du pied : le QCM de
 *   l'étape 4 les exigeait tous les deux sans qu'aucun n'ait été posé en
 *   position d'enseignement. L'ordre est maintenant geste → brique → demande :
 *     étape 2  trois paires sur la montée, trois sur la descente → brique
 *              `definition-croissante-decroissante` (les deux sens ensemble)
 *     étape 3  la paire à cheval sur le sommet → briques
 *              `vocab-monotone-intervalle` puis `mem-croissante-ordre`
 *     étape 4  la définition demandée, désormais légitime (`requires`)
 *
 * MANIPULATION JAMAIS GELÉE. Les trois TwoProbes devenaient `disabled` dès
 * l'étape réussie : on ne pouvait plus reposer une quatrième paire pour
 * éprouver la règle qu'on venait d'énoncer. Ils restent vivants ; seuls les
 * verrous d'ANTÉRIORITÉ (`!done1`, `!done2`) demeurent. Les PredictionChips
 * restent figés après coup : une prédiction s'enregistre une fois.
 */
const PLANE = { f: TRAIL, range: TRAIL_RANGE, unit: 30, unitY: 0.35, xStep: 1, yStep: 100, step: 0.5 };
const pairOk = (a, b, lo, hi) => a < b && a >= lo && b <= hi;

export default function Module02CroissanteDecroissante() {
  const [p1, setP1] = useState({ a: 0.5, b: 1 });
  const [pairs1, setPairs1] = useState(() => new Set());
  const [p2, setP2] = useState({ a: 3.5, b: 4 });
  const [pairs2, setPairs2] = useState(() => new Set());
  const [p3, setP3] = useState({ a: 2, b: 4 });
  const [pred3, setPred3] = useState(null);
  const [seenUp, setSeenUp] = useState(false);
  const [seenDown, setSeenDown] = useState(false);
  const [q4, setQ4] = useState(false);
  const done1 = pairs1.size >= 3; const done2 = pairs2.size >= 3; const done3 = seenUp && seenDown;

  const rec = (set, setSet, next, lo, hi, react, doneNow) => {
    if (!pairOk(next.a, next.b, lo, hi)) return;
    const k = `${next.a}|${next.b}`; if (set.has(k)) return;
    const s = new Set(set); s.add(k); setSet(s); if (!doneNow && s.size === 3) react?.(true);
  };
  const move3 = (next, react) => {
    setP3(next);
    if (!(next.a < 3 && next.b > 3 && next.a >= 0 && next.b <= 6)) return;
    const ha = imageOf(TRAIL, next.a); const hb = imageOf(TRAIL, next.b);
    let hit = false;
    if (ha < hb && !seenUp) { setSeenUp(true); hit = seenDown; }
    if (ha > hb && !seenDown) { setSeenDown(true); hit = seenUp; }
    if (hit) react?.(true);
  };

  const steps = [
    {
      num: 1, title: 'Sur la montée', subtitle: 'Place a et b entre 0 et 3, avec a < b. Compare h(a) et h(b). Teste trois paires différentes.', done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <TwoProbes {...PLANE} a={p1.a} b={p1.b} min={0} max={3} onChange={(n) => { setP1(n); rec(pairs1, setPairs1, n, 0, 3, kit.react, done1); }} />
          {done1 ? (
            <Feedback tone="ok">Trois paires, même verdict : <strong>a &lt; b ⟹ h(a) &lt; h(b)</strong>. C’est la définition : h est <strong>croissante sur [0 ; 3]</strong> — les images sont rangées dans le même ordre que les abscisses.</Feedback>
          ) : (
            <Feedback tone="info">{pairs1.size} paire{pairs1.size > 1 ? 's' : ''} sur 3 (il faut a &lt; b, tous deux entre 0 et 3).</Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2, title: 'Sur la descente', subtitle: 'Même chose entre 3 et 6.', done: done2,
      content: (kit) => (
        <div className="space-y-3">
          <TwoProbes {...PLANE} a={p2.a} b={p2.b} min={3} max={6} onChange={(n) => { setP2(n); rec(pairs2, setPairs2, n, 3, 6, kit.react, done2); }} disabled={!done1} />
          {done2 ? (
            <>
              <Feedback tone="ok"><strong>a &lt; b ⟹ h(a) &gt; h(b)</strong> : l’ordre des images est inversé. h est <strong>décroissante sur [3 ; 6]</strong>.</Feedback>
              {/* Les deux sens ont été éprouvés à la main, trois paires chacun :
                  la définition ne fait que consigner ce qui vient d'être vu. */}
              <KnowledgeBrick
                id="definition-croissante-decroissante"
                variant="new"
                lead="Six paires placées de tes mains, deux verdicts constants : voilà la définition, écrite avec des inégalités."
              />
            </>
          ) : (
            <Feedback tone="info">{pairs2.size} paire{pairs2.size > 1 ? 's' : ''} sur 3, entre 3 et 6.</Feedback>
          )}
        </div>
      ),
    },
    {
      num: 3, title: 'À cheval sur le sommet', subtitle: 'Sur [0 ; 6] entier : place a avant 3 km et b après. Trouve une paire avec h(a) < h(b), puis une paire avec h(a) > h(b).', done: done3,
      content: (kit) => (
        <div className="space-y-3">
          <PredictionChips prompt="sur [0 ; 6], peut-on dire que h est croissante ou décroissante ?" options={[{ id: 'crois', label: 'Croissante' }, { id: 'decrois', label: 'Décroissante' }, { id: 'ni', label: 'Ni l’un ni l’autre' }]} value={pred3} onChange={setPred3} disabled={done3} />
          <TwoProbes {...PLANE} a={p3.a} b={p3.b} min={0} max={6} onChange={(n) => move3(n, kit.react)} disabled={!done2} />
          {done3 ? (
            <>
              <Feedback tone="ok">{pred3 === 'ni' ? 'Ta prédiction tenait' : pred3 ? 'Ta prédiction ne tenait pas' : 'Regarde'} : sur [0 ; 6], a &lt; b donne parfois h(a) &lt; h(b), parfois h(a) &gt; h(b). h n’est <strong>ni croissante ni décroissante</strong> sur [0 ; 6] : elle n’y est pas <strong>monotone</strong>. Une variation s’énonce toujours <strong>sur un intervalle</strong> où elle est vraie.</Feedback>
              {/* Deux paires contradictoires sur le MÊME intervalle : c'est ce
                  contre-exemple, fabriqué à la main, qui rend « monotone » et
                  « sur un intervalle » nécessaires. */}
              <KnowledgeBrick
                id="vocab-monotone-intervalle"
                variant="new"
                lead="Tes deux paires se contredisent sur [0 ; 6] — d’où le mot qui manquait, et l’intervalle qu’il faut toujours dire."
              />
              <KnowledgeBrick
                id="mem-croissante-ordre"
                variant="new"
                lead="À retenir sous la forme la plus courte : deux inégalités, un intervalle."
              />
            </>
          ) : (
            <Feedback tone="info">{!seenUp ? 'Cherche a < b avec h(a) < h(b) (a en bas de la montée, b encore haut). ' : ''}{!seenDown ? 'Puis a < b avec h(a) > h(b) (a près du sommet, b dans la vallée).' : ''}</Feedback>
          )}
        </div>
      ),
    },
    {
      num: 4, title: 'La définition', done: q4,
      content: (
        <BatchChoiceQuestion intro={<p className="text-sm text-slate-700">Sur un intervalle I :</p>}
          rows={[
            { id: 'r1', label: 'f croissante sur I signifie', options: ['a < b ⟹ f(a) ≤ f(b)', 'f(x) > 0 sur I', 'a < b ⟹ f(a) ≥ f(b)'], correct: 0, correction: 'même ordre' },
            { id: 'r2', label: 'f décroissante sur I signifie', options: ['a < b ⟹ f(a) ≥ f(b)', 'f(x) < 0 sur I', 'a < b ⟹ f(a) ≤ f(b)'], correct: 0, correction: 'ordre inversé' },
            { id: 'r3', label: 'f monotone sur I signifie', options: ['croissante sur I, ou décroissante sur I', 'constante sur I', 'croissante puis décroissante'], correct: 0, correction: 'un seul sens sur tout I' },
            { id: 'r4', label: 'h (le sentier) est monotone sur', options: ['[0 ; 3]', '[0 ; 6]', '[2 ; 4]'], correct: 0, correction: 'une seule couleur' },
          ]}
          feedback={({ allRight, nCorrect, total }) => <Feedback tone={allRight ? 'ok' : 'ko'}>{allRight ? 'Quatre sur quatre.' : `${nCorrect} sur ${total}.`} Croissante : les images gardent l’ordre des abscisses ; décroissante : elles l’inversent. Rien à voir avec le signe de f(x). Monotone = un seul sens sur tout l’intervalle.</Feedback>}
          requires={['definition-croissante-decroissante', 'vocab-monotone-intervalle', 'mem-croissante-ordre', 'variations-sens', 'notation-fx', 'intervalle-crochets']}
          solved={q4} onAnswered={() => setQ4(true)} />
      ),
    },
  ];

  return (
    <ContentModule ctx={MODULE_CTX} navLinks={getNavLinks(2)} moduleNumber={2}
      moduleTitle="Croissante, décroissante" moduleSubtitle="Deux sondes, une inégalité, un intervalle" estimatedTime="11 min"
      brief={{ tag: 'Découverte', title: 'Ce que « ça monte » veut dire exactement', tone: 'violet', body: <p>Deux sondes a et b sur le profil du sentier. Compare h(a) et h(b) quand a &lt; b — sur la montée, sur la descente, puis à cheval sur le sommet. <MathText>{'$a < b \\Rightarrow ?$'}</MathText></p> }}
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={2}>Module suivant : la piste peinte devient un tableau — flèches, sommets, vallées, valeurs.</KnowledgeSnapshot>} />
  );
}
