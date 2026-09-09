import React, { useState } from 'react';
import { Sparkles, Scale } from 'lucide-react';
import { ContentModule, TapQuestion, PredictionChips, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { FractionView } from '../../../../../common/algebra4e';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import CroixLab from '../components/CroixLab';
import { produitsEnCroix, brut } from '../components/rationnels4e';

/**
 * Module 1 — DÉCLENCHEUR, et l'interaction SIGNATURE : fabriquer des égalités
 * de fractions et voir deux produits trancher (components/CroixLab.jsx).
 *
 * Activity              régler les quatre nombres d'une égalité présumée
 *                       a/b = c/d, d'abord pour la rendre vraie, puis pour la
 *                       casser d'un seul cran.
 * Mathematical objective deux fractions sont égales EXACTEMENT quand leurs
 *                       produits en croix le sont. La 5e décidait en
 *                       simplifiant — un tâtonnement ; la 4e décide sur deux
 *                       ENTIERS, donc toujours.
 * Student action        −/+ sur un terme à la fois.
 * Controlled variable   les quatre entiers, un seul modifié à la fois (§8).
 * Mathematical state    {a, b, c, d} — détenu ICI, le laboratoire n'en garde
 *                       rien : la manipulation est rejouable indéfiniment et
 *                       survit à tout remontage.
 * Visual consequence    les deux diagonales portent chacune leur produit et
 *                       passent au vert ENSEMBLE ; le signe central bascule
 *                       entre = et ≠.
 * Expected observation  « pour garder l'égalité il faut multiplier les deux
 *                       termes — pas leur ajouter la même chose » ; puis
 *                       « un seul cran, et les deux produits se séparent ».
 * Misconception targeted « 2/3 = 3/4, il y a 1 d'écart des deux côtés » —
 *                       l'erreur ADDITIVE, exactement ce contre quoi le test
 *                       multiplicatif protège.
 * Formalization         AUCUNE règle énoncée ici. Le mot « produit en croix »
 *                       est posé par la brique à l'étape 3, après que la
 *                       manipulation l'a rendu inévitable ; le nombre
 *                       rationnel et le signe attendent le module 2.
 * Transfer              module 3 : le même geste « ramener à des entiers »
 *                       fabrique le dénominateur commun.
 *
 * §6bis / règle M1 : l'étape 1 REND la manipulation ; la prédiction vit à
 * l'intérieur de l'étape comme une invitation, jamais comme un péage.
 */

/** L'égalité de départ, volontairement FAUSSE : il y a quelque chose à réparer. */
const DEPART = { a: 2, b: 3, c: 5, d: 8 };

export default function Module01LaCroixQuiTranche() {
  const [pred, setPred] = useState(null);

  // Étape 1 — rendre l'égalité vraie.
  //
  // L'objectif se valide sur le PHÉNOMÈNE, pas sur une valeur attendue : toute
  // égalité vraie non triviale convient. Une manipulation qui n'accepterait
  // qu'une seule solution serait un QCM déguisé.
  //
  // Le drapeau est posé DANS le gestionnaire de changement, jamais pendant le
  // rendu : un `setState` en phase de rendu re-rend en boucle et fait diverger
  // l'état sous React concurrent. C'est aussi ce qui garde la manipulation
  // rejouable — l'état vit ici, le laboratoire n'en détient rien.
  const [jeu, setJeu] = useState(DEPART);
  const [trouve, setTrouve] = useState(false);

  // Étape 2 — casser l'égalité d'un seul cran.
  const [jeu2, setJeu2] = useState({ a: 3, b: 4, c: 6, d: 8 });
  const [casse, setCasse] = useState(false);
  const croix2 = produitsEnCroix(brut(jeu2.a, jeu2.b), brut(jeu2.c, jeu2.d));

  const [q3, setQ3] = useState(false);

  const steps = [
    {
      num: 1,
      title: 'Rends cette égalité vraie',
      subtitle: 'Les deux fractions ne désignent pas le même nombre. Change les nombres jusqu’à ce qu’elles y arrivent.',
      done: trouve,
      content: (kit) => (
        <div className="space-y-3">
          <CroixLab
            {...jeu}
            onChange={(patch) => {
              const next = { ...jeu, ...patch };
              const c = produitsEnCroix(brut(next.a, next.b), brut(next.c, next.d));
              setJeu(next);
              if (c.egaux && !(next.a === next.c && next.b === next.d) && !trouve) {
                setTrouve(true);
                kit.react(true);
              }
            }}
          />

          <PredictionChips
            prompt="Avant de toucher aux boutons : à ton avis, qu’est-ce qui rend deux fractions égales ?"
            options={[
              { id: 'ecart', label: 'Le même écart entre le haut et le bas' },
              { id: 'produit', label: 'Un lien entre les nombres croisés' },
              { id: 'somme', label: 'La même somme haut + bas' },
            ]}
            value={pred}
            onChange={setPred}
            disabled={trouve}
          />

          {trouve ? (
            <Feedback tone="ok">
              {pred === 'produit' ? 'Ta prédiction tenait' : 'Regarde les deux cases du dessous'} :
              les deux fractions sont égales exactement quand{' '}
              <strong className="tabular-nums">{jeu.a} × {jeu.d}</strong> et{' '}
              <strong className="tabular-nums">{jeu.b} × {jeu.c}</strong> donnent le{' '}
              <strong>même nombre</strong>. Ce ne sont plus deux fractions qu’on compare, mais deux{' '}
              <strong>entiers</strong> — et ça, on sait toujours le faire.
            </Feedback>
          ) : (
            <Feedback tone="info">
              Les deux nombres du dessous ne sont pas encore égaux. Touche à un seul bouton à la
              fois et regarde lequel des deux bouge.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Maintenant, casse-la',
      subtitle: 'Cette égalité-ci est vraie. Un seul cran suffit-il à la rendre fausse ?',
      done: casse,
      content: (kit) => (
        <div className="space-y-3">
          <CroixLab
            {...jeu2}
            onChange={(patch) => {
              const next = { ...jeu2, ...patch };
              const c = produitsEnCroix(brut(next.a, next.b), brut(next.c, next.d));
              setJeu2(next);
              if (!c.egaux && !casse) {
                setCasse(true);
                kit.react(true);
              }
            }}
          />
          {casse ? (
            <Feedback tone="ok">
              Un seul cran, et les deux produits se séparent :{' '}
              <strong className="tabular-nums">{croix2.gauche}</strong> contre{' '}
              <strong className="tabular-nums">{croix2.droite}</strong>. Le test ne dit pas
              « à peu près » : il tranche. Et remarque qu’il n’a jamais fallu simplifier ni chercher
              une graduation commune.
            </Feedback>
          ) : (
            <Feedback tone="info">
              3 × 8 = 24 et 4 × 6 = 24 : l’égalité est vraie. Bouge un seul nombre.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Ce que la croix décide',
      done: q3,
      content: (
        <div className="space-y-3">
          {/* Deux égalités viennent d'être fabriquées puis cassées, produits à
              l'appui : on peut nommer le procédé avant la question qui l'exige. */}
          <KnowledgeBrick
            id="produits-en-croix"
            variant="new"
            lead={<>Tu viens de rendre une égalité vraie, puis de la casser — en surveillant à chaque fois les deux mêmes nombres. Ce que tu as surveillé porte un nom.</>}
          />
          <TapQuestion
            prompt={
              <span className="inline-flex flex-wrap items-center gap-1.5">
                Ces deux fractions sont-elles égales ?
                <FractionView value={{ n: 2, d: 3 }} size="sm" tone="indigo" />
                <span>et</span>
                <FractionView value={{ n: 3, d: 4 }} size="sm" tone="violet" />
              </span>
            }
            options={[
              'Non : 2 × 4 = 8 mais 3 × 3 = 9',
              'Oui : il y a 1 d’écart entre le haut et le bas dans les deux',
              'Oui : on passe de l’une à l’autre en ajoutant 1 partout',
              'On ne peut pas le savoir sans les simplifier',
            ]}
            correct={0}
            cols={1}
            requires={['produits-en-croix']}
            explain="Les deux produits en croix valent 8 et 9 : ils diffèrent, donc les fractions ne sont pas égales. Elles sont proches — 2/3 ≈ 0,67 et 3/4 = 0,75 — mais « proche » n’est pas « égal »."
            explainWrong="L’écart entre le numérateur et le dénominateur ne dit rien : ce qui conserve une fraction, c’est de MULTIPLIER les deux termes par un même nombre, jamais de leur AJOUTER la même chose."
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
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      moduleTitle="La croix qui tranche"
      moduleSubtitle="Deux produits décident à ta place"
      estimatedTime="12 min"
      brief={{
        tag: 'Déclencheur',
        title: 'Égales, ou presque égales ?',
        tone: 'indigo',
        body: (
          <p>
            En 5e, pour savoir si deux fractions étaient égales, tu les simplifiais et tu regardais.
            Ça marche… tant que les nombres sont petits. Voici un outil qui{' '}
            <strong>tranche à tous les coups</strong> — à toi de découvrir lequel.
          </p>
        ),
      }}
      intro={
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { icon: Sparkles, t: 'Les quatre boutons', d: 'Chacun règle un des quatre nombres de l’égalité.', c: 'text-indigo-600' },
            { icon: Scale, t: 'Les deux cases', d: 'Sous les fractions : les deux produits en diagonale.', c: 'text-emerald-600' },
          ].map(({ icon: Icon, t, d, c }) => (
            <div key={t} className="rounded-xl border-2 border-slate-200 bg-white p-3">
              <Icon className={`mb-1 h-5 w-5 ${c}`} aria-hidden="true" />
              <p className="text-sm font-semibold text-slate-800">{t}</p>
              <p className="text-xs text-slate-600">{d}</p>
            </div>
          ))}
        </div>
      }
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={1} />}
    />
  );
}
