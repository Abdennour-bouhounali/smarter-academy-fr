import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import RealLine from '../../../../../common/components/RealLine';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import IntervalBuilder from '../components/IntervalBuilder';
import BuildCheck from '../components/BuildCheck';
import { interval, notation, sameInterval, intersect, integersIn, inequality } from '../components/intervalUtils';

/**
 * Module 6 — PRACTICE LAB : « Situations ».
 *
 * Activity: quatre situations authentiques résolues par un intervalle :
 *   deux attractions (intersection de deux plages de tailles), un vaccin
 *   (entiers d'un intervalle fermé et une température hors plage), un
 *   forfait (une inégalité traduite en intervalle avec x ≥ 0), et le compte
 *   des entiers de [−2,5 ; 3[.
 * Mathematical objective: choisir les crochets à partir du SENS des mots
 *   (« à partir de », « moins de », « entre… inclus », « au plus ») et
 *   utiliser ∩ pour une double contrainte.
 * Scaffolding: la manipulation revient à l'étape 1 (le filtre du module 1,
 *   deux fois) puis disparaît : questions numériques et choix.
 */
const MANEGE = interval(1.2, 1.9, false, true);
const TOBOGGAN = interval(1.4, 2, true, false);
const BOTH = intersect(MANEGE, TOBOGGAN);       // ]1,4 ; 1,9[
const VACCIN = interval(2, 8);
const COUNT_INT = interval(-2.5, 3, false, true);

export default function Module06Situations() {
  const [k, setK] = useState(interval(1, 2.2));
  const [g, setG] = useState(null);
  const [d1, setD1] = useState(false);
  const [d2a, setD2a] = useState(false);
  const [d2b, setD2b] = useState(false);
  const [d3, setD3] = useState(false);
  const [d4, setD4] = useState(false);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(6)}
      moduleNumber={6}
      moduleTitle="Situations"
      moduleSubtitle="Deux attractions, un vaccin, un forfait, des entiers à compter : les intervalles au travail."
      estimatedTime="10 min"
      brief={{
        tag: '🎯 Mission 06',
        title: 'Retour à la fête foraine — et ailleurs.',
        tone: 'indigo',
        body: <p>À chaque fois, une phrase en français cache un intervalle. Trouve ses bornes et ses crochets, puis réponds.</p>,
      }}
      steps={[
        {
          num: 1,
          title: 'Deux attractions',
          subtitle: 'Manège : à partir de 1,20 m, moins de 1,90 m. Toboggan : plus de 1,40 m, jusqu’à 2 m inclus. Quelles tailles peuvent faire LES DEUX ?',
          done: d1,
          content: (
            <div className="space-y-3">
              <div className="rounded-2xl border-2 border-slate-200 bg-white p-2">
                <RealLine
                  min={1} max={2.2} step={0.1} labelEvery={2}
                  intervals={[
                    { id: 'M', from: 1.2, to: 1.9, openTo: true, tone: 'sky', label: 'manège' },
                    { id: 'T', from: 1.4, to: 2, openFrom: true, tone: 'amber', label: 'toboggan' },
                  ]}
                  ariaLabel="Les deux plages de tailles superposées"
                />
              </div>
              <IntervalBuilder value={k} onChange={setK} min={1} max={2.2} step={0.1} showNotation={false} disabled={d1} ghost={g} />
              <BuildCheck
                isRight={() => sameInterval(k, BOTH)}
                current={() => notation(k)}
                answer={notation(BOTH)}
                why="Faire les deux = être dans les deux plages : l’intersection. « Plus de 1,40 » exclut 1,40 ; « moins de 1,90 » exclut 1,90."
                hint={() => 'Ne garde que la zone recouverte par les DEUX couleurs, et lis les mots : « plus de » et « moins de » sont stricts.'}
                onDone={() => setD1(true)}
                onReveal={() => setG(BOTH)}
                solved={d1}
              />
              {d1 && (
                <KnowledgeBrick
                  id="methode-phrase-intervalle"
                  variant="new"
                  lead="Tu viens de traduire deux phrases en bornes et en crochets, puis de croiser les deux plages. C’est la méthode générale, pour n’importe quelle situation."
                />
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'Le vaccin',
          subtitle: 'Un vaccin se conserve entre 2 °C et 8 °C, bornes incluses.',
          done: d2a && d2b,
          content: (
            <div className="space-y-3">
              <KnowledgeBrick
                id="methode-compter-entiers"
                variant="new"
                compact
                lead="Un intervalle contient une infinité de réels, mais un nombre fini d’entiers — à condition de vérifier chaque borne."
              />
              <NumericQuestion
                prompt="Combien de températures ENTIÈRES (en °C) conviennent ?"
                expected={integersIn(VACCIN).length}
                suffix="températures"
                requires={['methode-compter-entiers']}
                explain="[2 ; 8] contient les entiers 2, 3, 4, 5, 6, 7, 8 : sept valeurs. Mais il contient aussi 2,5 ou 7,99 — une infinité de températures en tout."
                explainFor={(v) => (v === 6
                  ? 'Tu as oublié une borne : 2 et 8 sont tous les deux inclus. De 2 à 8, cela fait 8 − 2 + 1 = 7 entiers.'
                  : v === 8 ? 'De 2 à 8, ce n’est pas 8 entiers : compte-les, 2, 3, 4, 5, 6, 7, 8 → 7.'
                  : 'Les entiers de [2 ; 8] sont 2, 3, 4, 5, 6, 7, 8 : sept.')}
                solved={d2a}
                onAnswered={() => setD2a(true)}
              />
              {d2a && (
                <TapQuestion
                  prompt="Le frigo affiche 8,5 °C. Le vaccin est-il encore dans sa plage ?"
                  options={['Oui, c’est presque 8', 'Non : 8,5 ∉ [2 ; 8]']}
                  cols={2}
                  correct={1}
                  requires={['methode-appartenance-intervalle']}
                  explain="8,5 > 8 : hors de l’intervalle, même de peu. Une borne est une frontière nette, pas une zone floue."
                  explainWrong="« Presque » ne compte pas : la borne est 8, et 8,5 > 8. Donc 8,5 ∉ [2 ; 8] — il faut réagir."
                  solved={d2b}
                  onAnswered={() => setD2b(true)}
                />
              )}
            </div>
          ),
        },
        {
          num: 3,
          title: 'Le forfait',
          subtitle: 'Un forfait coûte 15 € plus 2 € par gigaoctet. Budget : au plus 25 €.',
          done: d3,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt="Quel intervalle décrit les quantités x de gigaoctets possibles ?"
                options={['[0 ; 5]', ']−∞ ; 5]', '[0 ; 5[', '[5 ; +∞[']}
                cols={2}
                correct={0}
                requires={['methode-phrase-intervalle']}
                explain="15 + 2x ≤ 25 donne 2x ≤ 10, soit x ≤ 5 — et 5 Go est encore possible (« au plus »). Mais une quantité ne peut pas être négative : x ≥ 0. D’où x ∈ [0 ; 5]."
                explainWrong="Deux contraintes : le budget (x ≤ 5, avec 5 possible car « au plus 25 € ») ET le bon sens (x ≥ 0, pas de gigaoctets négatifs). L’intervalle est [0 ; 5]."
                solved={d3}
                onAnswered={() => setD3(true)}
              />
              {d3 && (
                <KnowledgeBrick
                  id="regle-contrainte-implicite"
                  variant="new"
                  compact
                  lead="Le calcul seul donnait x ≤ 5 : c’est le bon sens de la situation qui a ajouté x ≥ 0."
                />
              )}
            </div>
          ),
        },
        {
          num: 4,
          title: 'Compter des entiers',
          done: d4,
          content: (
            <NumericQuestion
              prompt="Combien d’entiers relatifs appartiennent à [−2,5 ; 3[ ?"
              above={
                <div className="rounded-2xl border-2 border-slate-200 bg-white p-2">
                  <RealLine min={-4} max={4} step={0.5} labelEvery={2} intervals={[{ id: 'I', from: -2.5, to: 3, openTo: true, tone: 'indigo', label: '[−2,5 ; 3[' }]} ariaLabel="Intervalle [−2,5 ; 3[" />
                </div>
              }
              expected={integersIn(COUNT_INT).length}
              suffix="entiers"
              requires={['methode-compter-entiers']}
              explain={`Les entiers de [−2,5 ; 3[ sont ${integersIn(COUNT_INT).join(' ; ')} : cinq. −2,5 n’est pas entier, et 3 est exclu.`}
              explainFor={(v) => (v === 6
                ? '3 est EXCLU (crochet ouvert) : −2, −1, 0, 1, 2 → cinq entiers.'
                : v === 4 ? 'N’oublie ni −2 (il est bien ≥ −2,5) ni 0 : −2, −1, 0, 1, 2 → cinq.'
                : 'Sur la droite : −2, −1, 0, 1, 2 sont dans la bande ; 3 est exclu. Cinq entiers.')}
              solved={d4}
              onAnswered={() => setD4(true)}
            />
          ),
        },
      ]}
      footer={(
        <KnowledgeSnapshot moduleNumber={6}>
          Il ne reste plus qu’à prouver que tu maîtrises tout cela : le boss t’attend.
        </KnowledgeSnapshot>
      )}
    />
  );
}
