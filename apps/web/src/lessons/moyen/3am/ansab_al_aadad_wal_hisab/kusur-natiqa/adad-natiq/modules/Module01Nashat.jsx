import { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { Manipulation, ManipulationWorkspace } from '../../../../../../common/manipulations';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 1 — l'ENTRÉE de la leçon, choisie par la plateforme (LESSON_DEVELOPMENT_GUIDE §4ter) : le حبل الأعداد. UNE SEULE PISTE (§4quater) : le labo `number-line-pegs` en haut, sans carte au-dessus —
 * il porte son contexte et SA question ; la main ACCROCHE chaque carte (une écriture a/b) là où elle croit que le nombre habite, puis le vent la fait glisser à son vrai piquet. Les ÉTAPES interrogent ce que
 * l'élève a FAIT, avec SES essais : où a atterri (−9)/(−12), entre quels entiers −7/3, et si une kitaba décimale exacte existe ; puis la forme modèle de 6/(−8) et l'ordre de trois nombres ناطقة. Les noms (briques)
 * viennent APRÈS la réponse. Le نشاط 5 du manuel (listes décimal ou non, signes, puis une droite à dessiner) est posé en applications (أتمرّن). LP : P1, P2, P3.
 */
const M = (s) => <MathText key={s}>{s}</MathText>;
const Ltr = ({ children }) => <bdi dir="ltr">{String(children)}</bdi>;

export default function Module01Nashat() {
  const [trials, setTrials] = useState([]);
  const [q, setQ] = useState({});
  const answered = (k) => () => setQ((s) => ({ ...s, [k]: true }));
  const record = (e) => setTrials((list) => [...list, e]);
  const settles = trials.filter((e) => e.kind === 'settle' && !e.free);
  const move = (taskId, card) => settles.filter((e) => e.taskId === taskId).flatMap((e) => e.moves).find((m) => m.card === card);
  const nine = move('w1', 'c3');           // (−9)/(−12) est la 4e carte de w1
  const seven = move('w2', 'c0');          // −7/3 est la 1re carte de w2

  const Evidence = ({ id, ok, done, todo }) => (
    <p data-evidence={id} data-tried={ok ? 'true' : 'false'}
      className={`rounded-xl border-2 px-3 py-2 text-sm ${ok ? 'border-emerald-200 bg-emerald-50 font-bold text-emerald-900' : 'border-slate-200 bg-white text-slate-500'}`}>
      {ok ? done : todo}
    </p>
  );

  return (
    <ContentModule
      objectives={['أين يستقرّ حاصل قسمة عددين سالبين؟', 'هل لكل حاصل قسمة مكان على المستقيم؟', 'ماذا نقول عن الكتابات المختلفة؟', 'كيف نرتّب أعدادًا ناطقة؟']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      moduleTitle="نشاط — حبل الأعداد"
      moduleSubtitle="علّق كلّ بطاقة حيث تظنّ أنّ عددها يقع"
      estimatedTime="14 دقيقة"
      intro={
        <ManipulationWorkspace
          levels={{
            beginner: () => <Manipulation type="number-line-pegs" level="beginner" onTrial={record} />,
            advanced: () => <Manipulation type="number-line-pegs" level="advanced" onTrial={record} />,
          }}
        />
      }
      steps={[
        {
          num: 1, title: 'جهة الصفر', subtitle: 'إشارتان سالبتان', done: !!q.a,
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="w1-nine" ok={!!nine}
                done={<span>في المهمة 1 استقرّت البطاقة <MathText>{'$\\frac{-9}{-12}$'}</MathText> عند <Ltr>{nine?.to}</Ltr> .</span>}
                todo="أنجز المهمة 1: علّق البطاقات واضغط «تحقّق»، ثم عُد إلى هذا السؤال." />
              {nine && (
                <TapQuestion
                  prompt={<MathText>{'في أيّ جهة من الصفر استقرّت البطاقة $\\frac{-9}{-12}$ ؟ ولماذا؟'}</MathText>}
                  options={[M('الجهة الموجبة: حاصل قسمة عددين سالبين موجب'), M('الجهة السالبة: فيها إشارتان سالبتان'), M('على الصفر نفسه')]}
                  correct={0} cols={1} requires={['qismat-nisbiyayn-3am']}
                  explain={<MathText>{'$\\frac{-9}{-12}=\\frac{9}{12}=\\frac{3}{4}$ : عددان لهما الإشارة نفسها، فالحاصل موجب (وقد تعلّمنا ذلك في درس حاصل قسمة عددين نسبيين).'}</MathText>}
                  onAnswered={answered('a')}
                />
              )}
            </div>
          ),
        },
        {
          num: 2, title: 'حاصل قسمة بلا كتابة عشرية', subtitle: '−7/3', done: !!q.b && !!q.b2,
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="w2-seven" ok={!!seven}
                done={<span>في المهمة 2 استقرّت البطاقة <MathText>{'$\\frac{-7}{3}$'}</MathText> عند <Ltr>{seven?.to}</Ltr> .</span>}
                todo="أنجز المهمة 2: علّق البطاقات واضغط «تحقّق»، ثم عُد إلى هذا السؤال." />
              {seven && (
                <>
                  <TapQuestion
                    prompt={<MathText>{'بين أيّ عددين صحيحين استقرّت البطاقة $\\frac{-7}{3}$ ؟'}</MathText>}
                    options={[M('بين $-3$ و $-2$'), M('بين $-2$ و $-1$'), M('بين $2$ و $3$')]}
                    correct={0} cols={3} requires={['muqarana-nisbiya-2am']}
                    explain={<MathText>{'$\\frac{7}{3}=2+\\frac{1}{3}$ ، فعلى يسار الصفر العدد $-\\frac{7}{3}$ بين $-3$ و $-2$ .'}</MathText>}
                    onAnswered={answered('b')}
                  />
                  {q.b && (
                    <TapQuestion
                      prompt={<MathText>{'هل للعدد $\\frac{-7}{3}$ كتابة عشرية تامّة؟'}</MathText>}
                      options={[M('لا: $7\\div3=2{,}333\\ldots$ لا تنتهي كتابته العشرية، ومع ذلك له مكان دقيق'), M('نعم: $-2{,}33$'), M('لا، لأنّه ليس عددًا')]}
                      correct={0} cols={1} requires={['hasil-qisma-kasr-1am']}
                      explain={<MathText>{'$-2{,}33$ قيمة مقرّبة فقط. العدد $\\frac{-7}{3}$ له مكان دقيق على الحبل وليست له كتابة عشرية تامّة.'}</MathText>}
                      onAnswered={answered('b2')}
                    />
                  )}
                  {q.b2 && <KnowledgeBrick id="adad-natiq" lead="ماذا نسمّي حاصل قسمة عدد نسبي على عدد نسبي غير معدوم؟" />}
                </>
              )}
            </div>
          ),
        },
        {
          num: 3, title: 'كتابة واحدة لعدد واحد', subtitle: '6/(−8)', done: !!q.c,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<MathText>{'استقرّت البطاقتان $\\frac{6}{-8}$ و $\\frac{-3}{4}$ على الملقط نفسه. اكتب $\\frac{6}{-8}$ بمقام موجب وعلى أبسط شكل:'}</MathText>}
                options={[M('$-\\frac{3}{4}$'), M('$\\frac{3}{4}$'), M('$-\\frac{4}{3}$')]}
                correct={0} cols={3} requires={['adad-natiq']}
                explain={<MathText>{'$\\frac{6}{-8}=\\frac{-6}{8}=-\\frac{6}{8}=-\\frac{3}{4}$ . ($\\frac{3}{4}$ أسقط الإشارة؛ $-\\frac{4}{3}$ قلب الكسر.)'}</MathText>}
                onAnswered={answered('c')}
              />
              {q.c && <KnowledgeBrick id="maqam-mujab" lead="كيف نكتب عددًا ناطقًا بكتابة معيارية واحدة؟" />}
            </div>
          ),
        },
        {
          num: 4, title: 'ترتيب ثلاثة أعداد', subtitle: 'بالمقام 12', done: !!q.d,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<MathText>{'رتّب تصاعديًّا: $-\\frac{7}{4}$ ، $-\\frac{2}{3}$ ، $\\frac{5}{6}$ .'}</MathText>}
                options={[M('$-\\frac{7}{4}<-\\frac{2}{3}<\\frac{5}{6}$'), M('$-\\frac{2}{3}<-\\frac{7}{4}<\\frac{5}{6}$'), M('$\\frac{5}{6}<-\\frac{2}{3}<-\\frac{7}{4}$')]}
                correct={0} cols={1} requires={['maqam-mujab']}
                explain={<MathText>{'بالمقام $12$ : $-\\frac{21}{12}$ ، $-\\frac{8}{12}$ ، $\\frac{10}{12}$ ، و $-21<-8<10$ . (على يسار الصفر الأبعد عن الصفر هو الأصغر.)'}</MathText>}
                onAnswered={answered('d')}
              />
              {q.d && <KnowledgeBrick id="tartib-natiqa" lead="كيف نرتّب أعدادًا ناطقة مكتوبة بمقامات مختلفة؟" />}
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={1} variant="memo" />}
    />
  );
}
