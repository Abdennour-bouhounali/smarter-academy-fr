import { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, KnowledgeBrick, PredictRule } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import GeoFigure from '../../../../../../common/components/GeoFigure';
import { Feedback } from '../../../../../../common/components/LessonUI';
import { Manipulation, ManipulationWorkspace } from '../../../../../../common/manipulations';
import { SourceTag } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { ACTIVITY, LAB } from '../content/textbook';
import { FIG_ACT2, FIG_ACT2_STUDENTS } from '../content/figures';
import { M1_ROUNDS } from '../content/planks';
import LabRounds from '../../../../../../common/manipulations/rounds/LabRounds';
import PlayerSwitch from '../../../../../../common/mission/PlayerSwitch';

/**
 * Module 1 — نشاط 2 (p. 105) « الخاصية العكسية لخاصية طالس », ouvert sur LE NIVEAU À BULLE (parallel-level).
 *
 * REAL / DISCOVER / MANIPULATE  le lab à deux niveaux, même objectif :
 *   متقدم (ouvert par défaut : le نشاط 2) : le tréteau en X, AB = 9 et AC = 12, le rapport 1/3 du professeur ; l'élève
 *          reproduit les trois figures des élèves par SES placements (la figure 3 refusée par la bulle) ;
 *   مبتدئ : l'échelle double des graffeurs du quartier (AB = 6, AC = 9) — deux planches de niveau, 1/3 et 2/3.
 * UNDERSTAND  les questions أ et ب se décident sur les figures du manuel redessinées ET sur les figures de l'élève
 *           (`onTrial` → `[data-activity-evidence]`, au-dessus des questions) ; 2) le texte complété.
 * FORMALIZE  la brique aksiya-nashat (le texte « الخاصية العكسية لخاصية طالس » et la ملاحظة sur l'ordre), puis une
 *           question sur l'ordre de la figure 3. AUCUNE étape n'attend `onFinished`. LP : P1 (ب، 2)), P2 (أ، l'ordre).
 * « أتوقّع القاعدة » : le texte à compléter de la question 2) EST la règle (« انقل وأتمم ») ; il est donc enveloppé
 * dans <PredictRule id="aksiya-nashat"> — l'élève écrit les conditions avec ses mots (predictPrompt de knowledge.jsx)
 * AVANT de voir le texte, puis la question et la brique s'affichent.
 * La « مسألة الدرس » (ANCIENNE carte, retirée du module le 2026-10-09 — elle ne vit plus qu'au sommaire) ferme la dernière étape (les labs sont dans `intro`) : le même tréteau en X,
 * d'autres nombres, résolu au module 5.
 *
 * LECTEUR DE MISSION (rollout 2026-11-10, unité 9 leçon 2 ; conseil du 2026-11-10, verdict L2) : le labo se joue en MANCHES (content/planks.js ›
 * M1_ROUNDS : l'échelle 3 / 6 à la main → le tréteau 9 / 12 au rapport 1/3 → le tréteau 8 / 12 libre, requis → défi ⭐ 12 / 16 → la ورشة libre)
 * au lieu de مبتدئ / متقدم ; un essai est un appui sur « ضع الميزان ». L'étape 1 attend la manche 2 (les figures 1 et 2 au rapport 1/3), l'étape 2
 * la manche 3 (la figure 3 refusée par la bulle). Ce que la ligne de trace dit vient des manches GAGNÉES (étoiles gardées, annoncées par LabRounds
 * au montage) : un rechargement ne bloque ni ne vide jamais une étape. Hors lecteur : inchangé.
 */
const M = (s) => <MathText key={s}>{s}</MathText>;
const FIG_NAME = { 1: 'الشكل 1', 2: 'الشكل 2', 3: 'الشكل 3', '3m': 'الشكل 3 (بالتبادل)' };

export default function Module01Nashat() {
  const [trials, setTrials] = useState([]);
  const [q1a, setQ1a] = useState(false);
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);

  const onTrial = (tr) => { if (tr?.figure) setTrials((t) => [...t.filter((x) => x.figure !== tr.figure), tr]); };
  // lecteur : les manches gagnées (étoiles gardées, annoncées par LabRounds au montage) ouvrent les étapes et remplissent leur trace
  const [won, setWon] = useState({});
  const evidencePlayer = (
    <ul className="space-y-1 rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-sm" data-activity-evidence data-tried={won.r2 || won.r3 ? 'true' : 'false'}>
      <li className={won.r2 ? 'font-bold text-emerald-900' : 'text-slate-500'} data-evidence="r2" data-tried={won.r2 ? 'true' : 'false'}>
        {won.r2 ? '✓ الجولة 2: بشرط الأستاذ (كل نسبة ثلث) وضعتَ اللوح أفقيًا بين A والأرض (الشكل 2) وفوق A (الشكل 1).' : 'الجولة 2: لم تضع بعد اللوح أفقيًا بشرط الأستاذ.'}
      </li>
      <li className={won.r3 ? 'font-bold text-rose-800' : 'text-slate-500'} data-evidence="r3" data-tried={won.r3 ? 'true' : 'false'}>
        {won.r3 ? '✗ الجولة 3: لوح نسبتاه متساويتان وطرفاه في جهتين مختلفتين من A (الشكل 3): بقيت الفقاعة مائلة.' : 'الجولة 3: لم تجرّب بعد لوحًا طرفاه في جهتين مختلفتين من A.'}
      </li>
    </ul>
  );
  const evidence = (
    <div className="rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-sm" data-activity-evidence data-tried={trials.length ? 'true' : 'false'}>
      {trials.length === 0 ? (
        <p className="text-slate-500">لم تُنجز بعد أي شكل بالنسبة 1/3 على الحامل (المستوى المتقدم).</p>
      ) : (
        <>
          <p className="mb-1 font-bold text-slate-700">أشكالك على الحامل:</p>
          <ul className="flex flex-wrap gap-1.5" data-evidence="figures">
            {trials.map((tr) => (
              <li key={tr.figure} className={`rounded-lg border px-2 py-0.5 text-xs font-bold ${tr.parallel ? 'border-emerald-300 bg-emerald-50 text-emerald-900' : 'border-rose-200 bg-rose-50 text-rose-800'}`} data-evidence-figure={tr.figure}>
                {tr.parallel ? '✓' : '✗'} {FIG_NAME[tr.figure]}: {tr.parallel ? 'الفقاعة في الوسط' : 'الفقاعة مائلة'}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
  const figureGrid = (cls) => (
    <div className={`grid gap-1 grid-cols-3 ${cls}`} data-act2-figures data-paging-keep>
      {[1, 2, 3].map((n) => <GeoFigure key={n} {...FIG_ACT2_STUDENTS[n]} />)}
    </div>
  );
  // les trois figures : UN bloc pour les pages du lecteur (`data-paging-keep`) et plus étroites dans le lecteur (rollout 2026-11-10 — découpées,
  // elles laissaient une grille vide ; pleine largeur, la page dépassait l'écran de 1024 × 768)
  const figures = <PlayerSwitch player={figureGrid('mx-auto max-w-sm')} page={figureGrid('')} />;

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      moduleTitle="اللوح الأفقي والأشكال الثلاثة"
      moduleSubtitle="متى يكون (B′C′) موازيا لـ (BC)؟"
      objectives={['ما الذي يجعل اللوح (B′C′) أفقيًا؟', 'ماذا يحدث لو وضعنا B′ و C′ في جهتين مختلفتين من A؟', 'كيف نكتب النص الكامل للخاصية؟']}
      estimatedTime="13 دقيقة"
      intro={
        // LE LABO OUVRE LE MODULE (§4quater) : ni carte du manuel, ni titre / lead de workspace ; le contexte est le `lead` de chaque labo.
        // Lecteur : les MANCHES (content/planks.js) ; la page garde ses deux niveaux.
        <PlayerSwitch
          player={(
            <LabRounds lessonId={MODULE_CTX.lessonId} labId="m1-planks" rounds={M1_ROUNDS} icon="⚖️" freeIcon="🏟️"
              onTrial={onTrial} onRoundWon={(id) => setWon((w) => ({ ...w, [id]: true }))} />
          )}
          page={(
        <ManipulationWorkspace
          defaultLevel="beginner"
          levels={{
            beginner: () => (
              <Manipulation
                type="parallel-level"
                level="beginner"
                {...LAB.beginner}
                theme="mural"
                lead="سلّم مزدوج على جدار الحي: ساقاه AB = 6 و AC = 9 والأرض (BC). اللوح (B′C′) أفقي عندما تكون الفقاعة في الوسط. ابحث عن وضعين أفقيين للوح."
              />
            ),
            advanced: () => (
              <Manipulation
                type="parallel-level"
                level="advanced"
                {...LAB.advanced}
                theme="mural"
                lead="الحامل على شكل X: العارضتان تستمرّان بعد A، و AB = 9 و AC = 12. اللوح (B′C′) أفقي عندما تكون الفقاعة في الوسط."
                onTrial={onTrial}
              />
            ),
          }}
        />
          )}
        />
      }
      steps={[
        {
          needsRound: { id: 'r2', label: 'الجولة 2', icon: '⚖️', won: Boolean(won.r2) },
          num: 1, title: 'أ) توافق الأشكال مع الشروط', subtitle: 'السؤال 1) أ', done: q1,
          content: (
            <div className="space-y-3">
              <div className="flex gap-2 flex-row items-start" data-act2-situation>
                <div className="shrink-0 w-36"><GeoFigure {...FIG_ACT2} maxWidth={150} /></div>
                <p className="text-sm font-semibold text-slate-800"><MathText>{ACTIVITY.situation}</MathText> <SourceTag source={ACTIVITY.source} /></p>
              </div>
              <p className="text-sm text-slate-800"><MathText>{ACTIVITY.questions[0]}</MathText></p>
              {figures}
              <BatchChoiceQuestion
                intro={<p className="text-sm font-semibold text-slate-700"><MathText>{'أين تقع B′ و C′ في كل شكل؟'}</MathText></p>}
                rows={[
                  { id: 'f1', label: 'الشكل 1', options: ['بين A والنقطتين B و C', 'كلتاهما من الجهة الأخرى للنقطة A', 'واحدة من كل جهة'], correct: 1, correction: <MathText>{'B′ و C′ كلتاهما من الجهة الأخرى للنقطة A (عكس B و C).'}</MathText> },
                  { id: 'f2', label: 'الشكل 2', options: ['بين A والنقطتين B و C', 'كلتاهما من الجهة الأخرى للنقطة A', 'واحدة من كل جهة'], correct: 0, correction: <MathText>{'B′ بين A و B و C′ بين A و C.'}</MathText> },
                  { id: 'f3', label: 'الشكل 3', options: ['بين A والنقطتين B و C', 'كلتاهما من الجهة الأخرى للنقطة A', 'واحدة من كل جهة'], correct: 2, correction: <MathText>{'B′ بين A و B لكن C′ من الجهة الأخرى للنقطة A.'}</MathText> },
                ]}
                requires={['tartib-nuqat']}
                feedback={({ allRight }) => <Feedback tone={allRight ? 'ok' : 'ko'}>{allRight ? 'أحسنت: ثلاثة مواقع مختلفة.' : 'راجع التصحيح تحت كل سطر.'}</Feedback>}
                onAnswered={() => setQ1a(true)}
              />
              {q1a && (
                <TapQuestion
                  prompt={<MathText>{"هل تحقّق الأشكال الثلاثة الشرط $\\dfrac{AB'}{AB} = \\dfrac{AC'}{AC} = \\dfrac{1}{3}$ ؟"}</MathText>}
                  options={['نعم، الأشكال الثلاثة', 'الشكل 2 فقط', 'الشكلان 1 و 2 فقط']}
                  correct={0}
                  cols={1}
                  requires={['tartib-nuqat']}
                  explain={<MathText>{`${ACTIVITY.answer.a} الشرط يتعلّق بالأطوال فقط، لا بجهة النقطة من A.`}</MathText>}
                  onAnswered={() => setQ1(true)}
                />
              )}
            </div>
          ),
        },
        {
          needsRound: { id: 'r3', label: 'الجولة 3', icon: '⚖️', won: Boolean(won.r3) },
          num: 2, title: 'ب) متوازيان أم لا؟', subtitle: 'السؤال 1) ب', done: q2,
          content: (
            <div className="space-y-3">
              <p className="text-sm text-slate-800"><MathText>{ACTIVITY.questions[1]}</MathText></p>
              {figures}
              <PlayerSwitch player={evidencePlayer} page={evidence} />
              <BatchChoiceQuestion
                rows={[
                  { id: 'p1', label: 'الشكل 1', options: ['متوازيان', 'غير متوازيين'], correct: 0, correction: ACTIVITY.answer.b[1] },
                  { id: 'p2', label: 'الشكل 2', options: ['متوازيان', 'غير متوازيين'], correct: 0, correction: ACTIVITY.answer.b[2] },
                  { id: 'p3', label: 'الشكل 3', options: ['متوازيان', 'غير متوازيين'], correct: 1, correction: ACTIVITY.answer.b[3] },
                ]}
                requires={['tartib-nuqat']}
                feedback={({ allRight }) => <Feedback tone={allRight ? 'ok' : 'ko'}>{allRight ? 'أحسنت: النسبتان متساويتان في الأشكال الثلاثة، والتوازي في الشكلين 1 و 2 فقط.' : 'قارن بأشكالك على الحامل: أين بقيت الفقاعة مائلة؟'}</Feedback>}
                onAnswered={() => setQ2(true)}
              />
            </div>
          ),
        },
        {
          num: 3, title: '2) النص الكامل', subtitle: 'السؤال 2)', done: q3,
          content: (
            <div className="space-y-3">
              <PredictRule id="aksiya-nashat">
                <p className="text-sm text-slate-800"><MathText>{ACTIVITY.questions[2]}</MathText></p>
                <BatchChoiceQuestion
                  intro={<p className="text-sm font-semibold text-slate-700">أتمم الفراغات:</p>}
                  rows={[
                    // BB′ : القطعة بدل الطول من A ; AC′ : طول من المستقيم الآخر
                    { id: 'n1', label: <MathText>{'$\\dfrac{\\ldots}{AB}$'}</MathText>, options: ["$AB'$", "$BB'$", "$AC'$"].map(M), correct: 0, correction: <MathText>{"البسط طول من A على المستقيم نفسه: $\\dfrac{AB'}{AB}$"}</MathText> },
                    { id: 'n2', label: <MathText>{'$\\dfrac{\\ldots}{AC}$'}</MathText>, options: ["$AB'$", "$AC'$", "$CC'$"].map(M), correct: 1, correction: <MathText>{"$\\dfrac{AC'}{AC}$"}</MathText> },
                    { id: 'n3', label: 'فإن المستقيمين (BC) و (B′C′) …', options: ['متقاطعان في A', 'متعامدان', 'متوازيان'], correct: 2, correction: 'متوازيان.' },
                  ]}
                  requires={['tartib-nuqat']}
                  feedback={({ allRight }) => <Feedback tone={allRight ? 'ok' : 'ko'}>{allRight ? 'أحسنت.' : 'راجع التصحيح تحت كل سطر.'}</Feedback>}
                  onAnswered={() => setQ3(true)}
                />
              </PredictRule>
              {q3 && <KnowledgeBrick id="aksiya-nashat" lead="ما وجدته على الحامل، نصًّا كاملًا:" />}
            </div>
          ),
        },
        {
          num: 4, title: 'ترتيب النقط على (d′)', subtitle: 'الملاحظة', done: q4,
          content: (
            <div className="space-y-3">
              <GeoFigure {...FIG_ACT2_STUDENTS[3]} maxWidth={220} />
              <TapQuestion
                prompt="في الشكل 3 النقط مرتبة على (d) هكذا: A ، B′ ، B (B′ بين A و B). كيف ترتّب النقط على (d′)؟"
                options={['C′ ، A ، C (A بين C′ و C): ليس الترتيب نفسه', 'A ، C′ ، C (C′ بين A و C): الترتيب نفسه', 'A ، C ، C′ (C بين A و C′)']}
                correct={0}
                cols={1}
                requires={['aksiya-nashat']}
                explain={<MathText>{'C′ من الجهة الأخرى للنقطة A: موقع B′ بالنسبة إلى A و B لا يماثل موقع C′ بالنسبة إلى A و C، فالشرط الثاني غير محقّق — ولهذا بقيت الفقاعة مائلة.'}</MathText>}
                onAnswered={() => setQ4(true)}
              />
              {q4 && <KnowledgeBrick id="aksiya-nashat" variant="rappel" compact />}
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={1} variant="memo" />}
    />
  );
}
