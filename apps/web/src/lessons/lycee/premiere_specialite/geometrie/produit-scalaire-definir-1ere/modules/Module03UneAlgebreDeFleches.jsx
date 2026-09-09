import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import ScalaireScene, { TONS } from '../components/ScalaireScene';
import {
  SCENES, symetrie, homogeneite, additivite,
  produitCoordonnees, add, scale, norm, parseSigned, fr, frVec,
} from '../components/scalaireUtils';

/**
 * Module 3 — MANIPULATION : le produit scalaire est une ALGÈBRE.
 *
 * Les trois identités sont CONSTATÉES avant d'être énoncées. À chaque étape,
 * l'élève appuie sur un bouton qui recalcule le membre de droite, lit les deux
 * nombres côte à côte, et c'est SEULEMENT après qu'une brique écrit la règle.
 *
 * Étape 1  SYMÉTRIE — échanger les deux flèches. Le geste est un vrai
 *          échange : la figure change (les couleurs permutent), le nombre non.
 * Étape 2  HOMOGÉNÉITÉ — étirer u au double. La flèche double, le nombre
 *          double : l'élève le VOIT avant qu'on ne l'écrive.
 * Étape 3  ADDITIVITÉ — enchaîner v et w, puis comparer u·(v+w) à u·v + u·w.
 * Étape 4  la règle appliquée : sortir un facteur sans recalculer.
 *
 * CONNAISSANCES AVANT LA DEMANDE : étapes 1-3 geste → constat → briques
 * `regle-symetrie-scalaire`, `regle-bilinearite`, `regle-carre-scalaire` ;
 * étape 4 la demande, désormais légitime.
 *
 * MANIPULATION JAMAIS GELÉE : les trois bascules restent actionnables après
 * validation. Seuls demeurent les verrous d'ANTÉRIORITÉ entre étapes.
 */
export default function Module03UneAlgebreDeFleches() {
  const { u, v, w, k } = SCENES.proprietes;

  const [echange, setEchange] = useState(false);
  const [vus1, setVus1] = useState([false]);
  const [etire, setEtire] = useState(false);
  const [vus2, setVus2] = useState([false]);
  const [q2, setQ2] = useState(false);
  const [somme, setSomme] = useState(false);
  const [vus3, setVus3] = useState([false]);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);

  // Les deux positions de chaque bascule doivent avoir été visitées : c'est la
  // COMPARAISON qui fait la découverte, pas l'état final.
  const done1 = vus1.length >= 2;
  const done2 = vus2.length >= 2 && q2;
  const done3 = vus3.length >= 2 && q3;

  const basculer = (val, liste, setListe, setVal, react, dejaFait) => {
    setVal(val);
    if (liste.includes(val)) return;
    const suivant = [...liste, val];
    setListe(suivant);
    if (!dejaFait && suivant.length >= 2) react?.(true);
  };

  const sym = symetrie(u, v);
  const hom = homogeneite(k, u, v);
  const addi = additivite(u, v, w);
  const vPlusW = add(v, w);
  const kU = scale(u, k);

  const btn = (actif) =>
    `h-11 px-4 rounded-lg text-sm font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
      actif ? 'bg-sky-600 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
    }`;

  /** Deux nombres côte à côte : c'est l'élève qui lit l'égalité, pas le code. */
  const Duo = ({ gaucheLabel, gauche, droiteLabel, droite, actif }) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      <div className="rounded-xl border-2 border-slate-300 bg-white p-3">
        <div className="text-[13px] font-semibold text-slate-700">{gaucheLabel}</div>
        <div className="font-mono text-2xl font-black tabular-nums text-slate-900 mt-1">{fr(gauche)}</div>
      </div>
      <div className={`rounded-xl border-2 p-3 ${actif ? 'border-sky-400 bg-sky-50' : 'border-slate-200 bg-slate-50'}`}>
        <div className="text-[13px] font-semibold text-sky-800">{droiteLabel}</div>
        <div className="font-mono text-2xl font-black tabular-nums text-sky-900 mt-1">
          {actif ? fr(droite) : '?'}
        </div>
      </div>
    </div>
  );

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="Une algèbre de flèches"
      moduleSubtitle="Échanger, étirer, enchaîner — et regarder ce que devient le nombre"
      estimatedTime="12 min"
      brief={{
        tag: 'Manipulation',
        title: 'Peut-on calculer avec u·v ?',
        tone: 'indigo',
        body: (
          <p>
            On sait le calculer. Reste à savoir s’il se manipule comme un produit ordinaire : peut-on
            échanger les deux flèches ? sortir un facteur ? couper une somme en deux ? À chaque
            fois : d’abord le geste, ensuite la règle.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Échanger les deux flèches',
          subtitle: 'Appuie sur le bouton pour prendre les deux vecteurs dans l’autre ordre, et compare les deux nombres.',
          done: done1,
          content: (kit) => (
            <div className="space-y-3">
              <ScalaireScene
                fleches={
                  echange
                    ? [
                        { id: 'a', v, color: TONS.u, nom: 'la première prise : v' },
                        { id: 'b', v: u, color: TONS.v, nom: 'la seconde : u' },
                      ]
                    : [
                        { id: 'a', v: u, color: TONS.u, nom: 'la première prise : u' },
                        { id: 'b', v, color: TONS.v, nom: 'la seconde : v' },
                      ]
                }
              />
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  className={btn(echange)}
                  onClick={() => basculer(!echange, vus1, setVus1, setEchange, kit.react, done1)}
                >
                  {echange ? '↩ remettre u en premier' : '⇄ échanger les deux flèches'}
                </button>
                <span className="text-[13px] text-slate-600">
                  ordre actuel : <strong>{echange ? 'v · u' : 'u · v'}</strong>
                </span>
              </div>
              <Duo
                gaucheLabel="u · v"
                gauche={sym.gauche}
                droiteLabel="v · u"
                droite={sym.droite}
                actif={done1}
              />
              {done1 ? (
                <>
                  <Feedback tone="ok">
                    Le même nombre : <strong>{fr(sym.gauche)}</strong> dans les deux sens. Ce n’est
                    pas un hasard — dans x·x′ + y·y′, échanger les deux vecteurs échange les deux
                    facteurs de chaque produit, et une multiplication ne s’en aperçoit pas.
                  </Feedback>
                  <KnowledgeBrick
                    id="regle-symetrie-scalaire"
                    variant="new"
                    lead={<>Ce que ton échange vient de montrer. Rebascule en le lisant.</>}
                  />
                </>
              ) : (
                <Feedback tone="info">
                  Appuie sur le bouton pour voir les deux ordres. Le second compteur ne se remplit
                  qu’une fois les deux essayés.
                </Feedback>
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'Étirer une flèche',
          subtitle: `Double la première flèche : elle devient ${frVec(kU)}. Que devient le nombre ?`,
          done: done2,
          content: (kit) => (
            <div className="space-y-3">
              <ScalaireScene
                fleches={[
                  { id: 'u', v: etire ? kU : u, color: TONS.u, nom: etire ? `${k}u` : 'u' },
                  { id: 'v', v, color: TONS.v, nom: 'v' },
                  ...(etire ? [{ id: 'u0', v: u, color: TONS.u, nom: 'u (avant)', dashed: true, width: 2 }] : []),
                ]}
              />
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  className={btn(etire)}
                  onClick={() => basculer(!etire, vus2, setVus2, setEtire, kit.react, vus2.length >= 2)}
                  disabled={!done1}
                >
                  {etire ? `↩ revenir à u` : `⤢ étirer u au double (${k}u)`}
                </button>
                <span className="text-[13px] text-slate-600">
                  première flèche : <strong>{frVec(etire ? kU : u)}</strong>, longueur{' '}
                  <strong>{fr(norm(etire ? kU : u))}</strong>
                </span>
              </div>
              <Duo
                gaucheLabel="u · v"
                gauche={produitCoordonnees(u, v)}
                droiteLabel={`(${k}u) · v`}
                droite={hom.gauche}
                actif={vus2.length >= 2}
              />
              {vus2.length >= 2 && (
                <NumericQuestion
                  prompt={<>La flèche a doublé. Par combien le nombre a-t-il été multiplié ?</>}
                  expected={k}
                  parse={parseSigned}
                  display={fr(k)}
                  requires={['regle-produit-reel', 'formule-coordonnees-scalaire']}
                  explain={`${fr(produitCoordonnees(u, v))} est devenu ${fr(hom.gauche)} : le nombre a été multiplié par ${fr(k)}, exactement comme la flèche. Le facteur SORT du produit scalaire.`}
                  explainFor={(n) =>
                    n === k * k
                      ? `Le facteur ne sort qu’UNE fois : seule la première flèche a été étirée. C’est (${k}u)·(${k}v) qui vaudrait ${fr(k * k)} fois u·v.`
                      : null
                  }
                  solved={q2}
                  onAnswered={() => setQ2(true)}
                />
              )}
              {done2 && (
                <Feedback tone="ok">
                  Une flèche {k} fois plus longue, un nombre {k} fois plus grand. Le facteur traverse
                  le produit scalaire sans y rester coincé.
                </Feedback>
              )}
            </div>
          ),
        },
        {
          num: 3,
          title: 'Enchaîner deux flèches',
          subtitle: `Ajoute w à v : la somme vaut ${frVec(vPlusW)}. Compare u·(v + w) à u·v + u·w.`,
          done: done3,
          content: (kit) => (
            <div className="space-y-3">
              <ScalaireScene
                fleches={[
                  { id: 'u', v: u, color: TONS.u, nom: 'u' },
                  { id: 'v', v, color: TONS.v, nom: 'v' },
                  { id: 'w', v: w, color: TONS.w, nom: 'w' },
                  ...(somme ? [{ id: 's', v: vPlusW, color: TONS.somme, nom: 'v + w' }] : []),
                ]}
              />
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  className={btn(somme)}
                  onClick={() => basculer(!somme, vus3, setVus3, setSomme, kit.react, vus3.length >= 2)}
                  disabled={!done2}
                >
                  {somme ? '↩ masquer la somme' : '➕ enchaîner v et w'}
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-center">
                <div className="rounded-lg border border-slate-200 bg-white px-2 py-2">
                  <div className="text-[13px] text-slate-500">u · v</div>
                  <div className="font-mono font-bold tabular-nums text-slate-900">{fr(produitCoordonnees(u, v))}</div>
                </div>
                <div className="rounded-lg border border-slate-200 bg-white px-2 py-2">
                  <div className="text-[13px] text-slate-500">u · w</div>
                  <div className="font-mono font-bold tabular-nums text-slate-900">{fr(produitCoordonnees(u, w))}</div>
                </div>
                <div className={`rounded-lg border-2 px-2 py-2 ${somme ? 'border-emerald-400 bg-emerald-50' : 'border-slate-200 bg-slate-50'}`}>
                  <div className="text-[13px] text-emerald-800">u · (v + w)</div>
                  <div className="font-mono font-black tabular-nums text-emerald-900">
                    {vus3.length >= 2 ? fr(addi.gauche) : '?'}
                  </div>
                </div>
              </div>
              {vus3.length >= 2 && (
                <TapQuestion
                  prompt={`Les trois nombres sont ${fr(produitCoordonnees(u, v))}, ${fr(produitCoordonnees(u, w))} et ${fr(addi.gauche)}. Que constates-tu ?`}
                  options={[
                    'Le troisième est la SOMME des deux premiers : u·(v + w) = u·v + u·w',
                    'Le troisième est le PRODUIT des deux premiers',
                    'Le troisième est la différence des deux premiers',
                    'Les trois nombres n’ont aucun lien',
                  ]}
                  correct={0}
                  cols={1}
                  requires={['regle-somme', 'formule-coordonnees-scalaire', 'regle-symetrie-scalaire']}
                  explain={`${fr(produitCoordonnees(u, v))} + ${fr(produitCoordonnees(u, w))} = ${fr(addi.droite)}, qui est bien ${fr(addi.gauche)}. Le produit scalaire se distribue sur la somme, exactement comme une multiplication ordinaire.`}
                  explainWrong={`Fais l’addition : ${fr(produitCoordonnees(u, v))} + ${fr(produitCoordonnees(u, w))} = ${fr(addi.droite)}. Leur produit vaudrait ${fr(produitCoordonnees(u, v) * produitCoordonnees(u, w))}, et leur différence ${fr(produitCoordonnees(u, v) - produitCoordonnees(u, w))} : ni l’un ni l’autre ne tombe juste.`}
                  solved={q3}
                  onAnswered={() => setQ3(true)}
                />
              )}
              {done3 && (
                <>
                  <Feedback tone="ok">
                    Découper une somme, sortir un facteur : ces deux libertés portent un seul nom.
                  </Feedback>
                  <KnowledgeBrick
                    id="regle-bilinearite"
                    variant="new"
                    lead={<>Les deux règles que tes deux gestes viennent d’établir, avec le piège du facteur.</>}
                  />
                </>
              )}
            </div>
          ),
        },
        {
          num: 4,
          title: 'Une flèche multipliée par elle-même',
          done: q4,
          content: (
            <div className="space-y-3">
              <KnowledgeBrick
                id="regle-carre-scalaire"
                variant="new"
                lead={<>Le cas particulier le plus utile de tout le chapitre : les deux flèches sont la même.</>}
              />
              <NumericQuestion
                prompt={<>Pour u(4 ; 3), qui a pour longueur 5, combien vaut <strong>u · u</strong> ?</>}
                expected={25}
                parse={parseSigned}
                display="25"
                requires={['regle-carre-scalaire', 'formule-coordonnees-scalaire', 'formule-norme']}
                explain="Par les coordonnées : 4 × 4 + 3 × 3 = 16 + 9 = 25. Par la longueur : ‖u‖² = 5² = 25. Les deux voies s’accordent, comme toujours."
                explainFor={(n) =>
                  n === 5
                    ? 'C’est ‖u‖, la longueur elle-même. u·u en est le CARRÉ : 5² = 25.'
                    : n === 7
                    ? 'C’est 4 + 3. Il faut deux multiplications : 4 × 4 + 3 × 3.'
                    : null
                }
                solved={q4}
                onAnswered={() => setQ4(true)}
              />
              {q4 && (
                <Feedback tone="ok">
                  u·u = ‖u‖². C’est ce pont entre produit scalaire et longueur qui rendra les
                  démonstrations possibles : une distance devient un calcul de produit scalaire.
                </Feedback>
              )}
            </div>
          ),
        },
      ]}
      footer={
        <KnowledgeSnapshot moduleNumber={3}>
          <strong>Et maintenant ?</strong> Tu sais calculer et transformer. Reste à s’en servir
          pour ce que le module 1 promettait : démontrer un angle droit sans rapporteur.
        </KnowledgeSnapshot>
      }
    />
  );
}
