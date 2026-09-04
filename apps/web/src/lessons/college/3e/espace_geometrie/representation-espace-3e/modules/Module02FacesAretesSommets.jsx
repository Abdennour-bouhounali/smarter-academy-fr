import React, { useState } from 'react';
import { Boxes, Sigma } from 'lucide-react';
import { ContentModule, BatchChoiceQuestion, TapQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import SolidTurner from '../components/SolidTurner';
import { SOLIDS, SOLIDES_COURBES, countsOf, eulerCheck } from '../components/espaceUtils';

/**
 * Module 2 — DÉCOUVERTE : compter faces, arêtes et sommets.
 *
 * Activity              mettre en évidence chaque famille d'éléments, sur
 *                       quatre polyèdres.
 * Mathematical objective compter sans oublier ce qui est caché, et découvrir
 *                       la relation F + S − A = 2.
 * Student action        choisir ce qu'on met en évidence, puis répondre.
 * Mathematical state    le solide ; les comptes viennent de `countsOf`.
 * Visual consequence    les sommets cachés apparaissent en gris pâle : on ne
 *                       peut pas les oublier.
 * Misconception ciblée   compter uniquement ce qu'on voit (un cube « a 7
 *                       sommets » parce que le huitième est derrière).
 * Formalization         la relation d'Euler est CONSTATÉE sur quatre solides,
 *                       puis nommée — et sa limite est dite : elle ne vaut pas
 *                       pour les solides courbes.
 */
const POLYEDRES = [SOLIDS.cube, SOLIDS.pave, SOLIDS.prisme, SOLIDS.pyramide];

export default function Module02FacesAretesSommets() {
  const [highlight, setHighlight] = useState(null);
  const [vus, setVus] = useState(new Set());
  const done1 = vus.size >= 3;

  const [batch, setBatch] = useState(false);
  const [q3, setQ3] = useState(false);

  const steps = [
    {
      num: 1,
      title: 'Mettre en évidence',
      subtitle: 'Faces, arêtes, sommets : regarde-les un par un.',
      done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <SolidTurner solid={SOLIDS.cube} yaw={30} pitch={20}
            highlight={highlight} showNames
            ariaLabel="Cube vu de trois quarts, avec ses sommets nommés" />
          <div className="flex gap-2 justify-center flex-wrap">
            {[['faces', 'Les faces'], ['aretes', 'Les arêtes'], ['sommets', 'Les sommets']].map(([k, l]) => (
              <button
                key={k}
                type="button"
                onClick={() => {
                  setHighlight(k);
                  setVus((s) => (s.has(k) ? s : new Set([...s, k])));
                  if (!vus.has(k)) kit.react(true);
                }}
                disabled={done1}
                className={`px-4 py-3 rounded-xl font-semibold min-h-[44px] border-2 transition-colors ${
                  highlight === k
                    ? 'border-violet-400 bg-violet-50 text-violet-800'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-violet-300'
                }`}
              >
                {l}
              </button>
            ))}
          </div>
          {done1 ? (
            <Feedback tone="ok">
              6 faces, 12 arêtes, 8 sommets. Remarque le sommet <strong>gris pâle</strong> : il est
              derrière, on ne le voit pas — mais il compte. Compter uniquement ce qu’on voit
              donnerait 7 sommets, et ce serait faux.
            </Feedback>
          ) : (
            <Feedback tone="info">
              Éléments explorés : {vus.size} sur 3. Les compteurs sous le dessin viennent du solide
              lui-même, pas du dessin.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Quatre polyèdres',
      subtitle: 'Compte sans oublier ce qui est derrière.',
      done: batch,
      content: (
        <BatchChoiceQuestion
          intro={
            <div className="space-y-2">
              <div className="grid sm:grid-cols-4 gap-2">
                {POLYEDRES.map((s) => (
                  <div key={s.id} className="space-y-1">
                    <p className="text-xs font-semibold text-slate-600 text-center">{s.nom}</p>
                    <SolidTurner solid={s} yaw={30} pitch={20}
                      ariaLabel={`${s.nom} vu de trois quarts`} />
                  </div>
                ))}
              </div>
            </div>
          }
          rows={[
            {
              id: 'cube', label: 'Le cube a combien d’arêtes ?',
              options: ['12', '8', '6'],
              correct: 0,
              correction: '12 arêtes : 4 sur la face avant, 4 sur la face arrière, et 4 qui les relient. Le cube a 8 sommets et 6 faces.',
            },
            {
              id: 'prisme', label: 'Le prisme à base triangulaire a combien de faces ?',
              options: ['5', '6', '3'],
              correct: 0,
              correction: '5 faces : les 2 triangles (avant et arrière) et les 3 rectangles qui les relient.',
            },
            {
              id: 'pyramide', label: 'La pyramide à base carrée a combien de sommets ?',
              options: ['5', '4', '8'],
              correct: 0,
              correction: '5 sommets : les 4 de la base carrée, plus la pointe.',
            },
            {
              id: 'pave', label: 'Le pavé droit a-t-il les mêmes comptes que le cube ?',
              options: [
                'Oui : 6 faces, 12 arêtes, 8 sommets — seules les dimensions diffèrent',
                'Non, il a plus de faces',
                'Non, il a moins d’arêtes',
              ],
              correct: 0,
              correction: 'Un cube est un pavé droit particulier, dont toutes les arêtes sont égales. Les comptes sont donc identiques ; ce sont les longueurs qui changent.',
            },
          ]}
          feedback={({ allRight, nCorrect, total }) => (
            <Feedback tone={allRight ? 'ok' : 'info'}>
              {allRight
                ? 'Tu comptes bien tout, y compris ce que le dessin cache.'
                : `${nCorrect} sur ${total}. Astuce : compte par familles (face avant, face arrière, puis les arêtes qui les relient).`}
            </Feedback>
          )}
          solved={batch}
          onAnswered={() => setBatch(true)}
        />
      ),
    },
    {
      num: 3,
      title: 'Une relation surprenante',
      subtitle: 'Elle vaut pour les quatre — mais pas pour tout.',
      done: q3,
      content: (
        <div className="space-y-3">
          <div className="rounded-xl bg-slate-50 border-2 border-slate-200 p-3">
            <p className="text-sm text-slate-700 mb-2">
              Calcule <strong>faces + sommets − arêtes</strong> pour chacun :
            </p>
            <ul className="text-sm font-mono text-slate-700 space-y-1">
              {POLYEDRES.map((s) => {
                const c = countsOf(s);
                return (
                  <li key={s.id}>
                    {s.nom} : {c.faces} + {c.sommets} − {c.aretes} ={' '}
                    <strong className="text-emerald-700">{eulerCheck(s)}</strong>
                  </li>
                );
              })}
            </ul>
          </div>
          <TapQuestion
            prompt="Cette relation vaut-elle aussi pour une boule ?"
            options={[
              'Non : une boule n’est pas un polyèdre, elle n’a ni arête ni sommet',
              'Oui, elle vaut pour tous les solides',
              'Oui, si on compte sa surface comme une face',
              'On ne peut pas savoir',
            ]}
            correct={0}
            cols={1}
            explain="La relation F + S − A = 2 est celle d’Euler, et elle concerne les POLYÈDRES : des solides dont toutes les faces sont planes. Une boule n’a qu’une surface courbe, sans arête ni sommet — elle sort du cadre."
            explainWrong="Les quatre solides du haut sont tous des polyèdres (faces planes). Une boule, un cylindre ou un cône ont une surface courbe : la relation ne leur est pas destinée."
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
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="Faces, arêtes, sommets"
      moduleSubtitle="Compter ce qu’on ne voit pas"
      estimatedTime="9 min"
      brief={{
        tag: 'Découverte',
        title: 'L’inventaire d’un solide',
        tone: 'sky',
        body: (
          <p>
            Un dessin cache toujours une partie de l’objet. Pour compter juste, il faut{' '}
            <strong>tenir compte de ce qui est derrière</strong>.
          </p>
        ),
      }}
      intro={
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { icon: Boxes, t: 'Trois familles', d: 'Faces planes, arêtes, sommets.', c: 'text-sky-600' },
            { icon: Sigma, t: 'Une relation', d: 'Vraie pour tous les polyèdres.', c: 'text-emerald-600' },
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
          <strong>Relation d’Euler.</strong> Pour tout polyèdre convexe,
          faces + sommets − arêtes = 2. Elle ne s’applique pas aux solides à surface courbe
          (cylindre, cône, boule).
        </Feedback>
      }
    />
  );
}
