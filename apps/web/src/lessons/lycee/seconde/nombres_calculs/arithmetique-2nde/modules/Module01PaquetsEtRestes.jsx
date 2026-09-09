import React, { useState } from 'react';
import { ContentModule, TapQuestion, PredictionChips, KnowledgeBrick } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import PackLab from '../components/PackLab';
import { addPacks, divmod } from '../components/arithUtils';

/**
 * Module 1 — TRIGGER : « Les paquets et les restes » (signature ; le
 * laboratoire est à l'écran dès la première seconde).
 *
 * Activity: ranger deux tas de jetons en paquets de p, lire les restes,
 *   réunir les tas ; refaire avec deux impairs, puis avec p = 7.
 * Mathematical objective: multiple ⇔ reste nul ; les restes s'ajoutent —
 *   c'est ce qui décide si la somme est encore un multiple.
 * Expected observation (aha) : deux tas sans reste donnent une somme sans
 *   reste ; deux restes de 1 (p = 2) forment un paquet, donc impair + impair
 *   = pair ; mais 12 + 20 (p = 7) laisse un reste 4.
 * Misconception targeted: « impair + impair = impair » ; « si a n'est pas
 *   multiple de p, a + b ne peut pas l'être ».
 * Formalization: seulement le vocabulaire multiple / diviseur / reste ; la
 *   preuve littérale est le module 2.
 */
export default function Module01PaquetsEtRestes() {
  const [prediction, setPrediction] = useState(null);
  const [a, setA] = useState(12); const [b, setB] = useState(20); const [p, setP] = useState(4);
  // L'état d'ouverture (12 et 20 en paquets de 4) est DÉJÀ un cas « aucun
  // reste » : on l'enregistre au montage, sinon l'élève devrait le refaire.
  const [seen, setSeen] = useState(() => new Set(['both0']));
  const [sumDone, setSumDone] = useState(false);
  const [oddDone, setOddDone] = useState(false);
  const [wordsDone, setWordsDone] = useState(false);

  const note = (na, nb, np) => {
    const s = addPacks(na, nb, np);
    const key = s.singlesA === 0 && s.singlesB === 0 ? 'both0' : s.singlesA + s.singlesB === np ? 'complete' : s.remainder !== 0 ? 'left' : 'other';
    const next = new Set(seen); next.add(key); setSeen(next);
    return next;
  };
  const setAll = (na, nb, np) => { setA(na); setB(nb); setP(np); note(na, nb, np); };
  const step1Done = seen.has('both0') && seen.has('left') && sumDone;
  const oddSeen = a % 2 === 1 && b % 2 === 1 && p === 2;

  return (
    <ContentModule
      ctx={MODULE_CTX} navLinks={getNavLinks(1)} moduleNumber={1}
      moduleTitle="Les paquets et les restes"
      moduleSubtitle="Range des jetons en paquets de p. Deux tas sans reste : leur somme aussi. Deux restes de 1 : ils forment un paquet."
      estimatedTime="9 min"
      brief={{ tag: '🎲 Mission 01', title: 'Deux tas de jetons, une consigne : ranger par paquets de p. Ce qui ne rentre pas reste seul.', tone: 'indigo', body: <p>Regarde les jetons SEULS — le reste. Ce sont eux qui décident de tout.</p> }}
      steps={[
        {
          num: 1, title: 'Range, puis réunis', subtitle: 'Trouve un cas où les deux tas n’ont aucun reste, et un cas où la réunion garde un reste.', done: step1Done,
          content: (kit) => (
            <div className="space-y-3">
              <PredictionChips prompt="si aucun des deux tas n’a de reste, la réunion peut-elle en avoir un ?" options={[{ id: 'oui', label: 'Oui, parfois' }, { id: 'non', label: 'Non, jamais' }]} value={prediction} onChange={setPrediction} disabled={step1Done} />
              <PackLab a={a} b={b} p={p} onA={(v) => { setA(v); note(v, b, p); }} onB={(v) => { setB(v); note(a, v, p); }} onP={(v) => { setP(v); const s = note(a, b, v); if (s.has('both0') && s.has('left')) kit.react(true); }} />
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => setAll(12, 20, 4)} className="min-h-[44px] px-3 rounded-xl border-2 border-slate-300 bg-white text-sm font-bold text-slate-700 hover:border-indigo-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">12 et 20, paquets de 4</button>
                <button type="button" onClick={() => setAll(12, 20, 7)} className="min-h-[44px] px-3 rounded-xl border-2 border-slate-300 bg-white text-sm font-bold text-slate-700 hover:border-indigo-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">12 et 20, paquets de 7</button>
              </div>
              {!step1Done && <Feedback tone="info">{!seen.has('both0') ? 'Trouve deux tas SANS reste (essaie 12 et 20 en paquets de 4).' : !seen.has('left') ? 'Maintenant un cas où il reste des jetons après réunion (12 et 20 en paquets de 7).' : 'Réponds à la question ci-dessous.'}</Feedback>}
              {seen.has('both0') && seen.has('left') && (
                <TapQuestion prompt="Quand la réunion des deux tas est-elle encore un multiple de p ?" options={['Quand les restes des deux tas s’additionnent en 0 ou en un paquet complet', 'Toujours', 'Seulement si les deux tas sont sans reste']} cols={1} correct={0}
                  requires={[]}
                  explain={<>{prediction === 'non' ? 'Ta prédiction pour deux tas sans reste : jamais de reste. Exact' : prediction === 'oui' ? 'Ta prédiction : parfois. Les paquets te contredisent pour ce cas-là' : 'Constat'} — mais ce n’est pas le seul cas : 7 et 9 ont chacun un reste de 1 (paquets de 2), et leurs deux jetons seuls forment un paquet de plus : 16 est bien un multiple de 2. Ce sont les RESTES qui décident.</>}
                  explainWrong="Regarde la ligne « réunion » : les restes s’ajoutent. S’ils font 0, ou juste un paquet complet, la somme est un multiple de p. Sinon il reste des jetons."
                  solved={sumDone} onAnswered={() => setSumDone(true)} />
              )}
              {/* Le geste (paquets + réunion) vient de montrer que ce sont
                  les restes qui décident : l'étape 2 va s'appuyer dessus. */}
              {sumDone && (
                <KnowledgeBrick
                  id="regle-reste-decide"
                  variant="new"
                  compact
                  lead={<>Tu viens de le voir avec les jetons : ce sont les <strong>restes</strong> qui décident si la réunion reste un multiple de p.</>}
                />
              )}
            </div>
          ),
        },
        {
          num: 2, title: 'Deux impairs', subtitle: 'Mets p = 2, A = 7 et B = 9. Que valent les restes ?', done: oddDone,
          content: (kit) => (
            <div className="space-y-3">
              <PackLab a={a} b={b} p={p} onA={(v) => { setA(v); note(v, b, p); }} onB={(v) => { setB(v); note(a, v, p); }} onP={(v) => { setP(v); note(a, b, v); if (v === 2 && a % 2 === 1 && b % 2 === 1) kit.react(true); }} />
              <button type="button" onClick={() => setAll(7, 9, 2)} className="min-h-[44px] px-3 rounded-xl border-2 border-slate-300 bg-white text-sm font-bold text-slate-700 hover:border-indigo-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">7 et 9, paquets de 2</button>
              {oddSeen && (
                <TapQuestion prompt="La somme de deux nombres impairs est :" options={['Toujours paire : les deux jetons seuls forment un paquet de 2', 'Toujours impaire', 'Parfois paire, parfois impaire']} cols={1} correct={0}
                  requires={['regle-reste-decide']}
                  explain="Un impair, c’est des paquets de 2 et UN jeton seul. Deux impairs : deux jetons seuls, qui forment exactement un paquet de plus. Reste 0 : la somme est paire. Toujours."
                  explainWrong="Les paquets le montrent : chaque impair laisse exactement 1 jeton seul ; 1 + 1 = 2, un paquet complet, reste 0. La somme est paire — toujours, pas parfois."
                  solved={oddDone} onAnswered={() => setOddDone(true)} />
              )}
              {!oddSeen && <Feedback tone="info">Règle p sur 2, et prends deux nombres impairs (7 et 9 par exemple).</Feedback>}
            </div>
          ),
        },
        {
          num: 3, title: 'Les mots', done: wordsDone,
          content: (
            <div className="space-y-3">
              {/* Les jetons rangés en paquets (étapes 1-2) portent maintenant
                  des noms, avant la question qui les exige. */}
              <KnowledgeBrick
                id="division-euclidienne"
                variant="new"
                lead={<>Ranger n en paquets de p, c’est la <strong>division euclidienne</strong> : <span className="font-mono font-bold">n = p × q + r</span> avec 0 ≤ r &lt; p — q paquets, r jetons seuls.</>}
              />
              <KnowledgeBrick
                id="multiple-diviseur"
                variant="new"
                lead={<>Quand <strong>r = 0</strong>, n est un <strong>multiple</strong> de p, et p est un <strong>diviseur</strong> de n : <span className="font-mono">n = p × q</span>. La même égalité, lue dans les deux sens.</>}
              />
              <TapQuestion prompt="On sait que 91 = 7 × 13. Quelle affirmation est exacte ?" options={['91 est un multiple de 7, et 7 est un diviseur de 91', '7 est un multiple de 91', '91 est un diviseur de 7', '91 et 7 sont tous deux des multiples de 13']} cols={1} correct={0}
                requires={['division-euclidienne', 'multiple-diviseur']}
                explain="Le grand nombre est le multiple, les petits sont les diviseurs : 91 est multiple de 7 et de 13 ; 7 et 13 sont des diviseurs de 91. Une seule égalité, deux lectures."
                explainWrong="Attention au sens : dans 91 = 7 × 13, c’est 91 qui contient 7 fois 13 (et 13 fois 7). Donc 91 est le MULTIPLE, 7 et 13 les DIVISEURS."
                solved={wordsDone} onAnswered={() => setWordsDone(true)} />
              {/* Bilan du module : la règle « multiple ⟺ reste nul » qui a
                  porté les trois étapes. */}
              {wordsDone && (
                <KnowledgeBrick
                  id="mem-multiple-reste"
                  variant="new"
                  lead={<>⭐ Retiens : <strong>n = pk ⟺ p divise n ⟺ le reste de n par p vaut 0.</strong></>}
                />
              )}
            </div>
          ),
        },
      ]}
      footer={(
        <KnowledgeSnapshot moduleNumber={1}>
          Il reste à le <strong>prouver</strong> pour tous les nombres, pas seulement ceux qu’on a essayés : c’est le module suivant, avec une lettre.
        </KnowledgeSnapshot>
      )}
    />
  );
}
