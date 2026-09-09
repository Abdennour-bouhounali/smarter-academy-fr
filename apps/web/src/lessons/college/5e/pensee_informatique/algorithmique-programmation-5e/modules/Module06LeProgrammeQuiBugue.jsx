import React, { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import TraceLab from '../components/TraceLab';
import TraceCanvas from '../components/TraceCanvas';
import {
  avancer, tourner, makeRepeat, executer, polygone, angleExterieur,
  estFermee, cadre, premiereDifference,
} from '../components/trace';

/**
 * Module 6 — FORMALISATION : réparer, en comparant l'attendu et l'obtenu.
 *
 * Le brief demande une étape « modification » explicite. Elle est ici, et elle
 * n'est pas décorative : l'élève RÈGLE le paramètre fautif et voit la figure se
 * refermer sous sa main. Aucun bouton « Vérifier » entre le geste et sa
 * conséquence.
 *
 * LA MÉTHODE, PAS LA DEVINETTE. L'écart entre le tracé attendu et le tracé
 * obtenu est CALCULÉ par le moteur (`premiereDifference`), et l'instruction
 * fautive est désignée par ce calcul — jamais coloriée d'avance. C'est ce qui
 * rend la méthode transférable : elle marche aussi sur un programme dont on ne
 * connaît pas la réponse.
 *
 * ACTION → CHANGE → OBSERVATION → SENS :
 *   ACTION       régler l'angle du programme cassé ;
 *   CHANGE       la figure se déforme puis se referme ;
 *   OBSERVATION  une seule valeur referme — celle que 360 ÷ n prédit ;
 *   SENS         un bug n'est pas une fatalité : c'est un écart mesurable
 *                entre ce qu'on attendait et ce qui s'est produit.
 *
 * Expected observation : « le programme n'était pas “faux partout” — une seule
 * instruction l'était, et je peux dire laquelle ».
 * Misconception targeted : croire qu'un programme qui bugue doit être réécrit
 * en entier, ou relu au hasard jusqu'à ce que « ça marche ».
 */

/* Le bug n°1 : un pentagone dont l'angle est resté à 90° (l'erreur de celui qui
   a copié le programme du carré). */
const PENTAGONE_CASSE = (angle) => [makeRepeat(5, [avancer(60), tourner(angle)])];
const PENTAGONE_ATTENDU = polygone(5, 60);

export default function Module06LeProgrammeQuiBugue() {
  const [angle, setAngle] = useState(90);
  const repare = angle === angleExterieur(5);
  const [vuRepare, setVuRepare] = useState(false);
  const [q2, setQ2] = useState(false);

  // L'instruction fautive est DÉSIGNÉE PAR LE MOTEUR, pas écrite à la main.
  const ecart = premiereDifference(
    executer(PENTAGONE_ATTENDU),
    executer(PENTAGONE_CASSE(90))
  );

  const majAngle = (_, v) => {
    setAngle(v);
    if (v === angleExterieur(5)) setVuRepare(true);
  };

  // Les deux tracés de l'étape 1 partagent un cadre commun : sans cela, la
  // figure ouverte et la figure fermée seraient mises à des échelles
  // différentes, et la comparaison mentirait.
  const cadreCommun = (() => {
    const a = cadre(executer(PENTAGONE_ATTENDU));
    const b = cadre(executer(PENTAGONE_CASSE(90)));
    const minX = Math.min(a.minX, b.minX); const maxX = Math.max(a.maxX, b.maxX);
    const minY = Math.min(a.minY, b.minY); const maxY = Math.max(a.maxY, b.maxY);
    return { minX, maxX, minY, maxY, largeur: maxX - minX, hauteur: maxY - minY };
  })();

  const steps = [
    {
      num: 1,
      title: 'Le pentagone qui ne se ferme pas',
      subtitle: 'Voici ce qu’on voulait, et ce qu’on a obtenu. Compare, puis répare.',
      done: vuRepare,
      content: (kit) => (
        <div className="space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <p className="text-center text-xs font-bold uppercase tracking-wide text-emerald-700">
                Ce qu’on voulait
              </p>
              <TraceCanvas
                resultat={executer(PENTAGONE_ATTENDU)}
                cadreImpose={cadreCommun}
                hauteur={190}
                montrerStylo={false}
                titre="le pentagone attendu"
              />
            </div>
            <div className="space-y-1.5">
              <p className="text-center text-xs font-bold uppercase tracking-wide text-rose-700">
                Ce que le programme a tracé
              </p>
              <TraceCanvas
                resultat={executer(PENTAGONE_CASSE(90))}
                cadreImpose={cadreCommun}
                hauteur={190}
                montrerStylo={false}
                titre="le tracé obtenu, ouvert"
              />
            </div>
          </div>
          <Feedback tone="info">
            Les deux tracés partent ensemble et se séparent à la{' '}
            <strong>{ecart + 1}ᵉ instruction exécutée</strong> — le premier virage. Tout ce qui
            précède est juste : inutile de le relire. Règle l’angle jusqu’à refermer la figure.
          </Feedback>
          <TraceLab
            programme={PENTAGONE_CASSE(angle)}
            env={{ angle }}
            entrees={[{ nom: 'angle', label: 'angle du virage', min: 30, max: 120, pas: 1, unite: '°' }]}
            onEnv={(n, v) => { const avant = repare; majAngle(n, v); if (!avant && v === angleExterieur(5)) kit.react(true); }}
            autoExecuter
            hauteur={240}
            titreProgramme="Le programme à réparer"
            bilan={(r) => (
              <div
                className={`rounded-xl border-2 px-3 py-2.5 text-sm ${
                  estFermee(r) ? 'border-emerald-300 bg-emerald-50 text-emerald-900' : 'border-amber-300 bg-amber-50 text-amber-900'
                }`}
              >
                {estFermee(r) ? (
                  <>
                    <strong>Réparé.</strong> 5 × {angle} = {5 * angle} : le tour complet est fait, la
                    figure se referme.
                  </>
                ) : (
                  <>
                    Encore ouverte : 5 × {angle} = {5 * angle}, et il faut{' '}
                    <strong>360</strong>.
                  </>
                )}
              </div>
            )}
          />
          {vuRepare && (
            <Feedback tone="ok">
              <strong>72°</strong>, et non 90°. Celui qui a écrit ce programme avait copié celui du
              carré sans recalculer l’angle : 360 ÷ 5 = 72, pas 90.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Où se trouve l’erreur ?',
      subtitle: 'La question à se poser devant n’importe quel programme qui bugue.',
      done: q2,
      content: (
        <div className="space-y-3">
          <TapQuestion
            prompt="Un programme trace une figure fausse. Par où commencer pour trouver l’erreur ?"
            options={[
              'Exécuter pas à pas et repérer la PREMIÈRE instruction où le tracé s’écarte de ce qu’on attendait',
              'Réécrire tout le programme depuis le début',
              'Changer les nombres au hasard jusqu’à ce que la figure soit correcte',
              'Regarder la dernière instruction, puisque c’est là que le dessin finit mal',
            ]}
            correct={0}
            cols={1}
            requires={['prevoir-executer']}
            explain="Tout ce qui précède le premier écart a produit exactement le résultat attendu : ces instructions sont justes. L’erreur est à l’endroit précis où les deux tracés se séparent."
            explainWrong="Réécrire ou tâtonner peut marcher sur sept instructions, jamais sur un long programme — et n’apprend rien sur la cause. Quant à la dernière instruction : le dessin finit mal parce qu’il a mal commencé quelque part, souvent bien avant la fin."
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
          {q2 && (
            <KnowledgeBrick
              id="deboguer"
              variant="new"
              lead={<>Tu viens de l’appliquer sur le pentagone : la méthode a un nom et quatre étapes.</>}
            />
          )}
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(6)}
      moduleNumber={6}
      moduleTitle="Le programme qui bugue"
      moduleSubtitle="Un bug n’est pas un mystère : c’est un écart qu’on peut situer"
      estimatedTime="6 min"
      brief={{
        tag: 'Formalisation',
        title: 'La figure attendue n’arrive pas',
        tone: 'indigo',
        body: (
          <p>
            Un programme ne fait jamais « n’importe quoi » : il fait exactement ce qui est écrit.
            Quand le dessin est faux, c’est qu’une instruction précise ne dit pas ce qu’on croyait —
            et il existe une méthode pour la trouver du premier coup.
          </p>
        ),
      }}
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={6} />}
    />
  );
}
