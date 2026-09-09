import React, { useState } from 'react';
import { Mountain } from 'lucide-react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import GraduationLab from '../components/GraduationLab';
import { ALTITUDES, ALTITUDES_VALEURS, graduationPour, fr } from '../components/reperage4e';

/**
 * Module 3 — MANIPULATION : la méthode, transposée.
 *
 * Activity              choisir la graduation pour des altitudes de randonnée,
 *                       mille fois plus grandes que les températures du M1.
 * Mathematical objective la MÉTHODE de choix ne dépend pas de l'ordre de
 *                       grandeur des données. Les trois défauts sont les
 *                       mêmes, repérés par le même calcul, à une autre échelle.
 * Student action        essayer les pas proposés (50 à 500 m).
 * Controlled variable   le pas de l'axe des altitudes.
 * Mathematical state    les huit altitudes ; verdicts calculés.
 * Visual consequence    les mêmes trois défauts, sur de tout autres nombres.
 * Expected observation  « je n'ai rien de nouveau à apprendre : je transpose ».
 * Misconception targeted croire que le choix d'une graduation est une recette
 *                       liée à des nombres particuliers, et non une méthode.
 *
 * POURQUOI CE MODULE EXISTE. Sans lui, un élève pourrait retenir « pour des
 * températures, on prend 0,5 » — une recette, pas une compétence. En changeant
 * l'ordre de grandeur d'un facteur mille tout en gardant la structure
 * intacte, le module force la généralisation. C'est ici, et pas au module 1,
 * que la MÉTHODE est nommée : on ne généralise pas à partir d'un seul cas.
 *
 * REJOUABLE : aucun `disabled` lié à l'avancement.
 */
const PAS_PROPOSES = [50, 100, 200, 500];
const PAS_DEPART = 500;

export default function Module03LePasQuOnSeDonne() {
  const [pasY, setPasY] = useState(PAS_DEPART);
  const [essayes, setEssayes] = useState([PAS_DEPART]);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);

  const etude = graduationPour(ALTITUDES_VALEURS, { budget: 26, pas: PAS_PROPOSES });

  const choisir = (p) => {
    setPasY(p);
    setEssayes((e) => (e.includes(p) ? e : [...e, p]));
  };

  const done1 = essayes.length >= 3 && pasY === 100;

  const lab = (
    <GraduationLab
      donnees={ALTITUDES.map((a) => ({ id: `a${a.km}`, x: a.km, y: a.m }))}
      pasX={2}
      pasProposes={PAS_PROPOSES}
      pasY={pasY}
      onPasY={choisir}
      budget={26}
      labelX="km"
      labelY="m"
      uniteY="m"
      ariaLabel="Choisir la graduation de l’axe des altitudes"
    />
  );

  const steps = [
    {
      num: 1,
      title: 'Le profil de la randonnée',
      subtitle: 'Huit relevés d’altitude, de −200 m à 1 200 m. Trouve la graduation qui convient.',
      done: done1,
      content: (
        <div className="space-y-3">
          <p className="text-sm text-slate-700">
            Ce ne sont plus des demi-degrés mais des centaines de mètres. Les nombres n’ont plus
            rien à voir — la question, elle, est exactement la même.
          </p>
          {lab}
          {!done1 && (
            <Feedback tone="info">
              {essayes.length} graduation{essayes.length > 1 ? 's' : ''} essayée
              {essayes.length > 1 ? 's' : ''}. Cherche celle qui garde les huit relevés
              distincts sans dépasser le budget de graduations.
            </Feedback>
          )}
          {done1 && (
            <Feedback tone="ok">
              100 m convient. Tu as refait exactement ce que tu avais fait avec les températures,
              sur des nombres mille fois plus grands.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Le même raisonnement',
      done: q2,
      content: (
        <div className="space-y-3">
          <div className="overflow-x-auto rounded-xl border-2 border-slate-200 bg-white p-3">
            <table className="w-full text-sm tabular-nums">
              <thead>
                <tr className="text-xs uppercase tracking-wide text-slate-400">
                  <th className="pb-1 text-left">pas</th>
                  <th className="pb-1 text-right">graduations</th>
                  <th className="pb-1 text-left ps-3">verdict</th>
                </tr>
              </thead>
              <tbody>
                {etude.candidats.map((c) => (
                  <tr key={c.pas} className="border-t border-slate-100">
                    <td className="py-1 font-mono font-bold text-slate-700">{fr(c.pas, 0)} m</td>
                    <td className="py-1 text-right font-mono text-slate-600">{c.graduations}</td>
                    <td className={`py-1 ps-3 text-sm font-semibold ${
                      c.ok ? 'text-emerald-700' : 'text-slate-600'
                    }`}>
                      {c.ok ? 'adaptée' : c.raison}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <TapQuestion
            prompt="Compare ce tableau à celui des températures. Qu’est-ce qui a changé ?"
            options={[
              'Seuls les nombres : les trois défauts et la façon de trancher sont identiques',
              'La méthode : on ne juge plus de la même façon',
              'Rien : ce sont les mêmes graduations',
              'Les défauts : il y en a d’autres avec de grands nombres',
            ]}
            correct={0}
            cols={1}
            requires={['trois-defauts', 'repere-choisi']}
            explain="Un pas trop fin donne trop de graduations, un pas trop gros confond des relevés — que l’on parle de demi-degrés ou de centaines de mètres. C’est ce qui fait de ce raisonnement une MÉTHODE, et non une recette."
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
          {q2 && (
            <KnowledgeBrick
              id="methode-graduation"
              variant="new"
              lead="Deux jeux de données très différents, une seule façon de faire : elle mérite d’être écrite."
            />
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Un troisième cas, sans repère sous les yeux',
      done: q3,
      content: (
        <div className="space-y-3">
          <p className="text-sm text-slate-700">
            Des durées de trajet, en minutes : 15 · 20 · 30 · 45 · 55 · 70. Tu dois choisir la
            graduation de l’axe, sans dépasser une vingtaine de traits.
          </p>
          <TapQuestion
            prompt="Quelle graduation choisir ?"
            options={[
              '5 min : 12 graduations, et chaque durée tombe sur un trait',
              '1 min : c’est le plus précis',
              '25 min : l’axe sera très court',
              '0,5 min : pour ne rien perdre du tout',
            ]}
            correct={0}
            cols={1}
            requires={['methode-graduation']}
            explain="De 15 à 70 par pas de 5 : 12 graduations, et les six durées, toutes multiples de 5, gardent chacune leur point. Avec 1 min il en faudrait 56 ; avec 25 min, 15 et 20 tomberaient toutes deux sur 25."
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
          {q3 && (
            <Feedback tone="ok">
              Tu sais maintenant régler un axe. Reste à savoir y POSER un point — et quand une
              graduation ne vaut pas 1, ce n’est pas si simple.
            </Feedback>
          )}
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="Le pas qu’on se donne"
      moduleSubtitle="Mille fois plus grand, exactement la même méthode"
      estimatedTime="6 min"
      brief={{
        tag: '🎬 Mission 03',
        title: 'Le profil de la randonnée',
        tone: 'indigo',
        body: (
          <>
            De −200 m sous le niveau de la mer à 1 200 m de col. Les nombres n’ont plus rien à
            voir avec des températures. <strong>La méthode change-t-elle ?</strong>
          </>
        ),
      }}
      intro={
        <div className="flex items-start gap-3 rounded-2xl border border-sky-100 bg-sky-50/60 p-3.5">
          <Mountain className="mt-0.5 h-5 w-5 shrink-0 text-sky-600" aria-hidden="true" />
          <p className="text-sm text-sky-900">
            Les pas proposés vont de 50 à 500 m. Cherche le plus grand qui ne perde aucun relevé :
            c’est le même critère qu’avec les températures.
          </p>
        </div>
      }
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={3} />}
    />
  );
}
