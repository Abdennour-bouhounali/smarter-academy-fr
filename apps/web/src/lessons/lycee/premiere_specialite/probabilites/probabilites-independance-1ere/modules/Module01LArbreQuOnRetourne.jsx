import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, PredictionChips, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { parseDec } from '@smarter-academy/core';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import TwoTreesLab from '../components/TwoTreesLab';
import { labReadings, pct, LAB_TOTAL, LAB_NB } from '../components/indepUtils';
import { LAB_START, LAB_INDEP, LAB_LABELS } from '../data';

/**
 * Module 1 — DÉCLENCHEUR, et l'interaction SIGNATURE : « l'arbre qu'on
 * retourne » (components/TwoTreesLab.jsx).
 *
 * LE GLISSER (règle utilisateur du 2026-09-10). La composition de la population
 * se règle en ATTRAPANT LES SÉPARATIONS d'un tableau croisé et en les faisant
 * glisser : pas un bouton ±, pas un curseur posé à côté de la figure. Les DEUX
 * arbres se recalculent sous le doigt. `DraggableSplitBar` (common/stats)
 * fournit le `setPointerCapture`, la zone de préhension large et le chemin
 * clavier complet.
 *
 * L'ARC DU MODULE — deux constats, une question :
 *   Étape 1  PRÉDICTION puis MANIPULATION LIBRE : régler la population et voir
 *            les DEUX arbres bouger ensemble. CONSTAT 1 : les deux poids ne
 *            coïncident pas ; retourner n'est pas échanger deux lettres.
 *   Étape 2  LA MISSION : chercher un réglage où, DANS CHAQUE arbre, les deux
 *            poids de deuxième génération deviennent identiques. C'est le geste
 *            qui fait la découverte — une recherche, pas une lecture.
 *   Étape 3  ce que ce réglage veut dire : savoir A ne change RIEN à B.
 *   Étape 4  la question qui ouvre le module 2 : comment s'appelle ce cas ?
 *
 * LE MODULE NE PRONONCE PAS « INDÉPENDANCE ». Il fait constater les deux faits
 * et DEMANDE le nom du cas particulier ; c'est le module 3 qui le nommera. Rien
 * n'est nommé ici que les leçons précédentes n'aient déjà nommé.
 *
 * MANIPULATION JAMAIS GELÉE. Aucun `disabled={done}` : le laboratoire reste
 * pilotable après validation, et c'est le but — l'élève doit pouvoir refaire
 * glisser en lisant la brique. Seul le verrou d'ANTÉRIORITÉ (`locked={!done1}`)
 * existe, et seuls les `PredictionChips` se figent, une prédiction ne
 * s'enregistrant qu'une fois.
 */
export default function Module01LArbreQuOnRetourne() {
  const [etat1, setEtat1] = useState(LAB_START);
  const [pred, setPred] = useState(null);
  const [q1, setQ1] = useState(false);
  const [etat2, setEtat2] = useState(LAB_START);
  const [trouve, setTrouve] = useState(null);   // le réglage plat effectivement atteint
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);

  const done1 = q1;
  const done2 = trouve !== null;
  const lecture1 = labReadings(etat1);
  const lecture2 = labReadings(etat2);
  const cible = labReadings(LAB_INDEP);

  // La mission est réussie dès que l'élève ATTEINT un réglage où les poids de
  // deuxième génération coïncident. On mémorise CELUI qu'il a trouvé — il y en
  // a dix-neuf, et le module doit parler de celui-là, pas d'un autre.
  const bouger2 = (next, react) => {
    setEtat2(next);
    const r = labReadings(next);
    if (!done2 && r.flatA && !r.degenerate) {
      setTrouve(next);
      react?.(true);
    }
  };

  const steps = [
    {
      num: 1,
      title: 'Attrape une séparation et fais-la glisser',
      subtitle:
        'Les deux arbres décrivent les MÊMES élèves. À gauche on demande d’abord « porte des lunettes ? », à droite « est au club de sport ? ». Fais glisser et compare les poids.',
      done: done1,
      content: () => (
        <div className="space-y-3">
          <PredictionChips
            prompt="Les deux arbres racontent la même population. Leurs poids vont-ils se ressembler ?"
            options={[
              { id: 'memes', label: 'Ils seront les mêmes des deux côtés' },
              { id: 'echange', label: 'Les mêmes nombres, mais échangés' },
              { id: 'autres', label: 'Ce ne seront pas les mêmes nombres' },
            ]}
            value={pred}
            onChange={setPred}
            disabled={done1}
          />
          <TwoTreesLab state={etat1} onChange={setEtat1} />
          <NumericQuestion
            prompt={
              <>
                Règle la première séparation sur <strong>600</strong> élèves {LAB_LABELS.aShort} et
                la seconde sur <strong>200</strong>. Parmi les {LAB_NB} élèves{' '}
                <strong>{LAB_LABELS.bShort}</strong>, quel pourcentage {LAB_LABELS.a} ?
                (sans le signe %)
              </>
            }
            expected={50}
            parse={parseDec}
            display="50"
            suffix="%"
            requires={['univers-restreint', 'notation-sachant', 'denominateur', 'conditionnelle-sur-effectifs']}
            explain="200 élèves cumulent les deux critères, et le club en compte 400 : 200 ÷ 400 = 0,5, soit 50 %. C’est le poids de la branche A dans l’arbre de droite."
            explainFor={(n) =>
              n === 33.3 || n === 33
                ? 'C’est l’autre sens : 200 rapportés aux 600 élèves à lunettes. Ici le groupe de référence est le club de sport, qui compte 400 élèves.'
                : n === 20
                  ? 'C’est 200 rapportés aux 1 000 élèves du lycée entier. La question demande la part À L’INTÉRIEUR du club.'
                  : 'Le dénominateur est l’effectif du groupe dans lequel on se place : 400 élèves au club. 200 ÷ 400 = 0,5.'
            }
            solved={done1}
            onAnswered={() => setQ1(true)}
          />
          {done1 && (
            <>
              <Feedback tone="ok">
                {pred === 'autres' ? 'Ta prédiction tenait' : pred ? 'Ta prédiction ne tenait pas' : 'Compare les deux tableaux'} :
                à gauche, la part de {LAB_LABELS.bShort} parmi les {LAB_LABELS.aShort} vaut{' '}
                <strong>{pct(lecture1.condAB, 1)}</strong> ; à droite, la part de{' '}
                {LAB_LABELS.aShort} parmi les {LAB_LABELS.bShort} vaut{' '}
                <strong>{pct(lecture1.condBA, 1)}</strong>. Mêmes élèves, même case commune —
                deux nombres différents, parce que les deux groupes n’ont pas la même taille.
              </Feedback>
              <KnowledgeBrick
                id="deux-arbres-deux-poids"
                variant="new"
                lead={<>Ce que les deux arbres viennent de montrer se dit en une phrase. Refais glisser en la lisant.</>}
              />
            </>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'La mission : rendre les deux poids identiques',
      subtitle:
        'Cherche un réglage où, DANS L’ARBRE DE GAUCHE, les deux branches de deuxième génération portent le même poids. Regarde ce qui arrive alors à l’arbre de droite.',
      done: done2,
      content: (kit) => (
        <div className="space-y-3">
          <TwoTreesLab
            state={etat2}
            onChange={(next) => bouger2(next, kit.react)}
            locked={!done1}
          />
          {done2 && trouve ? (
            <>
              <Feedback tone="ok">
                Trouvé, avec <strong>{trouve.nA}</strong> élèves {LAB_LABELS.aShort} dont{' '}
                <strong>{trouve.nAB}</strong> {LAB_LABELS.bShort}. À gauche, les deux poids valent{' '}
                <strong>{pct(labReadings(trouve).byA[0].children[0].p, 1)}</strong> tous les deux ;
                à droite aussi, ils coïncident. Et le calcul le confirme sans arrondi :{' '}
                {trouve.nAB} × {LAB_TOTAL} = {labReadings(trouve).exact.left} et {trouve.nA} ×{' '}
                {LAB_NB} = {labReadings(trouve).exact.right}. Ce n’est pas « à peu près » : c’est
                égal.
              </Feedback>
              <KnowledgeBrick
                id="savoir-ne-change-rien"
                variant="new"
                lead={<>Ce réglage-là a quelque chose de particulier. Refais-le glisser en lisant.</>}
              />
            </>
          ) : (
            <Feedback tone="info">
              Réglage actuel : {lecture2.counts.nA} élèves {LAB_LABELS.aShort} dont{' '}
              {lecture2.counts.nAB} {LAB_LABELS.bShort} — les deux poids de gauche valent{' '}
              {pct(lecture2.byA[0].children[0].p, 1)} et{' '}
              {pct(lecture2.byA[1].children[0].p, 1)}. Piste : le club compte {LAB_NB} élèves sur{' '}
              {LAB_TOTAL}, soit {pct(lecture2.pB, 0)} du lycée. Essaie d’amener les deux poids de
              gauche sur cette valeur-là.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Qu’est-ce que ce réglage veut dire ?',
      done: q3,
      content: (
        <TapQuestion
          prompt={`Dans ce réglage, la part d’élèves ${LAB_LABELS.bShort} est la même chez les ${LAB_LABELS.aShort} et chez les ${LAB_LABELS.notA}. Que peut-on en conclure ?`}
          options={[
            `Savoir si un élève ${LAB_LABELS.a} n’apprend rien sur sa chance d’être ${LAB_LABELS.bShort}`,
            `Aucun élève ne peut être à la fois ${LAB_LABELS.aShort} et ${LAB_LABELS.bShort}`,
            `Il y a autant d’élèves ${LAB_LABELS.aShort} que d’élèves ${LAB_LABELS.bShort}`,
            `Les deux arbres sont devenus identiques`,
          ]}
          correct={0}
          cols={1}
          requires={['savoir-ne-change-rien', 'deux-arbres-deux-poids', 'poids-conditionnels']}
          explain={`Le poids d’une branche de deuxième génération se lit « parmi ceux-là… ». Quand les deux branches portent le même poids, se placer dans l’une ou dans l’autre ne change pas le résultat : la première réponse n’apporte aucune information sur la seconde.`}
          explainWrong={`Regarde les effectifs : ${cible.counts.nAB} élèves cumulent bien les deux critères, ils sont donc compatibles ; et ${cible.counts.nA} n’est pas ${LAB_NB}, les deux groupes n’ont pas la même taille. Les deux arbres, eux, portent encore des poids différents l’un de l’autre — ${pct(cible.condAB, 0)} à gauche contre ${pct(cible.condBA, 0)} à droite.`}
          solved={q3}
          onAnswered={() => setQ3(true)}
        />
      ),
    },
    {
      num: 4,
      title: 'Comment s’appelle ce cas particulier ?',
      done: q4,
      content: (
        <div className="space-y-3">
          <TwoTreesLab state={LAB_INDEP} onChange={() => {}} locked showReadings={false} />
          <TapQuestion
            prompt="Tu viens de trouver un réglage où la première réponse n’apprend rien sur la seconde. Que faut-il en faire maintenant ?"
            options={[
              'Lui donner un nom, et trouver un calcul qui le reconnaisse à coup sûr',
              'Considérer que c’est un hasard de réglage, sans intérêt mathématique',
              'En déduire que les deux arbres sont interchangeables',
              'Retenir que ce cas n’arrive que sur des populations de 1 000 individus',
            ]}
            correct={0}
            cols={1}
            requires={['savoir-ne-change-rien', 'deux-arbres-deux-poids']}
            explain="Ce cas revient partout — en médecine, en contrôle qualité, dans tous les jeux de hasard. Il porte un nom, et surtout il se vérifie par un calcul qui ne dépend d’aucun coup d’œil. Les modules suivants font les deux : d’abord retourner un conditionnement proprement, puis nommer et vérifier ce cas particulier."
            explainWrong="Ce réglage n’a rien d’accidentel : tu peux en trouver dix-huit autres sur cette population, et il apparaît dans quantité de situations réelles. Quant aux deux arbres, ils gardent des poids différents l’un de l’autre même dans ce cas — ils ne deviennent jamais interchangeables."
            solved={q4}
            onAnswered={() => setQ4(true)}
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
      moduleTitle="L’arbre qu’on retourne"
      moduleSubtitle="Deux arbres, mille élèves, et des poids qui refusent de coïncider"
      estimatedTime="10 min"
      brief={{
        tag: 'Déclencheur',
        title: 'La même population, racontée dans les deux sens',
        tone: 'indigo',
        body: (
          <p>
            Mille élèves d’un lycée, croisés selon deux critères : {LAB_LABELS.a} et{' '}
            {LAB_LABELS.b}. Deux arbres les décrivent, l’un en posant la première question
            d’abord, l’autre la seconde. Tu règles la population en attrapant les traits noirs.
            Ta mission : trouver le réglage où les deux poids de deuxième génération deviennent
            identiques.
          </p>
        ),
      }}
      steps={steps}
      footer={
        <KnowledgeSnapshot moduleNumber={1}>
          <strong>Ce que tu viens de voir.</strong> Retourner un conditionnement change le
          dénominateur, donc le résultat : les deux arbres d’une même population ne portent pas
          les mêmes poids. Sauf pour certains réglages, où la première réponse n’apprend plus
          rien sur la seconde. Module suivant : comment retourner proprement un conditionnement,
          et pourquoi le dénominateur change de camp.
        </KnowledgeSnapshot>
      }
    />
  );
}
