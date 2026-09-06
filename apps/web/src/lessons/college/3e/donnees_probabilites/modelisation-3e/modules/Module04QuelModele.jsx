import React, { useState, useEffect, useRef } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import MathText from '../../../../../common/components/MathText';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import ModelFitter, { buildModel } from '../components/ModelFitter';
import { DATASETS } from '../components/situationsData';
import { formatDec, residual, formatModel, agreesWithAll } from '../components/modelUtils';

/**
 * Module 4 — MANIPULATION : « Quel modèle ? ».
 *
 * Activity: pour quatre jeux de données (forfait, essence, aire du carré,
 *   température), choisir une famille de modèle et régler ses paramètres
 *   jusqu'à annuler l'écart aux points — ou conclure qu'aucun modèle simple
 *   ne convient.
 * Mathematical objective: le modèle est CHOISI PAR LES DONNÉES : une part
 *   fixe demande un modèle affine, des points alignés avec O un modèle
 *   proportionnel, une croissance en carré un modèle x² ; certaines données
 *   n'admettent aucun modèle simple, et le dire est une réponse.
 * Student action: chips de famille, ± ou glissières sur a, b, c.
 * Controlled variable: la famille et ses paramètres.
 * Mathematical state: { family, params } par jeu ; l'écart et les verdicts
 *   viennent de `residual` / `verdicts`.
 * Visual consequence: la droite pivote et glisse, la parabole s'ouvre ; les
 *   points passent au vert un à un ; l'écart total tombe à 0.
 * Expected observation: « avec y = kx, le forfait n'est jamais touché en
 *   même temps qu'à 0 Go : il faut b » ; « la température n'accepte rien ».
 * Feedback: l'écart total, quantifié ; « montre-moi » après 8 réglages.
 */

const RANGES = {
  forfait: { a: { min: 0, max: 4, step: 0.5 }, b: { min: 0, max: 10, step: 1 }, k: { min: 0, max: 4, step: 0.5 }, c: { min: 0.5, max: 2, step: 0.5 } },
  essence: { k: { min: 0, max: 3, step: 0.1 }, a: { min: 0, max: 3, step: 0.1 }, b: { min: 0, max: 10, step: 1 }, c: { min: 0.05, max: 0.5, step: 0.05 } },
  carre: { c: { min: 0.5, max: 2, step: 0.5 }, k: { min: 0, max: 5, step: 0.5 }, a: { min: 0, max: 5, step: 0.5 }, b: { min: 0, max: 10, step: 1 } },
  temperature: { k: { min: 0, max: 3, step: 0.5 }, a: { min: 0, max: 3, step: 0.5 }, b: { min: 0, max: 10, step: 1 }, c: { min: 0.05, max: 0.5, step: 0.05 } },
};
const START = { k: 1, a: 1, b: 0, c: 1 };
const SOLUTIONS = {
  forfait: { family: 'affine', params: { ...START, a: 2, b: 5 } },
  essence: { family: 'proportional', params: { ...START, k: 1.8 } },
  carre: { family: 'square', params: { ...START, c: 1 } },
  temperature: { family: 'none', params: START },
};

function useFit(dataset, initialFamily) {
  const [family, setFamily] = useState(initialFamily);
  const [params, setParams] = useState(START);
  const [moves, setMoves] = useState(0);
  const [done, setDone] = useState(false);
  const model = buildModel(family, params);
  const fits = dataset.truth.kind === 'none' ? family === 'none' : agreesWithAll(model, dataset.points, 0.05);
  const reveal = () => { const s = SOLUTIONS[dataset.id]; setFamily(s.family); setParams(s.params); setMoves((m) => m + 1); };
  return { family, setFamily: (f) => { setFamily(f); setMoves((m) => m + 1); }, params, setParams: (p) => { setParams(p); setMoves((m) => m + 1); }, moves, done, setDone, model, fits, reveal };
}

export default function Module04QuelModele() {
  const [forfait, essence, carre, temp] = DATASETS;
  const f1 = useFit(forfait, 'proportional');
  const f2 = useFit(essence, 'affine');
  const f3 = useFit(carre, 'affine');
  const f4 = useFit(temp, 'affine');
  const [predDone, setPredDone] = useState(false);
  const [noneDone, setNoneDone] = useState(false);
  const reactRef = useRef(null);

  useEffect(() => {
    for (const f of [f1, f2, f3]) if (f.fits && !f.done) { f.setDone(true); reactRef.current?.(true); }
  }, [f1.fits, f2.fits, f3.fits]); // eslint-disable-line react-hooks/exhaustive-deps

  const fitter = (f, ds) => (
    <div className="space-y-3">
      <ModelFitter dataset={ds} family={f.family} params={f.params} ranges={RANGES[ds.id]} onFamily={f.setFamily} onParams={f.setParams} disabled={f.done} revealed />
      {!f.done && (
        <Feedback tone="info">
          Écart total : <strong>{f.model.kind === 'none' ? '—' : formatDec(residual(f.model, ds.points))}</strong>. Objectif : 0 — tous les points touchés.
          {f.moves >= 8 && <> <button type="button" onClick={f.reveal} className="underline font-semibold text-emerald-800 focus-visible:ring-2 focus-visible:ring-blue-500 rounded">Je ne trouve pas — montre-moi</button></>}
        </Feedback>
      )}
      {f.done && ds.truth.kind !== 'none' && (
        <Feedback tone="ok">
          Écart 0 : <MathText>{`$\\text{${ds.yLabel}} = ${formatModel(ds.truth, { variable: ds.variable })}$`}</MathText> raconte les quatre points.
          {ds.id === 'forfait' && ' Le point (0 ; 5) imposait une part fixe b = 5 : aucun modèle proportionnel ne pouvait convenir.'}
          {ds.id === 'essence' && ' (0 L ; 0 €) est sur la droite : proportionnel, k = 1,8 € par litre.'}
          {ds.id === 'carre' && ' Une droite ne pouvait pas toucher (1 ; 1), (2 ; 4), (3 ; 9), (4 ; 16) : la croissance est en carré.'}
        </Feedback>
      )}
    </div>
  );

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(4)}
      moduleNumber={4}
      moduleTitle="Quel modèle ?"
      moduleSubtitle="Règle a et b, essaie x² : les points décident du modèle — ou n’en acceptent aucun."
      estimatedTime="11 min"
      brief={{
        tag: '🎛️ Mission 04',
        title: 'Quatre jeux de données, quatre verdicts',
        tone: 'emerald',
        body: (
          <p>
            Cette fois, pas de règle : seulement des points. Pour chaque jeu, choisis une famille de modèle et
            règle ses paramètres jusqu’à ce que la courbe touche tous les points. Commence par le forfait.
          </p>
        ),
      }}
      intro={(kit) => { reactRef.current = kit.react; return null; }}
      steps={[
        {
          num: 1,
          title: 'Le forfait téléphone',
          subtitle: 'Commence en proportionnel (y = k × x). Est-ce possible ?',
          done: f1.done && predDone,
          content: (
            <div className="space-y-3">
              {fitter(f1, forfait)}
              {f1.done && (
                <TapQuestion
                  prompt="Pourquoi aucun modèle y = k × x ne pouvait convenir au forfait ?"
                  options={['Parce que 0 Go coûte déjà 5 € : la droite ne passe pas par l’origine', 'Parce que les points ne sont pas alignés', 'Parce que k devait être négatif']}
                  correct={0}
                  cols={1}
                  requires={['familles-modeles']}
                  explain="Un modèle proportionnel passe forcément par (0 ; 0). Le point (0 ; 5) l’exclut d’emblée : il faut un modèle affine, avec b = 5 (l’abonnement) et a = 2 (le prix du Go)."
                  solved={predDone}
                  onAnswered={() => setPredDone(true)}
                />
              )}
              {predDone && (
                <KnowledgeBrick
                  id="modele-choisi-par-donnees"
                  variant="new"
                  lead="Un seul point t’a interdit toute une famille. Ce n’est pas un hasard."
                />
              )}
            </div>
          ),
        },
        { num: 2, title: 'Le plein d’essence', subtitle: 'Commence en affine : que devient b ?', done: f2.done, content: fitter(f2, essence) },
        { num: 3, title: 'L’aire du carré', subtitle: 'Commence en affine : une droite peut-elle toucher les quatre points ?', done: f3.done, content: fitter(f3, carre) },
        {
          num: 4,
          title: 'La température de la journée',
          subtitle: 'Essaie tout. Puis conclus honnêtement.',
          done: noneDone,
          content: (
            <div className="space-y-3">
              <ModelFitter dataset={temp} family={f4.family} params={f4.params} ranges={RANGES.temperature} onFamily={f4.setFamily} onParams={f4.setParams} disabled={noneDone} revealed />
              {(noneDone || f4.moves >= 3) && (
                <TapQuestion
                  prompt="Après plusieurs essais, aucune droite ni parabole ne touche les quatre points (8 °C à 6 h, 14 °C à 10 h, 21 °C à 14 h, 16 °C à 18 h). Que conclure ?"
                  options={['Aucun modèle simple ne convient : la température monte puis redescend', 'Il faut un modèle proportionnel avec un plus grand k', 'Les données sont fausses', 'Le modèle affine avec b = 8 convient à peu près, c’est suffisant']}
                  correct={0}
                  cols={1}
                  requires={['modele-choisi-par-donnees', 'familles-modeles', 'mem-toutes-les-donnees']}
                  explain="Choisir « aucun modèle simple » est une conclusion légitime : la température monte le matin et redescend le soir, aucune droite ni parabole y = c × x² ne suit cette forme. Un modèle « à peu près » qui rate trois points sur quatre n’est pas un modèle."
                  solved={noneDone}
                  onAnswered={() => setNoneDone(true)}
                />
              )}
              {noneDone && (
                <KnowledgeBrick
                  id="aucun-modele-simple"
                  variant="new"
                  lead="Tu viens de refuser de forcer un modèle. C’est une bonne réponse, pas un abandon."
                />
              )}
              {!noneDone && f4.moves < 3 && <Feedback tone="info">Essaie au moins trois réglages ou familles avant de conclure.</Feedback>}
            </div>
          ),
        },
      ]}
      footer={
        <KnowledgeSnapshot moduleNumber={4}>
          Tu as réglé les modèles à la main, chiffre par chiffre. Le module suivant les écrit en une seule ligne — et met des mots sur tout le cycle.
        </KnowledgeSnapshot>
      }
    />
  );
}
