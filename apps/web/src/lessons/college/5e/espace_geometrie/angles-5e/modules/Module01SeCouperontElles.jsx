import React, { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick, PredictionChips } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import SecanteLab from '../components/SecanteLab';
import ZoomArriereLab from '../components/ZoomArriereLab';
import { droite, ecartDirections } from '../components/angles';

/**
 * Module 1 — DÉCLENCHEUR : se couperont-elles ?
 *
 * §6bis — la leçon OUVRE sur la manipulation. L'étape 1 rend un laboratoire de
 * dézoom : deux droites qui semblent parallèles à l'échelle de la feuille, et
 * qu'on voit se rejoindre en reculant. L'œil s'est trompé, et l'élève le
 * constate lui-même au lieu de se le faire dire.
 *
 * L'EXPÉRIENCE SURPRENANTE, et le problème qu'elle pose : l'écart de 3° est
 * invisible sur 700 pixels, mais il fait se croiser les droites bien au-delà
 * du cadre. Donc « regarder » ne suffit pas, et « prolonger » est impossible
 * sur une feuille. Il faut un instrument LOCAL — c'est la sécante, qui arrive
 * à l'étape 3 comme la réponse à ce manque.
 *
 * Expected observation : « je ne peux pas décider à l'œil, et je ne peux pas
 * prolonger assez loin ; il me faut autre chose ».
 * Misconception targeted : croire qu'on voit le parallélisme, ou qu'il suffit
 * de « regarder si l'écart se resserre ».
 */
const D1 = droite({ x: 390, y: 175 }, 0);
const D2_PRESQUE = droite({ x: 390, y: 355 }, 3);

export default function Module01SeCouperontElles() {
  const [pred, setPred] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [vuCroisement, setVuCroisement] = useState(false);
  const [q2, setQ2] = useState(false);

  // Le laboratoire de l'étape 3 : l'élève y trace une sécante.
  const [d2, setD2] = useState(D2_PRESQUE);
  const [sec, setSec] = useState(droite({ x: 390, y: 265 }, 62));
  const [vuSecante, setVuSecante] = useState(false);

  const ecart = ecartDirections(D1, d2);

  const steps = [
    {
      num: 1,
      title: 'Ces deux droites se couperont-elles ?',
      subtitle: 'Regarde-les bien. Puis recule — le laboratoire dézoome autant que tu veux.',
      done: vuCroisement,
      content: (kit) => (
        <div className="space-y-3">
          <ZoomArriereLab
            d1={D1}
            d2={D2_PRESQUE}
            zoom={zoom}
            onZoom={(z) => {
              setZoom(z);
              if (z >= 7 && !vuCroisement) { setVuCroisement(true); kit.react?.(true); }
            }}
            ariaLabel="Deux droites presque parallèles, qu’on peut observer en reculant"
          />
          {!vuCroisement ? (
            <>
              <PredictionChips
                prompt="avant de reculer : à ton avis, ces deux droites finissent-elles par se couper ?"
                options={[
                  { id: 'jamais', label: 'Non, elles sont parallèles' },
                  { id: 'oui', label: 'Oui, mais très loin' },
                  { id: 'sais-pas', label: 'Impossible à dire d’ici' },
                ]}
                value={pred}
                onChange={setPred}
              />
              <Feedback tone="info">
                Traîne le curseur pour <strong>reculer</strong>. La feuille ne change pas — c’est
                seulement ton point de vue qui s’éloigne.
              </Feedback>
            </>
          ) : (
            <Feedback tone="ok">
              {pred === 'oui'
                ? 'Ta prédiction était la bonne'
                : pred === 'sais-pas'
                  ? 'Tu avais raison de te méfier'
                  : 'L’œil s’est trompé'} : elles <strong>se coupent</strong>. Sur la feuille, leur
              écart de <strong>3°</strong> était invisible — et pourtant il suffit à les faire se
              rejoindre bien au-delà du cadre.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Le vrai problème',
      done: q2,
      content: (
        <div className="space-y-3">
          <TapQuestion
            prompt="Sur une feuille, comment savoir à coup sûr si deux droites sont parallèles ?"
            options={[
              'Ni l’un ni l’autre : il faut trouver un autre moyen',
              'En les regardant attentivement',
              'En les prolongeant jusqu’au bord de la feuille',
            ]}
            correct={0}
            cols={1}
            /* Aucune connaissance de la leçon n'est requise : c'est un constat
               sur ce que l'élève vient de vivre. */
            requires={['droites-paralleles']}
            explain="Regarder ne suffit pas — tu viens d’en faire l’expérience. Et prolonger non plus : le croisement peut se trouver à des mètres de la feuille. Il faut donc un moyen qui travaille LOCALEMENT, là où on est."
            explainWrong="Prolonger jusqu’au bord de la feuille ne prouve rien : les droites de l’étape 1 ne se coupaient pas dans le cadre, et pourtant elles n’étaient pas parallèles. Le croisement était simplement plus loin."
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
          {q2 && (
            <Feedback tone="info">
              Il faut donc quelque chose qui réponde <strong>sans quitter la feuille</strong>. C’est
              exactement ce que va faire un simple trait de plus.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Un trait de plus',
      subtitle: 'Trace une droite qui coupe les deux autres, et regarde ce qui apparaît.',
      done: vuSecante,
      content: (kit) => (
        <div className="space-y-3">
          <SecanteLab
            d1={D1}
            d2={d2}
            s={sec}
            onD2={setD2}
            onS={(v) => { setSec(v); if (!vuSecante) { setVuSecante(true); kit.react?.(true); } }}
            montrer="aucun"
            montrerEcart
            ariaLabel="Deux droites coupées par une sécante orientable"
          />
          <div className="rounded-xl border-2 border-violet-200 bg-violet-50 p-3.5 text-sm text-slate-700">
            La sécante (en orange) coupe les deux droites en <strong>A</strong> et{' '}
            <strong>B</strong>. Fais-la pivoter, puis fais pivoter la droite du bas : l’indicateur
            d’écart te dit à quel point tu es près du parallélisme.
          </div>
          {vuSecante ? (
            <Feedback tone="ok">
              Deux points de croisement sont apparus <strong>sur la feuille</strong>. Autour d’eux,
              il y a des angles — et un angle, ça se mesure au rapporteur.{' '}
              {ecart <= 0.35
                ? <>Tu as même réussi à rendre les deux droites parallèles.</>
                : <>Il s’en faut encore de <strong>{ecart.toFixed(1)}°</strong>.</>}
            </Feedback>
          ) : (
            <Feedback tone="info">
              Traîne la poignée orange pour incliner la sécante, ou la poignée grise pour faire
              pivoter la droite du bas.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 4,
      title: 'Ce trait porte un nom',
      done: vuSecante,
      content: (
        <div className="space-y-3">
          {/* La brique nomme l'instrument APRÈS qu'il a résolu un manque
              ressenti — pas avant. */}
          <KnowledgeBrick
            id="secante"
            variant="new"
            lead={<>Tu cherchais un moyen de trancher sans quitter la feuille. Le trait que tu viens de tracer est exactement cet instrument.</>}
          />
          <Feedback tone="info">
            Les modules suivants vont apprendre à <strong>situer</strong> ces angles, puis à s’en
            servir pour répondre — dans les deux sens — à la question du parallélisme.
          </Feedback>
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      moduleTitle="Se couperont-elles ?"
      moduleSubtitle="Une question que l’œil ne tranche pas"
      estimatedTime="11 min"
      brief={{
        tag: 'Déclencheur',
        title: 'Deux droites, et un doute',
        tone: 'indigo',
        body: (
          <p>
            Voici deux droites qui <em>semblent</em> parallèles. Le sont-elles vraiment ? Avant de
            répondre, souviens-toi que « parallèles » veut dire{' '}
            <strong>elles ne se coupent jamais</strong> — même à cent mètres d’ici.
          </p>
        ),
      }}
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={1} />}
    />
  );
}
