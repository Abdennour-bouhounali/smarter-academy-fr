import React, { useState } from 'react';
import { MoveHorizontal, Ruler } from 'lucide-react';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import ObservatoireLab from '../components/ObservatoireLab';
import {
  serie, remplacerValeur, etendue, extremes,
  VILLE_ABRITEE, VILLE_EXPOSEE, avecUnite,
} from '../components/stats4e';

/**
 * Module 4 — MANIPULATION : l'étendue, et ce qu'elle ignore.
 *
 * Activity              déplacer une valeur INTÉRIEURE d'une série (rien ne
 *                       bouge), puis une valeur EXTRÊME (tout bouge).
 * Mathematical objective l'étendue est la différence entre la plus grande et
 *                       la plus petite valeur. Elle ne regarde que les deux
 *                       bouts — ce qui la rend utile ET limitée.
 * Student action        glisser une pastille, dans les deux configurations.
 * Controlled variable   la valeur d'un individu ; les autres ne bougent pas.
 * Mathematical state    la série ; l'étendue en est DÉRIVÉE par le noyau.
 * Visual consequence    la barre bleue sous l'axe s'allonge — ou refuse de
 *                       bouger.
 * Expected observation  « je déplace la pastille de vingt crans et la barre
 *                       ne change pas d'un pixel ».
 * Misconception targeted confondre l'étendue et la valeur maximale : l'une est
 *                       une LONGUEUR, l'autre une POSITION.
 * Formalization         la brique `etendue` arrive à l'étape 3, une fois les
 *                       deux comportements observés.
 *
 * DIFFÉRENCE AVEC LE MODULE 1 : là-bas les trois cadres étaient montrés
 * ENSEMBLE et l'on constatait qu'ils divergent ; ici un seul est à l'écran, et
 * on cherche EXACTEMENT ce qui le fait bouger. Le module 1 ouvrait la
 * question, celui-ci la ferme.
 */

/* Un relevé de températures sur une semaine — encore un autre décor. La
   valeur intérieure qu'on déplace (mercredi) est loin des deux bouts, si bien
   que TOUT son domaine laisse l'étendue inchangée : c'est vérifié par
   balayage dans `parcours.test.js`, pas supposé. */
const SEMAINE = serie({
  id: 'semaine',
  nom: 'Températures de midi',
  unite: '°C',
  items: [
    { libelle: 'lundi', valeur: 9 },
    { libelle: 'mardi', valeur: 14 },
    { libelle: 'mercredi', valeur: 16 },
    { libelle: 'jeudi', valeur: 18 },
    { libelle: 'vendredi', valeur: 21 },
    { libelle: 'samedi', valeur: 23 },
    { libelle: 'dimanche', valeur: 27 },
  ],
});
const AXE_SEMAINE = { min: 0, max: 40, pas: 5 };
const INDICE_INTERIEUR = 2;  // mercredi, 16 °C : bien à l'intérieur
const DOMAINE_INTERIEUR = { min: 10, max: 26, pas: 1 };
const INDICE_EXTREME = 6;    // dimanche, 27 °C : le maximum
const DOMAINE_EXTREME = { min: 27, max: 38, pas: 1 };

export default function Module04DuPlusPetitAuPlusGrand() {
  const [serieInterieur, setSerieInterieur] = useState(SEMAINE);
  const [serieExtreme, setSerieExtreme] = useState(SEMAINE);
  const [vusInt, setVusInt] = useState([]);
  const [vusExt, setVusExt] = useState([]);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);
  const [q5, setQ5] = useState(false);

  const bouger = (i, poserSerie, poserVus) => (v) => {
    poserSerie((s) => remplacerValeur(s, i, v));
    poserVus((vus) => (vus.includes(v) ? vus : [...vus, v]));
  };

  const ex = extremes(SEMAINE);
  const et0 = etendue(SEMAINE);
  const etExtreme = etendue(serieExtreme);

  const done1 = vusInt.length >= 4;
  const done2 = vusExt.length >= 3 && vusExt.some((v) => v >= 33);

  const steps = [
    {
      num: 1,
      title: 'Déplace mercredi, autant que tu veux',
      subtitle: 'Une semaine de températures. Surveille la barre bleue sous l’axe.',
      done: done1,
      content: (
        <div className="space-y-3">
          <p className="text-sm text-slate-700">
            Sept relevés de température. La <strong>barre bleue</strong>, sous l’axe, va d’un bout
            à l’autre du relevé. Tire la pastille de mercredi d’un côté puis de l’autre.
          </p>
          <ObservatoireLab
            serie={serieInterieur}
            serieInitiale={SEMAINE}
            indice={INDICE_INTERIEUR}
            domaine={DOMAINE_INTERIEUR}
            axe={AXE_SEMAINE}
            onValeur={bouger(INDICE_INTERIEUR, setSerieInterieur, setVusInt)}
            reperesVisibles={['etendue']}
            titreAxe="degrés Celsius"
          />
          {done1 && (
            <Feedback tone="ok">
              Quatre positions différentes, et la barre bleue n’a pas bougé d’un pixel : elle vaut
              toujours {avecUnite(et0, SEMAINE.unite)}. Pourtant mercredi, lui, a bien changé.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Maintenant, déplace dimanche',
      subtitle: 'C’est le jour le plus chaud de la semaine. Même geste, autre pastille.',
      done: done2,
      content: (
        <div className="space-y-3">
          <p className="text-sm text-slate-700">
            Dimanche est à {avecUnite(ex.max, SEMAINE.unite)}, c’est le maximum du relevé.
            Pousse-le encore plus haut.
          </p>
          <ObservatoireLab
            serie={serieExtreme}
            serieInitiale={SEMAINE}
            indice={INDICE_EXTREME}
            domaine={DOMAINE_EXTREME}
            axe={AXE_SEMAINE}
            onValeur={bouger(INDICE_EXTREME, setSerieExtreme, setVusExt)}
            reperesVisibles={['etendue']}
            titreAxe="degrés Celsius"
          />
          {done2 && (
            <Feedback tone="ok">
              Cette fois la barre s’allonge à chaque cran : elle est passée de{' '}
              {avecUnite(et0, SEMAINE.unite)} à {avecUnite(etExtreme, SEMAINE.unite)}. Elle ne
              réagit donc qu’à une chose : les <strong>deux bouts</strong>.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Comment calcule-t-on cette longueur ?',
      done: q3,
      content: (
        <div className="space-y-3">
          <p className="text-sm text-slate-700">
            Sur le relevé de départ, le jour le plus froid est à{' '}
            {avecUnite(ex.min, SEMAINE.unite)} et le plus chaud à{' '}
            {avecUnite(ex.max, SEMAINE.unite)}.
          </p>
          <NumericQuestion
            prompt="Quelle est la longueur de la barre bleue, en degrés ?"
            expected={et0}
            suffix={SEMAINE.unite}
            requires={['indicateur-stat', 'serie-donnees']}
            explain={`${ex.max} − ${ex.min} = ${et0} °C. On soustrait la plus petite valeur de la plus grande : c’est une LONGUEUR, la distance entre les deux bouts.`}
            explainFor={(n) => {
              if (n === ex.max) return `${ex.max} °C est la plus grande VALEUR, une position sur l’axe. La longueur de la barre est la différence entre les deux bouts : ${ex.max} − ${ex.min}.`;
              if (n === ex.min) return `${ex.min} °C est la plus petite valeur. Ce qu’on cherche est l’écart entre les deux bouts : ${ex.max} − ${ex.min}.`;
              if (n === ex.max + ex.min) return `${ex.max + ex.min} est la SOMME des deux extrêmes. La barre mesure leur DIFFÉRENCE : ${ex.max} − ${ex.min}.`;
              return null;
            }}
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
          {q3 && (
            <KnowledgeBrick
              id="etendue"
              variant="new"
              lead="La longueur que tu viens de mesurer a un nom."
            />
          )}
        </div>
      ),
    },
    {
      num: 4,
      title: 'Ce qu’elle voit, et ce qu’elle ne voit pas',
      done: q4,
      content: (
        <div className="space-y-3">
          <TapQuestion
            prompt="Deux séries ont exactement la même étendue. Que peut-on en déduire ?"
            options={[
              'Rien de plus : leurs valeurs peuvent être réparties très différemment',
              'Elles ont les mêmes valeurs',
              'Elles ont la même moyenne',
              'Elles ont le même effectif',
            ]}
            correct={0}
            cols={1}
            requires={['etendue', 'indicateur-stat']}
            explain="L’étendue ne regarde que les deux bouts. Entre eux, les valeurs peuvent être toutes entassées d’un côté ou parfaitement réparties : elle n’en dit rien du tout."
            solved={q4}
            onAnswered={() => setQ4(true)}
          />
        </div>
      ),
    },
    {
      num: 5,
      title: 'Deux villes, deux étendues',
      done: q5,
      content: (
        <div className="space-y-3">
          <p className="text-sm text-slate-700">
            À {VILLE_ABRITEE.nom}, les températures de midi vont de{' '}
            {avecUnite(extremes(VILLE_ABRITEE).min, VILLE_ABRITEE.unite)} à{' '}
            {avecUnite(extremes(VILLE_ABRITEE).max, VILLE_ABRITEE.unite)}. À{' '}
            {VILLE_EXPOSEE.nom}, de {avecUnite(extremes(VILLE_EXPOSEE).min, VILLE_EXPOSEE.unite)} à{' '}
            {avecUnite(extremes(VILLE_EXPOSEE).max, VILLE_EXPOSEE.unite)}.
          </p>
          <NumericQuestion
            prompt={`Quelle est l’étendue des températures à ${VILLE_EXPOSEE.nom} ?`}
            expected={etendue(VILLE_EXPOSEE)}
            suffix={VILLE_EXPOSEE.unite}
            requires={['etendue']}
            explain={`${extremes(VILLE_EXPOSEE).max} − ${extremes(VILLE_EXPOSEE).min} = ${etendue(VILLE_EXPOSEE)} °C, contre ${etendue(VILLE_ABRITEE)} °C seulement à ${VILLE_ABRITEE.nom}. Les deux villes n’ont pas du tout le même climat.`}
            solved={q5}
            onAnswered={() => setQ5(true)}
          />
          {q5 && (
            <Feedback tone="info">
              Tu disposes maintenant des trois nombres de l’observatoire. La vraie question
              commence : quand deux séries ne se laissent pas départager par l’un d’eux, que
              faire ? C’est le module suivant.
            </Feedback>
          )}
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(4)}
      moduleNumber={4}
      moduleTitle="Du plus petit au plus grand"
      moduleSubtitle="Le nombre qui ne regarde que les deux bouts"
      estimatedTime="8 min"
      brief={{
        tag: '🎬 Mission 04',
        title: 'Une semaine de températures',
        tone: 'indigo',
        body: (
          <>
            Il reste un cadre de l’observatoire à comprendre : celui qui bougeait quand Soline
            partait loin, et pas quand Lise se déplaçait.{' '}
            <strong>Qu’est-ce qui le fait réagir, exactement ?</strong>
          </>
        ),
      }}
      intro={
        <div className="flex items-start gap-3 rounded-2xl border border-sky-100 bg-sky-50/60 p-3.5">
          <MoveHorizontal className="mt-0.5 h-5 w-5 shrink-0 text-sky-600" aria-hidden="true" />
          <p className="text-sm text-sky-900">
            Une seule barre bleue à surveiller, sous l’axe.{' '}
            <Ruler className="inline h-4 w-4" aria-hidden="true" /> Deux pastilles à déplacer, et
            deux réactions qui n’ont rien à voir.
          </p>
        </div>
      }
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={4} />}
    />
  );
}
