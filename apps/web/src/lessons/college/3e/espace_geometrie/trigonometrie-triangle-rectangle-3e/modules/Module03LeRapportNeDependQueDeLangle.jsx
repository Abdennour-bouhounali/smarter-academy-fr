import React, { useState } from 'react';
import { Maximize2, Stamp } from 'lucide-react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import RatioLab from '../components/RatioLab';
import { SIGNATURE, sidesFor, ratiosFromSides } from '../components/trigoUtils';

/**
 * Module 3 — DÉCOUVERTE, et l'interaction SIGNATURE de la leçon.
 *
 * Activity              agrandir le triangle en gardant l'angle, puis changer
 *                       l'angle.
 * Mathematical objective un rapport de deux côtés ne dépend QUE de l'angle.
 * Student action        régler la taille, relever ; puis régler l'angle.
 * Controlled variable   une seule chose à la fois — c'est ce qui rend la
 *                       conclusion imparable.
 * Mathematical state    l'angle et l'échelle ; les rapports en sont dérivés.
 * Visual consequence    les triangles s'emboîtent (fantômes), les longueurs
 *                       changent, les trois quotients ne bougent pas.
 * Expected observation  « tout grandit sauf les quotients ».
 * Misconception ciblée   croire qu'un plus grand triangle a de plus grands
 *                       rapports. L'étape 3 montre l'inverse : c'est l'ANGLE,
 *                       et lui seul, qui les fait changer.
 * Formalization         module 4 : ces trois nombres reçoivent leurs noms.
 */
export default function Module03LeRapportNeDependQueDeLangle() {
  const [hyp, setHyp] = useState(SIGNATURE.echelles[0]);
  const [alpha, setAlpha] = useState(SIGNATURE.alpha);
  const [releves, setReleves] = useState([]);
  const [ghosts, setGhosts] = useState([SIGNATURE.echelles[0]]);

  const s = sidesFor(alpha, hyp);
  const r = ratiosFromSides(s);
  const f = (v) => (v === null ? '—' : v.toFixed(2).replace('.', ','));

  const relever = (react) => {
    if (releves.some((x) => x.hyp === Math.round(hyp))) return false;
    setReleves((rs) => [...rs, {
      hyp: Math.round(hyp), opp: Math.round(s.opp), adj: Math.round(s.adj),
      sin: f(r.sin), cos: f(r.cos), tan: f(r.tan),
    }]);
    react(true);
    return true;
  };
  const done1 = releves.length >= 3;

  const [alphaChanged, setAlphaChanged] = useState(false);
  const done2 = alphaChanged;
  const [q3, setQ3] = useState(false);

  const steps = [
    {
      num: 1,
      title: 'Agrandis le triangle, sans toucher à l’angle',
      subtitle: 'Trois tailles, trois relevés. Surveille les trois quotients.',
      done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <p className="text-sm text-slate-700">
            L’angle reste bloqué à <strong>{SIGNATURE.alpha}°</strong>. Seule la taille change — et
            les triangles précédents restent en pointillé pour que tu voies l’emboîtement.
          </p>
          <RatioLab
            alpha={alpha}
            hyp={hyp}
            onHypChange={(h) => { setHyp(h); setGhosts((g) => (g.includes(h) ? g : [...g, h])); }}
            ghosts={ghosts}
            disabled={done1}
            ariaLabel="Triangle agrandi à angle constant"
          />
          {!done1 && (
            <button
              type="button"
              onClick={() => relever(kit.react)}
              className="w-full sm:w-auto px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700
                         text-white font-semibold min-h-[44px]"
            >
              Relever les trois quotients ({releves.length}/3)
            </button>
          )}
          {releves.length > 0 && (
            <div className="space-y-1">
              {releves.map((x, i) => (
                <p key={i} className="text-xs font-mono text-center text-slate-700 tabular-nums">
                  côtés {x.opp} / {x.adj} / {x.hyp} → quotients{' '}
                  <strong className="text-emerald-700">{x.sin} · {x.cos} · {x.tan}</strong>
                </p>
              ))}
            </div>
          )}
          {done1 && (
            <Feedback tone="ok">
              Trois tailles, trois séries de longueurs <strong>toutes différentes</strong> — et
              exactement les mêmes trois quotients. Agrandir un triangle ne change aucun de ses
              rapports.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Maintenant, change l’angle',
      subtitle: 'Une seule chose bouge, et cette fois les quotients suivent.',
      done: done2,
      content: (kit) => (
        <div className="space-y-3">
          <RatioLab
            alpha={alpha}
            hyp={hyp}
            onAlphaChange={(a) => { setAlpha(a); setAlphaChanged(true); kit.react(true); }}
            ghosts={[]}
            disabled={done2}
            ariaLabel="Triangle dont on change l’angle"
          />
          {done2 ? (
            <Feedback tone="ok">
              À {alpha}°, les quotients valent {f(r.sin)} · {f(r.cos)} · {f(r.tan)} — différents de
              ceux de {SIGNATURE.alpha}°. Conclusion : les trois rapports{' '}
              <strong>dépendent de l’angle, et de rien d’autre</strong>. C’est pour cela qu’on peut
              leur donner un nom et les mettre dans une calculatrice.
            </Feedback>
          ) : (
            <Feedback tone="info">
              Angle actuel : {alpha}°. Modifie-le et compare les quotients à ceux du relevé
              précédent.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'La conclusion',
      done: q3,
      content: (
        <div className="space-y-3">
        <TapQuestion
          prompt="De quoi dépend le quotient opposé ÷ hypoténuse dans un triangle rectangle ?"
          options={[
            'Uniquement de l’angle étudié',
            'De la taille du triangle',
            'De la longueur de l’hypoténuse',
            'De l’aire du triangle',
          ]}
          correct={0}
          cols={1}
          explain="Tu l’as vérifié dans les deux sens : changer la taille ne modifie rien, changer l’angle modifie tout. Ce quotient est donc entièrement déterminé par l’angle — c’est ce qui permet de le tabuler une fois pour toutes, angle par angle."
          explainWrong="Les trois relevés de l’étape 1 avaient des tailles différentes et donnaient les mêmes quotients. Seul le changement d’angle les a fait bouger."
          requires={['cote-oppose', 'hypotenuse']}
          solved={q3}
          onAnswered={() => setQ3(true)}
        />
        {q3 && (
          <KnowledgeBrick
            id="rapport-depend-angle"
            variant="new"
            lead="Voilà la propriété que tes agrandissements viennent de mettre en évidence."
          />
        )}
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="Le rapport ne dépend que de l’angle"
      moduleSubtitle="Agrandir ne change rien, incliner change tout"
      estimatedTime="10 min"
      brief={{
        tag: 'Découverte',
        title: 'L’invariant de la trigonométrie',
        tone: 'emerald',
        body: (
          <p>
            Deux réglages, testés séparément : la <strong>taille</strong>, puis l’
            <strong>angle</strong>. Un seul des deux fait bouger les quotients — et c’est toute la
            raison d’être de cette leçon.
          </p>
        ),
      }}
      intro={
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { icon: Maximize2, t: 'Agrandir', d: 'Les longueurs changent, les quotients non.', c: 'text-emerald-600' },
            { icon: Stamp, t: 'Relever', d: 'Trois tailles valent mieux qu’une.', c: 'text-violet-600' },
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
        <KnowledgeSnapshot moduleNumber={3}>
          <strong>La suite.</strong> Chaque rapport est déterminé par l’angle seul. Au module
          suivant, ces trois rapports reçoivent enfin leur nom.
        </KnowledgeSnapshot>
      )}
    />
  );
}
