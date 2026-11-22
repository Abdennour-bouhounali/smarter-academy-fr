import { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { Manipulation, ManipulationWorkspace } from '../../../../../../common/manipulations';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { LAB, REMARKS } from '../content/textbook';
import LabEvidence from '../components/LabEvidence';

/**
 * Module 1 — l'entrée de la leçon (pas d'activité du manuel) : le laboratoire `shape-prover`, le فار du ملعب الحي.
 *
 * LE WORKSPACE (un objectif, props dans content/textbook.js › LAB = levels.js) :
 *   مبتدئ  (défaut) le triangle du ملعب (plateforme) : A(0 ; 0), B(3 ; 1), C tenu ; le départ C(−1 ; 2) a l'AIR droit en A
 *          (98°) et le فار le refuse ; « قائم في A » puis « متساوي الساقين رأسه C » ;
 *   متقدم  la طريقة p. 145 « حساب مسافات » : C(−2 ; y) sur sa droite jusqu'à (AB) ⊥ (BC) (y = −4), puis le carré ABCD et
 *          le cercle de diamètre [AC], avec des preuves SUFFISANTES.
 * Rétrofit 2026-10-15 (§4quater) : le labo OUVRE le module — plus de carte « الفار لا يصدّق عينيه » au-dessus, ni de titre / `lead` de workspace
 * ni de titre de labo ; `lead` du labo = le contexte seul. Les briques (déjà derrière `{qN && …}`) restent après la réponse ; l'étape 2 ne redemande
 * plus « quel calcul » mais l'égalité que le فار a vérifiée sur le C de l'élève.
 * Le module n'ouvre PAS sur la طريقة : elle n'est pas une « نشاط » du module (sa destination est le module 3) et le premier
 * contact se fait sur trois plots. Aucune étape n'attend le laboratoire (`onFinished`) : les questions portent sur des
 * gestes que l'élève a faits, listés au-dessus d'elles ([data-activity-evidence]).
 *   1. la figure ne prouve pas : le départ refusé                         → brique dalil-hisabi      (P1)
 *   2. le côté seul : AB² + AC² = BC² (pas AB² + BC² = AC²)               → brique qaim-fithaghuras  (P1)
 *   3. l'isocèle : l'élève calcule CB² lui-même                           → brique mutasawi-saqayn   (P1)
 *   4. des preuves suffisantes : D(2 ; 2), diagonales égales, pas de parallélogramme → brique adilla-kafiya (P2)
 *      puis la « مسألة الدرس » (ANCIENNE carte, retirée du module le 2026-10-09 — elle ne vit plus qu'au sommaire) : le même monde que le niveau متقدم, d'autres nombres (module 5).
 * « أتوقّع القاعدة » (2026-10-06) : chaque brique est précédée d'une prédiction ; les `explain` des questions juste
 * avant donnent donc le CAS calculé, jamais la règle (REMARKS.look / watarRight / diagAlone + kafiRight sont dans le
 * corps des briques).
 */
const M = (s) => <MathText key={s}>{s}</MathText>;

export default function Module01Malab() {
  const [trials, setTrials] = useState([]);
  const [q, setQ] = useState({});
  const mark = (n) => () => setQ((s) => ({ ...s, [n]: true }));
  const keep = (level) => (e) => { if (e && !e.tk) setTrials((list) => [...list, { ...e, level }].slice(-40)); };

  return (
    <ContentModule ctx={MODULE_CTX} navLinks={getNavLinks(1)} moduleNumber={1} moduleTitle="ملعب الحي — الفار لا يصدّق عينيه"
      moduleSubtitle="شواخص على أرضية مرصوفة، وحَكَم لا يقبل إلا الحساب" objectives={['ماذا يقبله الفار دليلًا على طبيعة شكل؟', 'لماذا قد يبدو مثلث قائمًا ولا يكون كذلك؟', 'أيّ أدلة تكفي لإثبات طبيعة رباعي؟']} estimatedTime="12 دقيقة"
      intro={
        <ManipulationWorkspace
          levels={{
            beginner: () => (
              <Manipulation type="shape-prover" level="beginner" {...LAB.beginner} theme="football"
                lead="في ملعب الحي شواخص على أرضية مرصوفة، والفار حَكَم لا يقبل إلا ما يثبته الحساب." onTrial={keep('beginner')} />
            ),
            advanced: () => (
              <Manipulation type="shape-prover" level="advanced" {...LAB.advanced} theme="football"
                lead="طريقة الكتاب (ص 145): الشاخص C ينزلق على مستقيم، ثم المربّع والدائرة." onTrial={keep('advanced')} />
            ),
          }}
        />
      }
      steps={[
        { num: 1, title: 'بدا قائما… فرفضه الفار', subtitle: 'العين أم الحساب؟', done: !!q[1],
          content: (
            <div className="space-y-3">
              <LabEvidence id="beginner-look" trials={trials} level="beginner" title="ما راجعه الفار في المستوى المبتدئ:"
                empty="في المستوى المبتدئ: اختر «قائم في A» وبطاقة دليل، ثم اطلب الفار قبل أن تحرّك الشاخص C." />
              <TapQuestion
                prompt={<MathText>{'عند $C(-1\\,;\\,2)$ يبدو المثلث ABC قائما في A. لماذا رفضه الفار؟'}</MathText>}
                options={[
                  'لأن مربع الطول BC لا يساوي مجموع مربعي الطولين AB و AC',
                  'لأن الطولين AB و AC غير متساويين',
                  'لأن الضلعين [AB] و [AC] لا يوازيان محوري المعلم',
                  'لأن الفار يحكم بما يراه على الشكل',
                ].map(M)}
                correct={0} cols={1} requires={['aks-fithaghuras', 'masafa-maalam']}
                explain={<MathText>{'$AB^2 + AC^2 = 10 + 5 = 15$ و $BC^2 = 17$ : المساواة غير محققة، فالمثلث ABC ليس قائما في A مهما بدا كذلك.'}</MathText>}
                onAnswered={mark(1)} />
              {q[1] && <KnowledgeBrick id="dalil-hisabi" lead="ما فعله الفار:" />}
            </div>
          ) },
        { num: 2, title: 'أيّ ضلع وحده؟', subtitle: 'الزاوية القائمة في A', done: !!q[2],
          content: (
            <div className="space-y-3">
              <LabEvidence id="beginner-right" trials={trials} level="beginner" filter={(e) => e.claim === 'right:A'} title="مراجعاتك لـ «قائم في A»:"
                empty="في المستوى المبتدئ: حرّك C حتى يقبل الفار «قائم في A»." />
              <TapQuestion
                prompt={<MathText>{'قبل الفار «قائم في A» عند $C(-1\\,;\\,3)$ . أيّ مساواة بين مربعات الأطوال حقّقها ليقبل؟'}</MathText>}
                options={['$AB^2 + AC^2 = BC^2$', '$AB^2 + BC^2 = AC^2$', '$AC^2 + BC^2 = AB^2$', '$AB = AC$'].map(M)}
                correct={0} cols={2} requires={['dalil-hisabi', 'aks-fithaghuras']}
                explain={<MathText>{'عند $C(-1\\,;\\,3)$ قبل الفار «قائم في A» : $AB^2 + AC^2 = 10 + 10 = 20 = BC^2$ .'}</MathText>}
                onAnswered={mark(2)} />
              {q[2] && (
                <>
                  <KnowledgeBrick id="qaim-fithaghuras" lead="الضلع الذي يكون وحده:" />
                  <p className="text-xs text-slate-600" data-misconception-note="watar"><MathText>{`خطأ شائع: ${REMARKS.watarWrong} ${REMARKS.watarWhy}`}</MathText></p>
                </>
              )}
            </div>
          ) },
        { num: 3, title: 'متساوي الساقين رأسه C', subtitle: 'احسب بنفسك', done: !!q[3],
          content: (
            <div className="space-y-3">
              <LabEvidence id="beginner-iso" trials={trials} level="beginner" filter={(e) => e.claim === 'iso:C'} title="مراجعاتك لـ «متساوي الساقين رأسه C»:"
                empty="في المستوى المبتدئ: اختر «متساوي الساقين رأسه C» وحرّك C حتى يقبله الفار." />
              <NumericQuestion
                prompt={<MathText>{'عند $C(0\\,;\\,5)$ لدينا $CA^2 = 25$ . احسب $CB^2$ حيث $B(3\\,;\\,1)$ .'}</MathText>}
                expected={25} requires={['masafa-maalam', 'dalil-hisabi']}
                explain={<MathText>{'$CB^2 = (3 - 0)^2 + (1 - 5)^2 = 9 + 16 = 25 = CA^2$ : المثلث ABC متساوي الساقين رأسه C.'}</MathText>}
                onAnswered={mark(3)} />
              {q[3] && <KnowledgeBrick id="mutasawi-saqayn" />}
            </div>
          ) },
        { num: 4, title: 'أدلة كافية', subtitle: 'المستوى المتقدّم: الشاخص D', done: !!q[4],
          content: (
            <div className="space-y-3">
              <LabEvidence id="advanced-quad" trials={trials} level="advanced" filter={(e) => e.stage === 'quad'} title="ما راجعه الفار في الرباعي ABCD:"
                empty="في المستوى المتقدّم: أثبت أن (AB) ⊥ (BC) ، ثم افتح الرباعي ABCD واطلب الفار على «مستطيل» قبل أن تحرّك D." />
              <TapQuestion
                prompt={<MathText>{'عند $D(2\\,;\\,2)$ كان $AC^2 = BD^2 = 40$ . لماذا رفض الفار «ABCD مستطيل» بهذا الدليل وحده؟'}</MathText>}
                options={[
                  'لأن رباعيا قطراه متقايسان قد لا يكون متوازي أضلاع',
                  'لأن القطرين غير متقايسين',
                  'لأن قطري المستطيل غير متقايسين',
                  'لأن الفار لا يقبل إلا المربّع',
                ].map(M)}
                correct={0} cols={1} requires={['khawass-rubaiyat', 'tasawi-mutawazi', 'dalil-hisabi']}
                explain={<MathText>{'عند $D(2\\,;\\,2)$ : $\\overrightarrow{AB}\\begin{pmatrix} -4 \\\\ -2 \\end{pmatrix}$ و $\\overrightarrow{DC}\\begin{pmatrix} -4 \\\\ -6 \\end{pmatrix}$ غير متساويين: الرباعي ABCD ليس متوازي أضلاع، رغم أن قطريه متقايسان.'}</MathText>}
                onAnswered={mark(4)} />
              {q[4] && (
                <>
                  <KnowledgeBrick id="adilla-kafiya" />
                  <p className="text-xs text-slate-600" data-misconception-note="kafi"><MathText>{`خطأ شائع: ${REMARKS.kafiWrong} ${REMARKS.kafiWhy}`}</MathText></p>
                </>
              )}
            </div>
          ) },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={1} variant="memo" />} />
  );
}
