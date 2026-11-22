import { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick, PeerSheet } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { TextbookBox } from '../../../../../../common/textbook';
import { Manipulation } from '../../../../../../common/manipulations';
import LabRounds from '../../../../../../common/manipulations/rounds/LabRounds';
import PlayerSwitch from '../../../../../../common/mission/PlayerSwitch';
import { bidi } from '../../../../../../../utils/bidi';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { KNOWLEDGE } from '../content/textbook';
import { M2_ROUNDS } from '../content/pitches';
import { PEER_SHEET, PEER_KID } from '../content/peerSheet';

/**
 * Module 2 — معارف « النشر » : la définition (déjà posée au module 1), les trois propriétés et deux exemples ; un terrain manipulé dans le MÊME
 * instrument qu'au module 1 (le terrain découpé) ; la réduction (tabsit) est posée après lui, avec les parenthèses précédées de −. LP : P1–P4.
 *
 * Rétrofit 2026-10-15 (§4quater) : le labo ouvre le module SANS carte `brief` ; les encadrés et les briques viennent APRÈS la réponse.
 *
 * INDÉPENDANCE DU MANUEL (rollout 2026-11-11, conseil L1.5 et L1.8, SHARED) : plus de « مثال الكتاب » ni « الكتاب يكتب » ; les exemples des
 * encadrés sont ceux de la plateforme. La page de l'enseignant garde son terrain (2x − 1)(x + 4) (« page labs keep their numbers »).
 * LECTEUR DE MISSION (PLAYER-only) : le terrain est celui de la plateforme, (2x − 3)(x − 1) (content/pitches.js › M2_ROUNDS, conseil L1.5 :
 * deux zones hachurées, termes croisés de MÊME signe), à la découverte « result » ; l'étape 2 attend sa manche et sa trace nomme SES zones.
 * 5. « ورقة زينب » (`PeerSheet`, content/peerSheet.js) : seulement les zones « en face », vérifiées à x = 0 ; même étape sur la page et dans le
 *    lecteur.
 */
const M = (tex) => <MathText key={tex}>{tex}</MathText>;
const EXAMPLES = [
  '$6(x - 2) = 6 \\times x - 6 \\times 2 = 6x - 12$',
  '$(2x + 1)(x + 3) = 2x^2 + 6x + x + 3 = 2x^2 + 7x + 3$',
];

export default function Module02Maarif() {
  const [q1, setQ1] = useState(false);
  // les questions posées PAR-DESSUS le labo (LabCheckpoint) : l'étape 2 est faite quand leur suite l'est
  const [cps, setCps] = useState([]);
  const answered = (id) => cps.some((e) => e.tk === 'checkpoint-done' && e.id === id);
  const [won, setWon] = useState({});
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);
  const [q5, setQ5] = useState(false);
  const pageDone = answered(KNOWLEDGE.pitch);
  const labDone = pageDone || Boolean(won.m2);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      objectives={["ماذا يعني «نشر» عبارة؟", "كيف نضرب قوسين حدًّا حدًّا؟", "ماذا يحدث حين يسبق القوسَين إشارة ناقص؟"]}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="معارف — النشر"
      moduleSubtitle="ملعب آخر، ثم التبسيط"
      estimatedTime="10 دقائق"
      intro={
        <PlayerSwitch
          player={(
            <LabRounds lessonId={MODULE_CTX.lessonId} labId="m2-pitch" rounds={M2_ROUNDS} icon="⚽" freeIcon="🏟️"
              onRoundWon={(id) => setWon((w) => ({ ...w, [id]: true }))} />
          )}
          page={(
            <Manipulation
              type="pitch-expansion"
              expr={KNOWLEDGE.pitch}
              levels={false}
              title={bidi('ملعب بعداه 2x − 1 و x + 4')}
              lead={<MathText>{'أربع مناطق، منها اثنتان مقتطعتان.'}</MathText>}
              onCheckpoint={(e) => setCps((l) => [...l, e])}
            />
          )}
        />
      }
      steps={[
        {
          num: 1, title: 'التعريف والخاصية التوزيعية', done: q1,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<MathText>{'$-4(2y - 3) = \\ldots$'}</MathText>}
                options={['$-8y - 12$', '$-8y + 12$', '$-8y - 3$'].map(M)}
                correct={1}
                cols={3}
                requires={['khassiya-tawziiya']}
                explain={<MathText>{'$-4 \\times 2y - (-4) \\times 3 = -8y + 12$: العدد $-4$ يُضرب في الحدّين، و $(-4) \\times (-3) = 12$.'}</MathText>}
                onAnswered={() => setQ1(true)}
              />
              {q1 && <TextbookBox kind="definition" text={KNOWLEDGE.definition} />}
              {q1 && <KnowledgeBrick id="tawziiya-nashr" variant="rappel" lead={<MathText>{'في النشاط ضربت $x$ في $2x + 5$ و $3x$ في $2 - x$. القاعدة صحيحة لكل الأعداد:'}</MathText>} />}
            </div>
          ),
        },
        {
          needsRound: { id: 'm2', label: 'ملعب الحيّ الجديد', icon: '⚽', won: Boolean(won.m2) },
          num: 2, title: 'جداء قوسين: ملعب آخر', subtitle: 'الملعب أعلاه', done: labDone,
          content: (
            <div className="space-y-3">
              <PlayerSwitch
                player={(
                  <p data-evidence="checkpoint" data-tried={won.m2 ? 'true' : 'false'}
                    className={`rounded-xl border-2 px-3 py-2 text-sm ${won.m2 ? 'border-emerald-200 bg-emerald-50 font-bold text-emerald-900' : 'border-slate-200 bg-white text-slate-500'}`}>
                    {won.m2
                      ? <MathText>{'أجبتَ في المختبر: مناطق الملعب الأربع $2x \\times x = 2x^2$ ، $2x \\times (-1) = -2x$ ، $(-3) \\times x = -3x$ و $(-3) \\times (-1) = 3$ ، فجاء الحدّ $3$ من الركن المقتطع مرّتين.'}</MathText>
                      : 'احمل مناطق الملعب أعلاه كلّها، اجمع المتشابه، وتحقّق من قيمتين، ثم أجب عن السؤال الذي يظهر.'}
                  </p>
                )}
                page={(
                  <p data-evidence="checkpoint" data-tried={pageDone ? 'true' : 'false'}
                    className={`rounded-xl border-2 px-3 py-2 text-sm ${pageDone ? 'border-emerald-200 bg-emerald-50 font-bold text-emerald-900' : 'border-slate-200 bg-white text-slate-500'}`}>
                    {pageDone
                      ? <MathText>{'أجبتَ في المختبر: مناطق الملعب الأربع $2x \\times x = 2x^2$ ، $2x \\times 4 = 8x$ ، $(-1) \\times x = -x$ و $(-1) \\times 4 = -4$ ، فجاء الحدّ $-x$ من $(-1) \\times x$.'}</MathText>
                      : 'احمل مناطق الملعب أعلاه كلّها، وتحقّق من قيمتين، ثم أجب عن الأسئلة التي تظهر فوق المختبر.'}
                  </p>
                )}
              />
              {labDone && <KnowledgeBrick id="nashr-qawsayn" variant="rappel" compact />}
              {labDone && <TextbookBox kind="example" lines={EXAMPLES} compact />}
            </div>
          ),
        },
        {
          num: 3, title: 'التبسيط: ماذا نفعل بالحدود؟', done: q3,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<MathText>{'بسّط: $3y^2 + 5y - 2y^2 - 9y + 1 = \\ldots$'}</MathText>}
                options={['$5y^2 - 4y + 1$', '$-3y^3 + 1$', '$y^2 - 4y + 1$'].map(M)}
                correct={2}
                cols={3}
                explain={<MathText>{'$3y^2 - 2y^2 = y^2$ و $5y - 9y = -4y$، والحد 1 يبقى: لا نجمع $y^2$ مع $y$.'}</MathText>}
                onAnswered={() => setQ3(true)}
              />
              {q3 && <KnowledgeBrick id="tabsit" lead={<MathText>{'في الملعب جمعتَ الحدود المتشابهة وحدها، وبقيت الحدود الأخرى كما هي:'}</MathText>} />}
            </div>
          ),
        },
        {
          num: 4, title: 'التبسيط: قوسان مسبوقان بإشارة ناقص', done: q4,
          content: (
            <TapQuestion
              prompt={<MathText>{'بسّط: $2x - (x^2 - 3x + 2) = \\ldots$'}</MathText>}
              options={['$-x^2 - x + 2$', '$-x^2 + 5x - 2$', '$x^2 + 5x - 2$'].map(M)}
              correct={1}
              cols={3}
              requires={['tabsit', 'hadhf-aqwas']}
              explain={<MathText>{'$2x - x^2 + 3x - 2 = -x^2 + 5x - 2$: كل حد داخل القوسين تتغيّر إشارته.'}</MathText>}
              onAnswered={() => setQ4(true)}
            />
          ),
        },
        {
          num: 5, title: 'ورقة زينب', subtitle: 'جد الخطأ وصحّحه', done: q5,
          content: <PeerSheet sheet={PEER_SHEET} kid={PEER_KID} onDone={() => setQ5(true)} />,
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={2} variant="memo" />}
    />
  );
}
