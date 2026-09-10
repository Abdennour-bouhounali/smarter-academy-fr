import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import PliageDesPas from '../components/PliageDesPas';
import {
  CAS_ARITHMETIQUES, nthArithmetic, parseNombre, fr,
} from '../components/sommesUtils';

/**
 * Module 2 — DÉCOUVERTE : le terme de rang n d'une suite arithmétique (P1).
 *
 * Étape 1  le PLIAGE. L'élève fait varier le rang visé et compare deux
 *          écritures : la dépliée (n pas « + 3 ») et la repliée (n × 3). La
 *          seconde ne s'allonge jamais. → brique `terme-rang-arithmetique`.
 * Étape 2  l'appliquer sur un rang que personne n'a gravi : u(12) avec
 *          u(0) = 2 et r = 7.
 * Étape 3  LA RAISON NÉGATIVE. La même formule, sans modification : le signe
 *          entre DANS la multiplication. → brique
 *          `raison-negative-meme-formule`.
 * Étape 4  le piège du COMPTE : combien de pas du rang 0 au rang n ?
 *
 * TOUTES LES VALEURS VIENNENT DE `CAS_ARITHMETIQUES`, recalculées par déroulé
 * pas-à-pas dans `sommesUtils.test.js` — une formule mal appliquée dans la
 * donnée ne survit pas au test.
 *
 * MANIPULATION JAMAIS GELÉE : les deux plieuses restent pilotables après
 * validation. Seul demeure le verrou d'ANTÉRIORITÉ de l'étape 3 sur l'étape 2.
 */
export default function Module02LeTermeDeRangN() {
  const A = CAS_ARITHMETIQUES[0];    // u(0) = 5, r = 3, rang 30
  const B = CAS_ARITHMETIQUES[1];    // u(0) = 2, r = 7, rang 12
  const C = CAS_ARITHMETIQUES[2];    // u(0) = 100, r = −4, rang 15

  const [rangA, setRangA] = useState(2);
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  const [rangC, setRangC] = useState(2);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);

  const done1 = rangA >= 6 && q1;
  const done2 = q2;
  const done3 = q3;

  const steps = [
    {
      num: 1,
      title: 'Replier les pas',
      subtitle:
        'Fais grandir le rang visé, au moins jusqu’à 6, et regarde les deux écritures : l’une s’allonge, l’autre non.',
      done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <PliageDesPas
            u0={A.u0}
            pas={A.r}
            mode="add"
            n={rangA}
            nMax={A.n}
            onChangeRang={(v) => {
              setRangA(v);
              if (!done1 && v >= 6 && q1) kit.react?.(true);
            }}
          />
          <TapQuestion
            prompt="La ligne repliée garde toujours la même longueur. Que dit-elle exactement ?"
            options={[
              'On ajoute n fois la raison au premier terme : u(0) + n × 3',
              'On ajoute la raison une fois : u(0) + 3',
              'On ajoute le rang au premier terme : u(0) + n',
              'On multiplie le premier terme par le rang : u(0) × n',
            ]}
            correct={0}
            cols={1}
            requires={['cout-du-pas-a-pas', 'suite-arithmetique']}
            explain={`Du rang 0 au rang n, il y a n pas, et chacun ajoute la raison. On ajoute donc n fois 3, c’est-à-dire ${fr(A.r)}n, au premier terme. Au rang ${fr(A.n)} : ${fr(A.u0)} + ${fr(A.n)} × ${fr(A.r)} = ${fr(nthArithmetic(A.u0, A.r, A.n))}.`}
            explainWrong="Ajouter la raison une seule fois donne le rang 1, pas le rang n. Et ajouter le rang lui-même reviendrait à ajouter 1 par pas, quelle que soit la raison : la raison disparaîtrait du calcul."
            solved={q1}
            onAnswered={() => setQ1(true)}
          />
          {done1 && (
            <>
              <Feedback tone="ok">
                Trente « + 3 » ou un « × 30 » : le même nombre, un seul calcul. La formule ne
                dépend plus de la longueur du chemin.
              </Feedback>
              <KnowledgeBrick
                id="terme-rang-arithmetique"
                variant="new"
                lead={<>L’écriture directe, posée une fois pour toutes. Puis reprends le cliquet en la lisant.</>}
              />
            </>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Un rang que personne n’a gravi',
      done: done2,
      content: () => (
        <div className="space-y-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="font-mono text-sm font-bold text-slate-900">{B.label}</p>
            <p className="mt-1 font-mono text-[13px] text-slate-600">
              premiers termes : {[0, 1, 2, 3].map((n) => fr(nthArithmetic(B.u0, B.r, n))).join(' · ')} …
            </p>
          </div>
          <NumericQuestion
            prompt={<>Que vaut <strong>u({fr(B.n)})</strong> ?</>}
            expected={nthArithmetic(B.u0, B.r, B.n)}
            parse={parseNombre}
            display={fr(nthArithmetic(B.u0, B.r, B.n))}
            requires={['terme-rang-arithmetique']}
            explain={`u(${fr(B.n)}) = ${fr(B.u0)} + ${fr(B.n)} × ${fr(B.r)} = ${fr(B.u0)} + ${fr(B.n * B.r)} = ${fr(nthArithmetic(B.u0, B.r, B.n))}.`}
            explainFor={(n) =>
              n === B.n * B.r
                ? `${fr(B.n * B.r)}, c’est ${fr(B.n)} × ${fr(B.r)} : ce qu’on a AJOUTÉ. Il reste à repartir du premier terme, ${fr(B.u0)}.`
                : n === nthArithmetic(B.u0, B.r, B.n - 1)
                ? `${fr(nthArithmetic(B.u0, B.r, B.n - 1))} est au rang ${fr(B.n - 1)}. Du rang 0 au rang ${fr(B.n)}, il y a ${fr(B.n)} pas, pas ${fr(B.n - 1)}.`
                : n === nthArithmetic(B.u0, B.r, B.n + 1)
                ? `${fr(nthArithmetic(B.u0, B.r, B.n + 1))} est au rang ${fr(B.n + 1)} : on a compté les CASES (il y en a ${fr(B.n + 1)}) au lieu des PAS (il y en a ${fr(B.n)}).`
                : null
            }
            solved={done2}
            onAnswered={() => setQ2(true)}
          />
          {done2 && (
            <Feedback tone="ok">
              Aucun des douze termes intermédiaires n’a été écrit — et pourtant la réponse est
              exacte. C’est tout l’intérêt de l’écriture directe.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Et si la raison est négative ?',
      subtitle:
        'Même instrument, autre réglage : la suite descend. Regarde si la formule doit changer.',
      done: done3,
      content: () => (
        <div className="space-y-3">
          <PliageDesPas
            u0={C.u0}
            pas={C.r}
            mode="add"
            n={rangC}
            nMax={C.n}
            onChangeRang={setRangC}
            disabled={!done2}
          />
          <NumericQuestion
            prompt={<>Que vaut <strong>u({fr(C.n)})</strong> pour cette suite ?</>}
            expected={nthArithmetic(C.u0, C.r, C.n)}
            parse={parseNombre}
            display={fr(nthArithmetic(C.u0, C.r, C.n))}
            requires={['terme-rang-arithmetique', 'suite-arithmetique']}
            explain={`u(${fr(C.n)}) = ${fr(C.u0)} + ${fr(C.n)} × (${fr(C.r)}) = ${fr(C.u0)} − ${fr(Math.abs(C.n * C.r))} = ${fr(nthArithmetic(C.u0, C.r, C.n))}. La formule est la même : c’est le signe de la raison qui fait descendre.`}
            explainFor={(n) =>
              n === C.u0 + C.n * Math.abs(C.r)
                ? `${fr(C.u0 + C.n * Math.abs(C.r))} serait le résultat si l’on AJOUTAIT 4 à chaque pas. Ici la raison vaut ${fr(C.r)} : le signe entre dans la multiplication.`
                : n === C.n * C.r
                ? `${fr(C.n * C.r)} est ce qu’on a retranché en tout. Il faut le retrancher AU premier terme, ${fr(C.u0)}.`
                : null
            }
            solved={done3}
            onAnswered={() => setQ3(true)}
          />
          {done3 && (
            <>
              <Feedback tone="ok">
                Aucune formule nouvelle : <strong>u(0) + n × r</strong>, avec r négatif. Rien à
                retenir de plus.
              </Feedback>
              <KnowledgeBrick
                id="raison-negative-meme-formule"
                variant="new"
                lead={<>Le seul piège de ce cas-là, écrit noir sur blanc.</>}
              />
            </>
          )}
        </div>
      ),
    },
    {
      num: 4,
      title: 'Pas ou cases ?',
      done: q4,
      content: (
        <TapQuestion
          prompt="Combien de PAS y a-t-il du rang 0 au rang 12 — et combien de CASES la liste contient-elle alors ?"
          options={[
            '12 pas, et 13 cases (les rangs 0 à 12)',
            '13 pas, et 13 cases',
            '12 pas, et 12 cases',
            '11 pas, et 12 cases',
          ]}
          correct={0}
          cols={1}
          requires={['terme-rang-arithmetique']}
          explain="Douze pas séparent le rang 0 du rang 12, mais la liste contient treize cases : le rang 0 en fait partie. La formule u(0) + n × r utilise le nombre de PAS. Ce compte reviendra au module 4, où c’est le nombre de CASES qui comptera : ne pas les confondre est tout le travail."
          explainWrong="Compter treize pas reviendrait à ajouter une raison de trop, et l’on tomberait au rang 13. À l’inverse, oublier le rang 0 dans le compte des cases en enlève une."
          solved={q4}
          onAnswered={() => setQ4(true)}
        />
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="Le terme de rang n"
      moduleSubtitle="Trente pas identiques tiennent sur une ligne — et la raison négative n’y change rien"
      estimatedTime="10 min"
      brief={{
        tag: 'Découverte',
        title: 'Une ligne qui ne s’allonge pas',
        tone: 'indigo',
        body: (
          <p>
            Tu as payé trente clics pour atteindre le rang 30. On va écrire ce trajet une fois pour
            toutes — et il tiendra sur une ligne, quel que soit le rang visé.
          </p>
        ),
      }}
      steps={steps}
      footer={
        <KnowledgeSnapshot moduleNumber={2}>
          <strong>Et l’autre famille ?</strong> Quand on multiplie au lieu d’ajouter, replier n pas
          identiques ne donne pas une multiplication. Module suivant : ce que ça donne.
        </KnowledgeSnapshot>
      }
    />
  );
}
