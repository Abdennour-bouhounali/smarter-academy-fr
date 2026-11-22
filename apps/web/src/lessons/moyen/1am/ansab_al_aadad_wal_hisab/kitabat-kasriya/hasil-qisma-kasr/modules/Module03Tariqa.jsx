import { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { MethodSteps } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { METHOD } from '../content/textbook';

/**
 * Module 3 — طريقة « إيجاد العدد الناقص » (AJOUT déclaré de la plateforme : le manuel n'a pas de طريقة pour cette leçon, `method: null`) :
 * 8 × … = 13 révélé ligne à ligne, la méthode (brique gardée par « أتوقّع القاعدة »), puis le piège « soustraire au lieu de diviser ».
 * LP : P2.
 */
const M = (s) => <MathText key={s}>{s}</MathText>;

export default function Module03Tariqa() {
  const [read, setRead] = useState(false);
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  return (
    <ContentModule
      objectives={['من أيّ عملية نبدأ لنجد العدد الناقص؟', 'ماذا نفعل إذا كان العدد الناقص عشريًا؟']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="طريقة — إيجاد العدد الناقص"
      moduleSubtitle="b × … = a"
      estimatedTime="9 دقائق"
      brief={{ tag: 'طريقة من المنصّة', title: METHOD.title, tone: 'emerald',
        body: <p>مثال محلول: اكشف الحلّ سطرًا سطرًا، وحاول أن تتوقّع السطر التالي.</p> }}
      steps={[
        { num: 1, title: 'حلّ مثال سطرًا سطرًا', subtitle: '8 × … = 13', done: q1,
          content: (
            <div className="space-y-3">
              <MethodSteps method={METHOD} onAllRevealed={() => setRead(true)} />
              {read && <KnowledgeBrick id="tariqat-adad-naqis" lead="الأطفال والكعكات: عدد الأطفال × الحصّة = عدد الكعكات." />}
              <TapQuestion
                prompt={<MathText>{'لإكمال $5\\times\\ldots=9$ قال سامي: «أطرح 5 من 9 فأجد 4». ما رأيك؟'}</MathText>}
                options={[M('خطأ: $5\\times 4=20$ ، العدد الناقص هو حاصل قسمة 9 على 5'), M('صحيح: $5\\times 4=9$'), M('صحيح: العدد الناقص هو $\\frac{5}{9}$')]}
                correct={0} cols={1} requires={['natija-darb']}
                explain={<MathText>{'العدد الناقص هو $9\\div 5=\\frac{9}{5}$ : $5\\times\\frac{9}{5}=9$.'}</MathText>}
                onAnswered={() => setQ1(true)}
              />
            </div>
          ) },
        { num: 2, title: 'عدد ناقص عشري', subtitle: '7 × … = 0,7', done: q2,
          content: (
            <TapQuestion
              prompt={<MathText>{'$7\\times\\ldots=0{,}7$ ، العدد الناقص هو:'}</MathText>}
              options={[M('$0{,}1$'), M('$7$'), M('$0{,}7$')]}
              correct={0} cols={3} requires={['natija-darb']}
              explain={<MathText>{'$0{,}7\\div 7=0{,}1$ : حاصل القسمة قد يكون عددًا عشريًا، $7\\times 0{,}1=0{,}7$.'}</MathText>}
              onAnswered={() => setQ2(true)}
            />
          ) },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={3} variant="memo" />}
    />
  );
}
