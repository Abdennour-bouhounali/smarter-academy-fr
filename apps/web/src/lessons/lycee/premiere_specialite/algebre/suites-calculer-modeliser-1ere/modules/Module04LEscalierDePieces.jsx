import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import EscalierGauss from '../components/EscalierGauss';
import {
  ESCALIERS, escalier, sommeArithmetique, nthArithmetic, parseNombre, fr,
} from '../components/sommesUtils';

/**
 * Module 4 — MANIPULATION : la somme d'une suite arithmétique (P3).
 *
 * Étape 1  L'ESCALIER PAIR, repris du module 1 mais poussé jusqu'à la formule.
 *          Trois paires à 25 : pourquoi toutes égales ? Parce que d'un cran à
 *          gauche on ajoute la raison et d'un cran à droite on la retranche.
 *          → brique `appariement-de-gauss`.
 * Étape 2  L'ESCALIER IMPAIR — le cas que la leçon NE CACHE PAS. Sept colonnes,
 *          trois paires, et une colonne centrale. Elle vaut exactement la
 *          moitié d'une paire : c'est ce qui rend la division par 2 nécessaire
 *          plutôt que suspecte. → brique `colonne-centrale-impaire`.
 * Étape 3  La formule, et le COMPTE des termes : de u(0) à u(n) il y a n + 1
 *          termes. → brique `mem-somme-arithmetique`.
 * Étape 4  L'appliquer sur une somme qu'aucun escalier ne peut dessiner : les
 *          vingt et un premiers termes.
 *
 * TOUTES LES VALEURS SONT RECALCULÉES par `sommesUtils.test.js` — l'égalité de
 * toutes les paires est BALAYÉE sur 2 805 configurations, et la colonne
 * centrale est vérifiée valoir la demi-paire dans tous les cas impairs.
 *
 * MANIPULATION JAMAIS GELÉE : les deux escaliers restent appariables après
 * validation, et « Tout défaire » permet de recommencer autant qu'on veut.
 * Seul demeure le verrou d'ANTÉRIORITÉ de l'étape 2 sur l'étape 1.
 */
export default function Module04LEscalierDePieces() {
  const PAIR = escalier(ESCALIERS[0]);      // 6 colonnes, 3 paires à 25, somme 75
  const IMPAIR = escalier(ESCALIERS[1]);    // 7 colonnes, 3 paires à 28 + centre 14, somme 98

  const [pairesA, setPairesA] = useState([]);
  const [okA, setOkA] = useState(false);
  const [q1, setQ1] = useState(false);
  const [pairesB, setPairesB] = useState([]);
  const [okB, setOkB] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);

  const done1 = okA && q1;
  const done2 = okB && q2;
  const done3 = q3;

  // La somme finale de l'étape 4 : les 21 premiers termes de la même suite.
  const RANG_FINAL = 20;
  const sommeFinale = sommeArithmetique(PAIR.u0, PAIR.r, RANG_FINAL);
  const dernierFinal = nthArithmetic(PAIR.u0, PAIR.r, RANG_FINAL);

  const steps = [
    {
      num: 1,
      title: 'Pourquoi toutes les paires sont égales',
      subtitle:
        'Apparie la première colonne avec la dernière, la deuxième avec l’avant-dernière. Les totaux s’inscrivent au fur et à mesure.',
      done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <EscalierGauss
            list={PAIR.list}
            label={`${fr(PAIR.nbTermes)} colonnes — nombre PAIR de colonnes`}
            paires={pairesA}
            onChangePaires={setPairesA}
            onComplet={() => { if (!okA) { setOkA(true); kit.react?.(true); } }}
          />
          <TapQuestion
            prompt={`Les trois paires font toutes ${fr(PAIR.totalPaire)}. Pourquoi n’est-ce pas un hasard ?`}
            options={[
              'Parce qu’en avançant d’un cran à gauche on ajoute la raison, et en reculant d’un cran à droite on la retranche : les deux se compensent',
              'Parce que les colonnes ont été choisies exprès pour que ça tombe juste',
              'Parce que toutes les colonnes ont la même hauteur',
              'Parce que la somme des six colonnes vaut trois fois cette valeur',
            ]}
            correct={0}
            cols={1}
            requires={['suite-arithmetique', 'cout-du-pas-a-pas']}
            explain={`De la colonne n°0 à la n°1 on ajoute ${fr(PAIR.r)} ; de la n°5 à la n°4 on retranche ${fr(PAIR.r)}. Le total de la paire ne bouge donc pas. C’est vrai pour n’importe quelle suite arithmétique, pas seulement pour celle-ci.`}
            explainWrong={`Les colonnes n’ont pas la même hauteur — elles vont de ${fr(PAIR.list[0])} à ${fr(PAIR.list[PAIR.list.length - 1])}. Et « la somme vaut trois fois cette valeur » est la CONSÉQUENCE, pas la cause : c’est parce que les paires sont égales qu’on peut multiplier.`}
            solved={q1}
            onAnswered={() => setQ1(true)}
          />
          {done1 && (
            <>
              <Feedback tone="ok">
                Trois paires à {fr(PAIR.totalPaire)} : la somme vaut {fr(PAIR.paires.length)} ×{' '}
                {fr(PAIR.totalPaire)} = <strong>{fr(PAIR.somme)}</strong>. Six additions remplacées
                par une multiplication.
              </Feedback>
              <KnowledgeBrick
                id="appariement-de-gauss"
                variant="new"
                lead={<>Ce que ton appariement vient de montrer, écrit. Puis défais et recommence si tu veux.</>}
              />
            </>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Et s’il reste une colonne seule ?',
      subtitle:
        'Une colonne de plus, et le compte devient impair. Apparie quand même — et regarde ce qui reste.',
      done: done2,
      content: (kit) => (
        <div className="space-y-3">
          <EscalierGauss
            list={IMPAIR.list}
            label={`${fr(IMPAIR.nbTermes)} colonnes — nombre IMPAIR de colonnes`}
            paires={pairesB}
            onChangePaires={setPairesB}
            disabled={!done1}
            onComplet={() => { if (!okB) { setOkB(true); kit.react?.(true); } }}
          />
          <NumericQuestion
            prompt={
              <>
                Trois paires à {fr(IMPAIR.totalPaire)}, plus la colonne restée seule. Combien font
                les <strong>{fr(IMPAIR.nbTermes)} colonnes</strong> en tout ?
              </>
            }
            expected={IMPAIR.somme}
            parse={parseNombre}
            display={fr(IMPAIR.somme)}
            requires={['appariement-de-gauss']}
            explain={`3 × ${fr(IMPAIR.totalPaire)} + ${fr(IMPAIR.centre.valeur)} = ${fr(3 * IMPAIR.totalPaire)} + ${fr(IMPAIR.centre.valeur)} = ${fr(IMPAIR.somme)}. Et la colonne seule vaut ${fr(IMPAIR.centre.valeur)}, soit exactement ${fr(IMPAIR.totalPaire)} ÷ 2 : c’est une DEMI-paire.`}
            explainFor={(n) =>
              n === 3 * IMPAIR.totalPaire
                ? `${fr(3 * IMPAIR.totalPaire)} oublie la colonne restée seule, qui vaut ${fr(IMPAIR.centre.valeur)}.`
                : n === PAIR.somme
                ? `${fr(PAIR.somme)} était le total de l’escalier précédent, à ${fr(PAIR.nbTermes)} colonnes. Ici il y en a une de plus.`
                : n === 4 * IMPAIR.totalPaire
                ? `${fr(4 * IMPAIR.totalPaire)} compterait la colonne centrale comme une paire entière. Elle n’en vaut que la moitié.`
                : null
            }
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
          {done2 && (
            <>
              <Feedback tone="ok">
                La colonne centrale vaut <strong>{fr(IMPAIR.centre.valeur)}</strong>, soit{' '}
                {fr(IMPAIR.totalPaire)} ÷ 2. Autrement dit : {fr(IMPAIR.nbTermes)} colonnes valent{' '}
                {fr(IMPAIR.nbTermes)} <em>demi-paires</em>, c’est-à-dire {fr(IMPAIR.nbTermes)} ×{' '}
                {fr(IMPAIR.totalPaire)} ÷ 2 = <strong>{fr(IMPAIR.somme)}</strong>. Le cas impair ne
                casse rien — il explique la division par 2.
              </Feedback>
              <KnowledgeBrick
                id="colonne-centrale-impaire"
                variant="new"
                lead={<>Pourquoi la colonne seule ne pose aucun problème.</>}
              />
            </>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'La formule, et le piège du compte',
      done: done3,
      content: () => (
        <div className="space-y-3">
          <div className="rounded-2xl border-2 border-emerald-200 bg-emerald-50/40 p-3">
            <div className="text-[13px] font-semibold text-emerald-900">
              Les deux escaliers, la même écriture
            </div>
            <p className="mt-1.5 font-mono text-sm leading-relaxed text-slate-800">
              {fr(PAIR.nbTermes)} colonnes × ({fr(PAIR.list[0])} + {fr(PAIR.list[PAIR.nbTermes - 1])}) ÷ 2 ={' '}
              <strong>{fr(PAIR.somme)}</strong>
              <br />
              {fr(IMPAIR.nbTermes)} colonnes × ({fr(IMPAIR.list[0])} + {fr(IMPAIR.list[IMPAIR.nbTermes - 1])}) ÷ 2 ={' '}
              <strong>{fr(IMPAIR.somme)}</strong>
            </p>
          </div>
          <TapQuestion
            prompt="On additionne les termes de u(0) jusqu’à u(20). Combien de termes cela fait-il ?"
            options={['21', '20', '19', '22']}
            cols={4}
            correct={0}
            requires={['appariement-de-gauss', 'colonne-centrale-impaire', 'terme-rang-arithmetique']}
            explain="Les rangs 0, 1, 2, …, 20 : cela fait 21 termes, parce que le rang 0 en fait partie. C’est le nombre de CASES, pas le nombre de PAS — le module 2 comptait les pas, la somme compte les cases. Confondre les deux est l’erreur centrale de cette formule."
            explainWrong="Répondre 20, c’est avoir compté les pas (il y en a bien 20) au lieu des cases. Le rang 0 occupe une case comme les autres."
            solved={done3}
            onAnswered={() => setQ3(true)}
          />
          {done3 && (
            <KnowledgeBrick
              id="mem-somme-arithmetique"
              variant="new"
              lead={<>La formule et son seul piège, sur une carte.</>}
            />
          )}
        </div>
      ),
    },
    {
      num: 4,
      title: 'Une somme qu’aucun escalier ne peut dessiner',
      done: q4,
      content: (
        <div className="space-y-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-sm text-slate-700">
              Toujours la même suite : u(0) = {fr(PAIR.u0)}, raison {fr(PAIR.r)}. On veut la somme
              de <strong>u(0) jusqu’à u({fr(RANG_FINAL)})</strong> — vingt et une colonnes, qui ne
              tiendraient plus à l’écran.
            </p>
            <p className="mt-1 font-mono text-[13px] text-slate-600">
              premier terme {fr(PAIR.u0)} · dernier terme u({fr(RANG_FINAL)}) ={' '}
              {fr(PAIR.u0)} + {fr(RANG_FINAL)} × {fr(PAIR.r)} = {fr(dernierFinal)}
            </p>
          </div>
          <NumericQuestion
            prompt={<>Combien vaut cette somme ?</>}
            expected={sommeFinale}
            parse={parseNombre}
            display={fr(sommeFinale)}
            requires={['mem-somme-arithmetique', 'terme-rang-arithmetique']}
            explain={`${fr(RANG_FINAL + 1)} termes × (${fr(PAIR.u0)} + ${fr(dernierFinal)}) ÷ 2 = ${fr(RANG_FINAL + 1)} × ${fr(PAIR.u0 + dernierFinal)} ÷ 2 = ${fr(sommeFinale)}.`}
            explainFor={(n) =>
              n === (RANG_FINAL * (PAIR.u0 + dernierFinal)) / 2
                ? `${fr((RANG_FINAL * (PAIR.u0 + dernierFinal)) / 2)} compte ${fr(RANG_FINAL)} termes au lieu de ${fr(RANG_FINAL + 1)} : le rang 0 a été oublié.`
                : n === dernierFinal
                ? `${fr(dernierFinal)} est le DERNIER terme, pas la somme de tous.`
                : n === (RANG_FINAL + 1) * (PAIR.u0 + dernierFinal)
                ? `${fr((RANG_FINAL + 1) * (PAIR.u0 + dernierFinal))} oublie la division par 2 : on a compté chaque paire deux fois.`
                : null
            }
            solved={q4}
            onAnswered={() => setQ4(true)}
          />
          {q4 && (
            <Feedback tone="ok">
              Vingt et une colonnes additionnées sans en dessiner aucune. Le geste d’appariement
              n’était pas un truc de dessin : c’est la formule elle-même.
            </Feedback>
          )}
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(4)}
      moduleNumber={4}
      moduleTitle="L’escalier de pièces"
      moduleSubtitle="Toutes les paires ont la même hauteur — et la colonne restée seule vaut une demi-paire"
      estimatedTime="12 min"
      brief={{
        tag: 'Manipulation',
        title: 'Replier une longue addition',
        tone: 'indigo',
        body: (
          <p>
            Tu as vu trois paires tomber sur le même total. Reste à comprendre pourquoi c’est
            inévitable, ce qui se passe quand une colonne reste seule, et comment additionner vingt
            et un termes sans en dessiner un seul.
          </p>
        ),
      }}
      steps={steps}
      footer={
        <KnowledgeSnapshot moduleNumber={4}>
          <strong>Et si l’on multiplie ?</strong> Apparier ne marche plus : les paires d’une suite
          géométrique n’ont aucune raison d’être égales. Module suivant : l’autre astuce.
        </KnowledgeSnapshot>
      }
    />
  );
}
