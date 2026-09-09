import React, { useState } from 'react';
import { Scissors, Users } from 'lucide-react';
import { ContentModule, TapQuestion, NumericQuestion, PredictionChips, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import PartageLab from '../components/PartageLab';
import {
  TRAJETS, AXE_TRAJETS, serie, medianeDetail, moyenne, valeurs, fr, avecUnite,
} from '../components/stats4e';
import { parseDec } from '@smarter-academy/core';

/**
 * Module 3 — MANIPULATION : la médiane, trouvée avant d'être nommée.
 *
 * Activity              déplacer une coupure sur une série rangée jusqu'à ce
 *                       que les deux moitiés aient le même effectif, d'abord
 *                       sur un effectif PAIR, puis sur un effectif IMPAIR.
 * Mathematical objective la médiane est la valeur qui partage l'effectif en
 *                       deux moitiés de même taille. Selon la parité, elle est
 *                       une valeur de la série ou la demi-somme des deux
 *                       valeurs centrales.
 * Student action        glisser la coupure, au demi-cran.
 * Controlled variable   la position de la coupure. La série ne bouge pas.
 * Mathematical state    la position `coupe` ; les deux effectifs et le verdict
 *                       en sont DÉRIVÉS, et la valeur de référence vient de
 *                       `medianeDetail`.
 * Visual consequence    les pastilles changent de couleur selon le côté, les
 *                       deux compteurs se réécrivent, le cadre passe au vert.
 * Expected observation  « il n'y a qu'un seul endroit qui marche, et il ne
 *                       tombe sur personne ».
 * Misconception targeted chercher la médiane DANS la liste quand l'effectif
 *                       est pair. Ici la seule position gagnante est 12,5, et
 *                       aucun élève ne met 12,5 minutes.
 * Formalization         la brique `mediane-stat` arrive à l'étape 3, une fois
 *                       la position trouvée ; `mediane-partage` à l'étape 5,
 *                       une fois qu'on s'en est servi pour dire quelque chose
 *                       du groupe.
 *
 * ATTEIGNABILITÉ (vérifiée par `parcours.test.js`). Au demi-cran, la série
 * paire n'a EXACTEMENT qu'une position gagnante — 12,5 — et la série impaire
 * exactement une aussi — 13, posée sur une valeur. Sans cette vérification,
 * l'une des deux étapes pourrait être impossible à réussir.
 */

/* La série IMPAIRE du module — sept membres d'un club, un tout autre décor
   que les trajets : le transfert d'un contexte à l'autre est l'objectif de la
   leçon, pas un ornement. Sa médiane (13 ans) EST l'âge d'un membre, ce qui
   fait tout le contraste avec les trajets. */
const CLUB = serie({
  id: 'club',
  nom: 'Âges au club de robotique',
  unite: 'ans',
  items: [
    { libelle: 'Yanis', valeur: 11 },
    { libelle: 'Alba', valeur: 12 },
    { libelle: 'Nour', valeur: 12 },
    { libelle: 'Tom', valeur: 13 },
    { libelle: 'Iris', valeur: 14 },
    { libelle: 'Léo', valeur: 14 },
    { libelle: 'Zoé', valeur: 15 },
  ],
});
const AXE_CLUB = { min: 10, max: 16, pas: 1 };

export default function Module03CouperLeGroupe() {
  const [coupePair, setCoupePair] = useState(6);
  const [coupeImpair, setCoupeImpair] = useState(10.5);
  const [pred, setPred] = useState(null);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);
  const [q5, setQ5] = useState(false);

  const dPair = medianeDetail(TRAJETS);
  const dImpair = medianeDetail(CLUB);

  const vsPair = valeurs(TRAJETS);
  const vsImpair = valeurs(CLUB);

  // On MÉMORISE l'atteinte : une fois trouvée, l'étape reste validée même si
  // l'élève continue à jouer avec la coupure — c'est ce qui garde le labo
  // vivant sans le geler ni le dé-valider.
  const [trouvePair, setTrouvePair] = useState(false);
  const [trouveImpair, setTrouveImpair] = useState(false);

  const poserPair = (v) => {
    setCoupePair(v);
    const g = vsPair.filter((x) => x < v).length;
    const d = vsPair.filter((x) => x > v).length;
    const s = vsPair.filter((x) => x === v).length;
    if (g === d && s === 0) setTrouvePair(true);
  };
  const poserImpair = (v) => {
    setCoupeImpair(v);
    const g = vsImpair.filter((x) => x < v).length;
    const d = vsImpair.filter((x) => x > v).length;
    const s = vsImpair.filter((x) => x === v).length;
    if (g === d && s <= 1) setTrouveImpair(true);
  };

  const steps = [
    {
      num: 1,
      title: 'Coupe la classe en deux moitiés égales',
      subtitle: 'Les douze trajets, rangés. Fais glisser le trait noir jusqu’à en laisser autant de chaque côté.',
      done: trouvePair,
      content: (
        <div className="space-y-3">
          <p className="text-sm text-slate-700">
            Voici les douze trajets de l’observatoire, rangés du plus court au plus long.
            Ton objectif : <strong>six d’un côté, six de l’autre</strong>.
          </p>
          <PredictionChips
            prompt="Avant de couper : à ton avis, la coupure tombera-t-elle sur le trajet d’un élève ?"
            options={[
              { id: 'oui', label: 'Oui, sur un élève' },
              { id: 'non', label: 'Non, entre deux' },
              { id: 'plusieurs', label: 'Plusieurs positions marcheront' },
            ]}
            value={pred}
            onChange={setPred}
          />
          <PartageLab
            serie={TRAJETS}
            coupe={coupePair}
            onCoupe={poserPair}
            axe={AXE_TRAJETS}
            pas={0.5}
          />
          {trouvePair && (
            <Feedback tone="ok">
              Six d’un côté, six de l’autre, à {avecUnite(dPair.valeur, TRAJETS.unite)} — et la
              coupure ne touche <strong>aucune</strong> pastille. C’est la seule position qui
              équilibre : essaie de gauche à droite, tu n’en trouveras pas d’autre.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Pourquoi ce nombre-là, et pas un trajet d’élève ?',
      done: q3,
      content: (
        <div className="space-y-3">
          <p className="text-sm text-slate-700">
            Les deux pastilles qui encadrent la coupure sont à{' '}
            <strong>{dPair.encadrantes[0]}</strong> et <strong>{dPair.encadrantes[1]}</strong>{' '}
            {TRAJETS.unite}. Entre les deux, il n’y a personne.
          </p>
          <NumericQuestion
            prompt={`Quel nombre est exactement au milieu de ${dPair.encadrantes[0]} et ${dPair.encadrantes[1]} ?`}
            expected={dPair.valeur}
            parse={parseDec}
            suffix={TRAJETS.unite}
            requires={['moyenne', 'indicateur-stat']}
            explain={`(${dPair.encadrantes[0]} + ${dPair.encadrantes[1]}) ÷ 2 = ${fr(dPair.valeur)}. C’est la demi-somme des deux valeurs centrales — et ce n’est le trajet d’aucun élève de la classe.`}
            explainFor={(n) => {
              if (n === dPair.encadrantes[0] || n === dPair.encadrantes[1]) {
                return `${n} est l’une des deux valeurs qui encadrent, pas le milieu des deux. Il faut prendre leur demi-somme : (${dPair.encadrantes[0]} + ${dPair.encadrantes[1]}) ÷ 2.`;
              }
              if (n === dPair.encadrantes[0] + dPair.encadrantes[1]) {
                return `${n} est la SOMME des deux valeurs. Il reste à la diviser par 2 pour obtenir leur milieu.`;
              }
              return null;
            }}
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
          {q3 && (
            <KnowledgeBrick
              id="mediane-stat"
              variant="new"
              lead="Le nombre que tu viens de trouver par le geste a un nom, et une méthode."
            />
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Et quand le groupe est de taille impaire ?',
      subtitle: 'Sept membres d’un club de robotique. Même geste, résultat d’une autre nature.',
      done: trouveImpair,
      content: (
        <div className="space-y-3">
          <p className="text-sm text-slate-700">
            Sept membres, cette fois. Coupe le groupe en deux moitiés de même taille et regarde
            <strong> où le trait tombe</strong>.
          </p>
          <PartageLab
            serie={CLUB}
            coupe={coupeImpair}
            onCoupe={poserImpair}
            axe={AXE_CLUB}
            pas={0.5}
          />
          {trouveImpair && (
            <Feedback tone="ok">
              Trois d’un côté, trois de l’autre, et la coupure tombe <strong>sur</strong>{' '}
              {CLUB.items[3].libelle}, à {avecUnite(dImpair.valeur, CLUB.unite)}. Avec un effectif
              impair, il y a toujours une valeur exactement au milieu — c’est elle, la médiane.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 4,
      title: 'Les deux cas, en une question',
      done: q4,
      content: (
        <div className="space-y-3">
          <TapQuestion
            prompt="Une série de 20 valeurs, rangées. Où se trouve sa médiane ?"
            options={[
              'Au milieu de la 10ᵉ et de la 11ᵉ valeur',
              'C’est la 10ᵉ valeur',
              'C’est la 20ᵉ valeur divisée par 2',
              'C’est la moyenne des 20 valeurs',
            ]}
            correct={0}
            cols={1}
            requires={['mediane-stat']}
            explain="20 est pair : il y a deux valeurs centrales, la 10ᵉ et la 11ᵉ. La médiane est leur demi-somme, et elle peut n’être aucune des deux."
            solved={q4}
            onAnswered={() => setQ4(true)}
          />
        </div>
      ),
    },
    {
      num: 5,
      title: 'Ce que ce nombre autorise à dire',
      done: q5,
      content: (
        <div className="space-y-3">
          <TapQuestion
            prompt={`La médiane des douze trajets vaut ${fr(dPair.valeur)} min, et leur moyenne ${fr(moyenne(TRAJETS))} min. Quelle phrase est EXACTE ?`}
            options={[
              `La moitié des élèves mettent moins de ${fr(dPair.valeur)} minutes`,
              `La plupart des élèves mettent ${fr(dPair.valeur)} minutes`,
              `Un élève au hasard met ${fr(dPair.valeur)} minutes`,
              `Aucun élève ne met plus de ${fr(dPair.valeur)} minutes`,
            ]}
            correct={0}
            cols={1}
            requires={['mediane-stat', 'interpreter']}
            explain={`La médiane partage le GROUPE : six élèves sont en dessous de ${fr(dPair.valeur)} min, six au-dessus. Elle ne dit rien d’un élève en particulier, et surtout pas que « la plupart » sont à cette valeur — d’ailleurs personne n’y est.`}
            solved={q5}
            onAnswered={() => setQ5(true)}
          />
          {q5 && (
            <KnowledgeBrick
              id="mediane-partage"
              variant="new"
              lead="C’est une phrase sur le groupe, jamais sur un individu."
            />
          )}
          {q5 && (
            <Feedback tone="info">
              Reste le troisième cadre de l’observatoire, celui qui bougeait quand Soline partait
              loin et pas quand Lise se déplaçait. C’est le module suivant.
            </Feedback>
          )}
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="Couper le groupe en deux"
      moduleSubtitle="Un nombre trouvé par le geste, avant d’être nommé"
      estimatedTime="11 min"
      brief={{
        tag: '🎬 Mission 03',
        title: 'Six d’un côté, six de l’autre',
        tone: 'indigo',
        body: (
          <>
            Le cadre vert de l’observatoire refusait de bouger. Pour comprendre pourquoi, il faut
            savoir d’où il sort. <strong>Coupe la classe en deux moitiés de même taille — et
            regarde où le trait s’arrête.</strong>
          </>
        ),
      }}
      intro={
        <div className="flex items-start gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-3.5">
          <Scissors className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" aria-hidden="true" />
          <p className="text-sm text-emerald-900">
            Attrape le trait noir et fais-le glisser.{' '}
            <Users className="inline h-4 w-4" aria-hidden="true" /> Les deux compteurs du haut
            comptent les pastilles de chaque côté : trouve la position où ils affichent le même
            nombre.
          </p>
        </div>
      }
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={3} />}
    />
  );
}
