<?php

namespace App\Domain\Classroom;

use App\Domain\Admin\ActivityLogger;
use App\Models\Classroom;
use App\Models\User;
use Illuminate\Support\Facades\DB;

/**
 * « بطاقات الدخول » — l'enseignant imprime, pour des élèves de SA classe,
 * le courriel et un mot de passe (propriétaire, 2026-10-22).
 *
 * Un mot de passe ne se RELIT pas : il est haché. L'enseignant n'imprime donc
 * jamais celui que l'élève a choisi — il en ÉMET un nouveau, qui remplace
 * l'ancien, et la réponse de cet appel est le SEUL endroit où il existe en
 * clair. Rien de lisible n'est stocké. L'élève peut le changer ensuite
 * (« نسيت كلمة المرور »).
 *
 * Exception assumée au contrat de ClassroomAccess::identity() (« jamais le
 * courriel ») : la carte imprimée porte l'adresse, sans quoi elle n'ouvre
 * rien. Elle ne sort QUE dans la réponse de ce geste — aucune lecture
 * /teacher ne la renvoie (TeacherPrivacyContractTest).
 *
 * Les sessions ouvertes de l'élève ne sont pas coupées : la carte sert à
 * entrer sur une autre tablette, pas à chasser l'élève de la sienne.
 */
final class StudentCredentials
{
    /** Lettres sans ambiguïté à l'écrit (ni i, l, o) — un enfant recopie la carte. */
    private const LETTERS = 'abcdefghjkmnpqrstuvwxyz';

    /** L'alphabet d'un « معرّف الدخول » généré : sans i, l, o, 0, 1. */
    private const LOGIN_ALPHABET = 'abcdefghjkmnpqrstuvwxyz23456789';

    public function __construct(private ActivityLogger $log) {}

    /**
     * @param  int[]  $studentIds
     * @return list<array{id: int, firstName: ?string, lastName: ?string, email: string, password: string}>
     *
     * @throws ClassroomException
     */
    public function issue(User $teacher, Classroom $classroom, array $studentIds): array
    {
        if (! $classroom->isActive()) {
            throw new ClassroomException(ClassroomException::CLASS_INACTIVE, 'Cette classe est archivée.');
        }

        $ids = ClassroomAccess::activeStudentIds($classroom, $studentIds);

        $cards = DB::transaction(function () use ($ids) {
            return User::query()
                ->whereIn('id', $ids)
                ->orderBy('last_name')
                ->orderBy('first_name')
                ->get()
                ->map(function (User $student) {
                    $password = self::generate();
                    $student->forceFill(['password' => $password])->save();

                    return ClassroomAccess::identity($student) + [
                        'email' => $student->email,
                        'password' => $password,
                    ];
                })
                ->all();
        });

        // Trace du geste — jamais le mot de passe.
        $this->log->log($teacher, ActivityLogger::TEACHER_STUDENT_CREDENTIALS_ISSUED, 'classroom', $classroom->id, null, [
            'student_ids' => $ids,
        ]);

        return $cards;
    }

    /**
     * Quatre lettres puis quatre chiffres (« kmar4827 ») : 8 caractères, une
     * lettre et un chiffre — les règles de l'inscription —, facile à recopier.
     */
    public static function generate(): string
    {
        $letters = '';
        for ($i = 0; $i < 4; $i++) {
            $letters .= self::LETTERS[random_int(0, strlen(self::LETTERS) - 1)];
        }

        return $letters.str_pad((string) random_int(0, 9999), 4, '0', STR_PAD_LEFT);
    }

    /**
     * Un « معرّف الدخول » neuf (SCHOOL_ADMIN_SPACE.md §7) : `<préfixe>.<6 caractères>@<domaine>` — la forme d'une
     * adresse, sans boîte aux lettres derrière (User::hasSchoolLogin). Le domaine est
     * `config('school.student_login_domain')` ; le préfixe dit qui a créé le compte (`s<id>` un établissement, `a`
     * l'administrateur). Jamais deux fois le même.
     */
    public static function uniqueLogin(string $prefix): string
    {
        $domain = (string) config('school.student_login_domain');
        do {
            $suffix = '';
            for ($i = 0; $i < 6; $i++) {
                $suffix .= self::LOGIN_ALPHABET[random_int(0, strlen(self::LOGIN_ALPHABET) - 1)];
            }
            $login = "{$prefix}.{$suffix}@{$domain}";
        } while (User::where('email', $login)->exists());

        return $login;
    }
}
