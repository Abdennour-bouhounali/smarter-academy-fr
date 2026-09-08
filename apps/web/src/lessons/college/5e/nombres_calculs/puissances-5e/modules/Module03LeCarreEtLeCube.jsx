import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import SquareCubeLab from '../components/SquareCubeLab';
import { aireCarre, volumeCube, ecrirePuissance, parseEntier } from '../components/puissances';

/**
 * Module 3 — DÉCOUVERTE : d'où viennent les mots « carré » et « cube ».
 *
 * Activity              faire varier UN côté et voir simultanément le carré se
 *                       remplir de cases et le cube s'empiler.
 * Mathematical objective n² et n³ ne sont pas des conventions de vocabulaire :
 *                       ce sont les figures qu'on obtient en répétant le
 *                       facteur deux ou trois fois.
 * Student action        choisir la longueur du côté.
 * Visual consequence    les deux figures se redessinent, et leurs comptes se
 *                       réécrivent.
 * Expected observation  « quand je double le côté, l'aire est multipliée par 4
 *                       et le volume par 8 » — une puissance ne se comporte pas
 *                       comme une multiplication.
 * Misconception targeted croire que n² vaut n × 2 : le carré de côté 5 contient
 *                       visiblement 25 cases, pas 10.
 */
export default function Module03LeCarreEtLeCube() {
  const [cote, setCote] = useState(2);
  const [essais, setEssais] = useState(() => new Set([2]));
  const done1 = essais.size >= 3;

  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);

  const changer = (c, react) => {
    setCote(c);
    const next = new Set(essais);
    next.add(c);
    setEssais(next);
    if (next.size >= 3 && essais.size < 3) react?.(true);
  };

  const steps = [
    {
      num: 1,
      title: 'Construis un carré, puis un cube',
      subtitle: 'Change la longueur du côté et compte ce que tu obtiens. Essaie au moins trois côtés.',
      done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <SquareCubeLab
            cote={cote}
            onCote={(c) => changer(c, kit.react)}
            maxCote={6}
            montrer="les-deux"
            ariaLabel="Choisir la longueur du côté"
          />
          {done1 ? (
            <Feedback tone="ok">
              Regarde ce qui s’est passé quand tu es passé du côté 2 au côté 4 : le côté a{' '}
              <strong>doublé</strong>, mais l’aire est passée de 4 à 16 — elle a été{' '}
              <strong>multipliée par 4</strong> — et le volume de 8 à 64, soit{' '}
              <strong>multiplié par 8</strong>. Une puissance ne se comporte pas du tout comme une
              multiplication.
            </Feedback>
          ) : (
            <Feedback tone="info">
              {essais.size} côté{essais.size > 1 ? 's' : ''} essayé{essais.size > 1 ? 's' : ''} sur 3.
              Compare bien le nombre de cases et le nombre de cubes.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Pourquoi ces deux mots',
      done: q2,
      content: (
        <div className="space-y-3">
          <KnowledgeBrick
            id="carre-cube"
            variant="new"
            lead={<>Les deux figures que tu viens de construire ne sont pas une illustration : ce sont elles qui donnent leur nom aux deux écritures.</>}
          />
          <TapQuestion
            prompt={<>Que représente <span className="font-mono font-bold">{ecrirePuissance(7, 2)}</span> ?</>}
            options={[
              'Le nombre de cases d’un carré de côté 7',
              'Le périmètre d’un carré de côté 7',
              'Le nombre de cubes d’un cube d’arête 7',
              'Le double de 7',
            ]}
            correct={0}
            cols={1}
            requires={['carre-cube', 'exposant']}
            explain={`${ecrirePuissance(7, 2)} se lit « 7 au carré » : c’est 7 × 7 = ${aireCarre(7)}, le nombre de cases d’un carré de côté 7. Le CUBE d’arête 7 s’écrirait ${ecrirePuissance(7, 3)}.`}
            explainWrong={`Le périmètre d’un carré de côté 7 vaut 4 × 7 = 28, et le double de 7 vaut 14 : ni l’un ni l’autre n’est une puissance. « Au carré » veut dire « répété deux fois » — donc 7 × 7 = ${aireCarre(7)}.`}
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
        </div>
      ),
    },
    {
      num: 3,
      title: 'Le volume d’une caisse cubique',
      done: q3,
      content: (
        <div className="space-y-3">
          <NumericQuestion
            prompt="Une caisse a la forme d’un cube de 5 cm d’arête. Combien de petits cubes de 1 cm peut-on y ranger ?"
            expected={volumeCube(5)}
            parse={parseEntier}
            display={String(volumeCube(5))}
            suffix="cubes"
            requires={['carre-cube']}
            explain={`Un cube d’arête 5, c’est 5 × 5 × 5 = ${volumeCube(5)} petits cubes, ce qui s’écrit ${ecrirePuissance(5, 3)}.`}
            explainFor={(rep) => {
              if (rep === 15) return 'Tu as calculé 5 × 3. Le petit 3 ne se multiplie pas : il dit que le facteur 5 apparaît trois fois, soit 5 × 5 × 5 = 125.';
              if (rep === 25) return 'C’est l’aire d’une SEULE face (5 × 5 = 25). Un cube a de la profondeur : il faut empiler 5 couches de 25 cubes, soit 125.';
              return 'Un cube d’arête 5 : 5 × 5 × 5 = 125 petits cubes.';
            }}
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
        </div>
      ),
    },
    {
      num: 4,
      title: 'Carré ou cube ?',
      done: q4,
      content: (
        <div className="space-y-3">
          <TapQuestion
            prompt="Un carrelage carré compte 81 carreaux. Combien y en a-t-il sur un côté ?"
            options={['9', '81', '40', '27']}
            correct={0}
            cols={4}
            requires={['carre-cube']}
            explain={`On cherche le nombre qui, répété deux fois, donne 81 : 9 × 9 = 81, soit ${ecrirePuissance(9, 2)}. Il y a donc 9 carreaux par côté.`}
            explainWrong="La question demande le CÔTÉ, pas le total. Cherche le nombre qui, multiplié par lui-même, donne 81 : essaie 8 × 8 = 64, puis 9 × 9 = 81. C’est 9. (27 serait la réponse si 81 était un cube : 27 × 3.)"
            solved={q4}
            onAnswered={() => setQ4(true)}
          />
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="Le carré et le cube"
      moduleSubtitle="Deux mots qui viennent des figures"
      estimatedTime="10 min"
      brief={{
        tag: 'Découverte',
        title: 'Pourquoi « au carré » ?',
        tone: 'indigo',
        body: (
          <p>
            On dit « 5 au carré » et « 5 au cube », mais on ne dit pas « 5 au triangle ». Ces deux
            mots ne sont pas tombés du ciel : <strong>construis les figures</strong>, et tu verras
            exactement d’où ils viennent.
          </p>
        ),
      }}
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={3} />}
    />
  );
}
