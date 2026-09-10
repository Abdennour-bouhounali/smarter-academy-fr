import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import PyLab from '../components/PyLab';

/**
 * Module 6 — répéter, collecter, vérifier (P10, P12).
 *
 * L'élève exécute DEUX fois une simulation de 1 000 lancers : les deux comptes
 * diffèrent, tous deux voisins de 167. La fluctuation n'est pas racontée, elle
 * est produite. Puis il vérifie le programme en le comparant à une probabilité
 * qu'il sait calculer autrement.
 */
const MILLE = `def lancer():
    return randint(1, 6)

six = 0
for i in range(1000):
    if lancer() == 6:
        six = six + 1
print(six)
print(six / 1000)`;

const DEUX_DES = `def somme2des():
    return randint(1, 6) + randint(1, 6)

sept = 0
for i in range(1000):
    if somme2des() == 7:
        sept = sept + 1
print(sept)`;

export default function Module06MilleExperiences() {
  const [counts, setCounts] = useState([]);
  const [q2, setQ2] = useState(false);
  const [ran2, setRan2] = useState(false);
  const [q4, setQ4] = useState(false);

  const done1 = counts.length >= 2;
  const allNear = counts.length >= 2 && counts.every((c) => c > 120 && c < 215);

  const steps = [
    {
      num: 1,
      title: 'Mille lancers, deux fois',
      subtitle: 'Exécute une première fois, note le nombre de 6. Puis exécute à nouveau.',
      done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <PyLab
            initial={MILLE}
            label="Compter les 6 sur 1 000 lancers"
            onRun={({ output }) => {
              const n = Number(output[0]);
              if (!Number.isFinite(n)) return;
              // Voir Module03 : kit.react() hors de tout updater de setState.
              if (counts.length === 1) kit.react?.(true);
              setCounts((c) => [...c, n]);
            }}
          />
          {counts.length === 0 && (
            <Feedback tone="info">
              Un dé a une chance sur six de tomber sur 6. Sur 1 000 lancers, à combien t’attends-tu ?
              Exécute pour voir.
            </Feedback>
          )}
          {counts.length === 1 && (
            <Feedback tone="info">
              <strong>{counts[0]}</strong> fois. Réexécute sans rien changer : tu n’obtiendras pas le même nombre.
            </Feedback>
          )}
          {done1 && (
            <>
              <Feedback tone="ok">
                <strong>{counts.slice(-2).join(' puis ')}</strong>. Deux nombres différents, tous deux voisins
                de <strong>167</strong> — c’est-à-dire 1 000 ÷ 6. La simulation ne donne jamais la valeur
                théorique exactement, elle tourne autour.
              </Feedback>
              <KnowledgeBrick
                id="methode-repeter-collecter"
                variant="new"
                lead={<>Le motif que tu viens d’exécuter se réutilise pour toute expérience.</>}
              />
              <KnowledgeBrick
                id="regle-fluctuation"
                variant="new"
                lead={<>Et voilà pourquoi tes deux résultats diffèrent.</>}
              />
            </>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Ce qu’on attend, et ce qu’on obtient',
      done: q2,
      content: () => (
        <div className="space-y-3">
          <NumericQuestion
            prompt="Sur 6 000 lancers d’un dé équilibré, combien de 6 attend-on en théorie ?"
            answer={1000}
            requires={['regle-fluctuation', 'simulation']}
            explain="6 000 ÷ 6 = 1 000. C’est l’ordre de grandeur attendu — une simulation donnera 987, 1 014, 996… mais presque jamais 1 000 pile."
            explainWrong="Une chance sur six : divise le nombre de lancers par 6."
            solved={q2} onAnswered={() => setQ2(true)}
          />
          {q2 && <KnowledgeBrick id="mem-plus-on-repete" variant="new" />}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Vérifier une simulation',
      subtitle: 'Deux dés, on compte les sommes égales à 7. Exécute, puis compare à la théorie.',
      done: ran2,
      content: (kit) => (
        <div className="space-y-3">
          <KnowledgeBrick
            id="methode-verifier-simulation"
            variant="new"
            lead={<>Avant d’exécuter : à quoi vas-tu comparer le résultat ?</>}
          />
          <PyLab
            initial={DEUX_DES}
            label="Combien de 7 avec deux dés ?"
            onRun={({ output }) => { if (output.length && !ran2) { setRan2(true); kit.react?.(true); } }}
          />
          {ran2 && (
            <Feedback tone="ok">
              Environ <strong>170 à 190</strong> fois sur 1 000. La théorie : sur 36 issues, six donnent 7
              (1+6, 2+5, 3+4, 4+3, 5+2, 6+1), soit 6/36 ≈ 0,167 — donc environ 167 par millier. Le programme
              est cohérent avec ce que tu sais calculer : <strong>c’est cela, vérifier une simulation</strong>.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 4,
      title: 'Un résultat suspect',
      done: q4,
      content: () => (
        <TapQuestion
          prompt="Une simulation de 1 000 lancers d’un dé annonce 480 fois le 6. Que conclus-tu ?"
          options={[
            'Le programme a un bug : 480 est bien trop loin des 167 attendus',
            'C’est possible, le hasard fait ce qu’il veut',
            'Le dé simulé est équilibré, mais on a eu de la chance',
            'Il faut relancer mille fois de plus pour savoir',
          ]}
          correct={0} cols={1}
          requires={['methode-verifier-simulation', 'regle-fluctuation']}
          explain="La fluctuation explique un écart de quelques dizaines, pas un triplement. 480 sur 1 000, c’est presque une chance sur deux : le programme ne simule pas le dé qu’on croit — peut-être randint(1, 2) au lieu de randint(1, 6)."
          explainWrong="Une fluctuation normale donne 150, 168, 181… Un écart de cette taille ne s’explique pas par le hasard : c’est le programme qu’il faut relire."
          solved={q4} onAnswered={() => setQ4(true)}
        />
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(6)}
      moduleNumber={6}
      moduleTitle="Mille expériences"
      moduleSubtitle="Répéter, collecter, vérifier"
      estimatedTime="10 min"
      brief={{
        tag: '📊 Mission 06',
        title: 'Mille lancers à la main : une heure. Mille lancers simulés : une seconde.',
        tone: 'indigo',
        body: <p>Et le résultat n’est jamais tout à fait le même. Ce n’est pas un défaut du programme — c’est le hasard lui-même.</p>,
      }}
      steps={steps}
      footer={(
        <KnowledgeSnapshot moduleNumber={6}>
          Ta carte est complète : définir, appeler, la portée, le hasard, la vérification.
          Le test final va les mesurer une par une.
        </KnowledgeSnapshot>
      )}
    />
  );
}
