import { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, KnowledgeBrick, PeerSheet } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import GeoFigure from '../../../../../../common/components/GeoFigure';
import { Feedback } from '../../../../../../common/components/LessonUI';
import { TextbookBox, SourceTag } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { KNOWLEDGE3, KNOW1_REMARK1 } from '../content/textbook';
import { FIG_KNOW3_BETWEEN, FIG_KNOW3_BEYOND, FIG_KNOW3_EXAMPLE, FIG_KNOW1_REMARK1, FIG_KNOW3_REMARK } from '../content/figures';
import PlayerSwitch from '../../../../../../common/mission/PlayerSwitch';
import { addition } from '../../_unit/unitMeta';
import { PEER_SHEET, PEER_KID } from '../content/peerSheet';

/**
 * Module 2 — معارف 3 (p. 108) « الخاصية العكسية لخاصية طالس », et la ملاحظة 1 de معارف 1 (p. 106, déclarée en
 * double : deux rapports différents suffisent pour conclure au non-parallélisme).
 *   1. la propriété et ses deux traductions (figures redessinées) — brique khassiya-aksiya, essai sur des nombres
 *      de la plateforme (2/5 = 3/7,5) ;
 *   2. la ملاحظة : rapports égaux (1/2) mais pas le même ordre — brique shart-tartib ;
 *   3. l'مثال OM/OR = ON/OP = 1,25 : l'élève refait les deux calculs et la conclusion ;
 *   4. وضعية الفراشة : 2/3 ≠ 1/2 — brique nisbatan-mukhtalifatan.
 * LP : P1 (1, 3, 4), P2 (2, 3).
 * « أتوقّع القاعدة » : khassiya-aksiya re-pose la règle déjà écrite et nommée au module 1 (aksiya-nashat) et
 * nisbatan-mukhtalifatan la ملاحظة 1 de la leçon 1 (adam-tawazi) → `variant="rappel"` ; shart-tartib est prédite.
 * 5. « ورقة رياض » (`PeerSheet`, content/peerSheet.js) — rollout mission 2026-11-10 (conseil du 2026-11-10) : AM/MB (partie sur partie) au lieu de
 *    AM/AB, d'où un faux « non parallèles » ; l'élève trouve la ligne et la corrige. Même étape sur la page et dans le lecteur.
 */
const M = (s) => <MathText key={s}>{s}</MathText>;
const PLATFORM = addition('interaction_generation');

export default function Module02Maarif() {
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);
  const [q5, setQ5] = useState(false);

  // la question de la remarque (étape 2) — la même sur la page et dans le lecteur (sa clé d'enregistrement ne change pas)
  const remarkQuestion = (
    <TapQuestion
      prompt={<MathText>{"في شكل الملاحظة $\\dfrac{AB'}{AB} = \\dfrac{AC'}{AC} = \\dfrac{1}{2}$ . لماذا لا يوازي (B′C′) المستقيم (BC)؟"}</MathText>}
      options={['لأن النقط A، B، B′ و A، C، C′ ليست مرتبة بنفس الترتيب', 'لأن النسبتين مختلفتان', 'لأن C′ منتصف [AC]']}
      correct={0}
      cols={1}
      explain={<MathText>{"النسبتان متساويتان (كلتاهما $\\dfrac{1}{2}$)، لكن B′ من الجهة الأخرى للنقطة A بينما C′ بين A و C. أن تكون C′ منتصفا لا يمنع التوازي (في مستقيم المنتصفين مثلا)."}</MathText>}
      onAnswered={() => setQ2(true)}
    />
  );
  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="معارف — الخاصية العكسية لخاصية طالس"
      moduleSubtitle="نسبتان متساويتان ونفس الترتيب: توازٍ"
      objectives={['كيف نصوغ ما وجدناه على الحامل؟', 'هل يكفي تساوي نسبتين؟', 'متى تكفي نسبتان مختلفتان لنحكم؟']}
      estimatedTime="10 دقائق"
      brief={{
        tag: 'معارف', title: KNOWLEDGE3.title, tone: 'violet',
        body: <p>المعارف في أربع خطوات: كل خطوة سؤال أولًا، وبعد جوابك يأتي الاسم أو الملاحظة.</p>,
      }}
      steps={[
        {
          num: 1, title: 'الخاصية', subtitle: 'ووضعيتاها', done: q1,
          content: (
            <div className="space-y-3">
              <p className="text-sm text-slate-700">{KNOWLEDGE3.figuresText}</p>
              {/* lecteur : les DEUX situations sur un écran (`data-paging-keep`) — le découpage en donnait une par écran (« pas d'aller-retour »,
                  2026-11-11) ; `pairFigures` pose ensuite la paire à côté des données et de la question */}
              <PlayerSwitch
                player={<div className="grid gap-2 grid-cols-2" data-know3-figures data-paging-keep><GeoFigure {...FIG_KNOW3_BETWEEN} /><GeoFigure {...FIG_KNOW3_BEYOND} /></div>}
                page={(
                  <div className="grid gap-2 grid-cols-2" data-know3-figures>
                    <GeoFigure {...FIG_KNOW3_BETWEEN} />
                    <GeoFigure {...FIG_KNOW3_BEYOND} />
                  </div>
                )}
              />
              <p className="text-sm font-semibold text-slate-800">
                <MathText>{'(d) و (d′) متقاطعان في A. $AB = 5$ و $AB\' = 2$ و $AC = 7{,}5$ و $AC\' = 3$ ، و B′ بين A و B و C′ بين A و C.'}</MathText> <SourceTag source={PLATFORM} />
              </p>
              <TapQuestion
                prompt="هل (B′C′) يوازي (BC)؟"
                options={['نعم: النسبتان متساويتان ونفس الترتيب', 'لا: النسبتان مختلفتان', 'لا يمكن الحكم دون رسم']}
                correct={0}
                cols={1}
                requires={['tasawi-kasrayn']}
                explain={<MathText>{"$\\dfrac{AB'}{AB} = \\dfrac{2}{5}$ و $\\dfrac{AC'}{AC} = \\dfrac{3}{7{,}5}$ و $2 \\times 7{,}5 = 15 = 5 \\times 3$ : النسبتان متساويتان، والنقط مرتبة بنفس الترتيب، فـ $(B'C') \\parallel (BC)$ ."}</MathText>}
                onAnswered={() => setQ1(true)}
              />
              {q1 && <KnowledgeBrick id="khassiya-aksiya" variant="rappel" lead="نكتب ما رأيته على الحامل:" />}
            </div>
          ),
        },
        {
          num: 2, title: 'نسبتان متساويتان: هل يكفي؟', subtitle: 'ملاحظة', done: q2,
          content: (
            <div className="space-y-3">
              {/* « في شكل الملاحظة » — ce dessin n'était nulle part avant la question (il est dans la carte qui s'ouvre APRÈS) :
                  il est dessiné À CÔTÉ de la question, dans le lecteur ET sur la page (« pas d'aller-retour », 2026-11-11) */}
              <div className="flex items-start gap-4" data-paging-keep data-remark-figure>
                <div className="w-[38%] shrink-0"><GeoFigure {...FIG_KNOW3_REMARK} /></div>
                <div className="min-w-0 flex-1">{remarkQuestion}</div>
              </div>
              {q2 && <KnowledgeBrick id="shart-tartib" lead="الشرط الثاني ليس زينة:" />}
            </div>
          ),
        },
        {
          num: 3, title: 'مثال محلول', subtitle: 'OM/OR و ON/OP', done: q3,
          content: (
            <div className="space-y-3">
              <GeoFigure {...FIG_KNOW3_EXAMPLE} />
              <BatchChoiceQuestion
                intro={<p className="text-sm font-semibold text-slate-700">أعد الحساب بنفسك:</p>}
                rows={[
                  // 0,8 = OR/OM (مقلوبة)
                  { id: 'om', label: <MathText>{'$\\dfrac{OM}{OR}$'}</MathText>, options: ['$1{,}25$', '$0{,}8$', '$0{,}6$'].map(M), correct: 0, correction: <MathText>{'$\\dfrac{3}{2{,}4} = 1{,}25$'}</MathText> },
                  { id: 'on', label: <MathText>{'$\\dfrac{ON}{OP}$'}</MathText>, options: ['$0{,}8$', '$1{,}25$', '$1{,}6$'].map(M), correct: 1, correction: <MathText>{'$\\dfrac{5}{4} = 1{,}25$'}</MathText> },
                  { id: 'or', label: 'ترتيب النقط', options: ['O بين M و R و O بين N و P: نفس الترتيب', 'ليست مرتبة بنفس الترتيب'], correct: 0, correction: 'O بين النقطتين على كل مستقيم.' },
                ]}
                requires={['khassiya-aksiya']}
                feedback={({ allRight }) => <Feedback tone={allRight ? 'ok' : 'ko'}>{allRight ? 'أحسنت: النسبتان متساويتان ونفس الترتيب، إذن (MN)//(PR).' : 'راجع التصحيح تحت كل سطر.'}</Feedback>}
                onAnswered={() => setQ3(true)}
              />
              {q3 && <TextbookBox kind="example" lines={KNOWLEDGE3.example} source={KNOWLEDGE3.source} compact />}
            </div>
          ),
        },
        {
          num: 4, title: 'نسبتان مختلفتان', subtitle: 'ملاحظة', done: q4,
          content: (
            <div className="space-y-3">
              <GeoFigure {...FIG_KNOW1_REMARK1} />
              <TapQuestion
                prompt={<MathText>{'في وضعية الفراشة: $AN = 1$ ، $AM = 2$ ، $AB = 3$ ، $AC = 2$ . ماذا ينتج؟'}</MathText>}
                options={['(MN) و (BC) غير متوازيين', '$(MN) \\parallel (BC)$', 'لا يمكن الحكم لأن النقط من جهتين مختلفتين'].map(M)}
                correct={0}
                cols={1}
                explain={<MathText>{KNOW1_REMARK1.answer}</MathText>}
                onAnswered={() => setQ4(true)}
              />
              {q4 && <KnowledgeBrick id="nisbatan-mukhtalifatan" variant="rappel" lead="ومن خاصية طالس نفسها (الدرس السابق):" />}
            </div>
          ),
        },
        { num: 5, title: 'ورقة زميل: أين الخطأ؟', subtitle: 'جد السطر الخاطئ وصحّحه', done: q5,
          content: <PeerSheet sheet={PEER_SHEET} kid={PEER_KID} onDone={() => setQ5(true)} /> },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={2} variant="memo" />}
    />
  );
}
