import { useState } from 'react';
import { ContentModule, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import GeoFigure from '../../../../../../common/components/GeoFigure';
import { TextbookExercise } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { partsOf } from '../content/exercises';
import { PREP_REVISITED } from '../content/textbook';
import PlayerSwitch from '../../../../../../common/mission/PlayerSwitch';
import { FIG_EX1, FIG_EX2, FIG_EX3, FIG_EX4, FIG_EX5, FIG_EX8, FIG_EX9, FIG_PREP4, FIG_PREP5 } from '../content/figures';

/**
 * Module 4 — أوظّف تعلّماتي (p. 110, « خاصية طالس », et ex-26 p. 113 « أتعمّق »).
 * AUTOMATIZE : ex-1 (triangles et rapports), ex-2, ex-3 (quatre figures : justifier le parallélisme puis écrire
 * les rapports), ex-4 (valeurs exactes puis arrondies), ex-5 (k = 3), ex-6, ex-8. TRANSFER : ex-9 (Pythagore
 * réciproque d'abord, puis Thalès), ex-26 (la bissectrice, raisonnement), et les items 4–5 de « أستعدّ » que
 * l'élève peut maintenant trancher (item 5 corrigé : ADE → ADF). Une étape par exercice, faite quand chaque
 * partie a reçu une réponse (juste ou fausse). Les figures sont des données GeoFigure (content/figures.js).
 * Aucun texte destiné à l'élève ne renvoie au manuel ni ne numérote ses exercices (rollout mission 2026-11-10).
 *
 * UNE PARTIE d'exercice par étape (rollout mission 2026-11-10, comme la leçon 2) : une étape de plusieurs parties, sa figure et son rappel
 * dépassait l'écran du lecteur même réduite (`data-fit-overflow` à 1366 × 768). Chaque partie garde SA figure (et l'énoncé de l'exercice quand
 * elle n'est pas la première). Dans le lecteur : la figure À CÔTÉ de l'exercice et pas de rappel sous la question (il reste dans « بطاقتي », ouverte
 * dès le premier écran : rien n'est retiré).
 */
const FIGURES = {
  ex1: <GeoFigure {...FIG_EX1} />,
  ex2: <GeoFigure {...FIG_EX2} />,
  ex3: <div className="grid grid-cols-2 gap-2">{FIG_EX3.map((f) => <GeoFigure key={f.caption} {...f} />)}</div>,
  ex4: <GeoFigure {...FIG_EX4} />,
  ex5: <GeoFigure {...FIG_EX5} />,
  ex8: <GeoFigure {...FIG_EX8} />,
  ex9: <GeoFigure {...FIG_EX9} />,
};

const PREP_EX = PREP_REVISITED.map((p) => ({
  id: `prep-${p.n}`, source: p.source, interaction: 'trueFalse',
  statement: 'الآن يمكنك أن تقرّر: أصحيح أم خاطئ؟ برّر إجابتك.',
  question: { rows: [{ text: p.text, answer: p.answer, why: p.why }] },
}));

export default function Module04Awazzif() {
  const [done, setDone] = useState({});
  const mark = (id) => () => setDone((d) => ({ ...d, [id]: true }));
  // une partie par étape — la figure de l'exercice sur chaque partie, son énoncé rappelé sur les suivantes ; lecteur : le rappel après la question
  const GROUPS = [
    ['1', 'النسب المتساوية', ['khassiyat-talis'], 'khassiyat-talis'], ['2', 'احسب BC', ['hisab-atwal']], ['3', 'أربعة أشكال', ['khassiyat-talis']],
    ['4', 'القيم المضبوطة والمدوّرة', ['hisab-atwal']], ['5', 'تكبير', ['hisab-atwal', 'muamil-tanasub'], 'muamil-tanasub'],
    ['6', 'محيط المثلث BKL', ['hisab-atwal', 'muamil-tanasub']], ['8', 'احسب AP و LP', ['hisab-atwal']], ['9', 'فيثاغورس ثم طالس', ['hisab-atwal']],
  ];
  const partSteps = ([n, title, requires, brick]) => {
    const parts = partsOf(n);
    const first = parts[0];
    return parts.map((ex, i) => ({
      title: parts.length > 1 ? `${title} (${i + 1})` : title, done: Boolean(done[ex.id]),
      content: (
        <div className="space-y-3">
          {brick && i === 0 && <PlayerSwitch player={null} page={<KnowledgeBrick id={brick} variant="rappel" compact />} />}
          {/* lecteur : la figure À CÔTÉ de l'exercice (au-dessus, l'étape dépassait l'écran même réduite — « أربعة أشكال », « النسب المتساوية (2) »,
              « فيثاغورس ثم طالس (1) » à 1024 et 1366) ; la page garde la figure au-dessus */}
          <PlayerSwitch
            player={first.figure === 'ex3' ? (
              // UN écran par figure (« pas d'aller-retour », 2026-11-11) : chaque ligne « الشكل (k) » porte SON dessin à côté d'elle (`rowAside`) ;
              // les quatre ensemble tenaient seulement au zoom minimum 0,6. La clé d'enregistrement de la grille ne change pas.
              <TextbookExercise exercise={{ ...ex, figure: undefined, statement: ex.statement ?? first.statement }} requires={requires} onAnswered={mark(ex.id)}
                rowAside={(k) => <div className="[&_svg]:max-h-[260px]"><GeoFigure {...FIG_EX3[k]} maxWidth={320} /></div>} />
            ) : (
              <div className="flex items-start gap-4" data-ex-side data-paging-keep>
                {first.figure && <div className="w-[36%] shrink-0">{FIGURES[first.figure]}</div>}
                <div className="min-w-0 flex-1">
                  <TextbookExercise exercise={{ ...ex, figure: undefined, statement: ex.statement ?? first.statement }} requires={requires} onAnswered={mark(ex.id)} />
                </div>
              </div>
            )}
            page={(
              <>
                {first.figure && FIGURES[first.figure]}
                <TextbookExercise exercise={{ ...ex, figure: undefined, statement: ex.statement ?? first.statement }} requires={requires} onAnswered={mark(ex.id)} />
              </>
            )}
          />
          {/* lecteur : pas de rappel sous l'exercice (l'étape dépassait l'écran de 10 px même réduite à 1366 × 768) — la carte reste dans « بطاقتي »,
              ouverte dès le premier écran (on réduit ce qui s'affiche, on ne supprime rien) */}
        </div>
      ),
    }));
  };
  const steps = [
    ...GROUPS.flatMap(partSteps),
    { title: 'الآن يمكنك أن تقرّر (1)', done: Boolean(done[PREP_EX[0].id]),
      content: <div className="space-y-3"><GeoFigure {...FIG_PREP4} /><TextbookExercise exercise={PREP_EX[0]} requires={['hisab-atwal']} onAnswered={mark(PREP_EX[0].id)} /></div> },
    { title: 'الآن يمكنك أن تقرّر (2)', done: Boolean(done[PREP_EX[1].id]),
      content: (
        <div className="space-y-3">
          <GeoFigure {...FIG_PREP5} />
          <TextbookExercise exercise={PREP_EX[1]} requires={['khassiyat-talis']} onAnswered={mark(PREP_EX[1].id)} />
          <p className="text-xs text-slate-500" data-correction><MathText>{PREP_REVISITED[1].correction}</MathText></p>
        </div>
      ) },
    ...partSteps(['26', 'أتعمّق: منصف الزاوية', ['khassiyat-talis']]),
  ].map((st, i) => ({ ...st, num: i + 1 }));

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(4)}
      moduleNumber={4}
      moduleTitle="أوظّف تعلّماتي"
      moduleSubtitle="تمارين متدرّجة: من التطبيق إلى التعمّق"
      objectives={['أحسب أطوالًا بخاصية طالس في أشكال متنوّعة', 'متى أحتاج خاصية فيثاغورس قبل خاصية طالس؟', 'أتعمّق: كيف أتصرّف في وضعية لا أرى فيها طالس مباشرة؟']}
      estimatedTime="10 دقائق"
      brief={{ tag: 'أوظّف تعلّماتي', title: 'تمارين للتطبيق والتعمّق', tone: 'amber',
        body: <p>اكتب الأعداد العشرية بالفاصلة (مثل 2,5) والكسور على الشكل a/b. الخطأ هنا يُصحَّح ولا يُحتسب.</p> }}
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={4} variant="memo" />}
    />
  );
}
