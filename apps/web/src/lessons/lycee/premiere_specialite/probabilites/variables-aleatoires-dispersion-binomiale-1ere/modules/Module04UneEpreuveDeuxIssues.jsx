import React, { useState, useMemo, useCallback } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, PredictionChips, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import ArbreRepete from '../components/ArbreRepete';
import {
  EPREUVE, N_PRELEVEES, loiDeBernoulli, parseSigned, fr,
  probabilitySum, binomialCoeff,
} from '../components/dispersionUtils';

/**
 * Module 4 — MANIPULATION : l'épreuve à deux issues, puis sa répétition (P3).
 *
 * Étape 1  UNE épreuve, deux issues : l'élève fixe lui-même ce qu'il appelle
 *          « succès », et constate que ce choix est une convention — pas un
 *          jugement de valeur. Un contrôle qualité appelle « succès » le fait
 *          qu'une ampoule soit défectueuse, parce que c'est ce qu'il compte.
 * Étape 2  LA RÉPÉTITION : l'élève déplie l'arbre épreuve après épreuve, de 1 à
 *          5 niveaux, et voit le nombre de chemins doubler à chaque fois. Il
 *          constate que plusieurs chemins donnent le même nombre de succès.
 * Étape 3  LES TROIS CONDITIONS, éprouvées sur des cas où l'une d'elles tombe.
 *
 * CONNAISSANCES AVANT LA DEMANDE : étape 1 le choix du succès posé →
 * brique `schema-bernoulli` ; étape 2 l'arbre déplié et les chemins comptés →
 * brique `compter-les-succes` ; étape 3 la demande.
 *
 * L'ID DE LA BRIQUE `schema-bernoulli` EST IMPOSÉ par le lexique d'audit :
 * « Bernoulli » n'est relié à sa brique que par l'égalité des identifiants.
 *
 * MANIPULATION JAMAIS GELÉE : l'arbre reste dépliable et repliable après
 * validation. `disabled` ne porte que le verrou d'ANTÉRIORITÉ.
 */
export default function Module04UneEpreuveDeuxIssues() {
  const [q1, setQ1] = useState(false);
  const [pred, setPred] = useState(null);
  const [niveaux, setNiveaux] = useState(1);
  const [niveauxVus, setNiveauxVus] = useState([1]);
  const [n2, setN2] = useState(false);
  const [q3, setQ3] = useState(false);

  const loiB = loiDeBernoulli();
  const p = EPREUVE.p;

  const done2 = niveauxVus.includes(N_PRELEVEES) && n2;

  const changerNiveaux = useCallback((v, react) => {
    setNiveaux(v);
    setNiveauxVus((vus) => (vus.includes(v) ? vus : [...vus, v]));
    if (v === N_PRELEVEES) react?.(true);
  }, []);

  // Le nombre de chemins à k succès, pour le niveau courant — DÉRIVÉ, jamais écrit.
  const cheminsParSucces = useMemo(
    () => Array.from({ length: niveaux + 1 }, (_, k) => binomialCoeff(niveaux, k)),
    [niveaux],
  );
  const totalChemins = 2 ** niveaux;

  const steps = [
    {
      num: 1,
      title: 'Une ampoule, deux issues',
      subtitle:
        'En fin de chaîne, on prend une ampoule au hasard. Elle est défectueuse dans 40 % des cas. C’est la situation la plus simple qui soit : deux issues, et rien d’autre.',
      done: q1,
      content: (
        <div className="space-y-3">
          <div className="rounded-xl border-2 border-emerald-200 bg-emerald-50/60 p-4 space-y-2 text-sm text-emerald-950">
            <p>
              <strong>L’épreuve :</strong> {EPREUVE.contexte}. Deux résultats possibles seulement —
              elle est <strong>{EPREUVE.succes}</strong> (probabilité {fr(p)}) ou{' '}
              <strong>{EPREUVE.echec}</strong> (probabilité {fr(1 - p)}).
            </p>
            <p className="text-emerald-800">
              Le service qualité compte les ampoules défectueuses. C’est donc « défectueuse » qu’il
              appelle le résultat à compter — et cela n’a rien d’une bonne nouvelle.
            </p>
          </div>
          <TapQuestion
            prompt="Un contrôleur qui compte les ampoules DÉFECTUEUSES appelle « succès » le fait qu’une ampoule le soit. Est-ce légitime ?"
            options={[
              'Oui : « succès » désigne simplement le résultat qu’on a choisi de compter, quel qu’il soit',
              'Non : un succès doit être un résultat favorable',
              'Non : il faudrait compter les ampoules conformes, et retrancher',
              'Oui, mais seulement parce que les deux probabilités sont différentes',
            ]}
            correct={0}
            cols={1}
            requires={['variable-aleatoire', 'loi-de-probabilite']}
            explain="« Succès » est une ÉTIQUETTE, pas un jugement. Ce qui compte est d’avoir choisi laquelle des deux issues on compte, et de ne plus en changer en cours de route : c’est elle qui portera la probabilité p."
            explainWrong="Rien n’oblige le résultat compté à être souhaitable : un épidémiologiste compte des malades, un contrôleur des défauts. On pourrait effectivement compter les conformes à la place — cela donnerait un autre décompte, tout aussi correct, avec p = 0,6. Ce qui serait faux, c’est de changer d’étiquette en cours de calcul."
            solved={q1}
            onAnswered={() => setQ1(true)}
          />
          {q1 && (
            <>
              <Feedback tone="ok">
                Deux issues, une probabilité p pour celle qu’on compte et 1 − p pour l’autre :{' '}
                {fr(p)} et {fr(1 - p)}, dont la somme vaut {fr(probabilitySum(loiB))} — il n’y a
                rien d’autre à envisager. Cette brique élémentaire porte un nom.
              </Feedback>
              <KnowledgeBrick
                id="schema-bernoulli"
                variant="new"
                lead={<>Le nom de cette brique élémentaire, et ce qui se passe quand on la répète.</>}
              />
            </>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Prélever cinq ampoules de suite',
      subtitle:
        'La chaîne produit en continu : prélever une ampoule ne change rien à la suivante. Déplie l’arbre épreuve par épreuve, jusqu’à cinq.',
      done: done2,
      content: (kit) => (
        <div className="space-y-3">
          <PredictionChips
            prompt="en passant de 4 à 5 prélèvements, le nombre de chemins de l’arbre va…"
            options={[
              { id: 'plus-un', label: 'augmenter de 1' },
              { id: 'double', label: 'être multiplié par 2' },
              { id: 'carre', label: 'être élevé au carré' },
            ]}
            value={pred}
            onChange={setPred}
            disabled={done2}
          />
          <ArbreRepete
            niveaux={niveaux}
            niveauxMax={N_PRELEVEES}
            p={p}
            labelSucces={EPREUVE.succes}
            labelEchec={EPREUVE.echec}
            onChangerNiveaux={(v) => changerNiveaux(v, kit.react)}
            disabled={!q1}
          />
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
            Avec <strong>{niveaux}</strong> prélèvement{niveaux > 1 ? 's' : ''} : l’arbre porte{' '}
            <strong className="font-mono tabular-nums">{totalChemins}</strong> chemin
            {totalChemins > 1 ? 's' : ''} en tout. Répartis par nombre de résultats comptés :{' '}
            <span className="font-mono tabular-nums">
              {cheminsParSucces.map((c, k) => `${k} → ${c}`).join(' · ')}
            </span>.
          </div>
          {niveauxVus.includes(N_PRELEVEES) && (
            <>
              <Feedback tone="ok">
                {pred === 'double' ? 'Ta prédiction tenait' : pred ? 'Ta prédiction ne tenait pas' : 'Regarde l’arbre'} :
                chaque épreuve ajoute deux branches à chaque extrémité, donc le nombre de chemins{' '}
                <strong>double</strong> à chaque niveau — 2, 4, 8, 16, puis 32. Mais regarde la
                dernière ligne : {cheminsParSucces.length} valeurs seulement, alors qu’il y a{' '}
                {totalChemins} chemins. Plusieurs chemins mènent au même décompte.
              </Feedback>
              <NumericQuestion
                prompt={<>Sur les 5 prélèvements, combien de chemins donnent exactement <strong>2</strong> ampoules défectueuses ?</>}
                expected={binomialCoeff(5, 2)}
                parse={parseSigned}
                display={fr(binomialCoeff(5, 2))}
                requires={['schema-bernoulli']}
                explain="10 chemins. Il y a 10 façons de choisir LESQUELLES des 5 ampoules sont défectueuses — et l’ordre dans lequel elles sortent ne change pas le décompte."
                explainFor={(n) =>
                  n === 2
                    ? 'Tu as donné le nombre d’ampoules défectueuses, pas le nombre de chemins qui y mènent. Compte dans l’arbre : « défectueuse en 1re et 2e », « en 1re et 3e », etc.'
                    : n === 32
                    ? 'C’est le nombre TOTAL de chemins, tous décomptes confondus. On ne veut que ceux qui portent exactement 2 défauts.'
                    : n === 5
                    ? 'Cinq est le nombre de chemins qui donnent exactement UN défaut (un par position). Pour deux défauts, il faut choisir deux positions parmi cinq : il y en a plus.'
                    : null
                }
                solved={n2}
                onAnswered={() => setN2(true)}
              />
              {n2 && (
                <KnowledgeBrick
                  id="compter-les-succes"
                  variant="new"
                  lead={<>Ce que la dernière ligne de l’arbre vient de montrer : l’ordre s’oublie.</>}
                />
              )}
            </>
          )}
          {!niveauxVus.includes(N_PRELEVEES) && (
            <Feedback tone="info">
              Déplie l’arbre jusqu’à <strong>{N_PRELEVEES}</strong> prélèvements avec le bouton +.
              Niveau actuel : {niveaux}.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Trois conditions, et il suffit qu’une tombe',
      done: q3,
      content: (
        <div className="space-y-3">
          <div className="rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-700">
            Ce qui rend l’arbre régulier — mêmes branches, mêmes poids, à tous les niveaux — tient
            à trois conditions : <strong>deux issues</strong> à chaque épreuve, un nombre{' '}
            <strong>fixé d’avance</strong> de répétitions, et des épreuves{' '}
            <strong>indépendantes</strong>.
          </div>
          <TapQuestion
            prompt="Dans laquelle de ces situations l’arbre cesserait-il d’avoir les mêmes poids à chaque niveau ?"
            options={[
              'On tire 4 boules SANS remise dans une urne de 10 : chaque tirage change la composition de l’urne',
              'On prélève 5 ampoules sur une chaîne qui en produit des milliers',
              'On lance 10 fois un dé équilibré en comptant les 6',
              'On interroge 20 personnes au hasard dans une très grande ville',
            ]}
            correct={0}
            cols={1}
            requires={['schema-bernoulli', 'produit-chemin', 'arbre-structure']}
            explain="Le tirage sans remise casse l’INDÉPENDANCE : après une première boule rouge sortie, il n’en reste plus que deux sur neuf, donc la deuxième branche ne porte plus le même poids. Les trois autres situations laissent les poids inchangés d’un niveau à l’autre."
            explainWrong="Regarde ce qui change ENTRE deux épreuves. Prélever une ampoule sur des milliers ne modifie rien à la chaîne ; un dé n’a pas de mémoire ; interroger une personne dans une grande ville ne change pas la ville. Mais retirer une boule d’une urne de dix modifie l’urne — et donc la probabilité du tirage suivant."
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(4)}
      moduleNumber={4}
      moduleTitle="Une épreuve, deux issues"
      moduleSubtitle="La brique élémentaire, et ce qui se passe quand on la répète"
      estimatedTime="12 min"
      brief={{
        tag: 'Atelier',
        title: 'Cinq ampoules d’affilée',
        tone: 'indigo',
        body: (
          <p>
            On quitte les stands de fête foraine pour une chaîne de production. Une seule question :
            que devient une expérience à deux issues quand on la répète cinq fois de suite ?
          </p>
        ),
      }}
      steps={steps}
      footer={
        <KnowledgeSnapshot moduleNumber={4}>
          <strong>L’arbre est régulier, et ses chemins se comptent.</strong> Reste à transformer ce
          comptage en probabilité — sans dessiner trente-deux chemins à chaque fois. Module suivant.
        </KnowledgeSnapshot>
      }
    />
  );
}
