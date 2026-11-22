import { useState } from 'react';
import { parseDec } from '@smarter-academy/core';
import { ContentModule, NumericQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { MethodSteps, TextbookBox, TextbookExercise } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { METHOD } from '../content/textbook';
import { NOW_47_1 } from '../content/exercises';

/**
 * Module 3 — « طرائق » : « حل معادلة من الدرجة الأولى بمجهول واحد » : deux solutions de la plateforme révélées LIGNE À LIGNE (MethodSteps), puis la
 * méthode posée en brique (tariqat-hal), une vérification par substitution, et « دورك الآن » (rollout 2026-11-11 : plus aucun nombre ni mot du manuel).
 * LP : P2, P1.
 */
export default function Module03Tarayiq() {
  const [read1, setRead1] = useState(false);
  const [read2, setRead2] = useState(false);
  const [q3, setQ3] = useState(false);
  const [now, setNow] = useState({});
  const mark = (id) => () => setNow((d) => ({ ...d, [id]: true }));

  return (
    <ContentModule
      objectives={["ما العملية التي نجريها على الطرفين في كل سطر؟", "كيف نحلّ معادلة المجهول فيها في الطرفين؟", "كيف نتحقّق من أنّ العدد حلّ للمعادلة؟"]}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="طرائق — حل معادلة"
      moduleSubtitle="المجاهيل في طرف، والمعاليم في الطرف الآخر"
      estimatedTime="9 دقائق"
      brief={{
        tag: 'طرائق', title: METHOD.title, tone: 'emerald',
        body: <p>تمرينان محلولان. اقرأ كل سطر، وحاول توقّع السطر التالي قبل أن تكشفه: أيّ عملية ستُجرى على الطرفين؟</p>,
      }}
      steps={[
        {
          num: 1, title: 'معادلة أولى', subtitle: 'أ) — الحلّ سطرًا سطرًا', done: read1,
          content: (
            <div className="space-y-3">
              <TextbookBox kind="exercise" text={METHOD.exercise} source={METHOD.source} compact />
              <KnowledgeBrick id="muadala-tarafayn" variant="rappel" compact />
              <MethodSteps method={METHOD.a} onAllRevealed={() => setRead1(true)} />
            </div>
          ),
        },
        {
          num: 2, title: 'المجهول في الطرفين', subtitle: 'ب) — معاملات عشرية', done: read2,
          content: (
            <div className="space-y-3">
              <MethodSteps method={METHOD.b} onAllRevealed={() => setRead2(true)} />
              {read2 && <KnowledgeBrick id="tariqat-hal" lead="في الحلّين الخطوات نفسها:" />}
            </div>
          ),
        },
        {
          num: 3, title: 'نتحقّق بالتعويض', done: q3,
          content: (
            <NumericQuestion
              prompt={<MathText>{'من أجل $x = -3$ ، احسب الطرف الأيسر $2{,}4x + 1{,}5$ (ثم قارنه بالطرف الأيمن $1{,}2x - 2{,}1$).'}</MathText>}
              expected={-5.7}
              display="-5,7"
              parse={parseDec}
              requires={['tariqat-hal']}
              explain={<MathText>{'$2{,}4 \\times (-3) + 1{,}5 = -7{,}2 + 1{,}5 = -5{,}7$ و $1{,}2 \\times (-3) - 2{,}1 = -3{,}6 - 2{,}1 = -5{,}7$ : الطرفان متساويان، فالعدد $-3$ حل للمعادلة.'}</MathText>}
              onAnswered={() => setQ3(true)}
            />
          ),
        },
        {
          num: 4, title: 'دورك الآن', done: NOW_47_1.every((ex) => now[ex.id]),
          content: (
            <div className="space-y-3">
              {NOW_47_1.map((ex) => <TextbookExercise key={ex.id} exercise={ex} requires={['tariqat-hal']} onAnswered={mark(ex.id)} />)}
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={3} variant="memo" />}
    />
  );
}
