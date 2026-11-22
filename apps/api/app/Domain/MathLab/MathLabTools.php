<?php

namespace App\Domain\MathLab;

/**
 * Le registre SERVEUR des instruments du مختبر الرياضيات.
 *
 * Le client a le sien (apps/web/src/features/mathlab/toolRegistry.js) : il
 * décide de l'interface, des routes et du rendu. Celui-ci ne décide que de ce
 * que le serveur accepte d'ENREGISTRER : un identifiant connu, et une taille
 * bornée. Un document d'un outil inconnu est refusé (422) — on ne stocke pas
 * ce qu'aucun instrument ne saura rouvrir.
 *
 * Ajouter un instrument = une ligne ici ET une entrée dans le registre client.
 */
final class MathLabTools
{
    /**
     * @var array<string, array{maxBytes: int}>
     */
    private const TOOLS = [
        // La سبّورة : un dessin Excalidraw sérialisé. 2 Mo couvrent des
        // centaines de traits ; l'outil image est désactivé côté client, donc
        // aucune photo n'y entre.
        'whiteboard' => ['maxBytes' => 2_000_000],
        // Le grapheur : six fonctions au plus, un point, une fenêtre, des
        // réglages — quelques kilo-octets. 100 Ko laissent de la marge aux
        // versions futures (paramètres, plusieurs points).
        'functionGrapher' => ['maxBytes' => 100_000],
        // La géométrie dans l'espace : un solide, ses dimensions, trois
        // options, une caméra — quelques centaines d'octets. 20 Ko laissent
        // de la marge aux versions futures (patrons, sections, plusieurs solides).
        'geometry3d' => ['maxBytes' => 20_000],
        // Les probabilités et statistiques : une expérience, ses paramètres,
        // des EFFECTIFS (jamais les tirages : cent mille lancers de dé, c'est
        // six nombres), une trajectoire bornée à soixante points, et une
        // série saisie bornée à cinq cents valeurs. 60 Ko couvrent tout cela
        // très largement et laissent de la marge aux versions futures.
        'probabilityStats' => ['maxBytes' => 60_000],
        // Le laboratoire d'algèbre : une équation et le CHEMIN qui y mène —
        // soixante pas au plus, chacun quatre rationnels `{n, d}` et une
        // opération. Quelques kilo-octets ; 20 Ko laissent de la marge aux
        // versions futures (plusieurs inconnues, second degré).
        'algebra' => ['maxBytes' => 20_000],
        // Le laboratoire des أشعة : une SCÈNE (points, أشعة, polygones) et le
        // chemin qui y mène — vingt pas au plus, chacun gardant une copie de
        // la scène entière. Le pire cas mesuré (26 points, 12 أشعة, vingt
        // pas) pèse ~65 Ko ; 120 Ko laissent de la marge aux versions
        // futures (repères, coniques) sans jamais accepter un document que
        // l'instrument ne saurait rouvrir. La borne est tenue côté client par
        // MAX_HISTORY (vectorState.js) et vérifiée par vectorState.test.js.
        'vectors' => ['maxBytes' => 120_000],
        // Le laboratoire de trigonométrie : un angle, un rayon, un triangle,
        // seize bascules de couches et deux compteurs d'entraînement — le
        // document mesuré pèse ~700 octets, et le pire cas reste sous 1 Ko.
        // L'animation, la question courante et le panneau ouvert ne sont
        // JAMAIS sérialisés (trigState.js). 8 Ko laissent une marge large
        // aux versions futures (plusieurs angles comparés, une table
        // personnalisée) sans jamais accepter un document que l'instrument
        // ne saurait rouvrir ; la borne est vérifiée par trigState.test.js.
        'trigonometry' => ['maxBytes' => 8_000],
        // Le laboratoire des متتاليات : une DÉFINITION (la famille, six
        // paramètres, deux expressions bornées à 200 caractères), une suite
        // comparée de même forme, un curseur, un indice sondé, seize bascules,
        // deux fenêtres et deux compteurs d'entraînement. Le document mesuré
        // pèse ~550 octets, et le pire cas (deux expressions pleines, toutes
        // les couches, les deux fenêtres) reste sous 1,5 Ko. Les TERMES ne
        // sont jamais stockés — ils se recalculent de la définition, et en
        // garder cinq cents serait stocker ce qu'on sait refaire. L'itération,
        // la question d'entraînement et l'expérience ouverte n'ont aucun champ
        // (sequenceState.js). 8 Ko laissent une marge large aux versions
        // futures (plusieurs suites comparées, une bibliothèque de règles)
        // sans jamais accepter un document que l'instrument ne saurait
        // rouvrir ; la borne est vérifiée par sequenceState.test.js.
        'sequences' => ['maxBytes' => 8_000],
        // Le laboratoire des تحويلات : une SCÈNE (jusqu'à quatre figures de
        // douze sommets, une pile de six transformations) et le chemin qui y
        // mène — vingt pas au plus, chacun gardant une copie de la scène
        // entière, comme le مختبر الأشعة. Le pire cas MESURÉ (quatre
        // polygones de douze sommets, six pas, vingt états) pèse ~40 Ko ;
        // 60 Ko laissent de la marge aux versions futures (plusieurs piles
        // comparées, des figures nommées) sans jamais accepter un document
        // que l'instrument ne saurait rouvrir. La borne est tenue côté client
        // par MAX_HISTORY (transformState.js) et vérifiée par
        // transformState.test.js.
        'transformations' => ['maxBytes' => 60_000],
        // Le laboratoire des coniques : une SCÈNE (quatre coniques, deux
        // droites, une sonde, un point tracé, un lieu) et le chemin qui y
        // mène — vingt pas au plus, chacun gardant une copie de la scène
        // entière, comme les أشعة et les تحويلات. Une conique se décrit par
        // cinq nombres, jamais par ses points : la courbe se RECALCULE de
        // ses paramètres, et en stocker trois cents échantillons serait
        // stocker ce qu'on sait refaire. Le pire cas MESURÉ (quatre
        // coniques, deux droites, une trace, un lieu, vingt états, plus
        // l'état de référence de §44) pèse ~18 Ko ; 60 Ko laissent de la
        // marge aux versions futures (coniques tournées, plusieurs scènes
        // comparées) sans jamais accepter un document que l'instrument ne
        // saurait rouvrir. La borne est tenue côté client par MAX_HISTORY
        // (conicState.js) et vérifiée par conicState.test.js.
        'conics' => ['maxBytes' => 60_000],
        // Le laboratoire des أعداد : treize MODES, chacun gardant ses propres
        // nombres — c'est le choix de numberState.js, parce qu'un élève qui
        // règle 84 et 36 dans le PGCD, passe au crible et revient doit
        // retrouver SES nombres. Chaque mode ne pèse pourtant que quelques
        // dizaines d'octets : un nombre, deux fractions `{n, d}`, une fenêtre.
        // Les LISTES ne sont jamais stockées — diviseurs, multiples, premiers,
        // passes du crible et termes se RECALCULENT de leur nombre, et en
        // garder mille serait stocker ce qu'on sait refaire ; seul l'arbre de
        // factorisation de §24, que l'élève CONSTRUIT, est gardé, borné en
        // profondeur par normalizeTree. Le pire cas MESURÉ (huit lignes de
        // proportionnalité, un arbre profond, trente notes pleines) pèse
        // ~13 Ko, dont les notes font l'essentiel ; un document ordinaire
        // pèse ~700 octets. 20 Ko laissent de la marge aux versions futures
        // sans jamais accepter un document que l'instrument ne saurait
        // rouvrir ; la borne est vérifiée par numberState.test.js.
        'numberLab' => ['maxBytes' => 20_000],
        // Le laboratoire d'analyse : une ou deux EXPRESSIONS (200 caractères
        // au plus chacune), trois paramètres, quatre abscisses (A, B, le point
        // de la limite, les bornes de l'intégrale), le réglage de Riemann, un
        // thème de transformation, vingt-six bascules, une fenêtre et deux
        // compteurs d'entraînement. Le document mesuré pèse ~790 octets, et
        // le pire cas (deux expressions pleines, toutes les couches, la
        // fenêtre) reste sous 1,5 Ko.
        //
        // Rien de ce qui se CALCULE n'est stocké : ni les échantillons de la
        // courbe, ni la dérivée, ni les racines, ni les extrema, ni les
        // tables de limites, ni les rectangles de Riemann — tout cela se
        // refait de l'expression et de la fenêtre, et en garder une copie
        // serait garder un mensonge en puissance (celui du jour où la
        // fonction change et où le tableau reste). 8 Ko laissent une marge
        // large aux versions futures sans jamais accepter un document que
        // l'instrument ne saurait rouvrir ; la borne est vérifiée par
        // analysisState.test.js.
        'analysis' => ['maxBytes' => 8_000],
        // Le مختبر المنطق والبرهان : dix aires (comme numberLab), chacune
        // gardant son propre petit état — une proposition active, P et Q
        // d'une table de vérité, un préréglage d'implication, les valeurs
        // essayées pour un contre-exemple, la pile d'une preuve en cours.
        // Rien de CALCULABLE n'est stocké : la table de vérité, la
        // contraposée, la recherche de contre-exemple se refont de l'énoncé
        // (logicMath.js) — comme numberLab ne stocke pas ses listes de
        // diviseurs. Le document mesuré pèse quelques centaines d'octets, et
        // le pire cas (notes pleines, historique de défis plein, échantillon
        // de quantificateur plein) reste sous 2 Ko. 8 Ko laissent une marge
        // large aux versions futures sans jamais accepter un document que
        // l'instrument ne saurait rouvrir ; la borne est vérifiée par
        // logicState.test.js.
        'logic' => ['maxBytes' => 8_000],
        // Le مختبر القياس : DIX enquêtes, chacune gardant son objet, son
        // tableau d'observations (vingt lignes au plus), la règle conjecturée
        // et ses épreuves (dix au plus) — c'est le choix de measureState.js,
        // parce qu'un élève qui remplit le tableau de l'aire, part mesurer un
        // cercle et revient doit retrouver SES mesures.
        //
        // Rien de ce qui se CALCULE n'est stocké : ni les carrés unités, ni
        // les secteurs du disque, ni les angles — tout cela se refait des
        // dimensions de l'objet, et en garder une copie serait garder un
        // mensonge en puissance. Une observation ne pèse que ses quelques
        // nombres, et la règle est un petit arbre borné en profondeur
        // (MAX_RULE_DEPTH). Le pire cas MESURÉ (les dix enquêtes pleines,
        // vingt observations et dix épreuves chacune) pèse ~22,5 Ko ; un
        // document ordinaire pèse quelques centaines d'octets. 40 Ko laissent
        // de la marge aux versions futures sans jamais accepter un document
        // que l'instrument ne saurait rouvrir ; la borne est tenue côté
        // client par MAX_OBSERVATIONS et vérifiée par measureState.test.js.
        'measurement' => ['maxBytes' => 40_000],
    ];

    public static function exists(string $tool): bool
    {
        return array_key_exists($tool, self::TOOLS);
    }

    public static function maxBytes(string $tool): int
    {
        return self::TOOLS[$tool]['maxBytes'];
    }

    /** @return string[] */
    public static function ids(): array
    {
        return array_keys(self::TOOLS);
    }
}
