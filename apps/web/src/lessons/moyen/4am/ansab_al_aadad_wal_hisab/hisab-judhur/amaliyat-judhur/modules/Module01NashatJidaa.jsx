import { useEffect, useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import { Feedback } from '../../../../../../common/components/LessonUI';
import MathText from '../../../../../../common/components/MathText';
import { Manipulation, ManipulationWorkspace } from '../../../../../../common/manipulations';
import { SourceTag } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { ACTIVITY, ACTIVITY_B, TILING_BEGINNER } from '../content/textbook';
import RootTable from '../components/RootTable';
import { M1_ROUNDS, R1 } from '../content/tilings';
import LabRounds from '../../../../../../common/manipulations/rounds/LabRounds';
import PlayerSwitch from '../../../../../../common/mission/PlayerSwitch';
import { useSavedAnswer } from '../../../../../../common/answers/useSavedAnswer';

/**
 * Module 1 — نشاط 4 (p. 21) : جداء جذرين تربيعيين، ثم حاصل قسمتهما.
 *
 * RÉTROFIT 2026-10-15 (§4quater) : le labo en tête, sans carte du manuel ni titre/`lead` de workspace ; l'étape 1 (nouvelle) demande POURQUOI
 * un pavage est refusé, sur les essais de l'élève (`onTrial` → ligne `[data-activity-evidence]`, jamais bloquante) ; les tableaux du manuel
 * suivent (étapes 2–8), les briques restent derrière les réponses.
 *
 * LABORATOIRE D'OUVERTURE À DEUX NIVEAUX — le carré dallé (`square-tiling`,
 * mode product). L'élève ÉTIRE k, le nombre de dalles sur le côté d'un carré
 * d'aire n ; une dalle d'aire non entière est refusée. Chaque pavage juste
 * montre le côté du grand carré comme k côtés de dalle : √(k² × b) = √(k²) × √b.
 *   مبتدئ  — n = 36 (plateforme, déclarée) : 36 = 4 × 9, deux pavages justes.
 *   متقدم  — n = 144 = 4 × 36, LA PREMIÈRE LIGNE DU TABLEAU DU MANUEL
 *            (defaultLevel) : k = 2 donne √(4 × 36) = √4 × √36 = 2 × 6.
 *
 * Puis les QUESTIONS DU MANUEL, dans son ordre, et c'est l'élève qui
 * complète les tableaux (lignes à choix, distracteurs = erreurs réelles :
 * racine d'un seul facteur, racine oubliée, √0,16 = 0,08). Le tableau rempli
 * n'apparaît qu'après sa réponse : c'est SA trace, au-dessus du تخمين.
 * La preuve (3 أ ب جـ) se fait par l'élévation au carré ; la propriété n'est
 * NOMMÉE (KnowledgeBrick) qu'après la conclusion de l'élève.
 * LP enseignés : P1, P2.
 *
 * LECTEUR DE MISSION (rollout 2026-11-10, unité 2 leçon 4 ; conseil du 2026-11-10) : le labo se joue en MANCHES (content/tilings.js › M1_ROUNDS :
 * 27 à la main avec la suite complète → 32 (deux pavages justes, le pont √(4 × 8) = √4 × √8) → 98 (le quotient) → défi ⭐ 96 → atelier libre) au
 * lieu de مبتدئ / متقدم ; l'étape 1 attend la manche 1, l'étape 6 (حاصل القسمة) la manche 3. Ce que le labo a fait (ses essais, ses questions
 * finies, les manches gagnées) est GARDÉ (answers/useSavedAnswer, fusion seulement une fois la copie du serveur arrivée + étoiles) : un
 * rechargement ne bloque jamais une étape. Hors lecteur : inchangé.
 */
const cell = (tex) => <MathText key={tex}>{tex}</MathText>;
/** L'aire du carré d'un pavage remonté par le labo (le lecteur ne la donne pas) : b × k² s'il est juste, sinon la fraction réduite × k². */
const areaOf = (t) => (t?.k == null ? 'lab' : t.valid ? t.b * t.k * t.k : Math.round((t.frac.num * t.k * t.k) / t.frac.den));
/** Les essais gardés, par carré PUIS par k (revue ECC 2026-11-10 : une fusion à un seul niveau écrasait les essais d'un autre carré). */
const mergeTrials = (a = {}, b = {}) => {
  const out = { ...a };
  Object.entries(b).forEach(([sq, byK]) => { out[sq] = { ...(a[sq] ?? {}), ...byK }; });
  return out;
};
const fb = ({ allRight }) => (
  <Feedback tone={allRight ? 'ok' : 'ko'}>{allRight ? 'أكملت الجدول بدون خطأ.' : 'اقرأ التصحيح تحت كل سطر: الجدول المكتمل أدناه.'}</Feedback>
);

export default function Module01NashatJidaa() {
  // les questions posées PAR-DESSUS le labo (LabCheckpoint, 2026-10-28) : leur TRACE est l'événement `checkpoint-done`
  const [cpDone, setCpDone] = useState({});
  // Les essais de l'élève dans le labo (k validés par la main), pour la ligne de trace de l'étape 1.
  const [trials, setTrials] = useState({});
  const addTrial = (n, t) => {
    if (t?.tk) { if (t.tk === 'checkpoint-done') setCpDone((d) => ({ ...d, [`${n}:${t.id}`]: true, [t.id]: true })); return; }
    if (t?.k == null) return;
    setTrials((o) => ({ ...o, [n]: { ...(o[n] || {}), [t.k]: { k: t.k, valid: t.valid, b: t.b } } }));
  };
  // Dans le lecteur : les manches gagnées (étoiles gardées) ouvrent les étapes ; les essais et les questions finies du labo sont GARDÉS — une
  // étape n'attend jamais des questions qu'un rechargement a effacées (revue ECC des leçons 1–3).
  const [won, setWon] = useState({});
  const memory = useSavedAnswer([], { key: 'lab-tilings', lessonId: MODULE_CTX.lessonId, moduleNumber: 1 });
  const kept = memory.saved?.v ?? {};
  const { save } = memory;
  useEffect(() => {
    // jamais avant que la copie du serveur soit arrivée (`ready`) : une fusion partielle, plus récente, l'écraserait (revue ECC 2026-11-10)
    if (!memory.on || !memory.ready || (!Object.keys(cpDone).length && !Object.keys(trials).length)) return;
    save({ cp: { ...(kept.cp ?? {}), ...cpDone }, trials: mergeTrials(kept.trials, trials) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cpDone, trials, memory.ready]);
  const cpSeen = { ...(kept.cp ?? {}), ...cpDone };
  const answered = (id) => !!cpSeen[id] || (id === 'rule' && !!won.r1);
  const allTrials = mergeTrials(kept.trials, trials);
  // la ligne de l'étape 1 parle d'UN carré : celui de la manche 1 dans le lecteur (27), sinon ce que la page a pavé (36 / 144)
  const tried = Object.values(allTrials[R1] ?? {}).length
    ? Object.values(allTrials[R1])
    : Object.entries(allTrials).filter(([key]) => key !== String(R1)).flatMap(([, o]) => Object.values(o));
  const refusedTry = tried.filter((t) => !t.valid).sort((x, y) => x.k - y.k)[0];
  const validTry = tried.filter((t) => t.valid && t.k > 1).sort((x, y) => x.k - y.k)[0];
  const [tableA, setTableA] = useState(false);
  const [conjA, setConjA] = useState(false);
  const [proofA, setProofA] = useState(false);
  const [concA, setConcA] = useState(false);
  const [tableB, setTableB] = useState(false);
  const [conjB, setConjB] = useState(false);
  const [proofB, setProofB] = useState(false);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      moduleTitle="نشاط 4 — جداء جذرين وحاصل قسمتهما"
      moduleSubtitle="بلّط، أكمل الجدولين، خمّن، ثم برهن"
      estimatedTime="14 دقيقة"
      objectives={['كم بلاطة على ضلع مربّع مساحته 36 أو 144؟ وكيف يُكتب ضلعه؟', 'ماذا نلاحظ في جدولَي الجداء وحاصل القسمة؟', 'هل يكفي التخمين، أم نحتاج إلى برهان؟']}
      intro={
        // LE LABO OUVRE LE MODULE (§4quater) : pas de carte du manuel, pas de titre / `lead` de workspace. `lead` des labos = le contexte seul ;
        // la question est celle du labo. Le niveau متقدم (144 = 4 × 36) est la première ligne du tableau du manuel.
        // Lecteur : les MANCHES (content/tilings.js) ; la page garde ses deux niveaux.
        <PlayerSwitch
          player={(
            <LabRounds lessonId={MODULE_CTX.lessonId} labId="m1-tilings" rounds={M1_ROUNDS} icon="🧱" freeIcon="🏫"
              onTrial={(t) => addTrial(areaOf(t), t)} onRoundWon={(id) => setWon((w) => ({ ...w, [id]: true }))} />
          )}
          page={(
        <ManipulationWorkspace
          defaultLevel="beginner"
          levels={{
            beginner: () => (
              <div className="space-y-2">
                <Manipulation
                  type="square-tiling"
                  level="beginner"
                  n={36}
                  mode="product"
                  lead="لوحة زليج مربّعة مساحتها 36، نغطّيها ببلاطات مربّعة متماثلة، كل بلاطة مساحتها عدد طبيعي."
                  onTrial={(t) => addTrial(36, t)}
                />
                <SourceTag source={TILING_BEGINNER.source} />
              </div>
            ),
            advanced: () => (
              <Manipulation
                type="square-tiling"
                level="advanced"
                n={144}
                mode="product"
                lead="مربّع مساحته 144 = 4 × 36، وهو السطر الأول من الجدول."
                onTrial={(t) => addTrial(144, t)}
              />
            ),
          }}
        />
          )}
        />
      }
      steps={[
        {
          needsRound: { id: 'r1', label: 'الجولة 1', icon: '🧱', won: Boolean(won.r1) },
          num: 1, title: 'لماذا يُرفض بعض التبليط؟', subtitle: 'أسئلة المختبر عن تبليطاتك', done: answered('rule'),
          content: (
            <div className="space-y-3">
              {/* LA TRACE DE L'ÉLÈVE (jamais bloquante) : ses propres essais dans le labo. */}
              <p className="rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-sm text-slate-600" data-activity-evidence data-tried={tried.length ? 'true' : 'false'}>
                {tried.length
                  ? (
                    <span>
                      {validTry ? <>جرّبت <MathText>{`$k = ${validTry.k}$`}</MathText>: بلاطة مساحتها <bdi dir="ltr">{validTry.b}</bdi>. </> : null}
                      {refusedTry ? <>ورُفض عندك <MathText>{`$k = ${refusedTry.k}$`}</MathText>. </> : null}
                    </span>
                  )
                  : 'لم تجرّب تبليطًا بعدُ: اسحب عدد البلاطات على الضلع في المناولة أعلاه، وأجب عن الأسئلة التي تظهر فوقها.'}
              </p>
              {answered('rule') && (
                <p className="rounded-xl border-2 border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-900" data-activity-evidence data-tried="true">
                  أجبتَ في المختبر: يُرفض التبليط حين لا تكون مساحة البلاطة عددًا طبيعيًا، أي حين لا يقسم <MathText>{'$k^2$'}</MathText> المساحة.
                </p>
              )}
            </div>
          ),
        },
        {
          num: 2, title: 'جداء جذرين — 1) انقل وأكمل الجدول', subtitle: 'اختر في كل سطر القيمة الصحيحة', done: tableA,
          content: (
            <div className="space-y-3">
              <RootTable columns={ACTIVITY.columns} rows={ACTIVITY.rows} caption="الجدول قبل الإكمال" />
              <BatchChoiceQuestion
                rowCols="auto"
                intro={<p className="text-sm font-semibold text-slate-700">احسب العمودين الأخيرين في كل سطر من الجدول:</p>}
                rows={[
                  { id: 'a1', label: <MathText>{'$\\sqrt{4} \\times \\sqrt{36}$'}</MathText>, options: ['$12$', '$72$', '$144$'].map(cell), correct: 0, correction: <MathText>{'$2 \\times 6 = 12$'}</MathText> },
                  { id: 'a2', label: <MathText>{'$\\sqrt{4 \\times 36}$'}</MathText>, options: ['$144$', '$12$', '$72$'].map(cell), correct: 1, correction: <MathText>{'$\\sqrt{144} = 12$'}</MathText> },
                  { id: 'b1', label: <MathText>{'$\\sqrt{9} \\times \\sqrt{25}$'}</MathText>, options: ['$225$', '$75$', '$15$'].map(cell), correct: 2, correction: <MathText>{'$3 \\times 5 = 15$'}</MathText> },
                  { id: 'b2', label: <MathText>{'$\\sqrt{9 \\times 25}$'}</MathText>, options: ['$\\sqrt{34}$', '$15$', '$225$'].map(cell), correct: 1, correction: <MathText>{'$\\sqrt{225} = 15$'}</MathText> },
                  { id: 'c1', label: <MathText>{'$\\sqrt{0{,}16} \\times \\sqrt{49}$'}</MathText>, options: ['$0{,}28$', '$2{,}8$', '$7{,}84$'].map(cell), correct: 1, correction: <MathText>{'$0{,}4 \\times 7 = 2{,}8$ — لأن $0{,}4^2 = 0{,}16$'}</MathText> },
                  { id: 'c2', label: <MathText>{'$\\sqrt{0{,}16 \\times 49}$'}</MathText>, options: ['$7{,}84$', '$0{,}56$', '$2{,}8$'].map(cell), correct: 2, correction: <MathText>{'$\\sqrt{7{,}84} = 2{,}8$ لأن $2{,}8^2 = 7{,}84$'}</MathText> },
                ]}
                requires={['jidhr-taarif']}
                feedback={fb}
                onAnswered={() => setTableA(true)}
              />
              {tableA && <RootTable columns={ACTIVITY.columns} rows={ACTIVITY.rows} filled caption="الجدول مكتملًا" />}
            </div>
          ),
        },
        {
          num: 3, title: 'جداء جذرين — 2) ضع تخمينًا', done: conjA,
          content: (
            <div className="space-y-3">
              {/* LA TRACE DE L'ÉLÈVE : le tableau qu'il vient de compléter, pas une option-réponse. */}
              <div className="space-y-1" data-activity-evidence>
                <p className="text-sm font-semibold text-slate-700">جدولك:</p>
                {tableA
                  ? <RootTable columns={ACTIVITY.columns} rows={ACTIVITY.rows} filled />
                  : <p className="text-sm text-slate-500">أكمل الجدول في الخطوة 2 أولًا.</p>}
              </div>
              <TapQuestion
                prompt={<MathText>{ACTIVITY.questions[1]}</MathText>}
                options={[
                  '$\\sqrt{a} \\times \\sqrt{b} = \\sqrt{a + b}$',
                  '$\\sqrt{a} \\times \\sqrt{b} = \\sqrt{a \\times b}$',
                  '$\\sqrt{a} \\times \\sqrt{b} = a \\times b$',
                  '$\\sqrt{a} \\times \\sqrt{b} = 2 \\times \\sqrt{a \\times b}$',
                ].map(cell)}
                correct={1}
                cols={1}
                requires={['jidhr-taarif']}
                explain={<span>في كل سطر العمودان الأخيران متساويان: <MathText>{'$12$'}</MathText> و <MathText>{'$12$'}</MathText>، <MathText>{'$15$'}</MathText> و <MathText>{'$15$'}</MathText>، <MathText>{'$2{,}8$'}</MathText> و <MathText>{'$2{,}8$'}</MathText>. هذا تخمين: يبقى أن نبرهنه من أجل كل عددين موجبين.</span>}
                onAnswered={() => setConjA(true)}
              />
            </div>
          ),
        },
        {
          num: 4, title: 'جداء جذرين — 3) أ) و ب) نحو البرهان', subtitle: 'من أجل كل عددين موجبين', done: proofA,
          content: (
            <div className="space-y-3">
              <p className="text-sm text-slate-700"><MathText>{ACTIVITY.questions[2]}</MathText></p>
              <BatchChoiceQuestion
                intro={<div className="space-y-1 text-sm text-slate-700"><p><MathText>{ACTIVITY.questions[3]}</MathText></p><p><MathText>{ACTIVITY.questions[4]}</MathText></p></div>}
                rows={[
                  { id: 'p1', label: <span>أ) العدد <MathText>{'$\\sqrt{a} \\times \\sqrt{b}$'}</MathText></span>, options: ['موجب: جداء عددين موجبين', 'سالب: جداء جذرين'], correct: 0 },
                  { id: 'p2', label: <span>أ) العدد <MathText>{'$\\sqrt{a \\times b}$'}</MathText></span>, options: ['قد يكون سالبًا', 'موجب: جذر تربيعي لعدد موجب'], correct: 1 },
                  { id: 'p3', label: <MathText>{'ب) $(\\sqrt{a \\times b})^2 =$'}</MathText>, options: ['$a \\times b$', '$\\sqrt{a \\times b}$', '$(a \\times b)^2$'].map(cell), correct: 0, correction: <MathText>{'$(\\sqrt{x})^2 = x$ مع $x = a \\times b$'}</MathText> },
                  { id: 'p4', label: <MathText>{'ب) $(\\sqrt{a} \\times \\sqrt{b})^2 = (\\sqrt{a})^2 \\times (\\sqrt{b})^2 =$'}</MathText>, options: ['$a + b$', '$a \\times b$', '$a^2 \\times b^2$'].map(cell), correct: 1, correction: <MathText>{'$(\\sqrt{a})^2 = a$ و $(\\sqrt{b})^2 = b$'}</MathText> },
                ]}
                requires={['murabba-jidhr', 'quwa-jidaa-kasr']}
                feedback={({ allRight }) => (
                  <Feedback tone={allRight ? 'ok' : 'ko'}>
                    <MathText>{'العددان موجبان، ولهما نفس المربع: $(\\sqrt{a \\times b})^2 = a \\times b$ و $(\\sqrt{a} \\times \\sqrt{b})^2 = a \\times b$.'}</MathText>
                  </Feedback>
                )}
                onAnswered={() => setProofA(true)}
              />
            </div>
          ),
        },
        {
          num: 5, title: 'جداء جذرين — 3) جـ) استنتج', done: concA,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<span>عددان <strong>موجبان</strong> لهما <strong>نفس المربع</strong> <MathText>{'$a \\times b$'}</MathText>. <MathText>{ACTIVITY.questions[5]}</MathText></span>}
                options={[
                  '$\\sqrt{a} \\times \\sqrt{b} = -\\sqrt{a \\times b}$',
                  'العددان مختلفان لأن كتابتيهما مختلفتان',
                  '$\\sqrt{a} \\times \\sqrt{b} = \\sqrt{a \\times b}$',
                ].map(cell)}
                correct={2}
                cols={1}
                requires={['murabba-jidhr']}
                explain={<span>عددان موجبان لهما نفس المربع متساويان: كلاهما العدد الموجب الذي مربعه <MathText>{'$a \\times b$'}</MathText>. أما <MathText>{'$-\\sqrt{a \\times b}$'}</MathText> فعدد سالب.</span>}
                onAnswered={() => setConcA(true)}
              />
              {concA && (
                <KnowledgeBrick id="jidaa-jidhrayn" lead="برهنت تخمينك: هذه هي الخاصية 1، وهي ما رأيته على ضلع المربّع المبلّط." />
              )}
            </div>
          ),
        },
        {
          needsRound: { id: 'r3', label: 'الجولة 3', icon: '🧱', won: Boolean(won.r3) },
          num: 6, title: 'حاصل قسمة جذرين — 1) انقل وأكمل الجدول', subtitle: 'انظر جيّدًا إلى كل سطر، وإلى السطر الأخير خاصةً', done: tableB,
          content: (
            <div className="space-y-3">
              <RootTable columns={ACTIVITY_B.columns} rows={ACTIVITY_B.rows} noMeaning={ACTIVITY_B.noMeaning} caption="الجدول قبل الإكمال" />
              <BatchChoiceQuestion
                rowCols="auto"
                intro={<p className="text-sm font-semibold text-slate-700">احسب العمودين الأخيرين في كل سطر (الجذر التربيعي لعدد سالب لا معنى له):</p>}
                rows={[
                  { id: 'a1', label: <MathText>{'$\\dfrac{\\sqrt{36}}{\\sqrt{4}}$'}</MathText>, options: ['$9$', '$3$', '$\\sqrt{32}$'].map(cell), correct: 1, correction: <MathText>{'$\\dfrac{6}{2} = 3$'}</MathText> },
                  { id: 'a2', label: <MathText>{'$\\sqrt{\\dfrac{36}{4}}$'}</MathText>, options: ['$3$', '$9$', '$\\sqrt{32}$'].map(cell), correct: 0, correction: <MathText>{'$\\sqrt{9} = 3$'}</MathText> },
                  { id: 'b1', label: <MathText>{'$\\dfrac{\\sqrt{25}}{\\sqrt{100}}$'}</MathText>, options: ['$0{,}5$', '$0{,}25$', '$5$'].map(cell), correct: 0, correction: <MathText>{'$\\dfrac{5}{10} = 0{,}5$'}</MathText> },
                  { id: 'b2', label: <MathText>{'$\\sqrt{\\dfrac{25}{100}}$'}</MathText>, options: ['$0{,}05$', '$0{,}25$', '$0{,}5$'].map(cell), correct: 2, correction: <MathText>{'$\\sqrt{0{,}25} = 0{,}5$'}</MathText> },
                  { id: 'c1', label: <MathText>{'$\\dfrac{\\sqrt{0{,}09}}{\\sqrt{0{,}81}}$'}</MathText>, options: ['$\\dfrac{1}{9}$', '$\\dfrac{1}{3}$', '$\\dfrac{1}{30}$'].map(cell), correct: 1, correction: <MathText>{'$\\dfrac{0{,}3}{0{,}9} = \\dfrac{1}{3}$'}</MathText> },
                  { id: 'c2', label: <MathText>{'$\\sqrt{\\dfrac{0{,}09}{0{,}81}}$'}</MathText>, options: ['$\\dfrac{1}{3}$', '$\\dfrac{1}{9}$', '$\\dfrac{1}{81}$'].map(cell), correct: 0, correction: <MathText>{'$\\sqrt{\\dfrac{1}{9}} = \\dfrac{1}{3}$'}</MathText> },
                  { id: 'd1', label: <MathText>{'$\\dfrac{\\sqrt{-25}}{\\sqrt{-100}}$'}</MathText>, options: [cell('$\\dfrac{1}{2}$'), 'لا معنى له', cell('$-\\dfrac{1}{2}$')], correct: 1, correction: <MathText>{'لا يوجد عدد مربعه سالب: لا معنى لـ $\\sqrt{-25}$ ولا لـ $\\sqrt{-100}$.'}</MathText> },
                  { id: 'd2', label: <MathText>{'$\\sqrt{\\dfrac{-25}{-100}}$'}</MathText>, options: ['لا معنى له', cell('$0{,}5$'), cell('$-0{,}5$')], correct: 1, correction: <MathText>{'$\\dfrac{-25}{-100} = 0{,}25$ عدد موجب، و $\\sqrt{0{,}25} = 0{,}5$'}</MathText> },
                ]}
                requires={['jidhr-taarif']}
                feedback={fb}
                onAnswered={() => setTableB(true)}
              />
              {tableB && <RootTable columns={ACTIVITY_B.columns} rows={ACTIVITY_B.rows} noMeaning={ACTIVITY_B.noMeaning} filled caption="الجدول مكتملًا" />}
            </div>
          ),
        },
        {
          num: 7, title: 'حاصل قسمة جذرين — 2) ضع تخمينًا', done: conjB,
          content: (
            <div className="space-y-3">
              <div className="space-y-1" data-activity-evidence>
                <p className="text-sm font-semibold text-slate-700">جدولك:</p>
                {tableB
                  ? <RootTable columns={ACTIVITY_B.columns} rows={ACTIVITY_B.rows} noMeaning={ACTIVITY_B.noMeaning} filled />
                  : <p className="text-sm text-slate-500">أكمل الجدول في الخطوة 6 أولًا.</p>}
              </div>
              <TapQuestion
                prompt={<span><MathText>{ACTIVITY_B.questions[1]}</MathText> (في الأسطر التي يكون فيها <MathText>{'$a$'}</MathText> و <MathText>{'$b$'}</MathText> موجبين)</span>}
                options={[
                  '$\\dfrac{\\sqrt{a}}{\\sqrt{b}} = \\dfrac{a}{b}$',
                  '$\\dfrac{\\sqrt{a}}{\\sqrt{b}} = \\sqrt{a - b}$',
                  '$\\dfrac{\\sqrt{a}}{\\sqrt{b}} = \\sqrt{\\dfrac{a}{b}}$',
                ].map(cell)}
                correct={2}
                cols={1}
                requires={['jidhr-taarif']}
                explain={<span>في الأسطر الثلاثة الأولى العمودان الأخيران متساويان. أما السطر الأخير فـ <MathText>{'$\\sqrt{\\dfrac{-25}{-100}} = 0{,}5$'}</MathText> موجود مع أن <MathText>{'$\\sqrt{-25}$'}</MathText> و <MathText>{'$\\sqrt{-100}$'}</MathText> لا معنى لهما: لذلك يشترط التخمين عددين موجبين.</span>}
                onAnswered={() => setConjB(true)}
              />
            </div>
          ),
        },
        {
          num: 8, title: 'حاصل قسمة جذرين — 3) البرهان', subtitle: 'من أجل كل عددين موجبين، والمقام غير معدوم', done: proofB,
          content: (
            <div className="space-y-3">
              <p className="text-sm text-slate-700"><MathText>{ACTIVITY_B.questions[2]}</MathText></p>
              <BatchChoiceQuestion
                intro={<div className="space-y-1 text-sm text-slate-700"><p><MathText>{ACTIVITY_B.questions[3]}</MathText></p><p><MathText>{ACTIVITY_B.questions[4]}</MathText></p></div>}
                rows={[
                  { id: 'p1', label: <span>أ) العددان <MathText>{'$\\dfrac{\\sqrt{a}}{\\sqrt{b}}$'}</MathText> و <MathText>{'$\\sqrt{\\dfrac{a}{b}}$'}</MathText></span>, options: ['متعاكسان', 'موجبان'], correct: 1, correction: 'حاصل قسمة عددين موجبين موجب، والجذر التربيعي موجب.' },
                  { id: 'p2', label: <MathText>{'ب) $\\left(\\sqrt{\\dfrac{a}{b}}\\right)^2 =$'}</MathText>, options: ['$\\dfrac{a}{b}$', '$\\dfrac{a^2}{b^2}$', '$\\sqrt{\\dfrac{a}{b}}$'].map(cell), correct: 0 },
                  { id: 'p3', label: <MathText>{'ب) $\\left(\\dfrac{\\sqrt{a}}{\\sqrt{b}}\\right)^2 = \\dfrac{(\\sqrt{a})^2}{(\\sqrt{b})^2} =$'}</MathText>, options: ['$\\dfrac{a^2}{b}$', '$\\dfrac{a}{b}$', '$\\dfrac{a}{b^2}$'].map(cell), correct: 1, correction: <MathText>{'نربّع البسط والمقام معًا: $(\\sqrt{a})^2 = a$ و $(\\sqrt{b})^2 = b$'}</MathText> },
                ]}
                requires={['murabba-jidhr', 'quwa-jidaa-kasr']}
                feedback={({ allRight }) => (
                  <Feedback tone={allRight ? 'ok' : 'ko'}>
                    {/* La conclusion (« إذن هما متساويان ») est laissée à la prédiction de l'élève : la brique suit. */}
                    <MathText>{'جـ) العددان موجبان، ولهما نفس المربع $\\dfrac{a}{b}$.'}</MathText>
                  </Feedback>
                )}
                onAnswered={() => setProofB(true)}
              />
              {proofB && (
                <KnowledgeBrick id="qismat-jidhrayn" lead="هذا ما استنتجته في جـ): الخاصية 2." />
              )}
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={1} variant="memo" />}
    />
  );
}
