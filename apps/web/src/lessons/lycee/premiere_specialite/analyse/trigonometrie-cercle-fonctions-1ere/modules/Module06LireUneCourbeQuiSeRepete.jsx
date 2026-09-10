import React, { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import OndeReader from '../components/OndeReader';
import { LECTURES, MOTIFS_LABELS, MOTIFS, fr } from '../components/trigFnUtils';

/**
 * Module 6 — ATELIER : interpréter une courbe périodique (LP6).
 *
 * Étape 1  une courbe donnée, deux cliquets. L'élève règle l'écart maximal et
 *          la longueur du motif jusqu'à superposer SA courbe à celle qui est
 *          donnée. Les deux réglages sont INDÉPENDANTS : c'est le geste qui le
 *          fait comprendre.
 * Étape 2  une deuxième courbe, dont le motif fait 4π : le cadre en montre un
 *          entier, d'un sommet au sommet suivant (vérifié par le test — la
 *          première version du cadre rendait cette lecture infaisable).
 * Étape 3  le piège frontal : mesurer d'un sommet au CREUX suivant donne la
 *          MOITIÉ du motif.
 *
 * CONNAISSANCES AVANT LA DEMANDE : étape 1 geste → brique `lire-ecart-et-motif`
 * → demande ; étape 3 constat → brique `regle-courbe-ne-dit-pas-tout`.
 *
 * MANIPULATION JAMAIS GELÉE : les deux laboratoires restent réglables une fois
 * la cible atteinte — c'est là qu'on voit chaque cliquet agir séparément.
 */
const L1 = LECTURES[0];
const L2 = LECTURES[1];
const L3 = LECTURES[2];

/** L'étiquette du motif d'une lecture, DÉRIVÉE de la table — jamais saisie. */
const motifLabel = (l) => MOTIFS_LABELS[MOTIFS.findIndex((m) => Math.abs(m - l.P) < 1e-12)];

export default function Module06LireUneCourbeQuiSeRepete() {
  const [a1, setA1] = useState(1);
  const [p1, setP1] = useState(MOTIFS[0]);
  const [trouve1, setTrouve1] = useState(false);

  const [a2, setA2] = useState(1);
  const [p2, setP2] = useState(MOTIFS[0]);
  const [trouve2, setTrouve2] = useState(false);

  const [q3, setQ3] = useState(false);

  const viser = (l, A, P, deja, setTrouve, react) => {
    if (!deja && Math.abs(A - l.A) < 1e-9 && Math.abs(P - l.P) < 1e-9) {
      setTrouve(true);
      react?.(true);
    }
  };

  const steps = [
    {
      num: 1,
      title: 'Superpose ta courbe à celle qu’on te donne',
      subtitle:
        'ATTRAPE le sommet de ta vague et déplace-le : monte-le pour la faire monter plus haut, éloigne-le vers la droite pour l’étirer. Trouve les deux réglages.',
      done: trouve1,
      content: (kit) => (
        <div className="space-y-3">
          <OndeReader
            cible={L1}
            A={a1}
            P={p1}
            onChangeA={(v) => { setA1(v); viser(L1, v, p1, trouve1, setTrouve1, kit.react); }}
            onChangeP={(v) => { setP1(v); viser(L1, a1, v, trouve1, setTrouve1, kit.react); }}
          />
          {trouve1 ? (
            <>
              <Feedback tone="ok">
                Les deux courbes se confondent : écart maximal <strong>{fr(L1.A, 1)}</strong>,
                motif de <strong>{motifLabel(L1)}</strong>. Continue à régler : tu verras que
                changer la hauteur ne change PAS le rythme, et inversement. Ce sont deux
                renseignements séparés.
              </Feedback>
              <KnowledgeBrick
                id="lire-ecart-et-motif"
                variant="new"
                lead={<>Les deux nombres que tu viens de régler se lisent aussi sur un dessin.</>}
              />
            </>
          ) : (
            <Feedback tone="info">
              Regarde d’abord jusqu’où la courbe donnée monte (lis à la verticale), puis d’un
              sommet au sommet suivant (lis à l’horizontale). Puis attrape le sommet de TA vague
              et amène-le au même endroit.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Une vague plus lente',
      subtitle: 'Même geste, autre courbe. Celle-ci met plus longtemps à recommencer : son sommet est plus loin.',
      done: trouve2,
      content: (kit) => (
        <div className="space-y-3">
          <OndeReader
            cible={L2}
            A={a2}
            P={p2}
            onChangeA={(v) => { setA2(v); viser(L2, v, p2, trouve2, setTrouve2, kit.react); }}
            onChangeP={(v) => { setP2(v); viser(L2, a2, v, trouve2, setTrouve2, kit.react); }}
            disabled={!trouve1}
          />
          {trouve2 ? (
            <Feedback tone="ok">
              Écart maximal <strong>{fr(L2.A, 1)}</strong>, motif de{' '}
              <strong>{motifLabel(L2)}</strong> — deux fois plus long que la précédente, alors
              qu’elle monte moins haut. Les deux nombres sont bien indépendants.
            </Feedback>
          ) : (
            <Feedback tone="info">
              Cette vague monte moins haut que la précédente, et son sommet suivant est bien plus
              loin. Repère deux sommets consécutifs.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Le piège de la demi-mesure',
      done: q3,
      content: (
        <div className="space-y-3">
          <OndeReader cible={L3} A={L3.A} P={L3.P} montreSienne={false} disabled />
          <KnowledgeBrick
            id="regle-courbe-ne-dit-pas-tout"
            variant="new"
            lead={<>Un dernier point avant de mesurer : les deux nombres ne se déduisent pas l’un de l’autre.</>}
          />
          <TapQuestion
            prompt="Un élève mesure la distance d’un SOMMET au CREUX qui suit, et annonce que c’est la longueur du motif. Que se passe-t-il ?"
            options={[
              'Il annonce la MOITIÉ de la bonne longueur : du sommet au creux, la courbe n’a fait que la moitié de son motif',
              'Il annonce le double de la bonne longueur',
              'Il a raison : sommet et creux se suivent une fois par motif',
              'Cela dépend de la hauteur de la vague',
            ]}
            correct={0}
            cols={1}
            requires={['lire-ecart-et-motif', 'regle-courbe-ne-dit-pas-tout', 'periodicite']}
            explain={`Un motif complet contient UN sommet et UN creux : du sommet au creux, on n’a parcouru que la moitié du chemin. Pour la courbe ci-dessus, le motif vaut ${motifLabel(L3)} et cette demi-mesure donnerait la moitié. Il faut aller d’un sommet au sommet SUIVANT — ou d’un creux au creux suivant.`}
            explainWrong={`Suis la courbe du doigt : après le sommet elle descend jusqu’au creux, puis elle doit REMONTER jusqu’au sommet suivant pour avoir refait le motif entier. S’arrêter au creux, c’est s’arrêter à mi-parcours. Et cela ne dépend pas de la hauteur : les deux nombres se lisent séparément.`}
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
      navLinks={getNavLinks(6)}
      moduleNumber={6}
      moduleTitle="Lire une courbe qui se répète"
      moduleSubtitle="Deux nombres suffisent à la décrire"
      estimatedTime="8 min"
      brief={{
        tag: 'Atelier',
        title: 'Dans l’autre sens',
        tone: 'indigo',
        body: (
          <p>
            On te donne une courbe qui se répète, sans te dire de quelle fonction elle vient. Deux
            nombres suffisent à la décrire : <strong>jusqu’où elle monte</strong>, et{' '}
            <strong>au bout de combien elle recommence</strong>.
          </p>
        ),
      }}
      steps={steps}
      footer={
        <KnowledgeSnapshot moduleNumber={6}>
          <strong>Tu as tout.</strong> Situer un réel, retourner, répéter, décrire les variations,
          tracer et lire. La mission finale attend.
        </KnowledgeSnapshot>
      }
    />
  );
}
