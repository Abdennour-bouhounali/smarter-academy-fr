import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, PredictionChips, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import OmbreLab from '../components/OmbreLab';
import {
  U_LAB, CRANS_DROITS, vAuCran, angleAuCran, ombreSignee,
  produitCoordonnees, parseSigned, fr, norm,
} from '../components/scalaireUtils';

/**
 * Module 1 — DÉCLENCHEUR, et l'interaction SIGNATURE : l'ombre portée
 * (components/OmbreLab.jsx).
 *
 * Étape 1  la figure et son ombre. L'élève tourne d'un cran et lit l'ombre
 *          signée : c'est le premier geste, avant tout vocabulaire.
 * Étape 2  LE COEUR — deux afficheurs indépendants, côte à côte. L'élève
 *          balaie les crans et constate qu'ils ne se séparent JAMAIS.
 * Étape 3  l'angle droit, atteint en 6 crans exactement : les deux tombent
 *          à 0. Puis le passage à l'obtus, où l'ombre change de côté.
 * Étape 4  la question qui reste ouverte : comment s'appelle ce nombre ?
 *
 * Rien ne s'appelle « produit scalaire » avant le module 2 : le module se
 * termine en DEMANDANT ce que le suivant nommera (§6bis.1). Les deux briques
 * posées ici décrivent ce que l'élève a VU — l'ombre signée, la coïncidence —
 * sans employer le nom.
 *
 * CONNAISSANCES AVANT LA DEMANDE. L'ordre est geste → observation → brique →
 * demande :
 *   étape 1  tourner et lire l'ombre → brique `ombre-signee`
 *   étape 2  balayer et comparer les deux afficheurs → brique
 *            `deux-recettes-un-nombre`
 *   étapes 3 et 4  les questions, désormais légitimes.
 *
 * MANIPULATION JAMAIS GELÉE. Le laboratoire reste pilotable une fois l'étape
 * validée : `disabled` ne porte que les verrous d'ANTÉRIORITÉ. Seuls les
 * `PredictionChips` se figent — une prédiction s'enregistre une fois.
 */
const CRAN_DROIT = CRANS_DROITS[0];   // 6 crans depuis 0, soit 90° exactement

export default function Module01LOmbrePortee() {
  const [k1, setK1] = useState(1);
  const [q1, setQ1] = useState(false);
  const [pred, setPred] = useState(null);
  const [k2, setK2] = useState(0);
  const [vus2, setVus2] = useState([0]);
  const [k3, setK3] = useState(4);
  const [vus3, setVus3] = useState([4]);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);

  const done1 = q1;
  // La découverte tient à la SUITE des états comparés, pas au dernier : il faut
  // avoir vu les deux afficheurs coïncider sur au moins quatre angles.
  const done2 = vus2.length >= 4;
  // L'objectif du 3 : être passé PAR l'angle droit, et avoir vu un angle obtus.
  const vuDroit = vus3.includes(CRAN_DROIT);
  const vuObtus = vus3.some((k) => angleAuCran(k) > 90);
  const done3 = q3 && vuDroit && vuObtus;

  const visiter = (v, liste, setListe, setK, objectif, react, dejaFait) => {
    setK(v);
    if (liste.includes(v)) return;
    const suivant = [...liste, v];
    setListe(suivant);
    if (!dejaFait && objectif(suivant)) react?.(true);
  };

  // La valeur attendue à l'étape 1, RECALCULÉE — jamais écrite à la main.
  //
  // 60° et non 30° : à 30° l'ombre vaut 4,33 (un irrationnel arrondi), que
  // l'élève devrait recopier chiffre à chiffre depuis un compteur — c'est une
  // dictée, pas une lecture. À 60° elle vaut EXACTEMENT 2,5, et le produit
  // exactement 12,5 : la lecture est alors un vrai jugement.
  const kCible = 4;                                  // 60°
  const ombreCible = ombreSignee(U_LAB, vAuCran(kCible));

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      moduleTitle="L’ombre portée"
      moduleSubtitle="Deux flèches, une ombre qui bascule, et deux calculs qui refusent de se séparer"
      estimatedTime="10 min"
      brief={{
        tag: 'Déclencheur',
        title: 'Que peut bien produire une flèche sur une autre ?',
        tone: 'indigo',
        body: (
          <p>
            Deux flèches partent du même point. La première ne bouge pas ; tu fais tourner la
            seconde. Regarde ce que devient l’<strong>ombre</strong> de la seconde sur la première
            — et surveille les deux compteurs.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'L’ombre a un côté',
          subtitle:
            'Le trait épais vert est l’ombre que v projette sur la direction de u. Tourne jusqu’à un angle de 60°, puis lis la valeur affichée sous la figure.',
          done: done1,
          content: (
            <div className="space-y-3">
              {/* CONNAISSANCES AVANT LA DEMANDE. Cette description vient AVANT
                  la question, et non dans son `explain` : l'élève doit savoir
                  ce qu'est le trait vert avant qu'on ne lui demande de le lire.
                  C'est aussi ce qui pose « perpendiculaire » en position
                  d'enseignement — l'audit strict le signalait sinon comme
                  employé d'abord dans une correction. */}
              <div className="rounded-xl border border-teal-200 bg-teal-50 p-3 text-sm text-teal-900">
                Comment le trait vert est construit : depuis le bout de v, on abaisse une
                perpendiculaire jusqu’à la droite qui porte u. Le point où elle arrive s’appelle le{' '}
                <strong>pied</strong>, et le trait vert va de l’origine des deux flèches jusqu’à ce
                pied. Son signe dit de quel côté il part.
              </div>
              <OmbreLab k={k1} onChangeK={setK1} montrerAfficheurs={false} />
              <NumericQuestion
                prompt={<>Pour un angle de <strong>60°</strong>, combien vaut l’ombre signée affichée sous la figure ?</>}
                expected={Number(fr(ombreCible).replace('−', '-').replace(',', '.'))}
                parse={parseSigned}
                display={fr(ombreCible)}
                requires={['vecteur-deplacement', 'vocab-norme']}
                explain={`À 60°, le pied tombe encore du côté de u : l’ombre part dans le sens de u, elle est donc positive, et vaut ${fr(ombreCible)}. Le compteur « ombre signée » l’affiche directement sous la figure.`}
                explainFor={(n) => (n < 0 ? 'L’ombre n’est négative que lorsqu’elle part À L’OPPOSÉ de u. Ici les deux flèches penchent du même côté : l’ombre est positive.' : null)}
                solved={done1}
                onAnswered={() => setQ1(true)}
              />
              {done1 && (
                <>
                  <Feedback tone="ok">
                    Une ombre n’est pas une longueur ordinaire : elle a un <strong>côté</strong>.
                    Continue de tourner et regarde le compteur vert changer de signe.
                  </Feedback>
                  <KnowledgeBrick
                    id="ombre-signee"
                    variant="new"
                    lead={<>Ce que tu viens de mesurer porte un nom, et son signe compte. Refais tourner en le lisant.</>}
                  />
                </>
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'Deux compteurs qui ne se séparent jamais',
          subtitle:
            'Deux calculs qui n’ont rien à voir : à gauche, la longueur de u multipliée par l’ombre ; à droite, un calcul sur les quatre coordonnées. Visite au moins quatre angles et compare-les.',
          done: done2,
          content: (kit) => (
            <div className="space-y-3">
              <PredictionChips
                prompt="en faisant tourner v, que vont faire les deux compteurs ?"
                options={[
                  { id: 'ecart', label: 'Ils vont s’écarter l’un de l’autre' },
                  { id: 'egaux', label: 'Ils vont rester égaux à chaque angle' },
                  { id: 'inverses', label: 'L’un montera pendant que l’autre descendra' },
                ]}
                value={pred}
                onChange={setPred}
                disabled={done2}
              />
              <OmbreLab
                k={k2}
                onChangeK={(v) => visiter(v, vus2, setVus2, setK2, (l) => l.length >= 4, kit.react, done2)}
                visites={vus2}
                disabled={!done1}
              />
              {done2 ? (
                <>
                  <Feedback tone="ok">
                    {pred === 'egaux' ? 'Ta prédiction tenait' : pred ? 'Ta prédiction ne tenait pas' : 'Le constat'} :
                    ils ne se sont <strong>jamais</strong> séparés. Une ombre mesurée sur le dessin
                    et une somme de produits calculée sur quatre coordonnées, cela n’a rien à voir —
                    et pourtant le résultat est le même à chaque angle.
                  </Feedback>
                  <KnowledgeBrick
                    id="deux-recettes-un-nombre"
                    variant="new"
                    lead={<>Ce que les deux compteurs viennent de montrer, en une phrase. Continue de tourner en la lisant.</>}
                  />
                </>
              ) : (
                <Feedback tone="info">
                  Angles visités : {vus2.length} sur 4. À chaque cran, compare les deux grands
                  nombres — celui du cadre vert et celui du cadre bleu.
                </Feedback>
              )}
            </div>
          ),
        },
        {
          num: 3,
          title: 'Le sixième cran',
          subtitle:
            'Pars de 60° et tourne. Il te faut atteindre l’angle droit, puis le dépasser — et regarder de quel côté l’ombre repart.',
          done: done3,
          content: (kit) => (
            <div className="space-y-3">
              <OmbreLab
                k={k3}
                onChangeK={(v) =>
                  visiter(
                    v, vus3, setVus3, setK3,
                    (l) => l.includes(CRAN_DROIT) && l.some((x) => angleAuCran(x) > 90),
                    kit.react,
                    vuDroit && vuObtus
                  )
                }
                visites={vus3}
                disabled={!done2}
              />
              {vuDroit && vuObtus ? (
                <>
                  <Feedback tone="ok">
                    À <strong>90°</strong>, l’ombre est réduite à un point et les DEUX compteurs
                    affichent <strong>0</strong> — pas « presque 0 », mais zéro. Un cran de plus, et
                    l’ombre repart de l’autre côté de l’origine : les deux compteurs deviennent
                    négatifs, ensemble.
                  </Feedback>
                  <TapQuestion
                    prompt="Que se passe-t-il exactement au moment où les deux compteurs affichent 0 ?"
                    options={[
                      'Le pied de la perpendiculaire tombe sur l’origine : les deux flèches font un angle droit',
                      'La seconde flèche devient nulle',
                      'Les deux flèches se superposent',
                      'La seconde flèche sort du repère',
                    ]}
                    correct={0}
                    cols={1}
                    requires={['ombre-signee', 'deux-recettes-un-nombre']}
                    explain="L’ombre s’annule quand le pied de la perpendiculaire vient sur l’origine — c’est-à-dire quand la seconde flèche part exactement en travers de la première. Et comme les deux compteurs sont toujours égaux, celui des coordonnées affiche 0 lui aussi."
                    explainWrong="La seconde flèche garde la même longueur à tous les crans, et elle n’est jamais confondue avec la première (les deux compteurs vaudraient alors 25). Ce qui a changé, c’est l’angle : il vaut 90°."
                    solved={q3}
                    onAnswered={() => setQ3(true)}
                  />
                </>
              ) : (
                <Feedback tone="info">
                  {vuDroit ? 'Angle droit atteint ✓' : 'Angle droit pas encore atteint'} ·{' '}
                  {vuObtus ? 'angle supérieur à 90° visité ✓' : 'continue au-delà de 90°'}. Le pas
                  est de 15°, et 90 en contient exactement six.
                </Feedback>
              )}
            </div>
          ),
        },
        {
          num: 4,
          title: 'Alors, comment s’appelle ce nombre ?',
          done: q4,
          content: (
            <div className="space-y-3">
              <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4 text-sm text-indigo-900 space-y-2">
                <p className="font-semibold">Le bilan de ce que tu viens de voir :</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>deux flèches donnent UN nombre, pas une troisième flèche ;</li>
                  <li>on l’obtient de deux façons sans rapport l’une avec l’autre ;</li>
                  <li>il est positif en angle aigu, négatif en angle obtus ;</li>
                  <li>il vaut exactement 0 quand l’angle est droit.</li>
                </ul>
              </div>
              <TapQuestion
                prompt="Ce nombre est donc un outil pour…"
                options={[
                  'reconnaître un angle droit par un CALCUL, sans mesurer sur le dessin',
                  'mesurer la longueur d’une flèche',
                  'trouver les coordonnées du milieu de deux points',
                  'construire une troisième flèche à partir des deux premières',
                ]}
                correct={0}
                cols={1}
                requires={['ombre-signee', 'deux-recettes-un-nombre']}
                explain="Un dessin où deux traits ont l’air en travers l’un de l’autre ne prouve rien. Un calcul qui rend 0, si. Ce nombre a un nom et une notation : c’est le module suivant qui les pose."
                explainWrong="La longueur d’une flèche se lit déjà avec ‖u‖, et le milieu de deux points ne demande aucune de ces deux recettes. Quant au résultat, ce n’est pas une flèche : c’est un nombre unique. Ce qu’il apporte de neuf, c’est de faire de l’angle droit une question de calcul."
                solved={q4}
                onAnswered={() => setQ4(true)}
              />
            </div>
          ),
        },
      ]}
      footer={
        <KnowledgeSnapshot moduleNumber={1}>
          <strong>Le mot juste.</strong> Le nombre que les deux compteurs affichaient de concert a
          un nom, une notation, et deux formules officielles. Module suivant.
        </KnowledgeSnapshot>
      }
    />
  );
}
