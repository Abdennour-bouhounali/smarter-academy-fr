import React, { useState } from 'react';
import { ContentModule, TapQuestion, PredictionChips, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { formatPercent, proportion } from '../../../../../common/stats';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import PopulationSplitter from '../components/PopulationSplitter';

/**
 * Module 1 — DÉCLENCHEUR, et l'interaction SIGNATURE : découper la population
 * (components/PopulationSplitter.jsx).
 *
 * Step 1  l'élève pousse des ÉLÈVES et regarde le pourcentage bouger tout
 *         seul — la proportion est une CONSÉQUENCE d'un découpage.
 * Step 2  même effectif, deux lycées de tailles différentes : 200 n'est pas
 *         une part, 200 sur COMBIEN en est une.
 * Step 3  une part DANS la part : « 30 % » — de quoi ? Les deux lectures
 *         coexistent à l'écran et ne donnent pas le même nombre.
 * Step 4  la question qui ouvre la leçon, sans y répondre.
 *
 * Rien n'est appelé « proportion » comme définition, ni écrit p = partie/tout,
 * avant le pied de module : les mots arrivent au module 2.
 */
const TOTAL = 800;

export default function Module01LeLyceeDe800Eleves() {
  const [part, setPart] = useState(480);
  // Le glissement est continu (1 élève) : compter les valeurs distinctes
  // validerait l'étape au premier mouvement. On retient donc des découpages
  // NETTEMENT différents — au moins 10 points de pourcentage d'écart entre
  // deux d'entre eux —, ce qui suppose d'avoir vraiment exploré la barre.
  const [seenParts, setSeenParts] = useState(() => [480]);
  const [pred1, setPred1] = useState(null);

  const [smallPart, setSmallPart] = useState(200);
  const [q2, setQ2] = useState(false);

  const [sub, setSub] = useState(120);
  const [seenSubs, setSeenSubs] = useState(() => [120]);
  const [reading, setReading] = useState('sub-in-part');
  const [seenReadings, setSeenReadings] = useState(() => new Set(['sub-in-part']));

  const [q4, setQ4] = useState(false);

  /** Garde les découpages séparés d'au moins `gap` élèves — pas les micro-pas. */
  const keepDistinct = (list, v, gap) =>
    list.some((x) => Math.abs(x - v) < gap) ? list : [...list, v];

  const SPREAD = Math.round(TOTAL * 0.1);   // 10 points de pourcentage
  // Step 1 : trois découpages nettement différents suffisent à voir le lien bouger.
  const done1 = seenParts.length >= 3;
  const done2 = q2;
  // Step 3 : avoir bougé le sous-groupe ET regardé les deux lectures.
  const done3 = seenSubs.length >= 2 && seenReadings.size >= 2;
  const done4 = q4;

  const changePart = (v, react) => {
    setPart(v);
    const next = keepDistinct(seenParts, v, SPREAD);
    if (next.length !== seenParts.length) setSeenParts(next);
    if (!done1 && next.length >= 3) react?.(true);
  };
  const changeSub = (v, react) => {
    setSub(v);
    const next = keepDistinct(seenSubs, v, Math.round(480 * 0.15));
    if (next.length !== seenSubs.length) setSeenSubs(next);
    if (!done3 && next.length >= 2 && seenReadings.size >= 2) react?.(true);
  };
  const changeReading = (r, react) => {
    setReading(r);
    const next = new Set(seenReadings); next.add(r); setSeenReadings(next);
    // seenSubs est un TABLEAU (seenReadings est le Set) : c'est bien .length.
    if (!done3 && next.size >= 2 && seenSubs.length >= 2) react?.(true);
  };

  const pSubInPart = proportion(sub, part);
  const pSubInWhole = proportion(sub, TOTAL);

  const steps = [
    {
      num: 1,
      title: 'Découpe la population',
      subtitle: '800 élèves. Attrape le trait noir et fais-le glisser : combien sont demi-pensionnaires ? Essaie trois découpages nettement différents.',
      done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <PredictionChips
            prompt="si tu doubles le nombre de demi-pensionnaires, que devient leur pourcentage ?"
            options={[
              { id: 'double', label: 'Il double aussi' },
              { id: 'plus', label: 'Il augmente, mais pas du double' },
              { id: 'same', label: 'Il ne change pas' },
            ]}
            value={pred1} onChange={setPred1} disabled={done1}
          />
          <PopulationSplitter
            total={TOTAL} part={part} onPartChange={(v) => changePart(v, kit.react)}
            reading="part"
          />
          {done1 ? (
            <Feedback tone="ok">
              {pred1 === 'double' ? 'Ta prédiction tenait' : pred1 ? 'Regarde de plus près' : 'Regarde'} : le tout ne bouge pas
              (800), donc doubler la part double bien le pourcentage — 240 → 30 %, 480 → 60 %. Ce que tu règles, ce sont des
              <strong> élèves</strong> ; le pourcentage, lui, se calcule tout seul. Il <strong>dépend des deux nombres</strong>.
              {' '}<span className="text-slate-500">Continue à glisser si tu veux : ici, {part} sur {TOTAL} font {formatPercent(proportion(part, TOTAL), 1)}.</span>
            </Feedback>
          ) : null}
          {/* Le geste vient de montrer que le pourcentage se calcule à partir
              de DEUX nombres : on peut maintenant nommer ce quotient et son
              tout, avant la première question (étape 2) qui les exige. */}
          {done1 && (
            <KnowledgeBrick
              id="vocab-part-tout"
              variant="new"
              compact
              lead={<>Tu viens de pousser des <strong>élèves</strong> et de voir un <strong>pourcentage</strong> se calculer tout seul. Ces deux nombres portent un nom.</>}
            />
          )}
          {!done1 && (
            <Feedback tone="info">
              {part} demi-pensionnaires sur {TOTAL} → {formatPercent(proportion(part, TOTAL), 1)}.
              Découpages essayés : {seenParts.length} sur 3.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Le même nombre, deux lycées',
      subtitle: '200 élèves inscrits au CDI dans les deux cas. Est-ce la même part ?',
      done: done2,
      content: (
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border-2 border-slate-200 bg-white p-3 space-y-2">
              <p className="text-sm font-bold text-slate-700">Lycée A — 800 élèves</p>
              <PopulationSplitter total={800} part={smallPart} onPartChange={setSmallPart} lockPart
                labels={{ whole: 'élèves', part: 'inscrits au CDI', sub: '' }} reading="part" />
            </div>
            <div className="rounded-2xl border-2 border-slate-200 bg-white p-3 space-y-2">
              <p className="text-sm font-bold text-slate-700">Lycée B — 400 élèves</p>
              <PopulationSplitter total={400} part={smallPart} onPartChange={setSmallPart} lockPart
                labels={{ whole: 'élèves', part: 'inscrits au CDI', sub: '' }} reading="part" />
            </div>
          </div>
          <TapQuestion
            prompt="Dans les deux lycées, 200 élèves sont inscrits au CDI. Que peut-on dire ?"
            options={[
              'C’est la même part : 200 dans les deux cas',
              'C’est deux fois plus au lycée B : 25 % contre 50 %',
              'C’est deux fois plus au lycée A',
              'On ne peut pas comparer',
            ]}
            correct={1} cols={1}
            requires={['vocab-part-tout', 'pourcentage', 'effectif', 'quotient']}
            explain="200 sur 800 = 25 % ; 200 sur 400 = 50 %. Le même effectif ne dit rien tant qu’on ne dit pas SUR COMBIEN."
            explainWrong="Le nombre 200 est identique, mais il n’est pas rapporté au même tout : 200/800 = 0,25 et 200/400 = 0,5."
            solved={done2} onAnswered={() => setQ2(true)}
          />
        </div>
      ),
    },
    {
      num: 3,
      title: 'Une part dans la part',
      subtitle: 'Parmi les demi-pensionnaires, certains sont internes. Fais glisser le second trait, puis change ce que tu regardes.',
      done: done3,
      content: (kit) => (
        <div className="space-y-3">
          <PopulationSplitter
            total={TOTAL} part={480} onPartChange={() => {}} lockPart
            sub={sub} onSubChange={(v) => changeSub(v, kit.react)}
            reading={reading}
          />
          <div className="flex flex-wrap gap-2" role="group" aria-label="Ce qu’on regarde">
            {[
              { id: 'sub-in-part', label: 'Internes parmi les demi-pensionnaires' },
              { id: 'sub-in-whole', label: 'Internes parmi tout le lycée' },
            ].map((o) => (
              <button key={o.id} type="button"
                aria-pressed={reading === o.id}
                onClick={() => changeReading(o.id, kit.react)}
                className={`min-h-[44px] px-4 rounded-xl border-2 text-sm font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                  reading === o.id ? 'bg-sky-600 border-sky-700 text-white' : 'bg-white border-slate-300 text-slate-700 hover:border-sky-400'
                }`}>
                {o.label}
              </button>
            ))}
          </div>
          {done3 ? (
            <Feedback tone="ok">
              Les mêmes <strong>{sub} internes</strong> donnent <strong>deux pourcentages différents</strong> :
              {' '}{formatPercent(pSubInPart, 1)} parmi les 480 demi-pensionnaires, mais {formatPercent(pSubInWhole, 1)} parmi
              les 800 élèves. Le nombre du haut ne bouge pas — c’est celui du bas, le <strong>tout de référence</strong>,
              qui change tout. <span className="text-slate-500">Glisse encore et bascule entre les deux lectures : l’écart demeure.</span>
            </Feedback>
          ) : null}
          {/* Les deux lectures viennent de donner DEUX nombres pour les mêmes
              internes : c'est l'instant où « proportion » et « tout de
              référence » ont un sens, et l'étape 4 va les exiger. */}
          {done3 && (
            <KnowledgeBrick
              id="proportion-reference"
              variant="new"
              lead={<>Les mêmes <strong>{sub} internes</strong>, deux pourcentages. Ce n’est pas une contradiction : ce sont deux quotients qui n’ont pas le même dénominateur.</>}
            />
          )}
          {!done3 && (
            <Feedback tone="info">
              {seenSubs.length < 2 ? 'Change le nombre d’internes. ' : ''}
              {seenReadings.size < 2 ? 'Puis change ce que tu regardes avec les deux boutons.' : ''}
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 4,
      title: '« 30 % » — de quoi ?',
      done: done4,
      content: (
        <div className="space-y-3">
        <TapQuestion
          prompt="Un article de journal titre : « 30 % des jeunes de ce lycée sont internes ». Que manque-t-il pour que la phrase soit vérifiable ?"
          options={[
            'Rien, 30 % se comprend tout seul',
            'Savoir de quel ensemble on parle : 30 % de tous les élèves, ou des demi-pensionnaires ?',
            'Le nombre exact d’internes uniquement',
            'La date de l’enquête',
          ]}
          correct={1} cols={1}
          requires={['proportion-reference', 'vocab-part-tout', 'pourcentage']}
          explain="Un pourcentage n’est jamais un nombre isolé : il rapporte une part à un tout. Sans le tout, « 30 % » ne désigne aucune quantité — 30 % de 800 et 30 % de 480 ne sont pas le même nombre d’élèves."
          explainWrong="Tu viens de le voir à l’étape 3 : les mêmes internes valent deux pourcentages différents selon le groupe de référence. C’est ce tout qu’il faut préciser."
          solved={done4} onAnswered={() => setQ4(true)}
        />
        {/* La question du module, une fois résolue, devient la consigne que
            l'élève emportera dans toute la leçon. */}
        {done4 && (
          <KnowledgeBrick
            id="mem-de-quoi"
            variant="new"
            lead={<>C’est le réflexe de toute la leçon — et il vaut aussi pour les évolutions du module 4.</>}
          />
        )}
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX} navLinks={getNavLinks(1)} moduleNumber={1}
      moduleTitle="Le lycée de 800 élèves" moduleSubtitle="Une part ne se lit jamais toute seule"
      estimatedTime="11 min"
      brief={{
        tag: 'Déclencheur', title: 'Une part, mais de quoi ?', tone: 'indigo',
        body: <p>Un lycée de {TOTAL} élèves. Tu vas déplacer les séparations et regarder les pourcentages se calculer tout seuls — puis découper une part <em>à l’intérieur</em> d’une part.</p>,
      }}
      steps={steps}
      footer={(
        <KnowledgeSnapshot moduleNumber={1}>
          <strong>Les mots justes.</strong> Ce nombre « part sur tout » s’appelle une <strong>proportion</strong>, et le tout
          est sa <strong>référence</strong>. Module suivant : la même proportion s’écrit de trois façons — et l’une d’elles
          permet de retrouver l’effectif.
        </KnowledgeSnapshot>
      )}
    />
  );
}
