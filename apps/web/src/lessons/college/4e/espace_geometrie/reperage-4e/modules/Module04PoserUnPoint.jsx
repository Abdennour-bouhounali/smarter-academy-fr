import React, { useState } from 'react';
import { MapPin } from 'lucide-react';
import { ContentModule, NumericQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { parseDec } from '@smarter-academy/core';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import PlacementLab from '../components/PlacementLab';
import {
  REPERE_PLACEMENT, CIBLES_PLACEMENT, memePoint, placer, couple, fr,
} from '../components/reperage4e';

/**
 * Module 4 — MANIPULATION : poser un point quand le pas n'est pas 1.
 *
 * Activity              amener un point mobile sur trois cibles successives,
 *                       annoncées par leurs coordonnées, dans un repère de
 *                       pas 0,5.
 * Mathematical objective placer est l'opération INVERSE de lire : on divise
 *                       la coordonnée par le pas pour savoir combien de
 *                       graduations compter.
 * Student action        glisser le point (ou flèches) jusqu'à la cible.
 * Controlled variable   la position du point mobile.
 * Mathematical state    le couple courant, comparé à la cible par `memePoint`.
 * Visual consequence    la cible s'allume, le panneau passe au vert.
 * Expected observation  « pour aller à 1,5 avec un pas de 0,5, je compte trois
 *                       graduations, pas une et demie ».
 * Misconception targeted compter autant de graduations que d'unités — l'élève
 *                       avance de « une graduation et demie » et tombe à 0,75.
 *
 * ATTEIGNABILITÉ. Les trois cibles sont des multiples exacts du pas : elles
 * tombent sur des nœuds RÉELLEMENT dessinés, et le geste peut donc les
 * satisfaire. Le test de parcours le vérifie pour chacune — une cible
 * inatteignable ferait chercher l'élève indéfiniment.
 *
 * REJOUABLE : aucun `disabled` lié à l'avancement. Une cible atteinte reste
 * manipulable, et l'élève peut repartir.
 */
const DEPART = { x: 0, y: 0, nom: 'M' };

export default function Module04PoserUnPoint() {
  const [point, setPoint] = useState(DEPART);
  const [atteintes, setAtteintes] = useState([]);
  const [q2, setQ2] = useState(false);

  // La cible courante : la première qui n'est pas encore atteinte.
  const index = Math.min(atteintes.length, CIBLES_PLACEMENT.length - 1);
  const cible = CIBLES_PLACEMENT[index];
  const toutesFaites = atteintes.length >= CIBLES_PLACEMENT.length;

  const bouger = (p) => {
    const pose = placer(p, REPERE_PLACEMENT);
    setPoint({ ...p, ...pose });
    // Le passage à la cible suivante est un EFFET du geste, pas d'un bouton :
    // atteindre la cible EST la validation.
    if (!toutesFaites && memePoint(pose, cible, 1e-9) && !atteintes.includes(cible.id)) {
      setAtteintes((a) => [...a, cible.id]);
    }
  };

  const steps = [
    {
      num: 1,
      title: 'Trois points à poser',
      subtitle: `Une graduation vaut ${fr(REPERE_PLACEMENT.xStep, 2)} sur les deux axes. Amène le point sur chaque cible.`,
      done: toutesFaites,
      content: (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {CIBLES_PLACEMENT.map((c, i) => {
              const fait = atteintes.includes(c.id);
              const courante = !toutesFaites && i === index;
              return (
                <div
                  key={c.id}
                  className={`rounded-xl border-2 px-3 py-2 text-sm font-bold tabular-nums ${
                    fait
                      ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                      : courante
                        ? 'border-amber-400 bg-amber-50 text-amber-900'
                        : 'border-slate-200 bg-white text-slate-400'
                  }`}
                >
                  {c.nom} {couple(c, 1)} {fait ? '✓' : ''}
                </div>
              );
            })}
          </div>

          <PlacementLab
            repere={REPERE_PLACEMENT}
            point={point}
            onPoint={bouger}
            cible={toutesFaites ? null : cible}
            ariaLabel="Placer un point dans un repère de pas un demi"
          />

          {!toutesFaites && (
            <Feedback tone="info">
              Pour aller à {couple(cible, 1)} : divise chaque coordonnée par{' '}
              {fr(REPERE_PLACEMENT.xStep, 2)} pour savoir combien de graduations compter.
            </Feedback>
          )}
          {toutesFaites && (
            <Feedback tone="ok">
              Les trois points sont posés. À chaque fois, le nombre de graduations valait le
              double de la coordonnée — parce qu’une graduation vaut la moitié d’une unité.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Combien de graduations ?',
      done: q2,
      content: (
        <div className="space-y-3">
          <p className="text-sm text-slate-700">
            Sur un axe dont une graduation vaut <strong>0,2</strong>, tu veux poser un point
            d’abscisse <strong>1,4</strong>.
          </p>
          <NumericQuestion
            prompt="Combien de graduations dois-tu compter depuis l’origine ?"
            expected={7}
            parse={parseDec}
            requires={['coordonnee-decimale', 'echelle-graduation']}
            explain="On divise la coordonnée par le pas : 1,4 ÷ 0,2 = 7 graduations."
            explainFor={(n) => {
              if (n === 1.4) return 'Tu as repris la coordonnée telle quelle. Ce serait le nombre de graduations si une graduation valait 1 — ici elle en vaut 0,2.';
              if (n === 0.28) return 'Tu as multiplié au lieu de diviser. Multiplier sert à LIRE ; pour POSER, on divise.';
              if (n === 14) return 'Presque : tu as divisé par 0,1 et non par 0,2. Chaque graduation vaut deux dixièmes.';
              return null;
            }}
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
          {q2 && (
            <KnowledgeBrick
              id="placer-pas-non-unitaire"
              variant="new"
              lead="Lire multipliait ; poser divise. Voilà les deux sens de la même relation."
            />
          )}
          {q2 && (
            <Feedback tone="info">
              Tu sais lire et poser dans n’importe quel repère. Il reste à s’en servir pour
              répondre à une question de figure — c’est le module suivant.
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
      moduleTitle="Poser un point"
      moduleSubtitle="Quand une graduation ne vaut pas 1"
      estimatedTime="7 min"
      brief={{
        tag: '🎬 Mission 04',
        title: 'Aller à 1,5 sans se tromper',
        tone: 'indigo',
        body: (
          <>
            Une graduation vaut 0,5. Pour atteindre l’abscisse 1,5, faut-il avancer d’une
            graduation et demie ? <strong>Essaie, et regarde où tu tombes.</strong>
          </>
        ),
      }}
      intro={
        <div className="flex items-start gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-3.5">
          <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" aria-hidden="true" />
          <p className="text-sm text-emerald-900">
            La cible est en orange. Le point se pose toujours sur une intersection de la grille :
            si tu n’arrives pas dessus, c’est le compte de graduations qu’il faut revoir.
          </p>
        </div>
      }
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={4} />}
    />
  );
}
