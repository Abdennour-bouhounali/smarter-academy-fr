import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import PileInspector from '../components/PileInspector';
import { CATALOGUE, parseNombre, fr } from '../components/suitesUtils';

/**
 * Module 3 — DÉCOUVERTE : les deux familles reçoivent leur nom (P3, P4).
 *
 * Étape 1  mesurer les ÉCARTS d'une liste avec l'instrument, les voir tous
 *          égaux → brique `suite-arithmetique`. Le mot « raison » est posé ici,
 *          après le geste qui l'a fait apparaître.
 * Étape 2  changer d'outil sur une autre liste, mesurer les RAPPORTS → brique
 *          `suite-geometrique`, avec le cas d'une raison entre 0 et 1.
 * Étape 3  la méthode, puis le tri des six listes du catalogue — y compris
 *          celle qui n'est NI l'une NI l'autre.
 * Étape 4  le cas de recouvrement : la suite constante appartient aux DEUX
 *          familles. C'est le seul, et c'est un fait, pas une exception à
 *          apprendre par cœur.
 *
 * TOUTES LES VALEURS VIENNENT DU MODÈLE (`CATALOGUE`), dont chaque entrée est
 * vérifiée par `suitesUtils.test.js` contre `detectKind` : une liste mal
 * étiquetée n'atteint pas l'élève.
 *
 * MANIPULATION JAMAIS GELÉE : l'instrument reste utilisable après validation —
 * rechanger d'outil est précisément le geste qu'on veut voir refaire.
 */
export default function Module03ArithmetiqueOuGeometrique() {
  const ARITH = CATALOGUE.find((c) => c.id === 'c-arith-4');    // 3, 7, 11, 15, 19
  const GEO = CATALOGUE.find((c) => c.id === 'c-geo-2');        // 5, 10, 20, 40, 80
  const DEMI = CATALOGUE.find((c) => c.id === 'c-geo-demi');    // 80, 40, 20, 10, 5
  const CONST = CATALOGUE.find((c) => c.id === 'c-const');      // 6, 6, 6, 6, 6

  const [mesure1, setMesure1] = useState(null);
  const [q1, setQ1] = useState(false);
  const [mesure2, setMesure2] = useState(null);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);

  const done1 = mesure1 === 'ecarts' && q1;
  const done2 = mesure2 === 'rapports' && q2;

  const steps = [
    {
      num: 1,
      title: 'Quand les écarts sont tous égaux',
      subtitle:
        'Mesure les écarts entre termes consécutifs de cette liste avec l’instrument, puis donne la valeur commune.',
      done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <PileInspector
            list={ARITH.list}
            label={ARITH.label}
            onMesure={(o) => {
              setMesure1(o);
              if (!done1 && o === 'ecarts' && q1) kit.react?.(true);
            }}
          />
          <NumericQuestion
            prompt={<>Quel est l’écart, le même à chaque pas, entre deux termes consécutifs ?</>}
            expected={ARITH.raison}
            parse={parseNombre}
            display={fr(ARITH.raison)}
            requires={['deux-facons-de-fabriquer', 'suite-rang-terme']}
            explain={`7 − 3 = ${fr(ARITH.raison)}, 11 − 7 = ${fr(ARITH.raison)}, 15 − 11 = ${fr(ARITH.raison)} : le même écart partout. Ce nombre a un nom.`}
            explainFor={(n) =>
              n === ARITH.list[4] - ARITH.list[0]
                ? `${fr(ARITH.list[4] - ARITH.list[0])} est l’écart entre le DERNIER et le PREMIER terme, pas entre deux termes consécutifs. Regarde une seule marche : 7 − 3 = ${fr(ARITH.raison)}.`
                : n === ARITH.list[0]
                ? 'C’est le premier terme, pas ce qui s’ajoute d’un terme au suivant.'
                : null
            }
            solved={q1}
            onAnswered={() => setQ1(true)}
          />
          {done1 ? (
            <>
              <Feedback tone="ok">
                Avec l’outil « écarts », toutes les mesures valent{' '}
                <strong>{fr(ARITH.raison)}</strong>. C’est exactement l’usine A du module 1 : on
                ajoute toujours le même montant.
              </Feedback>
              <KnowledgeBrick
                id="suite-arithmetique"
                variant="new"
                lead={<>La famille que tu viens de mesurer porte un nom, et le nombre commun aussi. Remesure la liste en le lisant.</>}
              />
            </>
          ) : (
            <Feedback tone="info">
              Appuie sur <strong>les écarts (−)</strong> pour voir ce qui se passe entre deux
              termes consécutifs, puis réponds à la question.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Quand ce sont les rapports qui sont égaux',
      subtitle:
        'Sur cette liste-ci, les écarts ne sont pas constants. Change d’outil et mesure les rapports.',
      done: done2,
      content: (kit) => (
        <div className="space-y-3">
          <PileInspector
            list={GEO.list}
            label={GEO.label}
            disabled={!done1}
            onMesure={(o) => {
              setMesure2(o);
              if (!done2 && o === 'rapports' && q2) kit.react?.(true);
            }}
          />
          <NumericQuestion
            prompt={<>Par quel nombre multiplie-t-on pour passer d’un terme au suivant ?</>}
            expected={GEO.raison}
            parse={parseNombre}
            display={fr(GEO.raison)}
            requires={['suite-arithmetique', 'deux-facons-de-fabriquer']}
            explain={`10 ÷ 5 = ${fr(GEO.raison)}, 20 ÷ 10 = ${fr(GEO.raison)}, 40 ÷ 20 = ${fr(GEO.raison)} : le même facteur partout. Les écarts, eux, valent 5, 10, 20, 40 — ils ne sont pas constants.`}
            explainFor={(n) =>
              n === GEO.list[1] - GEO.list[0]
                ? `${fr(GEO.list[1] - GEO.list[0])} est l’ÉCART entre les deux premiers termes. Avec l’outil « rapports », c’est une division qu’il faut lire : 10 ÷ 5 = ${fr(GEO.raison)}.`
                : null
            }
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
          {done2 ? (
            <>
              <Feedback tone="ok">
                Avec l’outil « rapports », toutes les mesures valent{' '}
                <strong>{fr(GEO.raison)}</strong> : c’est l’usine B du module 1. Et ce facteur peut
                être plus petit que 1 : sur <strong>{DEMI.label}</strong>, il vaut{' '}
                <strong>{fr(DEMI.raison)}</strong> — on multiplie, et pourtant la liste descend.
              </Feedback>
              <KnowledgeBrick
                id="suite-geometrique"
                variant="new"
                lead={<>La seconde famille, et son nombre commun à elle.</>}
              />
            </>
          ) : (
            <Feedback tone="info">
              Essaie d’abord <strong>les écarts</strong>, tu verras qu’ils ne sont pas constants —
              puis <strong>les rapports</strong>.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Trier les six listes',
      done: q3,
      content: (
        <div className="space-y-3">
          <KnowledgeBrick
            id="methode-trouver-la-raison"
            variant="new"
            lead={<>Avant de trier : l’ordre des deux mesures, écrit une fois pour toutes.</>}
          />
          <BatchChoiceQuestion
            intro={
              <p className="text-sm text-slate-700">
                Pour chacune de ces listes, dis de quelle famille elle relève. Une liste peut ne
                relever d’aucune des deux.
              </p>
            }
            rows={CATALOGUE.filter((c) => c.id !== 'c-const').map((c) => ({
              id: c.id,
              label: c.label,
              options: ['arithmétique', 'géométrique', 'ni l’une ni l’autre'],
              correct: c.nature === 'arithmetique' ? 0 : c.nature === 'geometrique' ? 1 : 2,
            }))}
            requires={['suite-arithmetique', 'suite-geometrique', 'methode-trouver-la-raison']}
            feedback={({ allRight, nCorrect, total }) => (
              <div className="space-y-2 text-sm">
                {allRight ? (
                  <>
                    Les écarts d’abord, les rapports ensuite. Et{' '}
                    <strong>{CATALOGUE.find((c) => c.id === 'c-ni-carres').label}</strong> ne relève
                    d’aucune des deux : ses écarts valent 3, 5, 7, 9 et ses rapports 4 ; 2,25 ;
                    1,78 ; 1,5625 — rien de constant.
                  </>
                ) : (
                  <>
                    {nCorrect} sur {total}. Calcule les écarts : s’ils sont tous égaux, c’est
                    arithmétique. Sinon les rapports. Si aucune des deux mesures n’est constante, la
                    liste ne relève d’aucune des deux familles.
                  </>
                )}
                <div className="rounded-lg bg-slate-50 p-2 font-mono text-[13px]">
                  {CATALOGUE.filter((c) => c.id !== 'c-const').map((c) => (
                    <div key={c.id}>
                      {c.label} → {c.nature === 'ni' ? 'ni l’une ni l’autre' : `${c.nature === 'arithmetique' ? 'arithmétique' : 'géométrique'}, raison ${fr(c.raison)}`}
                    </div>
                  ))}
                </div>
              </div>
            )}
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
        </div>
      ),
    },
    {
      num: 4,
      title: 'La liste qui appartient aux deux familles',
      done: q4,
      content: (
        <div className="space-y-3">
          <PileInspector list={CONST.list} label={CONST.label} />
          <TapQuestion
            prompt="Mesure ses écarts, puis ses rapports. Que conclure ?"
            options={[
              'Elle est arithmétique de raison 0 ET géométrique de raison 1 : les deux lectures sont vraies',
              'Elle est arithmétique seulement, car les rapports ne comptent pas quand les termes sont égaux',
              'Elle n’est ni l’une ni l’autre, car elle ne change pas',
              'Elle est géométrique seulement, de raison 0',
            ]}
            correct={0}
            cols={1}
            requires={['suite-arithmetique', 'suite-geometrique', 'methode-trouver-la-raison']}
            explain={`Les écarts valent tous 0 : arithmétique de raison 0. Les rapports valent tous 1 : géométrique de raison 1. C’est le SEUL cas où une liste appartient aux deux familles — dès qu’elle bouge, elle ne peut plus être des deux.`}
            explainWrong={`L’instrument l’a montré : les écarts sont bien constants (0) et les rapports aussi (1). Les deux mesures répondent, et les deux réponses sont vraies. Une raison de 0 pour un rapport serait fausse : 6 ÷ 6 = 1, pas 0.`}
            solved={q4}
            onAnswered={() => setQ4(true)}
          />
          {q4 && (
            <KnowledgeBrick
              id="cas-suite-constante"
              variant="new"
              lead={<>Le seul point où les deux familles se recouvrent, noté une fois pour toutes.</>}
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
      moduleTitle="Arithmétique ou géométrique"
      moduleSubtitle="Deux outils de mesure, deux familles, un nombre qui les règle"
      estimatedTime="10 min"
      brief={{
        tag: 'Découverte',
        title: 'Deux mesures pour trancher',
        tone: 'indigo',
        body: (
          <p>
            Devant une liste de nombres, deux mesures suffisent : ce qu’on ajoute d’un terme au
            suivant, et ce par quoi on multiplie. Celle qui donne toujours le même résultat désigne
            la famille — et donne du même coup le nombre qui la règle.
          </p>
        ),
      }}
      steps={steps}
      footer={
        <KnowledgeSnapshot moduleNumber={3}>
          <strong>Et après ?</strong> Quatre termes qui s’alignent restent un indice. Le module
          suivant transforme ce constat en démonstration valable pour TOUS les rangs.
        </KnowledgeSnapshot>
      }
    />
  );
}
