import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import TelescopeLab from '../components/TelescopeLab';
import {
  CAS_SOMMES_GEO, telescopage, sommeGeometrique, sommeTermes, terms, geometric,
  nthGeometric, parseNombre, fr,
} from '../components/sommesUtils';

/**
 * Module 5 — PRATIQUE : la somme d'une suite géométrique (P4).
 *
 * LA FORMULE EST DÉCOUVERTE, PAS DONNÉE. Le chemin est le télescopage :
 *
 * Étape 1  d'abord, constater que l'APPARIEMENT NE MARCHE PLUS : sur
 *          1, 2, 4, 8, 16, 32, premier + dernier vaut 33 et deuxième +
 *          avant-dernier vaut 18. La méthode du module 4 tombe, et il en faut
 *          une autre.
 * Étape 2  LE TÉLESCOPAGE, piloté étape par étape : écrire qS, la décaler,
 *          retrancher. Tout le milieu s'annule. → brique `telescopage`.
 * Étape 3  résoudre en S, et en déduire la formule fermée. L'exposant est
 *          n + 1 — le NOMBRE DE TERMES, pas le rang.
 *          → brique `mem-somme-geometrique`.
 * Étape 4  l'appliquer sur une raison plus petite que 1, où la somme reste
 *          bornée alors même qu'on ajoute des termes.
 *
 * LES DEUX LIGNES SONT DÉRIVÉES de `telescopage`, dont le test BALAIE
 * u0 ∈ {1, 2, 16, 400, −3} × q ∈ {−2 ; 0,5 ; 0,6 ; 0,96 ; 1,05 ; 2 ; 3 ; 5} ×
 * n ≤ 10 : S − qS vaut u0 − u0·q^(n+1) dans tous les cas.
 *
 * MANIPULATION JAMAIS GELÉE : l'instrument se remonte et se redescend à volonté
 * après validation. Seul demeure le verrou d'ANTÉRIORITÉ de l'étape 2 sur la 1.
 */
export default function Module05LaSommeQuiSeTelescope() {
  const A = CAS_SOMMES_GEO[0];   // u(0) = 1, q = 2, n = 5 → S = 63
  const B = CAS_SOMMES_GEO[2];   // u(0) = 16, q = 0,5, n = 4 → S = 31

  const [q1, setQ1] = useState(false);
  const [etapeA, setEtapeA] = useState(0);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const [etapeB, setEtapeB] = useState(0);
  const [q4, setQ4] = useState(false);

  const done1 = q1;
  const done2 = etapeA >= 3 && q2;
  const done3 = q3;

  const listeA = terms(geometric(A.u0, A.q), A.n);
  const tA = telescopage(A.u0, A.q, A.n);
  const sommeA = sommeGeometrique(A.u0, A.q, A.n);
  const sommeB = sommeGeometrique(B.u0, B.q, B.n);

  // Les deux « paires » qui montrent que l'appariement échoue — CALCULÉES.
  const paireBords = listeA[0] + listeA[listeA.length - 1];
  const paireInterne = listeA[1] + listeA[listeA.length - 2];

  const steps = [
    {
      num: 1,
      title: 'L’appariement ne marche plus',
      subtitle:
        'Reprends le geste du module précédent sur une suite qui multiplie, et regarde les totaux.',
      done: done1,
      content: () => (
        <div className="space-y-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-sm text-slate-700">
              Les {fr(listeA.length)} premiers termes de {A.label} :
            </p>
            <p className="mt-1 font-mono text-base font-black tabular-nums text-slate-900">
              {listeA.map(fr).join(' + ')}
            </p>
            <ul className="mt-2 space-y-1 font-mono text-[13px] text-slate-700">
              <li>
                première + dernière : {fr(listeA[0])} + {fr(listeA[listeA.length - 1])} ={' '}
                <strong>{fr(paireBords)}</strong>
              </li>
              <li>
                deuxième + avant-dernière : {fr(listeA[1])} + {fr(listeA[listeA.length - 2])} ={' '}
                <strong>{fr(paireInterne)}</strong>
              </li>
            </ul>
          </div>
          <TapQuestion
            prompt="Que peut-on conclure ?"
            options={[
              `Les paires ne sont pas égales (${fr(paireBords)} et ${fr(paireInterne)}) : la méthode de l’escalier ne s’applique pas ici`,
              'Les paires sont égales, mais il faut diviser par 2 autrement',
              'Il faut apparier autrement, en prenant les termes deux par deux dans l’ordre',
              'La somme d’une suite géométrique ne se calcule pas',
            ]}
            correct={0}
            cols={1}
            requires={['appariement-de-gauss', 'suite-geometrique']}
            explain={`${fr(paireBords)} d’un côté, ${fr(paireInterne)} de l’autre : l’égalité des paires reposait sur le fait qu’un cran à gauche AJOUTE la raison et un cran à droite la RETRANCHE. Ici on multiplie et on divise, et ça ne se compense pas. Il faut donc autre chose — et cette somme se calcule, autrement.`}
            explainWrong="Additionner les termes deux par deux dans l’ordre ne donne pas non plus des totaux égaux : 1 + 2 = 3, puis 4 + 8 = 12. Aucun appariement ne sauvera la méthode précédente."
            solved={done1}
            onAnswered={() => setQ1(true)}
          />
          {done1 && (
            <Feedback tone="ok">
              Il faut une autre idée. La voici, et elle est étrange : on va{' '}
              <strong>multiplier la somme entière par la raison</strong>.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Multiplier la somme par la raison',
      subtitle:
        'Trois gestes : écrire qS, la décaler d’un cran pour aligner les termes égaux, puis retrancher. Va jusqu’au bout.',
      done: done2,
      content: (kit) => (
        <div className="space-y-3">
          <TelescopeLab
            u0={A.u0}
            q={A.q}
            n={A.n}
            etape={etapeA}
            onChangeEtape={(v) => {
              setEtapeA(v);
              if (!done2 && v >= 3 && q2) kit.react?.(true);
            }}
            disabled={!done1}
          />
          <TapQuestion
            prompt="Pourquoi presque tous les termes disparaissent-ils ?"
            options={[
              'Parce que chaque nombre de la ligne S, sauf le premier, se retrouve identique dans la ligne qS : en retranchant, ils s’effacent deux à deux',
              'Parce que les nombres du milieu valent zéro',
              'Parce que la raison vaut 2, et que 2 est un nombre pair',
              'Parce que les deux lignes ont la même longueur',
            ]}
            correct={0}
            cols={1}
            requires={['suite-geometrique', 'terme-rang-geometrique']}
            explain={`Multiplier un nombre de la ligne par la raison donne le SUIVANT : la ligne qS est donc la ligne S décalée d’un cran. Chacun des ${fr(tA.annules)} nombres du milieu apparaît alors dans les deux lignes, et la soustraction les efface. Il ne survit que ${fr(tA.debut)} (le premier de S) et le dernier de qS.`}
            explainWrong={`Aucun nombre ne vaut zéro : ils vont de ${fr(listeA[0])} à ${fr(listeA[listeA.length - 1])}. Et les deux lignes n’ont PAS la même longueur une fois décalées — c’est justement ce décalage qui fait s’effacer le milieu.`}
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
          {done2 && (
            <>
              <Feedback tone="ok">
                {fr(tA.annules)} nombres effacés, deux survivants. Cette manœuvre porte un nom, et
                elle marche pour toute raison différente de 1.
              </Feedback>
              <KnowledgeBrick
                id="telescopage"
                variant="new"
                lead={<>Le geste que tu viens de piloter, écrit. Puis remonte et redescends les étapes à volonté.</>}
              />
            </>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Résoudre en S',
      done: done3,
      content: () => (
        <div className="space-y-3">
          <div className="rounded-2xl border-2 border-rose-200 bg-rose-50/40 p-3">
            <div className="text-[13px] font-semibold text-rose-900">Le calcul, ligne à ligne</div>
            <p className="mt-1.5 font-mono text-sm leading-relaxed text-slate-800">
              S − {fr(A.q)}S = {fr(tA.debut)} − {fr(Math.abs(tA.fin))}
              <br />
              S × (1 − {fr(A.q)}) = {fr(tA.debut)} − {fr(Math.abs(tA.fin))}
              <br />
              S = ({fr(tA.debut)} − {fr(Math.abs(tA.fin))}) ÷ (1 − {fr(A.q)}) ={' '}
              <strong>{fr(sommeA)}</strong>
            </p>
            <p className="mt-1.5 text-[13px] text-slate-600">
              vérification, terme à terme : {listeA.map(fr).join(' + ')} ={' '}
              {fr(sommeTermes(listeA))}
            </p>
          </div>
          <TapQuestion
            prompt={`Dans la formule générale, le nombre ${fr(Math.abs(tA.fin))} s’écrit u(0) × q élevé à une certaine puissance. Laquelle ?`}
            options={[
              `n + 1, c’est-à-dire ${fr(A.n + 1)} ici — le NOMBRE de termes`,
              `n, c’est-à-dire ${fr(A.n)} ici — le rang du dernier terme`,
              `n − 1, c’est-à-dire ${fr(A.n - 1)} ici`,
              'Aucune : ce nombre ne dépend pas de n',
            ]}
            correct={0}
            cols={1}
            requires={['telescopage', 'terme-rang-geometrique', 'exposant']}
            explain={`Le dernier terme de S est u(0) × q^${fr(A.n)} ; en le multipliant encore par q pour obtenir la ligne qS, on arrive à u(0) × q^${fr(A.n + 1)} = ${fr(Math.abs(tA.fin))}. L’exposant est donc n + 1, c’est-à-dire le nombre de termes additionnés — le même compte qu’au module 4, sous une autre forme.`}
            explainWrong={`Avec l’exposant ${fr(A.n)} on obtiendrait ${fr(nthGeometric(A.u0, A.q, A.n))}, qui est le dernier terme de S et non celui de qS. C’est un cran de trop peu.`}
            solved={done3}
            onAnswered={() => setQ3(true)}
          />
          {done3 && (
            <KnowledgeBrick
              id="mem-somme-geometrique"
              variant="new"
              lead={<>La formule que ton télescopage vient de produire, et le cas q = 1 qu’elle exclut.</>}
            />
          )}
        </div>
      ),
    },
    {
      num: 4,
      title: 'Une raison plus petite que 1',
      subtitle:
        'Même instrument, autre suite : on ajoute des termes de plus en plus petits. Va jusqu’au bout du télescopage.',
      done: q4,
      content: () => (
        <div className="space-y-3">
          <TelescopeLab
            u0={B.u0}
            q={B.q}
            n={B.n}
            etape={etapeB}
            onChangeEtape={setEtapeB}
            disabled={!done3}
          />
          <NumericQuestion
            prompt={
              <>
                Combien vaut <strong>{terms(geometric(B.u0, B.q), B.n).map(fr).join(' + ')}</strong> ?
              </>
            }
            expected={sommeB}
            parse={parseNombre}
            display={fr(sommeB)}
            requires={['mem-somme-geometrique', 'telescopage']}
            explain={`${fr(B.u0)} × (1 − 0,5⁵) ÷ (1 − 0,5) = ${fr(B.u0)} × (1 − ${fr(B.q ** (B.n + 1))}) ÷ ${fr(1 - B.q)} = ${fr(sommeB)}. On peut vérifier à la main : ${terms(geometric(B.u0, B.q), B.n).map(fr).join(' + ')} = ${fr(sommeB)}.`}
            explainFor={(n) =>
              n === 2 * B.u0
                ? `${fr(2 * B.u0)} est la valeur dont la somme s’approche si l’on continue indéfiniment — elle ne l’atteint jamais. Avec ${fr(B.n + 1)} termes, elle vaut ${fr(sommeB)}.`
                : n === nthGeometric(B.u0, B.q, B.n)
                ? `${fr(nthGeometric(B.u0, B.q, B.n))} est le DERNIER terme, pas la somme.`
                : n === B.u0 * (1 - B.q ** (B.n + 1))
                ? `${fr(B.u0 * (1 - B.q ** (B.n + 1)))} oublie la division par (1 − q) = ${fr(1 - B.q)}.`
                : null
            }
            solved={q4}
            onAnswered={() => setQ4(true)}
          />
          {q4 && (
            <Feedback tone="ok">
              Chaque terme ajouté est deux fois plus petit que le précédent : la somme grandit de
              moins en moins et reste sous <strong>{fr(2 * B.u0)}</strong>, sans jamais l’atteindre.
              Ajouter des nombres n’oblige pas à dépasser toutes les bornes.
            </Feedback>
          )}
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(5)}
      moduleNumber={5}
      moduleTitle="La somme qui se télescope"
      moduleSubtitle="Multiplier la somme entière par la raison — et regarder tout le milieu disparaître"
      estimatedTime="11 min"
      brief={{
        tag: 'Atelier',
        title: 'Une astuce qui paraît absurde',
        tone: 'indigo',
        body: (
          <p>
            L’appariement échoue quand on multiplie. On va donc faire quelque chose d’apparemment
            inutile : multiplier la somme entière par la raison, puis la retrancher à elle-même.
          </p>
        ),
      }}
      steps={steps}
      footer={
        <KnowledgeSnapshot moduleNumber={5}>
          <strong>À quoi ça sert ?</strong> Tu sais atteindre un rang et sommer, dans les deux
          familles. Module suivant : trois situations réelles, et ce que ces calculs leur font dire.
        </KnowledgeSnapshot>
      }
    />
  );
}
