<?php

namespace App\Http\Controllers;

use App\Domain\Access\AccessDecision;
use App\Domain\Access\AccessTier;
use App\Domain\Access\ContentAccess;
use App\Domain\Access\EntitlementService;
use App\Domain\Practice\ExerciseRepository;
use App\Domain\Practice\PracticeCapability;
use App\Models\Lesson;
use App\Models\PracticeExercise;
use DomainException;
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
    public function __construct(
        private ExerciseRepository $exercises,
        private EntitlementService $entitlements,
    ) {}

    /**
     * L'inventaire des FERMETURES. Court par construction : il n'y a
     * normalement qu'une poignée de contenus non publiés.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        return response()->json([
            'success' => true,
            // `closed.lessons` = non publié (n'existe pas pour l'élève).
            // `closed.locked` = publié mais hors de son droit d'accès.
            // Deux listes et non une : voir ContentAccess::lockedLessonCodes.
            'closed' => ContentAccess::closedInventory($user),
            // L'état d'accès, pour l'affichage UNIQUEMENT. Le serveur reste
            // l'autorité : un client qui mentirait sur ce bloc ne gagnerait
            // rien, chaque écriture repasse par ContentAccess (spec §12).
            'access' => $this->entitlements->summarize($user),
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

        // Verrouillée par le palier : même silence que pour une leçon fermée.
        // Le motif diffère (l'élève peut y remédier, donc on le lui dit), mais
        // l'inventaire reste vide — le titre d'un exercice et son nombre de
        // questions font partie du contenu payant (spec §46).
        try {
            ContentAccess::assertLessonAvailable($lessonCode, $request->user());
        } catch (DomainException) {
            return response()->json([
                'success' => true,
                'available' => false,
                'reason' => AccessDecision::PREMIUM_REQUIRED,
                'exercises' => [],
                'countsByLevel' => [],
            ]);
        }

        $registered = PracticeExercise::whereHas('lesson', fn ($q) => $q->where('code', $lessonCode))
            ->whereNull('retired_at')
            ->get()
            ->keyBy('exercise_code');

        // Le palier de la leçon, pour que les exercices qui n'en déclarent
        // pas en héritent. Lu UNE fois, pas une fois par exercice.
        $lessonTier = Lesson::where('code', $lessonCode)->value('tier');

        // Le droit d'accès, évalué UNE seule fois pour toute la liste — et
        // seulement si au moins un exercice est payant. Le calculer par
        // exercice ferait une quinzaine de requêtes là où une suffit, à
        // chaque ouverture du Hub.
        $anyPremium = $registered->contains(
            fn (PracticeExercise $e) => AccessTier::isPremium(AccessTier::effective($e->tier, $lessonTier))
        );
        $entitled = ! $anyPremium || $this->entitlements->satisfies($request->user(), AccessTier::PREMIUM);

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

                $tier = AccessTier::effective($row?->tier, $lessonTier);
                $locked = AccessTier::isPremium($tier) && ! $entitled;

                // Un exercice payant verrouillé RESTE listé, avec son titre —
                // c'est ce qui permet à l'élève de voir ce qu'il obtiendrait
                // (spec §G). Mais son nombre de questions est tu : c'est une
                // information sur le contenu, pas sur l'offre.
                //
                // Il ne compte pas dans countsByLevel non plus : ce compteur
                // pilote la sélection d'une séance, et y inclure un exercice
                // que le serveur refusera d'ouvrir proposerait un niveau vide.
                $exercises[] = [
                    'exerciseCode' => $code,
                    'level' => (int) $level,
                    'title' => $row?->title,
                    'questionCount' => $locked ? null : $row?->question_count,
                    'tier' => $tier,
                    'locked' => $locked,
                ];

                if (! $locked) {
                    $countsByLevel[(int) $level] = ($countsByLevel[(int) $level] ?? 0) + 1;
                }
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
