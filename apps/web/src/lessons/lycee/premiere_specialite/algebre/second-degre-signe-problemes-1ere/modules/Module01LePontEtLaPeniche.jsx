import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, PredictionChips, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import PontLab from '../components/PontLab';
import {
  PONT, pStepsDe, positionsGagnantes, bandePositions,
  penichePasse, parseSigned, fr,
} from '../components/signeProblemesUtils';

/**
 * Module 1 — DÉCLENCHEUR, et l'interaction SIGNATURE : le pont et la péniche
 * (components/PontLab.jsx).
 *
 * Étape 1  déplacer une péniche donnée sous une arche fixe, et constater que
 *          les positions qui marchent sont TOUTES COLLÉES : un seul morceau,
 *          jamais un patchwork. La bande n'est pas encore affichée — c'est à
 *          l'élève de la constituer par ses essais.
 * Étape 2  la bande apparaît. L'élève change la largeur et la hauteur et
 *          vérifie qu'elle reste d'un seul tenant, qu'elle se rétrécit, et
 *          qu'elle peut devenir vide.
 * Étape 3  les bornes : elles sont les deux endroits où un coin touche
 *          exactement l'arche.
 * Étape 4  la QUESTION — comment prévoir cette bande sans essayer ? Le module
 *          ne répond pas.
 *
 * Rien ne s'appelle « signe d'un trinôme » ni « tableau de signes » avant les
 * modules 2 et 3 : le module se termine en DEMANDANT ce que les suivants
 * nommeront (§6bis.1). L'élève parle de POSITIONS, de BANDE et de COINS, mots
 * qu'il possède déjà.
 *
 * DISTINCTION AVEC LA LEÇON AMONT. « Second degré : résoudre » fait GLISSER la
 * courbe et COMPTE des points ; ici la courbe est FIXE et l'élève déplace un
 * OBJET pour lire un INTERVALLE.
 *
 * CONNAISSANCES AVANT LA DEMANDE. L'ordre est geste → observation → brique →
 * demande :
 *   étape 1  essayer des positions → brique `signe-change-aux-racines`
 *   étape 2  changer largeur et hauteur → brique `bande-entre-les-racines`
 *   étapes 3 et 4  les questions, désormais légitimes.
 *
 * MANIPULATION JAMAIS GELÉE. Le laboratoire reste pilotable une fois l'étape
 * validée : `disabled` ne porte que le verrou d'ANTÉRIORITÉ de l'étape 2 sur
 * l'étape 1. Seuls les `PredictionChips` se figent — une prédiction
 * s'enregistre une fois, avant la révélation.
 */

/** L'objectif de l'étape 1 : avoir essayé au moins deux positions qui passent
 *  ET deux qui ne passent pas. C'est cette confrontation qui fait voir le bloc.
 *  Le seuil est CALCULÉ contre la grille réelle, jamais supposé. */
const DEPART = { L: PONT.lStart, H: PONT.hStart, p: PONT.pStart };
const A_ASSEZ_ESSAYE = (essais) => {
  const oui = essais.filter((p) => penichePasse(p, DEPART.L, DEPART.H)).length;
  const non = essais.length - oui;
  return oui >= 2 && non >= 2;
};

export default function Module01LePontEtLaPeniche() {
  const [p1, setP1] = useState(DEPART.p);
  const [essais1, setEssais1] = useState([DEPART.p]);
  const [pred, setPred] = useState(null);

  const [p2, setP2] = useState(DEPART.p);
  const [l2, setL2] = useState(DEPART.L);
  const [h2, setH2] = useState(DEPART.H);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);

  const done1 = A_ASSEZ_ESSAYE(essais1);

  /** Une position essayée s'ajoute à l'historique : c'est la SUITE des essais
   *  qui fait la découverte, pas le dernier. `react` ne se déclenche qu'au
   *  moment où l'objectif tombe. */
  const essayer = (v, react) => {
    setP1(v);
    if (essais1.includes(v)) return;
    const suivant = [...essais1, v];
    setEssais1(suivant);
    if (!done1 && A_ASSEZ_ESSAYE(suivant)) react?.(true);
  };

  /** Changer la largeur peut sortir la position de la grille (elle rétrécit) :
   *  on la ramène au cran le plus proche, sinon les boutons cesseraient de
   *  répondre. C'est un défaut réel du cliquet borné, pas une commodité. */
  const changerL = (v) => {
    setL2(v);
    const crans = pStepsDe(v);
    if (!crans.some((c) => Math.abs(c - p2) < 1e-9)) {
      setP2(crans.reduce((best, c) => (Math.abs(c - p2) < Math.abs(best - p2) ? c : best), crans[0]));
    }
  };

  const bandeDepart = bandePositions(DEPART.L, DEPART.H);
  const gagnantesDepart = positionsGagnantes(DEPART.L, DEPART.H);

  const steps = [
    {
      num: 1,
      title: 'Fais passer la péniche',
      subtitle:
        'L’arche du pont ne bouge pas : elle monte à 4,5 m au milieu et redescend jusqu’à l’eau à 3 m de chaque côté. La péniche, elle, se déplace. Essaie des positions, à gauche comme à droite, jusqu’à en avoir trouvé au moins deux qui passent et deux qui ne passent pas.',
      done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <PredictionChips
            prompt="avant d’essayer : à ton avis, à quoi vont ressembler les positions qui passent ?"
            options={[
              { id: 'bloc', label: 'Un seul morceau, d’un seul tenant' },
              { id: 'patchwork', label: 'Plusieurs petits morceaux, en alternance' },
              { id: 'bords', label: 'Deux morceaux, un à chaque bord' },
            ]}
            value={pred}
            onChange={setPred}
            disabled={done1}
          />
          <PontLab
            p={p1} L={DEPART.L} H={DEPART.H}
            onChangeP={(v) => essayer(v, kit.react)}
            essais={essais1}
            showReglages={false}
            showBande={false}
          />
          {done1 ? (
            <>
              <Feedback tone="ok">
                {pred === 'bloc' ? 'Ta prédiction tenait' : pred ? 'Ta prédiction ne tenait pas' : 'Voilà ce qui se passe'} :
                regarde ta liste d’essais rangée du plus petit au plus grand. Les ✔ sont{' '}
                <strong>tous ensemble, au milieu</strong>, et les ✘ tous autour. Il n’y a pas
                un seul ✔ isolé entre deux ✘. Sur cette péniche,{' '}
                <strong>{gagnantesDepart.length} positions</strong> passent, de{' '}
                {fr(gagnantesDepart[0])} m à {fr(gagnantesDepart.at(-1))} m, et elles se suivent
                toutes de cran en cran.
              </Feedback>
              <KnowledgeBrick
                id="signe-change-aux-racines"
                variant="new"
                lead={<>Pourquoi les ✔ ne peuvent pas être éparpillés.</>}
              />
            </>
          ) : (
            <Feedback tone="info">
              Essais faits : {essais1.filter((v) => penichePasse(v, DEPART.L, DEPART.H)).length} qui
              passent, {essais1.filter((v) => !penichePasse(v, DEPART.L, DEPART.H)).length} qui ne
              passent pas. Il t’en faut au moins deux de chaque.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Change la péniche',
      subtitle:
        'La bande verte apparaît maintenant : ce sont toutes les positions qui passent, d’un coup. Élargis la péniche, surélève-la — et regarde ce que la bande devient. Trouve un réglage où plus aucune position ne passe.',
      done: q2,
      content: (
        <div className="space-y-3">
          <PontLab
            p={p2} L={l2} H={h2}
            onChangeP={setP2} onChangeL={changerL} onChangeH={setH2}
            disabled={!done1}
          />
          <TapQuestion
            prompt="En changeant la largeur et la hauteur, qu’as-tu observé sur la bande verte ?"
            options={[
              'Elle reste toujours d’un seul tenant : elle rétrécit, se décale, disparaît — mais elle ne se coupe jamais en deux',
              'Elle se coupe en deux morceaux dès que la péniche est haute',
              'Elle change de place mais garde toujours la même largeur',
              'Elle apparaît par petits morceaux séparés quand la péniche est large',
            ]}
            correct={0}
            cols={1}
            requires={['signe-change-aux-racines']}
            explain="Quelle que soit la péniche, la bande est un SEUL intervalle — parfois large, parfois réduit à quelques crans, parfois vide, jamais coupé en deux. Élargir ou surélever ne fait que la rétrécir par les deux bouts à la fois."
            explainWrong="Reprends une largeur de 5 m et une hauteur de 2,5 m : la bande est vide, elle a disparu d’un coup. Puis redescends la hauteur cran par cran : elle réapparaît d’un seul tenant, au milieu, et s’élargit — elle ne se reconstitue jamais par morceaux."
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
          {q2 && (
            <>
              <Feedback tone="ok">
                Et la bande est toujours <strong>au milieu</strong>, jamais aux deux bords. C’est
                l’arche qui le décide : elle est en l’air <em>entre</em> ses deux pieds, et dans
                l’eau au-delà. Une courbe tournée vers le bas ne laisse de place qu’au centre.
              </Feedback>
              <KnowledgeBrick
                id="bande-entre-les-racines"
                variant="new"
                lead={<>Ce que l’orientation de l’arche impose à la bande.</>}
              />
            </>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Où s’arrête la bande ?',
      done: q3,
      content: (
        <div className="space-y-3">
          <PontLab
            p={p2} L={l2} H={h2}
            onChangeP={setP2} onChangeL={changerL} onChangeH={setH2}
            disabled={!done1}
          />
          <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4 text-sm text-indigo-900">
            Remets la péniche de départ : <strong>largeur {fr(DEPART.L)} m</strong>,{' '}
            <strong>hauteur {fr(DEPART.H)} m</strong>. Sa bande va de{' '}
            {fr(bandeDepart.from)} à {fr(bandeDepart.to)}. Regarde ce qui se passe à ces deux
            positions exactement.
          </div>
          <NumericQuestion
            prompt={
              <>
                À la position <strong>{fr(bandeDepart.to)} m</strong>, la péniche passe-t-elle ?
                Réponds par la hauteur de l’arche, en mètres, au-dessus de son coin droit.
              </>
            }
            expected={DEPART.H}
            parse={parseSigned}
            display={fr(DEPART.H)}
            requires={['bande-entre-les-racines']}
            explain={`À la position ${fr(bandeDepart.to)}, le coin droit est en ${fr(bandeDepart.to + DEPART.L / 2)}, et l’arche y monte à exactement ${fr(DEPART.H)} m — la hauteur de la péniche. Le coin ne passe pas SOUS l’arche : il la touche. La péniche frotte, elle ne passe pas. C’est pour cela que la bande s’arrête pile là.`}
            explainFor={(n) =>
              n === 0
                ? 'Zéro est la hauteur de l’arche à ses pieds, en −3 et en 3. Le coin droit n’y est pas : il est en 2, où l’arche est encore bien en l’air.'
                : n === 4.5
                ? 'C’est la hauteur maximale de l’arche, au milieu. Le coin droit n’est pas au milieu : il est en 2, où l’arche a déjà bien redescendu.'
                : null
            }
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
          {q3 && (
            <Feedback tone="ok">
              Les deux bouts de la bande sont donc les deux positions où un coin{' '}
              <strong>touche exactement</strong> l’arche. De part et d’autre, un coin est dessous
              ou dedans — et il n’y a rien entre les deux. C’est ce qui rend la bande d’un seul
              tenant : le basculement n’a que <strong>deux endroits possibles</strong> pour se
              produire.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 4,
      title: 'Comment la prévoir sans essayer ?',
      done: q4,
      content: (
        <div className="space-y-3">
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
            Tu as trouvé la bande en essayant des positions une par une. Un batelier n’a pas ce
            luxe : il connaît la largeur et la hauteur de sa péniche, et l’équation de l’arche
            — <span className="font-mono font-bold">y = {fr(PONT.a)}x² + {fr(PONT.k)}</span> —
            et il veut savoir, <strong>avant de partir</strong>, s’il passe et où.
          </div>
          <TapQuestion
            prompt="Que faudrait-il savoir calculer pour trouver la bande sans essayer une seule position ?"
            options={[
              'Où l’expression « hauteur de l’arche moins hauteur de la péniche » est positive, et où elle ne l’est plus',
              'La valeur maximale de l’arche, qui suffirait à tout décider',
              'La longueur totale de la péniche, en additionnant sa largeur et sa hauteur',
              'Le nombre de positions possibles, en comptant les crans',
            ]}
            correct={0}
            cols={1}
            requires={['signe-change-aux-racines', 'bande-entre-les-racines']}
            explain="Un coin passe quand l’arche est PLUS HAUTE que la péniche au-dessus de lui, c’est-à-dire quand la différence « arche − hauteur » est positive. La bande est donc l’ensemble des endroits où une certaine expression est positive — et cette expression est du second degré. Le module suivant apprend à décider de son signe sans en calculer une seule valeur."
            explainWrong="La hauteur maximale ne suffit pas : elle dit seulement si la péniche pourrait passer AU MILIEU, pas jusqu’où elle peut se décaler. Et compter les crans revient à essayer une par une, ce qu’on cherche justement à éviter."
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
      moduleTitle="Le pont et la péniche"
      moduleSubtitle="Une arche qui ne bouge pas, une péniche qui cherche son passage"
      estimatedTime="10 min"
      brief={{
        tag: 'Déclencheur',
        title: 'Où passe-t-elle, et où ne passe-t-elle pas ?',
        tone: 'indigo',
        body: (
          <p>
            Une arche de pont, une péniche à faire passer dessous. Les positions qui marchent
            forment-elles un bloc, ou des morceaux éparpillés ? Essaie — puis cherche comment le
            prévoir sans essayer.
          </p>
        ),
      }}
      steps={steps}
      footer={
        <KnowledgeSnapshot moduleNumber={1}>
          <strong>Le mot juste.</strong> La bande est l’ensemble des endroits où une expression du
          second degré est positive. Décider de ce signe sans le calculer : module suivant.
        </KnowledgeSnapshot>
      }
    />
  );
}
