import React, { useState } from 'react';
import { Tags, ArrowLeftRight } from 'lucide-react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import RatioLab from '../components/RatioLab';
import { roleOfSides, SIDE_NAMES } from '../components/trigoUtils';

/**
 * Module 2 — DÉCOUVERTE : nommer les côtés relativement à l'angle.
 *
 * Activity              changer l'angle étudié et voir les étiquettes suivre.
 * Mathematical objective « opposé » et « adjacent » ne sont pas des noms fixes
 *                       de côtés : ce sont des RÔLES, relatifs à l'angle
 *                       qu'on regarde. L'hypoténuse, elle, ne change jamais.
 * Student action        basculer entre les deux angles aigus.
 * Controlled variable   l'angle de référence seul (taille et forme figées).
 * Mathematical state    le sommet étudié ; les rôles en sont DÉRIVÉS
 *                       (`roleOfSides`), jamais écrits en dur.
 * Visual consequence    les couleurs des côtés s'échangent sous les yeux.
 * Expected observation  « le côté rouge est devenu bleu ».
 * Misconception ciblée   apprendre « BC est l'opposé » comme un fait absolu.
 *                       C'est l'erreur qui fait rater un exercice sur deux.
 * Formalization         les noms sin/cos/tan n'apparaissent PAS ici.
 *
 * CONNAISSANCES AVANT LA DEMANDE (docs/architecture/KNOWLEDGE_DEPENDENCY.md).
 *   L'étape 1 montrait les étiquettes « Opposé : [BC] · Adjacent : [AB] » —
 *   des VALEURS, sans jamais dire ce que ces mots signifient —, puis l'étape 2
 *   demandait « Quel côté est OPPOSÉ à l'angle R ? ». Le sens n'arrivait que
 *   dans les `correction`, après la réponse, et dans le footer. Les trois rôles
 *   sont désormais posés par des briques après le geste qui les fait voir
 *   (l'échange des couleurs), avant la première question qui les exige.
 */
export default function Module02NommerLesCotes() {
  const [vertex, setVertex] = useState('A');
  const [vus, setVus] = useState(new Set(['A']));
  const roles = roleOfSides(vertex);
  const done1 = vus.size >= 2;

  const [batch, setBatch] = useState(false);
  const [q3, setQ3] = useState(false);

  const steps = [
    {
      num: 1,
      title: 'Change d’angle étudié',
      subtitle: 'Le triangle ne bouge pas — seul l’angle qu’on regarde change.',
      done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <p className="text-sm text-slate-700">
            Le triangle est rectangle en B. Ses deux angles aigus sont en A et en C. Regarde ce que
            deviennent les étiquettes quand tu passes de l’un à l’autre.
          </p>
          <RatioLab
            alpha={37}
            hyp={130}
            vertex={vertex}
            showRatios={false}
            disabled={done1}
            ariaLabel={`Triangle rectangle, angle étudié en ${vertex}`}
          />
          <div className="flex gap-2 justify-center">
            {['A', 'C'].map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => {
                  setVertex(v);
                  setVus((s) => (s.has(v) ? s : new Set([...s, v])));
                  if (!vus.has(v)) kit.react(true);
                }}
                disabled={done1}
                className={`px-5 py-3 rounded-xl font-semibold min-h-[44px] border-2 transition-colors ${
                  vertex === v
                    ? 'border-indigo-400 bg-indigo-50 text-indigo-800'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-indigo-300'
                }`}
              >
                Étudier l’angle en {v}
              </button>
            ))}
          </div>
          {done1 ? (
            <>
              <Feedback tone="ok">
                Deux côtés ont <strong>échangé leurs places</strong> quand tu as changé d’angle.
                Un seul n’a pas bougé. Voici comment on les appelle.
              </Feedback>
              <KnowledgeBrick
                id="hypotenuse"
                variant="rappel"
                compact
                lead={`Celui qui n’a pas bougé, c’est [${roles.hyp}].`}
              />
              <KnowledgeBrick
                id="cote-oppose"
                variant="new"
                compact
                lead={`Pour l’angle en ${vertex}, c’est [${roles.opp}] : il ne touche pas cet angle.`}
              />
              <KnowledgeBrick
                id="cote-adjacent"
                variant="new"
                compact
                lead={`Pour l’angle en ${vertex}, c’est [${roles.adj}] : il touche l’angle, sans être l’hypoténuse.`}
              />
              <KnowledgeBrick
                id="mem-roles-relatifs"
                variant="new"
                compact
                lead="Et voilà pourquoi ces deux mots ne désignent jamais un côté une fois pour toutes."
              />
            </>
          ) : (
            <Feedback tone="info">
              Angle étudié : {vertex}. Trois côtés, trois places différentes — bascule sur l’autre
              angle et regarde lesquelles changent.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Attribuer les rôles',
      subtitle: 'Toujours par rapport à l’angle étudié.',
      done: batch,
      content: (
        <BatchChoiceQuestion
          intro={
            <div className="space-y-2">
              <p className="text-sm text-slate-700">
                Dans un triangle RST rectangle en S, on étudie l’angle en <strong>R</strong>.
              </p>
            </div>
          }
          rows={[
            {
              id: 'n1', label: 'Quel côté est l’hypoténuse ?',
              options: ['[RT]', '[RS]', '[ST]'],
              correct: 0,
              correction: 'L’hypoténuse est toujours le côté opposé à l’angle droit. L’angle droit est en S, donc l’hypoténuse est [RT].',
            },
            {
              id: 'n2', label: 'Quel côté est OPPOSÉ à l’angle R ?',
              options: ['[ST]', '[RS]', '[RT]'],
              correct: 0,
              correction: 'Le côté opposé à R est celui qui ne touche pas R : c’est [ST].',
            },
            {
              id: 'n3', label: 'Quel côté est ADJACENT à l’angle R ?',
              options: ['[RS]', '[ST]', '[RT]'],
              correct: 0,
              correction: 'L’adjacent touche R sans être l’hypoténuse : c’est [RS]. Attention, [RT] touche aussi R mais c’est l’hypoténuse.',
            },
            {
              id: 'n4', label: 'Si on étudie maintenant l’angle en T, quel côté devient l’opposé ?',
              options: ['[RS]', '[ST]', '[RT]'],
              correct: 0,
              correction: 'Opposé à T = le côté qui ne touche pas T, soit [RS]. Il était l’adjacent pour l’angle R : les deux rôles se sont échangés.',
            },
          ]}
          feedback={({ allRight, nCorrect, total }) => (
            <Feedback tone={allRight ? 'ok' : 'info'}>
              {allRight
                ? 'Tu attribues les rôles à partir de l’angle étudié, et pas de la position du côté sur le dessin.'
                : `${nCorrect} sur ${total}. Méthode : l’hypoténuse est face à l’angle droit ; l’opposé ne touche pas l’angle étudié ; l’adjacent le touche.`}
            </Feedback>
          )}
          requires={['hypotenuse', 'cote-oppose', 'cote-adjacent', 'mem-roles-relatifs']}
          solved={batch}
          onAnswered={() => setBatch(true)}
        />
      ),
    },
    {
      num: 3,
      title: 'Ce qui ne change jamais',
      done: q3,
      content: (
        <TapQuestion
          prompt="Dans un triangle rectangle, quel côté garde toujours le même rôle, quel que soit l’angle aigu étudié ?"
          options={[
            'L’hypoténuse : elle est toujours face à l’angle droit',
            'Le côté opposé',
            'Le côté adjacent',
            'Aucun, tout dépend de l’angle',
          ]}
          correct={0}
          cols={1}
          explain="L’hypoténuse est définie par rapport à l’ANGLE DROIT, pas par rapport à l’angle étudié : elle ne change donc jamais. Opposé et adjacent, eux, s’échangent dès qu’on change d’angle de référence."
          explainWrong="Tu viens de le constater : en passant de l’angle A à l’angle C, l’opposé et l’adjacent ont échangé leurs rôles. Seule l’hypoténuse est restée la même."
          requires={['hypotenuse', 'mem-roles-relatifs']}
          solved={q3}
          onAnswered={() => setQ3(true)}
        />
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="Nommer les côtés"
      moduleSubtitle="Des rôles, pas des noms fixes"
      estimatedTime="10 min"
      brief={{
        tag: 'Découverte',
        title: 'Opposé de quoi ?',
        tone: 'sky',
        body: (
          <p>
            « Opposé » et « adjacent » n’ont aucun sens tout seuls : il faut préciser{' '}
            <strong>de quel angle</strong> on parle. Change d’angle et regarde les étiquettes
            s’échanger.
          </p>
        ),
      }}
      intro={
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { icon: Tags, t: 'Trois rôles', d: 'Opposé, adjacent, hypoténuse.', c: 'text-sky-600' },
            { icon: ArrowLeftRight, t: 'Deux s’échangent', d: 'Le troisième ne bouge jamais.', c: 'text-violet-600' },
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
      footer={(
        <KnowledgeSnapshot moduleNumber={2}>
          <strong>La suite.</strong> Tu sais nommer les trois côtés à partir de l’angle étudié.
          Au module suivant, on regarde ce que valent leurs quotients.
        </KnowledgeSnapshot>
      )}
    />
  );
}
