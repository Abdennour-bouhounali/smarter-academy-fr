import React, { useState } from 'react';
import { Move, Copy } from 'lucide-react';
import { ContentModule, TapQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import VectorLab from '../components/VectorLab';
import CoordPlane from '../../../../../common/components/CoordPlane';
import {
  RANGE, DRONES, translatePoint, vecFromPoints, equalVectors, formatVec, describeVec,
} from '../components/vectorUtils';

/**
 * Module 4 — MANIPULATION, et l'interaction SIGNATURE de la leçon.
 *
 * Activity              déplacer l'ORIGINE d'une flèche sans toucher à ses
 *                       composantes, et la poser à quatre endroits.
 * Mathematical objective un vecteur est le même objet où qu'on le dessine :
 *                       le point d'application n'en fait pas partie.
 * Student action        régler l'origine ; les composantes sont figées.
 * Controlled variable   le seul point d'application.
 * Mathematical state    une origine et un vecteur constant.
 * Visual consequence    la flèche voyage, identique à elle-même ; les flèches
 *                       déjà posées restent en fantôme.
 * Expected observation  « c'est toujours la même flèche » — l'invariant est
 *                       visible parce que rien d'autre ne change.
 * Misconception ciblée   croire que déplacer la flèche la change. C'est la
 *                       raison pour laquelle le mode 'move' fige les
 *                       composantes : une seule variable.
 * Formalization         le mot « vecteur » est introduit ICI, après le geste.
 * Transfer              module 5 : deux nombres suffisent à le décrire.
 */
const V = DRONES.mouvement;
const CIBLES = DRONES.positions;

export default function Module04FlecheVagabonde() {
  const [origin, setOrigin] = useState(CIBLES[0]);
  const [posed, setPosed] = useState([]);
  const done1 = posed.length >= 3;

  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);

  /**
   * Une flèche ne compte que si elle est posée FRANCHEMENT ailleurs. Sans
   * cette garde, trois flèches quasi superposées se confondent en une seule à
   * l'écran — et l'élève ne voit plus l'invariant qu'on veut lui montrer.
   * Deux unités de distance suffisent à les séparer visuellement.
   */
  const TROP_PRES = 2;
  const [tropPres, setTropPres] = useState(false);

  const poser = (react) => {
    const proche = posed.some(
      (p) => Math.hypot(p.x - origin.x, p.y - origin.y) < TROP_PRES
    );
    if (proche) { setTropPres(true); return false; }
    setTropPres(false);
    setPosed((p) => [...p, { ...origin }]);
    react(true);
    return true;
  };

  const steps = [
    {
      num: 1,
      title: 'La même flèche, posée ailleurs',
      subtitle: 'Déplace l’origine — les composantes ne changent jamais. Pose la flèche à 3 endroits.',
      done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <p className="text-sm text-slate-700">
            Le déplacement est figé à <strong>{formatVec(V)}</strong>. Tu ne peux régler que
            l’endroit d’où part la flèche. Pose-la à trois endroits différents.
          </p>
          <VectorLab
            origin={origin}
            vector={V}
            onOriginChange={setOrigin}
            mode="move"
            range={RANGE}
            ghosts={posed.map((p, i) => ({ origin: p, vector: V, label: `${i + 1}` }))}
            disabled={done1}
            ariaLabel="Déplace l’origine de la flèche sans changer son déplacement"
          />
          {!done1 && (
            <button
              type="button"
              onClick={() => poser(kit.react)}
              className="w-full sm:w-auto px-4 py-3 rounded-xl bg-violet-600 hover:bg-violet-700
                         text-white font-semibold min-h-[44px]"
            >
              Poser la flèche ici ({posed.length}/3)
            </button>
          )}
          {done1 ? (
            <Feedback tone="ok">
              Trois flèches, à trois endroits, <strong>rigoureusement identiques</strong> : même
              direction, même sens, même longueur. On dit qu’elles représentent le{' '}
              <strong>même vecteur</strong>. Un vecteur, c’est le déplacement lui-même — pas
              l’endroit où on le dessine.
            </Feedback>
          ) : (
            <Feedback tone="info">
              Flèche en {`(${origin.x} ; ${origin.y})`}, déplacement {describeVec(V)} —
              inchangé depuis le début.
              {tropPres
                ? ' Cette position est trop proche d’une flèche déjà posée : éloigne-toi un peu pour bien voir les deux.'
                : ' Pose-la ailleurs.'}
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Toute l’escadrille d’un coup',
      subtitle: 'Le même vecteur appliqué à quatre drones.',
      done: q2,
      content: (
        <div className="space-y-3">
          <CoordPlane
            range={RANGE}
            points={[
              ...CIBLES.map((p, i) => ({ id: `d${i}`, name: '🚁', x: p.x, y: p.y, color: '#4338ca' })),
              ...CIBLES.map((p, i) => {
                const q = translatePoint(p, V);
                return { id: `i${i}`, name: '', x: q.x, y: q.y, color: '#059669' };
              }),
            ]}
            arrows={CIBLES.map((p, i) => ({
              id: `a${i}`, from: p, to: translatePoint(p, V), color: '#7c3aed',
            }))}
            caption={false}
            ariaLabel="Quatre drones effectuant tous le même déplacement"
          />
          <TapQuestion
            prompt="Les quatre drones ont fait le même déplacement. Sont-ils arrivés au même endroit ?"
            options={[
              'Non : chacun arrive ailleurs, car ils sont partis d’endroits différents.',
              'Oui : le même vecteur mène toujours au même point.',
              'Oui, s’ils partent en même temps.',
              'Cela dépend de la longueur du vecteur.',
            ]}
            correct={0}
            cols={1}
            explain="Le vecteur dit de combien se déplacer, pas où arriver. L’arrivée dépend à la fois du départ ET du vecteur — c’est justement ce qui rend le vecteur réutilisable partout."
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
        </div>
      ),
    },
    {
      num: 3,
      title: 'Deux flèches, un seul vecteur',
      done: q3,
      content: (
        <TapQuestion
          prompt="Une flèche va de (−4 ; 1) à (−1 ; 3). Une autre va de (2 ; −2) à (5 ; 0). Représentent-elles le même vecteur ?"
          options={[
            'Oui : les deux déplacements valent (3 ; 2).',
            'Non : elles ne sont pas au même endroit.',
            'Non : leurs points de départ sont différents.',
            'Impossible à dire sans mesurer les flèches.',
          ]}
          correct={0}
          cols={1}
          explain="Premier déplacement : −1 − (−4) = 3 et 3 − 1 = 2. Second : 5 − 2 = 3 et 0 − (−2) = 2. Mêmes composantes, donc même vecteur — l’endroit ne compte pas."
          explainWrong="C’est exactement ce que tu viens de manipuler : deux flèches posées à des endroits différents sont le même vecteur dès que leurs composantes coïncident."
          solved={q3}
          onAnswered={() => setQ3(true)}
        />
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(4)}
      moduleNumber={4}
      moduleTitle="La flèche vagabonde"
      moduleSubtitle="Le même vecteur, partout où on le pose"
      estimatedTime="11 min"
      brief={{
        tag: 'Manipulation',
        title: 'Un objet qui voyage',
        tone: 'violet',
        body: (
          <p>
            Cette fois, tu ne peux <strong>pas</strong> changer le déplacement : seulement l’endroit
            d’où part la flèche. Regarde bien ce qui reste identique.
          </p>
        ),
      }}
      intro={
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { icon: Move, t: 'Déplace l’origine', d: 'Les composantes sont verrouillées.', c: 'text-violet-600' },
            { icon: Copy, t: 'Pose et compare', d: 'Les flèches déjà posées restent visibles.', c: 'text-slate-600' },
          ].map(({ icon: Icon, t, d, c }) => (
            <div key={t} className="rounded-xl border-2 border-slate-200 bg-white p-3">
              <Icon className={`w-5 h-5 mb-1 ${c}`} aria-hidden="true" />
              <p className="font-semibold text-slate-800 text-sm">{t}</p>
              <p className="text-xs text-slate-600">{d}</p>
            </div>
          ))}
        </div>
      }
      steps={steps}
      footer={
        <Feedback tone="ok">
          <strong>Le mot juste.</strong> Un <strong>vecteur</strong> décrit un déplacement :
          direction, sens et longueur. Deux flèches situées à des endroits différents représentent
          le même vecteur si elles ont les mêmes composantes. On les dit <strong>égaux</strong>.
        </Feedback>
      }
    />
  );
}
