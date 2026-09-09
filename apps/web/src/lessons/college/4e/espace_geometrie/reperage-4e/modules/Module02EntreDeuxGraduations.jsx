import React, { useState } from 'react';
import { Eye } from 'lucide-react';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { useLabState } from '../../../../../common/hooks/useLabState';
import { parseDec } from '@smarter-academy/core';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import LectureLab from '../components/LectureLab';
import { lirePoint, couple, fr } from '../components/reperage4e';
import { LESSON_CONFIG } from '../lesson.config';

/**
 * Module 2 — DÉCOUVERTE : compter n'est pas lire.
 *
 * Activity              déplacer un point dans le repère RÉGLÉ AU MODULE 1 et
 *                       lire ce qu'il vaut.
 * Mathematical objective une coordonnée est un nombre de graduations
 *                       MULTIPLIÉ par le pas. Tant que le pas valait 1, les
 *                       deux nombres se confondaient.
 * Student action        glisser le point, ou le déplacer aux flèches.
 * Controlled variable   la position du point.
 * Mathematical state    le couple. Les deux lectures viennent de `lirePoint`.
 * Visual consequence    les deux panneaux affichent des nombres DIFFÉRENTS.
 * Expected observation  « 3 graduations, mais 1,5 ».
 * Misconception targeted compter les carreaux et annoncer le compte.
 *
 * CONTINUITÉ : le pas vertical est celui que l'élève a choisi au module 1
 * (`useLabState`, clé `temperatures`). Il lit donc DANS SON PROPRE REPÈRE —
 * c'est ce qui donne son sens au module. Si rien n'a été mémorisé (nouvelle
 * session, élève qui commence ici), 0,5 reprend la main : le module reste
 * entièrement jouable.
 */
const POINT_DEPART = { x: 1, y: 1.5, nom: 'M' };

export default function Module02EntreDeuxGraduations() {
  const memo = useLabState(LESSON_CONFIG.id, 'temperatures', { pasY: 0.5 });
  /* LE PAS REPRIS DU MODULE 1 — mais BORNÉ, et pour une raison mathématique.
     Le module fait lire un point posé entre deux graduations : il lui faut un
     pas STRICTEMENT inférieur à 1, sans quoi le point de départ (1 ; 1,5)
     serait inatteignable et la démonstration s'effondrerait. Un élève qui a
     quitté le module 1 sur un pas de 2 (l'un des mauvais choix) ne doit pas
     hériter d'un repère où la question n'a plus de sens. On retient donc son
     choix quand il est exploitable, et 0,5 sinon. */
  const PAS_UTILISABLES = [0.25, 0.5];
  const memorise = memo.value.pasY;
  const pas = PAS_UTILISABLES.includes(memorise) ? memorise : 0.5;

  const [point, setPoint] = useState(POINT_DEPART);
  const [vus, setVus] = useState([]);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);

  // Le repère de lecture : le pas retenu au module 1 sur les DEUX axes, pour
  // que la question porte sur le pas et non sur une dissymétrie des axes.
  const repere = { xMin: -3, xMax: 3, yMin: -2, yMax: 2, xStep: pas, yStep: pas };

  const l = lirePoint(point, repere);

  const noter = () => {
    const cle = `${l.x}|${l.y}`;
    if (vus.some((v) => v.cle === cle)) return;
    setVus((v) => [...v, { cle, texte: l.texte, gx: l.graduationsX, gy: l.graduationsY }]);
  };

  const done1 = vus.length >= 3;

  const lab = (
    <LectureLab
      repere={repere}
      point={point}
      onPoint={setPoint}
      ariaLabel="Lire un point entre les graduations"
    />
  );

  const steps = [
    {
      num: 1,
      title: 'Promène le point, et note trois positions',
      subtitle: `Une graduation vaut ${fr(pas, 2)}. Regarde les deux nombres affichés sous le repère.`,
      done: done1,
      content: (
        <div className="space-y-3">
          {lab}
          <button
            type="button"
            onClick={noter}
            className="min-h-[44px] w-full rounded-xl bg-violet-600 px-3 py-2 text-sm font-bold text-white hover:bg-violet-700"
          >
            Noter cette position
          </button>
          {vus.length > 0 && (
            <div className="overflow-x-auto rounded-xl border-2 border-slate-200 bg-white p-3">
              <table className="w-full text-sm tabular-nums">
                <thead>
                  <tr className="text-xs uppercase tracking-wide text-slate-400">
                    <th className="pb-1 text-left">position</th>
                    <th className="pb-1 text-right">graduations</th>
                    <th className="pb-1 text-right">coordonnées</th>
                  </tr>
                </thead>
                <tbody>
                  {vus.map((v, i) => (
                    <tr key={v.cle} className="border-t border-slate-100">
                      <td className="py-1 text-slate-500">n° {i + 1}</td>
                      <td className="py-1 text-right font-mono text-slate-600">
                        {fr(v.gx, 2)} · {fr(v.gy, 2)}
                      </td>
                      <td className="py-1 text-right font-mono font-bold text-slate-900">{v.texte}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {done1 && (
            <Feedback tone="ok">
              Les deux colonnes ne donnent jamais les mêmes nombres. Le compte de graduations
              n’est pas la coordonnée.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Le lien entre les deux',
      done: q2,
      content: (
        <div className="space-y-3">
          {lab}
          <TapQuestion
            prompt={`Une graduation vaut ${fr(pas, 2)}. Comment passe-t-on du nombre de graduations à la coordonnée ?`}
            options={[
              `On multiplie le nombre de graduations par ${fr(pas, 2)}`,
              `On ajoute ${fr(pas, 2)} au nombre de graduations`,
              'Les deux nombres sont toujours égaux',
              `On divise le nombre de graduations par ${fr(pas, 2)}`,
            ]}
            correct={0}
            cols={1}
            requires={['echelle-graduation', 'lire-un-point']}
            explain={`Chaque graduation franchie ajoute ${fr(pas, 2)}. Trois graduations valent donc 3 × ${fr(pas, 2)}, et non 3.`}
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
          {q2 && (
            <KnowledgeBrick
              id="coordonnee-decimale"
              variant="new"
              lead="Ce que tu viens de voir change la lecture d’un point dès que le pas n’est plus 1."
            />
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'À toi de lire',
      done: q3,
      content: (
        <div className="space-y-3">
          <p className="text-sm text-slate-700">
            Sur un axe dont une graduation vaut 0,5, un point est posé{' '}
            <strong>7 graduations</strong> à droite de l’origine.
          </p>
          <NumericQuestion
            prompt="Quelle est son abscisse ?"
            expected={3.5}
            parse={parseDec}
            requires={['coordonnee-decimale']}
            explain="7 graduations de 0,5 : 7 × 0,5 = 3,5."
            explainFor={(n) => {
              if (n === 7) return 'Tu as donné le nombre de GRADUATIONS, pas la coordonnée. Chaque graduation ne vaut que 0,5.';
              if (n === 14) return 'Tu as divisé par 0,5 au lieu de multiplier. Sept petits pas de 0,5 font 3,5, pas 14.';
              if (n === 7.5) return 'Tu as ajouté 0,5 à 7. Il faut multiplier : 7 × 0,5.';
              return null;
            }}
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
          {q3 && (
            <Feedback tone="info">
              Retiens le réflexe : avant de lire un point, regarde ce que vaut une graduation.
              Au module suivant, c’est toi qui décideras de ce qu’elle vaut — sur de tout autres
              nombres.
            </Feedback>
          )}
          {q3 && (
            <div className="rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
              Ton point est en <span className="font-mono font-bold">{couple(point, 2)}</span>, à{' '}
              {fr(l.graduationsX, 2)} graduations du bord gauche.
            </div>
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
      moduleTitle="Entre deux graduations"
      moduleSubtitle="Compter les traits ne suffit plus"
      estimatedTime="6 min"
      brief={{
        tag: '🎬 Mission 02',
        title: 'Trois graduations, et pourtant 1,5',
        tone: 'indigo',
        body: (
          <>
            Tu viens de régler l’axe. Dans ce repère, un point posé à trois graduations de
            l’origine ne vaut pas 3. <strong>Combien vaut-il ?</strong>
          </>
        ),
      }}
      intro={
        <div className="flex items-start gap-3 rounded-2xl border border-violet-100 bg-violet-50/60 p-3.5">
          <Eye className="mt-0.5 h-5 w-5 shrink-0 text-violet-600" aria-hidden="true" />
          <p className="text-sm text-violet-900">
            Sous le repère, deux panneaux : le nombre de graduations comptées, et les
            coordonnées. Déplace le point et regarde-les diverger.
          </p>
        </div>
      }
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={2} />}
    />
  );
}
