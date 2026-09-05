import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import RhythmLine from '../components/RhythmLine';
import { lcm, gcd, divisors } from '../components/arithUtils';

/**
 * Module 4 — MANIPULATION : « Multiples communs ».
 * Activity: régler deux rythmes de bus et lire le premier rendez-vous ;
 *   puis le plus grand carreau qui pave une pièce sans découpe.
 * Mathematical objective: le premier rendez-vous est le PPCM (pas toujours
 *   le produit) ; le plus grand carreau est le PGCD.
 * Misconception targeted: « le rendez-vous, c'est a × b » ; « le plus grand
 *   carreau, c'est le plus petit côté ÷ 2 ».
 */
export default function Module04MultiplesCommuns() {
  const [a, setA] = useState(12); const [b, setB] = useState(18);
  const [seen, setSeen] = useState(() => new Set());
  const [rdvDone, setRdvDone] = useState(false);
  const [tileDone, setTileDone] = useState(false);
  const [whyDone, setWhyDone] = useState(false);
  const set = (na, nb) => { const s = new Set(seen); s.add(`${na}-${nb}`); setSeen(s); };
  return (
    <ContentModule
      ctx={MODULE_CTX} navLinks={getNavLinks(4)} moduleNumber={4}
      moduleTitle="Multiples communs"
      moduleSubtitle="Deux bus, deux rythmes : quand se croisent-ils ? Et quel est le plus grand carreau qui pave sans découpe ?"
      estimatedTime="10 min"
      brief={{ tag: '🚌 Mission 04', title: 'Deux bus partent ensemble à 7 h : l’un toutes les 12 min, l’autre toutes les 18 min.', tone: 'indigo', body: <p>Quand repartiront-ils ensemble ? Règle les rythmes et regarde les marques se superposer.</p> }}
      steps={[
        {
          num: 1, title: 'Trouve le rendez-vous', subtitle: 'Essaie 12 et 18, puis 6 et 10, puis deux rythmes de ton choix.', done: seen.size >= 2 && rdvDone,
          content: (kit) => (
            <div className="space-y-3">
              <RhythmLine a={a} b={b} onA={(v) => { setA(v); set(v, b); }} onB={(v) => { setB(v); set(a, v); if (seen.size === 1) kit.react(true); }} showAnswer={seen.size >= 2} />
              {seen.size >= 2 ? (
                <TapQuestion prompt="Le premier rendez-vous de deux bus (12 min et 18 min) est à 36 min. Pourquoi pas 216 = 12 × 18 ?" options={['Parce que 12 et 18 partagent des facteurs : 36 est déjà un multiple des deux', 'Parce qu’on a arrondi', 'Parce que 216 minutes, c’est trop long']} cols={1} correct={0}
                  explain="216 EST un rendez-vous (le produit en est toujours un), mais pas le premier. Le premier multiple commun s’appelle le PPCM : ici 36. Quand les deux nombres ne partagent aucun facteur (6 et 35), le produit est bien le premier."
                  explainWrong="Le produit 12 × 18 = 216 est bien un multiple commun, mais pas le PREMIER : 36 l’est déjà (36 = 12 × 3 = 18 × 2). C’est le PPCM."
                  solved={rdvDone} onAnswered={() => setRdvDone(true)} />
              ) : <Feedback tone="info">Change au moins un rythme pour voir les marques communes se déplacer.</Feedback>}
            </div>
          ),
        },
        {
          num: 2, title: 'Le plus grand carreau', subtitle: 'Une pièce de 84 cm sur 126 cm, à paver avec des carreaux carrés identiques, sans aucune découpe.', done: tileDone && whyDone,
          content: (
            <div className="space-y-3">
              <NumericQuestion prompt="Quel est le côté du PLUS GRAND carreau possible (en cm) ?" expected={gcd(84, 126)} suffix="cm"
                explain={`Le côté doit diviser 84 ET 126 : c’est un diviseur commun. Le plus grand est 42 (84 = 42 × 2, 126 = 42 × 3). La pièce est alors pavée par 2 × 3 = 6 carreaux.`}
                explainFor={(v) => (v === 21 ? '21 divise bien les deux, mais ce n’est pas le PLUS GRAND : 42 aussi divise 84 et 126.' : v === 84 ? '84 ne divise pas 126 (126 = 84 + 42) : le carreau dépasserait. Cherche un diviseur COMMUN.' : v === 63 ? '63 divise 126 mais pas 84 : il faut un diviseur des DEUX.' : 'Les diviseurs communs de 84 et 126 sont 1, 2, 3, 6, 7, 14, 21, 42 : le plus grand est 42.')}
                solved={tileDone} onAnswered={() => setTileDone(true)} />
              {tileDone && (
                <TapQuestion prompt="Pourquoi le côté du carreau doit-il être un DIVISEUR de 84 et de 126 ?" options={['Pour que les carreaux remplissent exactement chaque dimension, sans reste', 'Parce que 84 et 126 sont pairs', 'Pour que le carreau soit carré']} cols={1} correct={0}
                  explain="Aligner des carreaux de côté c le long de 84 cm exige 84 = c × (un entier) : reste nul. Idem pour 126. Donc c est un diviseur commun ; « le plus grand carreau » = le PGCD."
                  explainWrong="Le carreau doit tomber juste sur les deux dimensions : 84 et 126 doivent être des multiples de son côté, sinon il faudrait découper. D’où « diviseur commun »."
                  solved={whyDone} onAnswered={() => setWhyDone(true)} />
              )}
            </div>
          ),
        },
      ]}
      footer={<Feedback tone="ok">Deux questions symétriques : « quand se retrouvent-ils ? » demande le plus petit multiple commun (PPCM, {lcm(12, 18)} pour 12 et 18) ; « quel est le plus grand morceau qui tombe juste ? » demande le plus grand diviseur commun (PGCD, {gcd(84, 126)} pour 84 et 126, parmi {divisors(gcd(84, 126)).length} diviseurs communs).</Feedback>}
    />
  );
}
