import React, { useState } from 'react';
import { Scale, AlertTriangle } from 'lucide-react';
import { ContentModule, TapQuestion, PredictionChips, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { equation, expr, isSolvedForm } from '../../../../../common/algebra4e';
import MathText from '../../../../../common/components/MathText';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import BalanceWorkbench, { gestesLegaux, gestesTricheurs } from '../components/BalanceWorkbench';

/**
 * Module 1 — DÉCLENCHEUR, et l'interaction SIGNATURE : la balance
 * (common/algebra4e/BalanceScale.jsx + components/BalanceWorkbench.jsx).
 *
 * Activity              une balance en équilibre porte un paquet mystère et
 *                       des poids ; l'élève retire des poids jusqu'à isoler
 *                       le paquet — et peut aussi TRICHER en n'agissant que
 *                       sur un plateau.
 * Mathematical objective ce qui autorise une transformation, ce n'est pas une
 *                       règle de passage, c'est la CONSERVATION de
 *                       l'équilibre : un geste fait des deux côtés à la fois
 *                       laisse la balance droite. Le « changement de côté »
 *                       n'est que le résumé de ce geste, et il est
 *                       délibérément tu jusqu'au module 3.
 * Student action        un tap sur un geste ; l'historique et « Annuler »
 *                       gardent le chemin visible.
 * Controlled variable   l'équation, un geste à la fois.
 * Mathematical state    l'HISTORIQUE des équations — détenu ICI. L'établi ne
 *                       garde rien : « Annuler » revient à un état passé, il
 *                       ne recalcule pas un inverse (brief §7).
 * Visual consequence    le fléau reste horizontal après un geste légal, et
 *                       bascule aussitôt après un geste tricheur — parce que
 *                       l'inclinaison est calculée sur l'écart réel entre les
 *                       deux membres, jamais posée à la main.
 * Expected observation  « quoi que je retire, tant que je le retire des deux
 *                       côtés, la balance reste droite ».
 * Misconception targeted « je fais passer le 3 de l'autre côté en changeant
 *                       son signe », appris comme un tour de magie. Ici le 3
 *                       ne passe nulle part : il est RETIRÉ des deux plateaux.
 * Formalization         AUCUNE ici : les mots « équation » et « solution »
 *                       sont posés au module 2, la méthode au module 3.
 * Transfer              module 4 : deux gestes enchaînés.
 *
 * §6bis / règle M1 : l'étape 1 REND la manipulation ; la prédiction vit à
 * l'intérieur de l'étape comme une invitation, jamais comme un péage.
 */

/** x + 3 = 8 — le paquet mystère pèse 5. */
const DEPART = equation(expr(1, 3), expr(0, 8));

export default function Module01LaMasseCachee() {
  const [pred, setPred] = useState(null);

  // Étape 1 — isoler le paquet.
  const [hist, setHist] = useState([DEPART]);
  const eq = hist[hist.length - 1];
  const resolu = isSolvedForm(eq);

  // Étape 2 — la triche, et ce qu'elle produit.
  const [histT, setHistT] = useState([DEPART]);
  const [aTriche, setATriche] = useState(false);

  const [q3, setQ3] = useState(false);

  const steps = [
    {
      num: 1,
      title: 'Découvre la masse du paquet',
      subtitle: 'La balance est en équilibre. Enlève ce qu’il faut pour que le paquet reste seul sur son plateau.',
      done: resolu,
      content: (kit) => (
        <div className="space-y-3">
          <BalanceWorkbench
            historique={hist}
            probe={5}
            gestes={gestesLegaux(eq, { retraits: [1, 3], ajouts: [1] })}
            onGeste={(next) => {
              setHist([...hist, next]);
              if (isSolvedForm(next) && !resolu) kit.react(true);
            }}
            onAnnuler={() => setHist(hist.slice(0, -1))}
            onRecommencer={() => setHist([DEPART])}
            caption="Le paquet mystère est le x. Les poids sont les nombres."
          />

          <PredictionChips
            prompt="Avant de commencer : combien pèse le paquet, à ton avis ?"
            options={[
              { id: '5', label: '5' },
              { id: '8', label: '8' },
              { id: '11', label: '11' },
            ]}
            value={pred}
            onChange={setPred}
            disabled={resolu}
          />

          {resolu ? (
            <Feedback tone="ok">
              {pred === '5' ? 'Ta prédiction tenait' : 'Regarde le fléau'} : le paquet pèse{' '}
              <strong>5</strong>. Et surtout, remarque <strong>comment</strong> tu l’as trouvé :
              en retirant 3 des <strong>deux</strong> plateaux à la fois. La balance n’a pas bougé
              d’un degré — c’est ce qui rend le geste légitime. Recommence et essaie un autre
              chemin : tu retomberas sur 5.
            </Feedback>
          ) : (
            <Feedback tone="info">
              Pour isoler le paquet, il faut faire disparaître le poids qui l’accompagne. Mais
              attention à ce que ça fait au fléau…
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Maintenant, triche',
      subtitle: 'Le bouton rouge n’agit que sur le plateau de gauche. Essaie-le.',
      done: aTriche,
      content: (kit) => {
        const eqT = histT[histT.length - 1];
        return (
          <div className="space-y-3">
            <BalanceWorkbench
              historique={histT}
              probe={5}
              gestes={[...gestesTricheurs({ retraits: [3] }), ...gestesLegaux(eqT, { retraits: [3] })]}
              onGeste={(next, geste) => {
                setHistT([...histT, next]);
                if (geste.tricheur && !aTriche) {
                  setATriche(true);
                  kit.react(true);
                }
              }}
              onAnnuler={() => setHistT(histT.slice(0, -1))}
              onRecommencer={() => { setHistT([DEPART]); }}
              caption="Le bouton rouge n’agit que d’un seul côté."
            />
            {aTriche ? (
              <Feedback tone="ok">
                La balance <strong>bascule</strong> immédiatement. En retirant 3 à gauche seulement,
                le plateau de gauche est devenu plus léger : les deux côtés ne portent plus la même
                chose, et l’égalité est <strong>détruite</strong>. Ce n’est pas une interdiction
                arbitraire — c’est visible.
                <br />
                <strong>La seule règle de toute la leçon :</strong> ce qu’on fait à un côté, on le
                fait à l’autre.
              </Feedback>
            ) : (
              <Feedback tone="info">
                Appuie sur le bouton rouge et regarde le fléau.
              </Feedback>
            )}
          </div>
        );
      },
    },
    {
      num: 3,
      title: 'Ce que la balance impose',
      done: q3,
      content: (
        <div className="space-y-3">
          {/* Un geste légal a été fait, puis un geste illégal, fléau à
              l'appui : on peut nommer la règle avant la question. */}
          <KnowledgeBrick
            id="equilibre-conserve"
            variant="new"
            lead={<>Tu as vu un geste laisser la balance droite, et un autre la faire basculer. La différence entre les deux tient en une phrase.</>}
          />
          <TapQuestion
            prompt={
              <span>
                Pour passer de <MathText>{'$x + 6 = 10$'}</MathText> à{' '}
                <MathText>{'$x = 4$'}</MathText>, qu’a-t-on fait exactement ?
              </span>
            }
            options={[
              'On a retiré 6 des deux membres à la fois',
              'On a fait passer le 6 à droite en changeant son signe',
              'On a retiré 6 du membre de gauche seulement',
              'On a divisé les deux membres par 6',
            ]}
            correct={0}
            cols={1}
            requires={['equilibre-conserve']}
            explain="On a retiré 6 des DEUX côtés : à gauche il reste x, à droite 10 − 6 = 4. La balance n’a pas bougé, donc l’égalité tient toujours."
            explainWrong="« Faire passer de l’autre côté » décrit ce qu’on VOIT dans l’écriture, mais ce n’est pas ce qu’on FAIT : rien ne traverse le signe égal. On retire la même chose des deux plateaux, et c’est pour cela que le résultat est correct — un retrait d’un seul côté ferait basculer la balance, comme tu viens de le voir."
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      moduleTitle="La masse cachée"
      moduleSubtitle="Une balance, un paquet mystère"
      estimatedTime="13 min"
      brief={{
        tag: 'Déclencheur',
        title: 'Combien pèse le paquet ?',
        tone: 'indigo',
        body: (
          <p>
            Sur cette balance, un <strong>paquet mystère</strong> et des poids se font exactement
            équilibre. Personne ne te dira ce que pèse le paquet : tu vas le{' '}
            <strong>découvrir</strong>, en manipulant la balance sans jamais la déséquilibrer.
          </p>
        ),
      }}
      intro={
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { icon: Scale, t: 'Le fléau', d: 'Il reste droit tant que les deux plateaux se valent.', c: 'text-emerald-600' },
            { icon: AlertTriangle, t: 'Le bouton rouge', d: 'Il n’agit que d’un côté — à essayer, pour voir.', c: 'text-rose-500' },
          ].map(({ icon: Icon, t, d, c }) => (
            <div key={t} className="rounded-xl border-2 border-slate-200 bg-white p-3">
              <Icon className={`mb-1 h-5 w-5 ${c}`} aria-hidden="true" />
              <p className="text-sm font-semibold text-slate-800">{t}</p>
              <p className="text-xs text-slate-600">{d}</p>
            </div>
          ))}
        </div>
      }
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={1} />}
    />
  );
}
