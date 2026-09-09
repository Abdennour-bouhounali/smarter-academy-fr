import React, { useState } from 'react';
import { Square, Scale } from 'lucide-react';
import { ContentModule, TapQuestion, PredictionChips, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { useLabState } from '../../../../../common/hooks/useLabState';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import CarresLab from '../components/CarresLab';
import { A_DEFAUT, B_DEFAUT, surLeCercle, bilanAires, arrondi, fr } from '../components/pythagore4e';
import { LESSON_CONFIG } from '../lesson.config';

/**
 * Module 1 — DÉCLENCHEUR, et l'interaction SIGNATURE de la leçon.
 *
 * Activity              déformer un triangle rectangle en glissant le sommet
 *                       de l'angle droit le long d'un cercle.
 * Mathematical objective l'aire du carré construit sur l'hypoténuse égale la
 *                       somme des deux autres — pour TOUTE forme.
 * Student action        faire glisser C ; relever plusieurs formes.
 * Controlled variable   la position de C, contrainte au cercle de diamètre
 *                       [AB] : l'angle droit est préservé par une PROPRIÉTÉ,
 *                       pas par un aimant qui corrigerait après coup.
 * Mathematical state    les trois sommets ; carrés, aires et balance MESURÉS.
 * Visual consequence    les trois carrés se redessinent, les trois nombres
 *                       changent, la balance reste équilibrée.
 * Expected observation  « les aires changent, l'égalité reste ».
 * Misconception targeted croire que la relation porte sur les LONGUEURS.
 * Formalization         le mot « hypoténuse » est posé ici, parce qu'il faut
 *                       nommer le côté dont on parle ; l'ÉNONCÉ du théorème
 *                       et sa formule attendent le module 3.
 *
 * CONTINUITÉ : le triangle est mémorisé et revient au module 2, où on le
 * libère de son cercle. Déclaré dans `lesson.config.js`.
 */
const THETA_DEPART = 55;

export default function Module01LesTroisCarres() {
  const memo = useLabState(LESSON_CONFIG.id, 'triangle', { theta: THETA_DEPART });
  const [theta, setTheta] = useState(memo.value.theta ?? THETA_DEPART);
  const [releves, setReleves] = useState([]);
  const [pred, setPred] = useState(null);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);

  const C = surLeCercle(A_DEFAUT, B_DEFAUT, (theta * Math.PI) / 180);
  const bilan = bilanAires({ A: A_DEFAUT, B: B_DEFAUT, C });

  const placer = (p) => {
    // On repasse de la position à l'angle : l'état reste UN nombre, et le
    // cercle reste la seule contrainte.
    const O = { x: (A_DEFAUT.x + B_DEFAUT.x) / 2, y: (A_DEFAUT.y + B_DEFAUT.y) / 2 };
    const t = (Math.atan2(O.y - p.y, p.x - O.x) * 180) / Math.PI;
    const borne = Math.max(8, Math.min(172, t));
    setTheta(borne);
    memo.save({ theta: borne });
  };

  const relever = () => {
    const petit = arrondi(bilan.petits[0].aire / 100, 1);
    if (releves.some((r) => Math.abs(r.petit - petit) < 0.6)) return;
    setReleves((r) => [...r, {
      petit,
      autre: arrondi(bilan.petits[1].aire / 100, 1),
      grand: arrondi(bilan.grand.aire / 100, 1),
    }]);
  };

  const done1 = releves.length >= 3;

  const lab = <CarresLab contraint C={C} onC={placer} />;

  const steps = [
    {
      num: 1,
      title: 'Déforme le triangle, et relève trois formes',
      subtitle: 'Fais glisser le point C. Il suit le cercle en pointillé, et l’angle en C reste droit.',
      done: done1,
      content: (
        <div className="space-y-3">
          <PredictionChips
            prompt="En déformant le triangle, les trois aires vont changer. Leur relation va-t-elle changer aussi ?"
            options={[
              { id: 'change', label: 'Oui, tout change' },
              { id: 'tient', label: 'Non, quelque chose tient' },
              { id: 'sais-pas', label: 'Impossible à dire' },
            ]}
            value={pred}
            onChange={setPred}
          />
          {lab}
          <button
            type="button"
            onClick={relever}
            className="min-h-[44px] w-full rounded-xl bg-indigo-600 px-3 py-2 text-sm font-bold text-white hover:bg-indigo-700"
          >
            Relever cette forme
          </button>
          {releves.length > 0 && (
            <div className="overflow-x-auto rounded-xl border-2 border-slate-200 bg-white p-3">
              <table className="w-full text-sm tabular-nums">
                <thead>
                  <tr className="text-[11px] uppercase tracking-wide text-slate-400">
                    <th className="pb-1 text-left">forme</th>
                    <th className="pb-1 text-right">petit + petit</th>
                    <th className="pb-1 text-right">grand</th>
                  </tr>
                </thead>
                <tbody>
                  {releves.map((r, i) => (
                    <tr key={i} className="border-t border-slate-100">
                      <td className="py-1 text-slate-500">n° {i + 1}</td>
                      <td className="py-1 text-right font-mono text-slate-700">
                        {fr(r.petit, 1)} + {fr(r.autre, 1)} = {fr(arrondi(r.petit + r.autre, 1), 1)}
                      </td>
                      <td className="py-1 text-right font-mono font-bold text-slate-900">{fr(r.grand, 1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {!done1 && releves.length > 0 && (
            <Feedback tone="info">
              {releves.length} forme{releves.length > 1 ? 's' : ''} relevée{releves.length > 1 ? 's' : ''}.
              Déplace C nettement, puis relève-en {3 - releves.length} de plus.
            </Feedback>
          )}
          {done1 && (
            <Feedback tone="ok">
              Trois formes très différentes. Regarde la colonne de droite et celle du milieu :
              elles donnent le même nombre à chaque fois.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Le côté qui a un nom',
      done: q3,
      content: (
        <div className="space-y-3">
          <p className="text-sm text-slate-700">
            Le plus grand des trois carrés est toujours construit sur le même côté du triangle.
            Lequel ?
          </p>
          {lab}
          <TapQuestion
            prompt="Sur quel côté le plus grand carré est-il construit ?"
            options={[
              'Sur le côté opposé à l’angle droit',
              'Sur le côté le plus à gauche',
              'Sur un côté de l’angle droit',
              'Cela change selon la forme',
            ]}
            correct={0}
            cols={1}
            requires={['angle-droit', 'aire']}
            explain="C’est toujours le côté qui fait face à l’angle droit — celui que le sommet C ne touche pas. Sa position à l’écran change, sa définition non."
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
          {q3 && (
            <KnowledgeBrick
              id="hypotenuse"
              variant="new"
              lead="Ce côté-là porte un nom, et c’est le seul de la figure à en avoir un."
            />
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Ce qui ne bouge pas',
      done: q4,
      content: (
        <div className="space-y-3">
          <TapQuestion
            prompt="Tu as relevé trois formes différentes. Qu’est-ce qui est resté vrai à chaque fois ?"
            options={[
              'L’aire du grand carré égale la somme des deux autres',
              'Les trois carrés ont la même aire',
              'Le grand carré vaut le double d’un petit',
              'Les longueurs des trois côtés s’additionnent',
            ]}
            correct={0}
            cols={1}
            requires={['hypotenuse', 'aire']}
            explain="Les trois nombres changent ensemble, mais la somme des deux petits retombe toujours sur le grand. C’est une relation d’AIRES, pas de longueurs."
            solved={q4}
            onAnswered={() => setQ4(true)}
          />
          {q4 && (
            <KnowledgeBrick
              id="egalite-des-aires"
              variant="new"
              lead="Trois relevés, un même constat. Voilà ce que tu viens d’établir."
            />
          )}
          {q4 && (
            <Feedback tone="info">
              Une question reste ouverte : cette égalité tient-elle pour n’importe quel triangle,
              ou seulement pour ceux qui ont un angle droit ? C’est le module suivant.
            </Feedback>
          )}
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      moduleTitle="Les trois carrés"
      moduleSubtitle="Les aires changent, l’égalité reste"
      estimatedTime="13 min"
      brief={{
        tag: '🎬 Mission 01',
        title: 'Un triangle qu’on déforme',
        tone: 'indigo',
        body: (
          <>
            Sur chaque côté d’un triangle rectangle, on a construit un carré. Déforme le
            triangle : les trois aires changent. <strong>Tout change-t-il vraiment ?</strong>
          </>
        ),
      }}
      intro={
        <div className="flex items-start gap-3 rounded-2xl border border-indigo-100 bg-indigo-50/60 p-3.5">
          <Square className="mt-0.5 h-5 w-5 shrink-0 text-indigo-600" aria-hidden="true" />
          <p className="text-sm text-indigo-900">
            <Scale className="inline h-4 w-4" aria-hidden="true" /> Le point C suit le cercle en
            pointillé : où qu’il aille, l’angle en C reste droit. Surveille la balance sous la figure.
          </p>
        </div>
      }
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={1} />}
    />
  );
}
