import React, { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import ProductScanner from '../components/ProductScanner';
import { lin, evalQuotient } from '../components/eqUtils';

/**
 * Module 5 — FORMALIZATION : « Quotient et valeur interdite » + À retenir.
 * Activity: balayer (x − 3)/(x + 1) ; trouver le trou (x = −1) et le zéro
 *   (x = 3) ; résoudre deux équations quotient ; la carte des méthodes.
 * Mathematical objective: A/B = 0 ⇔ A = 0 ET B ≠ 0 ; la valeur qui annule
 *   le dénominateur est interdite — même si elle annule aussi le numérateur.
 */
const Q = [lin(1, -3), lin(1, 1)];

export default function Module05QuotientEtValeurInterdite() {
  const [x, setX] = useState(0);
  const [seen, setSeen] = useState(() => new Set());
  const [solDone, setSolDone] = useState(false);
  const [trapDone, setTrapDone] = useState(false);
  const [cardDone, setCardDone] = useState(false);
  const scan = (v) => { setX(v); const r = evalQuotient(Q[0], Q[1], v); const s = new Set(seen); if (r === null) s.add('hole'); if (r === 0) s.add('zero'); setSeen(s); };
  const scanDone = seen.has('hole') && seen.has('zero');

  return (
    <ContentModule
      ctx={MODULE_CTX} navLinks={getNavLinks(5)} moduleNumber={5}
      moduleTitle="Quotient et valeur interdite"
      moduleSubtitle="Un trou dans la courbe : la valeur qui annule le dénominateur est interdite. À retenir, pour tous les types."
      estimatedTime="10 min"
      brief={{ tag: '➗ Mission 05', title: '(x − 3) ÷ (x + 1) = 0. Balaye x : une valeur fait tout planter, une autre annule.', tone: 'indigo', body: <p>Trouve le trou, trouve le zéro, puis la carte qui résume toute la leçon.</p> }}
      steps={[
        {
          num: 1, title: 'Le trou et le zéro', subtitle: 'Balaye x : une valeur fait planter le calcul, une autre l’annule. Trouve les deux.', done: scanDone,
          content: (kit) => (
            <div className="space-y-3">
              <ProductScanner factors={Q} mode="quotient" x={x} onX={(v) => { scan(v); const r = evalQuotient(Q[0], Q[1], v); if ((r === null && !seen.has('hole')) || (r === 0 && !seen.has('zero'))) kit.react(true); }} showRoots={scanDone} />
              {scanDone ? <Feedback tone="ok">En <strong>x = −1</strong>, le dénominateur vaut 0 : on ne peut pas diviser par 0, la valeur est <strong>interdite</strong> — le quotient n’existe pas. En <strong>x = 3</strong>, le numérateur vaut 0 et le dénominateur 4 : le quotient vaut 0. Une seule solution : 3.</Feedback>
                : <Feedback tone="info">{!seen.has('hole') ? 'Cherche la valeur de x où le dénominateur vaut 0.' : 'Maintenant celle où le quotient vaut 0.'}</Feedback>}
              {scanDone && (
                <KnowledgeBrick
                  id="valeur-interdite"
                  variant="new"
                  lead="Le trou que tu viens de trouver n’est pas un bug du scanner : cette valeur de x est bannie du calcul, et elle porte un nom."
                />
              )}
            </div>
          ),
        },
        {
          num: 2, title: 'Résous (x − 3)/(x + 1) = 0', done: solDone,
          content: (
            <div className="space-y-3">
              <TapQuestion prompt="L’ensemble des solutions est :" options={['{3}', '{3 ; −1}', '{−1}', '∅']} cols={4} correct={0}
                explain="Un quotient est nul quand son numérateur est nul ET son dénominateur ne l’est pas : x − 3 = 0 donne x = 3, et 3 + 1 ≠ 0. La valeur −1 n’est pas une solution : elle est interdite."
                explainWrong="−1 annule le DÉNOMINATEUR : division par 0, valeur interdite, jamais une solution. Seul x = 3 annule le numérateur sans annuler le dénominateur : S = {3}."
                requires={['valeur-interdite', 'equation-solution', 'regle-nombre-de-solutions']}
                solved={solDone} onAnswered={() => setSolDone(true)} />
              {solDone && (
                <KnowledgeBrick
                  id="quotient-nul"
                  variant="new"
                  lead="Numérateur nul, dénominateur autorisé : les deux conditions que tu viens d’appliquer s’écrivent en une ligne."
                />
              )}
            </div>
          ),
        },
        {
          num: 3, title: 'Le piège du double zéro', done: trapDone,
          content: (
            <div className="space-y-3">
              <TapQuestion prompt="(2x + 4)/(x + 2) = 0. Ensemble des solutions ?" options={['∅ : x = −2 annule le numérateur mais est interdit', '{−2}', '{2}', 'ℝ']} cols={1} correct={0}
                explain="Le numérateur s’annule pour x = −2… mais le dénominateur aussi : −2 est interdit. Aucune valeur autorisée n’annule le quotient : S = ∅. On cherche TOUJOURS la valeur interdite avant de conclure."
                explainWrong="Regarde le dénominateur : x + 2 vaut 0 pour x = −2. La valeur est interdite AVANT même de regarder le numérateur. Aucune solution : ∅."
                requires={['quotient-nul', 'valeur-interdite', 'regle-nombre-de-solutions', 'ensemble-reels']}
                solved={trapDone} onAnswered={() => setTrapDone(true)} />
              {trapDone && (
                <KnowledgeBrick
                  id="methode-choisir-methode"
                  variant="new"
                  lead="Tu as maintenant rencontré les quatre formes. Voici comment les reconnaître pour choisir la bonne méthode."
                />
              )}
            </div>
          ),
        },
        {
          num: 4, title: 'À retenir : quatre types, quatre méthodes', done: cardDone,
          content: (
            <div className="space-y-3">
              <div className="rounded-2xl border-2 border-indigo-200 bg-indigo-50 p-4 text-sm text-indigo-900 grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="rounded-xl bg-white border border-indigo-200 p-3"><div className="text-[11px] font-bold uppercase text-indigo-500">premier degré</div><div className="font-mono font-extrabold">ax + b = cx + d</div><div className="text-xs">même opération aux deux membres ; x d’un côté, nombres de l’autre ; ÷ coefficient ; solution exacte ; vérifier</div></div>
                <div className="rounded-xl bg-white border border-indigo-200 p-3"><div className="text-[11px] font-bold uppercase text-indigo-500">inéquation</div><div className="font-mono font-extrabold">ax + b ≤ cx + d</div><div className="text-xs">idem, mais × ou ÷ par un négatif RETOURNE le sens ; solutions = intervalle sur la droite</div></div>
                <div className="rounded-xl bg-white border border-indigo-200 p-3"><div className="text-[11px] font-bold uppercase text-indigo-500">produit nul</div><div className="font-mono font-extrabold">A × B = 0</div><div className="text-xs">⇔ A = 0 ou B = 0 ; ramener à 0 et factoriser d’abord</div></div>
                <div className="rounded-xl bg-white border border-indigo-200 p-3"><div className="text-[11px] font-bold uppercase text-indigo-500">quotient nul</div><div className="font-mono font-extrabold">A / B = 0</div><div className="text-xs">⇔ A = 0 et B ≠ 0 ; valeur interdite d’abord</div></div>
              </div>
              <BatchChoiceQuestion requires={['methode-choisir-methode', 'produit-nul', 'quotient-nul']} intro={<p className="text-sm text-slate-600">Pour chaque équation, la méthode :</p>}
                rows={[
                  { id: 'r1', label: '(x − 5)(x + 2) = 0', options: ['produit nul', 'premier degré', 'quotient'], correct: 0 },
                  { id: 'r2', label: '4x − 7 = 2x + 1', options: ['produit nul', 'premier degré', 'quotient'], correct: 1 },
                  { id: 'r3', label: '(x + 4)/(x − 1) = 0', options: ['produit nul', 'premier degré', 'quotient'], correct: 2 },
                  { id: 'r4', label: 'x(x − 3) = 0', options: ['produit nul', 'premier degré', 'quotient'], correct: 0, correction: 'x est un facteur : x = 0 ou x = 3.' },
                ]}
                feedback={({ allRight }) => <Feedback tone={allRight ? 'ok' : 'ko'}>Reconnaître la forme, c’est choisir la méthode. x(x − 3) = 0 a deux solutions, 0 et 3 : x seul est un facteur.</Feedback>}
                solved={cardDone} onAnswered={() => setCardDone(true)} />
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={5} />}
    />
  );
}
