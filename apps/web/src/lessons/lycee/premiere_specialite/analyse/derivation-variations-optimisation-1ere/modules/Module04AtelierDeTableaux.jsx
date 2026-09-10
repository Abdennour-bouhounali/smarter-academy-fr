import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { parseDec } from '@smarter-academy/core';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import TableauVariations from '../components/TableauVariations';
import { PARABOLE, CUBE_MAXMIN, TOUJOURS_CROISSANTE, tableauDeSignes, extremums, parseSigned, fr } from '../components/variationsUtils';

/**
 * Module 4 — ATELIER : trois tableaux, trois formes.
 *
 * Étape 1  p(x) = x² − 4x + 1 : UN seul zéro, et le retournement est un creux
 *          (− puis +). C'est l'ordre INVERSE de celui du module 3.
 * Étape 2  q(x) = x³ − 6x² + 9x : deux zéros, et cette fois le retournement
 *          vers le haut arrive EN PREMIER (+ − +, mais sur un intervalle où le
 *          maximum précède le minimum, contrairement au module 3 dont le
 *          domaine était symétrique).
 * Étape 3  r(x) = x³ + 3x : la dérivée 3x² + 3 ne s'annule JAMAIS, parce qu'un
 *          carré ne peut pas valoir −1. Une seule flèche, aucun retournement →
 *          brique `regle-derivee-jamais-nulle`.
 *
 * POURQUOI CE TROISIÈME CAS. Un élève qui n'a vu que des tableaux à
 * retournement croit qu'un tableau EN COMPORTE forcément un, et cherche un zéro
 * là où il n'y en a pas — il finit par en inventer un. Le cas sans zéro est
 * donc pédagogiquement nécessaire, pas décoratif.
 *
 * CONNAISSANCES AVANT LA DEMANDE : les étapes 1 et 2 n'exigent que ce que les
 * modules 2 et 3 ont posé ; l'étape 3 pose sa brique APRÈS le geste qui la rend
 * visible et AVANT la question qui l'exige.
 *
 * MANIPULATION JAMAIS GELÉE : les trois tableaux restent modifiables.
 */
const SIGNES = (fn) => tableauDeSignes(fn).lignes.map((l) => l.sign);
const S_PARA = SIGNES(PARABOLE);
const S_QMM = SIGNES(CUBE_MAXMIN);
const S_MONO = SIGNES(TOUJOURS_CROISSANTE);
const MIN_PARA = extremums(PARABOLE).find((e) => e.kind === 'minimum');
const MAX_QMM = extremums(CUBE_MAXMIN).find((e) => e.kind === 'maximum');

export default function Module04AtelierDeTableaux() {
  const [c1, setC1] = useState({});
  const [ok1, setOk1] = useState(false);
  const [v1, setV1] = useState(false);

  const [c2, setC2] = useState({});
  const [ok2, setOk2] = useState(false);
  const [v2, setV2] = useState(false);

  const [c3, setC3] = useState({});
  const [ok3, setOk3] = useState(false);
  const [q3, setQ3] = useState(false);

  const done1 = ok1 && v1;
  const done2 = ok2 && v2;
  const done3 = ok3 && q3;

  /** Un remplissage juste déclenche l'effet UNE fois ; le tableau reste ouvert. */
  const remplir = (vrai, choix, setChoix, deja, setOk, react) => (i, s) => {
    const suivant = { ...choix, [i]: s };
    setChoix(suivant);
    if (!deja && vrai.every((v, k) => suivant[k] === v)) {
      setOk(true);
      react?.(true);
    }
  };

  const steps = [
    {
      num: 1,
      title: 'Un creux, pas une bosse',
      subtitle:
        'p(x) = x² − 4x + 1 sur [−1 ; 5], donc p′(x) = 2x − 4, qui s’annule en 2. Remplis la ligne du signe, puis lis la valeur atteinte au retournement.',
      done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <TableauVariations
            fn={PARABOLE}
            aRemplir
            choix={c1}
            onChoisir={remplir(S_PARA, c1, setC1, ok1, setOk1, kit.react)}
            montrerExtremums={ok1}
          />
          {ok1 ? (
            <>
              <Feedback tone="ok">
                p′(x) = 2x − 4 est <strong>négative</strong> avant 2 et <strong>positive</strong>{' '}
                après : − puis +. La courbe descend puis remonte — c’est un creux, l’inverse du
                module précédent.
              </Feedback>
              <NumericQuestion
                prompt={<>Quelle est la <strong>valeur</strong> atteinte par p au fond de ce creux ?</>}
                expected={MIN_PARA.y}
                parse={(raw) => parseSigned(raw, parseDec)}
                display={fr(MIN_PARA.y)}
                requires={['methode-extremum-par-le-signe', 'mem-plus-moins-maximum']}
                explain={`Le retournement a lieu en x = ${fr(MIN_PARA.x)}, et p(${fr(MIN_PARA.x)}) = ${fr(MIN_PARA.x)}² − 4 × ${fr(MIN_PARA.x)} + 1 = ${fr(MIN_PARA.y)}.`}
                explainFor={(n) =>
                  n === MIN_PARA.x ? 'C’est l’ENDROIT du retournement. La valeur atteinte est p(2) = 4 − 8 + 1 = −3.' : null
                }
                solved={v1}
                onAnswered={() => setV1(true)}
              />
            </>
          ) : (
            <Feedback tone="info">
              Un point d’essai par morceau : p′(0) = −4 et p′(4) = 4.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'La bosse arrive en premier',
      subtitle:
        'q(x) = x³ − 6x² + 9x sur [0 ; 4], donc q′(x) = 3x² − 12x + 9 = 3(x − 1)(x − 3). Deux zéros, donc trois morceaux.',
      done: done2,
      content: (kit) => (
        <div className="space-y-3">
          <TableauVariations
            fn={CUBE_MAXMIN}
            aRemplir
            choix={c2}
            onChoisir={remplir(S_QMM, c2, setC2, ok2, setOk2, kit.react)}
            montrerExtremums={ok2}
            disabled={!done1}
          />
          {ok2 ? (
            <>
              <Feedback tone="ok">
                + − + : la courbe monte, se retourne en <strong>1</strong>, descend, se retourne à
                nouveau en <strong>3</strong>, remonte. Le retournement vers le haut arrive cette
                fois <em>avant</em> l’autre.
              </Feedback>
              <TapQuestion
                prompt="Dans ce tableau, où q atteint-elle sa plus grande valeur sur [0 ; 4] ?"
                options={[
                  'En x = 1, où elle vaut 4 — et aussi en x = 4, où elle vaut 4 également',
                  'En x = 3, où le signe repasse à +',
                  'En x = 0, la borne de gauche',
                  'Nulle part : la courbe monte indéfiniment',
                ]}
                correct={0}
                cols={1}
                requires={['methode-extremum-par-le-signe', 'tableau-de-variations']}
                explain={`Le retournement vers le haut donne q(1) = ${fr(MAX_QMM.y)}. Mais la borne de droite atteint la même hauteur : q(4) = 64 − 96 + 36 = 4. Comparer les retournements ET les bornes, c’est la règle de 2de qui reste valable.`}
                explainWrong="En x = 3, q′ repasse à + : c’est un creux, pas une bosse (q(3) = 0). Et q(0) = 0. La plus grande valeur est 4, atteinte en x = 1 et à nouveau en x = 4."
                solved={v2}
                onAnswered={() => setV2(true)}
              />
            </>
          ) : (
            <Feedback tone="info">
              Points d’essai : q′(0) = 9, q′(2) = −3, q′(4) = 9.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Et si la dérivée ne s’annulait jamais ?',
      subtitle:
        'r(x) = x³ + 3x sur [−2 ; 2], donc r′(x) = 3x² + 3. Essaie de résoudre 3x² + 3 = 0 avant de remplir.',
      done: done3,
      content: (kit) => (
        <div className="space-y-3">
          <div className="rounded-xl border border-emerald-100 bg-white p-4 text-sm text-slate-700 space-y-2">
            <p className="font-mono">3x² + 3 = 0 ⟺ 3x² = −3 ⟺ x² = −1</p>
            <p>Un carré ne peut pas être négatif. L’équation n’a donc <strong>aucune</strong> solution.</p>
          </div>
          <TableauVariations
            fn={TOUJOURS_CROISSANTE}
            aRemplir
            choix={c3}
            onChoisir={remplir(S_MONO, c3, setC3, ok3, setOk3, kit.react)}
            montrerExtremums={ok3}
            disabled={!done2}
          />
          {ok3 ? (
            <>
              <Feedback tone="ok">
                Aucun zéro, donc aucun découpage : <strong>un seul morceau</strong>, une seule
                flèche. r est croissante sur tout l’intervalle, et ne se retourne nulle part.
              </Feedback>
              <KnowledgeBrick
                id="regle-derivee-jamais-nulle"
                variant="new"
                lead={<>Le cas qu’il ne faut pas forcer. Relis-le en regardant le tableau à une seule flèche.</>}
              />
              <TapQuestion
                prompt="Une fonction w a pour dérivée w′(x) = x² + 5. Que peut-on dire de w sur ℝ ?"
                options={[
                  'Elle est croissante partout : x² + 5 vaut au moins 5, donc reste strictement positive',
                  'Elle se retourne là où x² + 5 s’annule',
                  'Elle est décroissante, car x² + 5 grandit',
                  'On ne peut rien dire sans connaître w'
                ]}
                correct={0}
                cols={1}
                requires={['regle-derivee-jamais-nulle', 'signe-derivee-donne-sens']}
                explain="x² ⩾ 0, donc x² + 5 ⩾ 5 > 0 : la dérivée est strictement positive partout. w est donc croissante sur ℝ, sans aucun retournement — et il est inutile de chercher un zéro qui n’existe pas."
                explainWrong="x² + 5 ne s’annule jamais : x² = −5 n’a pas de solution. Et une dérivée qui GRANDIT n’est pas une dérivée négative : ce qui compte est son SIGNE, pas son sens de variation à elle."
                solved={q3}
                onAnswered={() => setQ3(true)}
              />
            </>
          ) : (
            <Feedback tone="info">
              Un seul morceau à renseigner. Point d’essai : r′(0) = 3.
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
      moduleTitle="Atelier de tableaux"
      moduleSubtitle="Trois fonctions, trois formes de tableau"
      estimatedTime="12 min"
      brief={{
        tag: 'Atelier',
        title: 'La méthode ne change pas, les tableaux si',
        tone: 'indigo',
        body: (
          <p>
            Toujours les mêmes quatre gestes. Mais un creux au lieu d’une bosse, deux
            retournements au lieu d’un, et parfois aucun du tout.
          </p>
        ),
      }}
      steps={steps}
      footer={
        <KnowledgeSnapshot moduleNumber={4}>
          <strong>Et maintenant ?</strong> Tu sais construire un tableau à partir d’une dérivée.
          Le module suivant s’en sert pour répondre à une vraie question : quel est le meilleur
          choix possible ?
        </KnowledgeSnapshot>
      }
    />
  );
}
