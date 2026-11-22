import { useState } from 'react';
import { ContentModule, TapQuestion } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { TextbookBox } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { CHALLENGE, ICT } from '../content/textbook';

/**
 * Module 5 — le تحدّ de l'unité (p. 51, « أين أضع الفاصلة؟ 235017/1000 », déclaré `duplicatedIn` cette leçon) : la
 * fraction décimale → l'écriture décimale (P2) ; puis la calculatrice de la p. 62 (a b/c) qui réduit et donne l'écriture
 * décimale, ou seulement une valeur approchée (1921/791 = 17/7) — et دوْرك الآن (285/684, 250/1250…). LP : P2, P3.
 */
const M = (s) => <MathText key={s}>{s}</MathText>;

export default function Module05Tahaddi() {
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  return (
    <ContentModule
      objectives={['أين نضع الفاصلة في كسر عشري؟', 'متى لا يكون للكسر كتابة عشرية؟']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(5)}
      moduleNumber={5}
      moduleTitle="تحدّي الوحدة — أين أضع الفاصلة؟"
      moduleSubtitle="235017 جزء من الألف"
      estimatedTime="7 دقائق"
      brief={{ tag: 'تحدّ — الكتاب ص 51 و 62', title: 'أين أضع الفاصلة؟', tone: 'rose', body: <p>تحدّي الصفحة الأولى من الباب، ثم الآلة الحاسبة التي تختزل الكسور وتعطي كتابتها العشرية.</p> }}
      steps={[
        { num: 1, title: 'التحدّي', subtitle: '235017/1000', done: q1,
          content: (
            <TapQuestion
              prompt={<MathText>{CHALLENGE.text}</MathText>}
              options={[M('2350,17'), M('235,017'), M('23,5017')]}
              correct={1} cols={3} requires={['kasr-ashri']}
              explain={<MathText>{'المقام 1000: ثلاثة أرقام بعد الفاصلة. $\\frac{235017}{1000}=235+\\frac{17}{1000}=235{,}017$.'}</MathText>}
              onAnswered={() => setQ1(true)}
            />
          ) },
        { num: 2, title: 'الآلة الحاسبة تختزل', subtitle: 'مثالا الكتاب', done: q2,
          content: (
            <div className="space-y-3">
              <TextbookBox kind="example" lines={[ICT.example1, ICT.example2]} source={ICT.source} compact />
              <TapQuestion
                prompt={<MathText>{'الشاشة تُظهر $\\frac{52}{65}=\\frac{4}{5}$. ما القاسم المشترك الذي استعملته الآلة؟'}</MathText>}
                options={[M('5'), M('13'), M('4')]}
                correct={1} cols={3} requires={['tariqat-ikhtizal']}
                explain={<MathText>{'$52=4\\times 13$ و $65=5\\times 13$ ؛ و $\\frac{4}{5}=\\frac{8}{10}=0{,}8$.'}</MathText>}
                onAnswered={() => setQ2(true)}
              />
            </div>
          ) },
        { num: 3, title: 'دوْرك الآن', subtitle: 'كسور الآلة الحاسبة', done: q3,
          content: (
            <div className="space-y-3">
              <TextbookBox kind="exercise" text={ICT.now} source={ICT.source} compact />
              <TapQuestion
                prompt={<MathText>{'الآلة تختزل $\\frac{285}{684}$ إلى $\\frac{5}{12}$ ، و $\\frac{250}{1250}$ إلى $\\frac{1}{5}$. أيّهما له كتابة عشرية مضبوطة؟'}</MathText>}
                options={[M('$\\frac{1}{5}=\\frac{2}{10}=0{,}2$ فقط'), M('$\\frac{5}{12}$ فقط'), M('الاثنان')]}
                correct={0} cols={1} requires={['kasr-ashri']}
                explain={<MathText>{'لا نجد مقامًا 10 أو 100 أو 1000 لـ $\\frac{5}{12}$ : الآلة تعطي قيمة مقرّبة 0,41 بالنقصان إلى 0,01.'}</MathText>}
                onAnswered={() => setQ3(true)}
              />
            </div>
          ) },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={5} variant="memo" />}
    />
  );
}
