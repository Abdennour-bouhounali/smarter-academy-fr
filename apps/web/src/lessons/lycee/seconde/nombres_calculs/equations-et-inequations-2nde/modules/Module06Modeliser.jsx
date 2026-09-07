import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import MathText from '../../../../../common/components/MathText';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { parseDec } from '../components/eqUtils';

/**
 * Module 6 — PRACTICE LAB : « Modéliser » — traduire, résoudre, vérifier,
 * interpréter : un rectangle, un budget, une poursuite, une solution
 * mathématique inacceptable.
 */
export default function Module06Modeliser() {
  const [d1a, setD1a] = useState(false); const [d1b, setD1b] = useState(false);
  const [d2, setD2] = useState(false);
  const [d3a, setD3a] = useState(false); const [d3b, setD3b] = useState(false);
  const [d4, setD4] = useState(false);
  return (
    <ContentModule
      ctx={MODULE_CTX} navLinks={getNavLinks(6)} moduleNumber={6}
      moduleTitle="Modéliser"
      moduleSubtitle="Un rectangle, un budget, une vitesse : traduire, résoudre, vérifier, interpréter."
      estimatedTime="14 min"
      brief={{ tag: '🧩 Mission 06', title: 'Le problème est en français. L’équation, c’est toi qui l’écris.', tone: 'indigo', body: <p>À chaque fois : choisir l’inconnue, traduire, résoudre, vérifier — et se demander si la solution a un sens.</p> }}
      steps={[
        {
          num: 1, title: 'Le rectangle', subtitle: 'Un rectangle a une longueur de 3 cm de plus que sa largeur x. Son périmètre vaut 26 cm.', done: d1a && d1b,
          content: (
            <div className="space-y-3">
              <TapQuestion prompt="Quelle équation traduit la situation ?" options={['2x + 2(x + 3) = 26', 'x + (x + 3) = 26', 'x(x + 3) = 26', '2x + 3 = 26']} cols={2} correct={0}
                explain="Périmètre = 2 × largeur + 2 × longueur = 2x + 2(x + 3). x + (x + 3) n’est que la moitié du tour ; x(x + 3) est l’aire."
                explainWrong="Le périmètre fait le TOUR : deux largeurs (2x) et deux longueurs (2(x + 3)). Donc 2x + 2(x + 3) = 26."
                requires={['calcul-litteral', 'equation-solution']}
                solved={d1a} onAnswered={() => setD1a(true)} />
              {d1a && (
                <KnowledgeBrick
                  id="methode-traduire-vitesse"
                  variant="new"
                  compact
                  lead="Tu viens d’écrire une grandeur — un tour de rectangle — avec l’inconnue. C’est le geste que réclame chaque problème de ce module."
                />
              )}
              {d1a && (
                <NumericQuestion prompt="Résous : quelle est la largeur x ?" expected={5} parse={parseDec} display="5" suffix="cm"
                  explain="2x + 2x + 6 = 26, 4x = 20, x = 5. Vérification : largeur 5, longueur 8, périmètre 2 × 5 + 2 × 8 = 26 ✓."
                  explainFor={(v) => (v === 6.5 ? 'Tu as oublié de développer 2(x + 3) = 2x + 6 : 4x + 6 = 26 → 4x = 20 → x = 5.' : v === 8 ? '8 est la LONGUEUR (x + 3). La largeur x vaut 5.' : v === 10 ? '4x = 20 donne x = 5, pas 10 : on divise par 4, le nombre qui multiplie x.' : '4x + 6 = 26 → 4x = 20 → x = 5. Vérifie : 2 × 5 + 2 × 8 = 26.')}
                  requires={['methode-premier-degre', 'methode-traduire-vitesse', 'developper', 'methode-verifier-solution']}
                  solved={d1b} onAnswered={() => setD1b(true)} />
              )}
              {d1a && d1b && (
                <KnowledgeBrick
                  id="methode-modeliser"
                  variant="new"
                  lead="Traduire, résoudre, vérifier dans l’énoncé : tu viens de parcourir la chaîne entière sur le rectangle."
                />
              )}
            </div>
          ),
        },
        {
          num: 2, title: 'Le budget', subtitle: 'Location d’un vélo : 15 € plus 2 € par heure. Budget maximal : 25 €.', done: d2,
          content: (
            <TapQuestion prompt="Combien d’heures h peut-on louer ?" options={['h ∈ [0 ; 5] : 15 + 2h ≤ 25', 'h ∈ ]−∞ ; 5]', 'h = 5 exactement', 'h ∈ [5 ; +∞[']} cols={2} correct={0}
              explain="15 + 2h ≤ 25 ⇔ 2h ≤ 10 ⇔ h ≤ 5. Et une durée n’est pas négative : h ≥ 0. Ensemble des solutions acceptables : [0 ; 5]. Toutes les durées jusqu’à 5 h conviennent, pas seulement 5."
              explainWrong="« Au maximum 25 € » donne une INÉQUATION : 15 + 2h ≤ 25, soit h ≤ 5 — toutes les durées jusqu’à 5 h conviennent. Et h ≥ 0 (une durée) : [0 ; 5]."
              requires={['methode-modeliser', 'methode-resoudre-inequation', 'inequation-infinite', 'appartient', 'intervalle', 'intervalle-crochets']}
              solved={d2} onAnswered={() => setD2(true)} />
          ),
        },
        {
          num: 3, title: 'La poursuite', subtitle: 'Une voiture A part à 60 km/h. Une voiture B part du même endroit 1 h plus tard à 90 km/h. Soit t le temps (en h) écoulé depuis le départ de A.', done: d3a && d3b,
          content: (
            <div className="space-y-3">
              <TapQuestion prompt="Quelle équation exprime « B rattrape A » ?" options={['60t = 90(t − 1)', '60t = 90t − 1', '60t = 90(t + 1)', '60 + t = 90 + t − 1']} cols={2} correct={0}
                explain="Distance = vitesse × temps. A a roulé t heures : 60t. B a roulé une heure de moins : 90(t − 1). Rattraper = même distance."
                explainWrong="B est parti 1 h APRÈS A : quand A a roulé t heures, B n’a roulé que t − 1 heures. Sa distance est 90(t − 1) — la parenthèse compte."
                requires={['methode-traduire-vitesse', 'methode-modeliser']}
                solved={d3a} onAnswered={() => setD3a(true)} />
              {d3a && (
                <NumericQuestion prompt="Au bout de combien d’heures (depuis le départ de A) B rattrape-t-il A ?" expected={3} parse={parseDec} display="3" suffix="h"
                  explain="60t = 90t − 90 ⇔ −30t = −90 ⇔ t = 3. Vérification : A a fait 180 km, B a roulé 2 h à 90 km/h = 180 km ✓."
                  explainFor={(v) => (v === 2 ? '2 h est le temps de roulage de B (t − 1). Depuis le départ de A, cela fait t = 3 h.' : v === 1.5 ? '60t = 90t − 90 : les 90 s’obtiennent en développant 90(t − 1). Alors −30t = −90, t = 3.' : '60t = 90(t − 1) ⇔ 60t = 90t − 90 ⇔ 30t = 90 ⇔ t = 3 h.')}
                  requires={['methode-premier-degre', 'developper', 'methode-verifier-solution']}
                  solved={d3b} onAnswered={() => setD3b(true)} />
              )}
            </div>
          ),
        },
        {
          num: 4, title: 'Interpréter', done: d4,
          content: (
            <div className="space-y-3">
              <TapQuestion prompt={<>En cherchant la largeur x d’un rectangle, Léo résout correctement son équation et trouve <MathText>{'$x = -2$'}</MathText>. Que doit-il conclure ?</>}
              options={['La solution mathématique existe, mais elle n’a pas de sens ici : le problème n’a pas de solution (ou l’équation est mal posée)', 'La largeur vaut −2 cm', 'Il faut prendre 2 cm', 'Son calcul est forcément faux']} cols={1} correct={0}
              explain="Une équation peut avoir une solution que la situation refuse (une longueur négative). Résoudre ne suffit pas : on INTERPRÈTE la solution dans le contexte. Ici, soit le problème n’a pas de solution, soit la mise en équation est à revoir."
                explainWrong="Une longueur ne peut pas être négative, et « prendre 2 » ne vérifie pas l’équation. La bonne réaction : la solution mathématique n’a pas de sens ici — interpréter avant de conclure."
                requires={['methode-modeliser', 'equation-solution', 'nombres-relatifs']}
                solved={d4} onAnswered={() => setD4(true)} />
              {d4 && (
                <KnowledgeBrick
                  id="regle-interpreter-solution"
                  variant="new"
                  compact
                  lead="Le calcul de Léo est juste et sa réponse est pourtant inutilisable. Retiens ce dernier réflexe."
                />
              )}
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={6} />}
    />
  );
}
