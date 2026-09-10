import React, { useState } from 'react';
import { ContentModule, TapQuestion, PredictionChips } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import DoubleAxe from '../components/DoubleAxe';
import { valeurAffichee, parLaSomme, parLeProduit, fr } from '../components/reglesExpoUtils';

/**
 * Module 1 — DÉCLENCHEUR, et l'interaction SIGNATURE : les deux axes superposés
 * (components/DoubleAxe.jsx).
 *
 * Étape 1  EXPLORER. L'élève attrape les deux curseurs a et b et les fait
 *          glisser à sa guise. Les deux afficheurs — e^(a+b) et e^a × e^b —
 *          restent obstinément égaux, quoi qu'il fasse. C'est le geste, avant
 *          tout mot.
 * Étape 2  LES CIBLES. On lui DEMANDE d'amener a sur 1 et b sur 1 : l'occasion
 *          de lire une valeur remarquable, et de constater que la longueur du
 *          bas s'est composée de deux longueurs égales.
 * Étape 3  LE NÉGATIF. Un curseur passe du côté négatif, et la longueur du bas
 *          repart en ARRIÈRE : multiplier par cette valeur DIMINUE. Le produit
 *          devient une division.
 * Étape 4  la question qui compte : qu'est-ce que cette fonction fait, au
 *          juste ? — posée comme une QUESTION, jamais nommée.
 *
 * Rien ne porte le nom de « relation » ni de « règle » avant le module 2 : le
 * module se termine en DEMANDANT ce que le suivant énoncera (§6bis.1).
 *
 * CONNAISSANCES AVANT LA DEMANDE. Le module 1 ne pose AUCUNE brique : il
 * construit le phénomène, et les briques qui le disent sont posées au module 2,
 * quand l'énoncé arrive. Les questions n'exigent donc que des `priorKnowledge`.
 *
 * MANIPULATION JAMAIS GELÉE. Le laboratoire reste pilotable une fois l'étape
 * validée — c'est précisément là qu'on veut réessayer d'autres couples.
 * `verrouille` ne porte QUE le verrou d'ANTÉRIORITÉ d'une étape sur la
 * précédente.
 */
export default function Module01LaSommeDevientUnProduit() {
  // Étape 1 : exploration libre. L'objectif est d'avoir VU plusieurs couples.
  const [a1, setA1] = useState(0.5);
  const [b1, setB1] = useState(0.75);
  const [vus1, setVus1] = useState([]);

  // Étape 2 : les cibles a = 1 et b = 1.
  const [a2, setA2] = useState(0);
  const [b2, setB2] = useState(0);
  const [cible2, setCible2] = useState(false);

  // Étape 3 : le passage en négatif.
  const [a3, setA3] = useState(2);
  const [b3, setB3] = useState(0);
  const [vuNegatif, setVuNegatif] = useState(false);

  const [pred, setPred] = useState(null);
  const [q4, setQ4] = useState(false);

  // Trois couples DIFFÉRENTS explorés : un seul ne montrerait rien.
  const done1 = vus1.length >= 3;
  const done2 = cible2;
  const done3 = vuNegatif;

  const noter1 = (na, nb, react) => {
    const cle = `${na}|${nb}`;
    if (vus1.includes(cle)) return;
    const suivant = [...vus1, cle];
    setVus1(suivant);
    if (!done1 && suivant.length >= 3) react?.(true);
  };

  const changerA1 = (v, react) => { setA1(v); noter1(v, b1, react); };
  const changerB1 = (v, react) => { setB1(v); noter1(a1, v, react); };

  const viser2 = (na, nb, react) => {
    setA2(na);
    setB2(nb);
    if (!cible2 && na === 1 && nb === 1) {
      setCible2(true);
      react?.(true);
    }
  };

  const viser3 = (na, nb, react) => {
    setA3(na);
    setB3(nb);
    // On attend que l'UN des deux curseurs soit strictement négatif : c'est
    // l'état qui fait repartir la longueur du bas vers la gauche.
    if (!vuNegatif && (na < 0 || nb < 0)) {
      setVuNegatif(true);
      react?.(true);
    }
  };

  const steps = [
    {
      num: 1,
      title: 'Attrape les curseurs et promène-les',
      subtitle:
        'Deux axes, alignés l’un sous l’autre. En haut, deux curseurs à saisir : a et b. En bas, les valeurs qui leur correspondent. Fais-les bouger, et surveille les deux grands nombres.',
      done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <DoubleAxe
            a={a1}
            b={b1}
            onChangeA={(v) => changerA1(v, kit.react)}
            onChangeB={(v) => changerB1(v, kit.react)}
          />
          {done1 ? (
            <Feedback tone="ok">
              Tu as essayé plusieurs couples, et les deux grands nombres n’ont jamais divergé. Ce
              n’est pas un hasard d’arrondi : quel que soit le couple, additionner les exposants EN
              HAUT et multiplier les valeurs EN BAS donnent le même résultat. Retiens la
              disposition : en haut on ajoute, en bas on multiplie.
            </Feedback>
          ) : (
            <Feedback tone="info">
              Couples essayés : {vus1.length} sur 3. Fais glisser a, puis b, et compare à chaque
              fois le nombre de gauche et celui de droite.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Amène a sur 1 et b sur 1',
      subtitle:
        'Une position remarquable : les deux curseurs sur 1. Regarde alors où arrive la longueur composée en bas, et ce que valent les deux grands nombres.',
      done: done2,
      content: (kit) => (
        <div className="space-y-3">
          <DoubleAxe
            a={a2}
            b={b2}
            onChangeA={(v) => viser2(v, b2, kit.react)}
            onChangeB={(v) => viser2(a2, v, kit.react)}
            verrouille={!done1}
          />
          {done2 ? (
            <Feedback tone="ok">
              a = 1 et b = 1 : en haut, 1 + 1 = 2. En bas, la valeur de gauche est e ≈{' '}
              {valeurAffichee(Math.E)}, et la longueur composée arrive exactement sur e², c’est-à-dire{' '}
              {valeurAffichee(parLaSomme(1, 1))}. Autrement dit : e × e = e². La longueur qui
              représentait <em>une multiplication par e</em> a été posée deux fois — et deux
              multiplications par e, cela fait bien e².
            </Feedback>
          ) : (
            <Feedback tone="info">
              a vaut {fr(a2)}, b vaut {fr(b2)}. Amène-les tous les deux sur 1 — ils s’accrochent aux
              crans, donc 1 est atteignable exactement.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Et si un curseur passait du côté négatif ?',
      subtitle:
        'Laisse a du côté positif, et emmène b à gauche de 0. Regarde la longueur du bas : elle repart en arrière.',
      done: done3,
      content: (kit) => (
        <div className="space-y-3">
          <PredictionChips
            prompt="en emmenant b du côté négatif, que va faire le nombre de droite ?"
            options={[
              { id: 'negatif', label: 'Il deviendra négatif' },
              { id: 'diminue', label: 'Il restera positif, mais deviendra plus petit' },
              { id: 'inchange', label: 'Il ne changera pas' },
            ]}
            value={pred}
            onChange={setPred}
            disabled={done3}
          />
          <DoubleAxe
            a={a3}
            b={b3}
            onChangeA={(v) => viser3(v, b3, kit.react)}
            onChangeB={(v) => viser3(a3, v, kit.react)}
            verrouille={!done1}
          />
          {done3 ? (
            <>
              <Feedback tone="ok">
                {pred === 'diminue' ? 'Ta prédiction tenait' : pred ? 'Ta prédiction ne tenait pas' : 'Voilà ce qui se passe'} :
                un exposant négatif donne une valeur <strong>inférieure à 1</strong> — mais toujours
                strictement positive. Et multiplier par un nombre inférieur à 1, c’est{' '}
                <strong>diminuer</strong>. En bas, la longueur repart donc vers la gauche : le
                produit s’est comporté comme une division.
              </Feedback>
              <Feedback tone="info">
                Essaie a = 2 et b = −1 : la somme fait 1, et le nombre du bas revient exactement sur
                e ≈ {valeurAffichee(parLeProduit(2, -1))}. Partir de e², puis reculer d’une longueur,
                c’est diviser e² par e.
              </Feedback>
            </>
          ) : (
            <Feedback tone="info">
              b vaut {fr(b3)}. Continue de le tirer vers la gauche, jusqu’à passer sous 0.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 4,
      title: 'Qu’est-ce que cette fonction fait, au juste ?',
      done: q4,
      content: (
        <TapQuestion
          prompt="Sur l’axe du haut tu ADDITIONNES des exposants ; sur celui du bas, les valeurs se MULTIPLIENT — et les deux afficheurs ne se contredisent jamais. Comment décrire ce que cette fonction fait ?"
          options={[
            'Elle fait passer d’une addition à une multiplication : ce qui s’ajoute en haut se multiplie en bas',
            'Elle additionne les valeurs du bas comme celles du haut',
            'Elle ne fait rien de particulier : les deux nombres coïncident par hasard, à l’arrondi près',
            'Elle multiplie les exposants entre eux',
          ]}
          correct={0}
          cols={1}
          requires={['exponentielle', 'fonction', 'exposant']}
          explain="C’est exactement ce que tu as manipulé : deux mondes, et un traducteur entre eux. Additionner deux exposants revient à multiplier les deux valeurs correspondantes. Le module suivant écrit cette traduction en une ligne — et montre qu’elle ne sort pas de nulle part."
          explainWrong="Regarde à nouveau les deux afficheurs. Celui de gauche additionne les exposants PUIS applique la fonction ; celui de droite applique la fonction à chacun PUIS multiplie. Ils affichent le même nombre à tous les crans — ce n’est ni un hasard, ni un arrondi."
          solved={q4}
          onAnswered={() => setQ4(true)}
        />
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      moduleTitle="La somme qui devient un produit"
      moduleSubtitle="Deux axes superposés, et une traduction entre deux mondes"
      estimatedTime="10 min"
      brief={{
        tag: 'Déclencheur',
        title: 'En haut on ajoute, en bas on multiplie',
        tone: 'indigo',
        body: (
          <p>
            Deux axes alignés l’un sous l’autre. En haut, deux curseurs que tu peux{' '}
            <strong>attraper et faire glisser</strong>. En bas, les valeurs correspondantes. Promène
            les curseurs et surveille les deux grands nombres : ils ne se contrediront jamais.
          </p>
        ),
      }}
      steps={steps}
      footer={
        <KnowledgeSnapshot moduleNumber={1}>
          <strong>Une ligne suffit.</strong> Ce que les deux afficheurs répétaient sans jamais se
          contredire s’écrit en une seule égalité : module suivant.
        </KnowledgeSnapshot>
      }
    />
  );
}
