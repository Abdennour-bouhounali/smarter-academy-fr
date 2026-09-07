import React, { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import TankLab from '../components/TankLab';
import { variationOf, formatDec } from '../components/affineUtils';

/**
 * Module 3 — DÉCOUVERTE : le signe de a et les variations.
 * Step 1  faire passer a par 0 : la flèche bascule ; b ne change rien.
 * Step 2  le tableau de variations d'une fonction affine.  Step 3  lire b et a sur un graphique.
 *
 * CONNAISSANCES AVANT LA DEMANDE (docs/architecture/KNOWLEDGE_DEPENDENCY.md).
 *   La règle « le signe de a décide » et la lecture graphique de a et b ne
 *   vivaient que dans les `Feedback` et le pied : les deux questions les
 *   exigeaient sans qu'elles aient été posées en position d'enseignement.
 *   L'ordre est maintenant geste → brique → demande :
 *     étape 1  faire passer a par 0, puis bouger b → brique `regle-signe-a-variations`
 *     étape 2  le tableau de variations (`requires`)
 *     étape 3  brique `methode-lire-a-b-graphique`, puis la lecture graphique
 *
 * MANIPULATION JAMAIS GELÉE. Le réservoir restait `disabled` une fois les
 * trois cas vus ; il reste vivant, pour que l'élève puisse refaire basculer la
 * flèche autant de fois qu'il veut.
 */
export default function Module03CroissanteOuDecroissante() {
  const [s, setS] = useState({ a: 2, b: 15, t: 4 });
  const [seen, setSeen] = useState(() => new Set(['croissante']));
  const [q2, setQ2] = useState(false); const [q3, setQ3] = useState(false);
  const done1 = seen.has('croissante') && seen.has('decroissante') && seen.has('constante');
  const change = (n, react) => { setS(n); const v = variationOf({ a: n.a, b: n.b }); if (seen.has(v)) return; const st = new Set(seen); st.add(v); setSeen(st); if (!done1 && st.size === 3) react?.(true); };
  const arrow = variationOf({ a: s.a, b: s.b });

  const steps = [
    {
      num: 1, title: 'Fais basculer a', subtitle: 'Règle a d’un côté de 0 à l’autre, en passant par 0. Regarde la flèche. Puis change b : la flèche bouge-t-elle ?', done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <TankLab a={s.a} b={s.b} t={s.t} onChange={(n) => change(n, kit.react)} lockT showStaircase={false} />
          <div className="flex flex-wrap gap-2 text-sm font-mono font-bold tabular-nums" aria-live="polite">
            <span className="px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-900">a = {formatDec(s.a)} {s.a > 0 ? '> 0' : s.a < 0 ? '< 0' : '= 0'}</span>
            <span className="px-3 py-1.5 rounded-lg text-white" data-variation={arrow} style={{ backgroundColor: arrow === 'croissante' ? '#059669' : arrow === 'decroissante' ? '#e11d48' : '#64748b' }}>V {arrow === 'croissante' ? '↗ croissante' : arrow === 'decroissante' ? '↘ décroissante' : '→ constante'}</span>
          </div>
          {done1 ? (
            <>
              <Feedback tone="ok">Trois cas, et seul le <strong>signe de a</strong> compte : a &gt; 0 → croissante (↗), a &lt; 0 → décroissante (↘), a = 0 → constante. b déplace la droite sans changer la flèche.</Feedback>
              <KnowledgeBrick id="regle-signe-a-variations" variant="new" lead={<>Tu as fait basculer la flèche en changeant le seul signe de a — et bouger b ne l’a jamais fait bouger. Voici la règle que tu viens de constater.</>} />
            </>
          ) : (
            <Feedback tone="info">Vu : {[...seen].map((v) => (v === 'croissante' ? '↗' : v === 'decroissante' ? '↘' : '→')).join(' ')}. {!seen.has('decroissante') ? 'Passe a en négatif. ' : ''}{!seen.has('constante') ? 'Passe par a = 0.' : ''}</Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2, title: 'Le tableau de variations', done: q2,
      content: (
        <BatchChoiceQuestion intro={<p className="text-sm text-slate-700">Pour f(x) = ax + b sur ℝ :</p>}
          rows={[
            { id: 'r1', label: 'f(x) = −2x + 7 est', options: ['décroissante sur ℝ', 'croissante sur ℝ', 'croissante puis décroissante'], correct: 0, correction: 'a = −2 < 0' },
            { id: 'r2', label: 'f(x) = 0,5x − 9 est', options: ['croissante sur ℝ', 'décroissante sur ℝ', 'constante'], correct: 0, correction: 'a = 0,5 > 0 (b négatif ne compte pas)' },
            { id: 'r3', label: 'f(x) = 4 est', options: ['constante', 'croissante', 'décroissante'], correct: 0, correction: 'a = 0' },
            { id: 'r4', label: 'Le tableau de variations d’une fonction affine (a ≠ 0) a', options: ['une seule flèche, sur tout ℝ', 'deux flèches', 'une flèche par valeur de b'], correct: 0, correction: 'monotone sur ℝ' },
          ]}
          feedback={({ allRight, nCorrect, total }) => <Feedback tone={allRight ? 'ok' : 'ko'}>{allRight ? 'Quatre sur quatre.' : `${nCorrect} sur ${total}.`} Une fonction affine est monotone sur ℝ tout entier : une seule flèche, dans le sens du signe de a. Le signe de b n’y est pour rien.</Feedback>}
          requires={['regle-signe-a-variations']}
          solved={q2} onAnswered={() => setQ2(true)} />
      ),
    },
    {
      num: 3, title: 'Lire sur le graphique', done: q3,
      content: (
        <div className="space-y-3">
          <KnowledgeBrick id="methode-lire-a-b-graphique" variant="new" lead={<>Tu as vu la droite glisser avec b et pivoter avec a. Dans l’autre sens : voici comment retrouver ces deux nombres sur une droite déjà tracée.</>} />
            <TapQuestion above={<TankLab a={-2} b={20} t={0} lockA lockB lockT frozen showStaircase />}
            prompt="Sur ce graphique (t de 0 à 10) : que valent a et b ?"
            options={['a = −2 (la droite descend de 2 par minute), b = 20 (le point sur l’axe vertical)', 'a = 20, b = −2', 'a = 2, b = 20', 'a = −2, b = 0']}
            correct={0} cols={1}
            explain="b se lit là où la droite coupe l’axe vertical : V(0) = 20. a se lit sur l’escalier : une minute vers la droite, la droite descend de 2 → a = −2. Décroissante, donc a négatif."
            explainWrong="Deux lectures : l’ordonnée à l’origine b sur l’axe vertical (20), puis l’escalier « +1 en t → −2 en V » : a = −2. La droite descend, a est forcément négatif."
            requires={['methode-lire-a-b-graphique', 'regle-signe-a-variations']}
            solved={q3} onAnswered={() => setQ3(true)} />
        </div>
      ),
    },
  ];

  return (
    <ContentModule ctx={MODULE_CTX} navLinks={getNavLinks(3)} moduleNumber={3}
      moduleTitle="Croissante ou décroissante ?" moduleSubtitle="Le signe de a décide" estimatedTime="8 min"
      brief={{ tag: 'Découverte', title: 'Une flèche qui bascule', tone: 'sky', body: <p>Le sens de variation d’une fonction affine tient dans un signe. Fais basculer a, puis vérifie que b n’y change rien.</p> }}
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={3}>Module suivant : deux mesures suffisent pour retrouver a, puis b — dans une table comme sur un graphique.</KnowledgeSnapshot>} />
  );
}
