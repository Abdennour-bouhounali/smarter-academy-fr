import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import MathText from '../../../../../common/components/MathText';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { parseReel } from '../components/parseBridge';
import {
  cos2aDepuisAddition, FORMES_COS2A, contreExempleLineaire,
  CIBLES_DUPLICATION, valeurDuplication, cosExact, sinExact,
  labelPi, ecritureK, fr, REMARQUABLES,
} from '../components/trigEqUtils';

/**
 * Module 5 — ATELIER : les formules d'addition (LP4, RAPPEL) puis la
 * DUPLICATION (LP5, découverte par le geste « poser b = a »).
 *
 * Étape 1  RAPPEL BREF de l'addition — elle est acquise en Seconde, et le
 *          module ne la réenseigne pas : il la fait EMPLOYER sur un calcul
 *          exact, ce qui est exactement le LP4 (« utiliser les formules »).
 * Étape 2  LE GESTE : on remplace b par a dans la formule d'addition, et la
 *          duplication TOMBE. L'élève exécute la substitution lui-même sur un
 *          cas numérique, avant que la brique ne l'énonce.
 * Étape 3  le piège frontal « cos 2a = 2 cos a », réfuté par un
 *          CONTRE-EXEMPLE calculé par le modèle — jamais affirmé.
 *
 * TOUT EST CALCULÉ. Aucune valeur n'est écrite à la main : `cos2aDepuisAddition`
 * est LITTÉRALEMENT `cosAddition(a, a)`, et le test le verrouille.
 *
 * POURQUOI PAS DE MANIPULATION GRAPHIQUE ICI. Ce module est un atelier de
 * CALCUL EXACT : le geste porteur est la substitution b ← a, pas un
 * déplacement dans un repère. La règle « glisser plutôt que boutonner » vise
 * les POINTS et les FIGURES ; il n'y en a pas dans une identité algébrique.
 * Le choix d'une écriture parmi trois reste donc un choix, comme le sens d'une
 * inégalité au module 4.
 */

/** Le contre-exemple, CHERCHÉ par le modèle — pas choisi à la main. */
const CE = contreExempleLineaire(0.5);

/** Les trois cibles de duplication, avec leur valeur CALCULÉE. */
const [D1, D2, D3] = CIBLES_DUPLICATION;

/** L'exemple du rappel : cos(π/4 + π/6), calculé par la formule d'addition. */
const A_R = Math.PI / 4;
const B_R = Math.PI / 6;

export default function Module05PoserBEgaleA() {
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  const [forme, setForme] = useState(FORMES_COS2A[0].id);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);

  const done1 = q1;
  const done2 = q2;
  const done3 = q3;
  const done4 = q4;

  const formeChoisie = FORMES_COS2A.find((f) => f.id === forme);

  const steps = [
    {
      num: 1,
      title: 'Rappel : additionner deux réels',
      subtitle:
        'Tu connais ces deux formules depuis la Seconde. Un seul calcul pour vérifier qu’elles sont bien en place.',
      done: done1,
      content: (
        <div className="space-y-3">
          <div className="rounded-xl border border-rose-100 bg-white p-3 space-y-2 text-center">
            <MathText>{'$$\\cos(a+b) = \\cos a \\cos b - \\sin a \\sin b$$'}</MathText>
            <MathText>{'$$\\sin(a+b) = \\sin a \\cos b + \\cos a \\sin b$$'}</MathText>
          </div>
          <TapQuestion
            prompt={`Que vaut sin(${labelPi(A_R)} + ${labelPi(B_R)}) d'après la formule d'addition ?`}
            options={[
              'sin(π/4)cos(π/6) + cos(π/4)sin(π/6)',
              'sin(π/4) + sin(π/6)',
              'sin(π/4)cos(π/6) − cos(π/4)sin(π/6)',
              'sin(π/4)sin(π/6) + cos(π/4)cos(π/6)',
            ]}
            correct={0}
            cols={1}
            requires={['formules-addition']}
            explain="Pour le sinus : les deux produits CROISÉS, additionnés. Le signe moins et les produits non croisés appartiennent à la formule du cosinus — les échanger est l’erreur type."
            explainWrong="Repère la structure : sin(a+b) mélange un sinus et un cosinus dans chaque produit (produits croisés), et les additionne. cos(a+b), lui, garde les mêmes fonctions ensemble et les soustrait."
            solved={done1}
            onAnswered={() => setQ1(true)}
          />
        </div>
      ),
    },
    {
      num: 2,
      title: 'Le geste : et si b valait a ?',
      subtitle:
        'Les formules d’addition marchent pour TOUS les réels a et b. Rien n’interdit donc de prendre b égal à a. Fais-le, et regarde ce qui reste.',
      done: done2,
      content: (
        <div className="space-y-3">
          <div className="rounded-xl border border-rose-100 bg-rose-50/50 p-4 text-sm text-slate-700 space-y-3">
            <p className="font-semibold text-rose-900">La substitution, ligne par ligne :</p>
            <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-2 text-center">
              <MathText>{'$$\\cos(a + \\textcolor{#dc2626}{b}) = \\cos a \\cos \\textcolor{#dc2626}{b} - \\sin a \\sin \\textcolor{#dc2626}{b}$$'}</MathText>
              <div className="text-xs text-slate-500">on remplace partout b par a</div>
              <MathText>{'$$\\cos(a + \\textcolor{#dc2626}{a}) = \\cos a \\cos \\textcolor{#dc2626}{a} - \\sin a \\sin \\textcolor{#dc2626}{a}$$'}</MathText>
              <div className="text-xs text-slate-500">et l’on range</div>
              <MathText>{'$$\\cos 2a = \\cos^2 a - \\sin^2 a$$'}</MathText>
            </div>
          </div>
          <NumericQuestion
            prompt={`Applique-la : que vaut cos(${labelPi(2 * D1.t)}) ? On sait que cos(${labelPi(D1.t)}) = ${ecritureK(cosExact(D1.t))} et sin(${labelPi(D1.t)}) = ${ecritureK(sinExact(D1.t))}. (réponse au centième)`}
            answer={Number(valeurDuplication(D1).toFixed(2))}
            parse={parseReel}
            requires={['formules-addition']}
            // Les valeurs citées sont les écritures EXACTES (√3/2, 1/2), et
            // leurs carrés sont donc exacts eux aussi : 3/4 − 1/4 = 1/2. Citer
            // « 0,87² − 0,50² » ferait 0,5069 et l'explication CONTREDIRAIT la
            // réponse attendue — le piège de l'arrondi dans un raisonnement.
            explain={`Avec a = ${labelPi(D1.t)} : cos²a = (${ecritureK(cosExact(D1.t))})² = 3/4 et sin²a = (${ecritureK(sinExact(D1.t))})² = 1/4. Donc cos 2a = 3/4 − 1/4 = 1/2 = ${fr(valeurDuplication(D1), 2)}. Et c'est bien la valeur de cos(${labelPi(2 * D1.t)}), que tu connais par cœur.`}
            explainWrong={`Élève chaque valeur au CARRÉ avant de soustraire, et garde les écritures exactes : (${ecritureK(cosExact(D1.t))})² = 3/4, puis (${ecritureK(sinExact(D1.t))})² = 1/4. La différence donne 1/2, soit ${fr(valeurDuplication(D1), 2)}. Attention à ne pas soustraire les valeurs elles-mêmes.`}
            solved={done2}
            onAnswered={() => setQ2(true)}
          />
          {done2 && (
            <>
              <Feedback tone="ok">
                Le calcul retombe exactement sur la valeur que tu connais déjà pour{' '}
                cos({labelPi(2 * D1.t)}). La formule n’est pas une nouveauté à apprendre :
                c’est l’addition, avec b = a.
              </Feedback>
              <KnowledgeBrick
                id="formules-duplication"
                variant="new"
                lead={<>Ces deux formules ont un nom, et tu viens de les fabriquer.</>}
              />
              <KnowledgeBrick
                id="methode-poser-b-egale-a"
                variant="new"
                lead={<>Et si tu les oublies, voici comment les retrouver en trois lignes.</>}
              />
            </>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Trois écritures pour le même nombre',
      subtitle:
        'Avec cos²a + sin²a = 1, la formule du cosinus se réécrit de deux autres façons. Choisis une écriture et vérifie qu’elle donne toujours le même résultat.',
      done: done3,
      content: (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2 items-center" role="group" aria-label="Choisir une écriture de cos 2a">
            {FORMES_COS2A.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setForme(f.id)}
                aria-pressed={forme === f.id}
                className={`h-11 px-4 rounded-lg font-bold text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                  forme === f.id ? 'bg-rose-600 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <MathText>{`$${f.tex}$`}</MathText>
              </button>
            ))}
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-3 overflow-x-auto">
            <table className="w-full text-center text-sm tabular-nums">
              <thead>
                <tr className="bg-slate-50 text-slate-600">
                  <th className="px-2 py-1 text-left">a</th>
                  {[0, 2, 3, 4, 6].map((i) => (
                    <th key={i} className="px-2 py-1">{REMARQUABLES[i].label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-t">
                  <th className="px-2 py-1 text-left text-rose-700">l’écriture choisie</th>
                  {[0, 2, 3, 4, 6].map((i) => (
                    <td key={i} className="px-2 py-1 font-mono">{fr(formeChoisie.f(REMARQUABLES[i].t), 2)}</td>
                  ))}
                </tr>
                <tr className="border-t">
                  <th className="px-2 py-1 text-left text-slate-700">cos 2a, par l’addition</th>
                  {[0, 2, 3, 4, 6].map((i) => (
                    <td key={i} className="px-2 py-1 font-mono">{fr(cos2aDepuisAddition(REMARQUABLES[i].t), 2)}</td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
          <Feedback tone="info">
            Change d’écriture autant de fois que tu veux : les deux lignes du tableau restent
            identiques. Les trois écritures sont trois habillages du même nombre — on choisit
            celle qui arrange le calcul.
          </Feedback>
          <NumericQuestion
            prompt={`Que vaut sin(${labelPi(2 * D2.t)}) ? On sait que sin(${labelPi(D2.t)}) = cos(${labelPi(D2.t)}) = ${ecritureK(sinExact(D2.t))}. (réponse au centième)`}
            answer={Number(valeurDuplication(D2).toFixed(2))}
            parse={parseReel}
            requires={['formules-duplication', 'methode-poser-b-egale-a']}
            explain={`sin 2a = 2 sin a cos a = 2 × ${ecritureK(sinExact(D2.t))} × ${ecritureK(cosExact(D2.t))} = 2 × 1/2 = ${fr(valeurDuplication(D2), 2)}, car (√2/2)² = 1/2. Et c'est bien sin(${labelPi(2 * D2.t)}) : le sinus y vaut 1, tout en haut du cercle.`}
            explainWrong={`Applique sin 2a = 2 sin a cos a. Ici les deux valeurs sont égales à ${ecritureK(sinExact(D2.t))}, dont le carré vaut exactement 1/2. Le double de 1/2 fait ${fr(valeurDuplication(D2), 2)}.`}
            solved={done3}
            onAnswered={() => setQ3(true)}
          />
          {done3 && (
            <Feedback tone="ok">
              Un troisième cas pour confirmer, sans rien apprendre de neuf : avec
              a = {labelPi(D3.t)}, cos 2a vaut{' '}
              <strong>{fr(valeurDuplication(D3), 2)}</strong> — c’est bien
              cos({labelPi(2 * D3.t)}), que tu connais. Trois fois de suite, la
              substitution retombe sur une valeur du cercle.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 4,
      title: 'Le piège : doubler le réel ne double pas la valeur',
      done: done4,
      content: (
        <div className="space-y-3">
          <div className="rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-700 space-y-2">
            <p>
              Un calcul suffit à trancher. Pour a = <strong>{CE.label}</strong> :
            </p>
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="rounded-lg border-2 border-emerald-200 bg-emerald-50 px-3 py-2">
                <div className="text-[13px] text-emerald-800">cos 2a, par la duplication</div>
                <div className="font-mono font-black text-emerald-900">{fr(CE.vrai, 2)}</div>
              </div>
              <div className="rounded-lg border-2 border-rose-200 bg-rose-50 px-3 py-2">
                <div className="text-[13px] text-rose-800">2 cos a</div>
                <div className="font-mono font-black text-rose-900">{fr(CE.faux, 2)}</div>
              </div>
            </div>
          </div>
          <KnowledgeBrick
            id="regle-cos-2a-nest-pas-2cos-a"
            variant="new"
            lead={<>Un seul calcul, et l’affaire est réglée.</>}
          />
          <KnowledgeBrick
            id="mem-poser-b-egale-a"
            variant="new"
            lead={<>Ce qu’il faut garder de ce module.</>}
          />
          <TapQuestion
            prompt="Pourquoi ce seul calcul suffit-il à prouver que cos 2a n’est pas 2 cos a ?"
            options={[
              'Parce qu’une égalité annoncée « pour tout a » est détruite par UN SEUL réel où elle est fausse',
              'Parce que le calcul est compliqué',
              'Parce que les deux nombres sont négatifs',
              'Il ne suffit pas : il faudrait le vérifier pour tous les réels',
            ]}
            correct={0}
            cols={1}
            requires={['regle-cos-2a-nest-pas-2cos-a', 'formules-duplication']}
            explain={`« Pour tout a » veut dire « sans aucune exception ». Une seule exception suffit donc à réfuter. Ici en a = ${CE.label}, les deux quantités valent ${fr(CE.vrai, 2)} et ${fr(CE.faux, 2)} — elles ne sont même pas du même signe. C'est le même raisonnement qui avait réfuté « cos(a+b) = cos a + cos b » en Seconde.`}
            explainWrong="Ce n’est pas une question de difficulté ni de signe. C’est une question de logique : pour DÉTRUIRE une affirmation universelle, un seul contre-exemple suffit. Pour la PROUVER, en revanche, il faudrait une démonstration valable partout — et c’est ce que fait la substitution b = a."
            solved={done4}
            onAnswered={() => setQ4(true)}
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
      moduleTitle="Poser b = a"
      moduleSubtitle="Deux formules qu’on ne retient pas : on les retrouve"
      estimatedTime="11 min"
      brief={{
        tag: 'Atelier',
        title: 'Un geste minuscule, deux formules de plus',
        tone: 'indigo',
        body: (
          <p>
            Les formules d’addition valent pour <strong>tous</strong> les réels a et b. Rien
            n’interdit donc de prendre b égal à a — et ce qui reste alors porte un nom. Tu vas
            le fabriquer toi-même plutôt que de l’apprendre.
          </p>
        ),
      }}
      steps={steps}
      footer={
        <KnowledgeSnapshot moduleNumber={5}>
          <strong>Un dernier module.</strong> Tu sais résoudre et tu sais calculer. Reste à
          voir à quoi tout cela sert quand un phénomène réel se répète — la marée, la
          température, une grande roue.
        </KnowledgeSnapshot>
      }
    />
  );
}
