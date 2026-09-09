import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, PredictionChips, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import ParabolaLab from '../components/ParabolaLab';
import { LAB, C_STEPS, labState, aVuLesTroisRegimes, parseSigned, fr } from '../components/quadUtils';

/**
 * Module 1 — DÉCLENCHEUR, et l'interaction SIGNATURE : la parabole qui remonte
 * (components/ParabolaLab.jsx).
 *
 * Étape 1  faire monter la courbe et REGARDER les deux points d'intersection se
 *          rapprocher, fusionner, disparaître. Le compteur seul est affiché :
 *          le second nombre n'existe pas encore pour l'élève.
 * Étape 2  le second afficheur apparaît. b² − 4ac bascule EXACTEMENT au cran de
 *          la fusion : l'élève retrouve ce cran et lit le nombre qui s'y annule.
 * Étape 3  la conséquence : on peut compter sans résoudre.
 * Étape 4  la QUESTION — comment s'appelle ce nombre ? Le module ne répond pas.
 *
 * Rien ne s'appelle « discriminant » ni « Δ » avant le module 2 : le module se
 * termine en DEMANDANT ce que le suivant nommera (§6bis.1). Rien ne s'appelle
 * « racine » non plus — l'élève parle de POINTS et de SOLUTIONS, mots qu'il
 * possède déjà.
 *
 * CONNAISSANCES AVANT LA DEMANDE. L'ordre est geste → observation → brique →
 * demande :
 *   étape 1  faire monter la courbe → briques `trinome-second-degre` puis
 *            `points-axe-abscisses`
 *   étape 2  retrouver le cran de la fusion → brique `un-nombre-predit`
 *   étapes 3 et 4  les questions, désormais légitimes.
 *
 * MANIPULATION JAMAIS GELÉE. Le laboratoire reste pilotable une fois l'étape
 * validée : `disabled` ne porte que le verrou d'ANTÉRIORITÉ de l'étape 2 sur
 * l'étape 1. Seuls les `PredictionChips` se figent — une prédiction
 * s'enregistre une fois, avant la révélation.
 */
export default function Module01LaParaboleQuiRemonte() {
  const [c1, setC1] = useState(LAB.cStart);
  const [vus1, setVus1] = useState([LAB.cStart]);
  const [pred, setPred] = useState(null);
  const [c2, setC2] = useState(LAB.cStart);
  const [vus2, setVus2] = useState([LAB.cStart]);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);

  const done1 = aVuLesTroisRegimes(vus1);
  const done2 = q2;

  /** Le cran visité s'ajoute à l'historique : c'est la SUITE des états qui
   *  fait la découverte, pas le dernier. `react` ne se déclenche qu'au moment
   *  où l'objectif tombe. */
  const bouger = (v, liste, setListe, setC, react, dejaFait) => {
    setC(v);
    if (liste.includes(v)) return;
    const suivant = [...liste, v];
    setListe(suivant);
    if (!dejaFait && aVuLesTroisRegimes(suivant)) react?.(true);
  };

  const etatFusion = labState(LAB.cFusion);

  const steps = [
    {
      num: 1,
      title: 'Fais monter la courbe',
      subtitle:
        'La courbe a pour équation y = x² − 4x + c. Appuie sur « monter » et regarde les deux points rouges posés sur l’axe horizontal. Continue jusqu’à ce que le compteur ait affiché 2 points, puis 1, puis 0.',
      done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <PredictionChips
            prompt="en faisant monter la courbe, que vont faire les deux points rouges ?"
            options={[
              { id: 'ecartent', label: 'S’écarter de plus en plus' },
              { id: 'rejoignent', label: 'Se rejoindre, puis disparaître' },
              { id: 'immobiles', label: 'Rester où ils sont' },
            ]}
            value={pred}
            onChange={setPred}
            disabled={done1}
          />
          <ParabolaLab
            c={c1}
            onChangeC={(v) => bouger(v, vus1, setVus1, setC1, kit.react, done1)}
            visites={vus1}
            showNombre={false}
          />
          {done1 ? (
            <>
              <Feedback tone="ok">
                {pred === 'rejoignent' ? 'Ta prédiction tenait' : pred ? 'Ta prédiction ne tenait pas' : 'Voilà ce qui se passe'} :
                les deux points glissent l’un vers l’autre, se <strong>confondent en un seul</strong>{' '}
                à c = {fr(LAB.cFusion)}, puis <strong>disparaissent</strong>. La courbe, elle, est
                toujours là — elle est simplement passée au-dessus de l’axe.
              </Feedback>
              <KnowledgeBrick
                id="trinome-second-degre"
                variant="new"
                lead={<>L’expression que tu viens de faire glisser porte un nom.</>}
              />
              <KnowledgeBrick
                id="points-axe-abscisses"
                variant="new"
                lead={<>Et les points rouges disent quelque chose de précis. Refais le geste en le lisant.</>}
              />
            </>
          ) : (
            <Feedback tone="info">
              Compteurs déjà obtenus : {[...new Set(vus1.map((v) => labState(v).nombre))].sort((a, b) => b - a).join(', ') || '—'}.
              Il t’en faut trois différents : 2, 1 et 0.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Un second afficheur',
      subtitle:
        'Un deuxième nombre s’affiche maintenant à côté du compteur : b² − 4ac, calculé avec a = 1, b = −4 et le c courant. Repasse par les trois régimes et trouve la hauteur où ce nombre vaut exactement 0.',
      done: done2,
      content: (kit) => (
        <div className="space-y-3">
          <ParabolaLab
            c={c2}
            onChangeC={(v) => bouger(v, vus2, setVus2, setC2, undefined, true)}
            visites={vus2}
            disabled={!done1}
          />
          <NumericQuestion
            prompt={<>À quelle hauteur <strong>c</strong> le nombre b² − 4ac vaut-il exactement 0 ?</>}
            expected={LAB.cFusion}
            parse={parseSigned}
            display={fr(LAB.cFusion)}
            requires={['points-axe-abscisses']}
            explain={`À c = ${fr(LAB.cFusion)}, le compteur affiche 1 point et b² − 4ac affiche 0 : les deux basculent au même cran. C’est la hauteur où les deux points se confondent.`}
            explainFor={(n) =>
              n === 3
                ? 'À c = 3 il reste encore deux points (x = 1 et x = 3), et b² − 4ac vaut 4 : ce n’est pas encore zéro. Monte d’un cran, puis d’un autre.'
                : n === 5
                ? 'À c = 5 les points ont déjà disparu et b² − 4ac vaut −4 : tu es passé au-delà. Redescends jusqu’à ce que l’afficheur montre exactement 0.'
                : null
            }
            solved={done2}
            onAnswered={() => setQ2(true)}
          />
          {done2 && (
            <>
              <Feedback tone="ok">
                Les deux afficheurs basculent <strong>au même cran</strong> : à c = {fr(LAB.cFusion)},
                le compteur passe de 2 à 1 et b² − 4ac passe de {fr(labState(3.5).delta)} à{' '}
                {fr(etatFusion.delta)}. Un cran plus haut, 0 point et {fr(labState(4.5).delta)}.
                Ce n’est pas une coïncidence : le signe de ce nombre <em>annonce</em> le nombre de
                points.
              </Feedback>
              <KnowledgeBrick
                id="un-nombre-predit"
                variant="new"
                lead={<>Ce que les deux afficheurs viennent de montrer ensemble.</>}
              />
            </>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Compter sans chercher',
      done: q3,
      content: (
        <div className="space-y-3">
          <TapQuestion
            prompt="Si b² − 4ac est négatif, que peut-on affirmer sur l’équation x² − 4x + c = 0, SANS faire le moindre calcul de solution ?"
            options={[
              'Elle n’a aucune solution : la courbe ne rencontre plus l’axe horizontal',
              'Elle a deux solutions négatives',
              'Elle a une solution, négative elle aussi',
              'On ne peut rien dire tant qu’on n’a pas cherché les solutions',
            ]}
            correct={0}
            cols={1}
            requires={['points-axe-abscisses', 'un-nombre-predit']}
            explain="Une solution de l’équation est l’abscisse d’un point de la courbe posé sur l’axe horizontal. Plus aucun point sur l’axe, donc plus aucune solution — et ce nombre suffit à le dire d’avance."
            explainWrong="Le signe de ce nombre ne dit rien du SIGNE des solutions : il dit combien il y en a. Négatif, il y en a zéro — et « zéro solution » est une réponse complète, pas un aveu d’échec."
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
          {q3 && (
            <Feedback tone="ok">
              C’est un renversement complet : d’habitude on cherche les solutions, puis on les
              compte. Ici, <strong>on les compte d’abord</strong> — et l’on sait avant de chercher
              si la recherche a un sens.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 4,
      title: 'Comment s’appelle ce nombre ?',
      done: q4,
      content: (
        <div className="space-y-3">
          <ParabolaLab c={LAB.cFusion} onChangeC={() => {}} disabled />
          <TapQuestion
            prompt="Ce nombre b² − 4ac tranche entre trois situations avant toute résolution. À ton avis, que va-t-il se passer maintenant ?"
            options={[
              'Il porte un nom et une notation, et l’on va apprendre à s’en servir pour toute équation, pas seulement celle-ci',
              'Il ne sert que pour l’équation x² − 4x + c = 0',
              'Il faudra le recalculer point par point sur chaque courbe',
              'Il ne sert plus une fois les solutions trouvées',
            ]}
            correct={0}
            cols={1}
            requires={['un-nombre-predit', 'trinome-second-degre']}
            explain="Ce nombre se calcule à partir de a, b et c seulement, quels qu’ils soient : il vaut donc pour TOUTE équation de cette forme. Le module suivant lui donne son nom et sa notation."
            explainWrong="Regarde comment il est fabriqué : b² − 4ac n’utilise que les trois coefficients. Rien dans ce calcul n’est propre à x² − 4x + c."
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
      moduleTitle="La parabole qui remonte"
      moduleSubtitle="Deux points qui se rejoignent, et un nombre qui bascule au même instant"
      estimatedTime="10 min"
      brief={{
        tag: 'Déclencheur',
        title: 'Combien de solutions, sans en chercher une seule ?',
        tone: 'indigo',
        body: (
          <p>
            Fais monter une courbe cran par cran et regarde ses deux points de rencontre avec
            l’axe horizontal. Ils se rapprochent, se confondent, s’effacent — et un nombre change
            de signe exactement à cet instant.
          </p>
        ),
      }}
      steps={steps}
      footer={
        <KnowledgeSnapshot moduleNumber={1}>
          <strong>Le mot juste.</strong> Le nombre b² − 4ac qui a basculé pile à la fusion porte un
          nom, une notation, et une méthode de calcul : module suivant.
        </KnowledgeSnapshot>
      }
    />
  );
}
