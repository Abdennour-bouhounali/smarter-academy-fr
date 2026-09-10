import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import CubeLab from '../components/CubeLab';
import {
  coordsDansRepere, vecNom, doublePythagore, normeExacte,
  parseSigned, fr, frVec3,
} from '../components/espaceUtils';

/**
 * Module 3 — DÉCOUVERTE : la formule de la longueur, ÉTABLIE et non annoncée.
 *
 * Étape 1  LES TROIS DIAGONALES DE LA BOÎTE. L'élève calcule le carré, puis
 *          lit la longueur, sur trois trajets qui donnent 1, √2 et √3. Les
 *          trois sont DISTINCTS et LISIBLES — c'est ce qui rend la comparaison
 *          possible, et c'est vérifié par un test.
 * Étape 2  LE PIÈGE DE LA DOUBLE RACINE. √(x² + y²) + z est le chemin en
 *          ÉQUERRE : l'élève voit les deux nombres et constate qu'ils diffèrent.
 * Étape 3  UN NOMBRE NÉGATIF DONNE UN CARRÉ POSITIF. Sur BH (−1 ; 1 ; 1), le
 *          signe moins disparaît — la longueur ne peut pas être négative.
 *
 * CONNAISSANCES AVANT LA DEMANDE :
 *   étape 1  calculer sur trois trajets → brique `formule-norme-espace`
 *   étape 2  constater l'écart avec l'équerre → brique `mem-trois-carres`
 *   étape 3  travailler un vecteur à coordonnée négative → brique
 *            `methode-calculer-norme-espace`
 *
 * LA BOÎTE N'EST PAS GELÉE. Elle affiche les deux triangles à chaque étape, et
 * elle tourne : la formule s'établit CONTRE la figure, pas à sa place.
 */

const TRAJETS = ['B', 'C', 'G'].map((nom) => {
  const u = coordsDansRepere(vecNom('A', nom));
  const p = doublePythagore(u);
  return { nom, u, carre: p.totalCarre, norme: normeExacte(p.totalCarre), pyth: p };
});

const AG = TRAJETS[2];
const BH_U = coordsDansRepere(vecNom('B', 'H'));
const BH_P = doublePythagore(BH_U);

/** Le chemin en ÉQUERRE, la conception erronée mesurée. */
const EQUERRE = AG.pyth.plancher + Math.abs(AG.u.z);

export default function Module03PythagoreDeuxFois() {
  const [o1, setO1] = useState({ yaw: 30, pitch: 15 });
  const [a1, setA1] = useState('A');
  const [b1, setB1] = useState('G');
  const [q1, setQ1] = useState(false);

  const [q2, setQ2] = useState(false);

  const [o3, setO3] = useState({ yaw: 30, pitch: 15 });
  const [q3, setQ3] = useState(false);

  const done1 = q1;
  const done2 = q2;

  const choisir1 = (nom) => {
    if (nom === a1) { setA1(b1); setB1(null); return; }
    if (nom === b1) { setB1(null); return; }
    if (!a1) { setA1(nom); return; }
    setB1(nom);
  };

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="Pythagore, deux fois"
      moduleSubtitle="Les deux triangles du module 1, écrits en une seule ligne"
      estimatedTime="10 min"
      brief={{
        tag: 'Découverte',
        title: 'Une seule racine, trois carrés',
        tone: 'indigo',
        body: (
          <p>
            Tu as construit deux triangles rectangles et reconnu la formule qu’ils résument. On
            l’écrit officiellement — et on vérifie sur la boîte qu’elle donne bien ce que les
            triangles annonçaient.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Les trois longueurs de la boîte',
          subtitle:
            'Une arête, une diagonale de face, une diagonale de la boîte : trois trajets, trois longueurs. Choisis-les sur la figure et lis les deux cadres.',
          done: done1,
          content: (
            <div className="space-y-3">
              <div className="rounded-xl border border-sky-200 bg-sky-50 p-3 text-sm text-sky-900">
                Le second cadre sous la figure additionne les <strong>trois</strong> carrés : c’est
                le carré de la longueur du trajet. Il ne reste qu’à en prendre la racine — une
                seule fois, à la fin.
              </div>
              <CubeLab
                orientation={o1}
                onOrientation={setO1}
                depart={a1}
                arrivee={b1}
                onSommet={choisir1}
                montrer="pythagore"
              />
              <div className="rounded-xl border border-slate-200 bg-white p-3 overflow-x-auto">
                <table className="w-full text-center text-sm"><tbody>
                  <tr className="bg-slate-50">
                    <th className="px-2 py-1 text-left">trajet</th>
                    <th className="px-2 py-1">ses trois nombres</th>
                    <th className="px-2 py-1">somme des carrés</th>
                    <th className="px-2 py-1">longueur</th>
                  </tr>
                  {TRAJETS.map((t) => (
                    <tr key={t.nom} className="border-t">
                      <th className="px-2 py-1 text-left font-mono">A{t.nom}</th>
                      <td className="px-2 py-1 font-mono">{frVec3(t.u)}</td>
                      <td className="px-2 py-1 font-mono font-bold">{fr(t.carre)}</td>
                      <td className="px-2 py-1 font-mono font-black">{t.norme}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              <NumericQuestion
                prompt={
                  <>
                    Pour la grande diagonale <strong>AG</strong>, que vaut la somme des trois
                    carrés ?
                  </>
                }
                expected={AG.carre}
                parse={parseSigned}
                display={fr(AG.carre)}
                requires={['trois-deplacements', 'deux-triangles-rectangles', 'formule-norme']}
                explain={`AG vaut ${frVec3(AG.u)} : les trois carrés valent 1, 1 et 1, et leur somme fait ${fr(AG.carre)}. La longueur est donc ${AG.norme}.`}
                explainFor={(n) => (
                  n === AG.pyth.plancherCarre
                    ? `${fr(AG.pyth.plancherCarre)} est le carré du plancher, celui du PREMIER triangle. Il en manque un : celui du trajet vers le fond.`
                    : null
                )}
                solved={done1}
                onAnswered={() => setQ1(true)}
              />
              {done1 && (
                <>
                  <Feedback tone="ok">
                    Trois longueurs, toutes différentes : <strong>1</strong> pour une arête,{' '}
                    <strong>√2</strong> pour la diagonale d’une face, <strong>√3</strong> pour celle
                    de la boîte. Chaque carré ajouté allonge le trajet.
                  </Feedback>
                  <KnowledgeBrick
                    id="formule-norme-espace"
                    variant="new"
                    lead={<>La formule qui résume les deux triangles. Vérifie-la sur d’autres trajets en la lisant.</>}
                  />
                </>
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'Pourquoi une seule racine',
          subtitle:
            'On pourrait croire qu’il suffit de mesurer le plancher, puis d’ajouter la hauteur. Compare les deux nombres.',
          done: done2,
          content: (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="rounded-xl border-2 border-emerald-300 bg-emerald-50 p-3">
                  <div className="text-[13px] font-semibold text-emerald-900">
                    la diagonale : √(1 + 1 + 1)
                  </div>
                  <div className="font-mono text-2xl font-black tabular-nums text-emerald-900 mt-1">
                    {AG.norme} ≈ {fr(AG.pyth.total)}
                  </div>
                </div>
                <div className="rounded-xl border-2 border-rose-300 bg-rose-50 p-3">
                  <div className="text-[13px] font-semibold text-rose-900">
                    le chemin en équerre : √(1 + 1) puis + 1
                  </div>
                  <div className="font-mono text-2xl font-black tabular-nums text-rose-900 mt-1">
                    ≈ {fr(EQUERRE)}
                  </div>
                </div>
              </div>
              <TapQuestion
                prompt={`Les deux nombres diffèrent de ${fr(EQUERRE - AG.pyth.total)}. Pourquoi ?`}
                options={[
                  'Prendre la racine avant d’ajouter le dernier trajet revient à longer le plancher PUIS à monter : c’est un chemin en équerre, plus long que la diagonale',
                  'Parce qu’on a fait une erreur d’arrondi',
                  'Parce que la racine de 2 n’est pas un nombre exact',
                  'Parce que le troisième trajet ne compte qu’à moitié',
                ]}
                correct={0}
                cols={1}
                requires={['formule-norme-espace', 'deux-triangles-rectangles']}
                explain={`Un chemin en deux bouts ne peut pas être aussi court qu’une diagonale : ${fr(EQUERRE)} contre ${fr(AG.pyth.total)}. La racine ferme la somme ENTIÈRE, et elle se prend à la fin — une seule fois.`}
                explainWrong="Ce n’est pas un arrondi : l’écart vaut plus d’un dixième, il se verrait sur la figure. Et le troisième trajet compte plein, comme les deux autres — son carré est simplement à mettre SOUS la même racine."
                solved={q2}
                onAnswered={() => setQ2(true)}
              />
              {done2 && (
                <KnowledgeBrick
                  id="mem-trois-carres"
                  variant="new"
                  lead={<>À retenir, et à vérifier chaque fois qu’une racine apparaît.</>}
                />
              )}
            </div>
          ),
        },
        {
          num: 3,
          title: 'Et quand un nombre est négatif ?',
          subtitle:
            'Le trajet BH repart vers la gauche : son premier nombre est négatif. Regarde ce que devient son carré.',
          done: q3,
          content: (
            <div className="space-y-3">
              <CubeLab
                orientation={o3}
                onOrientation={setO3}
                depart="B"
                arrivee="H"
                montrer="pythagore"
                disabled={!done2}
              />
              <NumericQuestion
                prompt={
                  <>
                    <strong>BH</strong> vaut {frVec3(BH_U)}. Que vaut la somme de ses trois carrés ?
                  </>
                }
                expected={BH_P.totalCarre}
                parse={parseSigned}
                display={fr(BH_P.totalCarre)}
                requires={['formule-norme-espace', 'coordonnees-vecteur-espace']}
                explain={`(−1)² vaut 1, pas −1 : élever au carré fait disparaître le signe. Les trois carrés valent donc 1, 1 et 1, leur somme fait ${fr(BH_P.totalCarre)}, et ‖BH‖ = ${normeExacte(BH_P.totalCarre)} — la même longueur que AG, ce qui est normal : les deux sont des diagonales de la même boîte.`}
                explainFor={(n) => (
                  n === 1
                    ? 'Le signe moins a été gardé : (−1)² + 1² + 1² deviendrait alors −1 + 1 + 1 = 1. Or un carré est toujours positif.'
                    : null
                )}
                solved={q3}
                onAnswered={() => setQ3(true)}
              />
              {q3 && (
                <>
                  <Feedback tone="ok">
                    Une longueur ne peut pas être négative, et la formule le garantit toute seule :
                    les carrés effacent les signes. Tourne la boîte et compare BH à AG — ce sont
                    deux diagonales, elles mesurent bien la même chose.
                  </Feedback>
                  <KnowledgeBrick
                    id="methode-calculer-norme-espace"
                    variant="new"
                    lead={<>Les quatre gestes, dans l’ordre. Refais-en un ou deux sur la boîte en les lisant.</>}
                  />
                </>
              )}
            </div>
          ),
        },
      ]}
      footer={
        <KnowledgeSnapshot moduleNumber={3}>
          <strong>La suite.</strong> Tu sais écrire un trajet et le mesurer. Reste ce que le
          produit scalaire devient dans l’espace — et la réponse tient en un mot : un terme de
          plus.
        </KnowledgeSnapshot>
      }
    />
  );
}
