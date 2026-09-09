import React, { useState } from 'react';
import { PenLine } from 'lucide-react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import PreuveLab from '../components/PreuveLab';

/**
 * Module 6 — MANIPULATION : assembler une démonstration.
 *
 * Activity              choisir les étapes d'une preuve, dans l'ordre.
 * Mathematical objective une démonstration a une CHARPENTE : donnée →
 *                       propriété du cours → conclusion. La propriété n'est pas
 *                       une formalité : c'est elle qui autorise le passage.
 * Student action        taper les cartes, retirer la dernière si besoin.
 * Controlled variable   l'ordre et le choix des étapes.
 * Mathematical state    la liste des étapes posées. Le verdict de charpente est
 *                       CALCULÉ par `preuveEstCharpentee` dans le noyau.
 * Visual consequence    la rédaction s'écrit ligne à ligne, la jauge des trois
 *                       rôles s'allume.
 * Misconception targeted conclure sans invoquer la propriété — l'erreur la plus
 *                       fréquente de la 4e. Le verdict la nomme explicitement.
 *
 * DEUX PREUVES, PAS UNE. La première utilise la caractérisation du triangle
 * rectangle (M1–M2), la seconde la réciproque de la droite des milieux (M4).
 * Une seule preuve enseignerait « la recette de CETTE preuve » ; deux, dont les
 * propriétés diffèrent, enseignent la charpente.
 *
 * LES DISTRACTEURS SONT DES ERREURS RÉELLES, pas du remplissage :
 *   · une observation à la place d'une propriété (« sur le dessin, ça a l'air
 *     parallèle ») — l'observation n'est pas une preuve ;
 *   · une propriété lue à l'ENVERS de ce que l'énoncé donne — l'erreur que le
 *     module 5 vient de nommer ;
 *   · une conclusion qui dit plus que ce qu'on peut déduire.
 * Aucun n'appartient à `attendu` : les choisir donne une preuve refusée, mais
 * l'étape n'est jamais bloquée.
 *
 * REJOUABLE : « Retirer la dernière étape » reste actif après validation.
 */

/* ── Preuve 1 : la caractérisation du triangle rectangle ──────────────── */
const PREUVE_1 = [
  {
    id: 'p1-donnee',
    role: 'donnee',
    texte: 'On sait que les points R, S et T sont sur un cercle de centre O, et que [RT] est un diamètre de ce cercle.',
  },
  {
    id: 'p1-propriete',
    role: 'propriete',
    texte: 'Or, si un triangle est inscrit dans un cercle dont un côté est un diamètre, alors ce triangle est rectangle, et l’angle droit est au sommet opposé à ce diamètre.',
  },
  {
    id: 'p1-conclusion',
    role: 'conclusion',
    texte: 'Donc le triangle RST est rectangle en S.',
  },
  // Distracteurs — chacun encode une erreur réelle.
  {
    id: 'p1-x-observation',
    role: 'propriete',
    texte: 'Or, sur la figure, l’angle en S a vraiment l’air d’un angle droit.',
  },
  {
    id: 'p1-x-envers',
    role: 'propriete',
    texte: 'Or, si un triangle est rectangle, alors le centre de son cercle circonscrit est le milieu de l’hypoténuse.',
  },
  {
    id: 'p1-x-trop',
    role: 'conclusion',
    texte: 'Donc le triangle RST est rectangle et isocèle en S.',
  },
];
const ATTENDU_1 = ['p1-donnee', 'p1-propriete', 'p1-conclusion'];

/* ── Preuve 2 : la réciproque de la droite des milieux ────────────────── */
const PREUVE_2 = [
  {
    id: 'p2-donnee-1',
    role: 'donnee',
    texte: 'On sait que E est le milieu du côté [MN] du triangle MNP.',
  },
  {
    id: 'p2-donnee-2',
    role: 'donnee',
    texte: 'On sait aussi que la droite (EF), avec F sur [MP], est parallèle à (NP).',
  },
  {
    id: 'p2-propriete',
    role: 'propriete',
    texte: 'Or, si une droite passe par le milieu d’un côté d’un triangle et est parallèle à un autre côté, alors elle coupe le troisième côté en son milieu.',
  },
  {
    id: 'p2-conclusion',
    role: 'conclusion',
    texte: 'Donc F est le milieu de [MP].',
  },
  {
    id: 'p2-x-envers',
    role: 'propriete',
    texte: 'Or, si E et F sont les milieux de [MN] et [MP], alors (EF) est parallèle à (NP).',
  },
  {
    id: 'p2-x-mesure',
    role: 'donnee',
    texte: 'On mesure MF sur la figure et on trouve à peu près la moitié de MP.',
  },
];
const ATTENDU_2 = ['p2-donnee-1', 'p2-donnee-2', 'p2-propriete', 'p2-conclusion'];

export default function Module06RedigerLaPreuve() {
  const [c1, setC1] = useState([]);
  const [c2, setC2] = useState([]);
  const [q3, setQ3] = useState(false);

  const juste = (choix, attendu) =>
    choix.length === attendu.length && choix.every((id, i) => id === attendu[i]);

  const done1 = juste(c1, ATTENDU_1);
  const done2 = juste(c2, ATTENDU_2);

  const steps = [
    {
      num: 1,
      title: 'Première preuve : un triangle est-il rectangle ?',
      subtitle: 'RST est inscrit dans un cercle, et [RT] en est un diamètre. Montre que RST est rectangle en S.',
      done: done1,
      content: (
        <div className="space-y-3">
          <div className="rounded-2xl border-2 border-rose-200 bg-rose-50/60 p-3 text-sm text-rose-900">
            Toutes les cartes ci-dessous ne servent pas. Certaines énoncent une propriété qui va
            dans le MAUVAIS sens, d’autres se contentent d’observer le dessin. Une preuve
            n’accepte ni l’un ni l’autre.
          </div>
          <PreuveLab
            etapes={PREUVE_1}
            choisies={c1}
            attendu={ATTENDU_1}
            onChoisir={(id) => setC1((c) => [...c, id])}
            onRetirer={() => setC1((c) => c.slice(0, -1))}
          />
          {done1 && (
            <Feedback tone="ok">
              Trois lignes, trois rôles. La propriété invoquée part bien de ce que l’énoncé donne
              — le diamètre — pour arriver à ce qu’on veut : l’angle droit.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Deuxième preuve : un point est-il un milieu ?',
      subtitle: 'E est le milieu de [MN], et (EF) est parallèle à (NP). Montre que F est le milieu de [MP].',
      done: done2,
      content: (
        <div className="space-y-3">
          <p className="text-sm text-slate-700">
            Cette preuve a besoin de <strong>deux données</strong> avant de pouvoir invoquer sa
            propriété : le milieu, et le parallélisme. Il en manque une, la propriété ne
            s’applique pas.
          </p>
          <PreuveLab
            etapes={PREUVE_2}
            choisies={c2}
            attendu={ATTENDU_2}
            onChoisir={(id) => setC2((c) => [...c, id])}
            onRetirer={() => setC2((c) => c.slice(0, -1))}
          />
          {done2 && (
            <Feedback tone="ok">
              Quatre lignes cette fois, mais la même charpente : ce qu’on sait, la propriété
              nommée en entier, ce qu’on en déduit.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Ce qui fait qu’une preuve est une preuve',
      done: q3,
      content: (
        <div className="space-y-3">
          <TapQuestion
            prompt="Un élève écrit : « E est le milieu de [MN], donc F est le milieu de [MP]. » Que manque-t-il ?"
            options={[
              'La propriété du cours qui autorise cette déduction — et la deuxième donnée qu’elle exige',
              'Rien : la conclusion est juste, c’est tout ce qui compte',
              'Un dessin plus précis',
              'La mesure des longueurs MF et MP',
            ]}
            correct={0}
            cols={1}
            requires={['reciproque-milieux', 'propriete-et-reciproque']}
            explain="La conclusion est peut-être vraie, mais rien ne la relie à la donnée : c’est une affirmation, pas une démonstration. Il manque le parallélisme, et la propriété qui transforme ces deux données en conclusion."
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
          {q3 && (
            <KnowledgeBrick
              id="charpente-demonstration"
              variant="new"
              lead="La charpente que tu viens d’assembler deux fois, écrite une bonne fois."
            />
          )}
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(6)}
      moduleNumber={6}
      moduleTitle="Rédiger la preuve"
      moduleSubtitle="Donnée, propriété, conclusion"
      estimatedTime="13 min"
      brief={{
        tag: '🎬 Mission 06',
        title: 'Le rapport du détective',
        tone: 'indigo',
        body: (
          <>
            Tu as maintenant quatre propriétés établies. Il reste à apprendre à s’en servir{' '}
            <strong>par écrit</strong> : ce qu’on te donne, ce que tu invoques, ce que tu conclus.
          </>
        ),
      }}
      intro={
        <div className="flex items-start gap-3 rounded-2xl border border-rose-100 bg-rose-50/60 p-3.5">
          <PenLine className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" aria-hidden="true" />
          <p className="text-sm text-rose-900">
            Le rôle de chaque carte n’est affiché qu’une fois posée : c’est le CONTENU qui doit
            guider ton choix, pas une étiquette de couleur.
          </p>
        </div>
      }
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={6} />}
    />
  );
}
