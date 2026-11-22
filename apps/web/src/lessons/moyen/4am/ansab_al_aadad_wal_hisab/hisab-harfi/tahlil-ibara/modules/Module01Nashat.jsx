import { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import { Feedback } from '../../../../../../common/components/LessonUI';
import MathText from '../../../../../../common/components/MathText';
import { Manipulation, ManipulationWorkspace } from '../../../../../../common/manipulations';
import { TextbookBox } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { ACTIVITY } from '../content/textbook';
import { M1_ROUNDS } from '../content/turf';
import LabRounds from '../../../../../../common/manipulations/rounds/LabRounds';
import PlayerSwitch from '../../../../../../common/mission/PlayerSwitch';
import { useModulePlayer } from '../../../../../../common/mission/useModulePlayer';

/**
 * Module 1 — نشاط 3 (p. 33) : « تحليل عبارة جبرية », ouvert sur le monde de
 * l'unité : le gazon d'un terrain de football.
 *
 * LABORATOIRE À DEUX NIVEAUX, UN INSTRUMENT (turf-factoring, mode rows) —
 * même objectif : ka + kb = k(a + b), le facteur commun complet est le plus
 * grand nombre de rangées IDENTIQUES.
 *   مبتدئ (ouvert par défaut — ce sont les nombres du نشاط 3, س 2) : 9x + 3,
 *          rangées de hauteur 1 ; r = 3 est le seul r > 1 qui ne laisse rien.
 *   متقدم : 6x² + 4x (premier exemple de معارف 3), rangées de hauteur x :
 *          le facteur 2x se lit en deux morceaux (2 rangées, hauteur x).
 * Le laboratoire porte les nombres du livre au niveau مبتدئ : c'est donc lui
 * qui s'ouvre (« la valeur par défaut sert la tâche du module »).
 *
 * AUCUNE étape n'attend `onFinished` : `onTrial` sert seulement à lister,
 * au-dessus des questions, les essais de l'élève (`[data-activity-evidence]`).
 *
 * Rétrofit 2026-10-15 (§4quater) : le labo ouvre le module (ni carte, ni titre / `lead` de workspace). Étapes : (1) POURQUOI le terrain
 * 9x + 3 refuse r = 9 alors que 9 divise le nombre de bandes ; (2) ce que contient chaque rangée de 6x² + 4x, donc la LONGUEUR du
 * terrain (la hauteur est la question du labo) ; (3) le cahier d'إيمان (س 1), application du livre ; (4) س 2, puis la brique
 * tahlil-taarif APRÈS la réponse ; (5) س 3 : le carré x² + 6x + 9 fermé à la main (mode square), إيمان, puis l'encadré des trois
 * متطابقات APRÈS sa réponse (il donnerait la réponse), puis les trois décompositions.
 * Les deux niveaux du laboratoire vivent dans l'`intro` : la « مسألة الدرس »
 * (ANCIENNE carte, retirée du module le 2026-10-09 — elle ne vit plus qu'au sommaire — le gazon en rangées du niveau متقدم, d'autres nombres,
 * résolue au module 5) clôt donc la DERNIÈRE étape.
 * LP : P1, P2, P3.
 *
 * LECTEUR DE MISSION (rollout 2026-11-11, unité 3 leçon 3 ; conseil du 2026-11-11, verdict L3) : le labo se joue en MANCHES (content/turf.js ›
 * M1_ROUNDS : 8x + 6 → 6x² + 2x (la règle) → le carré x² + 6x + 9 → défi ⭐ x² + 8x + 16 → la ورشة libre) au lieu de مبتدئ / متقدم, et le
 * labo carré de l'étape 5 devient la manche 3 (l'élève ne voit jamais l'ancienne vue). L'étape 1 attend la manche 1 et interroge SON refus
 * (8x + 6 refuse 3 rangées) ; l'étape 2 attend la manche 2 ; l'étape 5 la manche 3. Le 9x + 3 de l'activité du manuel ne paraît nulle part dans le
 * lecteur (verdict L3) : la ligne r1 de l'étape 4 lit 8x + 6 (PLAYER seulement). Ce que la ligne de trace dit vient des manches GAGNÉES (étoiles
 * gardées, annoncées par LabRounds au montage) : un rechargement ne bloque ni ne vide jamais une étape. Hors lecteur : la page inchangée.
 */
const BEGINNER = '9x+3';
const ADVANCED = '6x^2+4x';
const coef = (c, v) => (c === 1 ? v : `${c}${v}`);
// L'égalité qu'un terrain JUSTE montre (calculée depuis les nombres, jamais tapée).
const rowsTex = {
  [BEGINNER]: (r) => `9x + 3 = ${r === 1 ? '' : r}(${coef(9 / r, 'x')} + ${3 / r})`,
  [ADVANCED]: (r) => `6x^2 + 4x = ${coef(r, 'x')}(${coef(6 / r, 'x')} + ${4 / r})`,
};
const LABEL = { [BEGINNER]: '9x + 3', [ADVANCED]: '6x^2 + 4x' };
const { k: imK, a: imA, b: imB } = ACTIVITY.numbers.imane;
const tex = (s) => String(s).replace(',', '{,}');
const dec = (s) => Number(String(s).replace(',', '.'));
const q1b = ACTIVITY.numbers.q1b.map((it) => ({
  ...it,
  // k × (a ± b), en centièmes pour rester exact.
  value: Math.round(dec(it.k) * 100 * (it.op === '+' ? it.a + it.b : it.a - it.b)) / 100,
}));

export default function Module01Nashat() {
  const player = useModulePlayer(MODULE_CTX);
  // lecteur : les manches gagnées (étoiles gardées, annoncées par LabRounds au montage) ouvrent les étapes et remplissent leur trace
  const [won, setWon] = useState({});
  const [p1, setP1] = useState(false);
  const [p2, setP2] = useState(false);
  const wonLine = (id, yes, no) => (
    <p className={`rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-sm ${won[id] ? 'font-bold text-emerald-900' : 'text-slate-500'}`}
      data-activity-evidence data-evidence={id} data-tried={won[id] ? 'true' : 'false'}>
      {won[id] ? <><span aria-hidden="true">✓ </span><MathText>{yes}</MathText></> : <MathText>{no}</MathText>}
    </p>
  );
  // lecteur : la ligne r1 de l'étape 4 lit le terrain de la manche 1 (8x + 6), jamais le 9x + 3 de l'activité du manuel
  const first = player ? '2' : '3';
  const [rows, setRows] = useState({ [BEGINNER]: [], [ADVANCED]: [] });
  const [square, setSquare] = useState([]);
  const [q3a, setQ3a] = useState(false);
  const [q3b, setQ3b] = useState({});
  const [q4a, setQ4a] = useState(false);
  const [q4, setQ4] = useState(false);
  const [q5a, setQ5a] = useState(false);
  const [q5, setQ5] = useState(false);

  const onRows = (expr) => ({ r, valid }) => setRows((t) => ({ ...t, [expr]: [...t[expr].filter((u) => u.r !== r), { r, valid }].sort((u, v) => u.r - v.r) }));
  const onSquare = ({ right, bottom, need, ok }) => setSquare((t) => [...t.filter((u) => !(u.right === right && u.bottom === bottom)), { right, bottom, need, ok }]);
  const q3done = q3a && q1b.every((_, i) => q3b[i]);
  // les questions posées PAR-DESSUS le labo (LabCheckpoint) : une étape est faite quand la suite de questions de son terrain l'est
  const [cps, setCps] = useState([]);
  const answered = (id) => cps.some((e) => e.tk === 'checkpoint-done' && e.id === id);
  const onCheckpoint = (e) => setCps((l) => [...l, e]);
  const Evidence = ({ ok, done: line, todo }) => (
    <p data-evidence="checkpoint" data-tried={ok ? 'true' : 'false'}
      className={`rounded-xl border-2 px-3 py-2 text-sm ${ok ? 'border-emerald-200 bg-emerald-50 font-bold text-emerald-900' : 'border-slate-200 bg-white text-slate-500'}`}>
      {ok ? line : todo}
    </p>
  );

  return (
    <ContentModule
      ctx={MODULE_CTX}
      objectives={["متى نستطيع فرش قطع العشب في صفوف متماثلة؟", "ما ارتفاع الملعب الأكبر الممكن؟", "هل نستطيع «إغلاق» ملعب مربّع بشرائط ومربّعات صغيرة؟"]}
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      moduleTitle="الملعب الجواري — تحليل عبارة جبرية"
      moduleSubtitle="من مجموع إلى جداء"
      estimatedTime="13 دقيقة"
      intro={
        // Lecteur : les MANCHES (content/turf.js) ; la page garde ses deux niveaux.
        <PlayerSwitch
          player={(
            <LabRounds lessonId={MODULE_CTX.lessonId} labId="lab-turf-m1" rounds={M1_ROUNDS} icon="🟩" freeIcon="🏟️"
              onRoundWon={(id) => setWon((w) => ({ ...w, [id]: true }))} />
          )}
          page={(
        <ManipulationWorkspace
          defaultLevel="beginner"
          levels={{
            beginner: () => (
              <Manipulation
                type="turf-factoring"
                level="beginner"
                mode="rows"
                expr={BEGINNER}
                lead="وصلت إلى ملعب الحيّ قطع عشب: 9 شرائط و 3 مربّعات صغيرة. اسحب r، عدد الصفوف: متى تتوزّع القطع كلها على صفوف متماثلة دون أن تُقطَّع قطعة؟"
                onTrial={onRows(BEGINNER)}
                onCheckpoint={onCheckpoint}
              />
            ),
            advanced: () => (
              <Manipulation
                type="turf-factoring"
                level="advanced"
                mode="rows"
                expr={ADVANCED}
                lead="وصلت قطع عشب أخرى: ستة مربّعات كبيرة وأربعة شرائط. ما أكبر عدد من الصفوف المتماثلة؟ واقرأ ارتفاع الملعب كاملًا."
                onTrial={onRows(ADVANCED)}
                onCheckpoint={onCheckpoint}
              />
            ),
          }}
        />
          )}
        />
      }
      steps={[
        {
          needsRound: { id: 'r1', label: 'الجولة 1', icon: '🟩', won: Boolean(won.r1) },
          num: 1, title: 'لماذا يرفض الملعب بعض الأعداد؟', subtitle: player ? 'من ملعبك في الجولة 1' : 'جرّب أعدادًا للصفوف في المستوى المبتدئ، ثم أجب', done: player ? p1 : answered(`rows:${BEGINNER}`),
          content: player ? (
            <div className="space-y-3">
              {wonLine('r1', 'الجولة 1: فرشتَ القطع $8x + 6$ في صفّين متماثلين، ورأيت أعدادًا يرفضها الملعب.', 'الجولة 1: لم تجد بعد أكبر عدد من الصفوف المتماثلة.')}
              <TapQuestion
                prompt={<MathText>{'في ملعبك $8x + 6$ رفض الملعب 3 صفوف، مع أنّ 3 يقسم عدد المربّعات الصغيرة. لماذا؟'}</MathText>}
                options={[
                  'لأنّ 3 لا يقسم عدد الشرائط: تبقى شرائط خارج الملعب',
                  'لأنّ عدد الصفوف يجب أن يكون زوجيًا',
                  'لأنّ 3 صفوف أكثر مما يتّسع له الملعب',
                ]}
                correct={0}
                cols={1}
                requires={['nashr-tawzii']}
                explain={<MathText>{'$8 = 3 \\times 2 + 2$ : شريطان يبقيان خارج الصفوف. لكي تتماثل الصفوف يجب أن يقسم عددها عدد الشرائط وعدد المربّعات الصغيرة معًا — والصفّان يقسمان 8 و 6.'}</MathText>}
                onAnswered={() => setP1(true)}
              />
            </div>
          ) : (
            <div className="space-y-3">
              {/* LES ESSAIS DE L'ÉLÈVE, et rien d'autre. */}
              <ul className="space-y-1 rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-sm" data-activity-evidence>
                {[BEGINNER, ADVANCED].map((expr) => (
                  <li key={expr} data-evidence={expr} data-tried={rows[expr].length ? 'true' : 'false'} className={rows[expr].length ? 'text-slate-800' : 'text-slate-500'}>
                    <MathText>{`الملعب $${LABEL[expr]}$ :`}</MathText>{' '}
                    {rows[expr].length === 0
                      ? `لم تجرّب بعد (${expr === BEGINNER ? 'المستوى المبتدئ' : 'المستوى المتقدّم'}).`
                      : (
                        <span className="inline-flex flex-wrap gap-1.5" dir="ltr">
                          {rows[expr].map(({ r, valid }) => (
                            <span key={r} className={`rounded-lg px-2 py-0.5 text-xs font-bold ${valid ? 'bg-emerald-100 text-emerald-900' : 'bg-rose-100 text-rose-900'}`}>
                              <MathText>{valid ? `$r = ${r}$ ✓ $\\; ${rowsTex[expr](r)}$` : `$r = ${r}$ ✗`}</MathText>
                            </span>
                          ))}
                        </span>
                      )}
                  </li>
                ))}
              </ul>
              <Evidence ok={answered(`rows:${BEGINNER}`)}
                done={<MathText>{'أجبتَ في المختبر: في الملعب $9x + 3$ يرفض الملعب الأعداد التي لا تقسم الشرائط $9$ والمربّعات الصغيرة $3$ معًا — تبقى قطع خارجه — ويقبل $r = 3$ فقط، وهو القاسم المشترك الأكبر.'}</MathText>}
                todo="أتمّ ملعب المستوى المبتدئ (جرّب أعداد الصفوف حتى تجد أكبر عدد ينجح وعددًا يفشل)، ثم أجب عن الأسئلة التي تظهر فوق المختبر." />
            </div>
          ),
        },
        {
          needsRound: { id: 'r2', label: 'الجولة 2', icon: '🟩', won: Boolean(won.r2) },
          num: 2, title: 'ماذا يمثّل طول الملعب؟', subtitle: player ? 'من ملعبك في الجولة 2' : 'افرش الملعب الثاني في المستوى المتقدّم، ثم أجب', done: player ? p2 : answered(`rows:${ADVANCED}`),
          content: player ? (
            <div className="space-y-3">
              {wonLine('r2', 'الجولة 2: فرشتَ $6x^2 + 2x$ في صفّين ارتفاع كل منهما $x$ ، وبنيتَ تحليله.', 'الجولة 2: لم تفرش بعد المربّعات الكبيرة والشرائط في صفوف متماثلة.')}
              <TapQuestion
                prompt={<MathText>{'في ملعبك $6x^2 + 2x = 2x(3x + 1)$ : ماذا يمثّل العامل $3x + 1$ ؟'}</MathText>}
                options={[
                  <MathText key="a">{'ما يحمله صفّ واحد: ثلاثة مربّعات كبيرة وشريط، أي طول الملعب'}</MathText>,
                  <MathText key="b">{'ارتفاع الملعب كاملًا'}</MathText>,
                  <MathText key="c">{'عدد الصفوف'}</MathText>,
                ]}
                correct={0}
                cols={1}
                requires={['nashr-tawzii']}
                explain={<MathText>{'ارتفاع الملعب $2x$ (صفّان ارتفاع كل منهما $x$)، وطوله ما في صفّ واحد: $3x + 1$ . المساحة = الارتفاع × الطول.'}</MathText>}
                onAnswered={() => setP2(true)}
              />
            </div>
          ) : (
            <Evidence ok={answered(`rows:${ADVANCED}`)}
              done={<MathText>{'أجبتَ في المختبر: الملعب $6x^2 + 4x$ ينجح بصفّين ارتفاع كل منهما $x$ ، فارتفاع الملعب $2x$ وطوله $3x + 2$ ، أي $6x^2 + 4x = 2x(3x + 2)$ .'}</MathText>}
              todo="افرش الملعب الثاني في المستوى المتقدّم (جرّب أعداد الصفوف حتى تجد أكبرها)، ثم أجب عن الأسئلة التي تظهر فوق المختبر." />
          ),
        },
        {
          num: 3, title: 'كرّاس إيمان', subtitle: 'السؤال 1', done: q3done,
          content: (
            <div className="space-y-3">
              <TextbookBox kind="example" text={ACTIVITY.figure} source={ACTIVITY.source} compact />
              <TapQuestion
                prompt={<MathText>{ACTIVITY.questions[0]}</MathText>}
                options={[
                  <MathText key="a">{`ضربت $${tex(imK)} \\times ${tex(imA)}$ ثم أضافت $${tex(imB)}$`}</MathText>,
                  <MathText key="b">{`لاحظت أنّ $${tex(imK)}$ عامل مشترك بين الجداءين، فكتبت المجموع على شكل جداء: $${tex(imK)} \\times (${tex(imA)} + ${tex(imB)})$`}</MathText>,
                  <MathText key="c">{`جمعت $${tex(imA)}$ و $${tex(imB)}$ ثم ضربت المجموع في $${tex(imK)} \\times ${tex(imK)}$`}</MathText>,
                ]}
                correct={1}
                cols={1}
                requires={['nashr-tawzii']}
                explain={<MathText>{`هي الخاصية التوزيعية مقروءة من المجموع إلى الجداء: $${tex(imK)} \\times ${tex(imA)} + ${tex(imK)} \\times ${tex(imB)} = ${tex(imK)} \\times (${tex(imA)} + ${tex(imB)}) = ${tex(imK)} \\times 2 = 7$ ، والحساب صار سهلًا لأنّ $${tex(imA)} + ${tex(imB)} = 2$.`}</MathText>}
                onAnswered={() => setQ3a(true)}
              />
              {q3a && (
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-slate-700"><MathText>{ACTIVITY.questions[1]}</MathText></p>
                  {q1b.map((it, i) => (
                    <NumericQuestion
                      key={i}
                      prompt={<MathText>{`$${tex(it.k)} \\times ${it.a} ${it.op} ${tex(it.k)} \\times ${it.b} = $`}</MathText>}
                      expected={it.value}
                      requires={['nashr-tawzii']}
                      explain={<MathText>{`$${tex(it.k)} \\times (${it.a} ${it.op} ${it.b}) = ${tex(it.k)} \\times ${it.op === '+' ? it.a + it.b : it.a - it.b} = ${it.value}$`}</MathText>}
                      onAnswered={() => setQ3b((d) => ({ ...d, [i]: true }))}
                    />
                  ))}
                </div>
              )}
            </div>
          ),
        },
        {
          num: 4, title: 'اكتب على شكل جداء', subtitle: 'السؤال 2', done: q4,
          content: (
            <div className="space-y-3">
              <BatchChoiceQuestion
                intro={<p className="text-sm font-semibold text-slate-700"><MathText>{player ? 'اكتب على شكل جداء كل عبارة مما يلي، واذكر في كل حالة الخاصية التي اعتمدت عليها.' : ACTIVITY.questions[2]}</MathText></p>}
                rows={[
                  player
                    ? { id: 'r1', label: <MathText>{'$8x + 6 = $'}</MathText>, options: [<MathText key="a">{'$2(4x + 6)$'}</MathText>, <MathText key="b">{'$8x(1 + 6)$'}</MathText>, <MathText key="c">{'$2(4x + 3)$'}</MathText>], correct: 2, correction: <MathText>{'$8x + 6 = 2 \\times 4x + 2 \\times 3 = 2(4x + 3)$ — ملعبك ذو الصفّين.'}</MathText> }
                    : { id: 'r1', label: <MathText>{'$9x + 3 = $'}</MathText>, options: [<MathText key="a">{'$3(3x + 3)$'}</MathText>, <MathText key="b">{'$9x(1 + 3)$'}</MathText>, <MathText key="c">{'$3(3x + 1)$'}</MathText>], correct: 2, correction: <MathText>{'$9x + 3 = 3 \\times 3x + 3 \\times 1 = 3(3x + 1)$ — ملعبك ذو الصفوف الثلاثة.'}</MathText> },
                  { id: 'r2', label: <MathText>{'$(x - 2)(x + 4) - 3(x - 2) = $'}</MathText>, options: [<MathText key="a">{'$(x - 2)(x + 1)$'}</MathText>, <MathText key="b">{'$(x - 2)(x + 7)$'}</MathText>, <MathText key="c">{'$(x - 2)(x - 3)$'}</MathText>], correct: 0, correction: <MathText>{'العامل المشترك $(x - 2)$ : $(x - 2)[(x + 4) - 3] = (x - 2)(x + 1)$'}</MathText> },
                  { id: 'r3', label: <MathText>{'$(x - 1) + (x - 1)^2 = $'}</MathText>, options: [<MathText key="a">{'$(x - 1)(x - 1)$'}</MathText>, <MathText key="b">{'$x(x - 1)$'}</MathText>, <MathText key="c">{'$(x - 1)^3$'}</MathText>], correct: 1, correction: <MathText>{'$(x - 1) \\times 1 + (x - 1)(x - 1) = (x - 1)(1 + x - 1) = x(x - 1)$'}</MathText> },
                ]}
                requires={['nashr-tawzii']}
                feedback={({ allRight }) => (
                  <Feedback tone={allRight ? 'ok' : 'ko'}>
                    <MathText>{allRight
                      ? 'تمامًا: في كل حالة عامل يتكرّر في كل الحدود، فنكتبه مرّة واحدة خارج القوس.'
                      : 'ابحث عن العامل الذي يتكرّر في كل الحدود، ولا تنسَ أنّ $(x - 1) = (x - 1) \\times 1$.'}</MathText>
                  </Feedback>
                )}
                onAnswered={() => setQ4a(true)}
              />
              {q4a && (
                <TapQuestion
                  prompt="على أيّ خاصية اعتمدت في الحالات الثلاث؟"
                  options={[
                    <MathText key="a">{'المتطابقة الشهيرة $(a + b)^2 = a^2 + 2ab + b^2$'}</MathText>,
                    <MathText key="b">{'تبسيط الحدود المتشابهة وحده'}</MathText>,
                    <MathText key="c">{`الخاصية التوزيعية $ka + kb = k(a + b)$ ، والعامل المشترك $k$ هو $${first}$ ثم $(x - 2)$ ثم $(x - 1)$`}</MathText>,
                  ]}
                  correct={2}
                  cols={1}
                  requires={['nashr-tawzii']}
                  explain={<MathText>{`في الحالات الثلاث استخرجنا عاملًا مشتركًا: $${first}$ ، ثم $(x - 2)$ ، ثم $(x - 1)$. هي الخاصية التوزيعية $k(a + b) = ka + kb$ مقروءة في الاتجاه المعاكس.`}</MathText>}
                  onAnswered={() => setQ4(true)}
                />
              )}
              {q4 && <KnowledgeBrick id="tahlil-taarif" lead="ما فعلته في الحالات الثلاث له اسم:" />}
            </div>
          ),
        },
        {
          needsRound: { id: 'r3', label: 'الجولة 3', icon: '🟩', won: Boolean(won.r3) },
          num: 5, title: 'تقول إيمان: «يمكن استغلال المساويات»', subtitle: player ? 'السؤال 3 — بعد الملعب المربّع في الجولة 3' : 'السؤال 3 — أغلق الملعب المربّع ثم أجب', done: q5,
          content: (
            <div className="space-y-3">
              <p className="text-sm text-slate-800"><MathText>{ACTIVITY.questions[3]}</MathText></p>
              {player ? wonLine('r3', 'الجولة 3: أغلقتَ الملعب المربّع $x^2 + 6x + 9$ بعد توزيع رفضه الركن.', 'الجولة 3: لم تُغلق الملعب المربّع بعد.') : (
              <Manipulation
                type="turf-factoring"
                mode="square"
                b={6}
                c={9}
                lead="مربّع كبير x² ، ستة شرائط وتسعة مربّعات صغيرة: وزّع الشرائط يمين المربّع وتحته، ثم أغلق الملعب."
                onTrial={onSquare}
              />
              )}
              {!player && (
              <ul className="space-y-1 rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-sm" data-activity-evidence>
                {square.length === 0
                  ? <li className="text-slate-500" data-evidence="square" data-tried="false">لم تحاول إغلاق الملعب بعد.</li>
                  : square.map(({ right, bottom, need, ok }) => (
                    <li key={`${right}-${bottom}`} data-evidence={`${right}-${bottom}`} data-tried="true" className={ok ? 'font-bold text-emerald-900' : 'text-rose-900'}>
                      <MathText>{ok
                        ? `يمين ${right} وتحت ${bottom}: الركن يحتاج $${right} \\times ${bottom} = ${need}$ — أُغلق الملعب: $x^2 + 6x + 9 = ${right === bottom ? `(x + ${right})^2` : `(x + ${right})(x + ${bottom})`}$`
                        : `يمين ${right} وتحت ${bottom}: الركن يحتاج $${right} \\times ${bottom} = ${need}$ ولديك 9 — لم يُغلق.`}</MathText>
                    </li>
                  ))}
              </ul>
              )}
              <TapQuestion
                prompt={<MathText>{ACTIVITY.questions[4]}</MathText>}
                options={[
                  <MathText key="a">{'لا: المتطابقات الشهيرة تُستعمل للنشر فقط'}</MathText>,
                  <MathText key="b">{'نعم: كل عبارة لها شكل الطرف الثاني لإحدى المساويات، فنقرأ المساواة في الاتجاه المعاكس، من المجموع إلى الجداء'}</MathText>,
                  <MathText key="c">{'نعم، لكن للعبارة $x^2 - 16$ وحدها، لأنها لا تحتوي على حدّ مضاعف'}</MathText>,
                ]}
                correct={1}
                cols={1}
                requires={['mutatabiqat']}
                explain={<MathText>{'$x^2 + 6x + 9 = x^2 + 2 \\times x \\times 3 + 3^2$ من الشكل $a^2 + 2ab + b^2$ ، و $x^2 - 4x + 4 = x^2 - 2 \\times x \\times 2 + 2^2$ من الشكل $a^2 - 2ab + b^2$ ، و $x^2 - 16 = x^2 - 4^2$ من الشكل $a^2 - b^2$.'}</MathText>}
                onAnswered={() => setQ5a(true)}
              />
              {q5a && <TextbookBox kind="remark" lines={ACTIVITY.aside} source={ACTIVITY.source} compact />}
              {q5a && (
                <BatchChoiceQuestion
                  intro={<p className="text-sm font-semibold text-slate-700"><MathText>{ACTIVITY.questions[5]}</MathText></p>}
                  rows={[
                    { id: 's1', label: <MathText>{'$x^2 + 6x + 9 = $'}</MathText>, options: [<MathText key="a">{'$(x + 9)^2$'}</MathText>, <MathText key="b">{'$(x + 3)^2$'}</MathText>, <MathText key="c">{'$(x - 3)(x + 3)$'}</MathText>], correct: 1, correction: <MathText>{'مربع مجموع: $x^2 + 2 \\times x \\times 3 + 3^2 = (x + 3)^2$ — الملعب المربّع الذي أغلقته.'}</MathText> },
                    { id: 's2', label: <MathText>{'$x^2 - 4x + 4 = $'}</MathText>, options: [<MathText key="a">{'$(x - 2)^2$'}</MathText>, <MathText key="b">{'$(x + 2)^2$'}</MathText>, <MathText key="c">{'$(x - 2)(x + 2)$'}</MathText>], correct: 0, correction: <MathText>{'مربع فرق: $x^2 - 2 \\times x \\times 2 + 2^2 = (x - 2)^2$'}</MathText> },
                    { id: 's3', label: <MathText>{'$x^2 - 16 = $'}</MathText>, options: [<MathText key="a">{'$(x - 4)^2$'}</MathText>, <MathText key="b">{'$(x - 8)(x + 8)$'}</MathText>, <MathText key="c">{'$(x - 4)(x + 4)$'}</MathText>], correct: 2, correction: <MathText>{'جداء مجموع حدين وفرقهما: $x^2 - 4^2 = (x - 4)(x + 4)$'}</MathText> },
                  ]}
                  requires={['mutatabiqat']}
                  feedback={({ allRight }) => (
                    <Feedback tone={allRight ? 'ok' : 'ko'}>
                      <MathText>{allRight
                        ? 'ثلاث متطابقات، ثلاثة تحليلات: نتعرّف على الشكل ثم نعيّن $a$ و $b$.'
                        : 'الحدّ $-2ab$ يدلّ على مربع فرق، وغيابه مع $-b^2$ يدلّ على جداء مجموع حدين وفرقهما.'}</MathText>
                    </Feedback>
                  )}
                  onAnswered={() => setQ5(true)}
                />
              )}
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={1} variant="memo" />}
    />
  );
}
