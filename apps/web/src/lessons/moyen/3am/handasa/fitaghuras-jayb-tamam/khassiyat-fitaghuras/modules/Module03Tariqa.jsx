import { useState } from 'react';
import { parseDec } from '@smarter-academy/core';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { MethodSteps, TextbookBox } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { METHOD_SIDE, METHOD_NOT_RIGHT, KNOWLEDGE, LADDER, SURD20 } from '../content/textbook';

/**
 * Module 3 — طريقة (P2, P3, P4). Pas de labo ici : UNE SEULE PISTE (guide §4quater) qui commence par la question à ESSAYER — l'échelle
 * contre le mur (un côté de l'angle droit : on SOUSTRAIT, ce que le labo n'a pas montré) ; puis la méthode ligne à ligne (hypoténuse exacte,
 * côté de l'angle droit √20 avec la touche √), la brique, un arrondi ; puis prouver « غير قائم » par le plus long côté (le triangle KLM qui
 * a l'air droit), la brique et un transfert. La touche √ est la touche SEULEMENT (no-rebuild : jidhr-tarbii construit la racine en 4AM).
 */
const M = (s) => <MathText key={s}>{s}</MathText>;
const Ltr = ({ children }) => <bdi dir="ltr">{children}</bdi>;

export default function Module03Tariqa() {
  const [q1, setQ1] = useState(false);
  const [read1, setRead1] = useState(false);
  const [q2, setQ2] = useState(false);
  const [read2, setRead2] = useState(false);
  const [q3, setQ3] = useState(false);
  return (
    <ContentModule
      objectives={['كيف نحسب ضلعا قائما إذا عرفنا الوتر؟', 'ما القيمة المضبوطة وما القيمة المقرّبة لطول؟', 'كيف نُثبت أنّ مثلثا غير قائم؟']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="طريقة — أحسب طول ضلع وأُثبت أنّ مثلثا غير قائم"
      moduleSubtitle="الوتر والضلع القائم · اللمسة √ · أطول الأضلاع"
      estimatedTime="12 دقيقة"
      steps={[
        {
          num: 1, title: 'جرّب قبل أن ترى الطريقة: إلى أيّ ارتفاع يصل السلّم؟', subtitle: 'سلّم على حائط', done: q1,
          content: (
            <div className="space-y-3">
              <NumericQuestion
                prompt={<span>يساعد سمير جدّه في طلاء الحائط: سلّم طوله <Ltr>{LADDER.ladder} m</Ltr> مسنود إلى حائط عمودي على الأرض، وقدمه على بعد <Ltr>{LADDER.foot} m</Ltr> من الحائط. على أيّ ارتفاع (بالمتر) يلمس السلّم الحائط؟</span>}
                expected={2.4} display={LADDER.height} parse={parseDec} requires={['hisab-watar']}
                explain={<MathText>{'الحائط والأرض يصنعان زاوية قائمة، والسلّم هو الوتر: $h^2=2{,}5^2-0{,}7^2=6{,}25-0{,}49=5{,}76$ ، و $2{,}4^2=5{,}76$ ، إذن $h=2{,}4\\,\\mathrm{m}$.'}</MathText>}
                onAnswered={() => setQ1(true)}
              />
              {q1 && <KnowledgeBrick id="hisab-dil" lead="عرفتَ الوتر وضلعا قائما: بأيّ عملية على المربعات وجدتَ الضلع الآخر؟" />}
            </div>
          ),
        },
        {
          num: 2, title: 'الطريقة سطرًا سطرًا، ثم القيمة المقرّبة', subtitle: 'الوتر، الضلع القائم، اللمسة √', done: q2,
          content: (
            <div className="space-y-3">
              <MethodSteps method={METHOD_SIDE} onAllRevealed={() => setRead1(true)} />
              {read1 && <TextbookBox kind="remark" compact text={KNOWLEDGE.root.text} source={KNOWLEDGE.root.source} />}
              {read1 && <KnowledgeBrick id="lamsa-jidhr" compact />}
              <TapQuestion
                prompt={<span>الآلة الحاسبة تعرض <Ltr>√20 = {SURD20.screen}</Ltr>. ما القيمة المقرّبة إلى <Ltr>0,1</Ltr> للطول <Ltr>DF</Ltr>؟</span>}
                options={[M(`$${SURD20.rounded1.replace(',', '{,}')}\\,\\mathrm{cm}$`), M(`$${SURD20.truncated1.replace(',', '{,}')}\\,\\mathrm{cm}$`), M('$10\\,\\mathrm{cm}$')]}
                correct={0} cols={3} requires={['lamsa-jidhr']}
                explain={<MathText>{'الرقم بعد رقم الأعشار هو 7 (أكبر من 5)، فندوّر بالزيادة: $\\sqrt{20}\\approx4{,}5$. أمّا 4,4 فبتر لا تدوير، و 10 هو $20\\div2$ لا الجذر.'}</MathText>}
                onAnswered={() => setQ2(true)}
              />
            </div>
          ),
        },
        {
          num: 3, title: 'المثلث KLM يبدو قائما: هل هو قائم؟', subtitle: 'أطول الأضلاع', done: q3,
          content: (
            <div className="space-y-3">
              <MethodSteps method={METHOD_NOT_RIGHT} onAllRevealed={() => setRead2(true)} />
              {read2 && <KnowledgeBrick id="ithbat-ghayr-qaim" lead="في المثلث KLM: أيّ مربع قارنتَه بأيّ مجموع؟" />}
              <TapQuestion
                prompt={<span>مثلث أطوال أضلاعه <Ltr>8 cm</Ltr> و <Ltr>9 cm</Ltr> و <Ltr>12 cm</Ltr>، و <Ltr>8² + 9² = 145</Ltr>. ما الإجابة الصحيحة؟</span>}
                options={[
                  M('غير قائم، لأنّ $12^2=144\\neq145$'),
                  M('قائم، لأنّ 144 قريب جدا من 145'),
                  M('نقارن $8^2$ بـ $9^2+12^2$ لأنّ 8 أصغر الأضلاع'),
                ]}
                correct={0} cols={1} requires={['ithbat-ghayr-qaim']}
                explain={<MathText>{'لو كان قائما لكان وتره أطول أضلاعه 12: نقارن $12^2=144$ بـ $8^2+9^2=145$. العددان مختلفان، فالمثلث غير قائم، مهما كان الفرق صغيرا.'}</MathText>}
                onAnswered={() => setQ3(true)}
              />
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={3} variant="memo" />}
    />
  );
}
