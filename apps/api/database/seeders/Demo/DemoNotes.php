<?php

namespace Database\Seeders\Demo;

use App\Models\NotebookNote;
use App\Models\User;
use Illuminate\Support\Carbon;

/**
 * Le CAHIER de l'élève (كرّاسي) — son écriture privée.
 *
 * Les notes sont en arabe, comme l'espace élève : le cahier est rédigé PAR
 * l'élève, et cet élève écrit dans la langue de son cours. Chaque note
 * d'erreur est accrochée à une vraie erreur-type du contenu
 * (content/practice/misconceptions.json) et au couple exercice/question qui
 * l'a provoquée : la note s'ouvre donc sur la question qui l'a fait naître,
 * au lieu de pendre dans le vide.
 *
 * Aucun élève n'écrit la même chose : le texte est choisi par l'erreur
 * rencontrée, et le nombre de notes vient de l'appétit déclaré du portrait.
 */
final class DemoNotes
{
    /**
     * Ce que l'élève écrit quand il retombe sur telle erreur — une phrase
     * d'élève, à la première personne, pas une définition de manuel.
     *
     * @var array<string, array{title: string, body: string, type: string}>
     */
    private const BY_MISCONCEPTION = [
        'MISC-QISMA-BAQI-KABIR' => [
            'title' => 'Le reste est toujours plus petit que le diviseur',
            'body' => 'Encore le même piège : j’ai écrit 137 = 5 × 25 + 12 et je l’ai accepté. Mais 12 est plus grand que 5, donc la division n’est pas finie. La règle : le reste doit être strictement plus petit que le diviseur.',
            'type' => 'erreur',
        ],
        'MISC-QISMA-HASIL-BAQI' => [
            'title' => 'Ne pas confondre quotient et reste',
            'body' => 'Dans a = b × q + r, q est le quotient et r le reste. Dans 72 = 24 × 3, le reste est nul, et 3 n’est pas le reste mais le quotient. J’écris toujours l’égalité en entier avant de répondre.',
            'type' => 'erreur',
        ],
        'MISC-QISMA-6-ZAWJI-FAQAT' => [
            'title' => 'Pair ne veut pas dire divisible par 6',
            'body' => '14 est pair, mais il n’est pas divisible par 6. Pour être divisible par 6, un nombre doit être divisible à la fois par 2 et par 3.',
            'type' => 'erreur',
        ],
        'MISC-QASIM-MUDAAF-ITTIJAH' => [
            'title' => 'Le sens de « divise » et de « multiple »',
            'body' => 'Si 3 divise 12, alors 12 est un multiple de 3, et pas l’inverse. Le diviseur est le plus petit, le multiple le plus grand. Je relis la phrase lentement avant de répondre.',
            'type' => 'rappel',
        ],
        'MISC-QAWASIM-NASY-1-WA-N' => [
            'title' => 'Ne pas oublier 1 et le nombre lui-même',
            'body' => 'Chaque fois que je cherche les diviseurs d’un nombre, j’oublie 1 et le nombre lui-même. Ce sont toujours des diviseurs. Je commence ma liste par eux, puis je complète.',
            'type' => 'erreur',
        ],
        'MISC-QAWASIM-A-BADAL-A-ZAID-7' => [
            'title' => 'Répondre à la question posée',
            'body' => 'On me demandait les valeurs de a, et j’ai donné les diviseurs de 24. Je lis la question deux fois et je souligne ce qui est vraiment demandé.',
            'type' => 'erreur',
        ],
        'MISC-PGCD-HASIL-BADAL-QASIM' => [
            'title' => 'Le PGCD n’est pas le quotient',
            'body' => 'Dans le problème des bouquets : le nombre de bouquets est le PGCD, et ce qu’on met dans chaque bouquet est le quotient de chaque nombre par le PGCD. J’écris les deux clairement pour ne pas les mélanger.',
            'type' => 'erreur',
        ],
        'MISC-PGCD-LAYSA-AKBAR' => [
            'title' => 'Le plus grand, pas n’importe quel diviseur commun',
            'body' => 'J’ai trouvé un diviseur commun et j’ai arrêté là. Mais on demande le plus grand. J’écris tous les diviseurs communs, puis je choisis le plus grand.',
            'type' => 'erreur',
        ],
        'MISC-PGCD-SIFR' => [
            'title' => 'PGCD(a ; 0) = a',
            'body' => 'Je croyais que le PGCD avec 0 valait 0. Tout nombre divise 0, donc le plus grand diviseur commun est a lui-même.',
            'type' => 'rappel',
        ],
        'MISC-PGCD-MUDAAF-15' => [
            'title' => 'Diviseur, pas multiple',
            'body' => 'Quand on demande PGCD(a ; 15) = 5, 5 doit être un diviseur commun : je cherche un nombre divisible par 5, pas un multiple de 15.',
            'type' => 'erreur',
        ],
        'MISC-AWWALIYAN-ADAD-AWWALI' => [
            'title' => 'Premiers entre eux ≠ nombres premiers',
            'body' => '8 et 9 ne sont pas premiers, mais ils sont premiers entre eux car PGCD(8 ; 9) = 1. La seule condition : leur plus grand diviseur commun vaut 1.',
            'type' => 'erreur',
        ],
        'MISC-IKHTIZAL-NAQIS' => [
            'title' => 'Vérifier que la fraction est irréductible',
            'body' => 'J’ai simplifié la fraction une fois et j’ai arrêté là, mais elle se simplifiait encore. La méthode sûre : diviser le numérateur et le dénominateur par le PGCD, puis vérifier qu’ils sont premiers entre eux.',
            'type' => 'erreur',
        ],
    ];

    /** Des notes qui ne viennent pas d'une erreur : méthode, rappel, résumé. */
    private const FREE_NOTES = [
        ['title' => 'Algorithme d’Euclide — les étapes', 'body' => 'Je divise le plus grand par le plus petit, je garde le reste, je divise à nouveau par le reste, et ainsi de suite. Le dernier reste non nul est le PGCD. Bien plus rapide que la méthode des soustractions quand les deux nombres sont éloignés.', 'type' => 'astuce'],
        ['title' => 'Les critères de divisibilité', 'body' => 'Par 2 : le dernier chiffre est pair. Par 3 : la somme des chiffres est divisible par 3. Par 5 : il se termine par 0 ou 5. Par 9 : la somme des chiffres est divisible par 9.', 'type' => 'resume'],
        ['title' => 'Quand arrêter de chercher les diviseurs ?', 'body' => 'Je teste les nombres dont le carré est inférieur ou égal au nombre. Chaque diviseur trouvé m’en donne un deuxième avec lui.', 'type' => 'astuce'],
        ['title' => 'Une question pour mon professeur', 'body' => 'Le PGCD de deux nombres peut-il être plus grand que le plus petit des deux ? Je pense que non, mais je veux vérifier.', 'type' => 'question'],
        ['title' => 'Un exemple à revoir', 'body' => 'PGCD(42 ; 60) : les diviseurs de 42 sont 1, 2, 3, 6, 7, 14, 21, 42 — et parmi ceux de 60 il y a 1, 2, 3, 6. Les diviseurs communs : 1, 2, 3, 6. Le plus grand : 6.', 'type' => 'exemple'],
    ];

    /**
     * @param  array<int, array<string, mixed>>  $mistakes  les erreurs rencontrées pendant la simulation
     */
    public function write(User $student, DemoPersona $persona, array $mistakes): void
    {
        $budget = $persona->noteAppetite;
        if ($budget <= 0) {
            return;
        }

        // Une note par erreur-type RENCONTRÉE, la plus récente d'abord :
        // l'élève écrit sur ce qui lui résiste, pas sur tout.
        $seen = [];
        $written = 0;
        foreach (array_reverse($mistakes) as $mistake) {
            if ($written >= $budget) {
                break;
            }
            $key = $mistake['misconception'];
            if (isset($seen[$key]) || ! isset(self::BY_MISCONCEPTION[$key])) {
                continue;
            }
            $seen[$key] = true;

            $template = self::BY_MISCONCEPTION[$key];
            $at = Carbon::parse($mistake['at'])->addMinutes(3);
            $this->create($student, [
                'title' => $template['title'],
                'lesson_id' => $mistake['lesson']->id,
                'learning_point_id' => null,
                'exercise_id' => $mistake['exerciseId'],
                'question_id' => $mistake['questionId'],
                'mistake_type' => $key,
                'note_type' => $template['type'],
                'content' => '<p>'.$template['body'].'</p>',
            ], $at, $written === 0);
            $written++;
        }

        // Puis, s'il lui reste de l'appétit, des notes libres.
        $lesson = $mistakes !== [] ? end($mistakes)['lesson'] : null;
        foreach (self::FREE_NOTES as $i => $note) {
            if ($written >= $budget) {
                break;
            }
            $at = Carbon::now()->subDays($persona->lastSeenDaysAgo + $i * 4)->setTime(19, 20);
            $this->create($student, [
                'title' => $note['title'],
                'lesson_id' => $lesson?->id,
                'learning_point_id' => null,
                'exercise_id' => null,
                'question_id' => null,
                'mistake_type' => null,
                'note_type' => $note['type'],
                'content' => '<p>'.$note['body'].'</p>',
            ], $at, false);
            $written++;
        }
    }

    private function create(User $student, array $attributes, Carbon $at, bool $pinned): void
    {
        NotebookNote::create([
            'user_id' => $student->id,
            ...$attributes,
            'content_text' => NotebookNote::plainText($attributes['content']),
            'is_pinned' => $pinned,
            'created_at' => $at,
            'updated_at' => $at,
        ]);
    }
}
