import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import ScalaireScene, { TONS } from '../components/ScalaireScene';
import {
  verdictsOrthogonalite, produitCoordonnees, angleVecteursDeg,
  vec, parseSigned, fr, frVec,
} from '../components/scalaireUtils';

/**
 * Module 4 — ATELIER : l'orthogonalité devient un CALCUL.
 *
 * Étape 1  le critère est posé après un geste : l'élève choisit un couple,
 *          regarde la figure, PARIE à l'œil, puis calcule. Deux des quatre
 *          couples sont des trompe-l'œil (86,8° et 91,2°) : l'écart au droit
 *          est invisible sur la figure, et seul le calcul tranche. C'est ce
 *          qui rend le critère NÉCESSAIRE au lieu d'être un ornement.
 * Étape 2  le calcul sur des POINTS : AB · AC, avec la soustraction en amont.
 * Étape 3  les quatre verdicts d'un coup, chacun justifié par son nombre.
 *
 * CONNAISSANCES AVANT LA DEMANDE : étape 1 geste → constat → briques
 * `regle-orthogonalite` et `mem-nul-donc-droit` ; étape 2 méthode menée →
 * brique `methode-demontrer-orthogonal` ; étape 3 la demande, légitime.
 *
 * MANIPULATION JAMAIS GELÉE : le sélecteur de couple reste actionnable après
 * validation — l'élève doit pouvoir repasser sur les quatre figures.
 */
const CAS = verdictsOrthogonalite();

/** Les points de l'étape 2, et les deux vecteurs qu'ils définissent. */
const A = { x: 1, y: -2 };
const B = { x: 4, y: 2 };
const C = { x: -3, y: 1 };

export default function Module04DemontrerLAngleDroit() {
  const [idx, setIdx] = useState(0);
  const [calcules, setCalcules] = useState([]);
  const [pari, setPari] = useState(null);
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);

  const cas = CAS[idx];
  const revele = calcules.includes(cas.id);
  // Il faut avoir calculé un couple orthogonal ET un couple qui ne l'est pas :
  // sans le second, le critère n'aurait rien discriminé.
  const vuVrai = CAS.some((c) => calcules.includes(c.id) && c.orthogonaux);
  const vuFaux = CAS.some((c) => calcules.includes(c.id) && !c.orthogonaux);
  const done1 = q1 && vuVrai && vuFaux;

  const AB = vec(A, B);
  const AC = vec(A, C);
  const prodAB = produitCoordonnees(AB, AC);

  const reveler = (react) => {
    if (calcules.includes(cas.id)) return;
    const suivant = [...calcules, cas.id];
    setCalcules(suivant);
    const vrai = CAS.some((c) => suivant.includes(c.id) && c.orthogonaux);
    const faux = CAS.some((c) => suivant.includes(c.id) && !c.orthogonaux);
    if (!(vuVrai && vuFaux) && vrai && faux) react?.(true);
  };

  const onglet = (actif) =>
    `h-11 min-w-[52px] px-3 rounded-lg text-sm font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
      actif ? 'bg-emerald-600 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
    }`;

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(4)}
      moduleNumber={4}
      moduleTitle="Démontrer l’angle droit"
      moduleSubtitle="Un dessin ne prouve rien — un nombre nul, si"
      estimatedTime="12 min"
      brief={{
        tag: 'Atelier',
        title: 'Quatre couples, dont deux qui trompent l’œil',
        tone: 'indigo',
        body: (
          <p>
            Regarde chaque figure, parie, puis calcule. Tu verras que sur deux d’entre elles ton
            œil se trompe — et que le nombre, lui, ne se trompe pas.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Parier, puis calculer',
          subtitle:
            'Choisis un couple, dis si tu le crois en angle droit, puis découvre le produit scalaire. Il te faut en calculer au moins un de chaque sorte.',
          done: done1,
          content: (kit) => (
            <div className="space-y-3">
              <div className="flex items-center gap-2 flex-wrap" role="group" aria-label="Choisir un couple de vecteurs">
                {CAS.map((c, i) => (
                  <button
                    key={c.id}
                    type="button"
                    className={onglet(i === idx)}
                    onClick={() => { setIdx(i); setPari(null); }}
                    aria-pressed={i === idx}
                  >
                    couple {i + 1}
                    {calcules.includes(c.id) && <span aria-hidden="true"> ✓</span>}
                  </button>
                ))}
              </div>

              <ScalaireScene
                fleches={[
                  { id: 'u', v: cas.u, color: TONS.u, nom: 'u' },
                  { id: 'v', v: cas.v, color: TONS.v, nom: 'v' },
                ]}
                ariaLabel={`Couple ${idx + 1} : u a pour coordonnées ${frVec(cas.u)}, v a pour coordonnées ${frVec(cas.v)}.`}
              />

              {!revele ? (
                <div className="space-y-2">
                  <p className="text-sm text-slate-700">
                    À l’œil, dirais-tu que ces deux flèches font un angle droit ?
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    <button type="button" className={onglet(pari === 'oui')} onClick={() => setPari('oui')}>oui</button>
                    <button type="button" className={onglet(pari === 'non')} onClick={() => setPari('non')}>non</button>
                    <button
                      type="button"
                      className="h-11 px-4 rounded-lg bg-slate-900 text-white text-sm font-bold disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                      disabled={!pari}
                      onClick={() => reveler(kit.react)}
                    >
                      calculer u · v
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className={`rounded-xl border-2 p-3 ${cas.orthogonaux ? 'border-emerald-400 bg-emerald-50' : 'border-rose-300 bg-rose-50'}`}>
                    <div className="text-[13px] font-semibold text-slate-700">
                      u · v = {fr(cas.u.x)} × {fr(cas.v.x)} + {fr(cas.u.y)} × {fr(cas.v.y)}
                    </div>
                    <div className="font-mono text-3xl font-black tabular-nums text-slate-900 mt-1">{fr(cas.produit)}</div>
                    <div className="text-sm mt-1 font-semibold">
                      {cas.orthogonaux
                        ? '→ le produit est nul : les deux flèches sont bien en angle droit.'
                        : `→ le produit n’est pas nul : l’angle vaut ${fr(angleVecteursDeg(cas.u, cas.v))}°, pas 90°.`}
                    </div>
                  </div>
                  {!cas.orthogonaux && (
                    <Feedback tone="ko">
                      Sur la figure, rien ne se voyait : l’écart au droit est de{' '}
                      <strong>{fr(Math.abs(angleVecteursDeg(cas.u, cas.v) - 90))}°</strong>, moins
                      qu’un pixel de différence à cette échelle. Aucun œil ne le tranche —
                      le calcul, si.
                    </Feedback>
                  )}
                  <p className="text-[13px] text-slate-600">
                    Choisis un autre couple ci-dessus pour continuer. Calculés :{' '}
                    <strong>{calcules.length}</strong> sur {CAS.length}.
                  </p>
                </div>
              )}

              {vuVrai && vuFaux && (
                <>
                  <Feedback tone="ok">
                    Deux couples se ressemblaient et n’avaient pas le même verdict. Ce n’est pas la
                    figure qui décide : c’est <strong>le nombre</strong>.
                  </Feedback>
                  <KnowledgeBrick
                    id="regle-orthogonalite"
                    variant="new"
                    lead={<>Le critère, dans les deux sens. Repasse sur les quatre figures en le lisant.</>}
                  />
                  <KnowledgeBrick
                    id="mem-nul-donc-droit"
                    variant="new"
                    lead={<>La seule chose à retenir par cœur de tout ce module.</>}
                  />
                  <TapQuestion
                    prompt="Pourquoi un dessin ne suffit-il pas à démontrer que deux vecteurs sont orthogonaux ?"
                    options={[
                      'Parce qu’un écart de un ou deux degrés est invisible : deux figures indiscernables peuvent avoir des verdicts opposés',
                      'Parce qu’un dessin n’a pas de coordonnées',
                      'Parce qu’un dessin est toujours faux',
                      'Parce qu’il faudrait un rapporteur, et qu’on n’en a pas',
                    ]}
                    correct={0}
                    cols={1}
                    requires={['regle-orthogonalite', 'mem-nul-donc-droit']}
                    explain="Les couples 2 et 3 ont des angles de 86,8° et 91,2° : sur une figure de quelques centimètres, l’écart est plus petit que l’épaisseur du trait. Le produit scalaire, lui, vaut 1 et −1 — non nuls, sans discussion."
                    explainWrong="Un dessin peut parfaitement porter des coordonnées, et il n’est pas « faux » : il est simplement trop imprécis pour trancher un écart de un degré. Et un rapporteur ne ferait pas mieux — c’est la mesure elle-même qui est en cause, pas l’instrument."
                    solved={q1}
                    onAnswered={() => setQ1(true)}
                  />
                </>
              )}
              {!(vuVrai && vuFaux) && calcules.length > 0 && (
                <Feedback tone="info">
                  {vuVrai ? 'Un couple orthogonal trouvé ✓' : 'aucun couple orthogonal encore calculé'} ·{' '}
                  {vuFaux ? 'un couple non orthogonal trouvé ✓' : 'aucun couple non orthogonal encore calculé'}.
                  Il te faut les deux pour que le critère ait servi à quelque chose.
                </Feedback>
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'Trois points, un angle à démontrer',
          subtitle:
            'Un énoncé de géométrie ne donne pas de flèches : il donne des points. Le premier geste est donc une soustraction.',
          done: q2,
          content: (
            <div className="space-y-3">
              <ScalaireScene
                fleches={[
                  { id: 'ab', v: AB, from: A, color: TONS.u, nom: 'AB' },
                  { id: 'ac', v: AC, from: A, color: TONS.v, nom: 'AC' },
                ]}
                points={[
                  { id: 'A', ...A, nom: 'A', color: '#0f172a' },
                  { id: 'B', ...B, nom: 'B', color: TONS.u },
                  { id: 'C', ...C, nom: 'C', color: TONS.v },
                ]}
                ariaLabel={`Trois points : A(${fr(A.x)} ; ${fr(A.y)}), B(${fr(B.x)} ; ${fr(B.y)}), C(${fr(C.x)} ; ${fr(C.y)}). Les deux flèches AB et AC partent de A.`}
              />
              <div className="rounded-xl border border-emerald-100 bg-white p-4 text-sm text-slate-700 space-y-1">
                <p className="font-semibold text-emerald-900">Arrivée moins départ, pour chacune :</p>
                <p className="font-mono">AB = ({fr(B.x)} − {fr(A.x)} ; {fr(B.y)} − {fr(A.y)}) = {frVec(AB)}</p>
                <p className="font-mono">AC = ({fr(C.x)} − {fr(A.x)} ; {fr(C.y)} − {fr(A.y)}) = {frVec(AC)}</p>
              </div>
              <NumericQuestion
                prompt={<>Combien vaut <strong>AB · AC</strong> ?</>}
                expected={prodAB}
                parse={parseSigned}
                display={fr(prodAB)}
                requires={['regle-coordonnees', 'formule-coordonnees-scalaire', 'regle-orthogonalite']}
                explain={`${fr(AB.x)} × ${fr(AC.x)} + ${fr(AB.y)} × ${fr(AC.y)} = ${fr(AB.x * AC.x)} + ${fr(AB.y * AC.y)} = ${fr(prodAB)}. Le produit est nul : l’angle en A est droit, et c’est démontré, pas constaté.`}
                explainFor={(n) =>
                  n === produitCoordonnees(B, C)
                    ? 'Tu as multiplié les coordonnées des POINTS. Il faut d’abord fabriquer les deux vecteurs par arrivée − départ, puis les multiplier.'
                    : null
                }
                solved={q2}
                onAnswered={() => setQ2(true)}
              />
              {q2 && (
                <>
                  <Feedback tone="ok">
                    <strong>{fr(prodAB)}</strong> : l’angle BAC est droit. Le triangle ABC est donc
                    rectangle en A — une propriété de figure obtenue par deux soustractions et deux
                    multiplications.
                  </Feedback>
                  <KnowledgeBrick
                    id="methode-demontrer-orthogonal"
                    variant="new"
                    lead={<>Les quatre gestes que tu viens de faire, dans l’ordre.</>}
                  />
                </>
              )}
            </div>
          ),
        },
        {
          num: 3,
          title: 'Quatre verdicts',
          done: q3,
          content: (
            <BatchChoiceQuestion
              intro={<p>Pour chaque couple, calcule le produit scalaire et conclus.</p>}
              rows={[
                {
                  id: 'v1',
                  label: 'u(2 ; 6) et v(−3 ; 1)',
                  options: ['orthogonaux', 'non orthogonaux'],
                  correct: 0,
                  correction: '2 × (−3) + 6 × 1 = −6 + 6 = 0 → orthogonaux.',
                },
                {
                  id: 'v2',
                  label: 'u(5 ; 1) et v(1 ; 5)',
                  options: ['orthogonaux', 'non orthogonaux'],
                  correct: 1,
                  correction: '5 × 1 + 1 × 5 = 10, non nul → pas orthogonaux, malgré la symétrie des écritures.',
                },
                {
                  id: 'v3',
                  label: 'u(0 ; 4) et v(7 ; 0)',
                  options: ['orthogonaux', 'non orthogonaux'],
                  correct: 0,
                  correction: '0 × 7 + 4 × 0 = 0 → orthogonaux. Le critère fonctionne aussi bien pour une flèche verticale : aucune division n’intervient, donc aucun cas particulier à traiter.',
                },
                {
                  id: 'v4',
                  label: 'u(3 ; −2) et v(4 ; 6)',
                  options: ['orthogonaux', 'non orthogonaux'],
                  correct: 0,
                  correction: '3 × 4 + (−2) × 6 = 12 − 12 = 0 → orthogonaux. Le signe négatif ne change rien à la méthode.',
                },
              ]}
              requires={['regle-orthogonalite', 'methode-demontrer-orthogonal', 'formule-coordonnees-scalaire']}
              feedback={({ allRight }) =>
                allRight ? (
                  <>
                    Aucun de ces verdicts ne se lit sur une figure. Deux multiplications et une
                    addition : c’est tout ce qu’il faut, et c’est une démonstration.
                  </>
                ) : (
                  <>
                    Refais chaque calcul en entier : abscisse × abscisse, PLUS ordonnée × ordonnée.
                    Pour (5 ; 1) et (1 ; 5), la symétrie de l’écriture ne suffit pas — 5 + 5 = 10,
                    pas 0.
                  </>
                )
              }
              solved={q3}
              onAnswered={() => setQ3(true)}
            />
          ),
        },
      ]}
      footer={
        <KnowledgeSnapshot moduleNumber={4}>
          <strong>Et maintenant ?</strong> Une flèche en travers d’une droite en dit plus long
          qu’il n’y paraît : elle suffit à écrire l’équation de cette droite. Module suivant.
        </KnowledgeSnapshot>
      }
    />
  );
}
