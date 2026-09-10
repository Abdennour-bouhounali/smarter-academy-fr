import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, PredictionChips, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import CubeLab from '../components/CubeLab';
import {
  ORIENTATION_DEPART, coordsDansRepere, vecNom, decomposition, doublePythagore,
  normeExacte, parseSigned, fr,
} from '../components/espaceUtils';

/**
 * Module 1 — DÉCLENCHEUR, et l'interaction SIGNATURE : « La boîte et les trois
 * nombres » (components/CubeLab.jsx).
 *
 * Étape 1  ATTRAPER LA BOÎTE. Le premier geste n'est pas une question : c'est
 *          la découverte qu'on peut tourner l'objet, et qu'une arête pointillée
 *          devient pleine. Sans ce geste-là, tout ce que la leçon dira ensuite
 *          sur « le dessin ment » serait une affirmation à croire.
 * Étape 2  CHOISIR DEUX COINS, et compter les trois trajets. C'est le cœur :
 *          le vecteur n'est pas une flèche oblique dans le vide, c'est la
 *          somme de trois déplacements le long des arêtes.
 * Étape 3  LES DEUX TRIANGLES. La longueur ne se lit pas d'un coup : on
 *          construit la diagonale du plancher, PUIS on s'en sert.
 * Étape 4  la question qui reste ouverte : quelle formule résume ces deux
 *          triangles ? Le module la DEMANDE, il ne la donne pas.
 *
 * Rien ne s'appelle « coordonnées d'un vecteur de l'espace » ni ‖u‖ =
 * √(x² + y² + z²) avant les modules 2 et 3 : le module se termine en DEMANDANT
 * ce que les suivants nommeront (§6bis.1). Les deux briques posées ici décrivent
 * ce que l'élève a VU — les trois trajets comptés, et les deux triangles.
 *
 * CONNAISSANCES AVANT LA DEMANDE. L'ordre est geste → observation → brique →
 * demande :
 *   étape 1  tourner la boîte → aucune brique : rien n'a encore été constaté
 *            de mathématique, seulement que le dessin dépend de l'angle
 *   étape 2  compter les trois trajets → brique `trois-deplacements`
 *   étape 3  construire les deux triangles → brique `deux-triangles-rectangles`
 *   étape 4  la question, désormais légitime.
 *
 * LE GLISSER EST LE GESTE, PAS UN AGRÉMENT. La rotation se prend au doigt sur
 * la figure (pointeur capturé, aimantation au cliquet) ; la sélection d'un coin
 * est un CLIC SUR LE COIN. Les boutons de rotation et la rangée de huit
 * sommets existent en SECOURS et pour le clavier — jamais comme chemin
 * principal.
 *
 * MANIPULATION JAMAIS GELÉE. Le laboratoire reste pilotable une fois l'étape
 * validée : `disabled` ne porte que les verrous d'ANTÉRIORITÉ. Seuls les
 * `PredictionChips` se figent — une prédiction s'enregistre une fois.
 */

/** Le trajet travaillé : la grande diagonale, celle qui use les trois directions. */
const DEPART = 'A';
const ARRIVEE = 'G';

const U = coordsDansRepere(vecNom(DEPART, ARRIVEE));
const ETAPES = decomposition(DEPART, ARRIVEE);
const PYTH = doublePythagore(U);

export default function Module01LaBoiteEtLesTroisNombres() {
  // Étape 1 : la rotation, et rien d'autre.
  const [o1, setO1] = useState(ORIENTATION_DEPART);
  const [tournee, setTournee] = useState(false);
  const [q1, setQ1] = useState(false);

  // Étape 2 : le trajet en trois nombres.
  const [pred, setPred] = useState(null);
  const [o2, setO2] = useState(ORIENTATION_DEPART);
  const [a2, setA2] = useState(DEPART);
  const [b2, setB2] = useState(null);
  const [q2, setQ2] = useState(false);

  // Étape 3 : les deux triangles.
  const [o3, setO3] = useState({ yaw: 30, pitch: 15 });
  const [q3a, setQ3a] = useState(false);
  const [q3b, setQ3b] = useState(false);

  const [q4, setQ4] = useState(false);

  const done1 = tournee && q1;
  const done2 = q2;
  const done3 = q3a && q3b;

  /**
   * Le choix des deux coins : le PREMIER clic pose le départ, le second
   * l'arrivée, le troisième repart d'un nouveau départ. Cliquer le coin déjà
   * posé l'enlève — sans quoi une erreur de visée serait irréparable.
   */
  const choisir = (nom) => {
    if (nom === a2) { setA2(b2); setB2(null); return; }
    if (nom === b2) { setB2(null); return; }
    if (!a2) { setA2(nom); return; }
    setB2(nom);
  };

  /** La rotation de l'étape 1 : l'objectif tombe dès qu'elle a VRAIMENT bougé. */
  const tourner1 = (o, react) => {
    setO1(o);
    if (tournee) return;
    if (o.yaw !== ORIENTATION_DEPART.yaw || o.pitch !== ORIENTATION_DEPART.pitch) {
      setTournee(true);
      react?.(true);
    }
  };

  const steps = [
    {
      num: 1,
      title: 'Attrape la boîte',
      subtitle:
        'Pose le doigt sur la boîte et fais-la tourner. Regarde ce qui arrive aux traits en pointillé.',
      done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-3 text-sm text-indigo-900">
            Cette boîte est un cube. On l’a dessinée à plat sur ton écran, comme on dessine un
            solide sur une feuille : les traits en pointillé sont les arêtes que le cube masque
            sous cet angle-là. <strong>Attrape-la et tourne-la</strong> — au doigt sur la figure,
            ou avec les flèches du clavier.
          </div>
          <CubeLab
            orientation={o1}
            onOrientation={(o) => tourner1(o, kit.react)}
            montrer="aucune"
            montrerNombres={false}
          />
          {tournee ? (
            <>
              <Feedback tone="ok">
                Les pointillés ont changé de place. Ce n’est pas la boîte qui a changé : c’est ce
                que ton point de vue te laisse voir. <strong>Un dessin plat n’est pas l’objet</strong> —
                garde-le en tête, la leçon entière repose là-dessus.
              </Feedback>
              <TapQuestion
                prompt="Tu viens de faire tourner la boîte. Combien d’arêtes a-t-elle maintenant ?"
                options={[
                  'Toujours 12 : tourner ne change pas le solide, seulement ce qu’on en voit',
                  'Moins qu’avant, puisque certaines ont disparu',
                  'Plus qu’avant, puisque de nouvelles sont apparues',
                  'Cela dépend de l’angle',
                ]}
                correct={0}
                cols={1}
                requires={['perspective-cavaliere', 'arete-cachee']}
                explain="Le compte affiché sous la figure ne bouge pas d’un cran quand tu tournes : 12 arêtes, 8 coins, 6 faces. Ce qui change, c’est lesquelles sont en pointillé — donc le DESSIN, pas la boîte."
                explainWrong="Regarde le solide pendant que tu tournes : aucune arête n’apparaît ni ne disparaît, elles passent seulement du trait plein au pointillé. Le dessin change ; l’objet, non."
                solved={q1}
                onAnswered={() => setQ1(true)}
              />
            </>
          ) : (
            <Feedback tone="info">
              Fais-la tourner — glisse le doigt ou la souris sur la figure. Tu peux aussi appuyer
              sur les flèches du clavier, ou sur les boutons ↺ ↻ ⤓ ⤒.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Va d’un coin à l’autre',
      subtitle:
        'Clique le coin A, puis le coin G — sur la boîte elle-même. Le trajet s’allume, et il se compte en trois fois.',
      done: done2,
      content: (kit) => (
        <div className="space-y-3">
          <PredictionChips
            prompt="pour décrire complètement le trajet d’un coin à l’autre de la boîte, combien de nombres faudra-t-il ?"
            options={[
              { id: 'un', label: 'Un seul : la longueur du trajet' },
              { id: 'deux', label: 'Deux, comme sur une feuille' },
              { id: 'trois', label: 'Trois' },
            ]}
            value={pred}
            onChange={setPred}
            disabled={done2}
          />
          <CubeLab
            orientation={o2}
            onOrientation={setO2}
            depart={a2}
            arrivee={b2}
            onSommet={choisir}
            montrer="trajet"
            disabled={!done1}
          />
          <NumericQuestion
            prompt={
              <>
                Sur le trajet de <strong>A à G</strong>, combien d’arêtes parcourt-on{' '}
                <strong>vers le fond</strong> ? (le troisième compteur, sous la figure)
              </>
            }
            expected={U.z}
            parse={parseSigned}
            display={fr(U.z)}
            requires={['vecteur-deplacement', 'coordonnees-vecteur']}
            explain={`Le trajet longe une arête vers la droite, une vers le haut, puis ${fr(U.z)} vers le fond. Les trois comptes sont ${fr(U.x)}, ${fr(U.y)} et ${fr(U.z)} — c’est le troisième qu’on ne pouvait pas écrire sur une feuille.`}
            explainFor={(n) => (
              n === 3
                ? 'Trois est le nombre de trajets, pas la longueur de l’un d’eux. Le compteur « vers le fond » en montre un seul.'
                : n === 0
                ? 'Zéro serait la réponse pour un trajet qui reste sur la face avant, comme A → C. De A à G, on va bien vers le fond.'
                : null
            )}
            solved={done2}
            onAnswered={() => setQ2(true)}
          />
          {done2 && (
            <>
              <Feedback tone="ok">
                {pred === 'trois' ? 'Ta prédiction tenait' : pred ? 'Ta prédiction ne tenait pas' : 'Le constat'} :
                il en faut <strong>trois</strong>, et pas deux. Aucun des trois trajets ne peut
                remplacer les deux autres — ils vont dans des directions qui n’ont rien à voir.
                Essaie d’autres couples de coins, et regarde les trois compteurs bouger.
              </Feedback>
              <KnowledgeBrick
                id="trois-deplacements"
                variant="new"
                lead={<>Ce que les trois compteurs viennent de montrer, en une phrase. Refais le geste en la lisant.</>}
              />
            </>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Deux triangles, l’un sur l’autre',
      subtitle:
        'La figure trace maintenant deux triangles rectangles sur la boîte : celui du plancher, puis celui qui monte. Tourne-la pour bien les voir tous les deux.',
      done: done3,
      content: (kit) => (
        <div className="space-y-3">
          <div className="rounded-xl border border-sky-200 bg-sky-50 p-3 text-sm text-sky-900">
            Le premier triangle est <strong>à plat sur le plancher</strong> : ses deux côtés de
            l’angle droit sont le trajet vers la droite et le trajet vers le haut, et son
            hypoténuse est la diagonale du plancher. Le second est <strong>dressé</strong> : ses
            deux côtés de l’angle droit sont cette diagonale et le trajet vers le fond.
          </div>
          <CubeLab
            orientation={o3}
            onOrientation={setO3}
            depart={DEPART}
            arrivee={ARRIVEE}
            montrer="pythagore"
            disabled={!done2}
          />
          <NumericQuestion
            prompt={
              <>
                Le <strong>carré</strong> de la diagonale du plancher : que vaut-il ? (le premier
                cadre, sous la figure)
              </>
            }
            expected={PYTH.plancherCarre}
            parse={parseSigned}
            display={fr(PYTH.plancherCarre)}
            requires={['trois-deplacements', 'formule-norme']}
            explain={`C’est Pythagore sur le triangle du plancher : ${fr(U.x)}² + ${fr(U.y)}² = ${fr(PYTH.plancherCarre)}. La diagonale du plancher mesure donc ${normeExacte(PYTH.plancherCarre)}.`}
            explainFor={(n) => (
              n === PYTH.totalCarre
                ? `${fr(PYTH.totalCarre)} est le total des TROIS carrés — c’est le second cadre. Le premier n’en additionne que deux.`
                : n === 2 * U.x
                ? 'Ce serait la somme des deux trajets, pas la somme de leurs carrés. Pythagore travaille sur les carrés.'
                : null
            )}
            solved={q3a}
            onAnswered={() => setQ3a(true)}
          />
          {q3a && (
            <NumericQuestion
              prompt={
                <>
                  Le second triangle ajoute le carré du dernier trajet à celui-là. Que vaut alors
                  le <strong>carré</strong> de la longueur du trajet complet ?
                </>
              }
              expected={PYTH.totalCarre}
              parse={parseSigned}
              display={fr(PYTH.totalCarre)}
              requires={['trois-deplacements', 'formule-norme']}
              explain={`On repart du carré du plancher, ${fr(PYTH.plancherCarre)}, et on lui ajoute le carré du trajet vers le fond : ${fr(PYTH.plancherCarre)} + ${fr(U.z)}² = ${fr(PYTH.totalCarre)}. La longueur du trajet vaut donc ${normeExacte(PYTH.totalCarre)}.`}
              explainFor={(n) => (
                n === PYTH.plancherCarre
                  ? 'C’est le carré du plancher, celui du premier triangle. Il reste à lui ajouter le carré du dernier trajet.'
                  : null
              )}
              solved={q3b}
              onAnswered={() => setQ3b(true)}
            />
          )}
          {done3 && (
            <>
              <Feedback tone="ok">
                La longueur du trajet ne se lit <strong>pas d’un coup</strong> : la diagonale du
                plancher est un <strong>côté</strong> du second triangle. Sans elle, il n’y a rien
                à mettre dans le calcul — et c’est bien Pythagore, appliqué deux fois.
              </Feedback>
              <KnowledgeBrick
                id="deux-triangles-rectangles"
                variant="new"
                lead={<>Les deux triangles que tu viens de construire, en une phrase. Tourne encore la boîte en la lisant.</>}
              />
            </>
          )}
        </div>
      ),
    },
    {
      num: 4,
      title: 'Quelle formule résume les deux triangles ?',
      done: q4,
      content: (
        <div className="space-y-3">
          <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4 text-sm text-indigo-900 space-y-2">
            <p className="font-semibold">Le bilan de ce que tu viens de faire :</p>
            <ul className="list-disc list-inside space-y-1">
              <li>trois nombres décrivent complètement un trajet dans la boîte ;</li>
              <li>
                le premier triangle donne le carré de la diagonale du plancher :{' '}
                {fr(U.x)}² + {fr(U.y)}² = {fr(PYTH.plancherCarre)} ;
              </li>
              <li>
                le second lui ajoute le carré du dernier trajet :{' '}
                {fr(PYTH.plancherCarre)} + {fr(U.z)}² = {fr(PYTH.totalCarre)} ;
              </li>
              <li>
                la longueur du trajet vaut donc <strong>{normeExacte(PYTH.totalCarre)}</strong>.
              </li>
            </ul>
          </div>
          <TapQuestion
            prompt="En une seule ligne, la longueur d’un trajet dont les trois nombres sont x, y et z s’écrit donc…"
            options={[
              'la racine de (x² + y² + z²)',
              'x + y + z',
              'la racine de (x² + y²), plus z',
              'la racine de (x + y + z)',
            ]}
            correct={0}
            cols={1}
            requires={['trois-deplacements', 'deux-triangles-rectangles', 'formule-norme']}
            explain="Les deux triangles empilent les trois carrés sous une seule racine, prise à la fin. Cette écriture a un nom et une notation officielle : le module 3 les pose."
            explainWrong={`Additionner x + y + z reviendrait à longer les arêtes au lieu de couper en diagonale — plus long que le trajet direct. Et prendre la racine du plancher AVANT d’ajouter z donne un chemin en équerre : sur ce trajet, cela ferait ${fr(PYTH.plancher + Math.abs(U.z))} au lieu de ${fr(PYTH.total)}.`}
            solved={q4}
            onAnswered={() => setQ4(true)}
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
      moduleTitle="La boîte et les trois nombres"
      moduleSubtitle="Une boîte qu’on attrape, deux coins qu’on choisit, trois trajets qu’on compte"
      estimatedTime="10 min"
      brief={{
        tag: 'Déclencheur',
        title: 'Combien de nombres pour situer un coin ?',
        tone: 'indigo',
        body: (
          <p>
            Sur une feuille, deux nombres suffisent à placer un point. Dans une boîte, essaie :
            attrape-la, tourne-la, et va d’un coin à l’autre en longeant les arêtes.
          </p>
        ),
      }}
      steps={steps}
      footer={
        <KnowledgeSnapshot moduleNumber={1}>
          <strong>Le mot juste.</strong> Les trois nombres que tu as comptés et la formule que tu
          viens de reconnaître ont chacun une écriture officielle. Modules suivants : la troisième
          coordonnée, puis Pythagore écrit une seule fois.
        </KnowledgeSnapshot>
      }
    />
  );
}
