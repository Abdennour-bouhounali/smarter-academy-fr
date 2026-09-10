import React, { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, PredictionChips, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import DerouleurLab from '../components/DerouleurLab';
import { SIN, COS, TAU, tableauVariations, extremums, fr } from '../components/trigFnUtils';

/**
 * Module 4 — MANIPULATION : les variations sur [0 ; 2π] (LP4).
 *
 * Étape 1  parcourir un tour ENTIER sur le dérouloir du sinus, en observant
 *          les deux endroits où la trace change de sens. Les repères
 *          verticaux sont posés en π/2 et 3π/2 — dérivés du modèle, jamais
 *          écrits à la main.
 * Étape 2  le tableau, RÉCAPITULÉ depuis `tableauVariations` : trois morceaux,
 *          et leurs quatre bornes exactes. Brique posée, puis demande.
 * Étape 3  le cosinus : deux morceaux seulement. Le contraste avec le sinus
 *          est ce qui empêche de croire que « toutes les courbes qui se
 *          répètent ont trois morceaux ».
 *
 * TOUT LE CONTENU EST DÉRIVÉ. Les sens, les bornes et les extremums viennent
 * de `tableauVariations` et `extremums` — verrouillés par le test. Aucun
 * « croissante » n'est saisi à la main dans ce fichier.
 *
 * MANIPULATION JAMAIS GELÉE : le dérouloir reste pilotable après validation.
 */
const REPERES_SIN = extremums(SIN).map((e) => ({ t: e.t, label: e.label }));
const TABLE_SIN = tableauVariations(SIN);
const TABLE_COS = tableauVariations(COS);
const MOT = { croissante: 'monte', decroissante: 'descend' };

export default function Module04MonterDescendreRemonter() {
  const [pred, setPred] = useState(null);
  const [cran1, setCran1] = useState(0);
  const [vus1, setVus1] = useState([0]);
  const [q2, setQ2] = useState(false);
  const [cran3, setCran3] = useState(0);
  const [vus3, setVus3] = useState([0]);
  const [q3, setQ3] = useState(false);

  // Un tour entier parcouru : les 25 crans de 0 à 2π, à trois près.
  const parcouru = (v) => v.filter((n) => n >= 0 && n <= 24).length >= 22;
  const done1 = parcouru(vus1);
  const done3 = parcouru(vus3) && q3;

  const visiter = (v, vus, setVus, setCran, deja, react) => {
    setCran(v);
    if (vus.includes(v)) return;
    const suivant = [...vus, v];
    setVus(suivant);
    if (!deja && parcouru(suivant)) react?.(true);
  };

  const steps = [
    {
      num: 1,
      title: 'Un tour complet, sans s’arrêter',
      subtitle:
        'Attrape le point et fais-lui faire un tour complet, de 0 à 2π. Deux traits pointillés marquent les endroits où la trace change de sens : regarde ce qui s’y passe.',
      done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <PredictionChips
            prompt="sur un tour complet, la trace du sinus va…"
            options={[
              { id: 'monte', label: 'Monter tout du long' },
              { id: 'deux', label: 'Monter puis descendre' },
              { id: 'trois', label: 'Monter, descendre, puis remonter' },
            ]}
            value={pred}
            onChange={setPred}
            disabled={done1}
          />
          <DerouleurLab
            fn={SIN}
            cran={cran1}
            visites={vus1}
            reperes={REPERES_SIN}
            onChangeCran={(v) => visiter(v, vus1, setVus1, setCran1, done1, kit.react)}
          />
          {done1 ? (
            <Feedback tone="ok">
              {pred === 'trois' ? 'Ta prédiction tenait' : pred ? 'Ta prédiction ne tenait pas' : 'Regarde la trace'} :
              trois morceaux. La trace {MOT[TABLE_SIN[0].sens]} de {fr(TABLE_SIN[0].deVal)} à{' '}
              {fr(TABLE_SIN[0].aVal)} jusqu’en <strong>{TABLE_SIN[0].aLabel}</strong>, puis elle{' '}
              {MOT[TABLE_SIN[1].sens]} jusqu’à {fr(TABLE_SIN[1].aVal)} en{' '}
              <strong>{TABLE_SIN[1].aLabel}</strong>, puis elle {MOT[TABLE_SIN[2].sens]} de nouveau
              jusqu’à {fr(TABLE_SIN[2].aVal)}. Refais le parcours en suivant les pointillés.
            </Feedback>
          ) : (
            <Feedback tone="info">
              Positions parcourues entre 0 et 2π : {vus1.filter((n) => n >= 0 && n <= 24).length} sur 25.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Le tableau du sinus',
      done: q2,
      content: (
        <div className="space-y-3">
          <div className="overflow-x-auto rounded-xl border border-emerald-100 bg-white">
            <table className="w-full text-center text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-600">
                  <th className="px-2 py-2 text-left">sur l’intervalle</th>
                  <th className="px-2 py-2">de</th>
                  <th className="px-2 py-2">à</th>
                  <th className="px-2 py-2">la courbe</th>
                </tr>
              </thead>
              <tbody>
                {TABLE_SIN.map((s) => (
                  <tr key={s.deLabel} className="border-t">
                    <th className="px-2 py-2 text-left font-semibold">[{s.deLabel} ; {s.aLabel}]</th>
                    <td className="px-2 py-2 font-mono tabular-nums">{fr(s.deVal)}</td>
                    <td className="px-2 py-2 font-mono tabular-nums">{fr(s.aVal)}</td>
                    <td className={`px-2 py-2 font-bold ${s.sens === 'croissante' ? 'text-emerald-700' : 'text-rose-700'}`}>
                      {s.sens === 'croissante' ? '↗ elle monte' : '↘ elle descend'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <KnowledgeBrick
            id="variations-sin-cos"
            variant="new"
            establishes={['variations', 'extremum']}
            lead={<>Voici, pour les deux fonctions, ce que le parcours vient de montrer.</>}
          />
          <KnowledgeBrick
            id="methode-lire-tableau-trigo"
            variant="new"
            lead={<>Et la façon de retrouver ces sens sans les apprendre par cœur.</>}
          />
          <TapQuestion
            prompt={`Le plus grand écart vers le haut du sinus vaut ${fr(extremums(SIN)[0].valeur)}. En quel réel de [0 ; 2π] est-il atteint ?`}
            options={[extremums(SIN)[0].label, '0', extremums(SIN)[1].label, '2π']}
            correct={0}
            cols={4}
            requires={['variations-sin-cos', 'methode-lire-tableau-trigo']}
            explain={`Le sinus monte de 0 jusqu’à ${extremums(SIN)[0].label}, où il vaut ${fr(extremums(SIN)[0].valeur)} : c’est son point le plus haut. Ensuite il redescend. En ${extremums(SIN)[1].label}, au contraire, il atteint son point le plus bas, ${fr(extremums(SIN)[1].valeur)}.`}
            explainWrong={`En 0 comme en 2π, le sinus vaut ${fr(0)} : ce n’est ni haut ni bas. Le point le plus haut est atteint au quart de tour, en ${extremums(SIN)[0].label}.`}
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
        </div>
      ),
    },
    {
      num: 3,
      title: 'Et le cosinus ? Deux morceaux seulement',
      subtitle:
        'Fais de nouveau tourner le point d’un tour complet, cette fois sur le dérouloir du cosinus. Compte les changements de sens.',
      done: done3,
      content: (kit) => (
        <div className="space-y-3">
          <DerouleurLab
            fn={COS}
            cran={cran3}
            visites={vus3}
            onChangeCran={(v) => visiter(v, vus3, setVus3, setCran3, done3, kit.react)}
            disabled={!q2}
            label="Dérouler le cercle — le cosinus"
          />
          {parcouru(vus3) && (
            <Feedback tone="ok">
              Un seul changement de sens, en <strong>{TABLE_COS[0].aLabel}</strong>, donc{' '}
              <strong>{TABLE_COS.length} morceaux</strong> et non trois : le cosinus{' '}
              {MOT[TABLE_COS[0].sens]} de {fr(TABLE_COS[0].deVal)} à {fr(TABLE_COS[0].aVal)}, puis
              il {MOT[TABLE_COS[1].sens]} jusqu’à {fr(TABLE_COS[1].aVal)}. Il commence tout en
              haut, là où le sinus commençait à mi-hauteur.
            </Feedback>
          )}
          <BatchChoiceQuestion
            intro={<p>Sur [0 ; 2π], que fait chaque fonction sur ces intervalles ?</p>}
            rows={[
              {
                id: 'r1',
                label: `sinus sur [${TABLE_SIN[1].deLabel} ; ${TABLE_SIN[1].aLabel}]`,
                options: ['elle descend', 'elle monte'],
                correct: TABLE_SIN[1].sens === 'decroissante' ? 0 : 1,
                correction: `Le sinus part de ${fr(TABLE_SIN[1].deVal)} et arrive à ${fr(TABLE_SIN[1].aVal)} : il descend.`,
              },
              {
                id: 'r2',
                label: `cosinus sur [${TABLE_COS[0].deLabel} ; ${TABLE_COS[0].aLabel}]`,
                options: ['elle descend', 'elle monte'],
                correct: TABLE_COS[0].sens === 'decroissante' ? 0 : 1,
                correction: `Le cosinus part de ${fr(TABLE_COS[0].deVal)} et arrive à ${fr(TABLE_COS[0].aVal)} : il descend dès le départ.`,
              },
              {
                id: 'r3',
                label: `sinus sur [${TABLE_SIN[2].deLabel} ; ${TABLE_SIN[2].aLabel}]`,
                options: ['elle monte', 'elle descend'],
                correct: TABLE_SIN[2].sens === 'croissante' ? 0 : 1,
                correction: `Le sinus remonte de ${fr(TABLE_SIN[2].deVal)} à ${fr(TABLE_SIN[2].aVal)} : c’est le troisième morceau.`,
              },
            ]}
            requires={['variations-sin-cos', 'methode-lire-tableau-trigo']}
            feedback={({ allRight }) =>
              allRight ? (
                <>Les deux fonctions ont la même forme, mais pas au même moment : le cosinus est en avance d’un quart de tour sur le sinus.</>
              ) : (
                <>Reprends le tableau : il suffit de comparer la valeur d’arrivée à celle de départ sur chaque intervalle.</>
              )
            }
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
      navLinks={getNavLinks(4)}
      moduleNumber={4}
      moduleTitle="Monter, descendre, remonter"
      moduleSubtitle="Ce que fait la courbe à l’intérieur d’un seul tour"
      estimatedTime="12 min"
      brief={{
        tag: 'Atelier',
        title: 'La forme d’un tour',
        tone: 'indigo',
        body: (
          <p>
            La courbe se répète de 2π en 2π : il suffit donc d’étudier <strong>un seul tour</strong>
            {' '}pour tout savoir. Parcours-le en entier et repère les endroits où la trace change
            de sens.
          </p>
        ),
      }}
      steps={steps}
      footer={
        <KnowledgeSnapshot moduleNumber={4}>
          <strong>Tu as tout pour tracer.</strong> Cinq valeurs, trois morceaux, un motif qui se
          répète : le module suivant te fait poser la courbe toi-même.
        </KnowledgeSnapshot>
      }
    />
  );
}
