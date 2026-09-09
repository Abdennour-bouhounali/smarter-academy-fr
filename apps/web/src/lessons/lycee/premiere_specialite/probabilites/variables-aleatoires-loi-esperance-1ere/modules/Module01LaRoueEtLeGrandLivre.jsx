import React, { useState, useMemo, useCallback } from 'react';
import { ContentModule, TapQuestion, PredictionChips, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { makeRng } from '../../../../../common/stats';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import WheelLab from '../components/WheelLab';
import {
  GROS_LOT_DEFAUT, N_SIMULATION, loiDeLaRoue, esperanceDeLaRoue, grandLivre,
  sessionSeed, euros, gainsDeLaRoue,
} from '../components/roueUtils';

/**
 * Module 1 — DÉCLENCHEUR, et l'interaction SIGNATURE : la roue et le grand
 * livre (components/WheelLab.jsx).
 *
 * Étape 1  lancer UNE fois, plusieurs fois de suite : à chaque coup un montant
 *          différent, et rien ne permet de prévoir le suivant.
 * Étape 2  lancer 500 fois : le grand livre se remplit et la moyenne se pose.
 *          Relancer donne une autre série… et la ligne retombe au même endroit.
 * Étape 3  la question qui compte : ce montant, la roue le paie-t-elle ?
 * Étape 4  modifier le gros lot, tout relancer : la ligne se DÉPLACE — donc
 *          elle dépend du tableau des gains, et de lui seul. Le module se
 *          termine en DEMANDANT comment la calculer sans lancer.
 *
 * Rien ne s'appelle « variable aléatoire », « loi de probabilité » ni
 * « espérance » avant les modules 2 à 4 : le module se termine en DEMANDANT ce
 * que les suivants nommeront.
 *
 * CONNAISSANCES AVANT LA DEMANDE. L'ordre est geste → observation → brique →
 * demande :
 *   étape 2  lancer 500 fois et voir la ligne → brique `hasard-moyenne-previsible`
 *   étape 3  comparer la ligne aux gains → brique `moyenne-hors-des-valeurs`
 *   étape 4  la question, désormais légitime.
 *
 * L'ALÉA EST INJECTÉ. La graine est fixée UNE fois par montage
 * (`sessionSeed`, pilotable par `window.__SMARTER_RNG_SEED`) ; chaque lancer
 * avance un compteur, et la série se recalcule de façon PURE à partir de
 * (graine, compteur). Un re-rendu ne change donc aucun nombre.
 *
 * MANIPULATION JAMAIS GELÉE. Le laboratoire reste pilotable une fois l'étape
 * validée : `disabled` ne porte que le verrou d'ANTÉRIORITÉ. Seuls les
 * `PredictionChips` se figent — une prédiction s'enregistre une fois.
 */
export default function Module01LaRoueEtLeGrandLivre() {
  // La graine de la session : fixée une seule fois, jamais retirée au rendu.
  const graine = useMemo(() => sessionSeed(), []);

  const [pred, setPred] = useState(null);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);

  // Étape 1 — les lancers uniques. `compteur` sert de graine dérivée : la série
  // est PURE, un re-rendu ne retire rien.
  const [nbLancers, setNbLancers] = useState(0);
  const [grosLot1] = useState(GROS_LOT_DEFAUT);

  // Étapes 2 et 4 — les grandes séries.
  const [series, setSeries] = useState(0);       // combien de fois « 500 lancers »
  const [grosLot2, setGrosLot2] = useState(GROS_LOT_DEFAUT);
  const [lotsVus, setLotsVus] = useState([GROS_LOT_DEFAUT]);

  const loi1 = loiDeLaRoue(grosLot1);
  const loi2 = loiDeLaRoue(grosLot2);

  const dernierLancer = useMemo(() => {
    if (nbLancers === 0) return null;
    return grandLivre(loi1, 1, makeRng(graine + nbLancers * 7919)).tirages[0];
  }, [nbLancers, graine, loi1]);

  const livre = useMemo(() => {
    if (series === 0) return null;
    return grandLivre(loi2, N_SIMULATION, makeRng(graine + series * 104729 + grosLot2));
  }, [series, graine, grosLot2, loi2]);

  const done1 = nbLancers >= 3;
  const done2 = series >= 2;
  const done4 = lotsVus.length >= 2 && series >= 3;

  const lancerUn = useCallback((react) => {
    setNbLancers((n) => {
      const suivant = n + 1;
      if (suivant === 3) react?.(true);
      return suivant;
    });
  }, []);

  const lancer500 = useCallback((react, objectif) => {
    setSeries((s) => {
      const suivant = s + 1;
      if (objectif && suivant === objectif) react?.(true);
      return suivant;
    });
  }, []);

  // Changer le gros lot ET relancer : c'est le geste de l'étape 4.
  const changerLot = useCallback((v, react) => {
    setGrosLot2(v);
    setLotsVus((vus) => (vus.includes(v) ? vus : [...vus, v]));
    setSeries((s) => {
      const suivant = s + 1;
      if (suivant >= 3) react?.(true);
      return suivant;
    });
  }, []);

  const gains = gainsDeLaRoue(grosLot2);
  const esperance2 = esperanceDeLaRoue(grosLot2);

  const steps = [
    {
      num: 1,
      title: 'Un lancer, puis un autre',
      subtitle:
        'Lance la roue trois fois de suite. Avant chaque lancer, essaie d’annoncer ce que tu vas gagner.',
      done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <WheelLab
            grosLot={grosLot1}
            dernierLancer={dernierLancer}
            onLancerUn={() => lancerUn(kit.react)}
          />
          {done1 ? (
            <Feedback tone="ok">
              Trois lancers, trois montants qui ne se laissent pas annoncer. Un lancer isolé est
              <strong> imprévisible</strong> : c’est la définition même du hasard. La question
              n’est donc pas « que vais-je gagner », mais « combien cette roue rapporte-t-elle
              à la longue ».
            </Feedback>
          ) : (
            <Feedback tone="info">
              Lancers effectués : {nbLancers} sur 3. Continue — et vois si tu arrives à en
              annoncer un.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Cinq cents lancers d’un coup',
      subtitle:
        'Lance 500 fois. Le grand livre compte chaque résultat, et la ligne verte marque le total des gains partagé entre les 500 lancers. Puis relance une seconde série de 500.',
      done: done2,
      content: (kit) => (
        <div className="space-y-3">
          <PredictionChips
            prompt="sur 500 lancers, que va faire la ligne verte d’une série à l’autre ?"
            options={[
              { id: 'partout', label: 'Tomber n’importe où : c’est du hasard' },
              { id: 'stable', label: 'Retomber presque au même endroit' },
              { id: 'max', label: 'Se rapprocher du plus gros lot' },
            ]}
            value={pred}
            onChange={setPred}
            disabled={done2}
          />
          <WheelLab
            grosLot={grosLot2}
            livre={livre}
            onLancer500={() => lancer500(kit.react, 2)}
            disabled={!done1}
          />
          {done2 ? (
            <>
              <Feedback tone="ok">
                {pred === 'stable' ? 'Ta prédiction tenait' : pred ? 'Ta prédiction ne tenait pas' : 'Regarde la ligne verte'} :
                d’une série de 500 à l’autre, les résultats individuels changent tous, et pourtant
                la ligne verte revient presque au même endroit. Le hasard n’empêche pas de prévoir
                une <strong>moyenne</strong> — il empêche de prévoir <strong>un</strong> lancer.
              </Feedback>
              <KnowledgeBrick
                id="hasard-moyenne-previsible"
                variant="new"
                lead={<>Ce que les deux séries viennent de montrer, en une phrase. Relance en la lisant.</>}
              />
            </>
          ) : (
            <Feedback tone="info">
              Séries lancées : {series} sur 2. Il en faut deux pour comparer.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Ce montant, la roue le paie-t-elle ?',
      done: q3,
      content: (
        <div className="space-y-3">
          <div className="rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-700">
            La roue ne verse que trois montants : {gains.map((g) => euros(g)).join(', ')}. La ligne
            verte, elle, se pose aux alentours de <strong>{euros(esperance2)}</strong>.
          </div>
          <TapQuestion
            prompt="Un joueur peut-il repartir avec exactement le montant où se pose la ligne verte ?"
            options={[
              'Non : ce montant n’est écrit sur aucun secteur — c’est une moyenne, pas un gain',
              'Oui, s’il tombe sur le bon secteur',
              'Oui, mais seulement au bout de 500 lancers',
              'Non, parce que la roue est truquée',
            ]}
            correct={0}
            cols={1}
            requires={['hasard-moyenne-previsible', 'probabilite']}
            explain="Une moyenne n’a pas à figurer parmi les nombres qu’elle moyenne. C’est déjà vrai pour un sac de six boules numérotées de 1 à 6 : la moyenne des numéros tirés s’approche de 3,5, et aucune boule ne porte 3,5."
            explainWrong="Compare les deux lignes du haut : les montants versés par la roue et la position de la ligne verte. Aucun secteur ne porte ce montant-là, ni maintenant ni après 500 lancers. Et la roue n’est pas truquée : ses dix secteurs ont la même taille."
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
          {q3 && (
            <KnowledgeBrick
              id="moyenne-hors-des-valeurs"
              variant="new"
              lead={<>Le constat que tu viens de faire vaut bien au-delà de cette roue.</>}
            />
          )}
        </div>
      ),
    },
    {
      num: 4,
      title: 'Change le gros lot, et regarde la ligne',
      subtitle:
        'Monte ou baisse le gros lot avec les boutons − et + : une nouvelle série de 500 part aussitôt. Où va la ligne verte ?',
      done: done4,
      content: (kit) => (
        <div className="space-y-3">
          <WheelLab
            grosLot={grosLot2}
            onChangeGrosLot={(v) => changerLot(v, kit.react)}
            livre={livre}
            onLancer500={() => lancer500(kit.react, null)}
            disabled={!q3}
          />
          {done4 ? (
            <>
              <Feedback tone="ok">
                La ligne <strong>suit le gros lot</strong>. Elle n’est donc pas une propriété
                mystérieuse du hasard : elle dépend des montants inscrits sur la roue et du nombre
                de secteurs qui les portent — c’est-à-dire d’un simple tableau. Et si elle en
                dépend, on doit pouvoir la calculer <em>sans lancer une seule fois</em>.
              </Feedback>
              <TapQuestion
                prompt="Pour prévoir où la ligne se posera, de quoi a-t-on besoin ?"
                options={[
                  'Des montants inscrits sur la roue ET du nombre de secteurs qui portent chacun d’eux',
                  'Uniquement du plus gros montant inscrit',
                  'Uniquement du nombre de secteurs',
                  'De rien : il faut forcément lancer pour le savoir',
                ]}
                correct={0}
                cols={1}
                requires={['hasard-moyenne-previsible', 'moyenne-hors-des-valeurs', 'proportion-reference']}
                explain="Les deux à la fois. Un montant élevé porté par un seul secteur pèse moins qu’un petit montant porté par quatre : c’est le couple (montant, nombre de secteurs) qui décide. Reste à savoir comment les combiner — c’est ce que les modules suivants construisent."
                explainWrong="Le plus gros montant ne suffit pas : baisse-le d’un cran sans changer les secteurs, la ligne bouge un peu, pas énormément. Le nombre de secteurs seul ne suffit pas non plus : il y en a toujours dix. Et non, il n’est pas nécessaire de lancer : la ligne était prévisible AVANT la simulation."
                solved={q4}
                onAnswered={() => setQ4(true)}
              />
            </>
          ) : (
            <Feedback tone="info">
              Gros lots essayés : {lotsVus.length} sur 2. Change le montant avec − ou + : la série
              repart toute seule.
            </Feedback>
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
      moduleTitle="La roue et le grand livre"
      moduleSubtitle="Un lancer imprévisible, cinq cents lancers prévisibles"
      estimatedTime="10 min"
      brief={{
        tag: 'Déclencheur',
        title: 'Que rapporte cette roue ?',
        tone: 'indigo',
        body: (
          <p>
            Une roue de loterie ne dit jamais ce qu’elle va donner au prochain coup. Lance-la
            beaucoup, et vois si elle finit par dire quelque chose.
          </p>
        ),
      }}
      steps={steps}
      footer={
        <KnowledgeSnapshot moduleNumber={1}>
          <strong>Reste à le calculer.</strong> La ligne se prévoit à partir du tableau des
          montants et de leurs chances. Encore faut-il savoir écrire ce tableau, et savoir quoi en
          faire : modules suivants.
        </KnowledgeSnapshot>
      }
    />
  );
}
