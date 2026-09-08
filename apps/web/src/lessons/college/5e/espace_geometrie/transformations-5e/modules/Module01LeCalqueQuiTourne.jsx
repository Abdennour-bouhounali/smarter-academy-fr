import React, { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick, PredictionChips } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import DemiTourLab, { useDemiTourAnime } from '../components/DemiTourLab';
import { DRAPEAU, placer } from '../components/transformations';

/**
 * Module 1 — DÉCLENCHEUR : le calque qui tourne.
 *
 * §6bis — la leçon OUVRE sur la manipulation : l'étape 1 rend le laboratoire,
 * pas une définition ni une question de prédiction bloquante. L'élève plante
 * une punaise, traîne la figure d'un demi-tour, et voit où elle atterrit.
 *
 * L'expérience surprenante : quand on déplace la punaise, TOUTE la figure
 * image saute ailleurs — alors que la figure de départ, elle, n'a pas bougé
 * d'un millimètre. Le centre décide donc à lui seul de l'endroit où la figure
 * arrive. C'est cela qui fait chercher « où exactement ? » au module 2.
 *
 * Expected observation : « la figure arrive à l'envers, de l'autre côté de la
 * punaise, et elle garde exactement la même taille ».
 * Misconception targeted : croire que le demi-tour est un pliage (donc un
 * effet miroir), ou qu'il déforme la figure.
 */
const FIG = placer(DRAPEAU, { x: 150, y: 400 });

export default function Module01LeCalqueQuiTourne() {
  const [centre, setCentre] = useState({ x: 400, y: 268 });
  const [angle, setAngle] = useState(0);
  const [vuDemiTour, setVuDemiTour] = useState(false);
  const [centresEssayes, setCentresEssayes] = useState([]);
  const [pred, setPred] = useState(null);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);

  const animer = useDemiTourAnime((a) => {
    setAngle(a);
    if (a >= 179.5) setVuDemiTour(true);
  });

  const poserCentre = (c, react) => {
    setCentre(c);
    if (angle >= 179.5) {
      // Chaque punaise essayée APRÈS un demi-tour compte comme une
      // observation : c'est en la déplaçant que l'élève voit l'image sauter.
      setCentresEssayes((prev) => {
        const next = prev.length && Math.hypot(prev[prev.length - 1].x - c.x, prev[prev.length - 1].y - c.y) < 45
          ? prev
          : [...prev, c];
        if (next.length === 3 && prev.length < 3) react?.(true);
        return next;
      });
    }
  };

  const assezDeCentres = centresEssayes.length >= 3;

  const steps = [
    {
      num: 1,
      title: 'Fais faire un demi-tour à la figure',
      subtitle: 'La punaise rouge est le pivot. Traîne la pastille violette jusqu’au bout du tour.',
      done: vuDemiTour,
      content: (kit) => (
        <div className="space-y-3">
          <DemiTourLab
            figure={FIG}
            centre={centre}
            onCentre={(c) => poserCentre(c, kit.react)}
            angle={angle}
            onAngle={(a) => { setAngle(a); if (a >= 179.5 && !vuDemiTour) { setVuDemiTour(true); kit.react?.(true); } }}
            nomsSommets={['A', 'B', 'C', 'D', 'E']}
            ariaLabel="Un drapeau qu’on fait tourner d’un demi-tour autour d’une punaise"
          />
          <div className="flex flex-wrap gap-2 justify-center">
            <button
              type="button"
              onClick={() => animer(angle)}
              className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-bold text-white hover:bg-violet-700 transition"
            >
              ▶ Faire le demi-tour en entier
            </button>
            <button
              type="button"
              onClick={() => setAngle(0)}
              className="rounded-xl border-2 border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 hover:border-slate-300 transition"
            >
              ↺ Remettre à plat
            </button>
          </div>
          {!vuDemiTour ? (
            <>
              {/* §6ter.3 — une prédiction se recueille SANS verdict : elle
                  engage le regard, elle ne note rien. */}
              <PredictionChips
                prompt="avant de lancer : où la figure va-t-elle arriver, à ton avis ?"
                options={[
                  { id: 'autre', label: 'De l’autre côté de la punaise' },
                  { id: 'cote', label: 'Juste à côté, du même côté' },
                  { id: 'rien', label: 'Elle ne bougera pas' },
                ]}
                value={pred}
                onChange={setPred}
              />
              <Feedback tone="info">
                Traîne la pastille violette, ou appuie sur le bouton : la figure tourne autour de la
                punaise comme un calque autour d’une aiguille.
              </Feedback>
            </>
          ) : (
            <Feedback tone="ok">
              {pred === 'autre' ? 'Ta prédiction était la bonne' : 'Regarde bien'} : la figure est
              arrivée <strong>de l’autre côté de la punaise</strong>, à l’envers — et exactement de
              la même taille. Rien n’a été écrasé ni agrandi.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Déplace la punaise',
      subtitle: 'Le demi-tour est fait. Change la punaise de place, trois fois, et regarde l’image.',
      done: assezDeCentres,
      content: (
        <div className="space-y-3">
          <div className="rounded-xl border-2 border-violet-200 bg-violet-50 p-3.5 text-sm text-slate-700">
            La figure grise, elle, ne bouge pas. Seule la punaise change de place. Regarde bien où
            atterrit la figure violette à chaque fois.
          </div>
          {assezDeCentres ? (
            <Feedback tone="ok">
              <strong>La punaise décide de tout.</strong> Elle ne change ni la forme, ni la taille
              de l’image — seulement l’endroit où celle-ci se pose. Une figure de départ et une
              punaise suffisent donc à savoir exactement où la figure va arriver.
            </Feedback>
          ) : (
            <Feedback tone="info">
              Punaises essayées : <strong>{centresEssayes.length}</strong> sur 3. Reviens au
              laboratoire ci-dessus et fais glisser la punaise rouge.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Ce que tu viens de faire porte un nom',
      done: q2,
      content: (
        <div className="space-y-3">
          {/* La brique n'arrive qu'ICI : le mot nomme un geste déjà fait
              plusieurs fois, il ne l'annonce pas. */}
          <KnowledgeBrick
            id="symetrie-centrale"
            variant="new"
            lead={<>Tu viens de faire tourner une figure d’un demi-tour autour d’un point, et de voir que ce point décide seul de l’arrivée. Ce geste porte un nom.</>}
          />
          <TapQuestion
            prompt="Dans une symétrie centrale, de combien tourne la figure ?"
            options={['D’un demi-tour, soit 180°', 'D’un quart de tour, soit 90°', 'D’un tour complet, soit 360°']}
            correct={0}
            cols={3}
            requires={['symetrie-centrale']}
            explain="Un demi-tour, c’est la moitié d’un tour complet : 360° ÷ 2 = 180°."
            explainWrong="Un tour complet (360°) ramènerait la figure exactement sur elle-même : on ne verrait aucun changement. C’est bien un DEMI-tour, 180°, qui l’envoie de l’autre côté du centre."
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
        </div>
      ),
    },
    {
      num: 4,
      title: 'Une question qui reste ouverte',
      done: q3,
      content: (
        <div className="space-y-3">
          <TapQuestion
            prompt="Le point A est à 5 cm de la punaise O. À quelle distance de O son image A’ se trouve-t-elle ?"
            options={['À 5 cm aussi', 'À 10 cm', 'Cela dépend de la figure']}
            correct={0}
            cols={3}
            requires={['symetrie-centrale']}
            explain="Le calque tourne autour de la punaise : un point ne s’en éloigne ni ne s’en rapproche pendant la rotation. A’ reste donc à 5 cm de O."
            explainWrong="Pense au calque : en tournant autour de l’aiguille, un point décrit un cercle. Il reste donc TOUJOURS à la même distance du centre — ici 5 cm."
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
          {q3 && (
            <Feedback tone="info">
              Donc A et A’ sont à la même distance de O, et de part et d’autre. Cela ressemble
              beaucoup à quelque chose que tu connais déjà… <strong>Le module suivant va le
              nommer</strong>, et en faire une règle de construction.
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
      moduleTitle="Le calque qui tourne"
      moduleSubtitle="Un demi-tour autour d’une punaise"
      estimatedTime="11 min"
      brief={{
        tag: 'Déclencheur',
        title: 'Une punaise, un calque, un demi-tour',
        tone: 'violet',
        body: (
          <p>
            Pose une punaise n’importe où sur la feuille, fais tourner le calque d’un{' '}
            <strong>demi-tour</strong> autour d’elle, et regarde où la figure atterrit. Tu n’as
            aucune règle à connaître pour cela : il suffit de tourner.
          </p>
        ),
      }}
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={1} />}
    />
  );
}
