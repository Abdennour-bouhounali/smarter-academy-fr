import React, { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import PyLab from '../components/PyLab';

/**
 * Module 4 — écrire sa propre fonction (P8).
 *
 * L'élève ne complète pas un trou : il écrit le corps entier à partir de la
 * formule de conversion °F → °C. Le contrôle est fait sur la SORTIE (212 °F
 * = 100 °C, 32 °F = 0 °C), jamais sur le texte du code — plusieurs écritures
 * correctes existent.
 */
const START = `def celsius(f):
    return 0

print(celsius(212))
print(celsius(32))`;

const PRINT_VS_RETURN = `def double(x):
    print(2 * x)

resultat = double(5)
print(resultat)`;

export default function Module03EcrireSaFonction() {
  const [ok, setOk] = useState(false);
  const [ranPR, setRanPR] = useState(false);
  const [q3, setQ3] = useState(false);

  const steps = [
    {
      num: 1,
      title: 'De la formule au code',
      subtitle: 'Pour convertir des °F en °C : retirer 32, puis multiplier par 5/9. Écris le corps, puis exécute.',
      done: ok,
      content: (kit) => (
        <div className="space-y-3">
          <KnowledgeBrick
            id="methode-traduire-formule"
            variant="new"
            lead={<>Trois questions à se poser avant d’écrire une seule ligne.</>}
          />
          <Feedback tone="info">
            Objectif : <span className="font-mono">celsius(212)</span> doit afficher <strong>100</strong> et
            <span className="font-mono"> celsius(32)</span> doit afficher <strong>0</strong> — l’eau bout, l’eau gèle.
          </Feedback>
          <PyLab
            initial={START}
            label="Convertisseur °F → °C"
            onRun={({ output }) => {
              const good = output.length >= 2 && Number(output[0]) === 100 && Number(output[1]) === 0;
              if (good && !ok) { setOk(true); kit.react?.(true); }
            }}
          />
          {ok ? (
            <Feedback tone="ok">
              <strong>100</strong> et <strong>0</strong> : ta fonction est juste. Deux vérifications suffisaient,
              parce que tu connaissais d’avance leur résultat — c’est ainsi qu’on teste un programme.
            </Feedback>
          ) : (
            <Feedback tone="info">
              Remplace <span className="font-mono">return 0</span> par le calcul. Attention aux parenthèses :
              il faut retirer 32 <em>avant</em> de multiplier.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'print ou return ?',
      subtitle: 'Cette fonction affiche au lieu de renvoyer. Exécute et regarde la deuxième ligne de sortie.',
      done: ranPR,
      content: (kit) => (
        <div className="space-y-3">
          <PyLab
            initial={PRINT_VS_RETURN}
            label="La fonction qui affiche"
            onRun={({ output }) => { if (output.length >= 2 && !ranPR) { setRanPR(true); kit.react?.(true); } }}
          />
          {ranPR && (
            <>
              <Feedback tone="ok">
                <span className="font-mono">10</span> s’affiche bien, mais <span className="font-mono">resultat</span> vaut
                <strong> None</strong> : la valeur a été montrée à l’écran, jamais renvoyée. On ne peut donc
                pas la réutiliser dans un calcul.
              </Feedback>
              <KnowledgeBrick id="regle-return-vs-print" variant="new" />
            </>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Réutiliser un résultat',
      done: q3,
      content: () => (
        <TapQuestion
          prompt={<span>Une fonction <span className="font-mono">ttc(ht)</span> renvoie le prix TTC. Que vaut <span className="font-mono">2 * ttc(50)</span> si <span className="font-mono">ttc(50)</span> vaut 60 ?</span>}
          options={['120', '60', 'None', 'Une erreur : on ne multiplie pas une fonction']}
          correct={0} cols={2}
          requires={['regle-return-vs-print', 'appel-fonction']}
          explain="ttc(50) est remplacé par sa valeur renvoyée, 60, puis le calcul se poursuit : 2 × 60 = 120. C’est précisément ce que return autorise et que print interdirait."
          explainWrong="Un appel qui renvoie une valeur se comporte comme cette valeur : 2 * ttc(50) devient 2 * 60."
          solved={q3} onAnswered={() => setQ3(true)}
        />
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(4)}
      moduleNumber={4}
      moduleTitle="Écrire sa fonction"
      moduleSubtitle="De la formule mathématique au corps de la fonction"
      estimatedTime="11 min"
      brief={{
        tag: '✍️ Mission 04',
        title: 'Cette fois, le corps est vide. C’est toi qui l’écris.',
        tone: 'amber',
        body: <p>Une formule de conversion, deux résultats connus d’avance pour te vérifier. Aucun corrigé : c’est l’exécution qui tranche.</p>,
      }}
      steps={steps}
      footer={(
        <KnowledgeSnapshot moduleNumber={4}>
          Tu sais écrire une fonction. Reste à lire — et réparer — celles des autres.
        </KnowledgeSnapshot>
      )}
    />
  );
}
