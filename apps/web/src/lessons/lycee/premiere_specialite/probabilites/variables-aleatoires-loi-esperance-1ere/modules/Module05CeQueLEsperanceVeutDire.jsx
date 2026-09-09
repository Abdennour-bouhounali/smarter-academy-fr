import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { parseDec } from '@smarter-academy/core';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { TableauDeLoi } from '../components/WheelLab';
import {
  TOMBOLA, loiDeLaTombola, esperanceDeLaTombola, beneficeDeLaTombola, gainOrganisateur, euros,
} from '../components/roueUtils';

/**
 * Module 5 — ATELIER : ce que l'espérance annonce, et ce qu'elle n'annonce pas.
 *
 * Étape 1  la tombola : dresser la loi sur 200 billets, calculer l'espérance
 *          (1,275 €) — une somme qu'aucun billet ne paie.
 * Étape 2  l'INTERPRÉTATION, mise à l'épreuve par un calcul : sur les
 *          200 billets, que reste-t-il à l'organisateur ? On le fait calculer
 *          par les deux chemins (recettes − lots, puis 200 × bénéfice espéré),
 *          et les deux tombent sur 145 €. C'est là que l'espérance cesse d'être
 *          un nombre pour devenir une prévision.
 * Étape 3  trier les phrases : celles que l'espérance autorise, et celles qui
 *          la sur-interprètent (« je vais gagner 1,275 € »).
 *
 * CONNAISSANCES AVANT LA DEMANDE : étape 1 le calcul mené ; étape 2 le double
 * calcul → briques `esperance-moyenne-long-terme` puis `benefice-espere` ;
 * étape 3 le tri, légitime.
 *
 * PAS DE MANIPULATION GELÉE : ce module n'a pas d'instrument à figer.
 */
export default function Module05CeQueLEsperanceVeutDire() {
  const [q1, setQ1] = useState(false);
  const [q2a, setQ2a] = useState(false);
  const [q2b, setQ2b] = useState(false);
  const [q3, setQ3] = useState(false);

  const loi = loiDeLaTombola();
  const E = esperanceDeLaTombola();          // 1,275
  const benefice = beneficeDeLaTombola();    // −0,725
  const organisateur = gainOrganisateur(200);// 145
  const lots = TOMBOLA.counts.reduce((a, c) => a + c.x * c.n, 0);   // 255
  const done2 = q2a && q2b;

  const steps = [
    {
      num: 1,
      title: 'La tombola de la fête',
      subtitle:
        '200 billets vendus 2 € pièce. Un lot de 100 €, quatre lots de 20 €, quinze lots de 5 €, et 180 billets perdants.',
      done: q1,
      content: (
        <div className="space-y-3">
          <TableauDeLoi loi={loi} titre="La loi du gain d’un billet" />
          <p className="text-[13px] text-slate-600">
            Chaque billet a la même chance d’être tiré : chaque probabilité est le nombre de
            billets concernés rapporté aux 200 billets. La somme fait bien 1.
          </p>
          <NumericQuestion
            prompt={<>Calcule l’espérance de gain d’un billet, en euros.</>}
            expected={1.275}
            parse={parseDec}
            display="1,275"
            requires={['esperance', 'methode-calculer-esperance', 'tableau-de-loi']}
            explain="0 × 180/200 + 5 × 15/200 + 20 × 4/200 + 100 × 1/200 = (75 + 80 + 100)/200 = 255/200 = 1,275 €."
            explainFor={(n) =>
              n === 2
                ? 'C’est le PRIX du billet, pas l’espérance de gain. Le calcul porte sur les lots et leurs probabilités : il donne 1,275 €.'
                : n === 31.25
                ? 'Tu as fait la moyenne des quatre lots (0, 5, 20, 100), sans tenir compte de leurs probabilités. Or le lot de 100 € n’a qu’une chance sur 200.'
                : null
            }
            solved={q1}
            onAnswered={() => setQ1(true)}
          />
          {q1 && (
            <Feedback tone="ok">
              <strong>{euros(E)}</strong> par billet. Comme sur la roue, ce montant n’est
              écrit sur aucun billet : les billets paient 0, 5, 20 ou 100 €.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Ce que ce nombre annonce, vérifié',
      subtitle:
        'Une prévision se contrôle. Calcule ce qui reste à l’organisateur au bout des 200 billets — par deux chemins.',
      done: done2,
      content: (
        <div className="space-y-3">
          <NumericQuestion
            prompt={
              <>
                <strong>Chemin 1 — la caisse.</strong> L’organisateur encaisse 200 × 2 € et
                distribue {euros(lots)} de lots. Combien lui reste-t-il ?
              </>
            }
            expected={145}
            parse={parseDec}
            display="145"
            requires={['esperance', 'proportion-reference']}
            explain={`200 × 2 = 400 € encaissés, moins ${euros(lots)} de lots distribués : il reste ${euros(organisateur)}.`}
            explainFor={(n) => (n === 400 ? 'C’est la recette brute : il faut encore retirer les lots distribués, soit ' + euros(lots) + '.' : null)}
            solved={q2a}
            onAnswered={() => setQ2a(true)}
          />
          <NumericQuestion
            prompt={
              <>
                <strong>Chemin 2 — l’espérance.</strong> Chaque billet rapporte en moyenne{' '}
                {euros(E)} à son acheteur, qui l’a payé {euros(TOMBOLA.prix)}. Multiplie la
                différence 2 − 1,275 par les 200 billets.
              </>
            }
            expected={145}
            parse={parseDec}
            display="145"
            // Le chemin 2 n'exige QUE ce qui le précède : l'espérance, calculée
            // à l'étape 1. `esperance-moyenne-long-terme` et `benefice-espere`
            // sont ce que ce calcul va ÉTABLIR, plus bas dans la même étape —
            // les exiger ici inverserait la ligne du temps.
            requires={['esperance', 'methode-calculer-esperance']}
            explain={`2 − 1,275 = 0,725 € par billet pour l’organisateur, et 0,725 × 200 = ${euros(organisateur)}. Le même nombre que par la caisse — ce n’est pas une coïncidence.`}
            explainFor={(n) =>
              n === 255
                ? 'C’est le total des lots. Le chemin 2 part de la DIFFÉRENCE par billet (2 − 1,275 = 0,725), multipliée par 200.'
                : null
            }
            solved={q2b}
            onAnswered={() => setQ2b(true)}
          />
          {done2 && (
            <>
              <Feedback tone="ok">
                <strong>{euros(organisateur)} par les deux chemins.</strong> Voilà ce que
                l’espérance annonce : non pas ce que gagnera <em>tel</em> billet, mais ce que
                donnent les billets <em>en moyenne</em>, et donc ce que pèse l’ensemble. C’est une
                prévision par répétition.
              </Feedback>
              <KnowledgeBrick
                id="esperance-moyenne-long-terme"
                variant="new"
                lead={<>Ce que ton double calcul vient de montrer.</>}
              />
              <KnowledgeBrick
                id="benefice-espere"
                variant="new"
                lead={<>Et la façon d’écrire ce « 2 − 1,275 » que tu viens d’utiliser.</>}
              />
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">
                <p>
                  Du point de vue de l’acheteur, le bénéfice espéré vaut{' '}
                  {euros(E)} − {euros(TOMBOLA.prix)} = <strong>{euros(benefice)}</strong> : chaque
                  billet lui coûte en moyenne 72,5 centimes. Ce qu’il perd, l’organisateur le
                  gagne.
                </p>
              </div>
            </>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Ce qu’on a le droit de dire',
      done: q3,
      content: (
        <BatchChoiceQuestion
          intro={<p>L’espérance de gain d’un billet vaut {euros(E)}, et le billet coûte {euros(TOMBOLA.prix)}. Pour chaque phrase : autorisée, ou abusive ?</p>}
          rows={[
            {
              id: 'i1',
              label: '« Sur un très grand nombre de billets, chacun rapporte en moyenne 1,275 € »',
              options: ['Autorisée', 'Abusive'],
              correct: 0,
              correction: 'C’est exactement ce que l’espérance annonce : une moyenne sur un grand nombre de répétitions.',
            },
            {
              id: 'i2',
              label: '« J’achète un billet, donc je vais gagner 1,275 € »',
              options: ['Autorisée', 'Abusive'],
              correct: 1,
              correction: 'Abusive : ce billet-là rapportera 0, 5, 20 ou 100 €. Aucun billet ne paie 1,275 €.',
            },
            {
              id: 'i3',
              label: '« En achetant un billet, je perds en moyenne 0,725 € »',
              options: ['Autorisée', 'Abusive'],
              correct: 0,
              correction: '1,275 − 2 = −0,725 : c’est le bénéfice espéré de l’acheteur, négatif.',
            },
            {
              id: 'i4',
              label: '« Comme l’espérance est positive, acheter un billet est une bonne affaire »',
              options: ['Autorisée', 'Abusive'],
              correct: 1,
              correction: 'Abusive : l’espérance de GAIN est positive (1,275 €), mais le billet coûte 2 €. C’est le bénéfice espéré, mise déduite, qui décide — et il est négatif.',
            },
          ]}
          requires={['esperance-moyenne-long-terme', 'benefice-espere', 'esperance']}
          feedback={({ allRight }) =>
            allRight ? (
              <>
                Deux garde-fous : l’espérance parle du grand nombre, jamais d’un tirage isolé ; et
                une espérance de gain positive ne suffit pas — il faut retirer la mise.
              </>
            ) : (
              <>
                Le piège n° 1 est de lire l’espérance comme une promesse individuelle. Le piège n° 2
                est d’oublier la mise : 1,275 € de gain espéré pour un billet à 2 €, c’est une
                perte.
              </>
            )
          }
          solved={q3}
          onAnswered={() => setQ3(true)}
        />
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(5)}
      moduleNumber={5}
      moduleTitle="Ce que l’espérance veut dire"
      moduleSubtitle="Une prévision par répétition, pas une promesse"
      estimatedTime="11 min"
      brief={{
        tag: 'Atelier',
        title: 'Un nombre, et ce qu’il annonce',
        tone: 'indigo',
        body: (
          <p>
            Une tombola de fête : 1,275 € par billet, alors qu’aucun billet ne paie cette
            somme-là. Voyons ce que ce nombre prévoit exactement — et pour qui.
          </p>
        ),
      }}
      steps={steps}
      footer={
        <KnowledgeSnapshot moduleNumber={5}>
          <strong>Un nombre qui décide.</strong> Si l’espérance annonce ce que pèse un jeu à la
          longue, elle peut trancher entre deux jeux. Module suivant : décider.
        </KnowledgeSnapshot>
      }
    />
  );
}
