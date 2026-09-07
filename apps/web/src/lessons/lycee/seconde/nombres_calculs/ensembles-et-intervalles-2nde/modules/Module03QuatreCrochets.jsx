import React, { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { Feedback } from '../../../../../common/components/LessonUI';
import RealLine from '../../../../../common/components/RealLine';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import IntervalBuilder from '../components/IntervalBuilder';
import BuildCheck from '../components/BuildCheck';
import { interval, notation, sameInterval, typeOf } from '../components/intervalUtils';

/**
 * Module 3 — DISCOVERY : « Quatre crochets ».
 *
 * Activity: lire un intervalle dessiné, en construire un à partir de son
 *   écriture, construire une demi-droite, décider si un nombre appartient.
 * Mathematical objective: nommer « intervalle », ses quatre types, et la
 *   borne infinie toujours ouverte — après le geste du module 1.
 * Student action: reconnaître une écriture ; régler bornes et crochets ;
 *   étendre vers +∞ ; trancher des appartenances.
 * Controlled variable: from, to, openFrom, openTo.
 * Mathematical state: l'intervalle construit (module) ; la cible (constante).
 * Visual consequence: bande et crochets ; à la révélation, la cible en vert.
 * Expected observation: un crochet vers le nombre l'inclut ; l'infini n'a
 *   jamais de crochet fermé ; 2,999 ∈ [−2 ; 3[ mais pas 3.
 * Misconception targeted: « ]2 ; 5] contient 2 », « [3 ; +∞] ».
 * Scaffolding: la notation en direct est CACHÉE pendant la construction,
 *   et révélée à la validation (sinon il n'y a rien à construire).
 */
const TARGET_2 = interval(-2, 3, true, false);  // ]−2 ; 3]
const TARGET_3 = interval(3, null);             // [3 ; +∞[

export default function Module03QuatreCrochets() {
  const [readDone, setReadDone] = useState(false);
  const [built2, setBuilt2] = useState(interval(-5, 5));
  const [ghost2, setGhost2] = useState(null);
  const [done2, setDone2] = useState(false);
  const [built3, setBuilt3] = useState(interval(-5, 5));
  const [ghost3, setGhost3] = useState(null);
  const [done3, setDone3] = useState(false);
  const [whyDone, setWhyDone] = useState(false);
  const [batchDone, setBatchDone] = useState(false);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="Quatre crochets"
      moduleSubtitle="Fermé, ouvert, semi-ouvert, et la demi-droite qui ne s’arrête jamais."
      estimatedTime="8 min"
      brief={{
        tag: '🔧 Mission 03',
        title: 'La plage du manège a un nom : un intervalle. Ses crochets ont quatre positions.',
        tone: 'indigo',
        body: <p>Lis-en un, construis-en deux, puis tranche : qui appartient, qui n’appartient pas ?</p>,
      }}
      steps={[
        {
          num: 1,
          title: 'Lire un intervalle',
          done: readDone,
          content: (
            <div className="space-y-3">
              <KnowledgeBrick
                id="intervalle"
                variant="new"
                establishes={['intervalle']}
                lead="La plage du manège, celle que tu as testée taille par taille, porte ce nom en mathématiques."
              />
              <TapQuestion
                prompt="Quelle écriture correspond à l’ensemble colorié ?"
                above={
                  <div className="rounded-2xl border-2 border-slate-200 bg-white p-2">
                    <RealLine min={-5} max={5} step={1} intervals={[{ id: 'I', from: -2, to: 3, tone: 'indigo' }]} ariaLabel="Intervalle de −2 à 3, les deux bornes incluses" />
                  </div>
                }
                options={['[−2 ; 3]', ']−2 ; 3[', '[−2 ; 3[', ']−2 ; 3]']}
                cols={2}
                correct={0}
                requires={['intervalle', 'mem-borne']}
                explain="Les deux crochets sont tournés vers l’intérieur : −2 et 3 appartiennent tous les deux. C’est un intervalle FERMÉ : tous les nombres de −2 à 3, bornes comprises."
                explainWrong="Regarde les crochets sur le dessin : ils sont tournés vers les nombres, donc −2 et 3 sont inclus. On écrit [−2 ; 3], intervalle fermé."
                solved={readDone}
                onAnswered={() => setReadDone(true)}
              />
              {readDone && (
                <KnowledgeBrick
                  id="types-intervalles"
                  variant="new"
                  lead="Deux crochets, deux décisions indépendantes : cela fait quatre écritures possibles, et chacune a son nom."
                />
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'Construis ]−2 ; 3]',
          subtitle: 'Règle les bornes, puis le sort de chacune.',
          done: done2,
          content: (
            <div className="space-y-3">
              <IntervalBuilder value={built2} onChange={setBuilt2} min={-5} max={5} step={1} showNotation={false} disabled={done2} ghost={ghost2} />
              <BuildCheck
                isRight={() => sameInterval(built2, TARGET_2)}
                current={() => notation(built2)}
                answer={notation(TARGET_2)}
                why="Crochet tourné vers l’extérieur en −2 : −2 est exclu. Crochet tourné vers 3 : 3 est inclus. C’est un intervalle semi-ouvert."
                hint={() => 'Compare crochet par crochet : à gauche, ]−2 exclut −2 ; à droite, 3] inclut 3.'}
                onDone={() => setDone2(true)}
                onReveal={() => setGhost2(TARGET_2)}
                solved={done2}
              />
            </div>
          ),
        },
        {
          num: 3,
          title: 'Tous les nombres au moins égaux à 3',
          subtitle: 'Construis l’ensemble des x tels que x ≥ 3. Une borne peut partir à l’infini.',
          done: done3 && whyDone,
          content: (
            <div className="space-y-3">
              <IntervalBuilder value={built3} onChange={setBuilt3} min={-5} max={8} step={1} showNotation={false} allowInfinite disabled={done3} ghost={ghost3} />
              <BuildCheck
                isRight={() => sameInterval(built3, TARGET_3)}
                current={() => notation(built3)}
                answer={notation(TARGET_3)}
                why="3 est inclus (« au moins 3 »), et il n’y a pas de plus grand nombre : la borne de droite est +∞, sans crochet fermé."
                hint={() => 'À droite, aucun nombre n’est trop grand : étends la borne vers +∞. À gauche, 3 doit être inclus.'}
                onDone={() => setDone3(true)}
                onReveal={() => setGhost3(TARGET_3)}
                solved={done3}
              />
              {done3 && (
                <KnowledgeBrick
                  id="demi-droite-infini"
                  variant="new"
                  lead="Tu viens d’étendre une borne sans jamais l’atteindre : c’est une demi-droite, et son crochet ne se ferme pas."
                />
              )}
              {done3 && (
                <TapQuestion
                  prompt="Pourquoi le crochet est-il toujours ouvert du côté de +∞ ?"
                  options={['Parce que +∞ n’est pas un nombre : on ne l’atteint jamais', 'Parce que les grands nombres ne comptent pas', 'C’est une convention sans raison']}
                  cols={1}
                  correct={0}
                  requires={['demi-droite-infini']}
                  explain="+∞ n’est pas un nombre de la droite, c’est une direction. Aucun nombre ne « vaut » +∞, donc la borne ne peut pas être incluse : [3 ; +∞[, jamais [3 ; +∞]."
                  explainWrong="Les grands nombres comptent tous ! Mais +∞ lui-même n’est pas un nombre : on ne peut pas l’inclure. D’où le crochet toujours ouvert en ±∞."
                  solved={whyDone}
                  onAnswered={() => setWhyDone(true)}
                />
              )}
            </div>
          ),
        },
        {
          num: 4,
          title: 'Appartient ou pas ?',
          done: batchDone,
          content: (
            <div className="space-y-3">
              <KnowledgeBrick
                id="methode-appartenance-intervalle"
                variant="new"
                compact
                lead="Avant de trancher quatre cas d’affilée, la marche à suivre — celle que tu as appliquée sans la nommer depuis le manège."
              />
              <BatchChoiceQuestion
                intro={<p className="text-sm text-slate-600">Pour chaque ligne, le nombre appartient-il à l’intervalle ?</p>}
                rows={[
                  { id: 'r1', label: '3 ∈ [−2 ; 3[ ?', options: ['oui', 'non'], correct: 1, correction: '3[ : la borne 3 est exclue.' },
                  { id: 'r2', label: '−2 ∈ [−2 ; 3[ ?', options: ['oui', 'non'], correct: 0, correction: '[−2 : la borne −2 est incluse.' },
                  { id: 'r3', label: '2,999 ∈ [−2 ; 3[ ?', options: ['oui', 'non'], correct: 0, correction: '2,999 < 3 : il est dedans, aussi près de 3 soit-il.' },
                  { id: 'r4', label: '5 ∈ ]−∞ ; 5] ?', options: ['oui', 'non'], correct: 0, correction: '5] : la borne 5 est incluse.' },
                ]}
                requires={['intervalle', 'vocab-appartenance', 'methode-appartenance-intervalle', 'demi-droite-infini']}
                feedback={({ allRight, nCorrect, total }) => (
                  <Feedback tone={allRight ? 'ok' : 'ko'}>
                    {allRight ? 'Quatre sur quatre : ' : `${nCorrect} / ${total}. `}Seule la borne se décide au crochet ; tout ce qui est strictement entre les bornes appartient, toujours.
                  </Feedback>
                )}
                solved={batchDone}
                onAnswered={() => setBatchDone(true)}
              />
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={3} />}
    />
  );
}
