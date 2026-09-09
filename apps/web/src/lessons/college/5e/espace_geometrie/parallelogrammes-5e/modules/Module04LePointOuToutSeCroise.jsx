import React, { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick, PredictionChips } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import QuadLab from '../components/QuadLab';
import DiagonalesLab from '../components/DiagonalesLab';
import { etatDiagonales, quatriemeSommet } from '../components/paral';

/**
 * Module 4 — MANIPULATION : les diagonales.
 *
 * La propriété la plus utile de la leçon (elle sert à construire, à
 * justifier, et elle reviendra en 4e) est aussi la plus confondue avec une
 * autre. Ce module les met CÔTE À CÔTE plutôt que d'avertir en mots.
 *
 * ACTION → CHANGE → OBSERVATION → SENS
 *   action      : déformer le parallélogramme (D asservi)
 *   change      : six nombres — OA, OC, OB, OD d'un côté, AC et BD de l'autre
 *   observation : les quatre premiers restent égaux deux à deux ; les deux
 *                 derniers, eux, refusent de se rejoindre
 *   sens        : « se couper en leur milieu » et « être de même longueur »
 *                 sont deux propriétés différentes — et seule la première est
 *                 garantie par le parallélogramme
 *
 * Expected observation : « O est toujours au milieu des DEUX diagonales, mais
 * les deux diagonales n'ont pas la même longueur ».
 * Misconception targeted : (c) de la spec — « les diagonales d'un
 * parallélogramme sont égales », vraie pour le rectangle et généralisée à
 * tort. La prédiction de l'étape 1 la fait sortir avant qu'on la corrige.
 */
const A0 = { x: 190, y: 370 };
const B0 = { x: 480, y: 400 };
const C0 = { x: 580, y: 205 };

export default function Module04LePointOuToutSeCroise() {
  const [pts, setPts] = useState([A0, B0, C0, quatriemeSommet(A0, B0, C0)]);
  const [essais, setEssais] = useState(0);
  const [pred, setPred] = useState(null);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);

  const assez = essais >= 5;
  const d = etatDiagonales(pts);

  /* L'effet de bord vit dans le gestionnaire, pas dans l'updater (voir M3). */
  const bouger = (next, react) => {
    setPts(next);
    const m = essais + 1;
    setEssais(m);
    if (m === 5) react?.(true);
  };

  const steps = [
    {
      num: 1,
      title: 'Regarde le point de croisement',
      subtitle: 'Les deux diagonales sont tracées. Déforme la figure et surveille les six longueurs.',
      done: assez,
      content: (kit) => (
        <div className="space-y-3">
          {/* La prédiction est recueillie AVANT la manipulation, sans verdict :
              c'est elle qui fait sortir la misconception (§6ter.3). */}
          <PredictionChips
            prompt="avant de déformer : d’après toi, dans un parallélogramme, les deux diagonales…"
            options={[
              { id: 'egales', label: 'ont la même longueur' },
              { id: 'milieu', label: 'se coupent en leur milieu' },
              { id: 'deux', label: 'les deux à la fois' },
            ]}
            value={pred}
            onChange={setPred}
          />
          <QuadLab
            pts={pts}
            onPts={(next) => bouger(next, kit.react)}
            mobiles={[0, 1, 2]}
            asservi={3}
            montrerTemoins={false}
            montrerCodages={false}
            montrerDiagonales
            ariaLabel="Un parallélogramme déformable avec ses deux diagonales et leur point d’intersection"
          />
          <DiagonalesLab pts={pts} />
          {assez ? (
            <Feedback tone="ok">
              {pred === 'egales'
                ? <>Ta prédiction était « les diagonales ont la même longueur ». La figure te contredit : </>
                : pred === 'deux'
                  ? <>Ta prédiction était « les deux à la fois ». La figure n’en garde qu’une : </>
                  : <>Regarde ce que tu as obtenu : </>}
              <strong>O est le milieu des deux diagonales</strong> sur toutes les formes que tu as
              essayées — mais <strong>AC et BD ne sont pas égales</strong>. Ce sont bien deux
              propriétés différentes.
            </Feedback>
          ) : (
            <Feedback tone="info">
              {essais === 0
                ? 'Déforme la figure : les six longueurs se recalculent à chaque mouvement.'
                : `${essais} forme${essais > 1 ? 's' : ''} essayée${essais > 1 ? 's' : ''}. Compare bien les deux blocs du haut avec celui du bas.`}
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'La propriété des diagonales',
      done: q2,
      content: (
        <div className="space-y-3">
          <KnowledgeBrick
            id="diagonales-milieu"
            variant="new"
            lead={<>Sur toutes les formes que tu viens d’essayer, le point de croisement est resté au milieu des deux diagonales.</>}
          />
          <KnowledgeBrick id="mem-diagonales" variant="new" compact />
          <TapQuestion
            prompt="Dans un parallélogramme ABCD, les diagonales se coupent en O et OA = 4 cm. Que vaut AC ?"
            options={['8 cm', '4 cm', '2 cm', 'On ne peut pas savoir']}
            cols={4}
            correct={0}
            requires={['diagonales-milieu', 'milieu-segment']}
            explain="O est le milieu de [AC], donc OC = OA = 4 cm. La diagonale entière vaut les deux moitiés : AC = 4 + 4 = 8 cm."
            explainWrong="4 cm est la longueur d’une SEULE moitié, [OA]. Comme O est le milieu, l’autre moitié [OC] mesure aussi 4 cm — et la diagonale complète [AC] en fait donc le double : 8 cm."
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
        </div>
      ),
    },
    {
      num: 3,
      title: 'Ne pas confondre les deux',
      done: q3,
      content: (
        <div className="space-y-3">
          <div className="rounded-xl border-2 border-orange-200 bg-orange-50 p-3.5 text-sm text-slate-700">
            En ce moment, sur ta figure : <strong className="font-mono">OA = OC</strong> et{' '}
            <strong className="font-mono">OB = OD</strong>, mais{' '}
            <strong className="font-mono">AC ≠ BD</strong>. Retiens bien laquelle des deux le
            parallélogramme garantit.
          </div>
          <TapQuestion
            prompt="Un quadrilatère est un parallélogramme. Que peut-on affirmer à coup sûr sur ses diagonales ?"
            options={[
              'Elles se coupent en leur milieu',
              'Elles ont la même longueur',
              'Elles sont perpendiculaires',
              'Elles ont la même longueur et se coupent en leur milieu',
            ]}
            cols={1}
            correct={0}
            requires={['diagonales-milieu', 'parallelogramme', 'diagonale']}
            explain="Seul le milieu commun est garanti par le parallélogramme. Tu viens de fabriquer des dizaines de parallélogrammes dont les diagonales avaient des longueurs différentes."
            explainWrong="C’est vrai pour certains parallélogrammes — le rectangle a bien des diagonales égales, le losange des diagonales perpendiculaires. Mais aucune des deux n’est vraie pour TOUS : ta figure du haut en est le contre-exemple permanent. Seul le milieu commun ne se dément jamais."
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
          {d && (
            <div className="rounded-xl border-2 border-slate-200 bg-white p-3 text-center text-sm text-slate-600">
              Sur ta figure en ce moment : <span className="font-mono font-bold">AC</span> et{' '}
              <span className="font-mono font-bold">BD</span>{' '}
              {d.memeLongueur ? 'sont, par hasard, presque égales — déforme un peu pour les séparer.' : 'sont bien différentes.'}
            </div>
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
      moduleTitle="Le point où tout se croise"
      moduleSubtitle="Une propriété, et celle qu’on lui confond"
      estimatedTime="10 min"
      brief={{
        tag: 'Manipulation',
        title: 'Deux traits qui se croisent — mais où exactement ?',
        tone: 'indigo',
        body: (
          <p>
            Trace les deux diagonales d’un parallélogramme : elles se coupent quelque part. La
            question n’est pas <em>si</em> elles se coupent, mais <strong>où</strong> — et il y a
            deux réponses possibles qu’on confond tout le temps.
          </p>
        ),
      }}
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={4} />}
    />
  );
}
