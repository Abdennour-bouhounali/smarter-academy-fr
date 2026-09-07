import React, { useMemo, useState } from 'react';
import { ContentModule, TapQuestion, PredictionChips } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import FileSorter from '../components/FileSorter';
import { ELEVES, CLASSES, ACTIVITES } from '../data';

/**
 * Module 1 — DÉCLENCHEUR, et l'interaction SIGNATURE : ranger les fiches
 * (components/FileSorter.jsx).
 *
 * Step 1  LE GESTE D'ABORD (règle : le module s'ouvre sur la manipulation,
 *         jamais sur une question) : ranger les fiches une par une dans le
 *         tableau. Chaque clic incrémente une case et met à jour les marges.
 *         Le tableau n'est pas montré puis expliqué — il est FABRIQUÉ.
 * Step 2  ce que le rangement a résolu : le fichier brut, illisible, et ce
 *         qu'il aurait fallu faire sans tableau.
 * Step 3  la propriété qui saute aux yeux : le total tombe deux fois sur 60,
 *         parce que chaque fiche est allée dans une case et une seule.
 *
 * Aucun vocabulaire (« effectif marginal », « variable qualitative ») n'est
 * introduit ici : il arrive aux modules 2 et 3.
 */
const emptyCounts = () => Object.fromEntries(ACTIVITES.map((a) => [a, Object.fromEntries(CLASSES.map((c) => [c, 0]))]));

export default function Module01SoixanteFichesARanger() {
  const [index, setIndex] = useState(0);
  const [counts, setCounts] = useState(emptyCounts);
  const [wrong, setWrong] = useState(null);
  const [pred, setPred] = useState(null);
  const [q1, setQ1] = useState(false);
  const [q3, setQ3] = useState(false);

  const placed = useMemo(
    () => ACTIVITES.reduce((a, r) => a + CLASSES.reduce((b, c) => b + counts[r][c], 0), 0),
    [counts],
  );
  const done1 = q1;
  // On n'exige pas les 60 clics : dès qu'une douzaine de fiches sont rangées,
  // la mécanique est comprise et l'élève peut finir automatiquement.
  const done2 = index >= ELEVES.length;
  const done3 = q3;

  const place = (row, col, correct, react) => {
    const fiche = ELEVES[index];
    if (!fiche) return;
    if (!correct) { setWrong({ row, col }); react?.(false); return; }
    setWrong(null);
    setCounts((prev) => ({ ...prev, [row]: { ...prev[row], [col]: prev[row][col] + 1 } }));
    setIndex((i) => {
      const next = i + 1;
      if (next >= ELEVES.length) react?.(true);
      return next;
    });
  };

  const finishAll = (react) => {
    const next = emptyCounts();
    for (const e of ELEVES) next[e.activite][e.classe] += 1;
    setCounts(next);
    setIndex(ELEVES.length);
    setWrong(null);
    react?.(true);
  };

  const steps = [
    {
      num: 1,
      title: 'Range les fiches',
      subtitle: 'Clique la case où va chaque élève. Le tableau se construit sous tes yeux.',
      done: done2,
      content: (kit) => (
        <div className="space-y-3">
          <PredictionChips
            prompt="une fois toutes les fiches rangées, que vaudra la somme de toutes les cases ?"
            options={[
              { id: '60', label: '60, l’effectif total' },
              { id: 'plus', label: 'Plus de 60' },
              { id: 'moins', label: 'Moins de 60' },
            ]}
            value={pred} onChange={setPred} disabled={done2}
          />
          <FileSorter
            eleves={ELEVES} index={index} counts={counts}
            rowOrder={ACTIVITES} colOrder={CLASSES}
            rowKey="activite" colKey="classe"
            labels={{ activite: 'Activité', classe: 'Classe' }}
            onPlace={(r, c, ok) => place(r, c, ok, kit.react)}
            onFinishAll={() => finishAll(kit.react)}
            wrong={wrong}
          />
          {done2 ? (
            <Feedback tone="ok">
              {pred === '60' ? 'Ta prédiction tenait' : 'Regarde le total'} : la somme des douze cases vaut
              exactement <strong>60</strong>, l’effectif du club — parce que chaque fiche est allée dans
              <strong> une case et une seule</strong>. C’est la propriété fondamentale d’un tableau croisé :
              un comptage <strong>exhaustif</strong> (personne n’est oublié) et <strong>sans recouvrement</strong>
              (personne n’est compté deux fois).
            </Feedback>
          ) : (
            <Feedback tone="info">
              {wrong ? 'Cette case ne correspond pas aux deux caractères de la fiche — relis-la et réessaie. ' : ''}
              {placed} fiche{placed > 1 ? 's' : ''} rangée{placed > 1 ? 's' : ''} sur {ELEVES.length}.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Un fichier de soixante lignes',
      subtitle: 'Chaque élève du club est décrit par sa classe et son activité.',
      done: done1,
      content: (
        <div className="space-y-3">
          <div className="overflow-x-auto rounded-2xl border-2 border-slate-200 bg-slate-50 p-3">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-xs font-bold uppercase tracking-wide text-slate-400">
                  <th scope="col" className="px-3 py-1 text-left">Élève</th>
                  <th scope="col" className="px-3 py-1 text-left">Classe</th>
                  <th scope="col" className="px-3 py-1 text-left">Activité</th>
                </tr>
              </thead>
              <tbody>
                {ELEVES.slice(0, 8).map((e) => (
                  <tr key={e.id} className="border-t border-slate-200">
                    <td className="px-3 py-1 font-semibold text-slate-700">{e.prenom}</td>
                    <td className="px-3 py-1 text-slate-600">{e.classe}</td>
                    <td className="px-3 py-1 text-slate-600">{e.activite}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-xs text-slate-500 mt-2">… et 52 autres lignes.</p>
          </div>
          <TapQuestion
            prompt="Sans le tableau que tu viens de remplir, comment aurait-il fallu répondre à « combien d’élèves de 2de A font du judo ? »"
            options={[
              'Parcourir les 60 lignes et compter celles qui vérifient les deux conditions',
              'Lire directement la réponse dans le fichier',
              'Additionner le nombre d’élèves de 2de A et le nombre de judokas',
              'C’est impossible à savoir',
            ]}
            correct={0} cols={1}
            explain="Le fichier contient l’information, mais ne la présente pas : il faut compter. Et additionner « 2de A » et « judo » compterait plusieurs fois les mêmes élèves — ceux qui vérifient les deux."
            explainWrong="Un fichier de données individuelles liste les élèves un par un ; il ne totalise rien. Additionner les deux effectifs compterait deux fois les élèves de 2de A qui font du judo."
            solved={done1} onAnswered={() => setQ1(true)}
          />
        </div>
      ),
    },
    {
      num: 3,
      title: 'Ce que le tableau permet',
      done: done3,
      content: (
        <TapQuestion
          prompt="Grâce au tableau, combien d’élèves de 2de A font du judo — et pourquoi est-ce immédiat maintenant ?"
          options={[
            '6 : c’est la case qui croise la ligne « judo » et la colonne « 2de A »',
            '15 : le total de la ligne judo',
            '14 : le total de la colonne 2de A',
            '29 : la somme des deux totaux',
          ]}
          correct={0} cols={1}
          explain="La case à l’intersection donne directement l’effectif qui vérifie les DEUX caractères : 6 élèves. Le total de ligne (15 judokas) et celui de colonne (14 élèves de 2de A) répondent à d’autres questions ; leur somme (29) ne correspond à aucun groupe, car elle compte deux fois les 6 élèves de la case."
          explainWrong="Les totaux de ligne et de colonne portent sur UN seul caractère. C’est la case d’intersection qui croise les deux : 6 élèves."
          solved={done3} onAnswered={() => setQ3(true)}
        />
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX} navLinks={getNavLinks(1)} moduleNumber={1}
      moduleTitle="Soixante fiches à ranger" moduleSubtitle="Construire le tableau soi-même" estimatedTime="13 min"
      brief={{
        tag: 'Déclencheur', title: 'Une case, et une seule', tone: 'indigo',
        body: <p>Soixante élèves du club, chacun avec une classe et une activité. Le fichier contient tout, mais ne répond à rien. Tu vas ranger les fiches et voir apparaître un outil qui répond d’un coup d’œil.</p>,
      }}
      steps={steps}
      footer={(
        <KnowledgeSnapshot moduleNumber={1}>
          <strong>Les mots justes.</strong> Cette figure s’appelle un <strong>tableau croisé d’effectifs</strong>.
          Module suivant : quel genre de caractères peut-on croiser ainsi — et une distinction qui change l’ordre des colonnes.
        </KnowledgeSnapshot>
      )}
    />
  );
}
