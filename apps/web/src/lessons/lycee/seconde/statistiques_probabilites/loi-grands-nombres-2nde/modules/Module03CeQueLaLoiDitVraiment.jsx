import React, { useState } from 'react';
import { ContentModule, TapQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import MathText from '../../../../../common/components/MathText';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import GapExplorer from '../components/GapExplorer';

/**
 * Module 3 — FORMALISATION, et surtout les deux contre-sens.
 *
 * (1) L'écart en FRÉQUENCE se resserre, l'écart en NOMBRE grandit
 *     (GapExplorer) : la loi ne dit rien du nombre de Pile moins le nombre
 *     de Face, elle ne parle que du quotient.
 * (2) La « loi des séries » : après cinq Piles, Face n'est pas plus
 *     probable. La pièce n'a pas de mémoire — la stabilisation vient de la
 *     DILUTION du début par la masse des lancers suivants, pas d'une
 *     compensation.
 *
 * Ces deux idées sont les seules choses que ce module ajoute : la
 * simulation (M1), la fluctuation (M2) et la critique du modèle (M4) ont
 * leur propre place.
 */
export default function Module03CeQueLaLoiDitVraiment() {
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);

  const steps = [
    {
      num: 1,
      title: 'Deux écarts qui ne font pas la même chose',
      subtitle: 'Sur la même série : l’écart en fréquence et l’écart en nombre de succès.',
      done: q1,
      content: (
        <div className="space-y-3">
          <GapExplorer p={0.5} />
          <TapQuestion
            prompt="Quand le nombre de lancers augmente, que devient l’écart entre le nombre de Pile obtenu et la moitié des lancers ?"
            options={[
              'Il a tendance à grandir',
              'Il tend vers zéro',
              'Il reste constant',
              'Il devient négatif',
            ]}
            correct={0} cols={2}
            explain="C’est le contre-sens le plus fréquent. L’écart en NOMBRE grandit (une centaine sur 10 000 lancers, contre une unité sur 10) ; c’est l’écart en FRÉQUENCE qui se resserre, parce qu’on divise par un nombre de plus en plus grand. La loi des grands nombres ne parle que du quotient."
            explainWrong="Regarde les deux colonnes : la verte (fréquence) descend, la rouge (nombre) monte. Seule la fréquence se rapproche de p."
            solved={q1} onAnswered={() => setQ1(true)}
          />
        </div>
      ),
    },
    {
      num: 2,
      title: 'La pièce n’a pas de mémoire',
      done: q2,
      content: (
        <div className="space-y-3">
          <div className="rounded-xl border-2 border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            Une pièce équilibrée vient de donner <strong>cinq fois Pile</strong> d’affilée.
          </div>
          <TapQuestion
            prompt="Au sixième lancer, la probabilité d’obtenir Face vaut…"
            options={['1/2, comme toujours', 'Plus de 1/2, pour compenser', 'Moins de 1/2', 'On ne peut pas savoir']}
            correct={0} cols={2}
            explain="La pièce ne se souvient de rien : chaque lancer est indépendant des précédents, donc P(Face) = 1/2 quoi qu’il se soit passé avant. Croire au rattrapage, c’est la « loi des séries » — elle n’existe pas. La stabilisation ne vient pas d’une compensation : les cinq Piles du début sont simplement DILUÉS par les milliers de lancers suivants."
            explainWrong="Si la pièce est équilibrée, chaque lancer redémarre à zéro : P(Face) = 1/2. Aucun mécanisme ne « rééquilibre » les lancers passés."
            solved={q2} onAnswered={() => setQ2(true)}
          />
        </div>
      ),
    },
    {
      num: 3,
      title: 'Énoncer la loi',
      done: q3,
      content: (
        <div className="space-y-3">
          <div className="rounded-2xl border-2 border-sky-200 bg-white p-4 space-y-2">
            <div className="text-center">
              <MathText>{'$$f_n \\xrightarrow[\\ n \\text{ grand}\\ ]{} p$$'}</MathText>
            </div>
            <p className="text-sm text-slate-700">
              <strong>Loi des grands nombres.</strong> Quand on répète un grand nombre de fois, de façon
              indépendante, une expérience aléatoire, la fréquence observée d’un événement se rapproche de sa
              probabilité <em>p</em> — et l’écart possible devient d’autant plus petit que n est grand.
            </p>
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
              Elle ne garantit <strong>jamais</strong> une valeur exacte pour une série donnée, ni un rattrapage
              des écarts passés.
            </div>
          </div>
          <TapQuestion
            prompt="Une pièce équilibrée lancée 10 000 fois. Laquelle de ces affirmations est correcte ?"
            options={[
              'La fréquence de Pile sera très probablement proche de 50 %',
              'On obtiendra exactement 5 000 Pile',
              'Il y aura autant de Pile que de Face à la fin',
              'La fréquence de Pile sera exactement 0,5',
            ]}
            correct={0} cols={1}
            explain="« Très probablement proche » est tout ce que la loi promet. Obtenir exactement 5 000 Pile est possible mais peu probable — et les trois autres formulations confondent la tendance de la fréquence avec une égalité des effectifs."
            explainWrong="La loi est une affirmation sur la PROXIMITÉ de la fréquence, jamais sur une égalité exacte des effectifs."
            solved={q3} onAnswered={() => setQ3(true)}
          />
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX} navLinks={getNavLinks(3)} moduleNumber={3}
      moduleTitle="Ce que la loi dit vraiment" moduleSubtitle="Et les deux choses qu’elle ne dit pas" estimatedTime="13 min"
      brief={{
        tag: 'Formalisation', title: 'Une promesse précise', tone: 'sky',
        body: <p>Tu as vu la fréquence se stabiliser. Reste à dire exactement ce qui se stabilise — et à écarter deux idées fausses très répandues.</p>,
      }}
      steps={steps}
      footer={(
        <KnowledgeSnapshot moduleNumber={3}>
          <strong>Retenu.</strong> La fréquence se rapproche de la probabilité ; l’écart en <em>nombre</em>, lui,
          grandit. Et les lancers sont <strong>indépendants</strong> : rien ne compense les résultats passés.
          Module suivant : et si le modèle lui-même était faux ?
        </KnowledgeSnapshot>
      )}
    />
  );
}
