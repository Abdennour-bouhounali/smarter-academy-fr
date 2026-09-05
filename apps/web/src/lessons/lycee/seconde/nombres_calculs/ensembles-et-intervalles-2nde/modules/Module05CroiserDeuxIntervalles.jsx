import React, { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import RealLine from '../../../../../common/components/RealLine';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import IntervalBuilder from '../components/IntervalBuilder';
import BuildCheck from '../components/BuildCheck';
import { interval, notation, sameInterval, intersect, union, typeOf } from '../components/intervalUtils';

/**
 * Module 5 — FORMALIZATION : « Croiser deux intervalles ».
 *
 * Activity: après l'« À retenir », deux bandes I et J sur la même droite ;
 *   construire I ∩ J (ce qui est dans les deux) puis I ∪ J (dans l'une ou
 *   l'autre) ; reconnaître une intersection vide.
 * Mathematical objective: ∩ et ∪ du module 2 appliqués aux intervalles ; la
 *   borne de l'intersection hérite du crochet le plus « strict ».
 * Student action: lire les deux bandes superposées, construire la réponse.
 * Controlled variable: l'intervalle construit K.
 * Mathematical state: K (module) ; I, J constants ; réponses dérivées
 *   (intersect, union).
 * Visual consequence: là où les deux bandes se superposent, la couleur est
 *   plus dense ; la construction se compare à la révélation.
 * Expected observation: I ∩ J = ]2 ; 4] : 2 exclu (par J), 4 inclus (par I).
 * Misconception targeted: « ∩ = la plus grande plage », crochets copiés du
 *   mauvais intervalle, « réunion disjointe = intervalle ».
 */
const I = interval(-1, 4);             // [−1 ; 4]
const J = interval(2, 7, true, true);  // ]2 ; 7[
const INTER = intersect(I, J);         // ]2 ; 4]
const UNION = union(I, J);             // [−1 ; 7[

const twoBands = (
  <div className="rounded-2xl border-2 border-slate-200 bg-white p-2">
    <RealLine
      min={-3} max={9} step={1}
      intervals={[
        { id: 'I', from: I.from, to: I.to, openFrom: I.openFrom, openTo: I.openTo, tone: 'sky', label: 'I = [−1 ; 4]' },
        { id: 'J', from: J.from, to: J.to, openFrom: J.openFrom, openTo: J.openTo, tone: 'amber', label: 'J = ]2 ; 7[' },
      ]}
      ariaLabel="Deux intervalles I = [−1 ; 4] et J = ]2 ; 7[ sur la même droite"
    />
  </div>
);

export default function Module05CroiserDeuxIntervalles() {
  const [typesDone, setTypesDone] = useState(false);
  const [k1, setK1] = useState(interval(-3, 9));
  const [g1, setG1] = useState(null);
  const [d1, setD1] = useState(false);
  const [k2, setK2] = useState(interval(-3, 9));
  const [g2, setG2] = useState(null);
  const [d2, setD2] = useState(false);
  const [d3, setD3] = useState(false);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(5)}
      moduleNumber={5}
      moduleTitle="Croiser deux intervalles"
      moduleSubtitle="À retenir, puis deux bandes sur la même droite : ce qui est dans les deux, ce qui est dans l’une ou l’autre."
      estimatedTime="8 min"
      brief={{
        tag: '📘 Mission 05',
        title: 'Tu sais lire, construire et traduire un intervalle. Reste à en croiser deux.',
        tone: 'indigo',
        body: <p>Le vocabulaire d’abord, en une carte. Puis I et J, superposés : construis leur intersection et leur réunion.</p>,
      }}
      steps={[
        {
          num: 1,
          title: 'À retenir',
          done: typesDone,
          content: (
            <div className="space-y-3">
              <div className="rounded-2xl border-2 border-indigo-200 bg-indigo-50 p-4 text-sm text-indigo-900 space-y-2">
                <p><strong>Un intervalle</strong> est l’ensemble de <strong>tous</strong> les réels compris entre deux bornes. Crochet tourné vers le nombre : borne <strong>incluse</strong> (≤) ; tourné vers l’extérieur : borne <strong>exclue</strong> (&lt;). Une borne infinie est toujours exclue.</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-center">
                  <div className="rounded-xl bg-white border border-indigo-200 p-2"><div className="font-bold">[a ; b]</div><div className="text-xs">fermé</div></div>
                  <div className="rounded-xl bg-white border border-indigo-200 p-2"><div className="font-bold">]a ; b[</div><div className="text-xs">ouvert</div></div>
                  <div className="rounded-xl bg-white border border-indigo-200 p-2"><div className="font-bold">[a ; b[</div><div className="text-xs">semi-ouvert</div></div>
                  <div className="rounded-xl bg-white border border-indigo-200 p-2"><div className="font-bold">]−∞ ; b]</div><div className="text-xs">demi-droite</div></div>
                </div>
                <p><span className="font-mono">I ∩ J</span> : les nombres dans I <strong>et</strong> dans J. <span className="font-mono">I ∪ J</span> : les nombres dans I <strong>ou</strong> dans J.</p>
              </div>
              <BatchChoiceQuestion
                intro={<p className="text-sm text-slate-600">Quel est le type de chaque intervalle ?</p>}
                rows={[
                  { id: 'r1', label: ']0 ; 1[', options: ['fermé', 'ouvert', 'semi-ouvert'], correct: 1 },
                  { id: 'r2', label: '[−2 ; 5[', options: ['fermé', 'ouvert', 'semi-ouvert'], correct: 2 },
                  { id: 'r3', label: '[3 ; 3,5]', options: ['fermé', 'ouvert', 'semi-ouvert'], correct: 0 },
                ]}
                feedback={({ allRight }) => (
                  <Feedback tone={allRight ? 'ok' : 'ko'}>Deux crochets vers l’intérieur : fermé. Deux vers l’extérieur : ouvert. Un de chaque : semi-ouvert.</Feedback>
                )}
                solved={typesDone}
                onAnswered={() => setTypesDone(true)}
              />
            </div>
          ),
        },
        {
          num: 2,
          title: 'I ∩ J : dans les deux à la fois',
          subtitle: 'I = [−1 ; 4] et J = ]2 ; 7[. Construis les nombres qui sont dans I ET dans J.',
          done: d1,
          content: (
            <div className="space-y-3">
              {twoBands}
              <IntervalBuilder value={k1} onChange={setK1} min={-3} max={9} step={1} showNotation={false} disabled={d1} ghost={g1} />
              <BuildCheck
                isRight={() => sameInterval(k1, INTER)}
                current={() => notation(k1)}
                answer={notation(INTER)}
                why="Là où les deux bandes se superposent : de 2 à 4. En 2, J est ouvert → 2 exclu. En 4, I est fermé → 4 inclus."
                hint={() => 'Ne garde que la zone où les DEUX couleurs se superposent ; pour chaque borne, regarde le crochet de l’intervalle qui s’arrête là.'}
                onDone={() => setD1(true)}
                onReveal={() => setG1(INTER)}
                solved={d1}
              />
            </div>
          ),
        },
        {
          num: 3,
          title: 'I ∪ J : dans l’une ou l’autre',
          subtitle: 'Construis maintenant les nombres qui sont dans I OU dans J.',
          done: d2,
          content: (
            <div className="space-y-3">
              {twoBands}
              <IntervalBuilder value={k2} onChange={setK2} min={-3} max={9} step={1} showNotation={false} disabled={d2} ghost={g2} />
              <BuildCheck
                isRight={() => sameInterval(k2, UNION)}
                current={() => notation(k2)}
                answer={notation(UNION)}
                why="Tout ce qui est colorié, d’une couleur ou de l’autre : de −1 (inclus, par I) à 7 (exclu, par J). Les deux bandes se touchent, la réunion est un seul intervalle."
                hint={() => 'Prends TOUT ce qui est colorié : la borne de gauche vient de I, celle de droite de J.'}
                onDone={() => setD2(true)}
                onReveal={() => setG2(UNION)}
                solved={d2}
              />
            </div>
          ),
        },
        {
          num: 4,
          title: 'Quand rien ne se croise',
          done: d3,
          content: (
            <TapQuestion
              prompt="A = [−5 ; −2] et B = [0 ; 3]. Que vaut A ∩ B ?"
              above={
                <div className="rounded-2xl border-2 border-slate-200 bg-white p-2">
                  <RealLine min={-6} max={4} step={1} intervals={[{ id: 'A', from: -5, to: -2, tone: 'sky', label: 'A' }, { id: 'B', from: 0, to: 3, tone: 'amber', label: 'B' }]} ariaLabel="Deux intervalles disjoints A = [−5 ; −2] et B = [0 ; 3]" />
                </div>
              }
              options={['∅ : aucun nombre n’est dans les deux', '[−2 ; 0]', '[−5 ; 3]', '{−2 ; 0}']}
              cols={1}
              correct={0}
              explain="Les deux bandes ne se touchent pas : aucun nombre n’est à la fois dans A et dans B. L’intersection est l’ensemble vide, ∅. (Et A ∪ B n’est pas un intervalle : il a un trou entre −2 et 0.)"
              explainWrong="Regarde le dessin : entre −2 et 0, rien n’est colorié. Aucun nombre n’appartient aux deux : A ∩ B = ∅. [−5 ; 3] serait un ensemble bien trop grand, avec un trou en plus."
              solved={d3}
              onAnswered={() => setD3(true)}
            />
          ),
        },
      ]}
      footer={
        <Feedback tone="ok">
          Croiser deux intervalles se lit sur la droite : l’intersection est la zone recouverte deux fois ({notation(INTER)}, {typeOf(INTER)}), la réunion tout ce qui est recouvert au moins une fois ({notation(UNION)}). Deux plages qui ne se touchent pas ont une intersection vide.
        </Feedback>
      }
    />
  );
}
