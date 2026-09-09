import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick, PredictionChips } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { parseDec } from '@smarter-academy/core';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import BandeCylindreLab from '../components/BandeCylindreLab';
import { BOITE_THE, perimetreBase, diametre, verifierBande, fmtLong } from '../components/espace5e';

/**
 * Module 5 — MANIPULATION SIGNATURE : la bande du cylindre.
 *
 * C'est le contenu propre de la 5e. Le cube et le pavé de 6e se déplient en
 * rectangles « évidents » ; ici, la surface latérale déroulée est un rectangle
 * dont un côté n'est PAS une dimension visible du solide — c'est le tour de
 * sa base.
 *
 * La découverte se fait par ajustement, jamais par formule annoncée :
 *   trop courte → il reste un jour ;
 *   trop longue → la bande chevauche ;
 *   exacte      → le tube se ferme.
 *
 * Le piège du diamètre (M5) est un ÉTAT ATTEIGNABLE du réglage : l'élève peut
 * y aller, et il voit alors que la bande ne fait pas même le tiers du tour.
 * On ne le lui dit pas — il le constate, et l'étape 2 le nomme.
 *
 * NOTE DE SAISIE : la réponse de l'étape 3 est décimale. `parseFr` du kit est
 * entier seulement et tronquerait « 25,1 » en 25 — d'où `parse={parseDec}`.
 */
export default function Module05LaBandeDuCylindre() {
  const exact = perimetreBase(BOITE_THE);
  const dia = diametre(BOITE_THE);

  // Le curseur démarre AU DIAMÈTRE : l'élève part donc précisément de la
  // conception fausse la plus fréquente, et c'est la manipulation qui la
  // réfute — pas un avertissement.
  const [longueur, setLongueur] = useState(dia);
  const [ferme, setFerme] = useState(false);
  const [vuTropLongue, setVuTropLongue] = useState(false);
  const [pred, setPred] = useState(null);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);

  const verdict = verifierBande(longueur, BOITE_THE, 0.05);

  const regler = (v, react) => {
    setLongueur(v);
    const w = verifierBande(v, BOITE_THE, 0.05);
    if (w.raison === 'trop-longue') setVuTropLongue(true);
    if (w.ok && !ferme) { setFerme(true); react?.(true); }
  };

  const steps = [
    {
      num: 1,
      title: 'Règle la bande jusqu’à ce que le tube se referme',
      subtitle: 'Trop courte, il reste un jour. Trop longue, elle chevauche.',
      done: ferme,
      content: (kit) => (
        <div className="space-y-3">
          <div className="rounded-xl border-2 border-purple-200 bg-purple-50 p-3.5 text-sm text-slate-700">
            La boîte de thé est un <strong>cylindre</strong> de rayon{' '}
            <strong>{fmtLong(BOITE_THE.rayon)}</strong>. Son carton est fait de{' '}
            <strong>deux disques</strong> et d’une <strong>bande</strong>. Règle la longueur de
            cette bande pour qu’elle fasse <strong>exactement</strong> le tour.
          </div>

          <BandeCylindreLab
            cyl={BOITE_THE}
            longueur={longueur}
            onLongueur={(v) => regler(v, kit.react)}
            ariaLabel="Longueur de la bande du cylindre"
          />

          {!ferme && (
            <PredictionChips
              prompt="À ton avis, la bonne longueur est-elle plus proche du diamètre ou du tour du disque ?"
              options={[
                { id: 'dia', label: 'Du diamètre' },
                { id: 'tour', label: 'Du tour du disque' },
              ]}
              value={pred}
              onChange={setPred}
            />
          )}

          {ferme ? (
            <Feedback tone="ok">
              Le tube se ferme. La bonne longueur est <strong>{fmtLong(exact)}</strong> — soit{' '}
              <strong>le tour du disque</strong>, et non sa traversée. Remarque le rapport : c’est
              un peu plus de <strong>3 fois</strong> le diamètre ({fmtLong(dia)}).
            </Feedback>
          ) : verdict.raison === 'trop-courte' && Math.abs(longueur - dia) < 0.01 ? (
            /* L'élève est resté sur la valeur de départ : on commente ce qu'il
               VOIT, sans encore nommer la règle. */
            <Feedback tone="info">
              Avec le <strong>diamètre</strong> ({fmtLong(dia)}), la bande ne fait même pas le
              tiers du tour : le jour est énorme. La longueur cherchée est bien plus grande —
              allonge-la.
            </Feedback>
          ) : verdict.raison === 'trop-courte' ? (
            <Feedback tone="info">
              Il reste un jour : la bande ne rejoint pas son point de départ. Allonge-la encore.
            </Feedback>
          ) : (
            <Feedback tone="info">
              La bande se chevauche : elle dépasse en revenant à son point de départ. Raccourcis-la.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Le tour, pas la traversée',
      done: q2,
      content: (
        <div className="space-y-3">
          <KnowledgeBrick
            id="patron-cylindre"
            variant="new"
            lead={<>Le carton que tu viens d’ajuster porte un nom, et une composition fixe.</>}
          />
          <KnowledgeBrick
            id="bande-perimetre"
            variant="new"
            lead={<>Et sa longueur n’était pas libre : une seule valeur referme le tube.</>}
          />
          <TapQuestion
            prompt="Pourquoi la longueur de la bande est-elle le périmètre du disque, et non son diamètre ?"
            options={[
              'Parce que la bande s’enroule AUTOUR du disque : elle en fait le tour',
              'Parce que le diamètre est trop difficile à mesurer',
              'Parce que le périmètre est toujours un nombre entier',
              'C’est un choix arbitraire des fabricants',
            ]}
            correct={0}
            cols={1}
            requires={['patron-cylindre', 'bande-perimetre', 'perimetre']}
            explain="La bande fait le tour du disque : sa longueur doit donc être ce tour, c’est-à-dire le périmètre (2 × π × rayon). Le diamètre, lui, traverse le disque — il est environ 3 fois trop court."
            explainWrong="Ce n’est ni arbitraire ni une question de commodité : la bande s’enroule autour de la base, donc sa longueur est exactement le TOUR de cette base — son périmètre."
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
          {q2 && <KnowledgeBrick id="mem-bande" variant="new" compact />}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Commander le bon carton',
      done: q3,
      content: (
        <div className="space-y-3">
          <NumericQuestion
            prompt={
              <>
                Une boîte cylindrique a un rayon de <strong>5 cm</strong>. Quelle doit être la
                longueur de sa bande, en cm ? (On prendra π ≈ 3,14 ; réponse au dixième.)
              </>
            }
            expected={(n) => Math.abs(n - 2 * 3.14 * 5) <= 0.15}
            parse={parseDec}
            display="31,4"
            suffix="cm"
            requires={['bande-perimetre', 'perimetre']}
            explainFor={(n) =>
              Math.abs(n - 10) <= 0.15
                ? 'Tu as donné le diamètre (2 × 5 = 10 cm). La bande fait le TOUR du disque, pas sa traversée : il faut 2 × π × 5.'
                : Math.abs(n - 15.7) <= 0.15
                ? 'Tu as calculé π × 5 : c’est la moitié du tour. Le périmètre est 2 × π × rayon.'
                : null
            }
            explain="Le périmètre du disque vaut 2 × π × rayon, soit 2 × 3,14 × 5 = 31,4 cm."
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
      navLinks={getNavLinks(5)}
      moduleNumber={5}
      moduleTitle="La bande du cylindre"
      moduleSubtitle="La seule longueur qui referme le tube"
      estimatedTime="11 min"
      brief={{
        tag: 'Manipulation',
        title: 'Le carton de la boîte de thé',
        tone: 'indigo',
        body: (
          <p>
            Le prisme se dépliait en pièces qu’on pouvait compter. Le cylindre, lui, cache une
            surprise : la longueur de sa bande <strong>ne se lit nulle part sur le solide</strong>.
            À toi de la trouver en réglant, jusqu’à ce que le tube se ferme.
          </p>
        ),
      }}
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={5} />}
    />
  );
}
