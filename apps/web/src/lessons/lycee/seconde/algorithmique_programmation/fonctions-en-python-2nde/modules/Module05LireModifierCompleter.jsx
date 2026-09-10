import React, { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import PyLab from '../components/PyLab';

/**
 * Module 5 — l'atelier : lire (P5), modifier (P6), compléter (P7).
 *
 * Trois fonctions écrites « par quelqu'un d'autre ». Chaque étape impose de
 * prévoir avant d'exécuter. Les contrôles portent sur la SORTIE, jamais sur le
 * texte du code. Valeurs vérifiées : mystere(3,9)=9, mystere(12,4)=12,
 * somme_jusqua(10)=55 et (100)=5050.
 */
const MYSTERE = `def mystere(a, b):
    if a > b:
        return a
    return b

print(mystere(3, 9))
print(mystere(12, 4))`;

const CUMUL = `def somme_jusqua(n):
    s = 0
    for i in range(1, n):
        s = s + i
    return s

print(somme_jusqua(10))`;

const MOYENNE = `def moyenne(a, b, c):
    return 0

print(moyenne(10, 12, 14))`;

export default function Module04LireModifierCompleter() {
  const [q1, setQ1] = useState(false);
  const [ranM, setRanM] = useState(false);
  const [fixed, setFixed] = useState(false);
  const [done3, setDone3] = useState(false);

  const steps = [
    {
      num: 1,
      title: 'Lire',
      subtitle: 'Cette fonction n’a pas de nom parlant. Que fait-elle ? Annonce, puis exécute.',
      done: q1 && ranM,
      content: (kit) => (
        <div className="space-y-3">
          <KnowledgeBrick
            id="methode-lire-fonction"
            variant="new"
            lead={<>Trois repères pour lire une fonction sans la relire ligne à ligne.</>}
          />
          <TapQuestion
            prompt={<span>Que renvoie <span className="font-mono">mystere(a, b)</span> ?</span>}
            options={['Le plus grand des deux nombres', 'Le plus petit des deux', 'Leur somme', 'Toujours a']}
            correct={0} cols={2}
            requires={['methode-lire-fonction', 'def-return']}
            explain="Si a dépasse b, elle renvoie a et s’arrête là ; sinon elle atteint la dernière ligne et renvoie b. Dans les deux cas, c’est le plus grand qui sort."
            explainWrong="Suis les deux chemins possibles : que se passe-t-il quand a > b ? Et quand ce n’est pas le cas ? Le return du if arrête la fonction immédiatement."
            solved={q1} onAnswered={() => setQ1(true)}
          />
          {q1 && (
            <PyLab
              initial={MYSTERE}
              label="Vérifie ta lecture"
              onRun={({ output }) => { if (output.length >= 2 && !ranM) { setRanM(true); kit.react?.(true); } }}
            />
          )}
          {ranM && (
            <Feedback tone="ok">
              <span className="font-mono">9</span> puis <span className="font-mono">12</span> : le plus grand
              dans les deux cas, quelle que soit sa position. Essaie <span className="font-mono">mystere(5, 5)</span> pour voir.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Réparer',
      subtitle: 'Cette fonction doit donner 55 pour n = 10 (la somme de 1 à 10). Elle donne 45. Corrige-la.',
      done: fixed,
      content: (kit) => (
        <div className="space-y-3">
          <PyLab
            initial={CUMUL}
            label="Somme jusqu’à n"
            onRun={({ output }) => {
              if (output.length && Number(output[0]) === 55 && !fixed) { setFixed(true); kit.react?.(true); }
            }}
          />
          {fixed ? (
            <Feedback tone="ok">
              <strong>55.</strong> La borne de <span className="font-mono">range</span> excluait n lui-même :
              il fallait <span className="font-mono">range(1, n + 1)</span>. Vérifie avec 100 — tu dois obtenir 5050.
            </Feedback>
          ) : (
            <Feedback tone="info">
              L’écart vaut 10, soit exactement le terme absent. Regarde la borne de droite de la boucle.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Compléter',
      subtitle: 'Le corps est à écrire : la fonction doit renvoyer la moyenne des trois nombres. moyenne(10, 12, 14) doit valoir 12.',
      done: done3,
      content: (kit) => (
        <div className="space-y-3">
          <PyLab
            initial={MOYENNE}
            label="Moyenne de trois nombres"
            onRun={({ output }) => {
              if (output.length && Number(output[0]) === 12 && !done3) { setDone3(true); kit.react?.(true); }
            }}
          />
          {done3 ? (
            <Feedback tone="ok">
              <strong>12.</strong> Les parenthèses étaient indispensables : sans elles, seul c aurait été divisé
              par 3. Une fonction de trois paramètres, et la moyenne du collège devient réutilisable partout.
            </Feedback>
          ) : (
            <Feedback tone="info">
              Additionne les trois, puis divise par 3 — et pense aux parenthèses autour de la somme.
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
      moduleTitle="Lire, modifier, compléter"
      moduleSubtitle="Trois fonctions écrites par quelqu’un d’autre"
      estimatedTime="11 min"
      brief={{
        tag: '🔧 Mission 05',
        title: 'On passe plus de temps à lire du code qu’à en écrire.',
        tone: 'indigo',
        body: <p>Une fonction à comprendre, une à réparer, une à compléter. À chaque fois : prévoir, puis exécuter.</p>,
      }}
      steps={steps}
      footer={(
        <KnowledgeSnapshot moduleNumber={5}>
          Tes fonctions donnent toujours le même résultat. Que se passe-t-il quand
          on y fait entrer le hasard ?
        </KnowledgeSnapshot>
      )}
    />
  );
}
