import React, { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import SimulationLab from '../components/SimulationLab';
import { EXPERIENCES, simInit } from '../components/probabilites';

/**
 * Module 5 — MANIPULATION : répéter, et voir un nombre apparaître.
 *
 * C'est le module qui rend la probabilité NÉCESSAIRE. L'élève lance par
 * salves cumulatives : à 10 lancers les fréquences sautent, à 10 000 elles
 * ne bougent presque plus. Il LIT lui-même le nombre autour duquel chaque
 * fréquence se cale — environ 16,7 % pour chaque face — avant que quiconque
 * ne lui parle de 1/6.
 *
 * `montrerAttendue` reste FAUX ici : afficher la cible d'avance ruinerait
 * la découverte, puisque l'élève verrait la réponse au lieu de la trouver.
 * Le module 6 la révèle, et la fait coïncider avec ce qui a été observé.
 *
 * Expected observation : « peu de lancers ne prouvent rien ; beaucoup de
 * lancers font apparaître un nombre stable, et c'est toujours le même ».
 * Misconception targeted : croire que « plus je lance, plus les nombres de sorties
 * seront égaux » (faux : les ÉCARTS grandissent, ce sont les FRÉQUENCES qui
 * se rapprochent) ; et le retour du piège du joueur.
 *
 * La loi des grands nombres n'est JAMAIS énoncée : c'est un objet de 4e.
 * On constate, on ne théorise pas.
 */
export default function Module05RepeterMilleFois() {
  const [sim, setSim] = useState(() => simInit(EXPERIENCES.de));
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);

  const beaucoup = sim.total >= 1000;

  const steps = [
    {
      num: 1,
      title: 'Lance, puis lance beaucoup plus',
      subtitle: 'Commence par + 10. Regarde les barres. Puis + 100, puis + 1000.',
      done: q1,
      content: (
        <div className="space-y-3">
          <div className="rounded-xl border-2 border-emerald-200 bg-emerald-50 p-3 text-sm text-slate-700">
            Chaque salve <strong>s’ajoute</strong> aux précédentes : c’est la même série qu’on
            regarde grandir. Fais quelques <strong>+ 10</strong> d’abord, et note à quel point les
            barres sont irrégulières.
          </div>

          {/* La manipulation ouvre le module. La cible reste CACHÉE : c'est
              l'élève qui doit voir le nombre apparaître. */}
          <SimulationLab
            experience="de"
            sim={sim}
            onSim={setSim}
            montrerAttendue={false}
          />

          <TapQuestion
            prompt="Compare 10 lancers et 1000 lancers. Qu’est-ce qui change ?"
            options={[
              'Sur 1000 lancers, les fréquences des six faces sont presque égales',
              'Sur 1000 lancers, chaque face sort exactement le même nombre de fois',
              'Rien ne change : c’est du hasard',
              'Sur 1000 lancers, une face finit toujours par gagner',
            ]}
            correct={0}
            cols={1}
            requires={['experience-aleatoire', 'issue']}
            explain="Les fréquences (les pourcentages) se rapprochent les unes des autres. Les nombres de sorties, eux, ne sont jamais exactement égaux — et ce n’est pas nécessaire."
            explainWrong="Regarde le nombre de sorties de chaque face : sur 1000 lancers, une face peut sortir 158 fois et une autre 179. Ce ne sont pas les mêmes nombres. Ce sont les FRÉQUENCES, en pourcentage, qui se ressemblent de plus en plus."
            solved={q1}
            onAnswered={() => setQ1(true)}
          />
        </div>
      ),
    },
    {
      num: 2,
      title: 'Lis le nombre qui apparaît',
      subtitle: 'Monte jusqu’à 10 000 lancers, et regarde le pourcentage de chaque face.',
      done: q2,
      content: (
        <div className="space-y-3">
          {!beaucoup && (
            <Feedback tone="info">
              Reviens à l’étape précédente et clique <strong>+ 1000</strong> plusieurs fois : il
              faut beaucoup de lancers pour que le nombre se laisse voir.
            </Feedback>
          )}
          <TapQuestion
            prompt="Avec beaucoup de lancers, autour de quel pourcentage chaque face se stabilise-t-elle ?"
            options={['Environ 16,7 %', 'Environ 6 %', 'Environ 50 %', 'Environ 25 %']}
            correct={0}
            cols={4}
            requires={['issue']}
            explain="Chacune des six faces se cale autour de 16,7 %. Six parts de 16,7 %, cela fait bien 100 % : le total se répartit également entre les six faces."
            explainWrong="Vérifie sur ta simulation : chaque barre affiche son pourcentage. Aucune ne s’approche de 50 % ni de 25 % — elles tournent toutes autour de 16 à 17 %."
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
          {q2 && (
            <KnowledgeBrick
              id="frequence-observee"
              variant="new"
              lead={<>Le nombre que tu viens de lire n’a pas été calculé : il est APPARU, à force de répéter.</>}
            />
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Ce que la répétition ne fait pas',
      done: q3,
      content: (
        <div className="space-y-3">
          <TapQuestion
            prompt={
              <>
                Sur 10 000 lancers, la face 4 est sortie 1 620 fois et la face 2, 1 715 fois —
                soit 95 lancers d’écart. Pourtant leurs fréquences sont presque identiques.
                Comment est-ce possible ?
              </>
            }
            options={[
              '95 sur 10 000, c’est moins de 1 % : l’écart est énorme en nombre, minuscule en part',
              'Il y a une erreur dans la simulation',
              'La face 2 est avantagée',
              'Les fréquences ne veulent rien dire',
            ]}
            correct={0}
            cols={1}
            requires={['frequence-observee', 'lire-tableau']}
            explain="16,20 % contre 17,15 % : moins d’un point d’écart. Quand le nombre de lancers grandit, les écarts en NOMBRE peuvent grandir aussi — mais rapportés au total, ils pèsent de moins en moins."
            explainWrong="Ce n’est ni une erreur ni un avantage : c’est exactement ce qu’on attend du hasard. Un écart de 95 sur 10 000 est infime en proportion, alors qu’un écart de 95 sur 200 serait énorme."
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
          {q3 && (
            <Feedback tone="ok">
              Tu as fait apparaître un nombre — environ <strong>16,7 %</strong> — en lançant des
              milliers de fois. La vraie question arrive maintenant :{' '}
              <strong>peut-on le trouver sans rien lancer&nbsp;?</strong>
            </Feedback>
          )}
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(5)}
      moduleNumber={5}
      moduleTitle="Répéter mille fois"
      moduleSubtitle="Un nombre qui apparaît tout seul"
      estimatedTime="11 min"
      brief={{
        tag: 'Manipulation',
        title: 'Dix lancers ne prouvent rien. Dix mille ?',
        tone: 'indigo',
        body: (
          <p>
            Un lancer est imprévisible, et dix lancers ne disent pas grand-chose. Mais si tu en
            fais dix mille, quelque chose d’étonnant se produit : les fréquences arrêtent de
            bouger et se calent sur un nombre précis. <strong>Ce nombre, personne ne te l’a
            donné</strong> — tu vas le lire toi-même.
          </p>
        ),
      }}
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={5} />}
    />
  );
}
