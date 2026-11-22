import { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { MethodSteps } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { METHOD_CONVERT } from '../content/textbook';

/**
 * Module 3 — طريقة 1 « الانتقال بين الكتابة العشرية والكسر العشري » (P2). Pas de labo (celui du module 1 a déjà posé les deux sens) :
 * UNE SEULE PISTE (guide §4quater) — l'élève ESSAIE d'abord (31,25 → fraction), puis lit la solution ligne à ligne, puis la brique
 * (gardée par « أتوقّع القاعدة »), puis deux transferts : un zéro qui garde sa place (0,07) et un zéro à ajouter (52/1000 → 0,052).
 */
const M = (s) => <MathText key={s}>{s}</MathText>;

export default function Module03Tariqa() {
  const [read, setRead] = useState(false);
  const [q0, setQ0] = useState(false);
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  return (
    <ContentModule
      objectives={['كيف أكتب عددًا عشريًا على شكل كسر؟', 'كيف أضع الفاصلة انطلاقًا من كسر عشري؟']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="طريقة — من الكتابة العشرية إلى الكسر العشري وبالعكس"
      moduleSubtitle="31,25 و 9345/1000"
      estimatedTime="7 دقائق"
      steps={[
        { num: 1, title: 'جرّب قبل أن ترى الطريقة', subtitle: '31,25', done: q0,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<span>اكتب <bdi dir="ltr">31,25</bdi> على شكل كسر عشري. أيّ هذه الكتابات صحيحة؟</span>}
                options={[M('$\\frac{3125}{100}$'), M('$\\frac{3125}{10}$'), M('$\\frac{31}{25}$')]}
                correct={0} cols={3} requires={['kitaba-bifasila']}
                explain={<MathText>{'رقمان بعد الفاصلة: أجزاء من مائة، و 3125 هي الأرقام كلها بلا فاصلة. $\\frac{3125}{10}=312{,}5$ و $\\frac{31}{25}$ ليس كسرًا عشريًا.'}</MathText>}
                onAnswered={() => setQ0(true)}
              />
            </div>
          ) },
        { num: 2, title: 'الطريقة سطرًا سطرًا', subtitle: 'ومثال بالعكس', done: q1,
          content: (
            <div className="space-y-3">
              <MethodSteps method={METHOD_CONVERT} onAllRevealed={() => setRead(true)} />
              {read && <KnowledgeBrick id="tariqat-intiqal" lead="31,25 و 9345/1000: ما الذي عددناه في كل مثال؟" />}
              <TapQuestion
                prompt={<span>اكتب <bdi dir="ltr">0,07</bdi> على شكل كسر عشري:</span>}
                options={[M('$\\frac{7}{100}$'), M('$\\frac{7}{10}$'), M('$\\frac{7}{1000}$')]}
                correct={0} cols={3} requires={['tariqat-intiqal']}
                explain={<MathText>{'رقمان بعد الفاصلة (0 و 7): المقام 100، والبسط 7 لأنّ $007=7$ . $\\frac{7}{10}$ هو $0{,}7$ .'}</MathText>}
                onAnswered={() => setQ1(true)}
              />
            </div>
          ) },
        { num: 3, title: 'صفر يلزم أن نضيفه', subtitle: '52/1000', done: q2,
          content: (
            <TapQuestion
              prompt={<span>اكتب <MathText>{'$\\frac{52}{1000}$'}</MathText> بالفاصلة:</span>}
              options={[M('$0{,}052$'), M('$0{,}52$'), M('$5{,}2$')]}
              correct={0} cols={3} requires={['tariqat-intiqal']}
              explain={<MathText>{'المقام 1000 فيه ثلاثة أصفار: ثلاثة أرقام بعد الفاصلة. لا يوجد في 52 إلّا رقمان، فنضيف صفرًا: $0{,}052$ .'}</MathText>}
              onAnswered={() => setQ2(true)}
            />
          ) },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={3} variant="memo" />}
    />
  );
}
