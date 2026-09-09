import React, { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import QuadLab from '../components/QuadLab';
import { DEPARTS_M2, cm, estParallelogramme, quatriemeSommet } from '../components/paral';
import { dist } from '../../../../../common/geo5e/geo5e';

/**
 * Module 2 — DÉCOUVERTE : la quatrième place.
 *
 * Le module 1 a laissé l'élève avec un fait : quand les côtés opposés
 * deviennent parallèles, tout s'aligne. Ce module pose LA question suivante :
 * cette place, est-ce qu'on la trouve à l'œil, ou est-elle imposée ?
 *
 * ACTION → CHANGE → OBSERVATION → SENS
 *   action      : placer D, trois fois, depuis trois triangles différents
 *   change      : la cible en pointillé n'est révélée QU'APRÈS le placement
 *   observation : à chaque fois, il n'y avait qu'une place — et elle ne
 *                 dépendait pas du coup d'œil, mais de A, B et C
 *   sens        : le quatrième sommet se CONSTRUIT ; deux méthodes le
 *                 donnent, et elles tombent sur le même point
 *
 * Expected observation : « je ne choisis pas D, je le trouve — trois points
 * suffisent à le décider ».
 * Misconception targeted : (d) de la spec — conclure d'un dessin qui
 * ressemble. Ici, « ça a l'air bon » est mesuré, et l'écart est affiché.
 *
 * Les trois départs sont FIXES (DEPARTS_M2) et non tirés au hasard : la
 * manipulation doit être reproductible (§28). Ils ouvrent dans trois
 * directions différentes pour qu'on ne puisse pas replacer D « au même
 * endroit que la dernière fois ».
 */
const TOL_PLACEMENT = 22;   // en unités de figure : sous ce que l'œil sépare

export default function Module02LaQuatriemePlace() {
  const [idx, setIdx] = useState(0);
  const [pts, setPts] = useState(() => depart(0));
  const [reussis, setReussis] = useState([]);
  const [verifie, setVerifie] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);

  const conf = DEPARTS_M2[idx];
  const cible = quatriemeSommet(conf.A, conf.B, conf.C);
  const ecart = dist(pts[3], cible);
  const gagne = ecart <= TOL_PLACEMENT;
  const troisFaits = reussis.length >= 3;

  function depart(i) {
    const { A, B, C } = DEPARTS_M2[i];
    // D part LOIN de sa place : l'étape ne peut pas être résolue au montage.
    const c = quatriemeSommet(A, B, C);
    return [A, B, C, { x: Math.min(700, c.x + 120), y: Math.min(470, c.y + 95) }];
  }

  const verifier = (react) => {
    setVerifie(true);
    if (gagne && !reussis.includes(conf.id)) {
      const next = [...reussis, conf.id];
      setReussis(next);
      react?.(true);
    }
  };

  const suivant = () => {
    const i = (idx + 1) % DEPARTS_M2.length;
    setIdx(i);
    setPts(depart(i));
    setVerifie(false);
  };

  const steps = [
    {
      num: 1,
      title: 'Place le quatrième sommet — trois fois',
      subtitle: 'A, B et C sont posés. Amène D là où ABCD devient un parallélogramme, puis vérifie.',
      done: troisFaits,
      content: (kit) => (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="text-sm font-bold text-slate-700">
              Configuration {idx + 1} sur 3
            </div>
            <div className="flex gap-1.5">
              {DEPARTS_M2.map((d) => (
                <span
                  key={d.id}
                  className={`inline-block w-6 h-2.5 rounded-full ${reussis.includes(d.id) ? 'bg-emerald-500' : 'bg-slate-200'}`}
                  aria-label={reussis.includes(d.id) ? 'réussie' : 'à faire'}
                />
              ))}
            </div>
          </div>

          <QuadLab
            pts={pts}
            onPts={(next) => { setPts(next); setVerifie(false); }}
            mobiles={[3]}
            /* Pas de témoins ici : c'est TOUT le sujet du module. L'élève doit
               viser sans lampe, puis découvrir s'il avait raison. Les lampes
               reviendraient lui donner la réponse pendant qu'il cherche. */
            montrerTemoins={false}
            montrerCodages={false}
            cible={verifie ? { p: cible, r: 18 } : null}
            ariaLabel="Trois points A, B et C posés : placer le quatrième sommet D"
          />

          <div className="flex flex-wrap gap-2 justify-center">
            <button
              type="button"
              onClick={() => verifier(kit.react)}
              className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-indigo-700 transition min-h-[44px]"
            >
              Vérifier ma place
            </button>
            <button
              type="button"
              onClick={suivant}
              className="rounded-xl border-2 border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600 hover:border-slate-300 transition min-h-[44px]"
            >
              Configuration suivante →
            </button>
          </div>

          {verifie && (
            gagne ? (
              <Feedback tone="ok">
                Bien placé — l’écart avec la seule place possible est de{' '}
                <strong>{cm(ecart)} cm</strong>. L’anneau orange te montre où elle était :
                tu es dedans.
              </Feedback>
            ) : (
              /* Le retour DIAGNOSTIQUE : il nomme l'écart mesuré et laisse la
                 construction de l'élève en place (§12 — l'erreur reste à
                 l'écran, elle devient une information). */
              <Feedback tone="ko">
                Ton point est à <strong>{cm(ecart)} cm</strong> de la seule place possible —
                l’anneau orange. À l’œil c’était crédible, et pourtant la figure n’est{' '}
                <strong>pas</strong> un parallélogramme : {estParallelogramme(pts) ? '' : 'ses côtés opposés ne sont pas parallèles. '}
                Amène D dans l’anneau et vérifie à nouveau.
              </Feedback>
            )
          )}

          {!verifie && (
            <Feedback tone="info">
              Vise d’abord à l’œil, puis vérifie. C’est en voyant l’écart que tu sauras si le coup
              d’œil suffit.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Comment la construire à coup sûr',
      done: q2,
      content: (
        <div className="space-y-3">
          {/* Trois placements viennent d'avoir lieu : la méthode arrive
              nommer un geste déjà fait, jamais l'ouvrir (§6, §6quinquies). */}
          <KnowledgeBrick
            id="construire-parallelogramme"
            variant="new"
            lead={<>Trois fois de suite, il n’y avait qu’une place. Elle ne se devine pas : elle se construit, et deux méthodes y mènent.</>}
          />
          <TapQuestion
            prompt="A, B et C sont placés et l’on veut construire D pour que ABCD soit un parallélogramme. Quelle construction donne D ?"
            options={[
              'La parallèle à (AB) passant par C, coupée par la parallèle à (BC) passant par A',
              'La parallèle à (AB) passant par B, coupée par la parallèle à (BC) passant par C',
              'Le milieu du segment [AC]',
              'Le point situé à égale distance de A, B et C',
            ]}
            cols={1}
            correct={0}
            requires={['construire-parallelogramme', 'droites-paralleles']}
            explain="D doit être sur la parallèle à (AB) menée par C — pour que (DC) ∥ (AB) — ET sur la parallèle à (BC) menée par A — pour que (AD) ∥ (BC). Ces deux droites se croisent en un seul point : D."
            explainWrong="Une parallèle à (AB) passant par B serait la droite (AB) elle-même : elle ne peut pas porter D. Il faut mener chaque parallèle par le sommet OPPOSÉ au côté qu’on veut reproduire — par C pour le côté [AB], par A pour le côté [BC]."
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
        </div>
      ),
    },
    {
      num: 3,
      title: 'L’ordre des lettres',
      done: q3,
      content: (
        <div className="space-y-3">
          {/* La position d'ENSEIGNEMENT du mot « côté opposé » : le contenu
              d'étape, avant la question qui s'en sert (§6quinquies). Il ne
              peut pas vivre dans l'explain de cette question, qui arrive
              après la réponse. */}
          <div className="rounded-xl border-2 border-indigo-200 bg-indigo-50 p-3.5 text-sm text-slate-700 space-y-2">
            <p>
              Dans le nom <strong className="font-mono">ABCD</strong>, on lit les sommets{' '}
              <strong>dans l’ordre du contour</strong> : les côtés sont [AB], [BC], [CD] et [DA].
            </p>
            <p>
              Le <strong>côté opposé</strong> à un côté donné, c’est celui qui n’a{' '}
              <strong>aucun sommet commun</strong> avec lui — les deux ne se touchent nulle part.
              Un côté opposé s’oppose ainsi au côté <em>consécutif</em>, qui, lui, partage un
              sommet. Dans ABCD, le côté opposé à [BC] est [AD] : B et C n’apparaissent ni dans
              l’un ni dans l’autre.
            </p>
          </div>
          <TapQuestion
            prompt="Dans le quadrilatère ABCD, quel côté est opposé au côté [AB] ?"
            options={['[DC]', '[BC]', '[AD]', '[AC]']}
            cols={4}
            correct={0}
            requires={['quadrilatere', 'notation-segment', 'construire-parallelogramme']}
            explain="[AB] et [DC] ne se touchent pas : ce sont les côtés opposés. [BC] touche [AB] en B, [AD] le touche en A, et [AC] n’est pas un côté mais une diagonale."
            explainWrong="[BC] partage le sommet B avec [AB] : deux côtés qui se touchent sont dits consécutifs, pas opposés. Le côté opposé à [AB] est celui qui n’a aucun sommet commun avec lui : [DC]."
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
      moduleTitle="La quatrième place"
      moduleSubtitle="Elle ne se devine pas, elle se construit"
      estimatedTime="11 min"
      brief={{
        tag: 'Découverte',
        title: 'Trois points suffisent-ils à décider du quatrième ?',
        tone: 'indigo',
        body: (
          <p>
            Trois sommets sont posés sur la feuille. Tu tiens le quatrième. Place-le où tu penses
            que la figure devient un parallélogramme — puis <strong>vérifie</strong>. On saura
            alors si le coup d’œil suffit.
          </p>
        ),
      }}
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={2} />}
    />
  );
}
