import React, { useState } from 'react';
import { ContentModule, TapQuestion, PredictionChips, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import FourLab from '../components/FourLab';
import { FOUR, DUREES } from '../components/situations';
import { fr, trend } from '../components/fonctionsUtils';

/**
 * Module 1 — DÉCLENCHEUR, et l'interaction SIGNATURE : le four
 * (components/FourLab.jsx).
 *
 * Activity               régler UNE molette et voir TROIS grandeurs réagir.
 * Mathematical objective une grandeur d'entrée en détermine d'autres ; et une
 *                        même entrée redonne toujours la même sortie.
 * Student action         tourner la molette ; revenir sur une durée déjà vue.
 * Controlled variable    la durée de cuisson, et elle seule.
 * Mathematical state     un entier t ∈ [0, 25] ; les trois sorties en
 *                        découlent par leurs règles.
 * Visual consequence     la miche change de teinte et les trois lectures se
 *                        réécrivent, sans clic de validation.
 * Expected observation   « je remets 12 minutes et je retrouve exactement le
 *                        même pain » ; « la masse DESCEND quand la durée
 *                        monte — et ça dépend quand même de la durée ».
 * Misconception targeted croire que « dépendre » signifie « augmenter
 *                        ensemble » ; croire qu'une dépendance doit être
 *                        proportionnelle.
 * Formalization          « en fonction de » est délibérément LAISSÉ au module
 *                        2 : ici, l'élève constate seulement qu'une grandeur
 *                        commande et que d'autres suivent.
 * Transfer               module 2 : comment dire cela en une seule phrase ?
 *
 * PÉRIMÈTRE : ni f(x), ni « image », ni « antécédent » (3e).
 *
 * §6bis / règle M1 : l'étape 1 REND la manipulation ; la prédiction vit à
 * l'intérieur comme une invitation, jamais comme un péage. Le labo reste
 * REJOUABLE — aucun `disabled` lié à `done`.
 */
export default function Module01LeFour() {
  // Étape 1 — découvrir que tout réagit à une seule commande.
  const [t1, setT1] = useState(0);
  const [tried1, setTried1] = useState([]);
  const [pred1, setPred1] = useState(null);
  const done1 = tried1.length >= 4;

  // Étape 2 — revenir sur une durée déjà essayée : l'invariant.
  const [t2, setT2] = useState(12);
  const [visited2, setVisited2] = useState([12]);
  const [revenu2, setRevenu2] = useState(false);
  const done2 = revenu2;

  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);

  const regler1 = (v, react) => {
    setT1(v);
    if (!tried1.includes(v)) {
      const next = [...tried1, v];
      setTried1(next);
      if (next.length >= 4) react?.(true);
    }
  };

  /**
   * L'étape 2 est atteinte quand l'élève REVIENT sur une durée déjà visitée :
   * c'est le geste qui produit l'observation « le même pain revient ». On
   * mémorise donc les durées vues, et le fait d'y être revenu.
   */
  const regler2 = (v, react) => {
    if (visited2.includes(v) && v !== t2 && !revenu2) {
      setRevenu2(true);
      react?.(true);
    }
    if (!visited2.includes(v)) setVisited2([...visited2, v]);
    setT2(v);
  };

  const steps = [
    {
      num: 1,
      title: 'Enfourne le pain',
      subtitle: 'Une seule molette. Regarde combien de choses changent en même temps.',
      done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <FourLab
            quantities={FOUR}
            t={t1}
            onT={(v) => regler1(v, kit.react)}
            durees={DUREES}
            tried={tried1}
          />
          {/* §6ter.3 — prédiction SANS verdict : le labo répondra. */}
          <PredictionChips
            prompt="en cuisant plus longtemps, la masse du pain va…"
            options={[
              { id: 'monter', label: 'augmenter' },
              { id: 'descendre', label: 'diminuer' },
              { id: 'stable', label: 'ne pas bouger' },
            ]}
            value={pred1}
            onChange={setPred1}
          />
          {done1 ? (
            <Feedback tone="ok">
              Tu n’as réglé <strong>qu’une seule chose</strong> — la durée — et trois grandeurs ont
              bougé. Surprise : la masse <strong>diminue</strong> pendant que la température monte.
              Le pain perd de l’eau en cuisant.
            </Feedback>
          ) : (
            <Feedback tone="info">
              Essaie au moins quatre durées différentes. Que fait la masse quand la durée augmente ?
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Reviens en arrière',
      subtitle: 'Repose la molette sur une durée que tu as déjà essayée.',
      done: done2,
      content: (kit) => (
        <div className="space-y-3">
          <FourLab
            quantities={FOUR}
            t={t2}
            onT={(v) => regler2(v, kit.react)}
            durees={DUREES}
            tried={visited2}
          />
          {done2 ? (
            <Feedback tone="ok">
              <strong>Exactement le même pain.</strong> À {t2} minutes, la couleur, la masse et la
              température reprennent les valeurs qu’elles avaient déjà. Rien n’est laissé au
              hasard : la durée <em>détermine</em> le résultat.
            </Feedback>
          ) : (
            <Feedback tone="info">
              Change la durée, puis <strong>reviens</strong> sur une durée déjà essayée. Retrouves-tu
              le même pain ?
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Qui commande, qui suit',
      done: q3,
      content: (
        <div className="space-y-3">
          {/* Deux gestes ont produit les deux constats : les briques les
              nomment, sans introduire « en fonction de » (module 2). */}
          <KnowledgeBrick
            id="dependance"
            variant="new"
            lead={<>Une molette, trois grandeurs qui suivent — dont une qui descend.</>}
          />
          <KnowledgeBrick
            id="meme-entree-meme-sortie"
            variant="new"
            lead={<>Et en revenant sur {t2} minutes, tu as retrouvé le même pain.</>}
          />
          <TapQuestion
            prompt="Dans le four, quelle grandeur commande toutes les autres ?"
            options={[
              'La durée de cuisson',
              'La masse du pain',
              'La température à cœur',
              'La couleur de la croûte',
            ]}
            cols={2}
            correct={0}
            requires={['dependance']}
            explain="La durée est la seule que tu règles toi-même. Les trois autres en dépendent : tu ne peux pas choisir la couleur directement, seulement la durée qui la produit."
            explainWrong="La masse, la température et la couleur ne se règlent pas : elles réagissent. Sur le four, il n’y a qu’une molette — la durée."
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
        </div>
      ),
    },
    {
      num: 4,
      title: 'Dépendre, ce n’est pas monter',
      done: q4,
      content: (
        <div className="space-y-3">
          <div className="rounded-xl border-2 border-slate-200 bg-white p-3.5 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 text-center">
              De 5 min à 20 min
            </p>
            <div className="grid sm:grid-cols-3 gap-2">
              {FOUR.map((q) => {
                const sens = trend(q, 5, 20);
                return (
                  <div
                    key={q.id}
                    className="rounded-xl border-2 border-slate-200 bg-slate-50 px-3 py-2 text-center space-y-0.5"
                  >
                    <div className="text-xs font-semibold text-slate-600">
                      <span aria-hidden="true">{q.emoji}</span> {q.label}
                    </div>
                    <div className="font-mono text-sm font-bold tabular-nums text-slate-800">
                      {fr(q.at(5), q.decimals)} → {fr(q.at(20), q.decimals)} {q.unit}
                    </div>
                    <div
                      className={`text-xs font-bold ${
                        sens === 'descend' ? 'text-rose-700' : 'text-emerald-700'
                      }`}
                    >
                      {sens === 'descend' ? 'ça descend' : 'ça monte'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <TapQuestion
            prompt={
              <>
                La masse <strong>diminue</strong> quand la durée augmente. Peut-on dire qu’elle
                dépend de la durée ?
              </>
            }
            options={[
              'Oui : à chaque durée correspond une masse bien précise',
              'Non : pour dépendre, elle devrait augmenter aussi',
            ]}
            cols={1}
            correct={0}
            requires={['dependance', 'meme-entree-meme-sortie']}
            explain="Dépendre, c’est être déterminé par l’autre grandeur — peu importe le sens. À 20 minutes, la masse vaut toujours 420 g, et à 5 minutes toujours 480 g."
            explainWrong="Une grandeur peut très bien diminuer tout en dépendant d’une autre. Ce qui compte, c’est que la durée fixe la masse — et elle la fixe, dans un sens comme dans l’autre."
            solved={q4}
            onAnswered={() => setQ4(true)}
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
      moduleTitle="Le four"
      moduleSubtitle="Une molette, trois grandeurs qui suivent"
      estimatedTime="12 min"
      brief={{
        tag: 'Déclencheur',
        title: 'Une seule commande, et tout change',
        tone: 'indigo',
        body: (
          <p>
            À la cantine, le four n’a qu’<strong>un seul réglage</strong> : la durée. Pourtant, en
            le tournant, la couleur du pain, sa masse et sa température changent toutes les trois.{' '}
            <strong>Enfourne</strong>, et regarde ce qui suit quoi.
          </p>
        ),
      }}
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={1} />}
    />
  );
}
