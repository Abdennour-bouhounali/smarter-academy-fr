import React, { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import RectangleLab from '../components/RectangleLab';
import { formatFr } from '../components/estimationUtils';
import EstimateInput from '../components/EstimateInput';

/**
 * Module 6 — manipulation, reconstruit sur le lesson kit.
 *
 * Un produit = une surface : arrondir les deux facteurs et « voir » le
 * rectangle donne l'ordre de grandeur. L'étape 1 vérifie désormais la
 * compréhension par une vraie question (plus de bouton « J'ai compris »
 * auto-certifié).
 */

/* ─── Étape 1 : voir le rectangle avant de calculer ──────────────── */
const RECT_Q = {
  q: 'Avec ce rectangle, quel est l\'ordre de grandeur de 49 × 21 ?',
  options: ['≈ 100', '≈ 1 000', '≈ 10 000'],
  correct: 1,
  explain:
    "La surface du rectangle donne directement l'ordre de grandeur : 50 × 20 = 1 000. On « voit » le résultat, sans poser la multiplication.",
};

/**
 * Le rectangle ne se RÉVÈLE plus : il se CONSTRUIT.
 *
 * L'ancienne étape 1 était un bouton « Voir le rectangle 50 × 20 » suivi d'une
 * image fixe et d'un QCM. L'élève ne posait aucun arrondi ; le rectangle de
 * 50 × 20 lui était donné tout fait, donc le geste central de la leçon —
 * remplacer 49 par 50 et 21 par 20 — n'était jamais fait.
 *
 * Ici, l'élève tire les deux côtés jusqu'aux dimensions rondes, et le
 * rectangle exact (49 × 21) reste en pointillé derrière : il VOIT le peu qu'il
 * ajoute ou retire, et la surface se recalcule sous son doigt.
 */
function RectangleAtelier({ solved, onAnswered }) {
  const [a, setA] = useState(30);
  const [b, setB] = useState(30);
  // Le rectangle « rond » visé : 50 × 20. On ne le nomme pas — l'élève le
  // trouve en tirant, et le pointillé lui dit quand il colle au vrai.
  const rond = a === 50 && b === 20;
  const [atteint, setAtteint] = useState(false);
  if (rond && !atteint) setAtteint(true);

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">
        <strong className="font-mono">49 × 21</strong> est dessiné en pointillé. Tire les deux côtés jusqu'à
        des dimensions <strong>rondes</strong>, aussi près que possible du pointillé.
      </p>

      <RectangleLab
        a={a} b={b}
        onA={setA} onB={setB}
        exactA={49} exactB={21}
        maxA={80} maxB={40}
        stepA={10} stepB={5}
      />

      {(atteint || solved) && (
        <Feedback tone="ok">
          {rond ? (
            <>
              <strong className="font-mono">50 × 20 = 1 000</strong>, et le vrai rectangle (49 × 21 = 1 029)
              tient presque exactement dedans. Tu n'as pas posé la multiplication : tu as lu une surface.
            </>
          ) : (
            <>
              Tu continues d'explorer : <strong className="font-mono">{a} × {b} = {formatFr(a * b)}</strong>.
              Compare au pointillé — combien peux-tu bouger un côté sans changer la taille du rectangle ?
            </>
          )}
        </Feedback>
      )}

      {(atteint || solved) && (
        <TapQuestion
          prompt={RECT_Q.q}
          requires={['arrondi', 'ordre-de-grandeur']}
          options={RECT_Q.options}
          correct={RECT_Q.correct}
          cols={3}
          explain={RECT_Q.explain}
          solved={solved}
          onAnswered={onAnswered}
        />
      )}
    </div>
  );
}

/* ─── Étape 2 : détecter un résultat faux ────────────────────────── */
const FAUX_Q = {
  q: 'Un élève calcule 49 × 21 et trouve 129. Que penses-tu de ce résultat, avec ton estimation de 1 000 ?',
  options: [
    '129 est cohérent avec 1 000',
    '129 est beaucoup trop petit : le résultat est faux, il manque sûrement un chiffre',
  ],
  correct: 1,
  explain:
    "Le vrai résultat est 1 029, très proche de l'estimation 1 000. 129 est presque 10 fois trop petit : c'est une erreur évidente (un zéro oublié, par exemple).",
};

/* ─── Étape 3 : à toi d'estimer ───────────────────────────────────── */
const PRODUITS = [
  { a: 31, b: 19, exact: 589, min: 500, max: 700, hint: '31 ≈ 30 et 19 ≈ 20 : 30 × 20 = 600.' },
  { a: 58, b: 11, exact: 638, min: 500, max: 700, hint: '58 ≈ 60 et 11 ≈ 10 : 60 × 10 = 600.' },
];

export default function Module06Produit() {
  const [rectDone, setRectDone] = useState(false);
  const [fauxDone, setFauxDone] = useState(false);
  const [prodDone, setProdDone] = useState([]);

  const s1 = rectDone;
  const s2 = fauxDone;
  const s3 = prodDone.length === PRODUITS.length;

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(6)}
      moduleNumber={6}
      moduleTitle="Ordre de grandeur d'un produit"
      moduleSubtitle="Un produit est une surface : rends le rectangle rond, et lis sa taille."
      estimatedTime="8 min"
      brief={{
        tag: '✖️ Produit',
        title: "Une multiplication, c'est une surface.",
        body: <p>Arrondir les deux facteurs et imaginer le rectangle donne immédiatement l'ordre de grandeur.</p>,
      }}
      steps={[
        {
          num: 1,
          // Le titre ne donne plus les dimensions rondes : c'est précisément ce
          // que l'élève doit trouver en tirant les côtés.
          title: 'Rends le rectangle rond',
          subtitle: 'Tire les deux côtés jusqu’à des dimensions faciles à multiplier.',
          done: s1,
          content: (
            <div className="space-y-5">
              <RectangleAtelier solved={rectDone} onAnswered={() => setRectDone(true)} />
              {s1 && (
                <KnowledgeBrick
                  id="produit-rectangle"
                  variant="new"
                  lead="Les 1 000 cases que tu viens de lire d'un coup d'œil, sans poser la multiplication."
                />
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'Un résultat clairement faux',
          done: s2,
          content: (
            <TapQuestion
              above={
                <div className="bg-slate-900 rounded-xl py-4 text-center">
                  <div className="font-mono font-extrabold text-2xl text-white">49 × 21 = 129</div>
                </div>
              }
              prompt={FAUX_Q.q}
              requires={['produit-rectangle']}
              options={FAUX_Q.options}
              correct={FAUX_Q.correct}
              cols={1}
              explain={FAUX_Q.explain}
              solved={fauxDone}
              onAnswered={() => setFauxDone(true)}
            />
          ),
        },
        {
          num: 3,
          title: "À toi d'estimer",
          done: s3,
          content: (
            <div className="space-y-8">
              {PRODUITS.map((p, i) =>
                i === 0 || prodDone.includes(i - 1) ? (
                  <div key={`${p.a}-${p.b}`} className="space-y-2 border-t border-slate-100 pt-5 first:border-0 first:pt-0">
                    <div className="text-center font-mono text-2xl font-extrabold text-slate-800">
                      {p.a} × {p.b}
                    </div>
                    <EstimateInput
                      prompt="Arrondis chaque facteur, puis multiplie mentalement."
                      acceptMin={p.min}
                      acceptMax={p.max}
                      exact={p.exact}
                      hint={p.hint}
                      solved={prodDone.includes(i)}
                      onAnswered={() => setProdDone((d) => (d.includes(i) ? d : [...d, i]))}
                    />
                  </div>
                ) : null
              )}
            </div>
          ),
        },
      ]}
      footer={
        <KnowledgeSnapshot moduleNumber={6}>
          <strong>La suite.</strong> Les trois opérations sont couvertes. Il reste à rendre le
          verdict : ce résultat tient-il debout, oui ou non ?
        </KnowledgeSnapshot>
      }
    />
  );
}
