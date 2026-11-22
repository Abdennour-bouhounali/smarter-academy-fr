import { useState } from 'react';
import { parseDec } from '@smarter-academy/core';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { Manipulation, ManipulationWorkspace } from '../../../../../../common/manipulations';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 1 — l'ENTRÉE de la leçon, choisie par la plateforme (LESSON_DEVELOPMENT_GUIDE §4ter) : la machine à teinter. UNE SEULE PISTE (§4quater) : le labo `shade-match` en haut, sans carte
 * au-dessus — il porte son contexte et SA question ; la main VERSE le bleu, le nombre de mesures est la variable. Les ÉTAPES interrogent ce que l'élève a FAIT, avec SES essais : pourquoi 6 bleus
 * pour 8 blancs (les deux produits en croix), ce que disent 7 et 8 bleus quand AUCUN entier ne convient (le plus clair, le plus foncé : les produits en croix COMPARENT), puis le même verdict sur un
 * dénominateur commun. Les noms (briques) viennent APRÈS la réponse. Le نشاط 2 du manuel (une preuve) est posé en معارف, le نشاط 3 en application (أتمرّن).
 */
const M = (s) => <MathText key={s}>{s}</MathText>;
const Ltr = ({ children }) => <bdi dir="ltr">{String(children)}</bdi>;

export default function Module01Nashat() {
  const [trials, setTrials] = useState([]);
  const [q, setQ] = useState({});
  const answered = (k) => () => setQ((s) => ({ ...s, [k]: true }));
  const record = (e) => setTrials((list) => [...list, e]);
  const mine = trials.filter((e) => !e.free);
  const s1 = mine.findLast((e) => e.kind === 'release' && e.mission === 's1' && e.ok);
  const lo = mine.findLast((e) => e.kind === 'release' && e.mission === 's3' && e.verdict === 'lighter');
  const hi = mine.findLast((e) => e.kind === 'release' && e.mission === 's3' && e.verdict === 'darker');
  const s3 = mine.findLast((e) => e.kind === 'impossible' && e.mission === 's3' && e.ok);

  const Evidence = ({ id, ok, done, todo }) => (
    <p data-evidence={id} data-tried={ok ? 'true' : 'false'}
      className={`rounded-xl border-2 px-3 py-2 text-sm ${ok ? 'border-emerald-200 bg-emerald-50 font-bold text-emerald-900' : 'border-slate-200 bg-white text-slate-500'}`}>
      {ok ? done : todo}
    </p>
  );

  return (
    <ContentModule
      objectives={['متى يطابق لون دلو لونَ المرجع؟', 'ماذا لو لم يوجد عدد صحيح؟', 'كيف أقارن كسرين بالجداءين المتصالبين؟', 'هل أكتب الكسرين بنفس المقام؟']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      moduleTitle="نشاط — آلة مزج الألوان"
      moduleSubtitle="طابِق لون الدلو الثاني لون المرجع"
      estimatedTime="14 دقيقة"
      intro={
        <ManipulationWorkspace
          levels={{
            beginner: () => <Manipulation type="shade-match" level="beginner" onTrial={record} />,
            advanced: () => <Manipulation type="shade-match" level="advanced" onTrial={record} />,
          }}
        />
      }
      steps={[
        {
          num: 1, title: 'لماذا طابق اللون؟', subtitle: 'جداءان متساويان', done: !!q.a && !!q.a2,
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="s1" ok={!!s1}
                done={<span>في المهمة 1 طابق اللون حين صببتَ <Ltr>{s1?.c}</Ltr> طلقات مع <Ltr>{s1?.d}</Ltr> علب أبيض، ومرجعك <Ltr>{s1?.a}</Ltr> أزرق مع <Ltr>{s1?.b}</Ltr> أبيض.</span>}
                todo="أنجز المهمة 1 في الآلة حتى يطابق الدلو الثاني المرجع، ثم عُد إلى هذا السؤال." />
              <NumericQuestion
                prompt={<MathText>{'ما قيمة $6\\times4$ (أزرق الدلو الثاني × أبيض المرجع)؟'}</MathText>}
                expected={24} display="24" parse={parseDec} requires={['kasr-mutasawi-1am']}
                explain={<MathText>{'$6\\times4=24$ .'}</MathText>}
                onAnswered={answered('a')}
              />
              {q.a && (
                <NumericQuestion
                  prompt={<MathText>{'وما قيمة $3\\times8$ (أزرق المرجع × أبيض الدلو الثاني)؟'}</MathText>}
                  expected={24} display="24" parse={parseDec} requires={['kasr-mutasawi-1am']}
                  explain={<MathText>{'$3\\times8=24$ : الجداءان المتصالبان متساويان.'}</MathText>}
                  onAnswered={answered('a2')}
                />
              )}
              {q.a2 && <KnowledgeBrick id="jidaa-mutasalib" lead="الجداءان 6 × 4 و 3 × 8 متساويان: متى يطابق لونُ دلو لونَ المرجع؟" />}
            </div>
          ),
        },
        {
          num: 2, title: 'وإذا لم ينجح أيّ عدد صحيح؟', subtitle: 'الجداءان يقارنان', done: !!q.b,
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="s3" ok={!!lo && !!hi}
                done={<span>في المهمة 3 كانت <Ltr>{lo?.c}</Ltr> طلقات أفتح من المرجع و <Ltr>{hi?.c}</Ltr> طلقات أغمق منه.</span>}
                todo="أنجز المهمة 3 في الآلة (جرّب العددين المتجاورين حول المطابقة)، ثم عُد إلى هذا السؤال." />
              <TapQuestion
                prompt={<MathText>{'قارن $3\\times10$ و $7\\times4$ ، ثمّ أكمل: $\\frac{7}{10}\\;\\square\\;\\frac{3}{4}$ :'}</MathText>}
                options={[M('$30>28$ ، إذن $\\frac{7}{10}<\\frac{3}{4}$'), M('$30>28$ ، إذن $\\frac{7}{10}>\\frac{3}{4}$'), M('$30=28$ ، إذن $\\frac{7}{10}=\\frac{3}{4}$')]}
                correct={0} cols={1} requires={['muqarana-kasrayn-2am']}
                explain={<MathText>{'مع $10$ علب أبيض كان $7$ طلقات أفتح من المرجع $\\frac{3}{4}$ ، أي أصغر نسبةً للأزرق، وهذا ما يقوله الجداء الأصغر: $7\\times4=28<30=3\\times10$ .'}</MathText>}
                onAnswered={answered('b')}
              />
              {q.b && <KnowledgeBrick id="muqarana-mutasalib" lead="الجداء الأصغر يدلّ على الكسر الأصغر: كيف نصوغ ذلك؟" />}
            </div>
          ),
        },
        {
          num: 3, title: 'بنفس المقام', subtitle: 'مضاعف مشترك', done: !!q.c && !!q.c2 && !!q.c3,
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="s3b" ok={!!s3}
                done={<span>أثبتَّ في المهمة 3 أنّ لا عدد صحيح يطابق: أقرب عددين <Ltr>{lo?.c}</Ltr> و <Ltr>{hi?.c}</Ltr> .</span>}
                todo="أنهِ المهمة 3 بزرّ «لا يوجد عدد صحيح»، ثم عُد إلى هذا السؤال." />
              <NumericQuestion
                prompt={<MathText>{'اكتب $\\frac{3}{4}$ بالمقام $20$ . البسط:'}</MathText>}
                expected={15} display="15" parse={parseDec} requires={['kasr-mutasawi-1am']}
                explain={<MathText>{'$20\\div4=5$ و $3\\times5=15$ : $\\frac{3}{4}=\\frac{15}{20}$ .'}</MathText>}
                onAnswered={answered('c')}
              />
              {q.c && (
                <NumericQuestion
                  prompt={<MathText>{'واكتب $\\frac{7}{10}$ بالمقام $20$ . البسط:'}</MathText>}
                  expected={14} display="14" parse={parseDec} requires={['kasr-mutasawi-1am']}
                  explain={<MathText>{'$20\\div10=2$ و $7\\times2=14$ : $\\frac{7}{10}=\\frac{14}{20}$ ، و $14<15$ فنجد النتيجة نفسها.'}</MathText>}
                  onAnswered={answered('c2')}
                />
              )}
              {q.c2 && (
                <TapQuestion
                  prompt={<MathText>{'أيّ مقام آخر كان يصلح لكتابة $\\frac{3}{4}$ و $\\frac{7}{10}$ معًا؟'}</MathText>}
                  options={[M('$40$'), M('$14$'), M('$30$')]}
                  correct={0} cols={3} requires={['muqarana-kasrayn-2am']}
                  explain={<MathText>{'المقام المشترك مضاعف للمقامين $4$ و $10$ : $40=4\\times10$ . ($14=4+10$ ليس مضاعفًا لـ $4$ ؛ و $30$ ليس مضاعفًا لـ $4$ .)'}</MathText>}
                  onAnswered={answered('c3')}
                />
              )}
              {q.c3 && <KnowledgeBrick id="tawhid-maqamat" lead="نكتب الكسرين بنفس المقام لنقارنهما: ماذا يجب أن يكون هذا المقام؟" />}
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={1} variant="memo" />}
    />
  );
}
