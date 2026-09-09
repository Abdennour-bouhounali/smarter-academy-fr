import React, { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick, PredictionChips } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import QuadLab from '../components/QuadLab';
import { etatQuad, quatriemeSommet } from '../components/paral';

/**
 * Module 1 — DÉCLENCHEUR : le portail qui s'ouvre.
 *
 * §6bis — la leçon OUVRE sur la manipulation : l'étape 1 rend le laboratoire,
 * pas une définition ni une question de prédiction bloquante. L'élève traîne
 * le sommet D d'un quadrilatère quelconque et regarde quatre témoins.
 *
 * L'EXPÉRIENCE SURPRENANTE — celle qui fait la leçon : l'élève cherche à
 * allumer les DEUX lampes de parallélisme, et les DEUX lampes d'égalité des
 * longueurs s'allument au même instant, sans qu'il les ait demandées. Le
 * parallélisme des côtés opposés emporte donc l'égalité des longueurs. Il n'a
 * rien à mémoriser : il l'a fait arriver.
 *
 * Expected observation : « quand les deux premières lampes s'allument, les
 * deux autres s'allument aussi — et il n'y a qu'UNE place pour D ».
 * Misconception targeted : (a) « un parallélogramme, c'est un rectangle
 * penché » — donc il faudrait des angles droits ; (b) « côtés parallèles » et
 * « côtés égaux » seraient deux conditions à régler séparément.
 *
 * Ce que ce module NE fait PAS, et qui appartient aux suivants : construire
 * la quatrième place à la règle et au compas (M2), énoncer la propriété des
 * côtés (M3), les diagonales (M4), les caractérisations (M5).
 */

/* Le quadrilatère de départ N'EST PAS un parallélogramme — sinon l'étape
   serait résolue au montage (le bug « a start state that already satisfies
   the goal », §6ter.7). D est posé volontairement à côté de sa place. */
const A = { x: 190, y: 390 };
const B = { x: 470, y: 390 };
const C = { x: 560, y: 190 };
const D_JUSTE = quatriemeSommet(A, B, C);
const DEPART = [A, B, C, { x: D_JUSTE.x + 95, y: D_JUSTE.y + 70 }];

export default function Module01LePortailQuiSouvre() {
  const [pts, setPts] = useState(DEPART);
  const [trouve, setTrouve] = useState(false);
  const [pred, setPred] = useState(null);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);

  const etat = etatQuad(pts);
  const { temoins } = etat;
  const parallelismes = temoins.parAbDc.ok && temoins.parAdBc.ok;
  const egalites = temoins.egAbDc.ok && temoins.egAdBc.ok;

  const bouger = (next, react) => {
    setPts(next);
    const t = etatQuad(next).temoins;
    if (t.parAbDc.ok && t.parAdBc.ok && !trouve) {
      setTrouve(true);
      react?.(true);
    }
  };

  const steps = [
    {
      num: 1,
      title: 'Allume les deux témoins de parallélisme',
      subtitle: 'Prends le sommet D et déplace-le jusqu’à ce que (AB) ∥ (DC) et (AD) ∥ (BC) s’allument tous les deux.',
      done: trouve,
      content: (kit) => (
        <div className="space-y-3">
          <QuadLab
            pts={pts}
            onPts={(next) => bouger(next, kit.react)}
            mobiles={[3]}
            montrerTemoins
            montrerCodages
            ariaLabel="Un quadrilatère ABCD dont on déplace le sommet D pour rendre les côtés opposés parallèles"
          />
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => setPts(DEPART)}
              className="rounded-xl border-2 border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 hover:border-slate-300 transition"
            >
              ↺ Remettre D à sa place de départ
            </button>
          </div>

          {!trouve ? (
            <>
              {/* §6ter.3 — la prédiction se recueille SANS verdict : elle
                  engage le regard, elle ne note rien. L'expérience répondra. */}
              <PredictionChips
                prompt="avant de chercher : d’après toi, combien de témoins seront allumés quand les deux premiers le seront ?"
                options={[
                  { id: 'deux', label: 'Deux — juste ceux que je vise' },
                  { id: 'trois', label: 'Trois' },
                  { id: 'quatre', label: 'Les quatre' },
                ]}
                value={pred}
                onChange={setPred}
              />
              <Feedback tone="info">
                {temoins.parAbDc.ok || temoins.parAdBc.ok
                  ? <>Un témoin de parallélisme est allumé. Continue : il en manque un, il s’en faut de <strong>{Math.round(temoins.parAbDc.ok ? temoins.parAdBc.ecart : temoins.parAbDc.ecart)}°</strong>.</>
                  : <>Traîne la grosse pastille violette. Les témoins se rallument tout seuls : tu ne peux rien casser.</>}
              </Feedback>
            </>
          ) : (
            <Feedback tone="ok">
              {pred === 'quatre' ? 'Ta prédiction était la bonne' : 'Regarde les quatre témoins'} :{' '}
              tu n’as visé que les deux <strong>parallélismes</strong>, et les deux{' '}
              <strong>égalités de longueurs</strong> se sont allumées en même temps. Tu ne les as
              pas demandées — elles sont arrivées avec.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Essaie de les séparer',
      subtitle: 'Peux-tu allumer les deux parallélismes SANS que les longueurs soient égales ?',
      done: q2,
      content: (
        <div className="space-y-3">
          <div className="rounded-xl border-2 border-indigo-200 bg-indigo-50 p-3.5 text-sm text-slate-700">
            Le laboratoire reste ouvert : déplace D autant que tu veux. La question est de savoir
            si les quatre témoins peuvent <em>ne pas</em> s’allumer ensemble.
          </div>
          {/* Le labo est REJOUÉ ici, jamais gelé : une manipulation validée
              reste manipulable (règle « ne jamais geler un labo après
              validation », mémoire frozen_manipulation_bug_class). */}
          <QuadLab
            pts={pts}
            onPts={setPts}
            mobiles={[3]}
            montrerTemoins
            montrerCodages
            ariaLabel="Le même quadrilatère : essayer de séparer le parallélisme de l’égalité des longueurs"
          />
          <div className="grid sm:grid-cols-2 gap-2">
            <Etat titre="Les deux parallélismes" ok={parallelismes} />
            <Etat titre="Les deux égalités" ok={egalites} />
          </div>
          <TapQuestion
            prompt="Après avoir cherché : est-il possible que les côtés opposés soient parallèles deux à deux SANS être égaux deux à deux ?"
            options={[
              'Non — dès que les deux parallélismes sont là, les longueurs suivent',
              'Oui, si on déplace D assez loin',
              'Oui, si la figure est très aplatie',
            ]}
            cols={1}
            correct={0}
            /* Aucune brique n'est encore posée : cette question ne demande que
               ce que l'élève VIENT DE FAIRE avec ses mains, plus le
               parallélisme de 6e. C'est elle qui rend la définition légitime. */
            requires={['droites-paralleles', 'quadrilatere']}
            explain="Impossible : les deux témoins d’égalité s’allument exactement au même instant que les deux témoins de parallélisme. Une seule condition — le parallélisme des deux paires — impose l’autre."
            explainWrong="On peut déplacer D aussi loin qu’on veut : les quatre témoins restent solidaires. Ils ne s’allument jamais deux par deux, parce que le parallélisme des côtés opposés IMPOSE leur égalité — c’est ce que la figure vient de te montrer."
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
        </div>
      ),
    },
    {
      num: 3,
      title: 'La figure a un nom',
      done: q3,
      content: (
        <div className="space-y-3">
          {/* La manipulation a eu lieu, l'invariant a été constaté deux fois :
              le mot arrive maintenant NOMMER quelque chose de vécu (§6, §14). */}
          <KnowledgeBrick
            id="parallelogramme"
            variant="new"
            lead={<>Tu viens de fabriquer une figure très particulière — et de constater qu’une seule condition en impose plusieurs. Cette figure porte un nom.</>}
          />
          <TapQuestion
            prompt="Un quadrilatère a ses côtés opposés parallèles deux à deux, mais aucun angle droit. Comment s’appelle-t-il ?"
            options={[
              'Un parallélogramme',
              'Ce n’est pas un parallélogramme : il lui manque les angles droits',
              'Un trapèze',
              'Un losange',
            ]}
            cols={1}
            correct={0}
            requires={['parallelogramme', 'quadrilatere', 'angle-droit']}
            explain="C’est exactement la définition : côtés opposés parallèles deux à deux. Les angles droits n’y figurent pas — un parallélogramme peut en avoir, mais il n’en a pas besoin."
            explainWrong="Les angles droits ne sont pas dans la définition. Un quadrilatère à côtés opposés parallèles est un parallélogramme, penché ou non. C’est justement la figure que tu viens de construire sans jamais viser un angle droit."
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
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      moduleTitle="Le portail qui s’ouvre"
      moduleSubtitle="Une condition qui en impose plusieurs"
      estimatedTime="11 min"
      brief={{
        tag: 'Découverte',
        title: 'Quatre témoins, une seule manœuvre',
        tone: 'indigo',
        body: (
          <p>
            Un portillon de jardin en croisillons s’ouvre et se ferme : les lattes restent
            parallèles, les cases se déforment sans jamais se déchirer. Ici, tu tiens le quatrième
            sommet d’un quadrilatère. <strong>Vise les deux témoins de parallélisme</strong> — et
            regarde ce que font les deux autres.
          </p>
        ),
      }}
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={1} />}
    />
  );
}

/** Un état lisible sans couleur seule (§27 : jamais l'information par la couleur). */
function Etat({ titre, ok }) {
  return (
    <div className={`rounded-xl border-2 px-3 py-2.5 text-center ${ok ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200 bg-white'}`}>
      <div className="text-sm font-bold text-slate-700">{titre}</div>
      <div className={`text-xs font-bold ${ok ? 'text-emerald-700' : 'text-slate-400'}`}>
        {ok ? '✓ allumés' : '○ éteints'}
      </div>
    </div>
  );
}
