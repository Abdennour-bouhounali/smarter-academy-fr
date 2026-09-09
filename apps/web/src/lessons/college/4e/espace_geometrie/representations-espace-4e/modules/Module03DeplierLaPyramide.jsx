import React, { useState } from 'react';
import { Scissors } from 'lucide-react';
import { ContentModule, TapQuestion, NumericQuestion, PredictionChips, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { parseDec } from '@smarter-academy/core';
import PatronLab from '../components/PatronLab';
import { longueursDe, patronSeReferme, arrondi, fr } from '../components/espace4e';

/**
 * Module 3 — MANIPULATION : déplier, et découvrir une troisième longueur.
 *
 * Activity              choisir la longueur des quatre triangles latéraux,
 *                       les rabattre autour du carré de base, et voir si la
 *                       pyramide se referme.
 * Mathematical objective la hauteur d'une face latérale n'est pas la hauteur
 *                       de la pyramide : c'est le segment qui va du sommet au
 *                       MILIEU d'un côté de la base, et lui seul referme le
 *                       patron.
 * Student action        choisir une longueur candidate, poser les quatre
 *                       triangles, lire le verdict, recommencer.
 * Controlled variable   la longueur proposée pour les triangles.
 * Mathematical state    `patronPyramide` fournit les pièces et le cadre ;
 *                       `patronSeReferme` juge par une CONDITION, pas à l'œil.
 * Visual consequence    triangles bleus qui se rejoignent, ou triangles ambrés
 *                       trop courts et un solide qui reste ouvert.
 * Expected observation  « la hauteur de la pyramide ne marche pas — il faut
 *                       celle du milieu ».
 * Misconception targeted prendre la hauteur de la pyramide comme hauteur des
 *                       faces latérales.
 * Formalization         la méthode du patron, une fois l'échec constaté.
 *
 * DIMENSIONS FIXÉES ICI, et non reprises du module 1 : un patron n'est
 * lisible que dans une plage étroite, et les trois longueurs candidates
 * doivent rester VISIBLEMENT distinctes. Le choix (8 cm de côté, 6 cm de haut)
 * est celui que `parcours.test.js` vérifie.
 */
const COTE = 8;
const HAUTEUR = 6;

export default function Module03DeplierLaPyramide() {
  const L = longueursDe(COTE, HAUTEUR);
  // Les trois candidates, dans l'ordre où l'élève les a rencontrées au M2.
  const CANDIDATES = [
    { id: 'hauteur', valeur: L.hauteur, label: `${fr(L.hauteur, 2)} cm — la hauteur de la pyramide` },
    { id: 'apotheme', valeur: arrondi(L.apotheme, 4), label: `${fr(arrondi(L.apotheme, 2), 2)} cm — du sommet au milieu d’un côté` },
    { id: 'arete', valeur: arrondi(L.arete, 4), label: `${fr(arrondi(L.arete, 2), 2)} cm — du sommet à un coin` },
  ];
  const LONGUEUR_MAX = Math.max(...CANDIDATES.map((c) => c.valeur));

  const [choix, setChoix] = useState('hauteur');
  const [posees, setPosees] = useState([]);
  const [essais, setEssais] = useState([]);
  const [pred, setPred] = useState(null);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);

  const candidate = CANDIDATES.find((c) => c.id === choix) ?? CANDIDATES[0];
// La tolérance du jugement, définie UNE fois et passée au labo : les
  // candidates sont arrondies, le verdict doit l'être du même cran.
  const TOLERANCE = 1e-3;
  const referme = patronSeReferme(COTE, HAUTEUR, candidate.valeur, TOLERANCE);

  const poser = (id) => {
    setPosees((p) => {
      if (p.includes(id)) return p;
      const suivant = [...p, id];
      if (suivant.length === 4) {
        setEssais((e) => (e.some((x) => x.id === choix) ? e : [...e, { id: choix, referme }]));
      }
      return suivant;
    });
  };

  const changerChoix = (id) => { setChoix(id); setPosees([]); };

  // L'étape 1 est franchie dès qu'un patron a été construit ENTIÈREMENT,
  // juste ou faux : c'est l'essai qui enseigne, pas la réussite.
  const done1 = essais.length >= 1;
  // L'étape 2 demande d'avoir trouvé celui qui se referme.
  const done2 = essais.some((e) => e.referme);

  const lab = (
    <PatronLab
      cote={COTE}
      hauteur={HAUTEUR}
      longueur={candidate.valeur}
      longueurMax={LONGUEUR_MAX}
      tolerance={TOLERANCE}
      posees={posees}
      onPoser={poser}
      onRecommencer={() => setPosees([])}
    />
  );

  /**
   * Le choix de la longueur, rendu dans DEUX étapes différentes.
   *
   * Le nom du groupe de boutons radio est SUFFIXÉ par l'étape. Sans cela, les
   * deux rendus partagent le même `name` : le navigateur les traite comme un
   * seul groupe, si bien que cocher une option dans l'étape 1 la décoche
   * aussitôt dans l'étape 2, et l'état affiché ne suit plus le clic. Le défaut
   * a été trouvé au navigateur (« Clicking the checkbox did not change its
   * state »), pas en test unitaire.
   */
  const ChoixUI = ({ scope }) => (
    <fieldset className="rounded-2xl border-2 border-slate-200 bg-white p-3">
      <legend className="px-1 text-xs font-bold uppercase tracking-wide text-slate-500">
        Longueur donnée aux quatre triangles
      </legend>
      <div className="mt-1 space-y-2">
        {CANDIDATES.map((c) => (
          <label
            key={c.id}
            className={`flex min-h-[44px] cursor-pointer items-center gap-2.5 rounded-xl border-2 px-3 py-2 text-sm ${
              choix === c.id ? 'border-sky-400 bg-sky-50 font-bold text-sky-900' : 'border-slate-200 bg-white text-slate-700'
            }`}
          >
            <input
              type="radio"
              name={`patron-longueur-${scope}`}
              value={c.id}
              checked={choix === c.id}
              onChange={() => changerChoix(c.id)}
              className="h-4 w-4 accent-sky-600"
            />
            {c.label}
          </label>
        ))}
      </div>
    </fieldset>
  );

  const steps = [
    {
      num: 1,
      title: 'Choisis une longueur, puis déplie',
      subtitle: `La pyramide fait ${COTE} cm de côté et ${fr(HAUTEUR, 0)} cm de haut. Les quatre triangles ont tous la même forme : à toi de dire laquelle.`,
      done: done1,
      content: (
        <div className="space-y-3">
          <PredictionChips
            prompt="Quelle longueur faut-il donner aux triangles pour que la pyramide se referme ?"
            options={[
              { id: 'h', label: 'La hauteur' },
              { id: 'm', label: 'Celle du milieu' },
              { id: 'a', label: 'L’arête' },
            ]}
            value={pred}
            onChange={setPred}
          />
          <ChoixUI scope="e1" />
          {lab}
          {done1 && !done2 && (
            <Feedback tone="hint">
              Le patron ne se referme pas encore. Change de longueur et recommence — l’essai est
              gratuit.
            </Feedback>
          )}
          {done2 && (
            <Feedback tone="ok">
              Une seule des trois marche. Ce n’est ni la plus courte, ni la plus longue : c’est
              celle qui vise le MILIEU d’un côté de la base.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Pourquoi la hauteur ne suffit pas',
      done: done2 || q3,
      content: (
        <div className="space-y-3">
          <ChoixUI scope="e2" />
          {lab}
          <TapQuestion
            prompt="Avec la hauteur de la pyramide, les triangles sont trop courts. Pourquoi ?"
            options={[
              'La hauteur descend au CENTRE de la base ; le triangle, lui, doit atteindre le BORD',
              'La hauteur est mal mesurée sur le dessin',
              'Il faudrait cinq triangles au lieu de quatre',
              'Le carré de base est trop grand',
            ]}
            correct={0}
            cols={1}
            requires={['base-et-hauteur', 'hauteur-nest-pas-arete', 'milieu-segment']}
            explain={`La hauteur va du sommet au centre du plancher : ${fr(L.hauteur, 2)} cm. Le triangle latéral, lui, doit descendre jusqu’au milieu d’un côté, qui est plus loin — d’où ${fr(arrondi(L.apotheme, 2), 2)} cm.`}
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
          {(q3 || done2) && (
            <KnowledgeBrick
              id="patron-pyramide"
              variant="new"
              lead="Ce que tu viens de construire à l’essai est une méthode."
            />
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'La bonne longueur, en nombre',
      done: q4,
      content: (
        <div className="space-y-3">
          <p className="text-sm text-slate-700">
            La même pyramide, avec un côté de base de <strong>{COTE} cm</strong> et une hauteur de{' '}
            <strong>{fr(HAUTEUR, 0)} cm</strong>. Le triangle latéral part du sommet et descend
            jusqu’au milieu d’un côté.
          </p>
          <NumericQuestion
            prompt="Quelle longueur donner à chaque triangle ? Donne un résultat au centième de centimètre."
            expected={arrondi(L.apotheme, 2)}
            parse={parseDec}
            suffix="cm"
            requires={['patron-pyramide', 'arrondi']}
            explain={`C’est la longueur que le patron réclamait : environ ${fr(arrondi(L.apotheme, 2), 2)} cm. Elle est plus grande que la hauteur (${fr(L.hauteur, 2)} cm) et plus petite que l’arête latérale (${fr(arrondi(L.arete, 2), 2)} cm).`}
            explainFor={(n) => {
              if (n === HAUTEUR) return `${fr(HAUTEUR, 0)} cm est la hauteur de la pyramide — celle qui descend au centre. Le patron reste ouvert avec elle.`;
              if (typeof n === 'number' && Math.abs(n - arrondi(L.arete, 2)) < 0.05) {
                return `${fr(arrondi(L.arete, 2), 2)} cm est l’arête latérale, qui vise un COIN. Les triangles seraient alors trop longs.`;
              }
              if (n === COTE) return `${COTE} cm est le côté de la base, pas la hauteur d’un triangle latéral.`;
              return null;
            }}
            solved={q4}
            onAnswered={() => setQ4(true)}
          />
          {q4 && (
            <Feedback tone="info">
              Trois longueurs, trois rôles : la hauteur sert au volume, celle du milieu sert au
              patron, l’arête ne sert ici à rien — sinon à tromper. Au module suivant, la base
              devient ronde.
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
      moduleTitle="Déplier la pyramide"
      moduleSubtitle="Un carré, quatre triangles, et une seule longueur qui marche"
      estimatedTime="11 min"
      brief={{
        tag: '🎬 Mission 03',
        title: 'Mettre la pyramide à plat',
        tone: 'indigo',
        body: (
          <>
            Un carré au centre, quatre triangles rabattus autour.{' '}
            <strong>Quelle longueur leur donner</strong> pour que le solide se referme
            exactement ?
          </>
        ),
      }}
      intro={
        <div className="flex items-start gap-3 rounded-2xl border border-sky-100 bg-sky-50/60 p-3.5">
          <Scissors className="mt-0.5 h-5 w-5 shrink-0 text-sky-600" aria-hidden="true" />
          <p className="text-sm text-sky-900">
            Tu peux tout recommencer autant de fois que tu veux : c’est en voyant le patron
            refuser de se refermer qu’on comprend quelle longueur il réclamait.
          </p>
        </div>
      }
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={3} />}
    />
  );
}
