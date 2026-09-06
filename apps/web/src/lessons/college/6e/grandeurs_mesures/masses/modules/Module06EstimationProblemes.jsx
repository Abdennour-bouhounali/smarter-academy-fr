import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { formatMass, formatDec, parseDec } from '../components/massUtils';

/**
 * Module 6 — practice lab, reconstruit sur le lesson kit.
 *
 * Estimer avant de calculer, puis résoudre deux problèmes concrets. Les
 * sous-étapes ne sont plus enchaînées derrière une réponse juste : chaque
 * question révèle sa correction et libère la suivante (la version pré-kit
 * cachait le champ suivant tant que le précédent était faux, et proposait
 * un lien « réessaie » qui effaçait la saisie).
 */
const SCENARIOS = [
  { id: 'sac', emoji: '🎒', label: 'Un sac à dos plein', options: [{ v: 50, u: 'g' }, { v: 5, u: 'kg' }, { v: 500, u: 'kg' }], correct: 1 },
  { id: 'camion', emoji: '🚚', label: 'Un camion chargé', options: [{ v: 2, u: 'g' }, { v: 2, u: 'kg' }, { v: 2, u: 't' }], correct: 2 },
  { id: 'chocolat', emoji: '🍫', label: 'Une tablette de chocolat', options: [{ v: 10, u: 'g' }, { v: 100, u: 'g' }, { v: 1, u: 'kg' }], correct: 1 },
  { id: 'plume', emoji: '🪶', label: 'Une plume', options: [{ v: 1, u: 'mg' }, { v: 1, u: 'g' }, { v: 10, u: 'g' }], correct: 1 },
];

const PLAUSIBLE_OPTIONS = ['Oui, c’est raisonnable pour 8 boîtes', 'Non, c’est beaucoup trop lourd'];

export default function Module06EstimationProblemes() {
  const [scenarioDone, setScenarioDone] = useState([]);
  const allScenariosDone = scenarioDone.length === SCENARIOS.length;

  const [craiesG, setCraiesG] = useState(false);
  const [craiesKg, setCraiesKg] = useState(false);
  const [craiesPlaus, setCraiesPlaus] = useState(false);
  const craiesDone = craiesG && craiesKg && craiesPlaus;

  const [colisDone, setColisDone] = useState(false);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(6)}
      moduleNumber={6}
      moduleTitle="Estimer et résoudre"
      moduleSubtitle="Estimer d’abord, calculer ensuite — et deux problèmes concrets."
      estimatedTime="12 min"
      brief={{
        tag: '📋 Mission 06',
        title: 'Avant de calculer, estime — pour repérer tout de suite un résultat impossible.',
        body: <p>Une valeur plausible en tête, et une erreur d’unité se voit immédiatement.</p>,
      }}
      steps={[
        {
          num: 1,
          title: 'La proposition la plus réaliste',
          done: allScenariosDone,
          content: (
            <div className="space-y-8">
              {SCENARIOS.map((s, i) =>
                i === 0 || scenarioDone.includes(i - 1) ? (
                  <div key={s.id} className="border-t border-slate-100 pt-5 first:border-0 first:pt-0">
                    <TapQuestion
                      requires={['unite-masse-adaptee', 'escalier-masses']}
                      prompt={
                        <span className="flex items-center gap-2.5">
                          <span className="text-2xl" aria-hidden="true">{s.emoji}</span>
                          <span>{s.label}</span>
                        </span>
                      }
                      options={s.options}
                      correct={s.correct}
                      cols={3}
                      renderOption={(o) => (
                        <span className="font-mono font-extrabold text-base">
                          {o.v} <span className="text-xs font-semibold text-slate-500">{o.u}</span>
                        </span>
                      )}
                      correctionLabel={`${s.options[s.correct].v} ${s.options[s.correct].u}`}
                      explain={`${s.options[s.correct].v} ${s.options[s.correct].u} : c'est la seule proposition réaliste — les deux autres sont ridiculement légère ou lourde.`}
                      solved={scenarioDone.includes(i)}
                      onAnswered={() => setScenarioDone((d) => (d.includes(i) ? d : [...d, i]))}
                    />
                  </div>
                ) : null
              )}
              {/* Quatre jugements viennent d'être portés sans balance : c'est
                  ici, et pas dans le titre d'étape, que « estimer » a un sens. */}
              {allScenariosDone && (
                <KnowledgeBrick
                  id="estimation-masse"
                  variant="new"
                  lead="Tu viens d'éliminer quatre fois l'impossible sans rien peser. Ce geste a un nom."
                />
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'Le problème des craies',
          done: craiesDone,
          content: (
            <div className="space-y-5">
              <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-4 text-sm text-slate-700">
                Une classe achète <strong>8 boîtes</strong> de craies. Chaque boîte contient <strong>250 g</strong> de
                craie. Quelle masse totale de craies la classe a-t-elle achetée ?
              </div>

              <NumericQuestion
                requires={['masse-comparable']}
                prompt="Masse totale, en grammes :"
                suffix="g"
                expected={2000}
                parse={parseDec}
                display={formatDec(2000)}
                explain={<>8 × 250 g = <strong>2000 g</strong>.</>}
                explainFor={() => '8 boîtes de 250 g : additionne 250 g huit fois, ou pense à un raccourci.'}
                solved={craiesG}
                onAnswered={() => setCraiesG(true)}
              />

              {craiesG && (
                <div className="border-t border-slate-100 pt-4">
                  <NumericQuestion
                    requires={['convertir-masse-methode', 'escalier-masses']}
                    prompt="Exprime aussi ce résultat en kg."
                    suffix="kg"
                    expected={2}
                    parse={parseDec}
                    display={formatDec(2)}
                    explain={<>2000 g = <strong>{formatMass(2, 'kg')}</strong>.</>}
                    explainFor={() => '1000 g = 1 kg.'}
                    solved={craiesKg}
                    onAnswered={() => setCraiesKg(true)}
                  />
                </div>
              )}

              {craiesKg && (
                <div className="border-t border-slate-100 pt-4">
                  <TapQuestion
                    requires={['estimation-masse', 'unite-masse-adaptee']}
                    prompt="2 kg de craies pour toute une classe : cela te semble-t-il raisonnable ?"
                    options={PLAUSIBLE_OPTIONS}
                    correct={0}
                    cols={1}
                    explain="2 kg, c’est un peu plus lourd qu’un sac de sucre : tout à fait raisonnable pour huit boîtes de craies."
                    solved={craiesPlaus}
                    onAnswered={() => setCraiesPlaus(true)}
                  />
                </div>
              )}
            </div>
          ),
        },
        {
          num: 3,
          title: 'Le problème du colis',
          done: colisDone,
          content: (
            <div className="space-y-4">
              <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-4 text-sm text-slate-700">
                Un colis plein pèse <strong>3,2 kg</strong>. Le colis vide (sans son contenu) pèse{' '}
                <strong>400 g</strong>. Quelle est la masse du contenu seul, en grammes ?
              </div>
              {/* Deux unités dans le même énoncé : le réflexe est posé AVANT
                  la soustraction, sinon la question se répond au hasard. */}
              <KnowledgeBrick
                id="mem-meme-unite"
                variant="new"
                lead="Regarde bien l'énoncé : il y a des kg ET des g. Avant de soustraire, il faut choisir."
              />
              <NumericQuestion
                requires={['mem-meme-unite', 'convertir-masse-methode', 'escalier-masses']}
                prompt="Masse du contenu, en grammes :"
                suffix="g"
                expected={2800}
                parse={parseDec}
                display={formatDec(2800)}
                explain={<>3,2 kg = 3200 g. 3200 g − 400 g = <strong>2800 g</strong>.</>}
                explainFor={() => 'Les deux masses doivent être dans la MÊME unité avant de soustraire : 3,2 kg = 3200 g.'}
                solved={colisDone}
                onAnswered={() => setColisDone(true)}
              />
            </div>
          ),
        },
      ]}
      footer={
        <KnowledgeSnapshot moduleNumber={6}>
          <strong>La suite.</strong> Ta carte est complète. Le ravitaillement du goûter t'attend :
          dix épreuves où personne ne te dira quelle connaissance sortir.
        </KnowledgeSnapshot>
      }
    />
  );
}
