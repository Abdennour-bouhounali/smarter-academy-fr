import React, { useState } from 'react';
import { Telescope, Move } from 'lucide-react';
import { ContentModule, TapQuestion, PredictionChips, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import ObservatoireLab from '../components/ObservatoireLab';
import {
  TRAJETS, INDICE_ELOIGNE, DOMAINE_ELOIGNE, AXE_TRAJETS,
  remplacerValeur, indicateurs, valeurs, avecUnite, fr,
} from '../components/stats4e';

/**
 * Module 1 — DÉCLENCHEUR, et l'interaction SIGNATURE de la leçon.
 *
 * Activity              tirer UNE pastille sur un axe de douze trajets et
 *                       regarder lesquels des trois résumés la suivent, puis
 *                       recommencer avec une pastille du CENTRE.
 * Mathematical objective les trois résumés ne sont pas « plus ou moins
 *                       précis » : ils regardent des choses DIFFÉRENTES. La
 *                       preuve tient en deux gestes qui donnent deux réponses
 *                       opposées.
 * Student action        glisser une pastille, à la souris, au doigt ou aux
 *                       flèches.
 * Controlled variable   la valeur d'UN individu — les onze autres ne bougent
 *                       jamais.
 * Mathematical state    une série (objet `serie`) ; les trois résumés et les
 *                       trois écarts en sont DÉRIVÉS par le noyau.
 * Visual consequence    les repères de l'axe et les trois écarts se
 *                       réécrivent à chaque cran.
 * Expected observation  « le repère vert n'a pas bougé d'un millimètre alors
 *                       que j'ai tiré la pastille sur tout l'axe ».
 * Misconception targeted « la moyenne, c'est le milieu » — huit des douze
 *                       élèves sont sous la moyenne AVANT tout geste.
 * Feedback              on cite les nombres que l'élève vient de produire,
 *                       jamais un verdict seul.
 * Formalization         AUCUN des trois n'est calculé ni défini ici. Le mot
 *                       « moyenne » est un acquis de 5e ; « médiane » et
 *                       « étendue » appartiennent aux modules 3 et 4, et
 *                       n'apparaissent nulle part dans ce module.
 *
 * §6bis / règle M1 : l'étape 1 REND la manipulation ; la prédiction vit à
 * l'intérieur, comme une invitation, jamais comme un péage.
 *
 * CE QUE CE MODULE LAISSE AUX SUIVANTS : le calcul de la moyenne pondérée
 * (M2), celui de la valeur qui coupe en deux (M3), celui de l'écart des bouts
 * (M4), la comparaison de deux séries (M5–M6), le diagramme truqué (M7).
 */
export default function Module01LObservatoire() {
  /* ── DEUX SÉRIES INDÉPENDANTES, ET POURQUOI ────────────────────────
     Chaque geste part de la MÊME série de départ. Une seule série partagée
     par les deux laboratoires ferait que le cadre affiché (calculé sur la
     série courante) et l'écart annoncé (calculé depuis TRAJETS) ne parleraient
     plus du même état dès que l'élève revient à l'étape 1 : la figure
     contredirait le nombre. Deux états séparés rendent l'isolement de la
     variable EXACT — « une seule chose bouge » est vrai par construction, pas
     par discipline. */
  const [serieEloigne, setSerieEloigne] = useState(TRAJETS);
  const [serieCentre, setSerieCentre] = useState(TRAJETS);

  const DOMAINE_CENTRE = { min: 6, max: 22, pas: 1 };
  const INDICE_CENTRE = 6; // Lise, 13 min — au cœur du groupe

  const [pred, setPred] = useState(null);
  const [vusEloigne, setVusEloigne] = useState([]);
  const [vusCentre, setVusCentre] = useState([]);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);

  const bouger = (i, poserSerie, poserVus) => (v) => {
    poserSerie((s) => remplacerValeur(s, i, v));
    poserVus((vus) => (vus.includes(v) ? vus : [...vus, v]));
  };

  const indEloigne = indicateurs(serieEloigne);
  const indCentre = indicateurs(serieCentre);
  const initial = indicateurs(TRAJETS);
  const sousLaMoyenne = valeurs(TRAJETS).filter((v) => v < initial.moyenne).length;

  // L'étape est franchie quand l'élève a réellement BALAYÉ : au moins trois
  // positions distinctes, et une au moins vers l'extrémité du domaine.
  const done1 = vusEloigne.length >= 3 && vusEloigne.some((v) => v >= 70);
  const done2 = vusCentre.length >= 3;

  const labEloigne = (
    <ObservatoireLab
      serie={serieEloigne}
      serieInitiale={TRAJETS}
      indice={INDICE_ELOIGNE}
      domaine={DOMAINE_ELOIGNE}
      axe={AXE_TRAJETS}
      onValeur={bouger(INDICE_ELOIGNE, setSerieEloigne, setVusEloigne)}
    />
  );

  const labCentre = (
    <ObservatoireLab
      serie={serieCentre}
      serieInitiale={TRAJETS}
      indice={INDICE_CENTRE}
      domaine={DOMAINE_CENTRE}
      axe={AXE_TRAJETS}
      onValeur={bouger(INDICE_CENTRE, setSerieCentre, setVusCentre)}
    />
  );

  const steps = [
    {
      num: 1,
      title: 'Tire la pastille de Soline',
      subtitle: 'Elle est la seule à venir de loin. Emmène-la jusqu’au bout de l’axe et surveille les trois cadres du haut.',
      done: done1,
      content: (
        <div className="space-y-3">
          <p className="text-sm text-slate-700">
            Douze élèves, douze temps de trajet. Les trois cadres du haut résument la classe,
            chacun à sa façon. <strong>Tire la pastille rouge</strong> aussi loin que possible.
          </p>
          <PredictionChips
            prompt="Avant de tirer : si Soline déménage encore plus loin, lesquels des trois cadres vont bouger ?"
            options={[
              { id: 'tous', label: 'Les trois' },
              { id: 'deux', label: 'Deux seulement' },
              { id: 'un', label: 'Un seul' },
            ]}
            value={pred}
            onChange={setPred}
          />
          {labEloigne}
          {!done1 && vusEloigne.length > 0 && (
            <Feedback tone="info">
              {vusEloigne.length} position{vusEloigne.length > 1 ? 's' : ''} essayée{vusEloigne.length > 1 ? 's' : ''}.
              Continue jusqu’au bout de l’axe : c’est là que le contraste est le plus net.
            </Feedback>
          )}
          {done1 && (
            <Feedback tone="ok">
              Deux cadres sur trois ont bougé. Le cadre vert, lui, affiche toujours{' '}
              {avecUnite(indEloigne.mediane, TRAJETS.unite)} — exactement ce qu’il affichait au départ,
              alors que Soline a traversé tout l’axe.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Maintenant, tire une pastille du milieu',
      subtitle: 'Lise met 13 minutes, en plein cœur du groupe. Même geste, sur une autre pastille.',
      done: done2,
      content: (
        <div className="space-y-3">
          <p className="text-sm text-slate-700">
            Si un cadre « ne bougeait jamais », il ne servirait à rien. Déplace{' '}
            <strong>Lise</strong> et regarde ce qui se passe cette fois.
          </p>
          {labCentre}
          {done2 && (
            <Feedback tone="ok">
              Cette fois c’est l’inverse : le cadre vert bouge, et le cadre bleu — l’écart entre
              le plus petit et le plus grand — reste cloué à{' '}
              {avecUnite(indCentre.etendue, TRAJETS.unite)}. Les deux gestes n’ont pas donné la même
              réponse.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Qu’est-ce que cela prouve, exactement ?',
      done: q3,
      content: (
        <div className="space-y-3">
          <TapQuestion
            prompt="Un cadre reste immobile quand on déplace Soline, un autre quand on déplace Lise. Que faut-il en conclure ?"
            options={[
              'Ces trois nombres ne regardent pas la même chose',
              'Le cadre qui ne bouge pas est le plus fiable',
              'Le cadre qui bouge le plus est le plus précis',
              'Il faudrait davantage d’élèves pour conclure',
            ]}
            correct={0}
            cols={1}
            requires={['moyenne', 'serie-donnees']}
            explain="Aucun des trois n’est « meilleur » : chacun est aveugle là où un autre voit. Celui qui ignore Soline voit très bien Lise, et réciproquement. C’est la question posée qui décide lequel employer."
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
          {q3 && (
            <KnowledgeBrick
              id="indicateur-stat"
              variant="new"
              lead="Ce que tu viens de faire apparaître en deux gestes a un nom."
            />
          )}
        </div>
      ),
    },
    {
      num: 4,
      title: 'Et le partage égal, au fait ?',
      done: q4,
      content: (
        <div className="space-y-3">
          <p className="text-sm text-slate-700">
            Remets Soline à son trajet de départ ({avecUnite(TRAJETS.items[INDICE_ELOIGNE].valeur, TRAJETS.unite)}) et
            regarde le cadre orange : il affiche {avecUnite(initial.moyenne, TRAJETS.unite)}.
            Compte maintenant les pastilles qui sont à sa gauche.
          </p>
          {labEloigne}
          <TapQuestion
            prompt={`Sur ces douze trajets, la moyenne vaut ${fr(initial.moyenne)} min. Combien d’élèves sont EN DESSOUS de cette moyenne ?`}
            options={['6, forcément la moitié', `${sousLaMoyenne}`, '3', 'On ne peut pas le savoir']}
            correct={1}
            cols={4}
            requires={['moyenne', 'indicateur-stat']}
            explain={`${sousLaMoyenne} élèves sur 12 sont sous la moyenne, et non 6. La moyenne n’est PAS le milieu du groupe : le trajet de Soline, très à part, la tire vers le haut à lui tout seul. Le milieu du groupe, c’est un autre nombre — celui du cadre vert.`}
            solved={q4}
            onAnswered={() => setQ4(true)}
          />
          {q4 && (
            <Feedback tone="info">
              Il reste donc trois questions ouvertes : comment calcule-t-on ce cadre vert ? que
              fait-on quand toutes les valeurs ne comptent pas pareil ? et que dit vraiment le
              cadre bleu ? Les modules suivants y répondent, un par un.
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
      moduleTitle="L’observatoire"
      moduleSubtitle="Une donnée qu’on déplace, et trois nombres qui ne réagissent pas pareil"
      estimatedTime="11 min"
      brief={{
        tag: '🎬 Mission 01',
        title: 'Douze trajets, trois nombres',
        tone: 'indigo',
        body: (
          <>
            Le collège a relevé le temps de trajet de douze élèves. Trois nombres résument cette
            classe, et l’un d’eux est réputé « dire le milieu ».{' '}
            <strong>Déplace une seule donnée et regarde lesquels la suivent.</strong>
          </>
        ),
      }}
      intro={
        <div className="flex items-start gap-3 rounded-2xl border border-indigo-100 bg-indigo-50/60 p-3.5">
          <Telescope className="mt-0.5 h-5 w-5 shrink-0 text-indigo-600" aria-hidden="true" />
          <p className="text-sm text-indigo-900">
            Attrape une pastille et tire-la. <Move className="inline h-4 w-4" aria-hidden="true" />{' '}
            Les trois cadres du haut se réécrivent à chaque cran — et te disent, à chaque fois, de
            combien ils ont bougé.
          </p>
        </div>
      }
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={1} />}
    />
  );
}
