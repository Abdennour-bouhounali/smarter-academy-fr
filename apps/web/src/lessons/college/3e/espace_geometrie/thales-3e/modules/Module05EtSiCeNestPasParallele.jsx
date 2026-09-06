import React, { useState } from 'react';
import { GitCompareArrows, XCircle } from 'lucide-react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import ThalesLab from '../components/ThalesLab';
import {
  FIGURES, thalesPoint, freeN, ratiosOf, ratiosAgree, isParallelMNBC, twoRatiosAgree,
} from '../components/thalesUtils';

/**
 * Module 5 — MANIPULATION : la réciproque et la contraposée.
 *
 * Activity              déplacer N INDÉPENDAMMENT de M, et observer quand les
 *                       rapports coïncident.
 * Mathematical objective l'égalité des rapports ⟺ le parallélisme. Le sens
 *                       « rapports ⇒ parallèle » est la réciproque ; le sens
 *                       « rapports différents ⇒ pas parallèle » la contraposée.
 * Student action        régler les deux points séparément.
 * Visual consequence    les chevrons de parallélisme n'apparaissent QUE lorsque
 *                       les trois cases affichent le même nombre.
 * Expected observation  « les deux arrivent et repartent ensemble ».
 * Misconception ciblée   croire qu'il suffit que les longueurs se ressemblent ;
 *                       et oublier la condition d'ordre des points.
 * Formalization         les deux énoncés sont nommés APRÈS la manipulation.
 *
 * La version pré-kit ne pratiquait jamais la contraposée : elle n'était citée
 * que dans une mauvaise réponse et dans l'encadré final.
 */
export default function Module05EtSiCeNestPasParallele() {
  const fig = FIGURES.triangle;
  const [k, setK] = useState(0.35);
  const [kn, setKn] = useState(0.65);
  const [vus, setVus] = useState(new Set());

  const M = thalesPoint(fig.A, fig.B, k);
  const N = freeN(fig.A, fig.C, kn);
  const r = ratiosOf(fig.A, fig.B, fig.C, M, N);
  const agree = ratiosAgree(r);
  const parallel = isParallelMNBC(fig.B, fig.C, M, N);

  const observe = (nk, nkn) => {
    const m2 = thalesPoint(fig.A, fig.B, nk);
    const n2 = freeN(fig.A, fig.C, nkn);
    const ok = ratiosAgree(ratiosOf(fig.A, fig.B, fig.C, m2, n2));
    setVus((s) => (s.has(ok ? 'egaux' : 'differents') ? s : new Set([...s, ok ? 'egaux' : 'differents'])));
  };
  const done1 = vus.size >= 2;

  const [batch, setBatch] = useState(false);
  const [q3, setQ3] = useState(false);

  const steps = [
    {
      num: 1,
      title: 'N devient libre',
      subtitle: 'Obtiens les deux situations : rapports égaux, puis rapports différents.',
      done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <p className="text-sm text-slate-700">
            Cette fois N <strong>n’est plus construit</strong> : tu le déplaces toi-même sur (AC).
            Les chevrons verts de parallélisme n’apparaissent que si les droites le sont vraiment.
          </p>
          <ThalesLab
            figure={fig}
            k={k}
            onKChange={(v) => { setK(v); observe(v, kn); if (vus.size >= 1) kit.react(true); }}
            kn={kn}
            onKnChange={(v) => { setKn(v); observe(k, v); if (vus.size >= 1) kit.react(true); }}
            mode="free"
            disabled={done1}
            ariaLabel="Configuration libre : déplace M et N indépendamment"
          />
          {done1 ? (
            <Feedback tone="ok">
              Les deux vont toujours ensemble : dès que les trois rapports coïncident, les chevrons
              apparaissent — et dès qu’ils diffèrent, le parallélisme disparaît. C’est une{' '}
              <strong>équivalence</strong>, utilisable dans les deux sens.
            </Feedback>
          ) : (
            <Feedback tone="info">
              Situations rencontrées : {vus.size} sur 2. Actuellement, les rapports{' '}
              {agree ? 'coïncident' : 'diffèrent'} et les droites {parallel ? 'sont' : 'ne sont pas'}{' '}
              parallèles. {vus.size > 0 && 'Cherche maintenant l’autre situation.'}
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Deux énoncés chiffrés',
      subtitle: 'Ici, aucune figure : seulement des nombres.',
      done: batch,
      content: (
        <div className="space-y-3">
        <KnowledgeBrick
          id="reciproque-thales"
          variant="new"
          lead="Jusqu’ici le parallélisme était donné. Cette fois, c’est lui qu’on cherche à prouver."
        />
        <BatchChoiceQuestion
          intro={
            <p className="text-sm text-slate-700">
              Dans chaque cas, A, M, B sont alignés et A, N, C aussi, dans le même ordre.
              Les droites (MN) et (BC) sont-elles parallèles ?
            </p>
          }
          rows={[
            {
              id: 'c1',
              label: 'AM = 4, AB = 10, AN = 6, AC = 15',
              options: ['Parallèles', 'Non parallèles'],
              correct: 0,
              correction: 'AM/AB = 4/10 = 0,4 et AN/AC = 6/15 = 0,4. Les rapports sont égaux : d’après la RÉCIPROQUE du théorème de Thalès, les droites sont parallèles.',
            },
            {
              id: 'c2',
              label: 'AM = 3, AB = 8, AN = 5, AC = 12',
              options: ['Parallèles', 'Non parallèles'],
              correct: 1,
              correction: 'AM/AB = 3/8 = 0,375 et AN/AC = 5/12 ≈ 0,417. Les rapports diffèrent : d’après la CONTRAPOSÉE, les droites ne sont pas parallèles.',
            },
            {
              id: 'c3',
              label: 'AM = 5, AB = 20, AN = 3, AC = 12',
              options: ['Parallèles', 'Non parallèles'],
              correct: 0,
              correction: '5/20 = 0,25 et 3/12 = 0,25. Rapports égaux, donc parallèles — même si les longueurs elles-mêmes n’ont rien de semblable.',
            },
            {
              id: 'c4',
              label: 'AM = 6, AB = 9, AN = 6, AC = 10',
              options: ['Parallèles', 'Non parallèles'],
              correct: 1,
              correction: '6/9 ≈ 0,667 et 6/10 = 0,6. Attention : AM et AN sont égaux, mais ce sont les RAPPORTS qu’il faut comparer, pas les longueurs.',
            },
          ]}
          feedback={({ allRight, nCorrect, total }) => (
            <Feedback tone={allRight ? 'ok' : 'info'}>
              {allRight
                ? 'Tu compares systématiquement les deux rapports, et jamais les longueurs entre elles.'
                : `${nCorrect} sur ${total}. Calcule toujours les deux quotients, puis compare-les — des longueurs égales ne suffisent pas.`}
            </Feedback>
          )}
          requires={['reciproque-thales', 'theoreme-thales', 'quotient']}
          solved={batch}
          onAnswered={() => setBatch(true)}
        />
        {batch && (
          <KnowledgeBrick
            id="contraposee-thales"
            variant="new"
            compact
            lead="Les cas « non parallèles » que tu viens de trancher ont eux aussi leur énoncé."
          />
        )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'La condition qu’on oublie',
      done: q3,
      content: (
        <TapQuestion
          prompt="Pour appliquer la réciproque, que faut-il vérifier EN PLUS de l’égalité des rapports ?"
          options={[
            'Que les points sont alignés dans le même ordre sur les deux droites',
            'Que les longueurs sont des nombres entiers',
            'Que le triangle est isocèle',
            'Rien d’autre, l’égalité des rapports suffit toujours',
          ]}
          correct={0}
          cols={1}
          explain="Si les points ne se correspondent pas dans le même ordre (l’un du côté de A, l’autre au-delà), les rapports peuvent être égaux sans que les droites soient parallèles. L’énoncé complet de la réciproque exige donc cette condition d’ordre."
          explainWrong="L’égalité des rapports ne suffit pas à elle seule : il faut aussi que les points soient disposés dans le même ordre sur les deux droites."
          requires={['reciproque-thales']}
          solved={q3}
          onAnswered={() => setQ3(true)}
        />
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(5)}
      moduleNumber={5}
      moduleTitle="Et si ce n’est pas parallèle ?"
      moduleSubtitle="Réciproque et contraposée, manipulées avant d’être nommées"
      estimatedTime="10 min"
      brief={{
        tag: 'Manipulation',
        title: 'Le théorème dans l’autre sens',
        tone: 'purple',
        body: (
          <p>
            Jusqu’ici le parallélisme était donné. Maintenant, c’est lui qu’on veut{' '}
            <strong>établir</strong> — à partir des seules longueurs.
          </p>
        ),
      }}
      intro={
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { icon: GitCompareArrows, t: 'Réciproque', d: 'Rapports égaux ⇒ droites parallèles.', c: 'text-emerald-600' },
            { icon: XCircle, t: 'Contraposée', d: 'Rapports différents ⇒ droites non parallèles.', c: 'text-rose-600' },
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
        <KnowledgeSnapshot moduleNumber={5}>
          <strong>La suite.</strong> Deux énoncés, deux usages. Reste à choisir le bon au bon
          moment.
        </KnowledgeSnapshot>
      )}
    />
  );
}
