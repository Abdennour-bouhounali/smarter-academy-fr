<?php

namespace App\Domain\Access;

use App\Models\Lesson;
use App\Models\LessonModule;
use App\Models\PracticeExercise;
use App\Models\User;
use DomainException;
use Illuminate\Support\Collection;

/**
 * La porte d'accès au contenu — UN seul endroit.
 *
 * La spec (§24) demande que la décision d'accès soit centralisée plutôt que
 * dispersée en conditions dans des composants. C'est ici.
 *
 * L'ordre est celui du contrat :
 *
 *     état du compte  (middleware account.active, en amont de toute route)
 *          ↓
 *     droit d'accès / palier          ← EntitlementService
 *          ↓
 *     état de publication du contenu  ← ce fichier
 *
 * LES DEUX DOIVENT ÊTRE SATISFAITS, et ils ne se remplacent jamais l'un
 * l'autre. C'est l'invariant central de cette couche :
 *
 *     droit valide + leçon masquée  = REFUS
 *     leçon publiée + aucun droit   = REFUS
 *
 * En particulier, une dérogation d'administration n'est PAS un passe-droit
 * vers du contenu non publié (spec §29) : elle répond « cet élève a la
 * permission commerciale », pas « ce contenu peut être servi ». Un contenu
 * masqué l'est parce qu'il est faux ou en cours de relecture — le montrer à
 * quelqu'un qui a payé serait pire, pas mieux.
 *
 * Le palier est évalué AVANT la publication pour que le message rendu soit le
 * plus utile des deux : à un élève sans abonnement devant une leçon payante
 * et masquée, « il faut un accès premium » est actionnable là où « leçon
 * indisponible » ne l'est pas.
 *
 * Une leçon ABSENTE du registre reste accessible : la base est un miroir du
 * contenu, pas son autorité. Refuser ce qui n'est pas encore importé
 * fermerait la plateforme au premier oubli de synchronisation.
 */
class ContentAccess
{
    /**
     * La leçon est-elle ouverte à CET élève ?
     *
     * $user est explicite plutôt que lu depuis auth() : une décision d'accès
     * qui va chercher son sujet dans un état global est une décision qu'on ne
     * peut pas tester en table de vérité, et c'est exactement ce que la
     * matrice de la spec §40 demande de couvrir. Null = visiteur anonyme.
     *
     * @throws DomainException si le palier n'est pas satisfait, ou si la
     *                         leçon est masquée, archivée ou en brouillon.
     */
    public static function assertLessonAvailable(string $lessonCode, ?User $user = null): void
    {
        $lessons = Lesson::where('code', $lessonCode)->get();

        // Inconnue du registre : on laisse passer (voir le docblock).
        if ($lessons->isEmpty()) {
            return;
        }

        self::assertEntitled($lessons, $user);

        // Un code de leçon se répète d'une classe à l'autre. Si AU MOINS une
        // des leçons portant ce code est publiée, l'accès reste ouvert :
        // masquer la version de 6e ne doit pas fermer celle de 3e.
        if ($lessons->contains(fn (Lesson $lesson) => $lesson->isVisibleToStudents())) {
            return;
        }

        throw new DomainException('Cette leçon n\'est pas disponible pour le moment.');
    }

    /**
     * Le MODULE est-il ouvert ?
     *
     * Pas de cascade : un module en brouillon reste inaccessible sous une
     * leçon publiée, et publier une leçon ne publie aucun module. Chaque
     * niveau porte son propre état — c'est ce qui permet de retirer UN module
     * cassé sans fermer la leçon entière (spec §10), et ce qui évite qu'une
     * publication de leçon ouvre par surprise du contenu jamais relu.
     *
     * @throws DomainException si le module est masqué, archivé ou en brouillon.
     */
    public static function assertModuleAvailable(string $lessonCode, int|string $moduleRef, ?User $user = null): void
    {
        // La leçon d'abord : inutile de dire « module indisponible » quand
        // c'est toute la leçon qui est fermée. C'est aussi ce qui fait porter
        // le palier au module sans qu'il ait à le redemander — le module
        // hérite du palier de sa leçon, il n'en a pas un à lui.
        self::assertLessonAvailable($lessonCode, $user);

        $modules = LessonModule::whereHas('lesson', fn ($q) => $q->where('code', $lessonCode))
            ->where(function ($q) use ($moduleRef) {
                // Le client désigne un module par son NUMÉRO (la progression
                // stocke des numéros) ou par son CODE ('00', '07'). Les deux
                // sont acceptés parce que les deux circulent déjà.
                $q->where('code', (string) $moduleRef);
                if (is_numeric($moduleRef)) {
                    $q->orWhere('number', (int) $moduleRef);
                }
            })
            ->whereNull('retired_at')
            ->get();

        // Inconnu du registre : on laisse passer, même raison que pour la
        // leçon — la base miroite le contenu, elle n'en est pas l'autorité.
        if ($modules->isEmpty()) {
            return;
        }

        if ($modules->contains(fn (LessonModule $module) => $module->isVisibleToStudents())) {
            return;
        }

        throw new DomainException('Ce module n\'est pas disponible pour le moment.');
    }

    /** Variante non levante, pour filtrer une liste. */
    public static function isModuleAvailable(string $lessonCode, int|string $moduleRef, ?User $user = null): bool
    {
        try {
            self::assertModuleAvailable($lessonCode, $moduleRef, $user);

            return true;
        } catch (DomainException) {
            return false;
        }
    }

    /**
     * L'exercice est-il ouvert à CET élève ?
     *
     * Deux dimensions, comme partout : la publication et le palier.
     *
     * Le palier de la LEÇON a déjà été tranché en amont — les deux points
     * d'entrée qui ouvrent un exercice (ouvrir une séance, ouvrir une
     * question) passent par assertLessonAvailable. Ce qui reste à vérifier
     * ici, c'est le palier PROPRE à l'exercice : un exercice explicitement
     * payant sous une leçon gratuite. Sans ce contrôle, il suffirait d'une
     * leçon gratuite pour servir gratuitement tout exercice premium qu'elle
     * contient.
     *
     * Le contrôle ne coûte rien quand il n'y a rien à contrôler : `tier` est
     * null pour tout le registre actuel, donc la branche premium n'est même
     * pas atteinte et aucune requête de droits n'est faite.
     */
    public static function isExerciseAvailable(string $lessonCode, string $exerciseCode, ?User $user = null): bool
    {
        $exercise = PracticeExercise::with('lesson:id,tier')
            ->whereHas('lesson', fn ($q) => $q->where('code', $lessonCode))
            ->where('exercise_code', $exerciseCode)
            ->first();

        // Inconnu du registre : servi. La base miroite le contenu, elle n'en
        // est pas l'autorité — même règle qu'aux deux niveaux au-dessus.
        if ($exercise === null) {
            return true;
        }

        if (! $exercise->isVisibleToStudents()) {
            return false;
        }

        $tier = AccessTier::effective($exercise->tier, $exercise->lesson?->tier);

        if ($tier === AccessTier::FREE) {
            return true;
        }

        return app(EntitlementService::class)->satisfies($user, AccessTier::PREMIUM);
    }

    /**
     * Le palier exigé par un code de leçon est-il satisfait ?
     *
     * Un code peut porter plusieurs leçons (le même intitulé en 6e et en 3e).
     * On retient le palier le MOINS restrictif : si une seule des versions est
     * gratuite, l'accès reste ouvert — même règle que pour la publication
     * juste au-dessus, et pour la même raison. Rendre payante la version de 3e
     * ne doit pas fermer celle de 6e.
     *
     * @param  Collection<int, Lesson>  $lessons
     *
     * @throws DomainException si aucun palier porté par ce code n'est satisfait.
     */
    private static function assertEntitled($lessons, ?User $user): void
    {
        $tiers = $lessons->map(fn (Lesson $l) => AccessTier::normalize($l->tier))->unique();

        // Le cas de très loin le plus fréquent — tout le catalogue actuel.
        // Traité en premier et sans injection de service : le gratuit ne pose
        // aucune question à la base.
        if ($tiers->contains(AccessTier::FREE)) {
            $entitlements = app(EntitlementService::class);
            $decision = $entitlements->decide($user, AccessTier::FREE);
            if (! $decision->allowed) {
                throw new DomainException($decision->studentMessage());
            }

            return;
        }

        $decision = app(EntitlementService::class)->decide($user, AccessTier::PREMIUM);

        if (! $decision->allowed) {
            throw new DomainException($decision->studentMessage());
        }
    }

    /**
     * L'inventaire d'accès destiné à l'élève : ce qui est FERMÉ.
     *
     * Renvoyé en liste de fermetures plutôt qu'en liste d'ouvertures : le
     * catalogue vit dans le frontend (coursesData.js), la base n'en est que
     * le miroir. Envoyer « voici les 132 leçons ouvertes » ferait de la base
     * une seconde définition du catalogue, qui dériverait. Envoyer « voici
     * les 3 choses fermées » laisse une seule source de vérité au contenu, et
     * une seule autorité à la publication.
     *
     * Conséquence voulue : une leçon absente du registre reste ouverte.
     *
     * @return array{lessons: string[], modules: array<string, int[]>, locked: string[]}
     */
    public static function closedInventory(?User $user = null): array
    {
        $closedLessons = Lesson::where('publication_status', '!=', Lesson::PUB_PUBLISHED)
            ->pluck('code')
            // Un code peut porter deux leçons (6e et 3e) : il n'est fermé que
            // si AUCUNE des deux n'est publiée. Même règle qu'assertLessonAvailable.
            ->unique()
            ->filter(fn (string $code) => ! Lesson::where('code', $code)
                ->where('publication_status', Lesson::PUB_PUBLISHED)
                ->exists())
            ->values()
            ->all();

        $closedModules = [];
        $rows = LessonModule::query()
            ->join('lessons', 'lessons.id', '=', 'lesson_modules.lesson_id')
            ->where('lesson_modules.publication_status', '!=', LessonModule::PUB_PUBLISHED)
            ->whereNull('lesson_modules.retired_at')
            ->get(['lessons.code as lesson_code', 'lesson_modules.number']);

        foreach ($rows as $row) {
            $closedModules[$row->lesson_code][] = (int) $row->number;
        }

        $premium = self::premiumLessonCodes();

        return [
            'lessons' => $closedLessons,
            'modules' => $closedModules,
            // Ce qui est PAYANT, et ce qui est payant ET fermé à cet élève.
            // Les deux listes, parce que les deux questions sont distinctes :
            // un abonné doit continuer de voir le badge « Premium » sur ce à
            // quoi il a accès (sinon le contenu vendu se déguise en gratuit,
            // et sa disparition à l'échéance devient incompréhensible), mais
            // rien ne doit lui être verrouillé.
            'premium' => $premium,
            'locked' => self::lockedLessonCodes($user, $premium),
        ];
    }

    /**
     * Les codes de leçon PAYANTS, indépendamment de qui regarde.
     *
     * Le catalogue vit dans le bundle et peut être en retard sur la base :
     * une leçon rendue payante aujourd'hui y reste « gratuite » jusqu'au
     * prochain déploiement. Cette liste est donc la seule source à jour du
     * palier, et c'est pourquoi elle est servie même à un élève qui a accès
     * à tout.
     *
     * @return string[]
     */
    private static function premiumLessonCodes(): array
    {
        $premium = Lesson::query()
            ->where('tier', AccessTier::PREMIUM)
            ->pluck('code')
            ->unique();

        if ($premium->isEmpty()) {
            return [];
        }

        // Un code porté par AU MOINS une leçon gratuite n'est pas payant —
        // même règle que partout ailleurs dans ce fichier.
        $free = Lesson::query()
            ->whereIn('code', $premium)
            ->where('tier', '!=', AccessTier::PREMIUM)
            ->pluck('code')
            ->unique()
            ->flip();

        return $premium->reject(fn (string $code) => $free->has($code))->values()->all();
    }

    /**
     * Les leçons PUBLIÉES que cet élève n'a pas le droit d'ouvrir.
     *
     * Volontairement séparé de `lessons` (les fermetures de publication),
     * parce que les deux appellent des interfaces différentes : une leçon
     * non publiée n'existe pas pour l'élève, une leçon verrouillée existe et
     * lui dit ce qui lui manque. Les confondre afficherait « indisponible »
     * là où il fallait proposer un abonnement (spec §26).
     *
     * Renvoyé vide si l'élève a un accès premium : dans ce cas il n'y a rien
     * à verrouiller, et la réponse reste courte. Le badge, lui, reste porté
     * par `premium`.
     *
     * @param  string[]  $premiumCodes
     * @return string[]
     */
    private static function lockedLessonCodes(?User $user, array $premiumCodes): array
    {
        // Le catalogue est intégralement gratuit : rien à verrouiller, et
        // aucune question posée aux droits d'accès.
        if ($premiumCodes === []) {
            return [];
        }

        if (app(EntitlementService::class)->satisfies($user, AccessTier::PREMIUM)) {
            return [];
        }

        return $premiumCodes;
    }

    /**
     * Les identifiants d'exercice à retirer d'un inventaire, pour une leçon.
     *
     * Renvoyé en liste plutôt qu'interrogé exercice par exercice : le tirage
     * d'une séance en examine une quinzaine, et quinze requêtes là où une
     * suffit se paierait à chaque ouverture.
     *
     * @return string[]
     */
    public static function hiddenExerciseCodes(string $lessonCode): array
    {
        return PracticeExercise::whereHas('lesson', fn ($q) => $q->where('code', $lessonCode))
            ->where('publication_status', '!=', PracticeExercise::PUB_PUBLISHED)
            ->pluck('exercise_code')
            ->all();
    }
}
