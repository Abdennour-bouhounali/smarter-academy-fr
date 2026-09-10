import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import CubeLab from '../components/CubeLab';
import {
  coordsDansRepere, vecNom, ARETE, parseSigned, fr, frVec3,
} from '../components/espaceUtils';

/**
 * Module 2 — DÉCOUVERTE : ce que l'élève a compté au module 1 reçoit son
 * écriture officielle.
 *
 * Étape 1  LE REPÈRE. Le coin A devient l'origine, et les trois arêtes qui en
 *          partent les trois directions. Les huit coins reçoivent alors trois
 *          nombres chacun — l'élève les LIT sur la boîte, en tournant.
 * Étape 2  LE VECTEUR. La règle « arrivée moins départ » du plan s'applique
 *          une TROISIÈME fois. Rien de neuf, une ligne de plus.
 * Étape 3  L'ORDRE COMPTE. BH et HB sont opposés trois fois — la conception
 *          erronée la plus tenace du chapitre.
 *
 * CONNAISSANCES AVANT LA DEMANDE :
 *   étape 1  lire les coordonnées sur la boîte → brique `repere-espace`
 *   étape 2  calculer un vecteur → brique `coordonnees-vecteur-espace`
 *   étape 3  constater l'opposition → brique `mem-arrivee-moins-depart-espace`
 *
 * LA BOÎTE RESTE PILOTABLE À CHAQUE ÉTAPE. Elle n'est pas là pour décorer : un
 * élève qui doute d'une coordonnée doit pouvoir tourner et recompter. Seuls les
 * verrous d'ANTÉRIORITÉ posent `disabled`.
 */

/** Les coordonnées d'un coin, EN UNITÉS D'ARÊTE — celles des énoncés : ce sont
 *  celles du trajet qui part de l'origine A. */
const coordCoin = (nom) => coordsDansRepere(vecNom('A', nom));

const BH = coordsDansRepere(vecNom('B', 'H'));
const HB = coordsDansRepere(vecNom('H', 'B'));

export default function Module02LaTroisiemeCoordonnee() {
  const [o1, setO1] = useState({ yaw: 30, pitch: 15 });
  const [a1, setA1] = useState('A');
  const [b1, setB1] = useState('F');
  const [q1, setQ1] = useState(false);

  const [o2, setO2] = useState({ yaw: 30, pitch: 15 });
  const [q2, setQ2] = useState(false);

  const [q3, setQ3] = useState(false);

  const done1 = q1;
  const done2 = q2;

  const choisir1 = (nom) => {
    if (nom === a1) { setA1(b1); setB1(null); return; }
    if (nom === b1) { setB1(null); return; }
    if (!a1) { setA1(nom); return; }
    setB1(nom);
  };

  const F = coordCoin('F');

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="La troisième coordonnée"
      moduleSubtitle="Les trois nombres que tu as comptés reçoivent leur écriture"
      estimatedTime="10 min"
      brief={{
        tag: 'Découverte',
        title: 'Trois nombres, une écriture',
        tone: 'indigo',
        body: (
          <p>
            Tu as compté trois trajets. Reste à les écrire comme les mathématiciens les écrivent —
            et à constater que la règle que tu connais du plan s’applique telle quelle, une ligne
            de plus.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Le coin A devient l’origine',
          subtitle:
            'On prend le coin A comme point de départ de tout, et les trois arêtes qui en partent comme directions. Chaque coin reçoit alors trois nombres.',
          done: done1,
          content: (
            <div className="space-y-3">
              <div className="rounded-xl border border-violet-200 bg-violet-50 p-3 text-sm text-violet-900 space-y-2">
                <p>
                  Sur une feuille, un point était repéré par une abscisse et une ordonnée. Ici, on
                  ajoute un troisième nombre pour dire de combien on s’enfonce vers le fond : on
                  l’appelle la <strong>cote</strong>. Un coin s’écrit donc avec trois nombres, dans
                  l’ordre.
                </p>
                <p className="text-[13px]">
                  En prenant l’arête du cube comme unité, A vaut (0 ; 0 ; 0), B vaut (1 ; 0 ; 0),
                  et G — le coin le plus lointain — vaut (1 ; 1 ; 1).
                </p>
              </div>
              <CubeLab
                orientation={o1}
                onOrientation={setO1}
                depart={a1}
                arrivee={b1}
                onSommet={choisir1}
                montrer="trajet"
              />
              <NumericQuestion
                prompt={
                  <>
                    Lis les trois compteurs pour le trajet de <strong>A à F</strong>. Quelle est la{' '}
                    <strong>cote</strong> du coin F, c’est-à-dire son troisième nombre ?
                  </>
                }
                expected={F.z}
                parse={parseSigned}
                display={fr(F.z)}
                requires={['trois-deplacements', 'abscisse', 'ordonnee']}
                explain={`Depuis A, on va d’une arête vers la droite, de ${fr(F.y)} vers le haut et de ${fr(F.z)} vers le fond. Le coin F s’écrit donc ${frVec3(F)}, et sa cote vaut ${fr(F.z)}.`}
                explainFor={(n) => (
                  n === 0
                    ? 'Zéro serait la cote d’un coin de la face avant, comme B ou C. F est sur la face arrière : on s’enfonce bien d’une arête.'
                    : n === ARETE
                    ? `${fr(ARETE)} serait la réponse en unités de dessin. Ici on compte en ARÊTES : une arête vers le fond, donc ${fr(F.z)}.`
                    : null
                )}
                solved={done1}
                onAnswered={() => setQ1(true)}
              />
              {done1 && (
                <>
                  <Feedback tone="ok">
                    Trois nombres, et l’ordre est fixé : d’abord vers la droite, puis vers le haut,
                    puis vers le fond. Choisis d’autres coins et lis-les — ils valent tous 0 ou 1.
                  </Feedback>
                  <KnowledgeBrick
                    id="repere-espace"
                    variant="new"
                    lead={<>Ce que tu viens de mettre en place porte un nom. Continue de choisir des coins en le lisant.</>}
                  />
                </>
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'Arrivée moins départ, une fois de plus',
          subtitle:
            'Pour trouver les trois nombres d’un trajet, la règle du plan suffit — il y a juste une ligne de plus à écrire.',
          done: done2,
          content: (
            <div className="space-y-3">
              <div className="rounded-xl border border-violet-200 bg-violet-50 p-3 text-sm text-violet-900">
                Dans le plan, tu écrivais AB en soustrayant les coordonnées de A à celles de B,
                ligne par ligne. Ici, c’est <strong>exactement la même chose</strong>, sur trois
                lignes au lieu de deux.
              </div>
              <CubeLab
                orientation={o2}
                onOrientation={setO2}
                depart="B"
                arrivee="H"
                montrer="trajet"
                disabled={!done1}
              />
              <NumericQuestion
                prompt={
                  <>
                    B est le coin (1 ; 0 ; 0) et H est le coin (0 ; 1 ; 1). Quel est le{' '}
                    <strong>premier</strong> nombre du trajet BH ?
                  </>
                }
                expected={BH.x}
                parse={parseSigned}
                display={fr(BH.x)}
                requires={['repere-espace', 'regle-coordonnees', 'coordonnees-vecteur']}
                explain={`Arrivée moins départ : 0 − 1 = ${fr(BH.x)}. Le trajet repart vers la GAUCHE, et c’est le signe moins qui le dit. Les trois nombres de BH sont ${frVec3(BH)}.`}
                explainFor={(n) => (
                  n === 1
                    ? 'C’est départ moins arrivée : la soustraction est dans le mauvais sens. On écrit toujours arrivée moins départ, ici 0 − 1.'
                    : null
                )}
                solved={done2}
                onAnswered={() => setQ2(true)}
              />
              {done2 && (
                <>
                  <Feedback tone="ok">
                    Rien de neuf : le même geste, appliqué une fois de plus. Et un nombre{' '}
                    <strong>négatif</strong> n’est pas une erreur — il dit simplement qu’on repart
                    dans l’autre sens sur cette direction-là.
                  </Feedback>
                  <KnowledgeBrick
                    id="coordonnees-vecteur-espace"
                    variant="new"
                    lead={<>La règle, écrite pour l’espace. Tourne la boîte en la lisant et vérifie les deux autres nombres.</>}
                  />
                </>
              )}
            </div>
          ),
        },
        {
          num: 3,
          title: 'BH et HB ne sont pas le même trajet',
          done: q3,
          content: (
            <div className="space-y-3">
              <div className="rounded-xl border border-slate-200 bg-white p-3 overflow-x-auto">
                <table className="w-full text-center text-sm"><tbody>
                  <tr className="bg-slate-50">
                    <th className="px-2 py-1 text-left">trajet</th>
                    <th className="px-2 py-1">vers la droite</th>
                    <th className="px-2 py-1">vers le haut</th>
                    <th className="px-2 py-1">vers le fond</th>
                  </tr>
                  <tr className="border-t">
                    <th className="px-2 py-1 text-left font-mono">BH</th>
                    <td className="px-2 py-1 font-mono font-bold">{fr(BH.x)}</td>
                    <td className="px-2 py-1 font-mono font-bold">{fr(BH.y)}</td>
                    <td className="px-2 py-1 font-mono font-bold">{fr(BH.z)}</td>
                  </tr>
                  <tr className="border-t">
                    <th className="px-2 py-1 text-left font-mono">HB</th>
                    <td className="px-2 py-1 font-mono font-bold">{fr(HB.x)}</td>
                    <td className="px-2 py-1 font-mono font-bold">{fr(HB.y)}</td>
                    <td className="px-2 py-1 font-mono font-bold">{fr(HB.z)}</td>
                  </tr>
                </tbody></table>
              </div>
              <TapQuestion
                prompt="Que remarques-tu en comparant les deux lignes du tableau ?"
                options={[
                  'Les trois nombres sont opposés un par un : refaire le trajet à l’envers change les trois signes',
                  'Seul le premier nombre change de signe',
                  'Les deux trajets ont exactement les mêmes nombres',
                  'Le second trajet est deux fois plus long que le premier',
                ]}
                correct={0}
                cols={1}
                requires={['coordonnees-vecteur-espace', 'repere-espace']}
                explain={`BH vaut ${frVec3(BH)} et HB vaut ${frVec3(HB)} : chaque nombre a changé de signe, parce que chaque direction est parcourue à l’envers. Les deux trajets ont d’ailleurs la même longueur — c’est le SENS qui diffère, pas la distance.`}
                explainWrong="Compare les trois colonnes une par une : aucune n’est restée identique. Et les deux trajets relient les mêmes coins, donc ils ont forcément la même longueur."
                solved={q3}
                onAnswered={() => setQ3(true)}
              />
              {q3 && (
                <KnowledgeBrick
                  id="mem-arrivee-moins-depart-espace"
                  variant="new"
                  lead={<>À retenir, et à vérifier chaque fois que tu écris un trajet.</>}
                />
              )}
            </div>
          ),
        },
      ]}
      footer={
        <KnowledgeSnapshot moduleNumber={2}>
          <strong>Et la longueur ?</strong> Tu l’as construite au module 1 avec deux triangles.
          Module suivant : l’écrire en une seule ligne.
        </KnowledgeSnapshot>
      }
    />
  );
}
