import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, PredictionChips, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import CubeLab from '../components/CubeLab';
import ScalaireEspace from '../components/ScalaireEspace';
import {
  coordsDansRepere, vecNom, produitEspace, doublePythagore,
  parseSigned, fr, frVec3,
} from '../components/espaceUtils';

/**
 * Module 4 — MANIPULATION : le produit scalaire dans l'espace.
 *
 * LA PROMESSE, ET COMMENT ELLE EST TENUE. « La même formule qu'au plan, avec un
 * terme de plus » n'est pas une phrase à croire : le module la fait VOIR. Le
 * tableau de `ScalaireEspace` démarre à DEUX colonnes — l'état « comme au
 * plan » — puis la troisième s'ajoute à côté. L'élève constate que rien ne
 * bouge dans les deux premières.
 *
 * Étape 1  DEUX COLONNES, PUIS TROIS. Sur AG et AB, le troisième produit vaut
 *          0 : le total ne change pas. C'est le cas où « oublier le troisième
 *          terme » ne se voit pas — et c'est justement pour cela qu'on
 *          commence par là.
 * Étape 2  LE CAS OÙ ÇA CHANGE TOUT. Sur AC et DF, le troisième terme fait
 *          passer le total de… on le calcule : le piège devient visible.
 * Étape 3  LE PRODUIT AVEC LUI-MÊME redonne le carré de la longueur — le lien
 *          avec le module 3, et la vérification que rien n'a été perdu.
 *
 * CONNAISSANCES AVANT LA DEMANDE :
 *   étape 1  voir la troisième colonne s'ajouter → brique `formule-scalaire-espace`
 *   étape 2  constater qu'un terme oublié change le verdict → brique
 *            `mem-un-terme-de-plus`
 *   étape 3  la question du lien, désormais légitime.
 *
 * LA BOÎTE RESTE PILOTABLE. Elle montre les deux trajets dont on calcule le
 * produit ; l'élève tourne pour les voir. Seuls les verrous d'ANTÉRIORITÉ
 * posent `disabled`.
 */

const U1 = ['A', 'G'];
const V1 = ['A', 'B'];
const U2 = ['A', 'C'];
const V2 = ['D', 'F'];

const P = (a, b) => produitEspace(
  coordsDansRepere(vecNom(a[0], a[1])),
  coordsDansRepere(vecNom(b[0], b[1])),
);

/** Le produit des DEUX premiers termes seulement — l'erreur mesurée. */
const P2 = (a, b) => {
  const u = coordsDansRepere(vecNom(a[0], a[1]));
  const v = coordsDansRepere(vecNom(b[0], b[1]));
  return u.x * v.x + u.y * v.y;
};

const PROD1 = P(U1, V1);
const PROD2 = P(U2, V2);
const PROD2_TRONQUE = P2(U2, V2);
const AG_U = coordsDansRepere(vecNom('A', 'G'));
const AG_CARRE = doublePythagore(AG_U).totalCarre;

export default function Module04UnTermeDePlus() {
  const [o1, setO1] = useState({ yaw: 30, pitch: 15 });
  const [troisieme, setTroisieme] = useState(false);
  const [q1, setQ1] = useState(false);

  const [pred, setPred] = useState(null);
  const [o2, setO2] = useState({ yaw: 30, pitch: 15 });
  const [q2, setQ2] = useState(false);

  const [o3, setO3] = useState({ yaw: 30, pitch: 15 });
  const [q3, setQ3] = useState(false);

  const done1 = troisieme && q1;
  const done2 = q2;

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(4)}
      moduleNumber={4}
      moduleTitle="Un terme de plus"
      moduleSubtitle="Le produit scalaire ne change pas de nature en changeant de dimension"
      estimatedTime="12 min"
      brief={{
        tag: 'Manipulation',
        title: 'Que devient le produit scalaire ?',
        tone: 'indigo',
        body: (
          <p>
            Tu sais le calculer dans le plan : abscisse fois abscisse, ordonnée fois ordonnée, et
            l’on additionne. Regarde ce qu’il faut y ajouter quand on passe à trois nombres — et
            surtout, ce qui ne change pas.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Ajoute la troisième colonne',
          subtitle:
            'Le tableau commence à deux colonnes, comme au plan. Appuie sur le bouton pour ajouter la troisième, et regarde ce qui bouge dans les deux premières.',
          done: done1,
          content: (kit) => (
            <div className="space-y-3">
              <CubeLab
                orientation={o1}
                onOrientation={setO1}
                droites={[U1, V1]}
                montrer="aucune"
                montrerNombres={false}
                ariaLabel={`La boîte, avec les deux trajets ${U1.join('')} et ${V1.join('')} mis en évidence. Glisse pour la tourner.`}
              />
              <ScalaireEspace u={U1} v={V1} montrerTroisieme={troisieme} />
              <div>
                <button
                  type="button"
                  className="min-h-[44px] px-4 rounded-lg bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  onClick={() => {
                    const suivant = !troisieme;
                    setTroisieme(suivant);
                    if (suivant && !troisieme) kit.react?.(true);
                  }}
                >
                  {troisieme ? 'retirer la troisième colonne' : 'ajouter la troisième colonne'}
                </button>
              </div>
              {troisieme && (
                <>
                  <Feedback tone="ok">
                    Les deux premières colonnes n’ont pas bougé d’un chiffre. La troisième s’ajoute
                    à côté — ici elle vaut <strong>0</strong>, donc le total reste{' '}
                    <strong>{fr(PROD1)}</strong>. Appuie encore pour la retirer et la remettre.
                  </Feedback>
                  <NumericQuestion
                    prompt={
                      <>
                        Que vaut le produit scalaire de <strong>{U1.join('')}</strong> et{' '}
                        <strong>{V1.join('')}</strong> ?
                      </>
                    }
                    expected={PROD1}
                    parse={parseSigned}
                    display={fr(PROD1)}
                    requires={['coordonnees-vecteur-espace', 'vocab-produit-scalaire', 'formule-coordonnees-scalaire']}
                    explain={`${frVec3(coordsDansRepere(vecNom(...U1)))} et ${frVec3(coordsDansRepere(vecNom(...V1)))} : 1×1 + 1×0 + 1×0 = ${fr(PROD1)}. Le troisième produit vaut 0, mais il fait bien partie du calcul.`}
                    explainFor={(n) => (
                      n === 3
                        ? 'Trois est le nombre de termes, pas leur somme. Deux d’entre eux valent 0.'
                        : null
                    )}
                    solved={q1}
                    onAnswered={() => setQ1(true)}
                  />
                </>
              )}
              {done1 && (
                <KnowledgeBrick
                  id="formule-scalaire-espace"
                  variant="new"
                  lead={<>La formule, écrite pour l’espace. Fais réapparaître la troisième colonne en la lisant.</>}
                />
              )}
              {!troisieme && (
                <Feedback tone="info">
                  Pour l’instant, le tableau ne compte que deux colonnes : c’est le calcul du plan.
                  Ajoute la troisième.
                </Feedback>
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'Quand le troisième terme change le verdict',
          subtitle:
            'Ici, le troisième produit n’est pas nul. Prédis ce qu’il fera au total, puis vérifie.',
          done: done2,
          content: (
            <div className="space-y-3">
              <PredictionChips
                prompt={`sur ${U2.join('')} et ${V2.join('')}, les deux premiers termes donnent ${fr(PROD2_TRONQUE)}. Que donnera le total des trois ?`}
                options={[
                  { id: 'pareil', label: `Toujours ${fr(PROD2_TRONQUE)}` },
                  { id: 'zero', label: '0' },
                  { id: 'autre', label: 'Un nombre plus grand' },
                ]}
                value={pred}
                onChange={setPred}
                disabled={done2}
              />
              <CubeLab
                orientation={o2}
                onOrientation={setO2}
                droites={[U2, V2]}
                montrer="aucune"
                montrerNombres={false}
                disabled={!done1}
                ariaLabel={`La boîte, avec les deux trajets ${U2.join('')} et ${V2.join('')} mis en évidence. Glisse pour la tourner.`}
              />
              <ScalaireEspace u={U2} v={V2} />
              <NumericQuestion
                prompt={
                  <>
                    Que vaut le produit scalaire de <strong>{U2.join('')}</strong> et{' '}
                    <strong>{V2.join('')}</strong> ?
                  </>
                }
                expected={PROD2}
                parse={parseSigned}
                display={fr(PROD2)}
                requires={['formule-scalaire-espace']}
                explain={`${frVec3(coordsDansRepere(vecNom(...U2)))} et ${frVec3(coordsDansRepere(vecNom(...V2)))} : 1×1 + 1×(−1) + 0×1 = 1 − 1 + 0 = ${fr(PROD2)}. Ici, c’est le DEUXIÈME terme qui est négatif et qui annule le premier.`}
                explainFor={(n) => (
                  n === PROD2_TRONQUE
                    ? `${fr(PROD2_TRONQUE)} serait la réponse en oubliant un terme. Ici le troisième vaut 0, mais le deuxième vaut −1 : il faut bien les trois.`
                    : n === 2
                    ? 'C’est la somme des deux produits sans tenir compte du signe moins. Un produit négatif se SOUSTRAIT.'
                    : null
                )}
                solved={done2}
                onAnswered={() => setQ2(true)}
              />
              {done2 && (
                <>
                  <Feedback tone="ok">
                    {pred === 'zero' ? 'Ta prédiction tenait' : pred ? 'Ta prédiction ne tenait pas' : 'Le résultat'} :{' '}
                    <strong>{fr(PROD2)}</strong>. Un produit nul, tu sais déjà ce qu’il signifie —
                    le module suivant s’en servira. Retiens surtout que les trois termes comptent,
                    et que celui qui est négatif se soustrait.
                  </Feedback>
                  <KnowledgeBrick
                    id="mem-un-terme-de-plus"
                    variant="new"
                    lead={<>À retenir, et à vérifier chaque fois que tu écris un produit scalaire.</>}
                  />
                </>
              )}
            </div>
          ),
        },
        {
          num: 3,
          title: 'Le produit d’un trajet avec lui-même',
          done: q3,
          content: (
            <div className="space-y-3">
              <CubeLab
                orientation={o3}
                onOrientation={setO3}
                depart="A"
                arrivee="G"
                montrer="pythagore"
                disabled={!done2}
              />
              <ScalaireEspace u={['A', 'G']} v={['A', 'G']} />
              <TapQuestion
                prompt={`Le produit de AG avec lui-même vaut ${fr(AG_CARRE)}. Où as-tu déjà rencontré ce nombre ?`}
                options={[
                  `C’est la somme des trois carrés, donc le CARRÉ de la longueur de AG — et ‖AG‖ vaut bien √${fr(AG_CARRE)}`,
                  'C’est la longueur de AG elle-même',
                  'C’est le nombre d’arêtes du trajet',
                  'C’est une coïncidence, les deux calculs n’ont pas de rapport',
                ]}
                correct={0}
                cols={1}
                requires={['formule-scalaire-espace', 'formule-norme-espace']}
                explain={`Multiplier un trajet par lui-même donne x×x + y×y + z×z, c’est-à-dire x² + y² + z² : exactement ce qui vit sous la racine de la longueur. Le produit scalaire d’un vecteur avec lui-même est donc le carré de sa longueur — au plan comme dans l’espace.`}
                explainWrong={`La longueur de AG vaut √${fr(AG_CARRE)}, pas ${fr(AG_CARRE)} : il manque la racine. Ce n’est pas non plus une coïncidence — le calcul est littéralement le même : x×x + y×y + z×z, c’est x² + y² + z².`}
                solved={q3}
                onAnswered={() => setQ3(true)}
              />
            </div>
          ),
        },
      ]}
      footer={
        <KnowledgeSnapshot moduleNumber={4}>
          <strong>La suite.</strong> Tu as vu un produit scalaire tomber à zéro. Dans le plan, cela
          voulait dire « angle droit, donc les deux droites se coupent ». Dans l’espace, la
          deuxième moitié de cette phrase est fausse — modules 5 et 6.
        </KnowledgeSnapshot>
      }
    />
  );
}
