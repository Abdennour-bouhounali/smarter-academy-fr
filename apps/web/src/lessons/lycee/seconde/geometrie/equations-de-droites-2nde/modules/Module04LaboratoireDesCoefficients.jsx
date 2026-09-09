import React, { useState } from 'react';
import { ContentModule, TapQuestion, PredictionChips, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import CoefficientLab from '../components/CoefficientLab';
import LineBuilder from '../components/LineBuilder';
import { lineFromReduced, lineFromCartesian } from '../components/lineUtils';
import { formatDec } from '@smarter-academy/core';

/**
 * Module 4 — MANIPULATION : « Le laboratoire des coefficients ».
 *
 * Étapes 1–2 : y = m·x + p. Student action: steppers m puis p. Visual
 *   consequence: m fait pivoter la droite autour de (0 ; p) — l'escalier
 *   +1 → +m grandit ; p la fait glisser verticalement, la flèche (1 ; m) ne
 *   change pas. Expected observation: m = pente, p = ordonnée à l'origine.
 * Étape 3 : a·x + b·y + c = 0 ; b = 0 donne la verticale que y = m·x + p ne
 *   peut pas écrire. Misconception: « toute droite s'écrit y = mx + p ».
 * Étape 4 : tracer y = −2x + 3 en posant deux points qui vérifient l'équation.
 */
const TARGET4 = lineFromReduced(-2, 3);

export default function Module04LaboratoireDesCoefficients() {
  const [val, setVal] = useState({ m: 1, p: 0 });
  const [ghost, setGhost] = useState(null);
  const [pred1, setPred1] = useState(null);
  const [pred3, setPred3] = useState(null);
  const [ms, setMs] = useState(() => new Set([1]));
  const [ps, setPs] = useState(() => new Set([0]));
  const [car, setCar] = useState({ a: 1, b: 1, c: 0 });
  const [carGhost, setCarGhost] = useState(null);
  const [vertical, setVertical] = useState(false);
  const [b4, setB4] = useState(false);
  const [q5, setQ5] = useState(false);

  const done1 = ms.has(2) && [...ms].some((m) => m < 0);
  const done2 = ps.has(3) && ps.has(-2);
  const done3 = vertical;

  const changeReduced = (next, react) => {
    setGhost(lineFromReduced(val.m, val.p));
    setVal(next);
    if (next.m !== val.m && !ms.has(next.m)) {
      const s = new Set(ms); s.add(next.m); setMs(s);
      if (!done1 && s.has(2) && [...s].some((m) => m < 0)) react?.(true);
    }
    if (next.p !== val.p && !ps.has(next.p)) {
      const s = new Set(ps); s.add(next.p); setPs(s);
      if (done1 && !done2 && s.has(3) && s.has(-2)) react?.(true);
    }
  };
  const changeCar = (next, react) => {
    setCarGhost(lineFromCartesian(car));
    setCar(next);
    if (next.b === 0 && next.a !== 0 && !vertical) { setVertical(true); react?.(true); }
  };

  return (
    <ContentModule
      ctx={MODULE_CTX} navLinks={getNavLinks(4)} moduleNumber={4}
      moduleTitle="Le laboratoire des coefficients"
      moduleSubtitle="Fais varier m, puis p : qui tourne, qui glisse ? Et cette droite verticale que y = mx + p refuse de donner."
      estimatedTime="11 min"
      brief={{ tag: '🎚️ Mission 04', title: 'Une équation réduite y = m·x + p a deux boutons. Chacun change UNE chose sur la droite.', tone: 'indigo', body: <p>Un bouton à la fois. La droite d’avant reste en pointillés.</p> }}
      steps={[
        {
          num: 1, title: 'Fais varier m', subtitle: 'Passe par m = 2, puis par un m négatif. Ne touche pas à p.', done: done1,
          content: (kit) => (
            <div className="space-y-3">
              <PredictionChips prompt="si j’augmente m, que fait la droite ?" options={[{ id: 'pivote', label: 'Elle pivote autour du point (0 ; p)' }, { id: 'monte', label: 'Elle monte, parallèle à elle-même' }, { id: 'rien', label: 'Elle ne bouge pas' }]} value={pred1} onChange={setPred1} disabled={done1} />
              <CoefficientLab mode="reduced" value={val} onChange={(v) => changeReduced(v, kit.react)} ghost={ghost} />
              {done1 ? (
                <Feedback tone="ok">{pred1 === 'pivote' ? 'Ta prédiction était juste' : pred1 ? 'Ta prédiction ne tenait pas' : 'Regarde'} : m fait <strong>pivoter</strong> la droite autour de (0 ; p). Un pas à droite, m vers le haut : m est la <strong>pente</strong> — la flèche (1 ; m) est un vecteur directeur. Négatif, la droite descend.</Feedback>
              ) : (
                <Feedback tone="info">{!ms.has(2) ? 'Passe par m = 2. ' : ''}{![...ms].some((m) => m < 0) ? 'Puis un m négatif.' : ''}</Feedback>
              )}
              {done1 && (
                <KnowledgeBrick
                  id="droite-role-m-p"
                  variant="new"
                  lead="Un bouton, un effet. Voilà ce que fait chacun des deux — le second se vérifie à l’étape suivante."
                />
              )}
            </div>
          ),
        },
        {
          num: 2, title: 'Fais varier p', subtitle: 'Passe par p = 3, puis p = −2. Ne touche pas à m.', done: done2,
          content: (kit) => (
            <div className="space-y-3">
              <CoefficientLab mode="reduced" value={val} onChange={(v) => changeReduced(v, kit.react)} ghost={ghost} />
              {done2 ? (
                <Feedback tone="ok">p fait <strong>glisser</strong> la droite verticalement, sans la faire tourner : la flèche (1 ; {formatDec(val.m)}) n’a pas changé. p est l’<strong>ordonnée à l’origine</strong> : la droite coupe l’axe des ordonnées en (0 ; p).</Feedback>
              ) : (
                <Feedback tone="info">{!ps.has(3) ? 'Passe par p = 3. ' : ''}{!ps.has(-2) ? 'Puis p = −2.' : ''}</Feedback>
              )}
              {done2 && (
                <KnowledgeBrick
                  id="droite-ordonnee-origine"
                  variant="new"
                  lead="Le point où la droite coupe l’axe des ordonnées t’a suivi à chaque glissement. Il porte un nom."
                />
              )}
            </div>
          ),
        },
        {
          num: 3, title: 'La droite qui manque', subtitle: 'En cartésien a·x + b·y + c = 0, il y a trois boutons. Obtiens une droite VERTICALE.', done: done3,
          content: (kit) => (
            <div className="space-y-3">
              <PredictionChips prompt="peut-on obtenir une droite verticale avec y = m·x + p ?" options={[{ id: 'grand', label: 'Oui, avec m très grand' }, { id: 'jamais', label: 'Non, jamais' }, { id: 'zero', label: 'Oui, avec m = 0' }]} value={pred3} onChange={setPred3} disabled={done3} />
              <CoefficientLab mode="cartesian" value={car} onChange={(v) => changeCar(v, kit.react)} ghost={carGhost} />
              {done3 ? (
                <Feedback tone="ok">{pred3 === 'jamais' ? 'Ta prédiction était juste' : pred3 === 'grand' ? 'm très grand donne une droite très raide, jamais verticale' : pred3 === 'zero' ? 'm = 0 donne une droite horizontale' : 'Regarde'} : avec <strong>b = 0</strong>, l’équation devient a·x + c = 0, soit x = {formatDec(-car.c / car.a)} — une droite verticale, sans équation réduite (aucun m ne convient : le vecteur directeur (−b ; a) = (0 ; {formatDec(car.a)}) a u_x = 0). L’équation cartésienne écrit TOUTES les droites.</Feedback>
              ) : (
                <Feedback tone="info">Amène b à 0 en gardant a ≠ 0. Le vecteur directeur est (−b ; a) : lis-le sur la flèche.</Feedback>
              )}
              {done3 && (
                <KnowledgeBrick
                  id="droite-verticale"
                  variant="new"
                  lead="La droite que les deux boutons de y = m·x + p ne savaient pas atteindre :"
                />
              )}
            </div>
          ),
        },
        {
          num: 4, title: 'Tracer une droite à partir de son équation', subtitle: 'Place P et Q pour que la droite (PQ) soit y = −2x + 3. Aucune cible n’est dessinée : c’est l’équation qui guide.', done: b4,
          content: (kit) => (
            <div className="space-y-3">
              <KnowledgeBrick
                id="droite-tracer"
                variant="new"
                compact
                lead="Sans cible dessinée, c’est l’équation qui dit où poser les points."
              />
              <LineBuilder target={TARGET4} solved={b4} onSolved={() => setB4(true)} react={kit.react} />
            </div>
          ),
        },
        {
          num: 5, title: 'Lire une équation', done: q5,
          content: (
            <div className="space-y-3">
              <KnowledgeBrick
                id="droite-lire-equation"
                variant="new"
                compact
                lead="Tu as réglé m et p toi-même ; on peut maintenant les lire sur une équation qu’on n’a pas écrite."
              />
              <TapQuestion
              prompt="Droite d’équation y = −0,5x + 4. Que peut-on lire ?"
              options={['Pente −0,5 ; elle coupe l’axe des ordonnées en (0 ; 4)', 'Pente 4 ; elle coupe l’axe des ordonnées en (0 ; −0,5)', 'Elle passe par (4 ; 0) et descend de 0,5 par unité', 'Elle est verticale']} cols={1} correct={0}
              explain="m = −0,5 est la pente (pour 1 à droite, 0,5 vers le bas) et p = 4 l’ordonnée à l’origine : point (0 ; 4). Vecteur directeur (1 ; −0,5), ou (2 ; −1)."
                explainWrong="Dans y = m·x + p, m multiplie x (pente : −0,5) et p est la constante (ordonnée à l’origine : 4, point (0 ; 4) — pas (4 ; 0))."
                requires={['droite-lire-equation', 'droite-role-m-p', 'droite-ordonnee-origine']}
                solved={q5} onAnswered={() => setQ5(true)} />
              {q5 && (
                <KnowledgeBrick
                  id="mem-droite-m-p"
                  variant="new"
                  compact
                  lead="Ce qu’il faut retenir de ce module."
                />
              )}
            </div>
          ),
        },
      ]}
      footer={
        <KnowledgeSnapshot moduleNumber={4}>
          m tourne, p glisse, b = 0 dresse la droite. Reste le test le plus utile : ce point est-il sur la droite ? Module suivant.
        </KnowledgeSnapshot>
      }
    />
  );
}
