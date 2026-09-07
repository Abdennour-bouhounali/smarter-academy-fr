import React, { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import LineLab from '../components/LineLab';
import PredictionChips from '../components/PredictionChips';
import { det, scaleVec, formatVec, formatPoint } from '../components/lineUtils';

/**
 * Module 1 — TRIGGER : « Le laboratoire des droites » (signature).
 *
 * Activity: un point A et une flèche u ; la droite passant par A dans la
 *   direction de u se redessine à chaque geste, l'ancienne reste en pointillés.
 * Student action: doubler / renverser u (chips), orienter u (pointe, steppers,
 *   clavier), déplacer A. Prédiction sans verdict avant chaque étape.
 * Controlled variables: u, puis A — UNE à la fois.
 * Mathematical state: { A, u } ; l'historique des gestes (doublé, renversé,
 *   tourné, translaté).
 * Visual consequence: la droite NE BOUGE PAS pour 2u et −u ; elle pivote
 *   autour de A quand u tourne ; elle glisse parallèlement quand A bouge.
 * Expected observation (aha): un point + une direction = UNE droite ; la
 *   longueur et le sens de la flèche ne comptent pas.
 * Misconception targeted: « 2u donne une autre droite » ; « déplacer A fait
 *   tourner la droite ».
 * Formalization: rien n'est écrit ici — le module se termine sur la question
 *   « comment décrire TOUS les points de cette droite avec des nombres ? ».
 */
const START = { A: { x: -2, y: -1 }, u: { x: 2, y: 1 } };

export default function Module01LaboratoireDesDroites() {
  const [line, setLine] = useState(START);
  const [ghost, setGhost] = useState(null);
  const [mode, setMode] = useState('u');
  const [pred1, setPred1] = useState(null);
  const [pred2, setPred2] = useState(null);
  const [pred3, setPred3] = useState(null);
  const [seen, setSeen] = useState(() => new Set());
  const [turns, setTurns] = useState(0);
  const [slides, setSlides] = useState(0);
  const [q4, setQ4] = useState(false);

  const done1 = seen.has('double') && seen.has('reverse');
  const done2 = turns >= 2;
  const done3 = slides >= 2;

  const change = (next, react) => {
    const prev = line;
    setGhost(prev);
    setLine(next);
    const sameA = prev.A.x === next.A.x && prev.A.y === next.A.y;
    const s = new Set(seen);
    let hit = false;
    if (sameA) {
      const d2 = scaleVec(prev.u, 2);
      const dm = scaleVec(prev.u, -1);
      if (next.u.x === d2.x && next.u.y === d2.y && !s.has('double')) { s.add('double'); hit = true; }
      if (next.u.x === dm.x && next.u.y === dm.y && !s.has('reverse')) { s.add('reverse'); hit = true; }
      if (det(prev.u, next.u) !== 0 && done1) { setTurns((n) => n + 1); if (turns + 1 === 2) hit = true; }
    } else if (done2) {
      setSlides((n) => n + 1);
      if (slides + 1 === 2) hit = true;
    }
    setSeen(s);
    if (hit) react?.(true);
  };

  const lab = (kit, opts = {}) => (
    <LineLab
      A={line.A} u={line.u} ghost={ghost}
      onChange={(next) => change(next, kit.react)}
      mode={mode} modes={opts.modes ?? ['u']} onMode={setMode}
      showScale={opts.showScale ?? false}
    />
  );

  return (
    <ContentModule
      ctx={MODULE_CTX} navLinks={getNavLinks(1)} moduleNumber={1}
      moduleTitle="Le laboratoire des droites"
      moduleSubtitle="Un point, une flèche : une droite. Que devient-elle quand la flèche change ? Quand le point bouge ?"
      estimatedTime="9 min"
      brief={{ tag: '🧪 Mission 01', title: 'Un point A et une flèche u suffisent à tracer UNE droite : celle qui passe par A en suivant u.', tone: 'indigo', body: <p>La droite en trait plein suit tes gestes ; la droite d’avant reste en pointillés, pour voir ce qui change — ou ne change pas.</p> }}
      steps={[
        {
          num: 1, title: 'Double la flèche, puis renverse-la', subtitle: 'Les boutons u → 2u et u → −u. Regarde la droite.', done: done1,
          content: (kit) => (
            <div className="space-y-3">
              <PredictionChips prompt="si je double la flèche u, que devient la droite ?" options={[{ id: 'tourne', label: 'Elle tourne' }, { id: 'meme', label: 'Elle ne bouge pas' }, { id: 'longue', label: 'Elle devient plus longue' }]} value={pred1} onChange={setPred1} disabled={done1} />
              {lab(kit, { showScale: true })}
              {done1 ? (
                <Feedback tone="ok">{pred1 === 'meme' ? 'Ta prédiction : elle ne bouge pas. Exact' : pred1 === 'tourne' ? 'Ta prédiction : elle tourne. Le laboratoire te contredit' : pred1 === 'longue' ? 'Ta prédiction : plus longue. Une droite n’a pas de longueur — et elle n’a pas bougé' : 'Regarde'} : 2u et −u dessinent <strong>la même droite</strong> que u. Tout vecteur non nul colinéaire à u est un <strong>vecteur directeur</strong> de la droite — il y en a une infinité.</Feedback>
              ) : (
                <Feedback tone="info">{seen.has('double') ? 'Doublée : la droite n’a pas bougé. Maintenant renverse-la (u → −u).' : seen.has('reverse') ? 'Renversée : rien n’a bougé. Maintenant double-la (u → 2u).' : 'Appuie sur u → 2u, puis sur u → −u.'}</Feedback>
              )}
              {done1 && (
                <>
                  <KnowledgeBrick
                    id="droite-vecteur-directeur"
                    variant="new"
                    lead="Ni la longueur ni le sens de la flèche n’ont bougé la droite. Le mot qui nomme ce que tu viens de constater :"
                  />
                  <KnowledgeBrick
                    id="droite-vocabulaire-directeur"
                    variant="new"
                    compact
                    lead="Le mot en une ligne, pour tes notes."
                  />
                </>
              )}
            </div>
          ),
        },
        {
          num: 2, title: 'Change la direction', subtitle: 'Déplace la pointe de la flèche (glisser, steppers, flèches du clavier). Fais-le deux fois.', done: done2,
          content: (kit) => (
            <div className="space-y-3">
              <PredictionChips prompt="si je change uniquement la direction de u, que fait la droite ?" options={[{ id: 'pivote', label: 'Elle pivote autour de A' }, { id: 'glisse', label: 'Elle glisse sans tourner' }, { id: 'rien', label: 'Elle ne bouge pas' }]} value={pred2} onChange={setPred2} disabled={done2} />
              {lab(kit, { showScale: true })}
              {done2 ? (
                <Feedback tone="ok">{pred2 === 'pivote' ? 'Ta prédiction était juste' : pred2 ? 'Ta prédiction ne tenait pas' : 'Regarde'} : quand la direction change, la droite <strong>pivote autour de A</strong> — A reste dessus, tout le reste tourne. Direction actuelle u {formatVec(line.u)}.</Feedback>
              ) : (
                <Feedback tone="info">{turns === 1 ? 'Une rotation. Encore une, dans une autre direction.' : 'Tourne la flèche : la droite doit pivoter, et le pointillé montrer l’ancienne position.'}</Feedback>
              )}
            </div>
          ),
        },
        {
          num: 3, title: 'Déplace le point A', subtitle: 'Choisis « Déplacer le point A ». Fais-le deux fois, sans toucher à la flèche.', done: done3,
          content: (kit) => (
            <div className="space-y-3">
              <PredictionChips prompt="si je déplace A sans changer la direction, que fait la droite ?" options={[{ id: 'glisse', label: 'Elle glisse, parallèle à elle-même' }, { id: 'pivote', label: 'Elle pivote' }, { id: 'rien', label: 'Elle ne bouge pas' }]} value={pred3} onChange={setPred3} disabled={done3} />
              {lab(kit, { modes: ['u', 'A'] })}
              {done3 ? (
                <Feedback tone="ok">{pred3 === 'glisse' ? 'Ta prédiction était juste' : pred3 ? 'Ta prédiction ne tenait pas' : 'Regarde'} : la droite a <strong>glissé parallèlement</strong> à elle-même — même direction, autre point. A {formatPoint(line.A)} est le point de passage ; u {formatVec(line.u)} la direction. Deux ingrédients, une droite.</Feedback>
              ) : (
                <Feedback tone="info">{mode !== 'A' ? 'Sélectionne « Déplacer le point A ».' : slides === 1 ? 'Un déplacement. Encore un.' : 'Déplace A : la droite doit glisser, sans tourner.'}</Feedback>
              )}
              {done3 && (
                <>
                  <KnowledgeBrick
                    id="droite-point-direction"
                    variant="new"
                    lead="Tu as fait pivoter, puis glisser. Les deux ingrédients que tu viens d’isoler, chacun avec son effet :"
                  />
                  <KnowledgeBrick
                    id="mem-droite-point-direction"
                    variant="new"
                    compact
                    lead="À garder en tête pour toute la leçon."
                  />
                </>
              )}
            </div>
          ),
        },
        {
          num: 4, title: 'Vecteur directeur', done: q4,
          content: (
            <TapQuestion
              prompt="Une droite a pour vecteur directeur u (1 ; 2). Lesquels de ces vecteurs la dirigent AUSSI ?"
              options={['(2 ; 4) et (−1 ; −2)', 'Seulement (2 ; 4)', 'Aucun : le vecteur directeur est unique', '(2 ; 1) et (−2 ; −1)']} cols={1} correct={0}
              explain="Tout vecteur non nul colinéaire à u dirige la même droite : (2 ; 4) = 2u et (−1 ; −2) = −u. (2 ; 1) n’est pas colinéaire à (1 ; 2) : autre direction."
              explainWrong="Tu viens de le voir : 2u et −u laissent la droite en place. Tout vecteur non nul colinéaire à u est un vecteur directeur ; (2 ; 1) ne l’est pas (det = 1 × 1 − 2 × 2 ≠ 0)."
              requires={['droite-vecteur-directeur']}
              solved={q4} onAnswered={() => setQ4(true)} />
          ),
        },
      ]}
      footer={<Feedback tone="ok">Un point, une direction : une droite. Mais une droite a une infinité de points — comment les décrire <strong>tous</strong> avec des nombres ? Module suivant : on marche dessus.</Feedback>}
    />
  );
}
