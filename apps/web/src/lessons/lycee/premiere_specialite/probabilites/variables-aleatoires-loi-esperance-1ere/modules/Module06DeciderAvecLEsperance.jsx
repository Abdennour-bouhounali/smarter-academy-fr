import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, PredictionChips, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { parseDec } from '@smarter-academy/core';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { TableauDeLoi } from '../components/WheelLab';
import {
  OFFRES, OFFRE_ECLAIR, OFFRE_REGULIER, loiDeLOffre, esperanceDeLOffre,
  beneficeDeLOffre, meilleureOffre, euros,
} from '../components/roueUtils';

/**
 * Module 6 — ATELIER : décider.
 *
 * Étape 1  le jeu équitable : à quel prix la mise annulerait-elle le bénéfice
 *          espéré ? On le fait CALCULER, puis on nomme la règle.
 * Étape 2  LE PIÈGE, montré avant d'être nommé : deux offres à 3 € la partie,
 *          l'une affiche un lot de 20 €, l'autre plafonne à 5 €. L'élève prédit,
 *          puis calcule les deux bénéfices espérés — et c'est la seconde qui
 *          gagne.
 * Étape 3  la phrase de conclusion : décider, c'est aussi savoir le DIRE dans le
 *          contexte.
 *
 * CONNAISSANCES AVANT LA DEMANDE : étape 1 calcul mené → brique
 * `jeu-equitable` ; étape 2 les deux calculs menés → briques
 * `decider-par-esperance` et `mem-decider` ; étape 3 la demande.
 *
 * PAS DE MANIPULATION GELÉE. Seuls les `PredictionChips` se figent — une
 * prédiction s'enregistre une fois, avant la révélation.
 */
export default function Module06DeciderAvecLEsperance() {
  const [q1, setQ1] = useState(false);
  const [pred, setPred] = useState(null);
  const [eA, setEA] = useState(false);
  const [eB, setEB] = useState(false);
  const [q3, setQ3] = useState(false);

  const done2 = eA && eB;
  const espEclair = esperanceDeLOffre(OFFRE_ECLAIR);        // 2,4
  const espRegulier = esperanceDeLOffre(OFFRE_REGULIER);    // 3
  const benEclair = beneficeDeLOffre(OFFRE_ECLAIR);         // −0,6
  const benRegulier = beneficeDeLOffre(OFFRE_REGULIER);     // 0
  const gagnante = meilleureOffre();

  const steps = [
    {
      num: 1,
      title: 'À quel prix le jeu serait-il juste ?',
      subtitle:
        'Reprends la roue du début : elle paie 0 €, 1 € ou 5 €, et son espérance de gain vaut 1,40 €. Le forain veut fixer un prix.',
      done: q1,
      content: (
        <div className="space-y-3">
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <p>
              Si le forain fait payer <strong>2 €</strong> la partie, le bénéfice espéré du joueur
              vaut 1,40 − 2 = <strong>−0,60 €</strong> : il perd 60 centimes par partie en moyenne.
              À quel prix ne perdrait-il ni ne gagnerait rien ?
            </p>
          </div>
          <NumericQuestion
            prompt={<>Quel prix de la partie rendrait le bénéfice espéré <strong>nul</strong> ?</>}
            expected={1.4}
            parse={parseDec}
            display="1,4"
            requires={['benefice-espere', 'esperance', 'esperance-moyenne-long-terme']}
            explain="Le bénéfice espéré vaut E(X) − mise. Il s’annule quand la mise vaut exactement E(X), soit 1,40 €. Ni le joueur ni le forain n’y gagne à la longue."
            explainFor={(n) =>
              n === 0
                ? 'Zéro est la valeur du BÉNÉFICE recherché, pas celle de la mise. La mise qui l’annule est E(X) elle-même : 1,40 €.'
                : n === 5
                ? 'Le gros lot n’a rien à voir avec le prix juste : c’est l’espérance, 1,40 €, qui donne la mise d’équilibre.'
                : null
            }
            solved={q1}
            onAnswered={() => setQ1(true)}
          />
          {q1 && (
            <>
              <Feedback tone="ok">
                <strong>{euros(1.4)}</strong> : la mise d’équilibre est exactement l’espérance de
                gain. En dessous, le joueur est avantagé ; au-dessus, le forain.
              </Feedback>
              <KnowledgeBrick
                id="jeu-equitable"
                variant="new"
                lead={<>Le mot qui désigne ce point d’équilibre, et les deux cas qui l’entourent.</>}
              />
            </>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Deux stands, un seul ticket',
      subtitle:
        'Les deux stands font payer 3 € la partie. Regarde d’abord les affiches, puis calcule.',
      done: done2,
      content: (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {OFFRES.map((o) => (
              <div key={o.id} className="rounded-xl border-2 border-slate-200 bg-white p-3 space-y-2">
                <div className="font-bold text-slate-900">
                  <span aria-hidden="true">{o.emoji}</span> Stand « {o.nom} »
                </div>
                <div className="text-[13px] text-slate-500">partie à {euros(o.mise)}</div>
                <TableauDeLoi loi={loiDeLOffre(o)} titre={`Loi du gain — stand ${o.nom}`} avecTotal={false} />
              </div>
            ))}
          </div>

          <PredictionChips
            prompt="quel stand est le plus intéressant pour le joueur, à long terme ?"
            options={[
              { id: 'eclair', label: '⚡ Éclair — il affiche un lot de 20 €' },
              { id: 'regulier', label: '🐢 Régulier — il ne dépasse pas 5 €' },
              { id: 'pareil', label: 'Les deux se valent' },
            ]}
            value={pred}
            onChange={setPred}
            disabled={done2}
          />

          <NumericQuestion
            prompt={<>Espérance de gain du stand <strong>Éclair</strong> (0 € avec 7/10, 2 € avec 2/10, 20 € avec 1/10) :</>}
            expected={2.4}
            parse={parseDec}
            display="2,4"
            requires={['esperance', 'methode-calculer-esperance', 'tableau-de-loi']}
            explain="0 × 0,7 + 2 × 0,2 + 20 × 0,1 = 0 + 0,4 + 2 = 2,40 €."
            explainFor={(n) => (n === 20 ? 'C’est le gros lot affiché, pas l’espérance : il n’a qu’une chance sur dix de sortir, et sept fois sur dix on ne gagne rien.' : null)}
            solved={eA}
            onAnswered={() => setEA(true)}
          />
          <NumericQuestion
            prompt={<>Espérance de gain du stand <strong>Régulier</strong> (1 € avec 4/10, 4 € avec 4/10, 5 € avec 2/10) :</>}
            expected={3}
            parse={parseDec}
            display="3"
            requires={['esperance', 'methode-calculer-esperance', 'tableau-de-loi']}
            explain="1 × 0,4 + 4 × 0,4 + 5 × 0,2 = 0,4 + 1,6 + 1 = 3 €. On ne repart jamais les mains vides à ce stand."
            solved={eB}
            onAnswered={() => setEB(true)}
          />

          {done2 && (
            <>
              <Feedback tone="ok">
                {pred === 'regulier' ? 'Ta prédiction tenait' : pred ? 'Ta prédiction ne tenait pas' : 'Compare'} :
                Éclair rapporte {euros(espEclair)} en moyenne pour {euros(OFFRE_ECLAIR.mise)} misés,
                soit un bénéfice espéré de <strong>{euros(benEclair)}</strong>. Régulier rapporte{' '}
                {euros(espRegulier)} pour {euros(OFFRE_REGULIER.mise)}, soit{' '}
                <strong>{euros(benRegulier)}</strong> : il est exactement <strong>équitable</strong>.
                Le stand au plus gros lot est le moins intéressant des deux.
              </Feedback>
              <KnowledgeBrick
                id="decider-par-esperance"
                variant="new"
                lead={<>La méthode que tu viens d’appliquer, en quatre gestes.</>}
              />
              <KnowledgeBrick
                id="mem-decider"
                variant="new"
                lead={<>La seule chose à retenir par cœur de ce module.</>}
              />
            </>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Le dire, pas seulement le calculer',
      done: q3,
      content: (
        <TapQuestion
          prompt={`Un ami hésite entre les deux stands. Quelle réponse est à la fois juste et bien dite ?`}
          options={[
            'Prends Régulier : à 3 € la partie, il est équitable, alors qu’Éclair te coûte en moyenne 0,60 € par partie malgré son lot de 20 €',
            'Prends Éclair : son lot de 20 € est le plus gros, donc c’est le meilleur stand',
            'Prends Régulier : tu es sûr d’y gagner de l’argent à chaque partie',
            'Les deux se valent, puisque la partie coûte 3 € des deux côtés',
          ]}
          correct={0}
          cols={1}
          requires={['jeu-equitable', 'decider-par-esperance', 'mem-decider', 'benefice-espere']}
          explain="La bonne réponse compare les BÉNÉFICES espérés (0 € contre −0,60 €) et le dit dans le contexte. Attention à la formulation : Régulier est équitable, ce qui ne veut pas dire qu’on y gagne à chaque partie — on peut très bien n’y gagner qu’1 € pour 3 € misés."
          explainWrong="Le gros lot ne décide de rien : il faut le peser par sa probabilité. Et « équitable » ne veut pas dire « gagnant à chaque coup » : cela veut dire que sur un grand nombre de parties, le bilan tend vers zéro. Enfin, la mise identique ne suffit pas à égaliser deux jeux : les gains diffèrent."
          solved={q3}
          onAnswered={() => setQ3(true)}
        />
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(6)}
      moduleNumber={6}
      moduleTitle="Décider avec l’espérance"
      moduleSubtitle="Équitable ou non, et lequel des deux stands"
      estimatedTime="8 min"
      brief={{
        tag: 'Atelier',
        title: 'Un nombre pour trancher',
        tone: 'indigo',
        body: (
          <p>
            Deux stands de fête foraine, même prix, des affiches très différentes. Un seul calcul
            permet de choisir — et il ne regarde pas la taille du gros lot.
          </p>
        ),
      }}
      steps={steps}
      footer={
        <KnowledgeSnapshot moduleNumber={6}>
          <strong>Tu as tout.</strong> Nommer la variable, dresser sa loi, calculer l’espérance,
          l’interpréter, décider avec elle. Il reste à le prouver.
        </KnowledgeSnapshot>
      }
    />
  );
}
