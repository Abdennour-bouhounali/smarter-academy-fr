import React, { useState } from 'react';
import { Grid2x2, Sparkles } from 'lucide-react';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import CroixLab from '../components/CroixLab';
import {
  parseDec, fr, quatriemeProportionnelle, produitsEnCroix, passageEntier, estDecimalFini,
} from '../components/prop4e';
import { ratToNumber } from '../../../../../common/algebra4e';

/**
 * Module 2 — DÉCOUVERTE : l'égalité des produits en croix.
 *
 * Activity              allumer les deux diagonales de plusieurs tableaux et
 *                       comparer leurs produits, puis s'en servir pour
 *                       remplir une case quand aucun raccourci n'existe.
 * Mathematical objective dans un tableau proportionnel, a × d = b × c ; cette
 *                       égalité DONNE la case manquante.
 * Student action        activer chaque diagonale, puis saisir la case vide.
 * Controlled variable   le tableau observé.
 * Mathematical state    (a, b, c, d) et les diagonales allumées.
 * Visual consequence    la diagonale se trace, son produit s'affiche, et les
 *                       deux produits se comparent.
 * Expected observation  « les deux produits tombent sur le même nombre ».
 * Misconception targeted appliquer la croix à un tableau qui n'est PAS
 *                       proportionnel (étape 3) ; croire que le produit en
 *                       croix est un rituel à faire partout, y compris quand
 *                       un passage entier existe (étape 1).
 * Formalization         la brique `produit-en-croix` arrive après le constat,
 *                       jamais avant.
 */

// Étape 1 — un tableau où le raccourci EXISTE : 2 → 6, on multiplie par 3.
const FACILE = { a: 2, b: 5, c: 6, d: 15 };
// Étape 2 — un tableau où AUCUN passage n'est entier : c'est là que l'outil sert.
const UTILE = { a: 3, b: 7, c: 5 }; // d = 35/3
// Étape 3 — un tableau NON proportionnel : la croix le démasque.
const FAUX = { a: 4, b: 10, c: 6, d: 14 };

export default function Module02LaCaseVide() {
  const [diag1, setDiag1] = useState([]);
  const [diag3, setDiag3] = useState([]);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);

  const basculer = (setter) => (nom) =>
    setter((d) => (d.includes(nom) ? d.filter((x) => x !== nom) : [...d, nom]));

  const done1 = diag1.length === 2;
  const dUtile = quatriemeProportionnelle(UTILE.a, UTILE.b, UTILE.c);
  const done3 = diag3.length === 2;

  const steps = [
    {
      num: 1,
      title: 'Allume les deux diagonales',
      subtitle: 'Deux commandes proportionnelles. Multiplie en diagonale, et compare.',
      done: done1,
      content: (
        <div className="space-y-3">
          <p className="text-sm text-slate-700">
            2 affiches pour 5 €, 6 affiches pour 15 €. Touche chaque diagonale : elle affiche
            le produit de ses deux cases.
          </p>
          <CroixLab {...FACILE} diagonales={diag1} onDiagonale={basculer(setDiag1)} />
          {done1 && (
            <Feedback tone="ok">
              {fr(produitsEnCroix(FACILE.a, FACILE.b, FACILE.c, FACILE.d).gauche)} des deux côtés.
              Ici, on aurait aussi pu faire de tête : de 2 à 6, on multiplie par 3.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Quand le raccourci disparaît',
      subtitle: '3 affiches pour 7 €. Combien coûtent 5 affiches ?',
      done: q2,
      content: (
        <div className="space-y-3">
          <CroixLab
            a={UTILE.a} b={UTILE.b} c={UTILE.c} d={0}
            inconnue="d"
            diagonales={['bleue', 'rouge']}
          />
          <p className="text-sm text-slate-700">
            De 3 à 5, on ne multiplie par aucun nombre entier. Et 7 ÷ 3 ne tombe pas juste non plus.
            Pourtant, l’égalité des deux produits, elle, tient toujours :{' '}
            <strong>3 × ? = 7 × 5</strong>.
          </p>
          <NumericQuestion
            prompt="Combien vaut 7 × 5 ?"
            expected={35}
            requires={['coefficient-proportionnalite']}
            explain="7 × 5 = 35. C’est le produit de la diagonale rouge — celle dont les deux cases sont connues."
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
          {q2 && (
            <Feedback tone="info">
              Il reste donc à trouver le nombre qui, multiplié par 3, donne 35 : c’est 35 ÷ 3,
              soit {fr(ratToNumber(dUtile), 2)} € environ. Le prix exact est la fraction 35/3 —
              {estDecimalFini(dUtile) ? '' : ' il ne tombe pas juste, et c’est normal.'}
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'La croix démasque aussi les faux',
      subtitle: 'Ce tableau prétend être proportionnel. Vérifie.',
      done: done3,
      content: (
        <div className="space-y-3">
          <p className="text-sm text-slate-700">
            4 affiches pour 10 €, 6 affiches pour 14 €. Allume les deux diagonales.
          </p>
          <CroixLab {...FAUX} diagonales={diag3} onDiagonale={basculer(setDiag3)} />
          {done3 && (
            <Feedback tone="ko">
              {fr(produitsEnCroix(FAUX.a, FAUX.b, FAUX.c, FAUX.d).gauche)} d’un côté,{' '}
              {fr(produitsEnCroix(FAUX.a, FAUX.b, FAUX.c, FAUX.d).droite)} de l’autre : les produits
              diffèrent, donc ce tableau n’est pas proportionnel. Appliquer la croix pour « trouver »
              une valeur ici donnerait un résultat faux.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 4,
      title: 'Ce que la croix dit, et ce qu’elle ne dit pas',
      done: q3 && q4,
      content: (
        <div className="space-y-3">
          <TapQuestion
            prompt="Dans un tableau de proportionnalité, que peut-on toujours affirmer ?"
            options={[
              'Les deux produits en croix sont égaux',
              'Les deux produits en croix sont opposés',
              'Le produit des deux premières cases vaut la troisième',
              'Les quatre nombres sont entiers',
            ]}
            correct={0}
            cols={1}
            requires={['coefficient-proportionnalite', 'tableau-proportionnalite']}
            explain="a × d = b × c : c’est une autre façon d’écrire que le coefficient est le même sur les deux lignes."
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
          {q3 && (
            <KnowledgeBrick
              id="produit-en-croix"
              variant="new"
              lead="Ce que tu viens de vérifier trois fois porte un nom."
            />
          )}
          {q3 && (
            <TapQuestion
              prompt="Dans quel cas le produit en croix apporte-t-il vraiment quelque chose ?"
              options={[
                'Quand aucun passage simple n’existe entre les valeurs',
                'Toujours : c’est la seule méthode correcte',
                'Seulement quand les nombres sont entiers',
                'Quand le tableau n’est pas proportionnel',
              ]}
              correct={0}
              cols={1}
              requires={['produit-en-croix']}
              explain="Quand on passe de 2 à 6, multiplier par 3 va plus vite. La croix sert quand ni le passage horizontal, ni le retour à l’unité ne tombent juste."
              solved={q4}
              onAnswered={() => setQ4(true)}
            />
          )}
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="La case vide"
      moduleSubtitle="Une égalité qui survit quand les raccourcis disparaissent"
      estimatedTime="11 min"
      brief={{
        tag: '🎬 Mission 02',
        title: '3 affiches pour 7 €',
        tone: 'indigo',
        body: (
          <>
            Chez Cléo, tout est proportionnel — mais cette fois, ni le passage d’une commande à
            l’autre, ni le prix d’une seule affiche ne tombent juste.{' '}
            <strong>Comment trouver le prix de 5 affiches ?</strong>
          </>
        ),
      }}
      intro={
        <div className="flex items-start gap-3 rounded-2xl border border-violet-100 bg-violet-50/60 p-3.5">
          <Grid2x2 className="mt-0.5 h-5 w-5 shrink-0 text-violet-600" aria-hidden="true" />
          <p className="text-sm text-violet-900">
            Quatre cases, deux diagonales. <Sparkles className="inline h-4 w-4" aria-hidden="true" />{' '}
            Allume-les et regarde les deux produits : ils vont te dire quelque chose.
          </p>
        </div>
      }
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={2} />}
    />
  );
}
