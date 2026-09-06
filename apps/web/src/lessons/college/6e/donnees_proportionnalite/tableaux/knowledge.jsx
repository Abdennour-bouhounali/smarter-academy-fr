import React from 'react';
import { MiniGrid } from '../../../../common/knowledge6e';

/**
 * Connaissances de la leçon « Tableaux » (6e) — SOURCE UNIQUE de vérité
 * (docs/architecture/KNOWLEDGE_MAP.md).
 *
 * Chaque item est posé dans la page par un <KnowledgeBrick id="…"> à
 * l'instant où le geste vient de lui donner un sens, puis il reste sur la
 * carte. Rien n'est réécrit dans les modules : la brique et la carte montrent
 * le même texte.
 *
 * ORDRE — un item n'emploie QUE le vocabulaire déjà posé à son module ou
 * avant, puisque la brique rend ce texte à sa position dans le flux
 * (docs/architecture/KNOWLEDGE_DEPENDENCY.md) :
 *
 *   M1  à quoi sert un tableau : ranger pour retrouver vite
 *   M2  les quatre mots (ligne, colonne, en-tête, cellule) et le croisement
 *   M3  la position porte le sens : déplacer un nombre change ce qu'il dit
 *   M4  la PROCÉDURE de lecture — posée AVANT qu'on demande de croiser
 *   M5  comparer dans une ligne / dans une colonne, et le total qui décide
 *   M6  choisir la structure : deux familles d'information
 *
 * Les mots « ligne », « colonne », « en-tête » et « cellule » n'apparaissent
 * donc dans aucun item avant M2, où ils sont posés — et la marche à suivre
 * pour lire un croisement est posée en M4 avant la première demande de
 * lecture libre, pas laissée à un `explain`.
 */

const Souvenir = ({ children }) => (
  <div className="text-xs text-slate-400 italic">📍 Souvenir : {children}</div>
);

const Piege = ({ children }) => (
  <p className="text-xs text-rose-600">⚠️ {children}</p>
);

export const LESSON_KNOWLEDGE = {
  modules: {

    /* ── M1 — Le déclencheur : le rangement fait gagner du temps. ── */
    1: [
      {
        id: 'tableau-outil',
        type: 'concepts',
        title: 'À quoi sert un tableau',
        summary: 'Il ne change aucun nombre : il leur donne une place, pour les retrouver du regard.',
        visual: (
          <MiniGrid
            cols={4} rows={4} cell={17}
            colLabels={['Cou', 'Sau', 'Rel', 'Pré']}
            rowLabels={['Léa', 'Tom', 'Inès', 'Hugo']}
            filled={[{ r: 3, c: 2 }]}
            color="#6366f1"
          />
        ),
        body: (
          <div className="space-y-2">
            <p>
              Les mêmes informations, écrites à la file dans un paragraphe, obligent à tout relire.
              Rangées, elles se trouvent <strong>d’un coup d’œil</strong>.
            </p>
            <Piege>
              Un tableau ne rend pas les nombres plus grands ni plus justes. Il ne fait rien d’autre
              que les <em>placer</em> — et c’est déjà énorme.
            </Piege>
            <Souvenir>les 16 résultats du tournoi qu’il fallait chercher trois fois dans le texte.</Souvenir>
          </div>
        ),
      },
    ],

    /* ── M2 — Les quatre mots, après le geste de désignation. ── */
    2: [
      {
        id: 'ligne-colonne',
        type: 'vocabulaire',
        title: 'Ligne et colonne',
        summary: 'Une ligne va de gauche à droite ; une colonne descend de haut en bas.',
        visual: (
          <div className="flex items-center gap-3">
            <MiniGrid cols={4} rows={3} cell={16} filled={[{ r: 1, c: 0 }, { r: 1, c: 1 }, { r: 1, c: 2 }, { r: 1, c: 3 }]} color="#0ea5e9" />
            <MiniGrid cols={4} rows={3} cell={16} filled={[{ r: 0, c: 2 }, { r: 1, c: 2 }, { r: 2, c: 2 }]} color="#8b5cf6" />
          </div>
        ),
        body: (
          <div className="space-y-2">
            <p>
              Dans le tournoi, une <strong>ligne</strong> suit un même élève d’une épreuve à l’autre.
              Une <strong>colonne</strong> suit une même épreuve, pour tout le monde.
            </p>
            <p className="text-xs text-slate-500">
              Ce ne sont pas deux mots pour la même chose : ils répondent à deux questions
              différentes.
            </p>
            <Souvenir>la ligne d’Inès, puis la colonne du saut, que tu as explorées l’une après l’autre.</Souvenir>
          </div>
        ),
      },
      {
        id: 'entete',
        type: 'vocabulaire',
        title: 'Les en-têtes',
        summary: 'La première ligne et la première colonne ne sont pas des données : elles disent ce que les nombres représentent.',
        visual: (
          <MiniGrid
            cols={3} rows={3} cell={19}
            colLabels={['Cou', 'Sau', 'Rel']}
            rowLabels={['Léa', 'Tom', 'Inès']}
            color="#f59e0b"
          />
        ),
        body: (
          <div className="space-y-2">
            <p>
              « Léa », « Saut », « Précision » : ces mots-là ne se comptent pas, ils{' '}
              <strong>nomment</strong>. Sans eux, il resterait une grille de nombres muets.
            </p>
            <Piege>
              Le nombre 15 tout seul dans une case ne veut rien dire : des points ? des euros ? des
              kilomètres ? Ce sont les en-têtes qui répondent.
            </Piege>
            <Souvenir>le tableau dont on avait effacé les en-têtes, devenu illisible.</Souvenir>
          </div>
        ),
      },
      {
        id: 'cellule-croisement',
        type: 'vocabulaire',
        title: 'La cellule, au croisement',
        summary: 'Une case unique, là où une ligne rencontre une colonne. C’est là que vit chaque nombre.',
        visual: (
          <MiniGrid
            cols={4} rows={3} cell={17}
            filled={[{ r: 1, c: 2 }]}
            nodes={[{ r: 1, c: 2 }, { r: 2, c: 3 }]}
            color="#10b981"
          />
        ),
        body: (
          <div className="space-y-2">
            <p>
              Une <strong>cellule</strong> appartient à une ligne ET à une colonne à la fois. C’est ce
              double rattachement qui transforme un nombre en information : 15 devient « les 15 points
              de Tom au relais ».
            </p>
            <Souvenir>la case que tu as touchée, à l’intersection de la ligne Tom et de la colonne Relais.</Souvenir>
          </div>
        ),
      },
    ],

    /* ── M3 — Après avoir rangé huit faits : la position parle. ── */
    3: [
      {
        id: 'position-porte-sens',
        type: 'regles',
        title: 'La position porte le sens',
        summary: 'Déplacer un nombre dans le tableau change ce qu’il affirme, même si le nombre ne change pas.',
        visual: (
          <div className="flex items-center gap-3">
            <MiniGrid cols={3} rows={3} cell={17} filled={[{ r: 1, c: 2 }]} color="#10b981" />
            <span className="text-slate-400 text-sm">→</span>
            <MiniGrid cols={3} rows={3} cell={17} filled={[{ r: 1, c: 0 }]} color="#f43f5e" />
          </div>
        ),
        body: (
          <div className="space-y-2">
            <p>
              Ranger une information, ce n’est pas la recopier quelque part : c’est{' '}
              <strong>choisir sa cellule</strong>. Le même 15, posé dans la colonne « Course » au lieu
              de « Relais », raconte quelque chose de faux.
            </p>
            <Piege>
              Une donnée mal placée n’est pas une donnée en attente : c’est une donnée qui ment. Le
              tableau, lui, ne proteste pas.
            </Piege>
            <Souvenir>les huit résultats que tu as déposés un par un à leur croisement.</Souvenir>
          </div>
        ),
      },
    ],

    /* ── M4 — La MARCHE À SUIVRE, posée avant la première lecture libre. ── */
    4: [
      {
        id: 'lire-un-croisement',
        type: 'methodes',
        title: 'Lire une cellule sans se tromper',
        summary: 'Trouver la ligne, puis la colonne, puis descendre jusqu’à leur rencontre.',
        visual: (
          <MiniGrid
            cols={4} rows={4} cell={17}
            colLabels={['Cou', 'Sau', 'Rel', 'Pré']}
            rowLabels={['Léa', 'Tom', 'Inès', 'Hugo']}
            filled={[{ r: 0, c: 0 }, { r: 0, c: 1 }, { r: 0, c: 2 }, { r: 0, c: 3 }, { r: 1, c: 3 }, { r: 2, c: 3 }, { r: 3, c: 3 }]}
            color="#a78bfa"
          />
        ),
        body: (
          <div className="space-y-2">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 space-y-1 text-sm text-slate-600">
              <div>① je repère l’en-tête de <strong>ligne</strong> demandé (le « qui »)</div>
              <div>② je repère l’en-tête de <strong>colonne</strong> demandé (le « quoi »)</div>
              <div>③ je suis les deux jusqu’à la cellule où ils se rencontrent</div>
            </div>
            <p>
              Un doigt sur la ligne, un doigt sur la colonne : la réponse est là où les doigts se
              rejoignent, et nulle part ailleurs.
            </p>
            <Piege>
              L’erreur la plus fréquente n’est pas de mal calculer, c’est de{' '}
              <strong>glisser d’une ligne</strong> en traversant le tableau. Une ligne d’écart, et on
              lit le résultat de quelqu’un d’autre.
            </Piege>
            <Souvenir>la ligne et la colonne éclairées, dont le croisement s’allumait tout seul.</Souvenir>
          </div>
        ),
      },
      {
        id: 'lecture-inverse',
        type: 'methodes',
        title: 'Remonter d’un nombre à son sens',
        summary: 'Depuis une cellule, relire son en-tête de ligne et son en-tête de colonne.',
        visual: (
          <MiniGrid
            cols={3} rows={3} cell={19}
            colLabels={['Cou', 'Sau', 'Rel']}
            rowLabels={['Léa', 'Tom', 'Inès']}
            filled={[{ r: 1, c: 2 }]}
            color="#8b5cf6"
          />
        ),
        body: (
          <div className="space-y-2">
            <p>
              On peut parcourir le croisement dans les deux sens. Pour savoir <em>de qui</em> vient un
              nombre, on part de sa cellule et on remonte : à gauche pour le « qui », en haut pour le
              « quoi ».
            </p>
            <Souvenir>les trois scores dont tu as retrouvé le propriétaire.</Souvenir>
          </div>
        ),
      },
      {
        id: 'mem-double-entree',
        type: 'memoriser',
        title: '⭐ Ligne × colonne = cellule',
        summary: 'Deux entrées, un seul croisement : c’est la règle de tous les tableaux à double entrée.',
        body: (
          <div className="space-y-2">
            <div className="rounded-xl bg-rose-50 border-2 border-rose-200 p-4 space-y-1.5 text-center">
              <div className="text-sm font-black text-rose-700">LIGNE → de QUI on parle</div>
              <div className="text-sm font-black text-rose-700">COLONNE → de QUOI on parle</div>
              <div className="text-sm font-black text-rose-700">CELLULE → la réponse, à leur croisement</div>
            </div>
            <p className="text-xs text-slate-500">
              Scores, horaires de bus, prix, températures : dès que deux familles d’information se
              croisent, on lit toujours de la même façon.
            </p>
          </div>
        ),
      },
    ],

    /* ── M5 — Comparer, et le total qui renverse l'intuition. ── */
    5: [
      {
        id: 'comparer-sens-lecture',
        type: 'regles',
        title: 'Le sens de lecture change la question',
        summary: 'Dans une ligne on compare un même sujet ; dans une colonne, plusieurs sujets sur une même catégorie.',
        visual: (
          <div className="flex items-center gap-3">
            <MiniGrid cols={4} rows={3} cell={16} filled={[{ r: 1, c: 0 }, { r: 1, c: 1 }, { r: 1, c: 2 }, { r: 1, c: 3 }]} color="#f59e0b" />
            <MiniGrid cols={4} rows={3} cell={16} filled={[{ r: 0, c: 1 }, { r: 1, c: 1 }, { r: 2, c: 1 }]} color="#0ea5e9" />
          </div>
        ),
        body: (
          <div className="space-y-2">
            <p>
              « Dans quelle épreuve Tom est-il le meilleur ? » se lit sur sa <strong>ligne</strong>.
              « Qui saute le mieux ? » se lit dans la <strong>colonne</strong> du saut. Même tableau,
              deux parcours.
            </p>
            <p className="text-xs text-slate-500">
              Avant de comparer, il faut donc décider dans quel sens on va — sinon on répond à une
              autre question que celle posée.
            </p>
            <Souvenir>la ligne de Tom puis la colonne du saut, éclairées tour à tour.</Souvenir>
          </div>
        ),
      },
      {
        id: 'total-decide',
        type: 'methodes',
        title: 'Le total d’une ligne',
        summary: 'Additionner toute une ligne donne le bilan d’un sujet — et c’est lui qui classe.',
        visual: (
          <MiniGrid
            cols={5} rows={4} cell={16}
            colLabels={['Cou', 'Sau', 'Rel', 'Pré', 'Tot']}
            rowLabels={['Léa', 'Tom', 'Inès', 'Hugo']}
            filled={[{ r: 0, c: 4 }, { r: 1, c: 4 }, { r: 2, c: 4 }, { r: 3, c: 4 }]}
            color="#f59e0b"
          />
        ),
        body: (
          <div className="space-y-2">
            <p>
              On ajoute une colonne à droite : chaque case y vaut la somme de sa ligne entière. Le
              tableau répond alors à une question qu’aucune cellule seule ne pouvait traiter.
            </p>
            <Piege>
              La plus grosse case n’est pas la meilleure ligne. Inès gagne le tournoi sans remporter
              une seule épreuve, parce que ses quatre résultats sont bons — Tom, lui, n’a qu’un seul
              gros score.
            </Piege>
            <Souvenir>la colonne des totaux, puis le classement renversé par une seule case corrigée.</Souvenir>
          </div>
        ),
      },
    ],

    /* ── M6 — Construire : choisir la structure avant de remplir. ── */
    6: [
      {
        id: 'choisir-structure',
        type: 'methodes',
        title: 'Choisir les lignes et les colonnes',
        summary: 'Repérer les deux familles d’information de la situation : l’une fait les lignes, l’autre les colonnes.',
        visual: (
          <MiniGrid
            cols={2} rows={3} cell={22}
            colLabels={['Sam', 'Dim']}
            rowLabels={['Lyon', 'Brest', 'Nice']}
            color="#f43f5e"
          />
        ),
        body: (
          <div className="space-y-2">
            <p>
              Trois villes, deux jours, six relevés : les villes font les lignes, les jours font les
              colonnes, et chaque relevé trouve sa cellule. Une famille par direction, jamais deux.
            </p>
            <Piege>
              Faire six lignes, une par relevé, redonne exactement la liste du départ : la grille est
              là, mais plus rien ne se croise.
            </Piege>
            <Souvenir>la grille météo que tu as choisie, puis remplie relevé par relevé.</Souvenir>
          </div>
        ),
      },
    ],
  },
};
