import React, { useState } from 'react';
import { Eye } from 'lucide-react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import VirtualEquerre from '../components/VirtualEquerre';
import { isEquerreAligned, perpendicularThroughPoint } from '../components/relationsUtils';

/**
 * Module 5 — MANIPULATION : le rituel de l'équerre (P6, P7).
 *
 * Objectif : apprendre le GESTE, pas seulement la propriété. Vérifier une
 * perpendicularité, c'est poser l'angle droit de l'instrument sur l'angle à
 * contrôler — en deux gestes précis.
 *
 * Aha : deux conditions, pas une. Une équerre bien orientée mais posée à
 * côté du point ne prouve rien ; une équerre au bon endroit mais de travers
 * non plus. Les deux voyants le montrent séparément.
 *
 * Misconception visée : poser l'instrument « à peu près » et conclure.
 * L'étape 1 commence volontairement avec une équerre mal placée.
 */
const BOX = { xMin: 0, yMin: 0, xMax: 320, yMax: 190 };
const LINE = { p: { x: 20, y: 130 }, angleDeg: 0, name: 'd' };
const POINT = { x: 190, y: 130 };

const MAX_TRIES = 3;

export default function Module05PoserEquerre() {
  // Départ VOLONTAIREMENT mal placé : ni aligné, ni sur le point.
  const [equerre, setEquerre] = useState({ p: { x: 95, y: 75 }, angleDeg: 35 });
  const [placeDone, setPlaceDone] = useState(false);
  const [moves, setMoves] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [whyDone, setWhyDone] = useState(false);
  const [checkDone, setCheckDone] = useState(false);

  const state = isEquerreAligned(equerre, LINE, POINT);

  const handleChange = (next) => {
    if (placeDone || revealed) return;
    setEquerre(next);
    setMoves((m) => m + 1);
    const st = isEquerreAligned(next, LINE, POINT);
    if (st.ok) setPlaceDone(true);
  };

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(5)}
      moduleNumber={5}
      moduleTitle="Poser l’équerre"
      moduleSubtitle="Le rituel en deux gestes : le côté sur la droite, le sommet sur le point."
      estimatedTime="10 min"
      brief={{
        tag: '📋 Mission 05',
        title: 'L’équerre est mal posée. Corrige-la.',
        body: (
          <p>
            Deux voyants t’indiquent ce qui est déjà juste. Il faut les allumer <strong>tous les deux</strong>{' '}
            — déplace l’équerre et fais-la tourner.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Pose correctement l’équerre en A',
          subtitle: 'Un côté le long de la droite, le sommet sur le point A.',
          done: placeDone,
          content: (kit) => (
            <div className="space-y-3">
              <VirtualEquerre
                line={LINE}
                point={POINT}
                equerre={revealed ? { p: POINT, angleDeg: LINE.angleDeg } : equerre}
                onEquerreChange={(next) => {
                  handleChange(next);
                  const st = isEquerreAligned(next, LINE, POINT);
                  if (st.ok && !placeDone) kit.react(true);
                }}
                mode="verify"
                box={BOX}
                disabled={placeDone || revealed}
                ariaLabel="Équerre à poser sur la droite d, au point A"
              />

              {(placeDone || revealed) && (
                <>
                  <Feedback tone={revealed ? 'info' : 'ok'}>
                    {revealed && <strong>Pas grave, on te le montre. </strong>}
                    Les deux voyants sont allumés en même temps : l’équerre est bien posée.
                  </Feedback>
                  <KnowledgeBrick
                    id="rituel-equerre"
                    variant="new"
                    lead="Ce que tu viens de régler, ce sont exactement les deux exigences du geste."
                  />
                </>
              )}

              {!placeDone && !revealed && moves >= MAX_TRIES && (
                <button
                  type="button"
                  onClick={() => { setRevealed(true); setPlaceDone(true); }}
                  className="w-full min-h-[44px] rounded-xl border-2 border-sky-300 bg-sky-50 text-sky-800 font-bold text-sm hover:bg-sky-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  <Eye className="w-4 h-4 inline mr-1.5" aria-hidden="true" />
                  Je ne trouve pas — montre-moi
                </button>
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'Pourquoi deux conditions ?',
          done: whyDone,
          content: (
            <TapQuestion
              prompt="Une équerre bien orientée, mais dont le sommet n’est pas sur le point A : que peut-on en conclure ?"
              options={[
                'Rien pour le point A : l’angle droit n’est pas au bon endroit',
                'Que la perpendiculaire passe quand même par A',
                'Que la droite est parallèle à l’équerre',
              ]}
              correct={0}
              cols={1}
              requires={['rituel-equerre', 'droites-perpendiculaires']}
              explain="L’équerre matérialise un angle droit EN SON SOMMET. Si le sommet n’est pas sur A, l’angle droit est ailleurs — la perpendiculaire tracée ne passerait pas par A."
              explainWrong="C’est précisément ce que montrent les deux voyants : orientation et position sont deux exigences distinctes, et il faut les deux."
              solved={whyDone}
              onAnswered={() => setWhyDone(true)}
            />
          ),
        },
        {
          num: 3,
          title: 'Et pour vérifier un parallélisme ?',
          done: checkDone,
          content: (
            <TapQuestion
              prompt="Comment vérifier, avec la règle et l’équerre, que deux droites sont parallèles ?"
              options={[
                'En mesurant l’écart en deux endroits : il doit être identique',
                'En posant l’équerre au hasard sur les deux droites',
                'En vérifiant qu’elles ne se coupent pas sur la feuille',
              ]}
              correct={0}
              cols={1}
              requires={['ecart-constant', 'mesurer-ecart', 'droites-paralleles']}
              explain="On mesure l’écart perpendiculairement en deux endroits éloignés : s’il est le même, les droites sont parallèles. C’est le critère du module 2, appliqué avec les instruments."
              explainWrong="« Ne pas se couper sur la feuille » ne prouve rien (module 1). Le seul contrôle fiable est la mesure de l’écart, prise perpendiculairement en deux endroits."
              solved={checkDone}
              onAnswered={() => setCheckDone(true)}
            />
          ),
        },
      ]}
      footer={
        <KnowledgeSnapshot moduleNumber={5}>
          <strong>La suite.</strong> Un temps d’arrêt : on range côte à côte tout ce que tu as
          manipulé depuis le début.
        </KnowledgeSnapshot>
      }
    />
  );
}
