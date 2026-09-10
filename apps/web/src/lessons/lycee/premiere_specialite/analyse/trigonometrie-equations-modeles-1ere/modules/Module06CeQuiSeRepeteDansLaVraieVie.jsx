import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import ModeleLab from '../components/ModeleLab';
import { parseReel } from '../components/parseBridge';
import {
  SITUATIONS, lectureAttendue, cransAmplitudeDe, CRANS_PERIODE, fr,
} from '../components/trigEqUtils';

/**
 * Module 6 — ATELIER : modéliser un phénomène périodique (LP6).
 *
 * Étape 1  LA MARÉE. Une courbe observée est donnée ; l'élève ATTRAPE le
 *          sommet de SA courbe et la déforme jusqu'à superposer les deux.
 *          Deux réglages : la hauteur du sommet (l'amplitude) et sa distance
 *          au sommet suivant (la période). Le geste les découvre INDÉPENDANTS.
 * Étape 2  la brique `modele-periodique`, puis `methode-lire-amplitude-periode`,
 *          puis la demande : lire l'amplitude d'un maximum et d'un minimum.
 * Étape 3  LA GRANDE ROUE, à une tout autre échelle, avec le piège frontal :
 *          confondre l'amplitude avec le maximum. La brique
 *          `regle-amplitude-et-periode-independantes` referme.
 *
 * TOUT EST MESURÉ SUR LA COURBE : le test vérifie, pour chaque situation, que
 * les extremums mesurés sur le tracé sont ceux que l'énoncé annonce, et que
 * chaque nombre cité dans le contexte apparaît bien dans la lecture.
 *
 * MANIPULATION JAMAIS GELÉE : les deux laboratoires restent réglables une fois
 * la cible atteinte — c'est là qu'on voit chaque réglage agir séparément.
 */
const [MAREE, TEMPERATURE, ROUE] = SITUATIONS;

const LU_MAREE = lectureAttendue(MAREE);
const LU_ROUE = lectureAttendue(ROUE);

export default function Module06CeQuiSeRepeteDansLaVraieVie() {
  const [a1, setA1] = useState(cransAmplitudeDe(MAREE)[0]);
  const [p1, setP1] = useState(CRANS_PERIODE[0]);
  const [trouve1, setTrouve1] = useState(false);

  const [q2, setQ2] = useState(false);

  const [a3, setA3] = useState(cransAmplitudeDe(ROUE)[0]);
  const [p3, setP3] = useState(CRANS_PERIODE[0]);
  const [trouve3, setTrouve3] = useState(false);
  const [q4, setQ4] = useState(false);

  const viser = (s, A, P, deja, setTrouve, react) => {
    if (!deja && A === Math.abs(s.reglages.A) && P === s.reglages.P) {
      setTrouve(true);
      react?.(true);
    }
  };

  const steps = [
    {
      num: 1,
      title: 'Retrouve la courbe de la marée',
      subtitle:
        'La courbe violette est celle qu’on a observée dans le port. ATTRAPE le sommet de TA courbe, la bleue : monte-le pour qu’elle monte plus haut, éloigne-le vers la droite pour qu’elle se répète moins souvent.',
      done: trouve1,
      content: (kit) => (
        <div className="space-y-3">
          <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-3 text-sm text-slate-700">
            <span className="text-lg mr-1" aria-hidden="true">{MAREE.emoji}</span>
            {MAREE.contexte}
          </div>
          <ModeleLab
            situation={MAREE}
            A={a1}
            P={p1}
            onChangeA={(v) => { setA1(v); viser(MAREE, v, p1, trouve1, setTrouve1, kit.react); }}
            onChangeP={(v) => { setP1(v); viser(MAREE, a1, v, trouve1, setTrouve1, kit.react); }}
          />
          {trouve1 ? (
            <Feedback tone="ok">
              Les deux courbes se confondent. La marée monte à{' '}
              <strong>{fr(LU_MAREE.max, 0)} m</strong> et descend à{' '}
              <strong>{fr(LU_MAREE.min, 0)} m</strong> : elle oscille autour de{' '}
              <strong>{fr(LU_MAREE.moyenne, 0)} m</strong>, en s’en écartant de{' '}
              <strong>{fr(LU_MAREE.amplitude, 0)} m</strong> au plus, et recommence toutes
              les <strong>{fr(LU_MAREE.periode, 0)} heures</strong>. Continue à régler : tu
              verras que monter le sommet ne change PAS le rythme, et inversement.
            </Feedback>
          ) : (
            <Feedback tone="info">
              Lis d’abord la courbe violette : jusqu’où monte-t-elle au-dessus du trait gris
              (le niveau moyen) ? Et combien de temps sépare deux de ses sommets ? Puis
              amène le sommet de ta courbe au même endroit.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Deux nombres, et un nom pour chacun',
      done: q2,
      content: (
        <div className="space-y-3">
          <KnowledgeBrick
            id="modele-periodique"
            variant="new"
            lead={<>Les réglages que tu viens de trouver portent chacun un nom.</>}
          />
          <KnowledgeBrick
            id="methode-lire-amplitude-periode"
            variant="new"
            lead={<>Et voici comment les lire sur une courbe qu’on te donne.</>}
          />
          <div className="rounded-xl border border-amber-100 bg-white p-3 text-sm text-slate-700">
            <span className="text-lg mr-1" aria-hidden="true">{TEMPERATURE.emoji}</span>
            {TEMPERATURE.contexte}
          </div>
          <NumericQuestion
            prompt={`Quelle est l'amplitude de cette température, en °C ?`}
            answer={Math.abs(TEMPERATURE.reglages.A)}
            parse={parseReel}
            requires={['modele-periodique', 'methode-lire-amplitude-periode']}
            explain={`L'amplitude est la MOITIÉ de l'écart entre le maximum et le minimum : (22 − 10) / 2 = ${fr(Math.abs(TEMPERATURE.reglages.A), 0)} °C. Le niveau moyen, lui, vaut (22 + 10) / 2 = ${fr(TEMPERATURE.reglages.m, 0)} °C — c'est autour de lui que la température oscille.`}
            explainWrong={`Ne prends pas 22 : ce serait le maximum, pas l'amplitude. L'amplitude est ce dont on s'ÉCARTE du niveau moyen. Calcule d'abord ce niveau — (22 + 10) / 2 — puis l'écart qui l'en sépare du maximum.`}
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
        </div>
      ),
    },
    {
      num: 3,
      title: 'La grande roue : une tout autre échelle',
      subtitle:
        'Même geste, mais les nombres n’ont plus rien à voir. Retrouve la courbe de la nacelle.',
      done: trouve3,
      content: (kit) => (
        <div className="space-y-3">
          <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-3 text-sm text-slate-700">
            <span className="text-lg mr-1" aria-hidden="true">{ROUE.emoji}</span>
            {ROUE.contexte}
          </div>
          <ModeleLab
            situation={ROUE}
            A={a3}
            P={p3}
            onChangeA={(v) => { setA3(v); viser(ROUE, v, p3, trouve3, setTrouve3, kit.react); }}
            onChangeP={(v) => { setP3(v); viser(ROUE, a3, v, trouve3, setTrouve3, kit.react); }}
            disabled={!trouve1}
          />
          {trouve3 ? (
            <Feedback tone="ok">
              Amplitude <strong>{fr(LU_ROUE.amplitude, 0)} m</strong>, période{' '}
              <strong>{fr(LU_ROUE.periode, 0)} minutes</strong>. Compare avec la marée :
              une amplitude plus de dix fois plus grande, et pourtant une période plus
              COURTE. Les deux nombres n’ont aucun lien entre eux.
            </Feedback>
          ) : (
            <Feedback tone="info">
              La nacelle va de {fr(LU_ROUE.min, 0)} m à {fr(LU_ROUE.max, 0)} m : le niveau
              moyen est donc à mi-chemin, et l’amplitude est ce qui l’en sépare. Réglage
              actuel : amplitude {fr(a3, 0)} m, période {fr(p3, 0)} min.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 4,
      title: 'Le piège de l’amplitude',
      done: q4,
      content: (
        <div className="space-y-3">
          <KnowledgeBrick
            id="regle-amplitude-et-periode-independantes"
            variant="new"
            lead={<>Ce que la comparaison des deux situations vient de montrer.</>}
          />
          <TapQuestion
            prompt="Un élève regarde la courbe de la grande roue, voit qu’elle monte jusqu’à 55 m, et annonce : « l’amplitude vaut 55 m ». Où se trompe-t-il ?"
            options={[
              'Il donne le MAXIMUM, pas l’amplitude : celle-ci est l’écart au niveau moyen, soit (55 − 5) / 2 = 25 m',
              'Il se trompe d’unité : c’est en minutes',
              'Il a raison : le maximum est bien l’amplitude',
              'Il aurait dû répondre 5 m, le minimum',
            ]}
            correct={0}
            cols={1}
            requires={['modele-periodique', 'methode-lire-amplitude-periode', 'regle-amplitude-et-periode-independantes']}
            explain={`La nacelle oscille autour de ${fr(LU_ROUE.moyenne, 0)} m — le niveau moyen — et s'en écarte de ${fr(LU_ROUE.amplitude, 0)} m vers le haut comme vers le bas. C'est cet écart qui est l'amplitude. Le maximum, lui, est la somme des deux : ${fr(LU_ROUE.moyenne, 0)} + ${fr(LU_ROUE.amplitude, 0)} = ${fr(LU_ROUE.max, 0)} m.`}
            explainWrong={`Regarde le trait gris sur la figure : c'est le niveau moyen, à ${fr(LU_ROUE.moyenne, 0)} m. L'amplitude se mesure DEPUIS ce trait, pas depuis zéro. Et l'unité est bien le mètre : c'est une hauteur, pas une durée.`}
            solved={q4}
            onAnswered={() => setQ4(true)}
          />
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(6)}
      moduleNumber={6}
      moduleTitle="Ce qui se répète dans la vraie vie"
      moduleSubtitle="La marée, la température, une grande roue"
      estimatedTime="8 min"
      brief={{
        tag: 'Atelier',
        title: 'Trois nombres pour décrire un cycle',
        tone: 'indigo',
        body: (
          <p>
            Beaucoup de phénomènes recommencent à l’identique : la marée, la température d’une
            journée, la nacelle d’une grande roue. La courbe du cosinus les décrit tous — il
            suffit de régler <strong>jusqu’où ça monte</strong> et{' '}
            <strong>au bout de combien ça recommence</strong>.
          </p>
        ),
      }}
      steps={steps}
      footer={
        <KnowledgeSnapshot moduleNumber={6}>
          <strong>Tu as tout.</strong> Décrire une famille de solutions, colorier un arc,
          retrouver une formule de duplication et décrire un phénomène qui se répète. La
          mission finale attend.
        </KnowledgeSnapshot>
      }
    />
  );
}
