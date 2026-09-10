import React, { useState, useMemo, useCallback } from 'react';
import { ContentModule, TapQuestion, PredictionChips, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import DeuxJeuxLab, { TableauDeLoi } from '../components/DeuxJeuxLab';
import {
  JEU_REGULIER, JEU_JACKPOT, JEU_ETIRABLE, JEUX, loiDuJeu, loiEtiree, esperanceDuJeu,
  CRANS_ETIREMENT, CRAN_DEFAUT, N_PARTIES, serieDeParties, sessionSeed, makeRng, euros, fr,
} from '../components/dispersionUtils';

/**
 * Module 1 — DÉCLENCHEUR, et l'interaction SIGNATURE : les deux jeux
 * (components/DeuxJeuxLab.jsx).
 *
 * Étape 1  lire les deux tableaux et calculer les deux moyennes à long terme :
 *          elles sont ÉGALES, à l'euro près et même au centième près.
 * Étape 2  simuler 200 parties de chacun, deux fois de suite : deux nuages, la
 *          MÊME ligne noire, des largeurs qui n'ont rien à voir.
 * Étape 3  la question qui compte : ces deux jeux se ressemblent-ils ?
 * Étape 4  ÉTIRER le jeu régulier au cliquet : le nuage s'écarte, la ligne noire
 *          ne bouge PAS d'un pixel. Donc un second nombre existe, qui change
 *          quand l'étirement change alors que le premier reste fixe. Le module
 *          se termine en DEMANDANT lequel.
 *
 * Rien ne s'appelle « variance », « écart type », « Bernoulli » ni
 * « binomiale » ici : le module se termine en DEMANDANT ce que les suivants
 * nommeront. « Dispersion » est un mot de 3e (lexique), déjà disponible, et il
 * est employé sans être une cible.
 *
 * CONNAISSANCES AVANT LA DEMANDE. L'ordre est geste → observation → brique →
 * demande :
 *   étape 2  simuler et voir les deux nuages → brique `meme-moyenne-pas-meme-jeu`
 *   étape 3  la question, désormais légitime
 *   étape 4  étirer et voir la ligne immobile → brique
 *            `dispersion-autour-de-la-moyenne`, puis la demande finale.
 *
 * L'ALÉA EST INJECTÉ. La graine est fixée UNE fois par montage (`sessionSeed`,
 * pilotable par `window.__SMARTER_RNG_SEED`) ; chaque simulation avance un
 * compteur, et les séries se recalculent de façon PURE à partir de (graine,
 * compteur). Un re-rendu ne change donc aucun nombre.
 *
 * MANIPULATION JAMAIS GELÉE. Le laboratoire reste pilotable une fois l'étape
 * validée : `disabled` ne porte que le verrou d'ANTÉRIORITÉ. Seuls les
 * `PredictionChips` se figent — une prédiction s'enregistre une fois.
 */
export default function Module01DeuxJeuxUneSeuleMoyenne() {
  const graine = useMemo(() => sessionSeed(), []);

  const [q1, setQ1] = useState(false);
  const [pred, setPred] = useState(null);
  const [series, setSeries] = useState(0);
  const [q3, setQ3] = useState(false);
  const [cran, setCran] = useState(CRAN_DEFAUT);
  const [cransVus, setCransVus] = useState([CRAN_DEFAUT]);
  const [q4, setQ4] = useState(false);

  const loiReg = loiDuJeu(JEU_REGULIER);
  const loiJack = loiDuJeu(JEU_JACKPOT);
  const esperance = esperanceDuJeu(JEU_REGULIER);   // 2 € — la même des deux côtés

  // Étape 2 — les deux séries, PURES : (graine, compteur) → séries.
  const sim = useMemo(() => {
    if (series === 0) return { reg: null, jack: null };
    return {
      reg: serieDeParties(loiReg, N_PARTIES, makeRng(graine + series * 104729)),
      jack: serieDeParties(loiJack, N_PARTIES, makeRng(graine + series * 104729 + 1)),
    };
  }, [series, graine, loiReg, loiJack]);

  // Étape 4 — le jeu étiré, et sa série au cran courant.
  const loiEtir = useMemo(() => loiEtiree(JEU_ETIRABLE, cran), [cran]);
  const simEtir = useMemo(
    () => serieDeParties(loiEtir, N_PARTIES, makeRng(graine + Math.round(cran * 400) + 7919)),
    [loiEtir, graine, cran],
  );

  const done2 = series >= 2;
  const done4 = cransVus.length >= 3 && q4;

  const simuler = useCallback((react) => {
    setSeries((s) => {
      const suivant = s + 1;
      if (suivant === 2) react?.(true);
      return suivant;
    });
  }, []);

  const changerCran = useCallback((k) => {
    setCran(k);
    setCransVus((vus) => (vus.includes(k) ? vus : [...vus, k]));
  }, []);

  const steps = [
    {
      num: 1,
      title: 'Deux stands, deux affiches',
      subtitle:
        'Voici les règles des deux jeux. Chacun coûte le même prix. Calcule ce que chacun rapporte en moyenne, à long terme.',
      done: q1,
      content: (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {JEUX.map((jeu) => (
              <div key={jeu.id} className="rounded-xl border-2 border-slate-200 bg-white p-3 space-y-2">
                <div className="font-bold text-slate-900">
                  <span aria-hidden="true">{jeu.emoji}</span> {jeu.nom}
                </div>
                <div className="text-[13px] text-slate-500">{jeu.resume}</div>
                <TableauDeLoi loi={loiDuJeu(jeu)} titre={`Loi du gain — ${jeu.nom}`} avecTotal={false} />
              </div>
            ))}
          </div>
          <TapQuestion
            prompt="Calcule les deux moyennes à long terme. Que constates-tu ?"
            options={[
              'Elles sont ÉGALES : 2 € pour l’un comme pour l’autre',
              'Le Jackpot rapporte plus : son gros lot est de 20 €',
              'Le Régulier rapporte plus : il paie à chaque partie',
              'On ne peut pas les comparer : les gains ne sont pas les mêmes',
            ]}
            correct={0}
            cols={1}
            requires={['esperance', 'tableau-de-loi', 'loi-de-probabilite']}
            explain="Le Régulier : 1 × 0,4 + 2 × 0,2 + 3 × 0,4 = 0,4 + 0,4 + 1,2 = 2 €. Le Jackpot : 0 × 0,9 + 20 × 0,1 = 2 €. Exactement le même nombre, obtenu de deux façons qui n’ont rien à voir."
            explainWrong="Refais les deux calculs en pesant CHAQUE gain par sa probabilité. Le lot de 20 € du Jackpot ne sort qu’une fois sur dix : il pèse 20 × 0,1 = 2. Et le Régulier, qui paie toujours, plafonne à 3 € : il pèse 0,4 + 0,4 + 1,2 = 2 aussi."
            solved={q1}
            onAnswered={() => setQ1(true)}
          />
          {q1 && (
            <Feedback tone="ok">
              <strong>{euros(esperance)}</strong> des deux côtés — le même nombre, au centime près.
              Un joueur qui ne regarderait que cette moyenne devrait donc jouer à pile ou face pour
              choisir son stand. Voyons si c’est raisonnable.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Deux cents parties de chaque',
      subtitle:
        'Lance la simulation : chaque partie jouée pose un point sur la piste de son jeu. Puis relance une seconde fois.',
      done: done2,
      content: (kit) => (
        <div className="space-y-3">
          <PredictionChips
            prompt="les deux nuages de points vont-ils se ressembler ?"
            options={[
              { id: 'pareils', label: 'Oui : même moyenne, donc même allure' },
              { id: 'differents', label: 'Non : ils seront très différents' },
              { id: 'centre', label: 'Ils seront tous les deux serrés autour de 2 €' },
            ]}
            value={pred}
            onChange={setPred}
            disabled={done2}
          />
          <DeuxJeuxLab
            jeux={[
              { jeu: JEU_REGULIER, loi: loiReg, serie: sim.reg },
              { jeu: JEU_JACKPOT, loi: loiJack, serie: sim.jack },
            ]}
            onSimuler={() => simuler(kit.react)}
            nbSeries={series}
            disabled={!q1}
          />
          {done2 ? (
            <>
              <Feedback tone="ok">
                {pred === 'differents' ? 'Ta prédiction tenait' : pred ? 'Ta prédiction ne tenait pas' : 'Regarde les deux pistes'} :
                la barre noire est <strong>au même endroit</strong> sur les deux pistes — c’est la
                moyenne à long terme, la même des deux côtés. Mais les points, eux, n’ont rien à
                voir : serrés entre {euros(1)} et {euros(3)} d’un côté, écrasés sur {euros(0)} avec
                quelques points isolés à {euros(20)} de l’autre. Relance : les nuages changent, le
                contraste, jamais.
              </Feedback>
              <KnowledgeBrick
                id="meme-moyenne-pas-meme-jeu"
                variant="new"
                lead={<>Ce que les deux pistes viennent de montrer, en une phrase. Relance en la lisant.</>}
              />
            </>
          ) : (
            <Feedback tone="info">
              Séries lancées : {series} sur 2. Il en faut deux pour vérifier que le contraste n’est
              pas un accident de tirage.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Un joueur peut-il choisir sur ce seul nombre ?',
      done: q3,
      content: (
        <div className="space-y-3">
          <div className="rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-700">
            Les deux jeux rapportent <strong>{euros(esperance)}</strong> par partie à long terme.
            Le Régulier paie entre {euros(1)} et {euros(3)} à chaque coup ; le Jackpot ne paie rien
            neuf fois sur dix.
          </div>
          <TapQuestion
            prompt="Que peut-on dire de ces deux jeux ?"
            options={[
              'Ils ont la même moyenne à long terme, mais un joueur les vivrait très différemment : un seul nombre ne suffit pas à les décrire',
              'Ils sont équivalents, puisqu’ils rapportent la même chose en moyenne',
              'Le calcul de la moyenne doit être faux, sinon les nuages se ressembleraient',
              'Le Jackpot est meilleur, parce qu’il peut rapporter 20 €',
            ]}
            correct={0}
            cols={1}
            requires={['meme-moyenne-pas-meme-jeu', 'esperance']}
            explain="Les deux calculs sont justes et donnent le même nombre — c’est exactement ce qui rend la situation intéressante. La moyenne à long terme dit où les résultats se rassemblent ; elle ne dit rien de leur étalement. Il manque donc une seconde information."
            explainWrong="Les deux calculs de l’étape 1 sont justes : refais-les, tu retrouveras 2 € des deux côtés. Et « pouvoir rapporter 20 € » ne suffit pas à départager : ce lot ne sort qu’une fois sur dix, et c’est déjà compté dans la moyenne. Ce qui distingue les deux jeux est ailleurs — regarde la LARGEUR des nuages."
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
        </div>
      ),
    },
    {
      num: 4,
      title: 'Écarte les gains, et surveille la barre noire',
      subtitle:
        'Les boutons − et + éloignent ou rapprochent chaque gain du Régulier par rapport à sa moyenne. Essaie au moins trois crans différents.',
      done: done4,
      content: (
        <div className="space-y-3">
          <DeuxJeuxLab
            jeux={[
              { jeu: JEU_ETIRABLE, loi: loiEtir, serie: simEtir },
              { jeu: JEU_JACKPOT, loi: loiJack, serie: sim.jack },
            ]}
            cranEtirement={cran}
            onChangerCran={changerCran}
            jeuEtireId={JEU_ETIRABLE.id}
            disabled={!q3}
          />
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
            Cran actuel : <strong>× {fr(cran)}</strong> — gains{' '}
            <span className="font-mono tabular-nums">{loiEtir.map((r) => euros(r.x)).join(' · ')}</span>.
            Moyenne à long terme :{' '}
            <strong className="font-mono tabular-nums">{euros(esperanceDuJeu(JEU_ETIRABLE))}</strong>.
            Crans essayés : {cransVus.length} sur 3.
          </div>
          {cransVus.length >= 3 && (
            <>
              <Feedback tone="ok">
                La barre noire <strong>n’a pas bougé d’un pixel</strong>, à aucun cran — la moyenne
                à long terme vaut toujours {euros(esperanceDuJeu(JEU_ETIRABLE))}. Le nuage, lui, se
                resserre et s’écarte à volonté. Il existe donc bien quelque chose qui change{' '}
                <em>pendant</em> que la moyenne reste fixe : c’est ce quelque chose qu’il faut
                savoir mesurer.
              </Feedback>
              <KnowledgeBrick
                id="dispersion-autour-de-la-moyenne"
                variant="new"
                lead={<>Ce que le cliquet fait varier, et que la moyenne ne voit pas. Rejoue les crans en la lisant.</>}
              />
              <TapQuestion
                prompt="Il manque donc un second nombre. Que devrait-il mesurer ?"
                options={[
                  'À quel point les gains s’écartent, en moyenne, de la moyenne à long terme',
                  'Le plus gros gain que le jeu puisse verser',
                  'La différence entre le plus gros et le plus petit gain',
                  'Le nombre de gains différents que le jeu propose',
                ]}
                correct={0}
                cols={1}
                requires={['meme-moyenne-pas-meme-jeu', 'dispersion-autour-de-la-moyenne', 'esperance']}
                explain="Il doit mesurer un ÉCART À LA MOYENNE, et le mesurer en tenant compte des probabilités — sinon un gain très rare compterait autant qu’un gain très fréquent. Reste à savoir comment fabriquer un tel nombre : c’est le module suivant."
                explainWrong="Le plus gros gain ne suffit pas : au cran × 0,25 le Régulier plafonne à 2,25 € et pourtant son nuage change à chaque cran. L’écart entre extrêmes ne suffit pas non plus : il ignore complètement les probabilités, si bien qu’un lot gagné une fois sur mille compterait autant qu’un gain systématique. Et le nombre de gains différents ne bouge jamais : il vaut 3 à tous les crans."
                solved={q4}
                onAnswered={() => setQ4(true)}
              />
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      moduleTitle="Deux jeux, une seule moyenne"
      moduleSubtitle="La même espérance, et pourtant rien à voir"
      estimatedTime="10 min"
      brief={{
        tag: 'Déclencheur',
        title: 'Lequel des deux stands ?',
        tone: 'indigo',
        body: (
          <p>
            Deux stands de fête foraine, deux règles très différentes, et exactement le même gain
            moyen à long terme. Un joueur doit choisir. Le nombre qu’il connaît suffit-il ?
          </p>
        ),
      }}
      steps={steps}
      footer={
        <KnowledgeSnapshot moduleNumber={1}>
          <strong>Il manque un nombre.</strong> Un nombre qui mesure l’écart à la moyenne, en
          tenant compte des probabilités — et qui distingue enfin les deux stands. Reste à le
          construire : module suivant.
        </KnowledgeSnapshot>
      }
    />
  );
}
