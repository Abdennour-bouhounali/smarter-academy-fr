import { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick, PredictRule } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import GeoFigure from '../../../../../../common/components/GeoFigure';
import { Manipulation, ManipulationWorkspace } from '../../../../../../common/manipulations';
import { TextbookBox } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { LAB, EX18, REMARKS } from '../content/textbook';
import { FIG_EX18 } from '../content/figures';
import LabEvidence from '../components/LabEvidence';

/**
 * Module 1 — l'entrée de la leçon (pas d'activité du manuel) : le laboratoire `vector-chain`, le métro d'Alger.
 *
 * LE WORKSPACE (un objectif, props dans content/textbook.js › LAB = levels.js) :
 *   مبتدئ  (défaut) le parallélogramme du métro (plateforme) : BC + AB (raccorder DEVANT), AB + AD (aucun raccord : AD
 *          transporté en BC grâce à ABCD) ;
 *   متقدم  l'exercice 18 (p. 137) : prouver OL = AC et HK = AC avec les six données ; « OL = AC » lu sur la figure est
 *          refusé (la figure ne prouve pas).
 * Le module n'ouvre PAS sur l'exercice 18 : il n'est pas une « نشاط » du module (sa destination est le module 4) et le
 * premier contact se fait sur quatre stations. Aucune étape n'attend le laboratoire (`onFinished`) : les questions
 * portent sur des gestes que l'élève a faits, listés au-dessus d'elles ([data-activity-evidence]).
 *   1. raccorder : BC + AB = AC (l'ordre de la somme est libre)        → brique rabt-shal          (P1)
 *   2. échanger : pourquoi AD peut devenir BC                            → brique taawid-musawi      (P1)
 *   3. annuler : OA + AO = 0⃗ (pas le nombre 0)                           → brique mutaakisan-sifr    (P1)
 *   4. la figure ne prouve pas : OL = AC refusé                           → brique shakl-la-yubarhin  (P2)
 * PROTOTYPE 2026-10-28 : les questions 1 et 2 sont désormais posées PAR-DESSUS le labo (`vector-chain › CHAINS`, après chaque rubrique : `couple`, `swap`, `final`)
 * ; les étapes 1 et 2 gardent la TRACE (événements `checkpoint-done`) puis posent la brique, qui demande elle-même la règle (predictPrompt de knowledge.jsx).
 * Les questions 3 et 4 restent des questions d'étape (le labo ne les pose pas) ; l'explication des questions restantes ÉNONCE la règle de la brique qui suit :
 * chacune est enveloppée dans une PredictRule. La brique 3 (mutaakisan-sifr) est un rappel : la leçon 3 a posé AB + BA = 0⃗.
 * La « مسألة الدرس » (ANCIENNE carte, retirée du module le 2026-10-09 — elle ne vit plus qu'au sommaire) ferme la dernière étape : le métro, d'autres stations, résolue au module 5.
 */
const METRO_LEAD = 'في مترو الجزائر كل محطة نقطة وكل تذكرة شعاع: $\\overrightarrow{AB}$ تعني «من A إلى B».';
const M = (s) => <MathText key={s}>{s}</MathText>;

export default function Module01Metro() {
  const [trials, setTrials] = useState([]);
  const [q, setQ] = useState({});
  const mark = (n) => () => setQ((s) => ({ ...s, [n]: true }));
  // les questions posées PAR-DESSUS le labo (LabCheckpoint) : une étape est faite quand la suite de questions de sa rubrique l'est (événement `checkpoint-done`)
  const [cpDone, setCpDone] = useState({});
  const keep = (level) => (e) => {
    if (!e) return;
    if (e.tk) { if (e.tk === 'checkpoint-done') setCpDone((d) => ({ ...d, [`${level}:${e.id}`]: true })); return; }
    setTrials((list) => [...list, { ...e, level }].slice(-40));
  };
  const answered = (level, id) => !!cpDone[`${level}:${id}`];

  return (
    <ContentModule ctx={MODULE_CTX} navLinks={getNavLinks(1)} moduleNumber={1} objectives={['متى نستطيع أن نربط تذكرتين فنختصر الرحلة؟', 'متى نقبل أن ننقل تذكرة إلى محطة أخرى؟', 'ماذا يعطي ذهاب وإياب على نفس الطريق؟', 'هل يكفي أن نرى المساواة على الشكل لنبرهنها؟']} moduleTitle="مترو الجزائر — نختصر ونبرهن"
      moduleSubtitle="تذاكر المترو أشعة: من محطة إلى محطة" estimatedTime="12 دقيقة"
      intro={
        <ManipulationWorkspace
          levels={{
            beginner: () => (
              <Manipulation type="vector-chain" level="beginner" {...LAB.beginner} theme="metro" title="مترو الجزائر: رحلتان في متوازي الأضلاع ABCD" lead={<MathText>{METRO_LEAD}</MathText>} onTrial={keep('beginner')} />
            ),
            advanced: () => (
              <Manipulation type="vector-chain" level="advanced" {...LAB.advanced} theme="metro" title="التمرين 18: برهن أن OL = AC و HK = AC" onTrial={keep('advanced')} />
            ),
          }}
        />
      }
      steps={[
        { num: 1, title: 'نربط تذكرتين', subtitle: 'متى يقبل القطار العربة؟', done: answered('beginner', 'r0'),
          content: (
            <div className="space-y-3">
              <LabEvidence id="beginner-chain" trials={trials} level="beginner" title="ما فعلته في المستوى المبتدئ:"
                empty="في المستوى المبتدئ، الرحلة 1: اسحب تذكرة إلى القطار، ثم اربط الأخرى قبله أو بعده، وأجب عن الأسئلة التي تظهر فوق المختبر." />
              {answered('beginner', 'r0') && <KnowledgeBrick id="rabt-shal" lead="ما فعله القطار:" />}
            </div>
          ) },
        { num: 2, title: 'ننقل تذكرة إلى محطة أخرى', subtitle: 'AB + AD', done: answered('beginner', 'r1'),
          content: (
            <div className="space-y-3">
              <LabEvidence id="beginner-swap" trials={trials} level="beginner" title="ما فعلته في المستوى المبتدئ:"
                empty="في المستوى المبتدئ، الرحلة 2: حاول أن تربط التذكرتين، ثم اسحب إحداهما إلى محطة أخرى، وأجب عن أسئلة الرحلة فوق المختبر." />
              {answered('beginner', 'r1') && (
                <>
                  <KnowledgeBrick id="taawid-musawi" lead="إذا لم يتتابع شعاعان:" />
                  <p className="text-xs text-slate-600" data-misconception-note="rabt"><MathText>{`خطأ شائع: ${REMARKS.rabtWrong} ${REMARKS.rabtWhy}`}</MathText></p>
                </>
              )}
            </div>
          ) },
        { num: 3, title: 'ذهاب وإياب', subtitle: 'التمرين 18، الرحلة 2', done: !!q[3],
          content: (
            <div className="space-y-3">
              <TextbookBox kind="exercise" title="تمرين 18" text={EX18.text} source={EX18.source} compact>
                <GeoFigure {...FIG_EX18} />
              </TextbookBox>
              <LabEvidence id="advanced-zero" trials={trials} level="advanced" title="ما فعلته في المستوى المتقدّم:"
                empty="افتح المستوى المتقدّم، الرحلة 2: انقل $\\overrightarrow{HB}$ إلى محطة تجعله يساوي شعاعا من المعطيات." />
              <TapQuestion
                prompt={<MathText>{'$\\overrightarrow{OA} + \\overrightarrow{AO}$ يساوي:'}</MathText>}
                options={['$\\overrightarrow{0}$', 'العدد 0', '$2\\overrightarrow{OA}$', '$\\overrightarrow{OA}$'].map(M)}
                correct={0} cols={2} requires={['rabt-shal', 'mutaakisan']}
                explain={<MathText>{REMARKS.zeroRule}</MathText>}
                onAnswered={mark(3)} />
              {q[3] && <KnowledgeBrick id="mutaakisan-sifr" variant="rappel" />}
            </div>
          ) },
        { num: 4, title: 'هل يكفي أن نرى؟', subtitle: 'OL و AC', done: !!q[4],
          content: (
            <div className="space-y-3">
              <LabEvidence id="advanced-see" trials={trials} level="advanced" title="ما فعلته في المستوى المتقدّم:"
                empty="في المستوى المتقدّم، الرحلة 1: اربط $\\overrightarrow{OC}$ و $\\overrightarrow{CL}$ ، ثم حاول أن تنقل القطار إلى A." />
              <PredictRule id="shakl-la-yubarhin">
                <TapQuestion
                  prompt={<MathText>{'على الشكل يبدو أن $\\overrightarrow{OL} = \\overrightarrow{AC}$ . لماذا رفض المختبر أن تنقل $\\overrightarrow{OL}$ إلى A مباشرة؟'}</MathText>}
                  options={[
                    'لأن هذه المساواة هي المطلوب برهانه، ولا معطى يثبتها بعد',
                    'لأن $\\overrightarrow{OL}$ و $\\overrightarrow{AC}$ ليس لهما نفس المنحى',
                    'لأن الطولين OL و AC مختلفان',
                  ].map(M)}
                  correct={0} cols={1} requires={['taawid-musawi']}
                  explain={<MathText>{`${REMARKS.seeWhy} ${REMARKS.seeRight}`}</MathText>}
                  onAnswered={mark(4)} />
              </PredictRule>
              {q[4] && <KnowledgeBrick id="shakl-la-yubarhin" />}
            </div>
          ) },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={1} variant="memo" />} />
  );
}
