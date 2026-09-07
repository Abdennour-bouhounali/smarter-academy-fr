import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import ValueTable from '../../../../../common/components/ValueTable';
import MathText from '../../../../../common/components/MathText';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import ProofOrder from '../components/ProofOrder';
import { parseDec } from '../components/litteralUtils';

/**
 * Module 6 — PRACTICE LAB : « Démontrer et résoudre ».
 * Prouver le tour de magie (lignes à ordonner), un carré caché
 * n(n + 2) + 1 = (n + 1)², l'aire d'un cadre, une fraction qui se simplifie.
 */
const PROOF = [
  { id: 'l1', text: 'Soit $x$ le nombre de départ.', plain: 'Soit x le nombre de départ' },
  { id: 'l2', text: 'Après « × 3 » puis « + 9 » : $3x + 9$.', plain: 'Après ×3 puis +9 : 3x + 9' },
  { id: 'l3', text: 'Après « ÷ 3 » : $\\dfrac{3x + 9}{3} = x + 3$.', plain: 'Après ÷3 : x + 3' },
  { id: 'l4', text: 'Après « − le nombre de départ » : $x + 3 - x = 3$.', plain: 'Après − le nombre : 3' },
  { id: 'l5', text: 'Donc le résultat vaut 3 pour TOUT $x$.', plain: 'Donc le résultat vaut 3 pour tout x' },
];
const ORDER = ['l3', 'l1', 'l5', 'l2', 'l4'];

export default function Module06DemontrerEtResoudre() {
  const [proofDone, setProofDone] = useState(false);
  const [tested, setTested] = useState(() => new Set());
  const [squareDone, setSquareDone] = useState(false);
  const [frameDone, setFrameDone] = useState(false);
  const [fracDone, setFracDone] = useState(false);
  return (
    <ContentModule
      ctx={MODULE_CTX} navLinks={getNavLinks(6)} moduleNumber={6}
      moduleTitle="Démontrer et résoudre"
      moduleSubtitle="Prouver le tour de magie, un carré caché, l’aire d’un cadre, une fraction qui se simplifie."
      estimatedTime="13 min"
      brief={{ tag: '🧠 Mission 06', title: 'Le calcul littéral ne sert pas qu’à transformer : il prouve.', tone: 'indigo', body: <p>Remets une démonstration en ordre, découvre un carré caché, puis deux situations.</p> }}
      steps={[
        {
          num: 1, title: 'Prouve le tour de magie', subtitle: 'Touche les lignes dans l’ordre, de l’hypothèse à la conclusion.', done: proofDone,
          content: (
            <div className="space-y-3">
              <ProofOrder lines={PROOF} order={ORDER} onDone={() => setProofDone(true)} solved={proofDone} />
              {/* Les cinq lignes viennent d'être remises dans l'ordre : c'est
                  l'instant où « démontrer avec le calcul littéral » se nomme,
                  avant que l'étape 2 ne redemande le même geste sur un autre cas. */}
              {proofDone && (
                <KnowledgeBrick
                  id="methode-demontrer-litteral"
                  variant="new"
                  lead={<>Tu viens d’écrire avec x ce qui vaut pour tous les nombres, de le transformer, puis de conclure sur la forme obtenue : x + 3 − x = 3.</>}
                />
              )}
            </div>
          ),
        },
        {
          num: 2, title: 'Le carré caché', subtitle: 'Prends un entier n, multiplie-le par n + 2, ajoute 1. Toujours un carré parfait ?', done: tested.size >= 3 && squareDone,
          content: (kit) => (
            <div className="space-y-3">
              <ValueTable columns={[{ id: 'a', label: <MathText>{'$n(n+2)+1$'}</MathText>, fn: (n) => n * (n + 2) + 1 }, { id: 'b', label: <MathText>{'$(n+1)^{2}$'}</MathText>, fn: (n) => (n + 1) ** 2 }]} xs={[3, 4, 7, 10, 0]} tested={tested} onTest={(v) => { const s = new Set(tested); s.add(v); setTested(s); if (s.size === 3) kit.react(true); }} variable="n" caption="Chaque ligne verte : les deux colonnes coïncident." />
              {tested.size >= 3 && (
                <TapQuestion prompt="Le tableau est vert partout. Qu’est-ce qui PROUVE que n(n + 2) + 1 est toujours un carré ?" options={['Développer : n(n + 2) + 1 = n² + 2n + 1 = (n + 1)², pour tout n', 'Les cinq lignes vertes', 'Que 15, 24, 63, 120 et 1 soient tous des carrés moins un']} cols={1} correct={0}
                  requires={['methode-demontrer-litteral', 'developper', 'regle-tester-ne-prouve-pas']}
                  explain="n² + 2n + 1 est l’identité (a + b)² avec a = n, b = 1 : c’est (n + 1)², un carré, pour TOUT entier n. Le tableau fait deviner, le calcul littéral démontre."
                  explainWrong="Cinq lignes vertes ne couvrent pas l’infinité des entiers. La preuve : n(n + 2) + 1 = n² + 2n + 1 = (n + 1)², vrai pour tout n."
                  solved={squareDone} onAnswered={() => setSquareDone(true)} />
              )}
            </div>
          ),
        },
        {
          num: 3, title: 'L’aire du cadre', subtitle: 'Une photo de L cm sur l cm, dans un cadre de 2 cm de large tout autour.', done: frameDone,
          content: (
            <div className="space-y-3">
              {/* La situation vient d'être posée en L et l : c'est l'instant où
                  « modéliser une situation par une expression » se nomme, avant
                  la question qui demande de développer cette modélisation. */}
              <KnowledgeBrick
                id="methode-modeliser-aire"
                variant="new"
                compact
                lead={<>Une photo de L sur l, un cadre de 2 cm tout autour : nommer les dimensions par des lettres permet d’écrire une aire, puis de la développer.</>}
              />
              <NumericQuestion prompt="L’aire du cadre seul est (L + 4)(l + 4) − L × l. Une fois développée et réduite, elle vaut 4L + 4l + k. Combien vaut k ?" expected={16} suffix=""
                requires={['methode-modeliser-aire', 'developper']}
                explain="(L + 4)(l + 4) = Ll + 4L + 4l + 16 ; on retire Ll : 4L + 4l + 16. Les quatre coins du cadre font 4 carrés de 2 × 2 = 16 cm². La forme développée donne une formule utilisable pour toute photo."
                explainFor={(v) => (v === 4 ? '4 est la largeur ajoutée (2 de chaque côté). Le terme constant est 4 × 4 = 16 : les quatre coins de 2 × 2.' : v === 8 ? '2 cm de chaque côté, c’est +4 sur chaque dimension : (L + 4)(l + 4). Le terme constant est 16.' : 'Développe : (L + 4)(l + 4) = Ll + 4L + 4l + 16, puis retire Ll. k = 16.')}
                solved={frameDone} onAnswered={() => setFrameDone(true)} />
            </div>
          ),
        },
        {
          num: 4, title: 'Une fraction qui se simplifie', done: fracDone,
          content: (
            <div className="space-y-3">
              {/* La question va exiger de factoriser AVANT de simplifier : la
                  règle se nomme ici, pour que le piège (simplifier des termes)
                  soit déjà écarté au moment de répondre. */}
              <KnowledgeBrick
                id="regle-simplifier-facteurs"
                variant="new"
                compact
                lead="On ne simplifie jamais des termes d’une somme — seulement des facteurs communs à un numérateur et un dénominateur, après avoir factorisé."
              />
              <TapQuestion prompt={<>Pour x ≠ −2, que vaut <MathText>{'$\\dfrac{2x + 4}{x + 2}$'}</MathText> ?</>} options={['2, car 2x + 4 = 2(x + 2)', '2x, en simplifiant les 4 et 2', 'x + 2', 'Ça dépend de x']} cols={2} correct={0}
                requires={['regle-simplifier-facteurs', 'factoriser']}
                explain="Factoriser le numérateur : 2x + 4 = 2(x + 2). Le facteur (x + 2) se simplifie avec le dénominateur (à condition qu’il soit non nul, d’où x ≠ −2) : il reste 2, pour tout x autorisé."
                explainWrong="On ne simplifie que des FACTEURS, jamais des termes : il faut d’abord factoriser 2x + 4 = 2(x + 2). Alors (x + 2) se simplifie et il reste 2 — pour tout x ≠ −2."
                solved={fracDone} onAnswered={() => setFracDone(true)} />
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={6} />}
    />
  );
}
