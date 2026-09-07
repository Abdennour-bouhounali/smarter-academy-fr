import React, { useState } from 'react';
import { ContentModule, NumericQuestion, TapQuestion, PredictionChips, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import NumberLineLab from '../components/NumberLineLab';
import { fmt, fmtParen, oppose, soustraire, ecart, parseRelatif } from '../components/relatifs';

/**
 * Module 5 — MANIPULATION : soustraire, c'est faire le déplacement inverse.
 *
 * Le module ne DIT pas « soustraire, c'est ajouter l'opposé » : il le fait
 * CONSTATER. L'élève exécute les deux calculs a − b et a + (−b) sur la même
 * droite, voit les deux arcs se superposer, et c'est cette coïncidence — pas
 * une phrase — qui justifie la règle posée ensuite par la brique.
 *
 * Le cas qui surprend est traité en premier : retirer un NÉGATIF fait avancer
 * vers la droite. C'est le seul endroit où l'intuition « soustraire, ça
 * diminue » se casse, et le module l'organise plutôt que de l'éviter.
 *
 * Ce que ce module ne fait PAS : produit et quotient de relatifs (4e).
 */
const A = 1;
const B = -4;

export default function Module05SoustraireCestReculer() {
  const [pred1, setPred1] = useState(null);
  // Étape 1 — l'élève exécute les deux écritures et compare.
  const [vues, setVues] = useState(() => new Set());
  const done1 = vues.has('moins') && vues.has('plus');

  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);

  const resultat = soustraire(A, B);          // 1 − (−4) = 5
  const [affiche, setAffiche] = useState(null);

  const montrer = (quoi, react) => {
    setAffiche(quoi);
    const next = new Set(vues); next.add(quoi); setVues(next);
    if (!done1 && next.has('moins') && next.has('plus')) react?.(true);
  };

  const steps = [
    {
      num: 1,
      title: `Retirer un nombre négatif : que se passe-t-il ?`,
      subtitle: `Exécute les deux écritures et compare les flèches obtenues.`,
      done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <PredictionChips
            prompt={`Ton avis : ${fmt(A)} − ${fmtParen(B)} donne-t-il un résultat plus grand ou plus petit que ${fmt(A)} ?`}
            options={[
              { id: 'petit', label: 'Plus petit : on retire' },
              { id: 'grand', label: 'Plus grand' },
              { id: 'egal', label: `Égal à ${fmt(A)}` },
            ]}
            value={pred1}
            onChange={setPred1}
            disabled={done1}
          />
          <NumberLineLab
            min={-6} max={8}
            value={null}
            marks={[{ at: A, label: 'départ', color: '#4f46e5' }]}
            jump={affiche ? { from: A, to: resultat, label: affiche === 'moins' ? `− ${fmtParen(B)}` : `+ ${fmtParen(oppose(B))}` } : null}
            ariaLabel={`Droite graduée — départ ${fmt(A)}${affiche ? `, arrivée ${fmt(resultat)}` : ''}`}
          />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => montrer('moins', kit.react)}
              aria-pressed={affiche === 'moins'}
              className={`min-h-[44px] px-3 rounded-xl border-2 text-sm font-bold ${affiche === 'moins' ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-slate-300 bg-white text-slate-700 hover:border-purple-400'}`}
            >
              Exécuter {fmt(A)} − {fmtParen(B)}
            </button>
            <button
              type="button"
              onClick={() => montrer('plus', kit.react)}
              aria-pressed={affiche === 'plus'}
              className={`min-h-[44px] px-3 rounded-xl border-2 text-sm font-bold ${affiche === 'plus' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-300 bg-white text-slate-700 hover:border-emerald-400'}`}
            >
              Exécuter {fmt(A)} + {fmtParen(oppose(B))}
            </button>
          </div>
          {done1 ? (
            <Feedback tone="ok">
              {pred1 === 'grand' ? 'Ta prédiction était la bonne' : 'Voilà la surprise'} : les deux
              écritures produisent <strong>exactement la même flèche</strong> et la même arrivée,{' '}
              <strong>{fmt(resultat)}</strong>. Retirer {fmt(B)}, c’est défaire un déplacement « 4
              vers la gauche » — donc aller <strong>4 vers la droite</strong>. Retirer un négatif
              fait bien <em>augmenter</em>.
            </Feedback>
          ) : (
            <Feedback tone="info">
              {vues.size === 0
                ? 'Commence par exécuter la soustraction.'
                : 'Maintenant exécute l’autre écriture, et compare les deux flèches.'}
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'La règle que tu viens de constater',
      done: q2,
      content: (
        <div className="space-y-3">
          {/* Les deux arcs superposés viennent d'établir l'équivalence :
              la règle peut être écrite, puis appliquée. */}
          <KnowledgeBrick
            id="soustraction-oppose"
            variant="new"
            lead={<>Les deux flèches se sont superposées. Ce n’est pas un hasard : c’est vrai pour tous les nombres.</>}
          />
          <NumericQuestion
            prompt={`Combien fait ${fmt(-3)} − ${fmtParen(-8)} ?`}
            above={
              <NumberLineLab
                min={-8} max={8}
                value={null}
                marks={[{ at: -3, label: 'départ', color: '#e11d48' }]}
                ariaLabel="Droite graduée — départ sur −3"
              />
            }
            expected={soustraire(-3, -8)}
            parse={parseRelatif}
            display={fmt(soustraire(-3, -8))}
            requires={['soustraction-oppose', 'addition-deplacement']}
            explain={`Retirer ${fmt(-8)} revient à ajouter 8 : ${fmt(-3)} + 8 = ${fmt(soustraire(-3, -8))}. On part de la gauche du zéro et on avance de 8 graduations, ce qui suffit à passer de l’autre côté.`}
            explainFor={(n) => (n === -11
              ? <>Tu as reculé de 8. Mais on retire un nombre <strong>négatif</strong> : cela revient à ajouter son opposé, donc à avancer.</>
              : null)}
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
        </div>
      ),
    },
    {
      num: 3,
      title: 'Retirer un positif',
      done: q3,
      content: (
        <NumericQuestion
          prompt={`Combien fait 2 − ${fmtParen(9)} ?`}
          above={
            <NumberLineLab
              min={-10} max={6}
              value={null}
              marks={[{ at: 2, label: 'départ', color: '#4f46e5' }]}
              ariaLabel="Droite graduée — départ sur 2"
            />
          }
          expected={soustraire(2, 9)}
          parse={parseRelatif}
          display={fmt(soustraire(2, 9))}
          requires={['soustraction-oppose', 'addition-deplacement', 'droite-relatifs']}
          explain={`Retirer 9 revient à ajouter ${fmt(-9)} : on recule de 9 graduations depuis 2, on franchit le zéro, et on arrive sur ${fmt(soustraire(2, 9))}.`}
          explainFor={(n) => (n === 7
            ? <>Tu as calculé 9 − 2. L’ordre compte : on part <strong>de 2</strong> et on retire 9, donc on passe sous le zéro.</>
            : null)}
          solved={q3}
          onAnswered={() => setQ3(true)}
        />
      ),
    },
    {
      num: 4,
      title: 'L’écart entre deux nombres',
      done: q4,
      content: (
        <div className="space-y-3">
          <KnowledgeBrick
            id="ecart-deux-nombres"
            variant="new"
            lead={<>La soustraction sert aussi à mesurer : combien de graduations séparent deux nombres.</>}
          />
          <KnowledgeBrick
            id="mem-soustraire"
            variant="new"
            compact
            lead={<>Et la phrase à retenir de tout le module.</>}
          />
          <TapQuestion
            prompt={`Il fait ${fmt(-6)} °C à Briançon et ${fmt(2)} °C à Marseille. Quel est l’écart de température entre les deux villes ?`}
            above={
              <NumberLineLab
                min={-9} max={5}
                value={null}
                marks={[
                  { at: -6, label: 'Briançon', color: '#e11d48' },
                  { at: 2, label: 'Marseille', color: '#4f46e5' },
                ]}
                ariaLabel="Droite graduée — −6 °C et 2 °C"
              />
            }
            options={[`${ecart(-6, 2)} °C`, `${fmt(-8)} °C`, '4 °C', `${fmt(-4)} °C`]}
            correct={0}
            cols={2}
            requires={['ecart-deux-nombres', 'soustraction-oppose', 'distance-a-zero']}
            explain={`De ${fmt(-6)} à 2, on compte ${ecart(-6, 2)} graduations : 6 pour rejoindre le zéro, puis 2 encore. Un écart est une distance — il ne porte jamais de signe.`}
            explainWrong={`Un écart de température ne peut pas être négatif : c’est une distance entre deux repères. Et il ne suffit pas de retrancher les chiffres sans tenir compte du zéro qu’on franchit.`}
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
      navLinks={getNavLinks(5)}
      moduleNumber={5}
      moduleTitle="Soustraire, c’est reculer"
      moduleSubtitle="Et retirer un négatif fait avancer"
      estimatedTime="12 min"
      brief={{
        tag: 'Manipulation',
        title: 'Le déplacement inverse',
        tone: 'purple',
        body: (
          <p>
            « Soustraire, ça diminue » — c’est vrai avec les nombres positifs. Avec les relatifs,
            une surprise attend : retirer un nombre <strong>négatif</strong> fait{' '}
            <strong>augmenter</strong>. Vérifie-le toi-même.
          </p>
        ),
      }}
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={5} />}
    />
  );
}
