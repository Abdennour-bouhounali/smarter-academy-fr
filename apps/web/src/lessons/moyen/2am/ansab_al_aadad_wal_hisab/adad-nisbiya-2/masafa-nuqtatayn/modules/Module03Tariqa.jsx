import { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { MethodSteps } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { METHOD } from '../content/textbook';

/**
 * Module 3 — طريقة (sans labo : le module s'ouvre sur sa PREMIÈRE question, §4quater) : calculer une distance (A(+4,5), B(−3)), la bonne façon de soustraire (C(−7), D(−2,5) : pourquoi pas dans l'autre sens),
 * puis les deux points à distance 3 de M(−1,5). La méthode et la brique viennent APRÈS la réponse. Le manuel n'a pas de طريقة pour cet item : la plateforme écrit la sienne. LP : P1, P2.
 */
const M = (s) => <MathText key={s}>{s}</MathText>;

export default function Module03Tariqa() {
  const [q, setQ] = useState({});
  const [read, setRead] = useState(false);
  const answered = (k) => () => setQ((s) => ({ ...s, [k]: true }));
  return (
    <ContentModule
      objectives={['كيف أحسب المسافة بين نقطتين؟', 'كيف أتجنّب مسافة سالبة؟', 'كيف أجد نقطتين على بعد معلوم من نقطة؟']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="طريقة — أحسب مسافة وأجد نقطتين"
      moduleSubtitle="الكبرى ناقص الصغرى، ثم أضيف وأطرح"
      estimatedTime="9 دقائق"
      steps={[
        {
          num: 1, title: 'كيف أحسب $AB$ ؟', subtitle: '$A(+4{,}5)$ و $B(-3)$', done: !!q.a && read,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<MathText>{'النقطتان $A(+4{,}5)$ و $B(-3)$ . أيّ كتابة تعطي المسافة $AB$ ؟'}</MathText>}
                options={[M('$(+4{,}5)-(-3)=(+4{,}5)+(+3)=7{,}5$'), M('$(+4{,}5)+(-3)=1{,}5$'), M('$(-3)-(+4{,}5)=-7{,}5$')]}
                correct={0} cols={1} requires={['qaidat-masafa']}
                explain={<MathText>{'الفاصلة الكبرى هي $+4{,}5$ فنطرح منها الصغرى $-3$ ، أي نضيف معاكسها: $7{,}5$ .'}</MathText>}
                onAnswered={answered('a')}
              />
              {q.a && <MethodSteps method={METHOD.distance} onAllRevealed={() => setRead(true)} />}
              {q.a && <KnowledgeBrick id="tariqa-masafa" lead="كيف نحسب مسافة ونجد نقطتين على بعد معلوم؟" />}
            </div>
          ),
        },
        {
          num: 2, title: 'ولماذا لا نطرح في الاتجاه الآخر؟', subtitle: '$C(-7)$ و $D(-2{,}5)$', done: !!q.b,
          content: (
            <TapQuestion
              prompt={<MathText>{'في $CD$ حيث $C(-7)$ و $D(-2{,}5)$ ، لماذا نطرح $-7$ من $-2{,}5$ ولا نفعل العكس؟'}</MathText>}
              options={[M('لأنّ $-2{,}5$ هي الفاصلة الكبرى، وفي العكس نجد $-4{,}5$ والمسافة لا تكون سالبة'), M('لأنّ $-7$ عدد سالب فلا يُطرح'), M('لأنّ الجهة اليمنى هي التي تُطرح دائمًا')]}
              correct={0} cols={1} requires={['qaidat-masafa']}
              explain={<MathText>{METHOD.reverse.read}</MathText>}
              onAnswered={answered('b')}
            />
          ),
        },
        {
          num: 3, title: 'كيف أجد النقطتين؟', subtitle: 'البعد $3$ عن $M(-1{,}5)$', done: !!q.c,
          content: (
            <TapQuestion
              prompt={<MathText>{'فاصلتا النقطتين اللتين تبعدان $3$ عن $M(-1{,}5)$ :'}</MathText>}
              options={[M('$+1{,}5$ و $-4{,}5$'), M('$+1{,}5$ فقط'), M('$-1{,}5$ و $+4{,}5$')]}
              correct={0} cols={3} requires={['nuqtatan']}
              explain={<MathText>{'نضيف $3$ إلى $-1{,}5$ فنجد $+1{,}5$ ، ونطرح $3$ منه فنجد $-4{,}5$ : نقطتان، واحدة من كلّ جهة.'}</MathText>}
              onAnswered={answered('c')}
            />
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={3} variant="memo" />}
    />
  );
}
