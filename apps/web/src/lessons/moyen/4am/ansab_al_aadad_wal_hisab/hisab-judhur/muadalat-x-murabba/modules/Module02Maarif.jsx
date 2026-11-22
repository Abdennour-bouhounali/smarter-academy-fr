import { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, KnowledgeBrick, PeerSheet } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import { Feedback } from '../../../../../../common/components/LessonUI';
import MathText from '../../../../../../common/components/MathText';
import { Manipulation } from '../../../../../../common/manipulations';
import { TextbookBox } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { KNOWLEDGE } from '../content/textbook';
import { M2_ROUNDS } from '../content/folds';
import { PEER_SHEET, PEER_KID } from '../content/peerSheet';
import LabRounds from '../../../../../../common/manipulations/rounds/LabRounds';
import PlayerSwitch from '../../../../../../common/mission/PlayerSwitch';

/**
 * Module 2 — معارف 3 (p. 22) : « المعادلات من الشكل x² = a » (rétrofit 2026-10-15 : le labo ouvre SANS carte ni titre ; la question
 * d'abord, la brique et les encadrés du livre APRÈS).
 *
 * L'instrument du module 1 revient, sur les TROIS EXEMPLES de la خاصية 2 (x² = 9, x² = 5, x² = −1) : un exemple travaillé, un seul
 * niveau (`levels={false}`). √5 ne tombe sur aucune graduation — l'élève s'en approche et c'est √5 exact qui est épinglé.
 *
 *   étape 1  pourquoi −√a a pour carré a (la خاصية 1) → ALORS le rappel `murabba-mutaakisayn`, les remarques et les exemples ;
 *   étape 2  comment écrire les deux solutions de x² = 5 (aucune ne tombe sur une graduation) → brique `hulul-x2-a` (خاصية 2)
 *            PUIS son application à trois équations nouvelles ;
 *   étape 3  pourquoi a < 0 ne donne aucune solution → les exemples de la خاصية 2 APRÈS.
 * La question « combien de solutions » des trois exemples n'est plus posée : le labo l'a déjà fait juger carte par carte.
 * LP : P1.
 *
 * LECTEUR DE MISSION (rollout 2026-11-10, unité 2 leçon 3) : le labo se joue en MANCHES (content/folds.js › M2_ROUNDS : 9, 5, −1 — √5 épinglé
 * EXACT, la graduation voisine refusée, puis l'équivalence BÂTIE → droite libre) ; l'étape 2 (x² = 5) attend la manche ; l'étape 4 est
 * « ورقة أمينة » (`PeerSheet`, content/peerSheet.js : la racine d'un décimal prise pour sa moitié). Hors lecteur : le même labo, la même 4e étape.
 */
const { prop1, prop2 } = KNOWLEDGE;
const M = (s) => <MathText key={s}>{s}</MathText>;
const COUNT = ['تقبل حلين متعاكسين', 'تقبل حلا واحدا', 'لا تقبل أي حل'];

export default function Module02Maarif() {
  const [q1, setQ1] = useState(false);
  const [q2a, setQ2a] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);
  // Dans le lecteur : la manche gagnée (étoiles gardées) ouvre l'étape 2.
  const [won, setWon] = useState({});

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="معارف — المعادلات من الشكل x² = a"
      moduleSubtitle="خاصيتان"
      estimatedTime="12 دقيقة"
      objectives={['كيف نكتب حلول المعادلة $x^2 = a$ حسب إشارة $a$؟', 'ماذا يحدث للمعادلة $x^2 = -1$؟']}
      intro={
        <PlayerSwitch
          player={(
            <LabRounds lessonId={MODULE_CTX.lessonId} labId="m2-folds" rounds={M2_ROUNDS} icon="📐" freeIcon="🎏"
              onRoundWon={(id) => setWon((w) => ({ ...w, [id]: true }))} />
          )}
          page={(
            <Manipulation
              type="square-fold"
              targets={prop2.targets}
              scale={10}
              levels={false}
              lead={<MathText>{'ثلاث بطاقات جديدة: $x^2 = 9$ ، $x^2 = 5$ ، $x^2 = -1$. بعضها لن يقع حلّه على أي تدريجة.'}</MathText>}
            />
          )}
        />
      }
      steps={[
        {
          num: 1, title: <MathText>{'ما مربّع العدد $-\\sqrt{a}$؟'}</MathText>, subtitle: 'من تجربتك: سهم x وسهم −x', done: q1,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<span>ليكن <MathText>{'$a$'}</MathText> عددا موجبا. ماذا نقول عن العدد <MathText>{'$-\\sqrt{a}$'}</MathText>؟</span>}
                options={[
                  'هو معاكس العدد الموجب $\\sqrt{a}$، ومربعه يساوي $a$',
                  'مربعه يساوي $-a$',
                  'هو الجذر التربيعي للعدد $-a$',
                  'مربعه سالب لأنه عدد سالب',
                ].map(M)}
                correct={0}
                cols={1}
                requires={['murabba-mutaakisayn']}
                explain={<MathText>{`${prop1.aside[1]}. ${prop1.note}`}</MathText>}
                onAnswered={() => setQ1(true)}
              />
              {q1 && (
                <div className="space-y-3">
                  <KnowledgeBrick id="murabba-mutaakisayn" variant="rappel" compact />
                  <TextbookBox kind="remark" lines={prop1.aside} source={KNOWLEDGE.source} compact />
                  <TextbookBox kind="example" lines={prop1.examples} compact />
                </div>
              )}
            </div>
          ),
        },
        {
          needsRound: { id: 'r1', label: 'الجولة 1', icon: '📐', won: Boolean(won.r1) },
          num: 2, title: <MathText>{'كيف نكتب حلّي $x^2 = 5$ بالضبط؟'}</MathText>, subtitle: 'لم يقع أيّ منهما على تدريجة', done: q2,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<span>في المختبر لم يقع حلّا المعادلة <MathText>{'$x^2 = 5$'}</MathText> على أي تدريجة. كيف نكتب كلاًّ منهما بالضبط؟</span>}
                options={[
                  '$\\sqrt{5}$ و $-\\sqrt{5}$',
                  '$2{,}2$ و $-2{,}2$',
                  '$\\dfrac{5}{2}$ و $-\\dfrac{5}{2}$',
                  '$\\sqrt{5}$ فقط',
                ].map(M)}
                correct={0}
                cols={2}
                requires={['murabba-mutaakisayn']}
                explain={<span><MathText>{'$(\\sqrt{5})^2 = 5$ و $(-\\sqrt{5})^2 = 5$'}</MathText>؛ أما <MathText>{'$2{,}2^2 = 4{,}84$'}</MathText> و <MathText>{'$\\left(\\dfrac{5}{2}\\right)^2 = 6{,}25$'}</MathText>.</span>}
                onAnswered={() => setQ2a(true)}
              />
              {q2a && (
                <div className="space-y-3">
                  <KnowledgeBrick id="hulul-x2-a" lead="نجمع ما حدث على المستقيم في ثلاث حالات، حسب إشارة a:" />
                  <BatchChoiceQuestion
                    intro={<p className="text-sm font-semibold text-slate-700">طبّق الخاصية 2 على معادلات جديدة:</p>}
                    rows={[
                      { id: 'e16', label: M('$x^2 = 16$'), options: COUNT, correct: 0, correction: M('$16 > 0$: حلّان متعاكسان هما $4$ و $-4$.') },
                      { id: 'e0', label: M('$x^2 = 0$'), options: COUNT, correct: 1, correction: M('$a = 0$: حلّ واحد هو العدد $0$.') },
                      { id: 'em4', label: M('$x^2 = -4$'), options: COUNT, correct: 2, correction: M('$-4 < 0$: لا يوجد عدد مربعه $-4$.') },
                    ]}
                    requires={['hulul-x2-a']}
                    feedback={({ allRight }) => (
                      <Feedback tone={allRight ? 'ok' : 'ko'}>
                        {allRight ? 'تمامًا. ' : 'انظر إلى التصحيحات. '}<MathText>{prop2.examples[1]}</MathText>
                      </Feedback>
                    )}
                    onAnswered={() => setQ2(true)}
                  />
                </div>
              )}
            </div>
          ),
        },
        {
          num: 3, title: <MathText>{'لماذا لا تقبل $x^2 = -1$ أي حل؟'}</MathText>, subtitle: 'ماذا يحدث عندما يكون a سالبا؟', done: q3,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<span>لماذا لا تقبل المعادلة <MathText>{'$x^2 = -1$'}</MathText> أي حل؟</span>}
                options={[
                  'لأن مربع أي عدد هو دائما عدد موجب، و $-1$ سالب',
                  'لأن $(-1)^2 = -1$',
                  'لأن $\\sqrt{1} = -1$',
                  'لأن $1^2 = -1$',
                ].map(M)}
                correct={0}
                cols={1}
                requires={['murabba-mutaakisayn', 'hulul-x2-a']}
                explain={<span><MathText>{'$(-1)^2 = 1$'}</MathText> و <MathText>{'$1^2 = 1$'}</MathText>: <MathText>{prop1.note}</MathText></span>}
                onAnswered={() => setQ3(true)}
              />
              {q3 && <TextbookBox kind="example" lines={prop2.examples} compact />}
            </div>
          ),
        },
        { num: 4, title: 'ورقة أمينة: أين الخطأ؟', subtitle: 'جد السطر الخاطئ وصحّحه', done: q4,
          content: <PeerSheet sheet={PEER_SHEET} kid={PEER_KID} onDone={() => setQ4(true)} /> },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={2} variant="memo" />}
    />
  );
}
