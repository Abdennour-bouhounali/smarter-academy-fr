import { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, KnowledgeBrick, PeerSheet } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import { Feedback } from '../../../../../../common/components/LessonUI';
import MathText from '../../../../../../common/components/MathText';
import { Manipulation } from '../../../../../../common/manipulations';
import { TextbookBox } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { KNOWLEDGE } from '../content/textbook';
import { M2_ROUNDS } from '../content/turf';
import { PEER_SHEET, PEER_KID } from '../content/peerSheet';
import LabRounds from '../../../../../../common/manipulations/rounds/LabRounds';
import PlayerSwitch from '../../../../../../common/mission/PlayerSwitch';

/**
 * Module 2 — معارف 3 (p. 34) : « التحليل ». Rétrofit 2026-10-15 (§4quater) : le labo ouvre le module, sans carte ; les briques et
 * l'encadré de définition viennent APRÈS la question qui les mérite.
 *   0. (intro) le CONTRASTE : x² + 25 sans bande ne ferme aucun terrain (turf-factoring, mode square, b = 0, c = 25) ;
 *   1. x² − 9 / x² + 9 : laquelle se lit à l'envers d'une متطابقة ? ; puis les trois exemples du livre (3, 4, 5) ; la brique
 *      tahlil-mutatabiqat APRÈS la réponse ;
 *   2. la définition (rappel de la brique du module 1), puis POURQUOI 2x(3x + 2) et non 2(3x² + 2x) ; la propriété distributive
 *      CORRIGÉE (ka − kb = k(a − b), une ligne discrète) posée en brique (khassiya-tawziiya) APRÈS cette réponse, puis l'exemple 2.
 *   3. « ورقة بلال » (`PeerSheet`, content/peerSheet.js) : le « 1 » perdu quand un terme est divisé par lui-même (rollout 2026-11-11).
 * LP : P1, P2, P3.
 *
 * LECTEUR DE MISSION (rollout 2026-11-11, unité 3 leçon 3 ; conseil du 2026-11-11, verdict L3) : le contraste x² + 25 se joue en MANCHE
 * (content/turf.js › M2_ROUNDS, prédiction « هل يُغلق هذا الملعب؟ », la suite les carreaux dehors → pourquoi → la règle) puis la ورشة libre ;
 * l'étape 1 attend la manche. Les renvois au manuel (« أمثلة الكتاب », « المثال الأول من الكتاب », la note d'erreur d'impression) sont retirés
 * pour tous (SHARED). Hors lecteur : le labo de la page inchangé.
 */
export default function Module02Maarif() {
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);
  const [q5, setQ5] = useState(false);
  // lecteur : la manche gagnée (étoiles gardées, annoncée par LabRounds au montage) ouvre l'étape 1
  const [won, setWon] = useState({});

  return (
    <ContentModule
      ctx={MODULE_CTX}
      objectives={["ماذا يعني «تحليل» عبارة جبرية؟", "كيف نتعرّف على العامل المشترك الكامل؟", "أيّ العبارات تُقرأ في الاتجاه المعاكس لمتطابقة شهيرة؟"]}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="معارف — التحليل"
      moduleSubtitle="من المجموع إلى الجداء"
      estimatedTime="8 دقائق"
      intro={
        // Lecteur : la MANCHE (content/turf.js) ; la page garde son labo.
        <PlayerSwitch
          player={(
            <LabRounds lessonId={MODULE_CTX.lessonId} labId="lab-turf-m2" rounds={M2_ROUNDS} icon="⬛" freeIcon="🏟️"
              onRoundWon={(id) => setWon((w) => ({ ...w, [id]: true }))} />
          )}
          page={(
            <Manipulation
              type="turf-factoring"
              mode="square"
              b={0}
              c={25}
              levels={false}
              lead="وصلت مربّعًا كبيرًا x² و 25 مربّعًا صغيرًا، ولا شريط. حاول أن تُغلق الملعب."
            />
          )}
        />
      }
      steps={[
        {
          needsRound: { id: 'r1', label: 'الجولة 1', icon: '⬛', won: Boolean(won.r1) },
          num: 1, title: 'أيّ العبارات تُقرأ في الاتجاه المعاكس لمتطابقة؟', subtitle: 'بعد محاولتك في الملعب', done: q4 && q3,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<MathText>{'أيّ العبارتين تُحلَّل بمتطابقة شهيرة: $x^2 - 9$ أم $x^2 + 9$؟'}</MathText>}
                options={[
                  <MathText key="a">{'$x^2 + 9$ لأنّ $x^2 + 9 = (x + 3)^2$'}</MathText>,
                  <MathText key="b">{'الاثنتان، لأن 9 مربّع العدد 3'}</MathText>,
                  <MathText key="c">{'$x^2 - 9$ وحدها: $x^2 - 9 = (x - 3)(x + 3)$'}</MathText>,
                ]}
                correct={2}
                cols={1}
                requires={['mutatabiqat']}
                explain={<MathText>{'$x^2 - 9 = x^2 - 3^2$ فرق مربّعين. أمّا $x^2 + 9$ فمجموع مربّعين، لا حدّ مضاعف فيه: $(x + 3)^2 = x^2 + 6x + 9$ — كما في الملعب الذي لا يُغلق دون شرائط.'}</MathText>}
                onAnswered={() => setQ4(true)}
              />
              {q4 && (
                <BatchChoiceQuestion
                  intro={<p className="text-sm font-semibold text-slate-700">ولكل عبارة مما يلي: أيّ متطابقة تحلّلها؟</p>}
                  rows={[
                    { id: 'e3', label: <MathText>{'$9x^2 + 6x + 1$'}</MathText>, options: ['مربع مجموع', 'مربع فرق', 'جداء مجموع حدين وفرقهما'], correct: 0, correction: <MathText>{KNOWLEDGE.examples[2]}</MathText> },
                    { id: 'e4', label: <MathText>{'$4 - 4x + x^2$'}</MathText>, options: ['مربع مجموع', 'مربع فرق', 'جداء مجموع حدين وفرقهما'], correct: 1, correction: <MathText>{KNOWLEDGE.examples[3]}</MathText> },
                    { id: 'e5', label: <MathText>{'$64 - 16x^2$'}</MathText>, options: ['مربع مجموع', 'مربع فرق', 'جداء مجموع حدين وفرقهما'], correct: 2, correction: <MathText>{KNOWLEDGE.examples[4]}</MathText> },
                  ]}
                  requires={['mutatabiqat']}
                  feedback={({ allRight }) => (
                    <Feedback tone={allRight ? 'ok' : 'ko'}>
                      <MathText>{allRight
                        ? 'نعرف المتطابقة من شكل العبارة: حدّ مضاعف موجب، حدّ مضاعف سالب، أو فرق مربّعين بلا حدّ مضاعف.'
                        : 'انظر إلى الحدّ الأوسط: $+2ab$ لمربع مجموع، $-2ab$ لمربع فرق، ولا حدّ أوسط في $a^2 - b^2$.'}</MathText>
                    </Feedback>
                  )}
                  onAnswered={() => setQ3(true)}
                />
              )}
              {q3 && <KnowledgeBrick id="tahlil-mutatabiqat" lead="والملعب المربّع الذي أغلقته في النشاط، مكتوبًا بالحروف:" />}
            </div>
          ),
        },
        {
          num: 2, title: 'ما العامل المشترك الكامل؟', subtitle: 'العامل المشترك كاملًا', done: q1 && q2,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<MathText>{'لماذا نكتب $6x^2 + 4x = 2x(3x + 2)$ وليس $2(3x^2 + 2x)$؟'}</MathText>}
                options={[
                  <MathText key="a">{'لأن $2(3x^2 + 2x)$ لا تساوي $6x^2 + 4x$'}</MathText>,
                  <MathText key="b">{'لأن $2x$ هو العامل المشترك الكامل: الحدّان $3x^2$ و $2x$ ما زال بينهما العامل المشترك $x$'}</MathText>,
                  <MathText key="c">{'لأن العامل المشترك يجب أن يحتوي دائمًا على أكبر قوّة لـ $x$ ، أي $x^2$'}</MathText>,
                ]}
                correct={1}
                cols={1}
                requires={['nashr-tawzii']}
                explain={<MathText>{`${KNOWLEDGE.examples[0]} — $2(3x^2 + 2x)$ صحيحة، لكن $3x^2 + 2x = x(3x + 2)$ : العامل المشترك $2x$ كاملًا هو ما وجدته بالصفوف ذات الارتفاع $x$. و $x^2$ لا يقسم $4x$.`}</MathText>}
                onAnswered={() => setQ1(true)}
              />
              {q1 && <KnowledgeBrick id="tahlil-taarif" variant="rappel" compact />}
              {q1 && <TextbookBox kind="definition" text={KNOWLEDGE.definition} source={KNOWLEDGE.source} compact />}
              {q1 && <KnowledgeBrick id="khassiya-tawziiya" lead="الصفوف المتماثلة للعشب، مكتوبة بالحروف:" />}
              {q1 && <p className="text-xs text-slate-500" data-correction-note><MathText>{KNOWLEDGE.correctionNote}</MathText></p>}
              {q1 && (
                <TapQuestion
                  prompt={<MathText>{'المثال الثاني: $5(x + 1) + 3x(x + 1) = $'}</MathText>}
                  options={[
                    <MathText key="a">{'$8x(x + 1)$'}</MathText>,
                    <MathText key="b">{'$(x + 1)(5 \\times 3x)$'}</MathText>,
                    <MathText key="c">{'$(x + 1)(5 + 3x)$'}</MathText>,
                  ]}
                  correct={2}
                  cols={3}
                  requires={['khassiya-tawziiya']}
                  explain={<MathText>{`العامل المشترك هو القوس $(x + 1)$ كلّه: ${KNOWLEDGE.examples[1]}. أمّا $5 + 3x$ فلا تساوي $8x$ (حدّان غير متشابهين).`}</MathText>}
                  onAnswered={() => setQ2(true)}
                />
              )}
            </div>
          ),
        },
        { num: 3, title: 'ورقة زميل: أين الخطأ؟', subtitle: 'جد السطر الخاطئ وصحّحه', done: q5,
          content: <PeerSheet sheet={PEER_SHEET} kid={PEER_KID} onDone={() => setQ5(true)} /> },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={2} variant="memo" />}
    />
  );
}
