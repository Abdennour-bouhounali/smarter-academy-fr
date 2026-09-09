import React, { useState } from 'react';
import { MoveRight, Shapes } from 'lucide-react';
import { ContentModule, TapQuestion, PredictionChips, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { useLabState } from '../../../../../common/hooks/useLabState';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import ConstructeurLab from '../components/ConstructeurLab';
import {
  A_DEFAUT, B_DEFAUT, D_DEFAUT, quatriemeSommet, etatQuad, arrondi, fr,
} from '../components/paral4e';
import { LESSON_CONFIG } from '../lesson.config';

/**
 * Module 1 — DÉCLENCHEUR, et l'interaction SIGNATURE de la leçon.
 *
 * Activity              placer trois sommets et voir le quatrième arriver
 *                       tout seul, posé par le glissement.
 * Mathematical objective un même glissement mène A en D et B en C ; ABCD est
 *                       alors un parallélogramme — et c'est le glissement qui
 *                       le referme, pas la chance.
 * Student action        faire glisser A, B ou D, autant qu'on veut.
 * Controlled variable   la position des trois sommets libres. C n'est JAMAIS
 *                       saisissable : il est le RÉSULTAT, pas une donnée.
 * Mathematical state    les trois points ; C, les quatre témoins et le
 *                       verdict sont TOUS mesurés sur eux par `etatQuad`.
 * Visual consequence    la figure se redessine, les deux trajets restent
 *                       parallèles et de même longueur, les quatre témoins
 *                       restent allumés.
 * Expected observation  « je ne place pas C, je le laisse arriver ».
 * Misconception targeted croire qu'on reconnaît un parallélogramme à son
 *                       allure. Ici, on le reconnaît à sa CAUSE.
 * Formalization         les mots « trace d'un glissement » et la méthode de
 *                       construction sont posés ici, une fois le geste fait.
 *                       Le POURQUOI (les deux trajets sont le même
 *                       déplacement) attend le module 2.
 *
 * §6bis : L'ÉTAPE 1 EST LA MANIPULATION. La prédiction vit à l'intérieur,
 * comme invitation — jamais comme porte à franchir avant de toucher la
 * figure.
 *
 * CONTINUITÉ : le quadrilatère est mémorisé et revient aux modules 2 et 3.
 * Déclaré dans `lesson.config.js`.
 */
export default function Module01LeQuatriemePoint() {
  const memo = useLabState(LESSON_CONFIG.id, 'quad', { A: A_DEFAUT, B: B_DEFAUT, D: D_DEFAUT });
  const [A, setA] = useState(memo.value.A ?? A_DEFAUT);
  const [B, setB] = useState(memo.value.B ?? B_DEFAUT);
  const [D, setD] = useState(memo.value.D ?? D_DEFAUT);
  const [pred, setPred] = useState(null);
  const [formes, setFormes] = useState([]);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);

  const C = quatriemeSommet(A, B, D);
  const etat = etatQuad([A, B, C, D]);

  /* LA PERSISTANCE N'ENTRE PAS DANS LA BOUCLE DE RENDU. `useLabState`
     l'interdit explicitement : on écrit sur un GESTE SIGNIFIANT — ici
     « relever » — jamais sur `pointermove`, qui déclencherait une écriture
     par pixel parcouru. */
  const relever = () => {
    memo.save({ A, B, D });
    const signature = `${arrondi(etat.longueurs.AB, 0)}|${arrondi(etat.longueurs.BC, 0)}`;
    setFormes((f) => (f.some((x) => x.signature === signature) ? f : [...f, {
      signature,
      AB: arrondi(etat.longueurs.AB, 0),
      DC: arrondi(etat.longueurs.CD, 0),
      AD: arrondi(etat.longueurs.DA, 0),
      BC: arrondi(etat.longueurs.BC, 0),
      para: etat.parallelogramme,
    }]));
  };

  const done1 = formes.length >= 3;

  const lab = (
    <ConstructeurLab
      A={A} B={B} D={D}
      onA={setA} onB={setB} onD={setD}
    />
  );

  const steps = [
    {
      num: 1,
      title: 'Déplace les trois points, et relève trois formes',
      subtitle: 'A, B et D se déplacent. Le point C, lui, n’a pas de poignée : regarde d’où il vient.',
      done: done1,
      content: (
        <div className="space-y-3">
          {lab}
          <PredictionChips
            prompt="Tu déplaces A, B ou D comme tu veux. À ton avis, la figure obtenue restera-t-elle un parallélogramme ?"
            options={[
              { id: 'toujours', label: 'Oui, toujours' },
              { id: 'parfois', label: 'Seulement parfois' },
              { id: 'sais-pas', label: 'Impossible à dire' },
            ]}
            value={pred}
            onChange={setPred}
          />
          <button
            type="button"
            onClick={relever}
            className="min-h-[44px] w-full rounded-xl bg-indigo-600 px-3 py-2 text-sm font-bold text-white hover:bg-indigo-700"
          >
            Relever cette forme
          </button>
          {formes.length > 0 && (
            <div className="overflow-x-auto rounded-xl border-2 border-slate-200 bg-white p-3">
              <table className="w-full text-sm tabular-nums">
                <thead>
                  <tr className="text-xs uppercase tracking-wide text-slate-400">
                    <th className="pb-1 text-left">forme</th>
                    <th className="pb-1 text-right">AB / DC</th>
                    <th className="pb-1 text-right">AD / BC</th>
                    <th className="pb-1 text-right">verdict</th>
                  </tr>
                </thead>
                <tbody>
                  {formes.map((f, i) => (
                    <tr key={f.signature} className="border-t border-slate-100">
                      <td className="py-1 text-slate-500">n° {i + 1}</td>
                      <td className="py-1 text-right font-mono text-slate-700">{fr(f.AB, 0)} / {fr(f.DC, 0)}</td>
                      <td className="py-1 text-right font-mono text-slate-700">{fr(f.AD, 0)} / {fr(f.BC, 0)}</td>
                      <td className="py-1 text-right font-bold text-violet-700">
                        {f.para ? 'parallélogramme' : 'non'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {!done1 && formes.length > 0 && (
            <Feedback tone="info">
              {formes.length} forme{formes.length > 1 ? 's' : ''} relevée{formes.length > 1 ? 's' : ''}.
              Déplace nettement un sommet, puis relève-en {3 - formes.length} de plus.
            </Feedback>
          )}
          {done1 && (
            <Feedback tone="ok">
              Trois formes très différentes, et le même verdict à chaque fois. Les longueurs
              changent ; ce qui ne change pas, c’est que les deux colonnes du milieu se
              répondent deux à deux.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'D’où vient le point C ?',
      done: q2,
      content: (
        <div className="space-y-3">
          <p className="text-sm text-slate-700">
            Tu n’as jamais touché C. Il s’est pourtant placé, à chaque fois, exactement là où il
            fallait. Regarde les deux traits épais de la figure.
          </p>
          {lab}
          <TapQuestion
            prompt="Comment le point C est-il placé ?"
            options={[
              'En refaisant, à partir de B, le trajet qui mène A en D',
              'Au milieu des trois autres points',
              'À la même hauteur que le point D',
              'Au hasard, puis corrigé',
            ]}
            correct={0}
            cols={1}
            requires={['translation', 'image']}
            explain="C est l’image de B par le glissement qui mène A en D. C’est pour cela qu’il n’y a rien à ajuster à l’œil : le trajet décide tout seul."
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
          {q2 && (
            <KnowledgeBrick
              id="construire-le-quatrieme"
              variant="new"
              lead="Ce geste-là est une méthode de construction, et elle se retient."
            />
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Ce que tu viens de fabriquer',
      done: q3,
      content: (
        <div className="space-y-3">
          <TapQuestion
            prompt="Tu as relevé trois formes différentes, toutes des parallélogrammes. Qu’est-ce qui l’explique ?"
            options={[
              'Un même glissement a mené A en D et B en C',
              'Les trois points de départ étaient bien choisis',
              'Un parallélogramme apparaît dès qu’on relie quatre points',
              'Le hasard : d’autres positions auraient échoué',
            ]}
            correct={0}
            cols={1}
            requires={['translation', 'parallelogramme']}
            explain="Ce n’est pas la chance : quelles que soient les positions de A, B et D, le même glissement fabrique C, et la figure se referme. C’est le glissement qui produit le parallélogramme."
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
          {q3 && (
            <KnowledgeBrick
              id="trace-du-glissement"
              variant="new"
              lead="Trois relevés, un même constat. Voilà ce que tu viens d’établir."
            />
          )}
          {q3 && (
            <Feedback tone="info">
              Une question reste ouverte : POURQUOI la figure se referme-t-elle à tous les coups ?
              C’est le module suivant.
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
      moduleTitle="Le quatrième point arrive tout seul"
      moduleSubtitle="Un parallélogramme qu’on ne dessine pas, qu’on fabrique"
      estimatedTime="12 min"
      brief={{
        tag: '🎬 Mission 01',
        title: 'Trois points, et un quatrième qui se pose',
        tone: 'indigo',
        body: (
          <>
            Trois sommets sont à toi : A, B et D. Le quatrième n’a pas de poignée — et pourtant
            il est là. <strong>Qui l’a placé ?</strong>
          </>
        ),
      }}
      intro={
        <div className="flex items-start gap-3 rounded-2xl border border-indigo-100 bg-indigo-50/60 p-3.5">
          <Shapes className="mt-0.5 h-5 w-5 shrink-0 text-indigo-600" aria-hidden="true" />
          <p className="text-sm text-indigo-900">
            <MoveRight className="inline h-4 w-4" aria-hidden="true" /> Les deux traits épais sont
            des <strong>trajets</strong>. Surveille-les pendant que tu déplaces les sommets.
          </p>
        </div>
      }
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={1} />}
    />
  );
}
