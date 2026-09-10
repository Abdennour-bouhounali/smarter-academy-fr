<?php

namespace App\Http\Controllers;

use App\Domain\Access\ContentAccess;
use App\Domain\Practice\ExerciseRepository;
use App\Domain\Practice\PracticeCapability;
use App\Models\Lesson;
use App\Models\PracticeExercise;
use Illuminate\Http\Request;

/**
 * Ce que l'élève a le droit de voir — l'autorité de publication, servie au
 * frontend.
 *
 * Pourquoi ce contrôleur existe : le catalogue des leçons vit dans le bundle
 * (packages/core/curriculum), donc sans cet appel le frontend n'a AUCUN moyen
 * de savoir qu'une leçon vient d'être masquée. Il continuerait de l'afficher,
 * et l'élève ne découvrirait le refus qu'en butant sur une erreur.
 *
 * Le serveur reste l'autorité : cette réponse ne fait qu'ALIGNER l'affichage
 * sur une décision déjà appliquée côté serveur. Un client qui l'ignorerait ne
 * gagnerait aucun accès (voir ContentAccess, appelé sur chaque écriture).
 */
class ContentAvailabilityController extends Controller
{
    public function __construct(private ExerciseRepository $exercises) {}

    /**
     * L'inventaire des FERMETURES. Court par construction : il n'y a
     * normalement qu'une poignée de contenus non publiés.
     */
    public function index()
    {
        return response()->json([
            'success' => true,
            'closed' => ContentAccess::closedInventory(),
        ]);
    }

    /**
     * L'inventaire des exercices d'une leçon — servi par le REGISTRE, pas par
     * le contenu.
     *
     * C'est ce qui corrige le trou connu : jusqu'ici la liste venait des
     * fichiers embarqués dans le bundle, donc un exercice masqué restait
     * listé et cliquable (le refus n'arrivait qu'à l'ouverture de la
     * question). Le registre décide maintenant de la LISTE ; les fichiers
     * gardent le CONTENU pédagogique.
     *
     * Ne renvoie AUCUN énoncé, aucune réponse : uniquement de quoi afficher
     * une liste et lancer une séance.
     */
    public function exercises(Request $request, string $lessonCode)
    {
        if (! Lesson::where('code', $lessonCode)->exists()) {
            abort(404);
        }

        // Une leçon fermée ne liste rien du tout.
        if (! $this->lessonIsOpen($lessonCode)) {
            return response()->json([
                'success' => true,
                'available' => false,
                'reason' => 'lesson_unavailable',
                'exercises' => [],
                'countsByLevel' => [],
            ]);
        }

        $registered = PracticeExercise::whereHas('lesson', fn ($q) => $q->where('code', $lessonCode))
            ->whereNull('retired_at')
            ->get()
            ->keyBy('exercise_code');

        $exercises = [];
        $countsByLevel = [];

        foreach ($this->exercises->indexFor($lessonCode) as $level => $codes) {
            foreach ($codes as $code) {
                $row = $registered->get($code);

                // Inconnu du registre : servi (la base miroite le contenu,
                // elle n'en est pas l'autorité). Connu mais non publié :
                // retiré de la liste, sans dire pourquoi.
                if ($row && ! $row->isVisibleToStudents()) {
                    continue;
                }

                $exercises[] = [
                    'exerciseCode' => $code,
                    'level' => (int) $level,
                    'title' => $row?->title,
                    'questionCount' => $row?->question_count,
                ];
                $countsByLevel[(int) $level] = ($countsByLevel[(int) $level] ?? 0) + 1;
            }
        }

        ksort($countsByLevel);

        return response()->json([
            'success' => true,
            'available' => PracticeCapability::isActive($lessonCode),
            'exercises' => $exercises,
            'countsByLevel' => $countsByLevel,
        ]);
    }

    private function lessonIsOpen(string $lessonCode): bool
    {
        return Lesson::where('code', $lessonCode)
            ->where('publication_status', Lesson::PUB_PUBLISHED)
            ->exists()
            || ! Lesson::where('code', $lessonCode)->exists();
    }
}
