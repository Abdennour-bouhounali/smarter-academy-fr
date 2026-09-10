import React, { useState } from 'react';
import { ContentModule, NumericQuestion, TapQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { TableauDeLoi } from '../components/DeuxJeuxLab';
import TableauDesEcarts from '../components/TableauDesEcarts';
import {
  JEU_REGULIER, JEU_JACKPOT, loiDuJeu, esperanceDuJeu, varianceDuJeu, detailVariance,
  parseSigned, euros, fr,
} from '../components/dispersionUtils';

/**
 * Module 2 — DÉCOUVERTE : construire le nombre manquant (P1).
 *
 * Il est CONSTRUIT, jamais récité. L'élève passe par les quatre gestes dans
 * l'ordre, et chacun est une saisie :
 *   étape 1  les ÉCARTS à la moyenne, avec leur signe — puis le constat qui
 *            fait tout basculer : leur somme pondérée vaut ZÉRO, donc un
 *            indicateur bâti dessus ne distinguerait rien.
 *   étape 2  les CARRÉS des écarts : les signes disparaissent, et la somme
 *            pondérée cesse d'être nulle. Le nombre sort — 0,8 — et il reçoit
 *            enfin son nom.
 *   étape 3  le même calcul sur le Jackpot : 36. Le rapport de 45 entre les
 *            deux jeux est la RÉPONSE à la question du module 1.
 *
 * CONNAISSANCES AVANT LA DEMANDE : étape 1 le calcul des écarts et le constat
 * de leur annulation → brique `ecart-a-l-esperance` ; étape 2 le calcul des
 * carrés mené jusqu'au bout → briques `variance` et
 * `methode-calculer-variance` ; étape 3 la demande.
 *
 * PARSE. Les écarts sont NÉGATIFS et la leçon les AFFICHE avec le vrai signe
 * moins U+2212 que `formatDec` produit. `parseDec` refuse ce caractère : toutes
 * les saisies passent donc par `parseSigned` (dispersionUtils), qui le
 * normalise avant de déléguer. Sans lui, un élève qui recopie « −1 » voit sa
 * bonne réponse refusée.
 *
 * PAS DE MANIPULATION GELÉE : les tableaux d'écarts restent lisibles et
 * recalculables après validation ; aucun `disabled={done}`.
 */
export default function Module02MesurerLEcartALaMoyenne() {
  const [e1, setE1] = useState(false);
  const [e2, setE2] = useState(false);
  const [q1, setQ1] = useState(false);
  const [c1, setC1] = useState(false);
  const [c2, setC2] = useState(false);
  const [v1, setV1] = useState(false);
  const [q3, setQ3] = useState(false);

  const loiReg = loiDuJeu(JEU_REGULIER);
  const loiJack = loiDuJeu(JEU_JACKPOT);
  const m = esperanceDuJeu(JEU_REGULIER);           // 2
  const detReg = detailVariance(loiReg);            // écarts −1, 0, 1
  const detJack = detailVariance(loiJack);          // écarts −2, 18
  const vReg = varianceDuJeu(JEU_REGULIER);         // 0,8
  const vJack = varianceDuJeu(JEU_JACKPOT);         // 36

  const done1 = e1 && e2 && q1;
  const done2 = c1 && c2 && v1;

  const steps = [
    {
      num: 1,
      title: 'D’abord : de combien chaque gain s’écarte-t-il ?',
      subtitle:
        'Le Régulier paie 1 €, 2 € ou 3 €, et sa moyenne à long terme vaut 2 €. Calcule l’écart de chaque gain à cette moyenne — avec son signe.',
      done: done1,
      content: (
        <div className="space-y-3">
          <TableauDeLoi loi={loiReg} titre="La loi du Régulier" avecTotal={false} />
          <NumericQuestion
            prompt={<>Écart du gain de <strong>1 €</strong> à la moyenne de 2 € (avec son signe) :</>}
            expected={-1}
            parse={parseSigned}
            display={fr(-1)}
            requires={['esperance', 'tableau-de-loi']}
            explain="1 − 2 = −1. Le signe compte : ce gain est EN DESSOUS de la moyenne."
            explainFor={(n) => (n === 1 ? 'Tu as donné la distance sans son signe. On demande l’écart signé : 1 − 2 = −1, parce que 1 est plus petit que 2.' : null)}
            solved={e1}
            onAnswered={() => setE1(true)}
          />
          <NumericQuestion
            prompt={<>Écart du gain de <strong>3 €</strong> à la moyenne de 2 € :</>}
            expected={1}
            parse={parseSigned}
            display="1"
            requires={['esperance', 'tableau-de-loi']}
            explain="3 − 2 = 1. Celui-ci est AU-DESSUS de la moyenne : son écart est positif."
            solved={e2}
            onAnswered={() => setE2(true)}
          />
          {e1 && e2 && (
            <>
              <TableauDesEcarts
                detail={detReg}
                titre="Les écarts du Régulier"
                colonnes={['ecart']}
                accent={JEU_REGULIER.couleur}
              />
              <TapQuestion
                prompt="Multiplie chaque écart par sa probabilité, puis additionne : 0,4 × (−1) + 0,2 × 0 + 0,4 × 1. Combien trouves-tu ?"
                options={[
                  '0 — les écarts négatifs annulent exactement les positifs',
                  '0,8 — c’est déjà le nombre cherché',
                  '2 — c’est la moyenne elle-même',
                  '0,4 — seul le premier écart compte',
                ]}
                correct={0}
                cols={1}
                requires={['esperance', 'dispersion-autour-de-la-moyenne']}
                explain="−0,4 + 0 + 0,4 = 0. Et ce n’est pas propre à ce jeu : la moyenne à long terme est le point d’équilibre, donc cette somme vaut zéro pour TOUTE variable aléatoire. Un indicateur bâti dessus vaudrait 0 pour les deux stands — il n’en distinguerait aucun."
                explainWrong="Pose le calcul en respectant les signes : 0,4 × (−1) = −0,4, puis 0,2 × 0 = 0, puis 0,4 × 1 = +0,4. La somme est −0,4 + 0 + 0,4, c’est-à-dire zéro. C’est justement le problème qu’il va falloir contourner."
                solved={q1}
                onAnswered={() => setQ1(true)}
              />
              {q1 && (
                <KnowledgeBrick
                  id="ecart-a-l-esperance"
                  variant="new"
                  lead={<>Pourquoi la somme des écarts ne peut pas servir d’indicateur — et ce qu’on va en faire.</>}
                />
              )}
            </>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Supprimer les signes : les carrés',
      subtitle:
        'Un carré est toujours positif ou nul. Élève chaque écart au carré, pèse-le par sa probabilité, et additionne.',
      done: done2,
      content: (
        <div className="space-y-3">
          <TableauDesEcarts
            detail={detReg}
            titre="Les écarts du Régulier, et leurs carrés"
            colonnes={['ecart', 'carre']}
            accent={JEU_REGULIER.couleur}
          />
          <NumericQuestion
            prompt={<>Carré de l’écart −1, multiplié par sa probabilité 0,4 : <strong>0,4 × (−1)²</strong></>}
            expected={0.4}
            parse={parseSigned}
            display="0,4"
            requires={['ecart-a-l-esperance']}
            explain="(−1)² = 1, puis 1 × 0,4 = 0,4. Le signe a disparu : c’est tout l’intérêt du carré."
            explainFor={(n) => (n === -0.4 ? 'Le carré a fait disparaître le signe : (−1)² vaut +1, pas −1. La contribution est donc +0,4.' : null)}
            solved={c1}
            onAnswered={() => setC1(true)}
          />
          <NumericQuestion
            prompt={<>Carré de l’écart 1, multiplié par sa probabilité 0,4 : <strong>0,4 × 1²</strong></>}
            expected={0.4}
            parse={parseSigned}
            display="0,4"
            requires={['ecart-a-l-esperance']}
            explain="1² = 1, puis 1 × 0,4 = 0,4. Les deux gains extrêmes contribuent maintenant DANS LE MÊME SENS."
            solved={c2}
            onAnswered={() => setC2(true)}
          />
          {c1 && c2 && (
            <>
              <TableauDesEcarts
                detail={detReg}
                titre="Le calcul complet pour le Régulier"
                colonnes={['ecart', 'carre', 'contribution']}
                accent={JEU_REGULIER.couleur}
                total={vReg}
              />
              <NumericQuestion
                prompt={<>Additionne les trois contributions : <strong>0,4 + 0 + 0,4</strong></>}
                expected={0.8}
                parse={parseSigned}
                display="0,8"
                requires={['ecart-a-l-esperance', 'dispersion-autour-de-la-moyenne']}
                explain="0,8. Cette fois le résultat n’est pas nul — et il ne le sera jamais, sauf si le jeu ne verse qu’un seul montant. Le nombre manquant existe."
                explainFor={(n) =>
                  n === 0
                    ? 'Zéro serait le résultat SANS les carrés. Avec les carrés, les deux contributions valent +0,4 chacune : leur somme fait 0,8.'
                    : n === 2
                    ? 'Tu as additionné les carrés sans les peser : 1 + 0 + 1 = 2. Chaque carré doit être multiplié par SA probabilité avant l’addition.'
                    : null
                }
                solved={v1}
                onAnswered={() => setV1(true)}
              />
              {v1 && (
                <>
                  <Feedback tone="ok">
                    <strong>{fr(vReg)}</strong> pour le Régulier. Le nombre existe, il se calcule à
                    partir du seul tableau, et il vaut zéro uniquement quand tous les résultats sont
                    identiques. Il a un nom.
                  </Feedback>
                  <KnowledgeBrick
                    id="variance"
                    variant="new"
                    lead={<>Le nom et la formule du nombre que tu viens de construire.</>}
                  />
                  <KnowledgeBrick
                    id="methode-calculer-variance"
                    variant="new"
                    compact
                    lead={<>Les cinq gestes que tu viens de faire, dans l’ordre.</>}
                  />
                </>
              )}
            </>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Et pour le Jackpot ?',
      subtitle:
        'Même calcul, même moyenne de 2 €, mais deux valeurs seulement : 0 € neuf fois sur dix, 20 € une fois sur dix.',
      done: q3,
      content: (
        <div className="space-y-3">
          <TableauDesEcarts
            detail={detJack}
            titre="Le calcul complet pour le Jackpot"
            colonnes={['ecart', 'carre', 'contribution']}
            accent={JEU_JACKPOT.couleur}
            total={vJack}
          />
          <TapQuestion
            prompt={`Le Régulier obtient ${fr(vReg)}, le Jackpot ${fr(vJack)}. Que conclure ?`}
            options={[
              'Les deux jeux sont enfin distingués : le second s’écarte bien plus de sa moyenne que le premier',
              'Le Jackpot rapporte 45 fois plus que le Régulier',
              'Le calcul du Jackpot est faux : sa moyenne vaut 2 €, pas 36',
              'Les deux nombres ne se comparent pas : les jeux n’ont pas les mêmes gains',
            ]}
            correct={0}
            cols={1}
            requires={['variance', 'methode-calculer-variance', 'meme-moyenne-pas-meme-jeu']}
            explain="Un rapport de 45. Le nombre manquant du module 1 est trouvé : deux jeux de même moyenne obtiennent enfin deux valeurs très différentes. À noter : l’unique gain de 20 € apporte à lui seul 32,4 des 36 — une valeur rare mais très éloignée pèse énormément."
            explainWrong="Ce nombre ne mesure PAS ce que le jeu rapporte : les deux rapportent 2 € en moyenne, et ce calcul-ci ne s’en occupe pas. Il mesure l’écart à cette moyenne. Le calcul du Jackpot est juste : 0,9 × (0 − 2)² + 0,1 × (20 − 2)² = 3,6 + 32,4 = 36. Et les deux nombres se comparent très bien : c’est même à cela qu’ils servent."
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
          {q3 && (
            <Feedback tone="info">
              Un détail va compter au module suivant : {fr(vReg)} et {fr(vJack)} ne sont pas des
              sommes d’argent. On a élevé des euros au carré — et 36 « euros carrés » ne se compare
              à aucun gain de la table.
            </Feedback>
          )}
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="Mesurer l’écart à la moyenne"
      moduleSubtitle="Les écarts s’annulent ; leurs carrés, non"
      estimatedTime="10 min"
      brief={{
        tag: 'Atelier',
        title: 'Fabriquer le nombre manquant',
        tone: 'indigo',
        body: (
          <p>
            On veut un nombre qui grandisse quand les gains s’éloignent de {euros(m)} et qui reste
            petit quand ils s’en approchent. Première tentative, échec instructif, puis la bonne.
          </p>
        ),
      }}
      steps={steps}
      footer={
        <KnowledgeSnapshot moduleNumber={2}>
          <strong>Le nombre existe.</strong> Il distingue les deux jeux, il se calcule sur le seul
          tableau — mais il n’est pas dans la bonne unité. Module suivant : le rendre lisible.
        </KnowledgeSnapshot>
      }
    />
  );
}
