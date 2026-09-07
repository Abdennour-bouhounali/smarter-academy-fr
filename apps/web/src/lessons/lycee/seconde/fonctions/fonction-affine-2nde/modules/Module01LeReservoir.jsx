import React, { useState } from 'react';
import { ContentModule, TapQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import TankLab from '../components/TankLab';
import PredictionChips from '../components/PredictionChips';
import { affine, imageOf, formatDec } from '../components/affineUtils';

/**
 * Module 1 — DÉCLENCHEUR, et l'interaction SIGNATURE : le réservoir
 * (components/TankLab.jsx pour le bloc d'activité).
 * Step 1  a = 3, b = 10 verrouillés : avancer l'horloge minute par minute — « +3 L chaque minute ».
 * Step 2  b seul : le volume de départ ; la courbe glisse, +3 par minute ne change pas.
 * Step 3  a seul : a négatif vide le réservoir ; a = 0 stagne ; la courbe pivote autour de (0 ; b).
 * Step 4  reconnaître a et b dans V(t) = 2t + 12.
 * Rien n'est appelé « coefficient directeur » ni « taux » avant le pied de module.
 */
export default function Module01LeReservoir() {
  const [s, setS] = useState({ a: 3, b: 10, t: 0 });
  const [visitedT, setVisitedT] = useState([0]);
  const [pred1, setPred1] = useState(null);
  const [bs, setBs] = useState(() => new Set([10]));
  const [snap2, setSnap2] = useState(null);
  const [seenNeg, setSeenNeg] = useState(false); const [seenZero, setSeenZero] = useState(false);
  const [snap3, setSnap3] = useState(null);
  const [q4, setQ4] = useState(false);
  const done1 = [0, 1, 2, 3, 4, 5].every((k) => visitedT.includes(k));
  const done2 = snap2 !== null; const done3 = snap3 !== null;

  const change1 = (n, react) => { setS(n); if (visitedT.includes(n.t)) return; const v = [...visitedT, n.t]; setVisitedT(v); if (!done1 && [0, 1, 2, 3, 4, 5].every((k) => v.includes(k))) react?.(true); };
  const change2 = (n, react) => { setS(n); const nb = new Set(bs); nb.add(n.b); setBs(nb); if (nb.size >= 3 && !done2) { setSnap2(n); react?.(true); } };
  const change3 = (n, react) => {
    setS(n); let hit = false;
    if (n.a < 0 && !seenNeg) { setSeenNeg(true); hit = seenZero; }
    if (n.a === 0 && !seenZero) { setSeenZero(true); hit = seenNeg; }
    if (hit && !done3) { setSnap3(n); react?.(true); }
  };

  const steps = [
    {
      num: 1, title: 'Regarde le volume, minute par minute', subtitle: 'Robinet ouvert à 3 L/min, 10 L au départ. Avance l’horloge de 0 à 5 min.', done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <PredictionChips prompt="combien de litres le réservoir gagne-t-il entre la 4ᵉ et la 5ᵉ minute ?" options={[{ id: '3', label: '3 L, comme entre chaque minute' }, { id: 'plus', label: 'Plus qu’au début' }, { id: 'moins', label: 'Moins qu’au début' }]} value={pred1} onChange={setPred1} disabled={done1} />
          <TankLab a={s.a} b={s.b} t={s.t} onChange={(n) => change1(n, kit.react)} lockA lockB disabled={done1} showTable={done1} showStaircase />
          {done1 ? (
            <Feedback tone="ok">{pred1 === '3' ? 'Ta prédiction tenait' : pred1 ? 'Ta prédiction ne tenait pas' : 'Regarde le tableau'} : 10, 13, 16, 19, 22, 25 — <strong>+3 L à chaque minute</strong>, la première comme la cinquième. L’escalier sur la courbe est le même partout : « une minute de plus, 3 litres de plus ».</Feedback>
          ) : (
            <Feedback tone="info">t = {formatDec(s.t)} min, V = {formatDec(imageOf(affine(s.a, s.b), s.t))} L. Avance jusqu’à 5 min sans sauter de minute.</Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2, title: 'Change le volume de départ', subtitle: 'Le débit est verrouillé à 3 L/min. Règle b : essaie trois valeurs différentes et regarde la courbe.', done: done2,
      content: (kit) => (
        <div className="space-y-3">
          <TankLab a={done2 ? snap2.a : s.a} b={done2 ? snap2.b : s.b} t={done2 ? snap2.t : s.t} onChange={(n) => change2(n, kit.react)} lockA lockT disabled={done2 || !done1} showStaircase />
          {done2 ? (
            <Feedback tone="ok">La droite <strong>glisse</strong> verticalement, sans tourner : b est le volume à t = 0 — le point (0 ; b) sur l’axe vertical — et il ne change rien au « +3 par minute ».</Feedback>
          ) : (
            <Feedback tone="info">{bs.size} valeur{bs.size > 1 ? 's' : ''} de b essayée{bs.size > 1 ? 's' : ''} sur 3.</Feedback>
          )}
        </div>
      ),
    },
    {
      num: 3, title: 'Change le débit', subtitle: 'b est verrouillé. Règle a : rends-le négatif, puis nul.', done: done3,
      content: (kit) => (
        <div className="space-y-3">
          <TankLab a={done3 ? snap3.a : s.a} b={done3 ? snap3.b : s.b} t={done3 ? snap3.t : s.t} onChange={(n) => change3(n, kit.react)} lockB lockT disabled={done3 || !done2} showStaircase />
          {done3 ? (
            <Feedback tone="ok">a &lt; 0 : le réservoir <strong>se vide</strong>, la droite descend. a = 0 : rien ne bouge, la droite est horizontale. a &gt; 0 : ça monte. La droite <strong>pivote</strong> autour de (0 ; b) : a règle la pente, pas le départ.</Feedback>
          ) : (
            <Feedback tone="info">{!seenNeg ? 'Un débit négatif (on vide). ' : ''}{!seenZero ? 'Puis a = 0.' : ''}</Feedback>
          )}
        </div>
      ),
    },
    {
      num: 4, title: 'Lire a et b', done: q4,
      content: (
        <TapQuestion prompt="Un autre réservoir : V(t) = 2t + 12. Que représentent 2 et 12 ?"
          options={['2 L par minute (le débit), 12 L au départ', '12 L par minute, 2 L au départ', '2 minutes, 12 litres', '2 L au total, 12 minutes']}
          correct={0} cols={1}
          explain="Le nombre qui multiplie t est le gain par minute (a = 2) ; le nombre seul est le volume à t = 0 (b = 12) : V(0) = 12."
          explainWrong="Comme pour V(t) = 3t + 10 : le nombre devant t est ce qu’on gagne à chaque minute, le nombre seul est le volume au départ. 2 L/min et 12 L."
          solved={q4} onAnswered={() => setQ4(true)} />
      ),
    },
  ];

  return (
    <ContentModule ctx={MODULE_CTX} navLinks={getNavLinks(1)} moduleNumber={1}
      moduleTitle="Le réservoir" moduleSubtitle="Un robinet, un volume de départ, une horloge" estimatedTime="10 min"
      brief={{ tag: 'Déclencheur', title: 'V(t) = a·t + b', tone: 'indigo', body: <p>Un réservoir de 40 L. Le robinet a un débit a (en L/min, négatif si on vide), et il y a b litres au départ. Avance l’horloge, puis règle a et b — un bouton à la fois.</p> }}
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={1}><strong>Les mots justes.</strong> V(t) = a·t + b est une <strong>fonction affine</strong> ; a s’appelle le <strong>coefficient directeur</strong>, b l’<strong>ordonnée à l’origine</strong>. Module suivant : ce « +3 par minute » a un nom, et une formule.</KnowledgeSnapshot>} />
  );
}
