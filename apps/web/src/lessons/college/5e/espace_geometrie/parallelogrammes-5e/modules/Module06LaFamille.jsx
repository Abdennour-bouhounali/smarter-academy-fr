import React, { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import QuadLab from '../components/QuadLab';
import FamilleLab from '../components/FamilleLab';
import { nature, quatriemeSommet } from '../components/paral';

/**
 * Module 6 — TRANSFERT : la famille des parallélogrammes.
 *
 * ACTION → CHANGE → OBSERVATION → SENS
 *   action      : pousser un parallélogramme vers le rectangle, puis vers le
 *                 losange, puis vers le carré — en traînant un sommet
 *   change      : deux jauges (angle droit ? côtés consécutifs égaux ?) et le
 *                 NOM de la figure, tous calculés depuis les points dessinés
 *   observation : le nom change, mais la ligne « c'est toujours un
 *                 parallélogramme » ne s'éteint jamais
 *   sens        : rectangle, losange et carré ne sont pas des rivaux du
 *                 parallélogramme : ce SONT des parallélogrammes, avec une
 *                 condition en plus
 *
 * Expected observation : « je n'ai jamais quitté la famille — j'ai seulement
 * ajouté des conditions ».
 * Misconception targeted : (a) de la spec, dans sa forme la plus tenace —
 * « un carré, ce n'est pas un parallélogramme, c'est un carré ». Le bandeau
 * qui reste allumé pendant toute la manipulation répond sans qu'on l'écrive.
 *
 * Ce module ne traite PAS les diagonales des figures particulières comme un
 * critère à démontrer : elles sont mentionnées dans la brique parce que
 * l'élève les a rencontrées au module 4, et testées comme reconnaissance.
 */
const A0 = { x: 210, y: 370 };
const B0 = { x: 470, y: 370 };
const C0 = { x: 560, y: 200 };

export default function Module06LaFamille() {
  const [pts, setPts] = useState([A0, B0, C0, quatriemeSommet(A0, B0, C0)]);
  const [vus, setVus] = useState([]);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);

  const n = nature(pts);
  const objectifs = ['rectangle', 'losange', 'carre'];
  const tousVus = objectifs.every((o) => vus.includes(o));

  const bouger = (next, react) => {
    setPts(next);
    const id = nature(next).id;
    if (objectifs.includes(id) && !vus.includes(id)) {
      // Valeur suivante calculée ici : l'updater reste pur (voir M3).
      const nv = [...vus, id];
      setVus(nv);
      if (objectifs.every((o) => nv.includes(o))) react?.(true);
    }
  };

  const steps = [
    {
      num: 1,
      title: 'Fabrique les trois',
      subtitle: 'Déforme le parallélogramme jusqu’à obtenir un rectangle, puis un losange, puis un carré.',
      done: tousVus,
      content: (kit) => (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-center gap-2">
            {objectifs.map((o) => (
              <div
                key={o}
                className={`rounded-xl border-2 px-3 py-1.5 text-sm font-bold transition ${
                  vus.includes(o) ? 'border-emerald-400 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-white text-slate-400'
                }`}
              >
                {vus.includes(o) ? '✓ ' : '○ '}{o === 'carre' ? 'carré' : o}
              </div>
            ))}
          </div>
          <QuadLab
            pts={pts}
            onPts={(next) => bouger(next, kit.react)}
            mobiles={[0, 1, 2]}
            asservi={3}
            montrerTemoins={false}
            montrerCodages
            ariaLabel="Un parallélogramme qu’on déforme pour obtenir un rectangle, un losange puis un carré"
          />
          <FamilleLab pts={pts} />
          {tousVus ? (
            <Feedback tone="ok">
              Les trois sont faits. Et pendant tout ce temps, la ligne{' '}
              <strong>« et c’est toujours un parallélogramme »</strong> ne s’est jamais éteinte :
              tu n’as rien quitté, tu as seulement <strong>ajouté des conditions</strong>.
            </Feedback>
          ) : (
            <Feedback tone="info">
              {n.id === 'parallelogramme'
                ? 'Pour un rectangle, amène un angle à 90°. Pour un losange, rends deux côtés voisins égaux.'
                : `Tu as un ${n.label}. Continue : il en reste ${objectifs.filter((o) => !vus.includes(o)).length} à fabriquer.`}
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'La famille, nommée',
      done: q2,
      content: (
        <div className="space-y-3">
          <KnowledgeBrick
            id="parallelogrammes-particuliers"
            variant="new"
            lead={<>Tu viens de fabriquer les trois sans jamais quitter la famille. Voici comment elle se range.</>}
          />
          <BatchChoiceQuestion
            intro={<p className="text-sm text-slate-700">Pour chaque affirmation : vraie ou fausse ?</p>}
            rows={[
              {
                id: 'f1',
                label: 'Tout rectangle est un parallélogramme.',
                options: ['Vrai', 'Faux'],
                correct: 0,
                correction: 'Vrai : un rectangle a bien ses côtés opposés parallèles deux à deux — plus des angles droits, qui sont un bonus.',
              },
              {
                id: 'f2',
                label: 'Tout parallélogramme est un rectangle.',
                options: ['Vrai', 'Faux'],
                correct: 1,
                correction: 'Faux : celui du module 1 n’avait aucun angle droit, et c’était bien un parallélogramme. La flèche ne va que dans un sens.',
              },
              {
                id: 'f3',
                label: 'Un carré est à la fois un rectangle et un losange.',
                options: ['Vrai', 'Faux'],
                correct: 0,
                correction: 'Vrai : il a un angle droit (donc rectangle) ET deux côtés voisins égaux (donc losange). C’est ce que les deux jauges ont montré ensemble.',
              },
              {
                id: 'f4',
                label: 'Un losange est un parallélogramme dont deux côtés voisins sont égaux.',
                options: ['Vrai', 'Faux'],
                correct: 0,
                correction: 'Vrai — et comme les côtés opposés sont déjà égaux, cela donne les quatre côtés égaux.',
              },
            ]}
            requires={['parallelogrammes-particuliers', 'parallelogramme', 'losange']}
            feedback={({ allRight, nCorrect, total }) => (allRight ? (
              <Feedback tone="ok">
                Les quatre. Le sens des flèches est le point délicat : <strong>tout carré est un
                parallélogramme</strong>, mais un parallélogramme n’est pas forcément un carré.
              </Feedback>
            ) : (
              <Feedback tone="ko">
                {nCorrect} sur {total}. Pour chaque ligne, demande-toi dans quel sens va la flèche :
                un cas particulier garde toutes les propriétés du cas général, mais l’inverse est
                faux. Le parallélogramme du module 1 n’avait aucun angle droit.
              </Feedback>
            ))}
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
        </div>
      ),
    },
    {
      num: 3,
      title: 'Reconnaître avec les diagonales',
      done: q3,
      content: (
        <div className="space-y-3">
          <div className="rounded-xl border-2 border-cyan-200 bg-cyan-50 p-3.5 text-sm text-slate-700">
            Au module 4, tu as vu que les diagonales d’un parallélogramme se coupent toujours en
            leur milieu — mais qu’elles ne sont pas égales. Chez les figures particulières, elles
            en disent plus.
          </div>
          <TapQuestion
            prompt="Dans un parallélogramme, les diagonales se coupent en leur milieu ET ont la même longueur. De quelle figure s’agit-il ?"
            options={['Un rectangle', 'Un losange', 'Un parallélogramme quelconque', 'Aucune figure ne peut avoir ça']}
            cols={2}
            correct={0}
            requires={['parallelogrammes-particuliers', 'diagonales-milieu']}
            explain="Des diagonales de même longueur caractérisent le rectangle. Le losange, lui, a des diagonales perpendiculaires — mais pas forcément égales."
            explainWrong="Le losange se reconnaît à des diagonales PERPENDICULAIRES, pas égales. Un parallélogramme quelconque, lui, a des diagonales de longueurs différentes : tu l’as constaté sur la table du module 4. L’égalité des diagonales, c’est le rectangle."
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(6)}
      moduleNumber={6}
      moduleTitle="La famille des parallélogrammes"
      moduleSubtitle="Des conditions en plus, jamais une autre figure"
      estimatedTime="9 min"
      brief={{
        tag: 'Transfert',
        title: 'Rectangle, losange, carré : des cousins ou des parallélogrammes ?',
        tone: 'indigo',
        body: (
          <p>
            Tu connais déjà le rectangle, le losange et le carré. La question du jour n’est pas de
            les reconnaître, mais de savoir <strong>où ils se rangent</strong> — et si un carré
            mérite encore le nom de parallélogramme.
          </p>
        ),
      }}
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={6} />}
    />
  );
}
