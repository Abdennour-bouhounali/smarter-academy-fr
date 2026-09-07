import React, { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import SignProbe from '../components/SignProbe';
import PredictionChips from '../components/PredictionChips';
import { TEMP, TEMP_RANGE, CUBIC, CUBIC_RANGE, signAt } from '../components/signeUtils';

/**
 * Module 1 — DÉCLENCHEUR, et l'interaction SIGNATURE : la sonde qui peint
 * l'axe (components/SignProbe.jsx pour le bloc d'activité).
 *
 * Step 1  la journée d'hiver : balayer 0 h → 24 h ; l'axe se peint ; trouver
 *         les deux heures où T = 0 ; « quand gèle-t-il ? ».
 * Step 2  une courbe qui traverse trois fois : trouver les trois zéros ;
 *         l'alternance − + − +.
 * Step 3  entre deux zéros, le signe ne change pas.  Step 4  f(x) > 0 ⟺ au-dessus.
 * Rien n'est appelé « tableau de signes » avant le module 2.
 *
 * CONNAISSANCES AVANT LA DEMANDE (docs/architecture/KNOWLEDGE_DEPENDENCY.md).
 *   Les quatre connaissances du module ne vivaient que dans les `Feedback` de
 *   fin d'étape et dans l'« À retenir » du pied : rien n'était posé en
 *   position d'enseignement, et les questions des étapes 3 et 4 exigeaient
 *   « signe de f(x) », « zéro » et le mot « fonction » lui-même sans qu'aucun
 *   n'ait été établi. L'ordre est maintenant geste → brique → demande :
 *     étape 1  balayer la journée, voir l'axe se peindre → brique
 *              `signe-position-courbe`
 *     étape 2  trouver les trois traversées → briques `zero-fonction` puis
 *              `regle-signe-constant-entre-zeros`
 *     étape 3  la question sur le signe constant, désormais légitime
 *     étape 4  brique `mem-au-dessus-en-dessous` avant la question qui la teste
 *
 * MANIPULATION JAMAIS GELÉE. Les deux sondes restaient `disabled` une fois
 * l'étape réussie : l'élève ne pouvait plus rebalayer la courbe qu'il venait
 * de comprendre. Elles restent vivantes ; seul le verrou d'ANTÉRIORITÉ
 * (`!done1`) demeure à l'étape 2, parce qu'une étape garde son ordre. Les
 * `PredictionChips`, eux, se figent toujours : une prédiction s'enregistre
 * une fois, avant la révélation.
 */
const TEMP_PROBE = { f: TEMP, range: TEMP_RANGE, unit: 15, unitY: 14, xStep: 1, yStep: 2, axisLabels: { x: 't', y: 'T' }, xUnit: ' h', yUnit: ' °C', labelEvery: 2 };
const CUBIC_PROBE = { f: CUBIC, range: CUBIC_RANGE, unit: 40, unitY: 18, xStep: 1, yStep: 1, axisLabels: { x: 'x', y: 'y' }, labelEvery: 2 };

export default function Module01AuDessusOuEnDessous() {
  const [t, setT] = useState(12);
  const [visT, setVisT] = useState([12]);
  const [pred, setPred] = useState(null);
  const [x, setX] = useState(0);
  const [visX, setVisX] = useState([0]);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);
  const zonesT = ['−', '+', '−'];
  const coveredT = visT.some((v) => v < 6) && visT.some((v) => v > 6 && v < 18) && visT.some((v) => v > 18);
  const done1 = coveredT && visT.includes(6) && visT.includes(18);
  const done2 = [-3, 1, 4].every((z) => visX.includes(z));

  const moveT = (v, react) => { setT(v); if (visT.includes(v)) return; const n = [...visT, v]; setVisT(n); const cov = n.some((a) => a < 6) && n.some((a) => a > 6 && a < 18) && n.some((a) => a > 18); if (!done1 && cov && n.includes(6) && n.includes(18)) react?.(true); };
  const moveX = (v, react) => { setX(v); if (visX.includes(v)) return; const n = [...visX, v]; setVisX(n); if (!done2 && [-3, 1, 4].every((z) => n.includes(z))) react?.(true); };

  const steps = [
    {
      num: 1, title: 'Une journée d’hiver', subtitle: 'La courbe donne la température T selon l’heure t. Balaye toute la journée avec la sonde : l’axe se peint sous elle. Trouve les deux heures où T = 0.', done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <PredictionChips prompt="combien de fois la température passe-t-elle par 0 °C dans la journée ?" options={[{ id: '1', label: 'Une fois' }, { id: '2', label: 'Deux fois' }, { id: '0', label: 'Jamais' }]} value={pred} onChange={setPred} disabled={done1} />
          <SignProbe {...TEMP_PROBE} value={t} visited={visT} onChange={(v) => moveT(v, kit.react)} />
          {done1 ? (
            <>
              <Feedback tone="ok">
                {pred === '2' ? 'Ta prédiction tenait' : pred ? 'Ta prédiction ne tenait pas' : 'Regarde l’axe'} : à <strong>6 h</strong> et à <strong>18 h</strong>, T = 0 — la courbe <strong>traverse</strong> l’axe. Entre les deux, l’axe est vert : T &gt; 0, la courbe est au-dessus. Avant 6 h et après 18 h, rose : T &lt; 0, la courbe est en dessous — il gèle. Le signe de T(t) se lit sur la position de la courbe.
              </Feedback>
              <KnowledgeBrick
                id="signe-position-courbe"
                variant="new"
                lead={<>La couleur que ta sonde vient de peindre a un nom : c’est le <strong>signe</strong> de la fonction T en cette heure-là. Repasse la sonde sur la journée en lisant les trois cas.</>}
              />
            </>
          ) : (
            <Feedback tone="info">{!coveredT ? 'Balaye : le matin, la journée, le soir.' : 'Il reste à trouver les deux heures exactes où la courbe touche l’axe (T = 0).'}</Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2, title: 'Une courbe qui traverse trois fois', subtitle: 'Nouvelle courbe. Balaye-la et trouve les trois abscisses où f(x) = 0.', done: done2,
      content: (kit) => (
        <div className="space-y-3">
          <SignProbe {...CUBIC_PROBE} value={x} visited={visX} onChange={(v) => moveX(v, kit.react)} disabled={!done1} />
          {done2 ? (
            <>
              <Feedback tone="ok">Trois traversées, en <strong>−3</strong>, <strong>1</strong> et <strong>4</strong> ; quatre zones sur l’axe peint : <strong>− + − +</strong>. À chaque traversée, le signe change ; entre deux traversées, il ne change jamais.</Feedback>
              <KnowledgeBrick
                id="zero-fonction"
                variant="new"
                lead={<>Les trois abscisses que tu viens de trouver — −3, 1 et 4 — portent un nom.</>}
              />
              <KnowledgeBrick
                id="regle-signe-constant-entre-zeros"
                variant="new"
                compact
                lead={<>Et si tu repasses la sonde entre deux points ambre, la couleur ne bouge plus : essaie.</>}
              />
            </>
          ) : (
            <Feedback tone="info">Zéros trouvés : {[-3, 1, 4].filter((z) => visX.includes(z)).length} sur 3. Signe actuel : {signAt(CUBIC, x) === '+' ? 'positif' : signAt(CUBIC, x) === '−' ? 'négatif' : 'nul'}.</Feedback>
          )}
        </div>
      ),
    },
    {
      num: 3, title: 'Entre deux zéros', done: q3,
      content: (
        <TapQuestion prompt="Entre deux zéros consécutifs d’une fonction (courbe tracée d’un seul trait), le signe de f(x)…"
          options={['ne change pas : pour changer de signe, la courbe devrait traverser l’axe, donc passer par un zéro', 'change une fois au milieu', 'dépend du signe de x', 'peut changer plusieurs fois']}
          correct={0} cols={1}
          requires={['signe-position-courbe', 'zero-fonction', 'regle-signe-constant-entre-zeros']}
          explain="Passer du dessus au dessous de l’axe oblige la courbe à le traverser : c’est un zéro. Donc entre deux zéros consécutifs, le signe est constant — un seul test suffit à le connaître."
          explainWrong="Regarde l’axe peint : une seule couleur entre deux points ambre. Pour changer de couleur il faut passer par un zéro. Le signe de f(x) n’a rien à voir avec le signe de x : la courbe des températures est négative pour t = 2 (positif) et positive pour t = 12."
          solved={q3} onAnswered={() => setQ3(true)} />
      ),
    },
    {
      num: 4, title: 'Dire le signe', done: q4,
      content: (
        <div className="space-y-3">
          <KnowledgeBrick
            id="mem-au-dessus-en-dessous"
            variant="new"
            lead={<>Deux courbes balayées, une seule chose à retenir de tout ce module.</>}
          />
          <TapQuestion prompt="Que signifie « f(x) > 0 » pour un x donné ?"
            options={['Le point de la courbe d’abscisse x est au-dessus de l’axe des abscisses', 'x est positif', 'La courbe monte en x', 'Le point est à droite de l’axe des ordonnées']}
            correct={0} cols={1}
            requires={['signe-position-courbe', 'mem-au-dessus-en-dessous']}
            explain="f(x) est l’ordonnée du point d’abscisse x ; positive, le point est au-dessus de l’axe horizontal. Le signe de x (à droite ou à gauche) n’intervient pas, ni le sens de la courbe."
            explainWrong="f(x) est une ordonnée. f(x) > 0 : le point (x ; f(x)) est au-dessus de l’axe des abscisses — l’axe peint en vert. Rien à voir avec x positif ni avec « ça monte »."
            solved={q4} onAnswered={() => setQ4(true)} />
        </div>
      ),
    },
  ];

  return (
    <ContentModule ctx={MODULE_CTX} navLinks={getNavLinks(1)} moduleNumber={1}
      moduleTitle="Au-dessus ou en dessous ?" moduleSubtitle="Une sonde, une courbe, un axe qui se peint" estimatedTime="10 min"
      brief={{ tag: 'Déclencheur', title: 'Quand gèle-t-il ?', tone: 'indigo', body: <p>La courbe donne la température d’une journée d’hiver. Sous la sonde, l’axe des heures se colore : vert quand la courbe est au-dessus, rose quand elle est en dessous. Balaye la journée.</p> }}
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={1}><strong>Le mot juste.</strong> Les abscisses où la courbe touche l’axe s’appellent les <strong>zéros</strong> de la fonction. Et l’axe peint — des zéros, des couleurs entre — a un nom aussi : module suivant, le tableau de signes.</KnowledgeSnapshot>} />
  );
}
