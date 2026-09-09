import React, { useState } from 'react';
import { Scale, Sliders } from 'lucide-react';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import BulletinLab from '../components/BulletinLab';
import {
  BULLETIN, FRATRIES,
  changerPoids, moyenne, moyenneSimple, effectifTotal, nbLignes,
  ecritureMoyennePonderee, fr,
} from '../components/stats4e';
// `parseFr` (le défaut de NumericQuestion) est ENTIER : « 1,68 » y renverrait
// NaN et l'étape ne se validerait jamais. Toute réponse décimale passe donc
// par `parse={parseDec}` (mémoire « NumericQuestion parseFr is integer-only »).
import { parseDec } from '@smarter-academy/core';

/**
 * Module 2 — DÉCOUVERTE : la moyenne pondérée.
 *
 * Activity              régler les quatre coefficients d'un bulletin et voir
 *                       la moyenne se déplacer, jusqu'à retrouver celle de 5e
 *                       en les mettant tous à 1.
 * Mathematical objective une moyenne pondérée est une moyenne où chaque
 *                       valeur compte autant de fois que son coefficient ; la
 *                       moyenne simple de 5e en est le cas particulier.
 * Student action        glisser un coefficient à la fois, de 0 à 6.
 * Controlled variable   les coefficients. Les notes ne bougent jamais.
 * Mathematical state    la série `BULLETIN`, modifiée par `changerPoids`. La
 *                       moyenne et la ligne de calcul en sont DÉRIVÉES.
 * Visual consequence    l'épaisseur des barres, les deux moyennes affichées,
 *                       et la ligne de calcul.
 * Expected observation  « quand je mets tout à 1, les deux nombres du haut
 *                       deviennent le même ».
 * Misconception targeted deux erreurs distinctes, chacune dans son étape :
 *                       oublier les coefficients (étape 1 : l'écart fait
 *                       changer de côté de 12) et diviser par le nombre de
 *                       LIGNES au lieu de l'effectif (étape 4 : 2,2 frères et
 *                       sœurs au lieu de 1,68).
 * Formalization         la brique `moyenne-ponderee` arrive à l'étape 3,
 *                       après que l'élève a vu les deux nombres coïncider.
 *
 * DIFFÉRENCE AVEC LE MODULE 1 : là-bas on CONSTATAIT que trois nombres ne
 * réagissent pas pareil ; ici on en CALCULE un, et c'est le premier des trois.
 */
const CIBLE = 12; // la barre du bulletin : au-dessus ou en dessous ?

export default function Module02TousLesDevoirs() {
  const [serie, setSerie] = useState(BULLETIN);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);
  const [q5, setQ5] = useState(false);

  const officielle = moyenne(BULLETIN);
  const simple = moyenneSimple(BULLETIN);

  // « Tous les coefficients à 1 » est la DÉCOUVERTE de l'étape 2 : on retient
  // que l'élève l'a atteint, pas seulement qu'il y est encore — sinon le
  // moindre geste suivant effacerait l'acquis (règle « ne jamais geler, ne
  // jamais dé-valider »).
  const [aVuTousUn, setAVuTousUn] = useState(false);
  const [regles, setRegles] = useState([]);

  // L'updater passé à `setSerie` est PUR : il ne fait que calculer la série
  // suivante. Y glisser un `setAVuTousUn` le rendrait impur, et React le
  // rejouerait en mode strict (mémoire « pièges du glisser geo5e » : updater
  // impur). La série suivante est donc calculée d'abord, puis les deux états
  // dérivés sont posés à partir d'elle.
  const poser = (i, p) => {
    const suivant = changerPoids(serie, i, p);
    setSerie(suivant);
    if (suivant.items.every((it) => it.poids === 1)) setAVuTousUn(true);
    setRegles((r) => (r.includes(i) ? r : [...r, i]));
  };

  const done1 = regles.length >= 2;
  const done2 = aVuTousUn;

  const lab = <BulletinLab serie={serie} onPoids={poser} />;

  const steps = [
    {
      num: 1,
      title: 'Fais bouger les curseurs',
      subtitle: 'Quatre notes, quatre curseurs. Change-en au moins deux et regarde le grand nombre violet.',
      done: done1,
      content: (
        <div className="space-y-3">
          <p className="text-sm text-slate-700">
            Voici le bulletin de maths de Naïm. Les quatre notes sont fixes : c’est{' '}
            <strong>l’importance</strong> de chaque épreuve que tu règles. Essaie de faire monter
            la moyenne au-dessus de {CIBLE}, puis de la faire redescendre.
          </p>
          {lab}
          {done1 && (
            <Feedback tone="ok">
              Les notes n’ont pas changé d’un dixième, et pourtant la moyenne s’est déplacée. Ce
              sont les curseurs qui décident du poids de chaque note dans le résultat.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Mets les quatre curseurs sur 1',
      subtitle: 'Que se passe-t-il quand toutes les épreuves comptent exactement pareil ?',
      done: done2,
      content: (
        <div className="space-y-3">
          <p className="text-sm text-slate-700">
            Le deuxième nombre du haut, en gris, est celui que tu aurais calculé en 5e : la somme
            des quatre notes divisée par 4. <strong>Amène les quatre curseurs sur 1</strong> et
            compare les deux nombres.
          </p>
          {lab}
          {done2 && (
            <Feedback tone="ok">
              Les deux nombres coïncident, à {fr(simple)}. Le calcul de 5e n’est donc pas un autre
              calcul : c’est celui-ci, dans le cas particulier où toutes les valeurs comptent
              pareil.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Le vrai bulletin du collège',
      done: q3,
      content: (
        <div className="space-y-3">
          <p className="text-sm text-slate-700">
            Au collège, ces quatre épreuves ne comptent pas pareil : le devoir surveillé compte
            pour 3 et le brevet blanc pour 5. Remets les curseurs sur ces valeurs
            (1, 1, 3, 5) et lis la ligne de calcul noire, en bas.
          </p>
          {lab}
          <div className="rounded-xl bg-slate-50 p-3">
            <p className="font-mono text-sm text-slate-700">{ecritureMoyennePonderee(BULLETIN)}</p>
          </div>
          <TapQuestion
            prompt={`Avec ces coefficients, la moyenne de Naïm vaut ${fr(officielle)}. En comptant les quatre notes pareil, elle vaudrait ${fr(simple)}. Pourquoi cet écart ?`}
            options={[
              'Ses deux meilleures notes sont celles qui comptent le moins',
              'Il y a une erreur : les deux calculs devraient donner pareil',
              'Parce que la somme des coefficients ne vaut pas 4',
              'Parce que ses notes vont de 9 à 16',
            ]}
            correct={0}
            cols={1}
            requires={['moyenne', 'indicateur-stat']}
            explain={`Naïm a ${BULLETIN.items[0].valeur} et ${BULLETIN.items[1].valeur} aux deux épreuves de coefficient 1, mais ${BULLETIN.items[2].valeur} et ${BULLETIN.items[3].valeur} à celles de coefficient 3 et 5. Ses bonnes notes pèsent peu, ses moins bonnes pèsent lourd : la moyenne passe de l’autre côté de ${CIBLE}.`}
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
          {q3 && (
            <KnowledgeBrick
              id="moyenne-ponderee"
              variant="new"
              lead="Le calcul que tu viens de faire varier a un nom, et une écriture."
            />
          )}
        </div>
      ),
    },
    {
      num: 4,
      title: 'Le même outil, sur un tout autre tableau',
      subtitle: 'On a demandé aux 25 élèves de la classe combien ils ont de frères et sœurs.',
      done: q4,
      content: (
        <div className="space-y-3">
          <p className="text-sm text-slate-700">
            Ici, le poids n’est plus un coefficient choisi par un professeur : c’est le{' '}
            <strong>nombre d’élèves</strong> qui ont donné cette réponse. Le calcul, lui, ne change
            pas.
          </p>
          <div className="overflow-x-auto rounded-2xl border-2 border-slate-200 bg-white">
            <table className="w-full text-sm tabular-nums">
              <thead>
                <tr className="border-b-2 border-slate-200 text-xs uppercase tracking-wide text-slate-400">
                  <th scope="col" className="px-3 py-2 text-left">Frères et sœurs</th>
                  {FRATRIES.items.map((it) => (
                    <th key={it.cle} scope="col" className="px-3 py-2 text-right">{it.valeur}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row" className="px-3 py-2 text-left font-semibold text-slate-600">Nombre d’élèves</th>
                  {FRATRIES.items.map((it) => (
                    <td key={it.cle} className="px-3 py-2 text-right font-mono font-bold text-slate-800">{it.poids}</td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
          <NumericQuestion
            prompt="Combien d’élèves ont répondu en tout ?"
            expected={effectifTotal(FRATRIES)}
            requires={['tableau-effectifs', 'effectif']}
            explain={`On additionne les effectifs : ${FRATRIES.items.map((it) => it.poids).join(' + ')} = ${effectifTotal(FRATRIES)} élèves. Le tableau n’a que ${nbLignes(FRATRIES)} colonnes, mais il y a bien ${effectifTotal(FRATRIES)} individus.`}
            explainFor={(n) => {
              if (n === nbLignes(FRATRIES)) return `${nbLignes(FRATRIES)}, c’est le nombre de COLONNES du tableau, pas le nombre d’élèves. Il faut additionner la ligne du bas.`;
              return null;
            }}
            solved={q4}
            onAnswered={() => setQ4(true)}
          />
        </div>
      ),
    },
    {
      num: 5,
      title: 'À toi de calculer',
      done: q5,
      content: (
        <div className="space-y-3">
          <NumericQuestion
            prompt="Combien de frères et sœurs en moyenne, par élève ? Donne un résultat au centième."
            expected={moyenne(FRATRIES)}
            parse={parseDec}
            requires={['moyenne-ponderee', 'tableau-effectifs']}
            explain={`${ecritureMoyennePonderee(FRATRIES)}. Chaque réponse compte autant de fois qu’il y a d’élèves qui l’ont donnée.`}
            explainFor={(n) => {
              if (n === 2.2) return `2,2 vient d’une division par ${nbLignes(FRATRIES)}, le nombre de COLONNES. Or il y a ${effectifTotal(FRATRIES)} élèves : c’est par ${effectifTotal(FRATRIES)} qu’il faut diviser.`;
              if (n === 11) return '11 est la SOMME des cinq réponses différentes, pas une moyenne. Il faut encore diviser, et compter chaque réponse autant de fois qu’elle a été donnée.';
              return null;
            }}
            solved={q5}
            onAnswered={() => setQ5(true)}
          />
          {q5 && (
            <Feedback tone="info">
              Une question reste entière : ce nombre-là dit « si on partageait les frères et sœurs
              également ». Mais quel est le nombre qui coupe la classe en deux moitiés ? C’est le
              module suivant.
            </Feedback>
          )}
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="Tous les devoirs ne pèsent pas pareil"
      moduleSubtitle="Quand chaque valeur compte un nombre de fois différent"
      estimatedTime="10 min"
      brief={{
        tag: '🎬 Mission 02',
        title: 'Le bulletin de Naïm',
        tone: 'indigo',
        body: (
          <>
            Quatre notes, et une moyenne qui n’est pas celle qu’on croit. Au collège, chaque
            épreuve porte un <strong>coefficient</strong> — le nombre de fois qu’elle compte — et
            un brevet blanc ne pèse pas comme une interrogation.{' '}
            <strong>De combien cela change-t-il le résultat ?</strong>
          </>
        ),
      }}
      intro={
        <div className="flex items-start gap-3 rounded-2xl border border-violet-100 bg-violet-50/60 p-3.5">
          <Scale className="mt-0.5 h-5 w-5 shrink-0 text-violet-600" aria-hidden="true" />
          <p className="text-sm text-violet-900">
            Les notes sont fixes, les curseurs ne le sont pas.{' '}
            <Sliders className="inline h-4 w-4" aria-hidden="true" /> Fais-les glisser et surveille
            les deux grands nombres du haut : à un réglage précis, ils deviennent le même.
          </p>
        </div>
      }
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={2} />}
    />
  );
}
