import { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { Manipulation, ManipulationWorkspace } from '../../../../../../common/manipulations';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { GUIDE } from '../content/textbook';

/**
 * Module 1 — l'ENTRÉE de la leçon, choisie par la plateforme (LESSON_DEVELOPMENT_GUIDE §4ter) : « ميزان العطّار ». UNE SEULE PISTE (§4quater) : le labo
 * `scoop-scale` en haut, sans carte au-dessus — il porte son contexte et SA question ; la main tient la MASSE. Les ÉTAPES interrogent ce que l'élève a FAIT, avec
 * SES essais (`onTrial`, événements `deliver`) : pourquoi l'écran lit 1,3 dès 1,25 (P3), ce que lit l'écran à la masse qui suit la dernière (le bout exclu), le même
 * intervalle quand l'écran arrondit au kilo, et le piège du quotient (P2, P4). Les noms (briques) viennent APRÈS la réponse. Le نشاط 3 du manuel (un périmètre dont le
 * mudawwar est 10,7) est posé en application au module 4.
 */
const M = (s) => <MathText key={s}>{s}</MathText>;
const Ltr = ({ children }) => <bdi dir="ltr">{String(children)}</bdi>;
const tex = (txt) => String(txt).replace(',', '{,}');
const trim = (txt) => (String(txt).includes(',') ? String(txt).replace(/0+$/, '').replace(/,$/, '') : String(txt));
const nextReading = (txt, rank) => {
  const [a, b = ''] = String(txt).split(',');
  const n = BigInt(a + b) + 1n;
  const s = String(n).padStart(b.length + 1, '0');
  return rank > 0 ? `${s.slice(0, s.length - b.length)},${s.slice(s.length - b.length)}` : s;
};

export default function Module01Nashat() {
  const [trials, setTrials] = useState([]);
  const [q, setQ] = useState({});
  const answered = (k) => () => setQ((s) => ({ ...s, [k]: true }));
  // les questions posées PENDANT le labo (checkpoint-done) : la TRACE de l'étape ; si l'enseignant les coupe, les questions d'ici reprennent
  const [cp, setCp] = useState({});
  const record = (e) => { if (e.tk) { if (e.tk === 'checkpoint-done') setCp((c) => ({ ...c, [e.id]: true })); return; } setTrials((list) => [...list, e]); };
  const mine = trials.filter((e) => e.kind === 'deliver' && !e.free && e.taskKind !== 'trap' && e.ok);
  const least = mine.findLast((e) => e.phase === 'least' && e.rank >= 1);
  const most = least ? mine.findLast((e) => e.phase === 'most' && e.rank === least.rank && e.reading === least.reading) : null;
  const least0 = mine.findLast((e) => e.phase === 'least' && e.rank === 0);
  const most0 = least0 ? mine.findLast((e) => e.phase === 'most' && e.rank === 0 && e.reading === least0.reading) : null;
  const trap = trials.filter((e) => e.kind === 'deliver' && !e.free && e.taskKind === 'trap' && e.ok);
  const trapLo = trap.findLast((e) => e.phase === 'heavyLight');
  const trapHi = trap.findLast((e) => e.phase === 'lightHeavy');
  const hasTrap = !!(trapLo && trapHi);

  const Evidence = ({ id, ok, done, todo }) => (
    <p data-evidence={id} data-tried={ok ? 'true' : 'false'}
      className={`rounded-xl border-2 px-3 py-2 text-sm ${ok ? 'border-emerald-200 bg-emerald-50 font-bold text-emerald-900' : 'border-slate-200 bg-white text-slate-500'}`}>
      {ok ? done : todo}
    </p>
  );

  return (
    <ContentModule
      objectives={['ما كلّ الكمّيات التي تقرأ عليها الشاشة العدد نفسه؟', 'هل تدخل حدود هذه الكمّيات فيها؟', 'وماذا يتغيّر إذا دوّرت الشاشة إلى الكيلوغرام؟', 'وهل يبلغ ميزانٌ حاصل القسمة 2/7؟']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      moduleTitle="نشاط — ميزان العطّار"
      moduleSubtitle="شاشة تدوِّر الكتلة"
      estimatedTime="14 دقيقة"
      intro={
        <ManipulationWorkspace
          levels={{
            beginner: () => <Manipulation type="scoop-scale" level="beginner" onTrial={record} />,
            advanced: () => <Manipulation type="scoop-scale" level="advanced" onTrial={record} />,
          }}
        />
      }
      steps={[
        {
          num: 1, title: 'لماذا تقرأ الشاشة هذا العدد؟', subtitle: 'أصغر كمّية', done: !!q.a || !!cp.t1,
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="least" ok={!!least}
                done={<span>أقلّ كمّية قرأت عليها الشاشة <Ltr>{least?.reading}</Ltr> هي <Ltr>{least?.mass} kg</Ltr> ، وبحفنة أقلّ (<Ltr>{least?.neighbour.mass} kg</Ltr>) قرأت <Ltr>{least?.neighbour.reading}</Ltr> .</span>}
                todo="في المهمة الأولى املأ الكيس بأقلّ كمّية ممكنة تقرأ عليها الشاشة العدد المطلوب ثم سلّمه، وعُد إلى هذا السؤال." />
              {least && !cp.t1 && (
                <TapQuestion
                  prompt={<span>لماذا تقرأ الشاشة <Ltr>{least.reading}</Ltr> عند <Ltr>{least.mass} kg</Ltr> وليس <Ltr>{least.neighbour.reading}</Ltr> ؟</span>}
                  options={[
                    `لأنّ ${least.mass} في منتصف المسافة بين ${least.neighbour.reading} و ${least.reading}، وفي المنتصف تأخذ الشاشة العلامة الأكبر`,
                    'لأنّ الشاشة تحذف الأرقام الزائدة من الكتلة',
                    'لأنّ الشاشة تأخذ دائمًا العلامة الأعلى',
                  ]}
                  correct={0} cols={1} requires={['tadwir-wahda']}
                  explain={<MathText>{'عند منتصف المسافة بين علامتين تأخذ الشاشة العليا؛ وبحفنة أقلّ نصبح أقرب إلى السفلى فتقرأها. والحذف يعطي العلامة السفلى دائمًا، والأعلى دائمًا لا تفسّر ما قرأتَه عند الحفنة الأقلّ.'}</MathText>}
                  onAnswered={answered('a')}
                />
              )}
              {(q.a || cp.t1) && <KnowledgeBrick id="tadwir" lead="كيف تختار الشاشة العدد الذي تكتبه؟" />}
            </div>
          ),
        },
        {
          num: 2, title: 'وما كلّ الكمّيات التي تقرأ عليها الشاشة هذا العدد؟', subtitle: 'أكبر كمّية', done: (!!q.b && !!q.b2) || !!cp.t2,
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="most" ok={!!most}
                done={<span>أكبر كمّية قرأت عليها الشاشة <Ltr>{most?.reading}</Ltr> هي <Ltr>{most?.mass} kg</Ltr> ، وبحفنة أكثر (<Ltr>{most?.neighbour.mass} kg</Ltr>) قرأت <Ltr>{most?.neighbour.reading}</Ltr> .</span>}
                todo="في المهمة الثانية املأ الكيس بأكبر كمّية ممكنة تقرأ عليها الشاشة العدد نفسه ثم سلّمه، وعُد إلى هذا السؤال." />
              {most && !cp.t2 && (
                <TapQuestion
                  prompt={<span>عند <Ltr>{most.neighbour.mass} kg</Ltr> ماذا قرأت الشاشة؟</span>}
                  options={[<Ltr key="a">{most.reading}</Ltr>, <Ltr key="b">{most.neighbour.reading}</Ltr>, <Ltr key="c">{most.neighbour.mass}</Ltr>]}
                  correct={1} cols={3} requires={['tadwir']}
                  explain={<MathText>{'عند هذه الكتلة تقرأ الشاشة العدد الذي يلي: لذلك لا تدخل هذه الكتلة بين الكتل التي تقرأ العدد المطلوب.'}</MathText>}
                  onAnswered={answered('b')}
                />
              )}
              {q.b && most && !cp.t2 && (
                <TapQuestion
                  prompt={<span>إذن كلّ كمّية <MathText>{'$m$'}</MathText> تقرأ عليها الشاشة <Ltr>{most.reading}</Ltr> تحقّق:</span>}
                  options={[
                    M(`$${tex(least.mass)}\\leq m<${tex(most.neighbour.mass)}$`),
                    M(`$${tex(least.mass)}\\leq m\\leq ${tex(most.neighbour.mass)}$`),
                    M(`$${tex(most.reading)}\\leq m<${tex(nextReading(most.reading, most.rank))}$`),
                    M(`$${tex(least.neighbour.reading)}<m<${tex(nextReading(most.reading, most.rank))}$`),
                  ]}
                  correct={0} cols={1} requires={['tadwir']}
                  explain={<MathText>{`${GUIDE.halfOpen} نصف الرتبة يُطرح من العدد المقروء ويُضاف إليه.`}</MathText>}
                  onAnswered={answered('b2')}
                />
              )}
              {(q.b2 || cp.t2) && <KnowledgeBrick id="hasr-min-mudawwar" lead="كيف نحصر عددًا علمنا مدوّره؟" />}
            </div>
          ),
        },
        {
          num: 3, title: 'وعلى الميزان الذي يدوِّر إلى الكيلوغرام؟', subtitle: 'الرتبة', done: !!q.c || !!cp.t3,
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="coarse" ok={!!most0}
                done={<span>على ميزان الأكياس الكبيرة: أقلّ كمّية قرأت <Ltr>{least0?.reading}</Ltr> هي <Ltr>{least0?.mass} kg</Ltr> وأكبرها <Ltr>{most0?.mass} kg</Ltr> .</span>}
                todo="في المهمة الثالثة (ميزان الأكياس الكبيرة) جد أقلّ كمّية وأكبر كمّية تقرأ عليهما الشاشة العدد نفسه، ثم عُد إلى هذا السؤال." />
              {most0 && !cp.t3 && (
                <TapQuestion
                  prompt={<span>على ميزان الأكياس الكبيرة قرأت الشاشة <Ltr>{most0.reading}</Ltr> : من أيّ كمّية إلى أيّ كمّية؟</span>}
                  options={[
                    M(`$${tex(trim(least0.mass))}\\leq m<${tex(trim(most0.neighbour.mass))}$`),
                    M(`$${tex(`${Number(most0.reading) - 1},95`)}\\leq m<${tex(`${Number(most0.reading)},05`)}$`),
                    M(`$${tex(most0.reading)}\\leq m<${tex(String(Number(most0.reading) + 1))}$`),
                  ]}
                  correct={0} cols={1} requires={['hasr-min-mudawwar']}
                  explain={<MathText>{'نصف الرتبة هنا هو نصف كيلوغرام، لا خمسة أجزاء من مئة: كلما كبرت الرتبة اتّسع المجال.'}</MathText>}
                  onAnswered={answered('c')}
                />
              )}
            </div>
          ),
        },
        {
          num: 4, title: 'وهل يبلغ ميزانٌ كيس الفلفل النموذجي؟', subtitle: 'المتقدّم', done: !!q.d || !hasTrap || !!cp.a3,
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="trap" ok={hasTrap}
                done={<span>أثقل كيس أخفّ من النموذج <Ltr>{trapLo?.mass} kg</Ltr> ، وأخفّ كيس أثقل منه <Ltr>{trapHi?.mass} kg</Ltr> .</span>}
                todo="اختياري: افتح المستوى المتقدّم وأنهِ مهمّة كيس الفلفل، ثم عُد إلى هذا السؤال." />
              {hasTrap && !cp.a3 && (
                <TapQuestion
                  prompt={<span>هل يمكن أن يتوازن الكيس والنموذج على هذا الميزان؟</span>}
                  options={[
                    M('لا: $\\frac{2}{7}=0{,}285714\\ldots$ ليس له عدد منتهٍ من الأرقام'),
                    M('نعم عند $0{,}2855$'),
                    M('نعم عند $0{,}286$'),
                  ]}
                  correct={0} cols={1} requires={['hasr-min-mudawwar']}
                  explain={<MathText>{'العلامتان $0{,}285$ و $0{,}286$ متتاليتان على الميزان، و $\\frac{2}{7}$ يقع بينهما: لا يبلغه كيس يزنه عدد منتهٍ من الأرقام.'}</MathText>}
                  onAnswered={answered('d')}
                />
              )}
              {(q.d || cp.a3) && <KnowledgeBrick id="qimatan-muqarraban" lead="ما اسما العلامتين اللتين يقع بينهما العدد؟" />}
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={1} variant="memo" />}
    />
  );
}
