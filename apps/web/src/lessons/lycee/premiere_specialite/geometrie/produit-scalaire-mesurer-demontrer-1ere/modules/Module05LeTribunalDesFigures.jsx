import React, { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import MesureScene, { TONS } from '../components/MesureScene';
import {
  SCENES, naturesDesTriangles, angles, cotes, nature, natureTexte,
  dot, cross, vec, carreScalaire, fr, frVec,
} from '../components/theodoliteUtils';

/**
 * Module 5 — ATELIER : démontrer (P4) et trancher la nature d'un triangle (P5).
 *
 * Étape 1  LE CONTRE-EXEMPLE — trois points alignés dont le produit scalaire
 *          vaut 26. C'est ce qui empêche de confondre les deux critères :
 *          l'alignement se lit sur la colinéarité, l'orthogonalité sur le
 *          produit scalaire. Sans cette étape, l'élève apprendrait qu'un
 *          « produit scalaire nul » démontre tout.
 * Étape 2  la hauteur : PH · QR = 0 ET H sur (QR). La double vérification.
 * Étape 3  LE TRIBUNAL — quatre triangles à juger par le calcul, dont deux
 *          trompe-l'œil vérifiés numériquement (88,99° et 1,4 % d'écart).
 *
 * CONNAISSANCES AVANT LA DEMANDE : étape 1 le calcul mené → brique
 * `regle-deux-criteres` ; étape 2 la double vérification menée → brique
 * `methode-demontrer-perpendiculaire` ; étape 3 la méthode complète →
 * briques `methode-nature-triangle` et `mem-le-calcul-tranche`.
 *
 * PÉRIMÈTRE : aucune équation de cercle, aucun lieu géométrique.
 */
const { alignes, hauteur } = SCENES.demontrer;
const { D, E, F } = alignes;
const { P, Q, R, H } = hauteur;
const DE = vec(D, E);
const DF = vec(D, F);
const PH = vec(P, H);
const QR = vec(Q, R);
const QH = vec(Q, H);
const TRIS = naturesDesTriangles();

/** Le libellé de la bonne réponse pour chaque triangle, CALCULÉ. */
const CHOIX = ['rectangle, non isocèle', 'isocèle, non rectangle', 'rectangle ET isocèle', 'quelconque'];
const indiceAttendu = (t) => {
  const n = nature(t);
  if (n.code === 'rectangle-isocele') return 2;
  if (n.code === 'rectangle') return 0;
  if (n.code === 'isocele') return 1;
  return 3;
};

export default function Module05LeTribunalDesFigures() {
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(5)}
      moduleNumber={5}
      moduleTitle="Le tribunal des figures"
      moduleSubtitle="Un dessin suggère, un calcul démontre — et deux de ces figures mentent"
      estimatedTime="12 min"
      brief={{
        tag: 'Atelier',
        title: 'Quatre figures à juger, sans jamais leur faire confiance',
        tone: 'indigo',
        body: (
          <p>
            Tu disposes maintenant de trois instruments : les angles, les longueurs, les droites. Il
            reste à s’en servir pour <strong>prouver</strong> — et à ne pas se tromper de critère,
            car ils ne démontrent pas tous la même chose.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Trois points alignés dont le produit ne vaut PAS 0',
          subtitle:
            'On voit bien que D, E et F sont sur une même ligne. Le produit scalaire va-t-il le confirmer ?',
          done: q1,
          content: (
            <div className="space-y-3">
              <MesureScene
                droites={[{ id: 'd', a: D, b: F, color: TONS.droite, dashed: true }]}
                fleches={[
                  { id: 'de', v: DE, from: D, color: TONS.v, nom: 'DE' },
                  { id: 'df', v: DF, from: D, color: TONS.w, nom: 'DF', dashed: true, width: 2.5 },
                ]}
                points={[
                  { id: 'D', ...D, nom: 'D', color: '#0f172a' },
                  { id: 'E', ...E, nom: 'E', color: TONS.v },
                  { id: 'F', ...F, nom: 'F', color: TONS.w },
                ]}
                ariaLabel={`Trois points D ${frVec(D)}, E ${frVec(E)} et F ${frVec(F)}, situés sur une même ligne.`}
              />
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="rounded-lg border-2 border-indigo-300 bg-indigo-50 px-2 py-2">
                  <div className="text-[13px] text-indigo-700">déterminant de DE et DF</div>
                  <div className="font-mono font-black tabular-nums text-indigo-900">{fr(cross(DE, DF))}</div>
                </div>
                <div className="rounded-lg border-2 border-rose-300 bg-rose-50 px-2 py-2">
                  <div className="text-[13px] text-rose-700">DE · DF</div>
                  <div className="font-mono font-black tabular-nums text-rose-900">{fr(dot(DE, DF))}</div>
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-700 space-y-1">
                <div className="font-mono">DE{frVec(DE)} et DF{frVec(DF)} : DF = 2 × DE, ils sont colinéaires</div>
                <div className="font-mono">et pourtant DE · DF = {fr(DE.x)} × {fr(DF.x)} + {fr(DE.y)} × {fr(DF.y)} = <strong>{fr(dot(DE, DF))}</strong></div>
              </div>
              <TapQuestion
                prompt="Que faut-il en conclure sur le critère à employer pour un alignement ?"
                options={[
                  'L’alignement se démontre par la COLINÉARITÉ, jamais par le produit scalaire',
                  'Le produit scalaire ne fonctionne pas quand les points sont trop rapprochés',
                  'Il faut que le produit scalaire soit le plus grand possible',
                  'On peut employer l’un ou l’autre, ils donnent la même réponse',
                ]}
                correct={0}
                cols={1}
                requires={['regle-colineaire', 'regle-orthogonalite']}
                explain={`Ces trois points sont bel et bien alignés — et leur produit scalaire vaut ${fr(dot(DE, DF))}, pas 0. Les deux critères répondent à deux questions différentes : « ces flèches ont-elles la même direction ? » se lit sur la colinéarité ; « sont-elles en travers ? » sur le produit scalaire.`}
                explainWrong="Rien à voir avec la distance entre les points : on peut les écarter autant qu’on veut, le produit scalaire ne s’annulera pas pour autant. Et « le plus grand possible » n’est pas un critère — un critère répond par oui ou par non."
                solved={q1}
                onAnswered={() => setQ1(true)}
              />
              {q1 && (
                <>
                  <Feedback tone="ok">
                    C’est le piège le plus coûteux du chapitre : appliquer le produit scalaire à une
                    question d’alignement. Il ne dira jamais rien de juste, parce que ce n’est pas sa
                    question.
                  </Feedback>
                  <KnowledgeBrick
                    id="regle-deux-criteres"
                    variant="new"
                    lead={<>Les deux critères, et ce que chacun démontre exactement.</>}
                  />
                </>
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'Prouver qu’une droite est une hauteur',
          subtitle:
            `Dans le triangle PQR, la droite (PH) semble tomber en travers de (QR). Deux choses à vérifier, pas une.`,
          done: q2,
          content: (
            <div className="space-y-3">
              <MesureScene
                triangle={{ A: P, B: Q, C: R }}
                segments={[{ id: 'ph', from: P, to: H, color: TONS.ok, width: 3, dashed: true }]}
                points={[
                  { id: 'P', ...P, nom: 'P', color: '#7c3aed' },
                  { id: 'Q', ...Q, nom: 'Q', color: '#0284c7' },
                  { id: 'R', ...R, nom: 'R', color: '#d97706' },
                  { id: 'H', ...H, nom: 'H', color: TONS.ok },
                ]}
                ariaLabel={`Le triangle PQR de sommets P ${frVec(P)}, Q ${frVec(Q)} et R ${frVec(R)}, et le point H ${frVec(H)} sur le côté QR.`}
              />
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900 space-y-1">
                <div className="font-semibold">Première vérification — les directions sont-elles en travers ?</div>
                <div className="font-mono">PH{frVec(PH)} et QR{frVec(QR)} : {fr(PH.x)} × {fr(QR.x)} + {fr(PH.y)} × {fr(QR.y)} = <strong>{fr(dot(PH, QR))}</strong> ✔</div>
                <div className="font-semibold pt-2">Seconde vérification — H est-il vraiment SUR (QR) ?</div>
                <div className="font-mono">QH{frVec(QH)} et QR{frVec(QR)} : QR = 2 × QH, ils sont colinéaires ✔</div>
              </div>
              <TapQuestion
                prompt="Pourquoi la seconde vérification est-elle indispensable ?"
                options={[
                  'Sans elle, on aurait prouvé que (PH) est perpendiculaire à (QR) — pas qu’elle la coupe en H',
                  'Parce que le produit scalaire peut se tromper de signe',
                  'Parce qu’il faut toujours faire deux calculs pour être sûr',
                  'Parce que H pourrait être en dehors du cadre',
                ]}
                correct={0}
                cols={1}
                requires={['regle-deux-criteres', 'regle-orthogonalite', 'regle-colineaire']}
                explain="Un produit scalaire nul parle de DIRECTIONS, pas de positions. Il resterait nul si l’on déplaçait H n’importe où en gardant la même direction pour PH — y compris très loin de (QR). Une hauteur, elle, doit rencontrer le côté opposé : c’est ce que la colinéarité de QH et QR établit."
                explainWrong="Le produit scalaire ne se trompe pas de signe, et « toujours deux calculs » n’est pas une raison. Ce sont bien deux affirmations différentes qu’il faut prouver : une direction, et une appartenance."
                solved={q2}
                onAnswered={() => setQ2(true)}
              />
              {q2 && (
                <>
                  <Feedback tone="ok">
                    Les deux vérifications réunies démontrent que <strong>(PH) est la hauteur issue
                    de P</strong> dans le triangle PQR. Et comme QR vaut exactement deux fois QH,
                    H tombe au milieu de [QR] : le triangle PQR est donc isocèle en P — un résultat
                    de plus, obtenu sans un calcul de plus.
                  </Feedback>
                  <KnowledgeBrick
                    id="methode-demontrer-perpendiculaire"
                    variant="new"
                    compact
                    lead={<>Les quatre gestes, avec la vérification en plus pour une hauteur.</>}
                  />
                </>
              )}
            </div>
          ),
        },
        {
          num: 3,
          title: 'La méthode complète, sur un cas',
          subtitle:
            'Six calculs suffisent à trancher la nature d’un triangle : trois carrés, trois produits scalaires.',
          done: q3,
          content: (
            <div className="space-y-3">
              <MesureScene
                triangle={TRIS[2]}
                points={[
                  { id: 'A', ...TRIS[2].A, nom: 'A', color: '#7c3aed' },
                  { id: 'B', ...TRIS[2].B, nom: 'B', color: '#0284c7' },
                  { id: 'C', ...TRIS[2].C, nom: 'C', color: '#d97706' },
                ]}
                ariaLabel={`Un triangle de sommets A ${frVec(TRIS[2].A)}, B ${frVec(TRIS[2].B)} et C ${frVec(TRIS[2].C)}.`}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="rounded-xl border border-sky-200 bg-sky-50 p-3 text-xs space-y-1">
                  <div className="font-semibold text-sky-900">Les trois carrés</div>
                  {cotes(TRIS[2]).map((c) => (
                    <div key={c.id} className="font-mono text-sky-800">{c.id}² = {fr(c.carre)}</div>
                  ))}
                  <div className="text-sky-900 pt-1">deux sont égaux → <strong>isocèle</strong></div>
                </div>
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs space-y-1">
                  <div className="font-semibold text-emerald-900">Les trois produits scalaires</div>
                  {angles(TRIS[2]).map((a) => (
                    <div key={a.id} className="font-mono text-emerald-800">en {a.id} : {fr(a.produit)}</div>
                  ))}
                  <div className="text-emerald-900 pt-1">un vaut 0 → <strong>rectangle</strong> en ce sommet</div>
                </div>
              </div>
              <TapQuestion
                prompt="Quelle est donc la nature de ce triangle ?"
                options={CHOIX}
                correct={indiceAttendu(TRIS[2])}
                cols={2}
                requires={['formule-carre-scalaire-longueur', 'regle-carres-entiers', 'regle-orthogonalite']}
                explain={`Les deux réponses se cumulent : ce triangle est ${natureTexte(TRIS[2])}. Rien n’oblige un triangle à n’avoir qu’une seule propriété — et rien n’oblige non plus à choisir entre les deux calculs : on fait les six.`}
                explainWrong="Les six calculs sont sous tes yeux : deux carrés sont égaux (donc isocèle) ET un produit scalaire vaut 0 (donc rectangle). Les deux à la fois."
                solved={q3}
                onAnswered={() => setQ3(true)}
              />
              {q3 && (
                <>
                  <Feedback tone="ok">
                    Six calculs, deux conclusions, aucune mesure sur la figure. Et une chose que
                    l’instrument ne pourra jamais annoncer : <strong>équilatéral</strong>. Aucun
                    triangle à sommets tous entiers ne l’est — le plus proche laisse encore près de
                    1 % d’écart entre ses côtés.
                  </Feedback>
                  <KnowledgeBrick
                    id="methode-nature-triangle"
                    variant="new"
                    lead={<>Les quatre gestes qui tranchent la nature d’un triangle sans rien mesurer.</>}
                  />
                  <KnowledgeBrick
                    id="mem-le-calcul-tranche"
                    variant="new"
                    lead={<>La règle du tribunal, en une ligne.</>}
                  />
                </>
              )}
            </div>
          ),
        },
        {
          num: 4,
          title: 'Le tribunal : quatre figures à juger',
          subtitle:
            'Deux d’entre elles trompent l’œil. Calcule avant de répondre — une figure ne prouve rien.',
          done: q4,
          content: (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {TRIS.map((t) => (
                  <div key={t.id} className="rounded-xl border border-slate-200 bg-white p-2">
                    <MesureScene
                      unit={19}
                      triangle={t}
                      points={[
                        { id: `${t.id}A`, ...t.A, nom: 'A', color: '#7c3aed' },
                        { id: `${t.id}B`, ...t.B, nom: 'B', color: '#0284c7' },
                        { id: `${t.id}C`, ...t.C, nom: 'C', color: '#d97706' },
                      ]}
                      legende={false}
                      ariaLabel={`Figure ${t.id} : un triangle de sommets A ${frVec(t.A)}, B ${frVec(t.B)} et C ${frVec(t.C)}.`}
                    />
                    <div className="mt-1 text-center text-[13px] font-mono text-slate-600">
                      <strong>{t.id}</strong> · A{frVec(t.A)} B{frVec(t.B)} C{frVec(t.C)}
                    </div>
                  </div>
                ))}
              </div>
              <BatchChoiceQuestion
                intro={<p>Pour chaque figure, quelle est sa <strong>nature</strong> ? Fais les six calculs.</p>}
                rows={TRIS.map((t) => {
                  const c = cotes(t);
                  const a = angles(t);
                  return {
                    id: t.id,
                    label: `${t.id} — A${frVec(t.A)} B${frVec(t.B)} C${frVec(t.C)}`,
                    options: CHOIX,
                    correct: indiceAttendu(t),
                    correction:
                      `Carrés : ${c.map((x) => `${x.id}² = ${fr(x.carre)}`).join(', ')}. `
                      + `Produits : ${a.map((x) => `en ${x.id} : ${fr(x.produit)}`).join(', ')}. `
                      + `Conclusion : ${natureTexte(t)}. `
                      + `Angles réels : ${a.map((x) => `${x.id} = ${fr(x.deg)}°`).join(', ')}.`,
                  };
                })}
                requires={['methode-nature-triangle', 'regle-carres-entiers', 'mem-le-calcul-tranche']}
                feedback={({ allRight }) =>
                  allRight ? (
                    <>
                      Deux de ces figures avaient tout pour tromper : l’une porte un angle de{' '}
                      {fr(angles(TRIS[1]).find((x) => x.id === 'C').deg)}° — un degré de moins qu’un
                      angle droit — et l’autre deux côtés à 1,4 % l’un de l’autre. Seuls les
                      entiers, {fr(angles(TRIS[1]).find((x) => x.id === 'C').produit)} et{' '}
                      {fr(carreScalaire(vec(TRIS[3].A, TRIS[3].B)))} contre{' '}
                      {fr(carreScalaire(vec(TRIS[3].C, TRIS[3].A)))}, tranchaient.
                    </>
                  ) : (
                    <>
                      Reprends les six calculs sur chaque figure, et ne conclus jamais d’après
                      l’allure : un angle de {fr(angles(TRIS[1]).find((x) => x.id === 'C').deg)}°
                      ressemble à un angle droit, et deux côtés de 10,3 et 10,44 ressemblent à deux
                      côtés égaux. Ce sont les entiers qui décident.
                    </>
                  )
                }
                solved={q4}
                onAnswered={() => setQ4(true)}
              />
            </div>
          ),
        },
      ]}
      footer={
        <KnowledgeSnapshot moduleNumber={5}>
          <strong>Tu as tout.</strong> Un angle, une distance, une droite écrite par son normal, et
          deux critères qu’on ne confond plus. Il reste à le prouver.
        </KnowledgeSnapshot>
      }
    />
  );
}
