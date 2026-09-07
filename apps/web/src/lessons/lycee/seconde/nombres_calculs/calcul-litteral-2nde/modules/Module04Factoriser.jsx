import React, { useState } from 'react';
import { ContentModule, KnowledgeBrick } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import ValueTable from '../../../../../common/components/ValueTable';
import MathText from '../../../../../common/components/MathText';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import FactorFinder from '../components/FactorFinder';

/**
 * Module 4 — MANIPULATION : « Factoriser : le facteur commun ».
 * Activity: quatre sommes, quatre facteurs communs à trouver : un monôme
 *   (4x), un binôme entier (x + 1), une différence de carrés, un carré
 *   parfait ; vérification au tableau de valeurs.
 * Mathematical objective: factoriser = écrire un produit ; le facteur commun
 *   peut être un nombre, un monôme ou tout un (x + 1) ; a² − b² et
 *   a² + 2ab + b² se reconnaissent.
 * Misconception targeted: « on ne sort que le nombre » (4 au lieu de 4x),
 *   « (x + 1) n'est pas un facteur », « x² − 25 ne se factorise pas ».
 */
const TASKS = [
  { id: 't1', expression: '4x^{2} + 12x', prompt: 'Quel est le PLUS GRAND facteur commun aux deux termes ?', factoredRaw: '4x \\times x + 4x \\times 3', factored: '4x(x + 3)',
    candidates: [
      { id: 'c4', label: '4', plain: '4', ok: false, why: '4 est bien commun (4x² = 4 · x², 12x = 4 · 3x), mais on peut sortir plus : x est aussi dans les deux termes.' },
      { id: 'cx', label: 'x', plain: 'x', ok: false, why: 'x est bien commun, mais 4 aussi : le plus grand facteur commun est 4x.' },
      { id: 'c4x', label: '4x', plain: '4x', ok: true, why: '4x² = 4x · x et 12x = 4x · 3 : on sort 4x et il reste (x + 3). Vérifie en développant : 4x · x + 4x · 3 = 4x² + 12x.' },
      { id: 'c12', label: '12x', plain: '12x', ok: false, why: '12x ne divise pas 4x² (4x² ÷ 12x = x/3, pas un terme entier) : ce n’est pas un facteur commun.' },
    ] },
  { id: 't2', expression: '(x + 1)(2x - 3) + (x + 1)(x + 4)', prompt: 'Quel facteur les deux termes partagent-ils ?', factoredRaw: '(x + 1)\\big[(2x - 3) + (x + 4)\\big]', factored: '(x + 1)(3x + 1)',
    candidates: [
      { id: 'cx1', label: 'x + 1', plain: 'x + 1', ok: true, why: 'Tout le binôme (x + 1) est commun : on le sort devant, et on ADDITIONNE ce qui reste : (2x − 3) + (x + 4) = 3x + 1.' },
      { id: 'c2x3', label: '2x - 3', plain: '2x − 3', ok: false, why: '2x − 3 n’apparaît que dans le premier terme : pas commun.' },
      { id: 'cx', label: 'x', plain: 'x', ok: false, why: 'x n’est pas un facteur de (x + 1) : dans x + 1 il y a un +. Le facteur commun est le binôme ENTIER (x + 1).' },
      { id: 'c1', label: '1', plain: '1', ok: false, why: '1 est facteur de tout, mais ne factorise rien. Cherche ce que les DEUX produits partagent : la parenthèse (x + 1).' },
    ] },
  { id: 't3', expression: 'x^{2} - 25', prompt: 'Cette expression est une différence de deux carrés. Quelle forme factorisée ?', factoredRaw: 'x^{2} - 5^{2}', factored: '(x - 5)(x + 5)',
    candidates: [
      { id: 'a', label: '(x - 5)(x + 5)', plain: '(x − 5)(x + 5)', ok: true, why: 'a² − b² = (a − b)(a + b) avec a = x et b = 5. Vérifie : (x − 5)(x + 5) = x² + 5x − 5x − 25 = x² − 25.' },
      { id: 'b', label: '(x - 5)^{2}', plain: '(x − 5)²', ok: false, why: '(x − 5)² = x² − 10x + 25 : il y aurait un terme en x et un +25. Pas notre expression.' },
      { id: 'c', label: 'x(x - 25)', plain: 'x(x − 25)', ok: false, why: 'x(x − 25) = x² − 25x, pas x² − 25 : x n’est pas un facteur de 25.' },
    ] },
  { id: 't4', expression: '4x^{2} + 12x + 9', prompt: 'Trois termes, et une identité qui se cache. Laquelle ?', factoredRaw: '(2x)^{2} + 2 \\cdot 2x \\cdot 3 + 3^{2}', factored: '(2x + 3)^{2}',
    candidates: [
      { id: 'a', label: '(2x + 3)^{2}', plain: '(2x + 3)²', ok: true, why: '4x² = (2x)², 9 = 3², et le terme du milieu 12x = 2 · 2x · 3 : c’est a² + 2ab + b² = (a + b)².' },
      { id: 'b', label: '(4x + 3)^{2}', plain: '(4x + 3)²', ok: false, why: '(4x + 3)² = 16x² + 24x + 9 : le premier terme serait 16x², pas 4x².' },
      { id: 'c', label: '(2x + 9)(2x + 1)', plain: '(2x + 9)(2x + 1)', ok: false, why: '(2x + 9)(2x + 1) = 4x² + 20x + 9 : le terme en x ne colle pas. Cherche a² + 2ab + b².' },
      { id: 'd', label: '4x(x + 3) + 9', plain: '4x(x + 3) + 9', ok: false, why: 'C’est encore une SOMME (… + 9), pas un produit : ce n’est pas factorisé.' },
    ] },
];

export default function Module04Factoriser() {
  const [done, setDone] = useState({});
  const [tested, setTested] = useState(() => new Set());
  const mark = (id) => () => setDone((d) => ({ ...d, [id]: true }));
  return (
    <ContentModule
      ctx={MODULE_CTX} navLinks={getNavLinks(4)} moduleNumber={4}
      moduleTitle="Factoriser : le facteur commun"
      moduleSubtitle="Un nombre, un x, ou tout un (x + 1) : trouve ce que les termes partagent et sors-le devant."
      estimatedTime="11 min"
      brief={{ tag: '🔎 Mission 04', title: 'Développer coupe en morceaux. Factoriser recolle : retrouver le produit.', tone: 'indigo', body: <p>Quatre sommes. À chaque fois, touche le facteur commun — le plus grand possible.</p> }}
      steps={[
        {
          num: 1, title: 'Un monôme commun', done: !!done.t1,
          content: (
            <div className="space-y-3">
              <FactorFinder task={TASKS[0]} onDone={mark('t1')} solved={!!done.t1} />
              {/* Le facteur 4x vient d'être sorti devant : c'est l'instant où
                  « factoriser » se nomme — avant que le module 5 ne le redemande. */}
              {!!done.t1 && (
                <KnowledgeBrick
                  id="factoriser"
                  variant="new"
                  compact
                  lead={<>Tu viens de transformer une somme en produit : c’est le chemin inverse de développer. Cette opération s’appelle <strong>factoriser</strong>.</>}
                />
              )}
            </div>
          ),
        },
        {
          num: 2, title: 'Un binôme commun', done: !!done.t2,
          content: (
            <div className="space-y-3">
              <FactorFinder task={TASKS[1]} onDone={mark('t2')} solved={!!done.t2} />
              {!!done.t2 && (
                <KnowledgeBrick
                  id="methode-facteur-commun"
                  variant="new"
                  lead={<>Cette fois le facteur commun était tout un binôme, (x + 1) — pas seulement un nombre ou un x.</>}
                />
              )}
            </div>
          ),
        },
        { num: 3, title: 'Une différence de carrés', done: !!done.t3, content: <FactorFinder task={TASKS[2]} onDone={mark('t3')} solved={!!done.t3} /> },
        {
          num: 4, title: 'Un carré caché', done: !!done.t4,
          content: (
            <div className="space-y-3">
              <FactorFinder task={TASKS[3]} onDone={mark('t4')} solved={!!done.t4} />
              {/* Les étapes 3 et 4 viennent de reconnaître les deux identités à
                  l'envers : a² − b², puis a² + 2ab + b². */}
              {!!done.t4 && (
                <KnowledgeBrick
                  id="methode-identite-inverse"
                  variant="new"
                  lead={<>x² − 25 et 4x² + 12x + 9 se factorisaient sans facteur commun apparent : il fallait reconnaître une identité remarquable à l’envers.</>}
                />
              )}
            </div>
          ),
        },
        {
          num: 5, title: 'Vérifier, pas croire', subtitle: 'Teste (x + 1)(3x + 1) contre la somme de départ.', done: tested.size >= 3,
          content: (kit) => (
            <ValueTable columns={[{ id: 's', label: <MathText>{'$(x+1)(2x-3)+(x+1)(x+4)$'}</MathText>, fn: (x) => (x + 1) * (2 * x - 3) + (x + 1) * (x + 4) }, { id: 'f', label: <MathText>{'$(x+1)(3x+1)$'}</MathText>, fn: (x) => (x + 1) * (3 * x + 1) }]} xs={[0, 1, 2, -1, 5]} tested={tested} onTest={(v) => { const s = new Set(tested); s.add(v); setTested(s); if (s.size === 3) kit.react(true); }} caption="Trois valeurs au moins : une factorisation se vérifie." />
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={4} />}
    />
  );
}
