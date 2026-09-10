import React, { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick, PredictionChips } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import PyLab from '../components/PyLab';

/**
 * Module 1 — LA manipulation signature : définir une fonction et l'appeler.
 *
 * Activité               écrire un corps de fonction, puis l'appeler plusieurs fois
 * Geste de l'élève       éditer le code, ajouter des appels, exécuter
 * Observation attendue   UNE définition, autant de résultats que d'appels
 * Obstacle visé          « définir, c'est calculer » — non : définir range la
 *                        recette, seul l'appel l'exécute.
 *
 * Le programme est réellement interprété (components/pyRun.js, 46 tests) :
 * aucune sortie n'est écrite à la main dans ce module.
 */
const P1 = `def double(x):
    return 2 * x

print(double(7))`;

const P2 = `def double(x):
    return 2 * x

print(double)`;

export default function Module01LaMachineAFabriquer() {
  const [pred, setPred] = useState(null);
  const [ran, setRan] = useState(false);
  const [calls, setCalls] = useState(0);
  const [sawErr, setSawErr] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);

  const done1 = ran && calls >= 2;

  const steps = [
    {
      num: 1,
      title: 'Une recette, plusieurs plats',
      subtitle: 'Exécute. Puis ajoute d’autres appels — double(1.5), double(100) — et exécute à nouveau.',
      done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <PredictionChips
            prompt="que va afficher ce programme ?"
            options={[{ id: '14', label: '14' }, { id: '7', label: '7' }, { id: '2x', label: '2 * x' }]}
            value={pred} onChange={setPred} disabled={done1}
          />
          <PyLab
            initial={P1}
            label="Ta première fonction"
            onRun={({ output, source }) => {
              setRan(true);
              const n = (source.match(/double\s*\(/g) || []).length - 1; // la définition ne compte pas
              if (n > calls) { if (n >= 2 && calls < 2) kit.react?.(true); setCalls(n); }
            }}
          />
          {!ran && (
            <Feedback tone="info">
              La définition occupe les deux premières lignes ; la dernière est l’<strong>appel</strong>.
              Exécute pour voir lequel des deux produit un résultat.
            </Feedback>
          )}
          {ran && calls < 2 && (
            <Feedback tone="info">
              <strong>14</strong>. Maintenant ajoute une ligne — par exemple <span className="font-mono">print(double(1.5))</span> —
              sans toucher à la définition, et exécute.
            </Feedback>
          )}
          {done1 && (
            <>
              <Feedback tone="ok">
                Deux appels, deux résultats, et la définition n’a pas bougé d’une lettre. C’est tout
                l’intérêt : on écrit le calcul <strong>une fois</strong>, on s’en sert autant qu’on veut.
              </Feedback>
              <KnowledgeBrick
                id="fonction-python"
                variant="new"
                lead={<>Ce que tu viens d’écrire porte un nom.</>}
              />
              <KnowledgeBrick
                id="def-return"
                variant="new"
                lead={<>Et ses deux mots-clés ont chacun un rôle précis.</>}
              />
            </>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Définir ne calcule rien',
      subtitle: 'Ce programme définit la fonction, puis affiche son nom SANS parenthèses. Exécute.',
      done: sawErr,
      content: (kit) => (
        <div className="space-y-3">
          <PyLab
            initial={P2}
            label="Le nom sans les parenthèses"
            onRun={({ output, error }) => {
              if ((error || output.length) && !sawErr) { setSawErr(true); kit.react?.(true); }
            }}
          />
          {sawErr && (
            <>
              <Feedback tone="ok">
                Sans parenthèses, rien n’est calculé — Python ne trouve même pas de variable de ce nom.
                Ce sont les <strong>parenthèses</strong> qui déclenchent l’exécution du corps.
              </Feedback>
              <KnowledgeBrick
                id="appel-fonction"
                variant="new"
                lead={<>La différence que tu viens de constater porte un nom.</>}
              />
              <KnowledgeBrick id="mem-entree-sortie" variant="new" />
            </>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Où va le résultat ?',
      done: q3,
      content: () => (
        <TapQuestion
          prompt={<span>Avec <span className="font-mono">def double(x): return 2 * x</span>, que vaut <span className="font-mono">double(double(3))</span> ?</span>}
          options={['12', '6', '9', '3']}
          correct={0} cols={4}
          requires={['appel-fonction', 'def-return']}
          explain="L’appel intérieur est calculé d’abord : double(3) = 6. Ce résultat devient l’argument de l’appel extérieur : double(6) = 12. Une fonction qui renvoie une valeur peut donc nourrir une autre fonction."
          explainWrong="Commence par l’intérieur : double(3) vaut 6. Ce 6 est ensuite doublé à son tour."
          solved={q3} onAnswered={() => setQ3(true)}
        />
      ),
    },
    {
      num: 4,
      title: 'Une fonction sans return',
      done: q4,
      content: () => (
        <TapQuestion
          prompt={<span>Que renvoie <span className="font-mono">def rien(x): y = 2 * x</span> quand on l’appelle, faute de <span className="font-mono">return</span> ?</span>}
          options={['None : elle ne renvoie rien d’exploitable', 'Le double de x quand même', 'La valeur de y', 'Une erreur qui arrête le programme']}
          correct={0} cols={1}
          requires={['def-return', 'mem-entree-sortie']}
          explain="Le calcul est bien effectué, mais rien ne le fait SORTIR de la fonction : Python renvoie None, la valeur « rien ». Oublier le return est l’erreur la plus fréquente des débuts."
          explainWrong="La fonction s’exécute sans erreur — mais sans return, aucune valeur ne ressort. Python renvoie alors None."
          solved={q4} onAnswered={() => setQ4(true)}
        />
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      moduleTitle="La machine à fabriquer"
      moduleSubtitle="Une entrée, un corps, une sortie"
      estimatedTime="13 min"
      brief={{
        tag: '🐍 Mission 01',
        title: 'Écrire le calcul une fois, s’en servir cent fois.',
        tone: 'indigo',
        body: <p>Tu connais f(x) en mathématiques. Ici tu vas écrire le corps de f toi-même, puis le faire tourner.</p>,
      }}
      steps={steps}
      footer={(
        <KnowledgeSnapshot moduleNumber={1}>
          Ta fonction reçoit un nombre. Que se passe-t-il quand le calcul en demande deux ?
        </KnowledgeSnapshot>
      )}
    />
  );
}
