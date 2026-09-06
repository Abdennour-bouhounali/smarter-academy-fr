import React, { useState } from 'react';
import { LayoutGrid } from 'lucide-react';
import { ContentModule, BatchChoiceQuestion, TapQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import SolidTurner from '../components/SolidTurner';
import ViewsPanel from '../components/ViewsPanel';
import { SOLIDS, viewExtent, VUES } from '../components/espaceUtils';

/**
 * Module 5 — MANIPULATION : les trois vues normalisées.
 *
 * Activity              associer un solide à ses trois vues, et comprendre
 *                       pourquoi il en faut plusieurs.
 * Mathematical objective une projection écrase une dimension ; trois vues
 *                       orthogonales suffisent à décrire un solide simple.
 * Student action        comparer les vues de deux solides.
 * Mathematical state    les projections, CALCULÉES par `projectOrtho`.
 * Visual consequence    deux solides différents partagent parfois une vue.
 * Misconception ciblée   croire qu'une vue « est » le solide.
 * Transfer              c'est la lecture d'un plan d'architecte.
 */
export default function Module05LesTroisVues() {
  const [vue, setVue] = useState('face');
  const [q1, setQ1] = useState(false);
  const [batch, setBatch] = useState(false);

  const steps = [
    {
      num: 1,
      title: 'Les trois vues d’un pavé',
      subtitle: 'Chaque vue écrase une dimension.',
      done: q1,
      content: (
        <div className="space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-600 text-center">Le solide</p>
              <SolidTurner solid={SOLIDS.pave} yaw={30} pitch={20}
                ariaLabel="Pavé droit vu de trois quarts" />
            </div>
            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-600 text-center">Ses trois vues</p>
              <ViewsPanel solid={SOLIDS.pave} highlight={vue} />
              <div className="flex gap-1.5 justify-center flex-wrap">
                {VUES.map((v) => (
                  <button key={v.id} type="button" onClick={() => setVue(v.id)}
                    className={`px-3 py-2 rounded-lg border-2 min-h-[44px] text-xs font-semibold ${
                      vue === v.id
                        ? 'border-violet-400 bg-violet-50 text-violet-800'
                        : 'border-slate-200 bg-white text-slate-700'
                    }`}>
                    {v.label}
                  </button>
                ))}
              </div>
              <p className="text-xs text-slate-600 text-center">
                {VUES.find((v) => v.id === vue).desc} — dimensions apparentes{' '}
                {viewExtent(SOLIDS.pave, vue).largeur} × {viewExtent(SOLIDS.pave, vue).hauteur}
              </p>
            </div>
          </div>
          <TapQuestion
            prompt="Pourquoi la vue de face et la vue de dessus d’un pavé sont-elles différentes ?"
            options={[
              'Chaque vue écrase une dimension différente : de face on perd la profondeur, de dessus on perd la hauteur',
              'Parce que le pavé change de forme quand on le tourne',
              'Parce que la vue de dessus est toujours un carré',
              'C’est une erreur de dessin',
            ]}
            correct={0}
            cols={1}
            explain="Une projection ne garde que deux des trois dimensions. De face on voit largeur et hauteur ; de dessus, largeur et profondeur. C’est pourquoi il faut plusieurs vues pour décrire complètement un objet."
            requires={['dessin-projection']}
            requires={['dessin-projection']}
            solved={q1}
            onAnswered={() => setQ1(true)}
          />
        {q1 && (
          <KnowledgeBrick
            id="trois-vues"
            variant="new"
            compact
            lead="Ces trois dessins ont chacun perdu une dimension — mais pas la même."
          />
        )}
            {q1 && (
              <KnowledgeBrick
                id="trois-vues"
                variant="new"
                compact
                lead="Ces trois dessins ont chacun perdu une dimension — mais pas la même."
              />
            )}        </div>
      ),
    },
    {
      num: 2,
      title: 'Reconnaître un solide à ses vues',
      done: batch,
      content: (
        <BatchChoiceQuestion
          intro={
            <div className="space-y-3">
              <p className="text-sm text-slate-700">
                Voici les trois vues de deux solides différents. Compare-les.
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                {[SOLIDS.cube, SOLIDS.pyramide].map((s) => (
                  <div key={s.id} className="space-y-1">
                    <p className="text-xs font-semibold text-slate-600 text-center">
                      Solide {s.id === 'cube' ? 'A' : 'B'}
                    </p>
                    <ViewsPanel solid={s} />
                  </div>
                ))}
              </div>
            </div>
          }
          rows={[
            {
              id: 'v1',
              label: 'La vue de dessus du solide A (cube) est…',
              options: ['un carré', 'un triangle', 'un cercle'],
              correct: 0,
              correction: 'Vu d’en haut, un cube se projette en carré — comme dans toutes ses vues, puisque ses trois dimensions sont égales.',
            },
            {
              id: 'v2',
              label: 'La vue de dessus du solide B (pyramide à base carrée) est…',
              options: ['un carré avec ses diagonales', 'un triangle', 'un rectangle'],
              correct: 0,
              correction: 'Vue d’en haut, la base carrée apparaît, et les quatre arêtes montant vers la pointe se projettent sur les diagonales.',
            },
            {
              id: 'v3',
              label: 'La vue de face du solide B est…',
              options: ['un triangle', 'un carré', 'un losange'],
              correct: 0,
              correction: 'De face, la pyramide se projette en triangle : la base devient un segment, et les faces latérales forment les deux côtés.',
            },
            {
              id: 'v4',
              label: 'Une seule vue suffit-elle à identifier un solide ?',
              options: [
                'Non : deux solides différents peuvent partager une même vue',
                'Oui, la vue de face suffit toujours',
                'Oui, si le solide est un polyèdre',
              ],
              correct: 0,
              correction: 'Le cube et la pyramide ont tous deux un carré dans une de leurs vues. C’est en croisant plusieurs vues qu’on lève l’ambiguïté — c’est ce que fait un plan d’architecte.',
            },
          ]}
          feedback={({ allRight, nCorrect, total }) => (
            <Feedback tone={allRight ? 'ok' : 'info'}>
              {allRight
                ? 'Tu lis les trois vues et tu sais pourquoi il en faut plusieurs.'
                : `${nCorrect} sur ${total}. Pour chaque vue, demande-toi quelle dimension est écrasée.`}
            </Feedback>
          )}
          requires={['trois-vues']}
          requires={['trois-vues']}
          solved={batch}
          onAnswered={() => setBatch(true)}
        />
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(5)}
      moduleNumber={5}
      moduleTitle="Les trois vues"
      moduleSubtitle="Comme sur un plan d’architecte"
      estimatedTime="11 min"
      brief={{
        tag: 'Manipulation',
        title: 'Décrire sans perspective',
        tone: 'purple',
        body: (
          <p>
            Les plans techniques n’utilisent pas la perspective : ils donnent{' '}
            <strong>trois vues</strong>, chacune écrasant une dimension. Ensemble, elles décrivent
            l’objet sans ambiguïté.
          </p>
        ),
      }}
      intro={
        <div className="rounded-xl border-2 border-purple-200 bg-purple-50 p-3 flex gap-3 items-start">
          <LayoutGrid className="w-5 h-5 text-purple-700 shrink-0 mt-0.5" aria-hidden="true" />
          <p className="text-sm text-purple-900">
            Vue <strong>de face</strong> : largeur et hauteur. Vue <strong>de dessus</strong> :
            largeur et profondeur. Vue <strong>de côté</strong> : profondeur et hauteur.
          </p>
        </div>
      }
      steps={steps}
      footer={(
        <KnowledgeSnapshot moduleNumber={5}>
          <strong>La suite.</strong> Trois vues suffisent à identifier un solide. Reste à savoir
          dessiner en perspective.
        </KnowledgeSnapshot>
      )}
    />
  );
}
