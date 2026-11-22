import { useState } from 'react';
import { parseDec } from '@smarter-academy/core';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick, PredictRule } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import GeoFigure from '../../../../../../common/components/GeoFigure';
import { Manipulation, ManipulationWorkspace } from '../../../../../../common/manipulations';
import { TextbookBox } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { ACTIVITY, ACTIVITY_LINES, SHADOW_WORLD, SHADOW_STEPS } from '../content/textbook';
import { FIG_ACT1_CASE1, FIG_ACT1_CASE2, FIG_SHADOW, FIG_TRANSFER } from '../content/figures';
import { M1_ROUNDS } from '../content/shadows';
import LabRounds from '../../../../../../common/manipulations/rounds/LabRounds';
import PlayerSwitch from '../../../../../../common/mission/PlayerSwitch';

/**
 * Module 1 — « ساحة الحيّ » puis نشاط 1 (p. 104) « خاصية طالس » (refonte du 2026-10-13 : le faisceau `thales-beam` est
 * REMPLACÉ ici par le monde `shadow-world`, MANIPULATION_DNA §16 ; le faisceau garde son rôle dans la leçon 2).
 *
 * Le parcours : l'élève VIT la phénomène (le soleil tenu, le ruban, un pari, SA règle « ombre = hauteur × k » que le monde
 * teste puis réfute quand le soleil bouge) AVANT qu'aucun texte ne parle de triangles — puis les étapes ÉCRIVENT ce qu'il a
 * découvert, de plus en plus généralement :
 *   1 de la Place à la figure : (AM) // (BE) car deux verticales, le rayon est un transversal ;
 *   2 l'égalité de Thalès portée par les triangles OBE et OAM (et ses trois faux amis : inverse, segment au lieu du côté,
 *     différence) ; 3 un calcul sur les objets de la Place (la palmeraie, h = 4,5 m) ;
 *   4 la حالة الأولى du manuel (lettres générales A, B, C, B′, C′ : le MÊME dessin que la Place) ;
 *   5 ses calculs ; 6 la حالة الثانية (وضعية الفراشة, de l'autre côté de A) ; 7 le texte du نشاط, PredictRule « talis-nashat ».
 * Les DEUX niveaux du workspace sont le même monde : مبتدئ (minaret 5 m) et متقدم (minaret 6,5 m), mêmes gestes.
 * Les gestes jugés de l'élève (`onTrial`) sont listés au-dessus des questions (`[data-activity-evidence]`) ; aucune étape
 * n'attend `onFinished`. LP : P1 (étapes 1, 2, 4, 7), P2 (les longueurs : 3, 5, 6).
 *
 * LECTEUR DE MISSION (rollout 2026-11-10, unité 9 leçon 1 ; conseil du 2026-11-10, verdict L1) : l'élève ne joue PAS le monde à cinq couloirs — il
 * joue le labo à UN couloir `shadow-meet` en MANCHES (content/shadows.js › M1_ROUNDS : le lampadaire de 2,75 m → le château d'eau de 6,5 m à
 * 14:00 puis 16:00 → le mât de 3,75 m à planter, requis → défi ⭐ → la ساحة libre). L'étape 1 attend la manche 1 (la rencontre des deux ombres),
 * l'étape 2 la manche 2 (le rapport qui ne change pas d'une heure à l'autre), l'étape 3 la manche 3 (une ombre calculée). Ce que la ligne de trace
 * dit vient des manches GAGNÉES (étoiles gardées, annoncées par LabRounds au montage) : un rechargement ne bloque ni ne vide jamais une étape.
 * Les phrases qui parlaient de la minaret et de « ta règle » parlent ici de « الشيء المرتفع » et de ce que l'élève a TROUVÉ. Aucun texte d'élève
 * ne renvoie au manuel. Hors lecteur (l'enseignant, le mode classe) : le monde `shadow-world` et ses textes, inchangés.
 * Conseil du 2026-11-11 : la manche 1 CHANGE LA PLACE EN FIGURE dans le labo (chaînes `readFigure` : les parallèles et pourquoi) ; l'étape 1 du
 * lecteur vérifie le TRANSFERT sur une figure qui ne ressemble pas au labo (`FIG_TRANSFER`, « quel point joue le rôle de O ? »).
 */
const OBJ = { minaret: 'المئذنة', stick: 'العصا', palm: 'النخلة', flag: 'السارية', lamp: 'العمود', farid: 'فريد' };
const M = (s) => <MathText key={s}>{s}</MathText>;
const near = (target, tol = 0.01) => (x) => Number.isFinite(x) && Math.abs(x - target) <= tol;
/** Lecteur : la figure de la Place, décrite sans la minaret (l'élève y a joué un lampadaire et un château d'eau). */
const FIG_SHADOW_PLAYER_ARIA = 'شيء مرتفع [AM] وعصا [BE] شاقوليان على الأرض، وشعاع الشمس (MO) يمرّ بقمّتيهما وينتهي ظلّاهما في O: المثلثان OBE و OAM لهما الرأس O و (BE) يوازي (AM)';

export default function Module01Nashat() {
  const [stops, setStops] = useState([]);
  const [q0, setQ0] = useState(false);
  const [q0b, setQ0b] = useState(false);
  const [q0c, setQ0c] = useState(false);
  const [q1, setQ1] = useState(false);
  const [q2a, setQ2a] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3a, setQ3a] = useState(false);
  const [q3b, setQ3b] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);
  // lecteur : les manches gagnées (étoiles gardées, annoncées par LabRounds au montage) ouvrent les étapes et remplissent leur trace
  const [won, setWon] = useState({});
  const wonLine = (id, yes, no) => (
    <p className={`rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-sm ${won[id] ? 'font-bold text-emerald-900' : 'text-slate-500'}`}
      data-activity-evidence data-evidence={id} data-tried={won[id] ? 'true' : 'false'}>
      {won[id] ? <><span aria-hidden="true">✓ </span>{yes}</> : no}
    </p>
  );
  // (le module est rendu AU-DESSUS du lecteur : ce qui dépend du lecteur passe par <PlayerSwitch>, jamais par un hook ici)
  const sw = (player, page) => <PlayerSwitch player={player} page={page} />;

  const onTrial = (ev) => { if (!ev?.tk) setStops((s) => [...s, ev].slice(-30)); };   // pas les événements `checkpoint` des questions du labo
  const line = (e) => {
    if (e.stage === 'measure') return `${e.hour} · ${OBJ[e.obj]}: ${e.shadow} m`;
    if (e.stage === 'predict') return `${e.hour} · ${OBJ[e.obj]}: 🚩 ${e.p} m → ${e.truth} m ${e.kind === 'right' ? '✓' : '✗'}`;
    if (e.stage === 'rule') return `${e.hour} · s = h ${e.op} ${e.num} ${e.allFit ? '✓' : '✗'}`;
    if (e.stage === 'meet') return `${e.hour} · AB = ${e.d} m → O = ${e.O} m ✓`;
    if (e.stage === 'answer') return `AM = ${e.h} m ${e.kind === 'right' ? '✓' : '✗'}`;
    return null;
  };
  const shownTrials = stops.map(line).filter(Boolean).slice(-6);
  const evidence = (
    <div className="rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-sm" data-activity-evidence data-tried={shownTrials.length ? 'true' : 'false'}>
      {shownTrials.length === 0 ? (
        <p className="text-slate-500">لم تفعل شيئًا في الساحة بعد: حرّك الشمس ☀ في السماء وقِس الظلال، ثم عُد إلى الأسئلة.</p>
      ) : (
        <>
          <p className="mb-1 font-bold text-slate-700">ما فعلته في ساحة الحيّ:</p>
          <ul className="ms-4 list-disc" data-evidence="trials">
            {shownTrials.map((t, i) => <li key={i}><bdi dir="ltr" className="font-mono">{t}</bdi></li>)}
          </ul>
        </>
      )}
    </div>
  );

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      moduleTitle="ساحة الحيّ — الظلال والمثلثات"
      moduleSubtitle="اكتشف بنفسك ما يربط طول كل شيء بظلّه، ثم اقرأه في المثلثات"
      objectives={['ما العلاقة بين طول شيء شاقولي وطول ظلّه؟', 'كيف نعرف ارتفاع ما لا نصل إليه؟', 'أيّ نسب تتساوى في المثلثين عندما يتوازى مستقيمان؟']}
      estimatedTime="20 دقيقة"
      intro={
        // LE LABO OUVRE LE MODULE (§4quater) : ni carte du manuel ni titre / lead de workspace ; le contexte est le `lead` du labo.
        // Lecteur : les MANCHES du labo à un couloir (content/shadows.js) ; la page garde le monde `shadow-world` et ses deux niveaux.
        <PlayerSwitch
          player={(
            <LabRounds lessonId={MODULE_CTX.lessonId} labId="m1-shadows" rounds={M1_ROUNDS} icon="☀️" freeIcon="🏙️"
              onRoundWon={(id) => setWon((w) => ({ ...w, [id]: true }))} />
          )}
          page={(
        <ManipulationWorkspace
          defaultLevel="beginner"
          levels={{
            beginner: () => (
              <Manipulation type="shadow-world" level="beginner" {...SHADOW_WORLD.beginner} lead={SHADOW_STEPS.situation} onTrial={onTrial} />
            ),
            advanced: () => (
              <Manipulation type="shadow-world" level="advanced" {...SHADOW_WORLD.advanced} lead={SHADOW_STEPS.situation} onTrial={onTrial} />
            ),
          }}
        />
          )}
        />
      }
      steps={[
        {
          needsRound: { id: 'r1', label: 'الجولة 1', icon: '☀️', won: Boolean(won.r1) },
          num: 1, title: 'من الساحة إلى الشكل الهندسي', subtitle: sw('أين O؟', 'ما المتوازي؟'), done: q0,
          // Lecteur (conseil du 2026-11-11) : le passage de la place à la figure se fait DANS le labo (la manche 1 change la scène en figure et
          // demande les parallèles et pourquoi) ; l'étape vérifie le TRANSFERT — la même configuration tournée, penchée, d'autres lettres.
          content: sw(
            <div className="space-y-3" data-step-transfer>
              {wonLine('r1', 'الجولة 1: رأيتَ الساحة تصير شكلًا، ووجدتَ المستقيمين المتوازيين.', 'الجولة 1: لم تُنهِ الجولة بعد.')}
              <p className="text-sm text-slate-800"><MathText>{'الشكل نفسه الذي رأيته في الساحة، لكن مُدارًا ومائلًا وبحروف أخرى: $(LP) \\parallel (NQ)$ .'}</MathText></p>
              {/* la question se lit SUR la figure : les deux restent sur le même écran du lecteur (`data-paging-keep`) */}
              <div className="grid items-center gap-4 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]" data-paging-keep>
                <GeoFigure {...FIG_TRANSFER} />
                <TapQuestion
                prompt={<MathText>{'أيّ نقطة تلعب هنا دور $O$ ، نهاية الظلّين في الساحة؟'}</MathText>}
                // des lettres seules : une option décrite (« là où les sécantes se coupent ») donnerait la réponse
                options={['$N$', '$K$', '$L$', '$Q$'].map(M)}
                correct={1}
                cols={2}
                explain={<MathText>{'$K$ مثل $O$ : منها يخرج المستقيمان $(KN)$ و $(KQ)$ اللذان يقطعان المتوازيين $(LP)$ و $(NQ)$ ، كما يخرج الشعاع والأرض من $O$ . المثلثان هنا $KLP$ و $KNQ$ ، مثل $OBE$ و $OAM$ .'}</MathText>}
                onAnswered={() => setQ0(true)}
              />
              </div>
            </div>,
            // la page et l'enseignant : inchangés (le monde shadow-world, la figure de la place, la question des parallèles)
              <div className="space-y-3">
                {evidence}
                <p className="text-sm text-slate-800"><MathText>{SHADOW_STEPS.bridge}</MathText></p>
                <GeoFigure {...FIG_SHADOW} />
                <TapQuestion
                  prompt={<MathText>{'أيّ مستقيمين متوازيان في الشكل، ولماذا؟'}</MathText>}
                  options={[
                    M('$(AM)$ و $(BE)$ : كلاهما شاقولي، أي عمودي على الأرض $(OA)$'),
                    M('$(OM)$ و $(BE)$ : كلاهما يمرّ بقمّة'),
                    M('$(AM)$ و $(OA)$ : كلاهما يمسّ المئذنة'),
                  ]}
                  correct={0}
                  cols={1}
                  explain={<MathText>{SHADOW_STEPS.parallel}</MathText>}
                  onAnswered={() => setQ0(true)}
                />
              </div>,
          ),
        },
        {
          needsRound: { id: 'r2', label: 'الجولة 2', icon: '☀️', won: Boolean(won.r2) },
          num: 2, title: 'المثلثان في وضعية طالس', subtitle: 'أيّ مساواة؟', done: q0b,
          content: (
            <div className="space-y-3">
              <PlayerSwitch
                player={wonLine('r2', 'الجولة 2: تغيّرت الساعة وطال الظلّان، وبقيت النسبة بينهما كما هي.', 'الجولة 2: لم تقارن بعد الظلّين عند ساعتين مختلفتين.')}
                page={null}
              />
              {sw(<GeoFigure {...FIG_SHADOW} ariaLabel={FIG_SHADOW_PLAYER_ARIA} />, <GeoFigure {...FIG_SHADOW} />)}
              <TapQuestion
                prompt={<MathText>{'للمثلثين $OBE$ و $OAM$ الرأس $O$ و $(BE) \\parallel (AM)$ . أيّ مساواة صحيحة؟'}</MathText>}
                options={[
                  '$\\dfrac{OB}{OA} = \\dfrac{BE}{AM}$',
                  '$\\dfrac{OB}{OA} = \\dfrac{AM}{BE}$',
                  '$\\dfrac{OB}{AB} = \\dfrac{BE}{AM}$',
                  '$OA - OB = AM - BE$',
                ].map(M)}
                correct={0}
                cols={1}
                requires={['jadwal-tanasub']}
                explain={sw(<MathText>{`${SHADOW_STEPS.equalityPlayer} ($AB$ قطعة وليست ضلعا من المثلثين، والنسبة المقلوبة والفرق لا يصحّان.)`}</MathText>, <MathText>{`${SHADOW_STEPS.equality} ($AB$ قطعة وليست ضلعا من المثلثين، والنسبة المقلوبة والفرق لا يصحّان.)`}</MathText>)}
                onAnswered={() => setQ0b(true)}
              />
            </div>
          ),
        },
        {
          needsRound: { id: 'r3', label: 'الجولة 3', icon: '☀️', won: Boolean(won.r3) },
          num: 3, title: 'احسب طولًا من ظلّين', subtitle: 'ارتفاع النخلة', done: q0c,
          content: (
            <div className="space-y-3">
              <PlayerSwitch
                player={wonLine('r3', 'الجولة 3: حسبتَ أين ينتهي ظلّ السارية قبل أن تُنصب، وغرستَ العلم في مكانه.', 'الجولة 3: لم تحسب بعد أين ينتهي ظلّ السارية.')}
                page={null}
              />
              <p className="text-sm text-slate-800"><MathText>{SHADOW_STEPS.calc}</MathText></p>
              <NumericQuestion
                prompt="ما ارتفاع النخلة بالمتر؟"
                expected={near(SHADOW_STEPS.answers.palm, 0.001)}
                parse={parseDec}
                display="7,75"
                requires={['rabi-mutanasib']}
                explain={<MathText>{SHADOW_STEPS.calcLine}</MathText>}
                explainFor={(n) => <MathText>{near(SHADOW_STEPS.wrong.times, 0.01)(n) ? `هذا $9{,}3 \\times 1{,}2$ : ضربتَ بدل أن تقسم. الظلّ أطول من الطول بـ $1{,}2$ مرّة، فالطول أقصر من الظلّ. ${SHADOW_STEPS.calcLine}` : near(SHADOW_STEPS.wrong.minus, 0.01)(n) ? `هذا $9{,}3 - 0{,}55$ : طرحتَ الفرق بين ظلّ العمود وطوله. لكنّ الفرق ليس نفسه لكل الأشياء، النسبة هي التي تبقى. ${SHADOW_STEPS.calcLine}` : SHADOW_STEPS.calcLine}</MathText>}
                onAnswered={() => setQ0c(true)}
              />
            </div>
          ),
        },
        {
          num: 4, title: 'الحالة الأولى: النسب', subtitle: 'ثلاث نسب', done: q1,
          content: (
            <div className="space-y-3">
              <p className="text-sm text-slate-700" data-bridge="letters"><MathText>{'الشكل نفسه الذي رسمتَه من الساحة، لكن بحروف عامة: $A$ هي $O$ ، والمستقيمان المتوازيان $(BC)$ و $(B\'C\')$ هما $(AM)$ و $(BE)$ .'}</MathText></p>
              <TextbookBox kind="situation" text={ACTIVITY.case1} source={ACTIVITY.source} compact />
              <GeoFigure {...FIG_ACT1_CASE1} />
              <TapQuestion
                prompt={<MathText>{'أتمم: $\\dfrac{AB\'}{AB} = \\dfrac{\\ldots}{\\ldots} = \\dfrac{\\ldots}{\\ldots}$'}</MathText>}
                options={[
                  "$\\dfrac{AB'}{AB} = \\dfrac{AC'}{AC} = \\dfrac{B'C'}{BC}$",
                  "$\\dfrac{AB'}{AB} = \\dfrac{AC'}{C'C} = \\dfrac{B'C'}{BC}$",
                  "$\\dfrac{AB'}{AB} = \\dfrac{AC}{AC'} = \\dfrac{BC}{B'C'}$",
                ].map(M)}
                correct={0}
                cols={1}
                requires={['jadwal-tanasub']}
                explain={<MathText>{'في كل نسبة: طول من المثلث الصغير $AB\'C\'$ على الطول الموافق له في المثلث الكبير $ABC$ . ($C\'C$ قطعة وليست ضلعا للمثلث، والنسبتان المقلوبتان لا تساويان $\\dfrac{AB\'}{AB}$ .)'}</MathText>}
                onAnswered={() => setQ1(true)}
              />
            </div>
          ),
        },
        {
          num: 5, title: 'الحالة الأولى: الحساب', subtitle: 'AC′ و B′C′', done: q2,
          content: (
            <div className="space-y-3">
              {ACTIVITY.case1Numeric.map((l) => <p key={l} className="text-sm text-slate-800"><MathText>{l}</MathText></p>)}
              <NumericQuestion
                prompt={<MathText>{'$AC\'$ بالسنتيمتر (القيمة المدوّرة إلى الجزء من 100):'}</MathText>}
                expected={near(56 / 15)}
                parse={parseDec}
                // la valeur arrondie seule : « 56 » est un nombre de la مسألة الدرس, interdit dans tout rôle avant elle (content/forbidden.js, revue 2026-11-10)
                display="≈ 3,73"
                requires={['rabi-mutanasib']}
                explain={<MathText>{ACTIVITY_LINES.case1AC}</MathText>}
                explainFor={(n) => <MathText>{near(6 * 3.2 / 7, 0.02)(n) ? `هذا $\\dfrac{6 \\times 3{,}2}{7}$ : النسبة مقلوبة. ${ACTIVITY_LINES.case1AC}` : ACTIVITY_LINES.case1AC}</MathText>}
                onAnswered={() => setQ2a(true)}
              />
              {q2a && (
                <NumericQuestion
                  prompt={<MathText>{'$B\'C\'$ بالسنتيمتر (القيمة المدوّرة إلى الجزء من 100):'}</MathText>}
                  expected={near(244 / 75)}
                  parse={parseDec}
                  display="244/75 ≈ 3,25"
                  requires={['rabi-mutanasib']}
                  explain={<MathText>{ACTIVITY_LINES.case1BC}</MathText>}
                  onAnswered={() => setQ2(true)}
                />
              )}
            </div>
          ),
        },
        {
          num: 6, title: 'الحالة الثانية', subtitle: 'وضعية الفراشة', done: q3,
          content: (
            <div className="space-y-3">
              <TextbookBox kind="situation" text={ACTIVITY.case2} source={ACTIVITY.source} compact />
              <GeoFigure {...FIG_ACT1_CASE2} />
              <TapQuestion
                prompt={<MathText>{'ب) لماذا المستقيمان $(BC)$ و $(B\'\'C\'\')$ متوازيان؟'}</MathText>}
                options={[
                  "التناظر المركزي بالنسبة إلى A يحوّل $(B'C')$ إلى مستقيم يوازيه هو $(B''C'')$ ، و $(B'C') \\parallel (BC)$",
                  "لأن $AB'' = AC''$",
                  "لأن B″ و C″ تقعان على الشاشة الكبيرة $(BC)$",
                ].map(M)}
                correct={0}
                cols={1}
                requires={['mustaqim-muntasafayn']}
                explain={<MathText>{ACTIVITY_LINES.case2Sym}</MathText>}
                onAnswered={() => setQ3a(true)}
              />
              {q3a && (
                <>
                  {ACTIVITY.case2Numeric.map((l) => <p key={l} className="text-sm text-slate-800"><MathText>{l}</MathText></p>)}
                  <NumericQuestion
                    prompt={<MathText>{'$AC\'$ بالسنتيمتر:'}</MathText>}
                    expected={near(2.25, 0.001)}
                    parse={parseDec}
                    display="2,25"
                    requires={['rabi-mutanasib']}
                    explain={<MathText>{ACTIVITY_LINES.case2AC}</MathText>}
                    onAnswered={() => setQ3b(true)}
                  />
                </>
              )}
              {q3b && (
                <NumericQuestion
                  prompt={<MathText>{'استنتج $B\'C\'$ بالسنتيمتر:'}</MathText>}
                  expected={near(1.5, 0.001)}
                  parse={parseDec}
                  display="1,5"
                  requires={['rabi-mutanasib']}
                  explain={<MathText>{ACTIVITY_LINES.case2BC}</MathText>}
                  onAnswered={() => setQ3(true)}
                />
              )}
            </div>
          ),
        },
        {
          num: 7, title: 'نص خاصية طالس', subtitle: 'أتمم النص', done: q4,
          content: (
            <div className="space-y-3">
              <TextbookBox kind="situation" text={ACTIVITY.part3} source={ACTIVITY.source} compact />
              <PredictRule id="talis-nashat">
                <TapQuestion
                  prompt="النص المكتمل هو:"
                  options={[
                    "إذا كان $(BC)$ و $(B'C')$ متوازيين فإن $\\dfrac{AB'}{AB} = \\dfrac{AC'}{AC} = \\dfrac{B'C'}{BC}$",
                    "إذا كان $(BC)$ و $(B'C')$ متوازيين فإن $\\dfrac{AB'}{B'B} = \\dfrac{AC'}{C'C} = \\dfrac{B'C'}{BC}$",
                    "إذا كان $(BC)$ و $(B'C')$ متوازيين فإن $AB - AB' = AC - AC'$",
                  ].map(M)}
                  correct={0}
                  cols={1}
                  requires={['jadwal-tanasub']}
                  explain={<MathText>{'في الحالة الأولى $\\dfrac{3{,}2}{6} = \\dfrac{8}{15}$ لكن $\\dfrac{3{,}2}{2{,}8} = \\dfrac{8}{7}$ ، و $6 - 3{,}2 = 2{,}8$ بينما $7 - \\dfrac{56}{15} = \\dfrac{49}{15}$ : الأطوال تُضرب في العدد نفسه ولا يُطرح منها العدد نفسه.'}</MathText>}
                  onAnswered={() => setQ4(true)}
                />
              </PredictRule>
              {q4 && <KnowledgeBrick id="talis-nashat" lead="ما وجدته بالشاشة وبالحساب، في الحالتين:" />}
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={1} variant="memo" />}
    />
  );
}
