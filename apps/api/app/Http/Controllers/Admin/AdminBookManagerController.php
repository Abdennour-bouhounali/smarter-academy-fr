<?php

namespace App\Http\Controllers\Admin;

use App\Domain\Admin\AccountStatusService;
use App\Domain\Admin\ActivityLogger;
use App\Domain\School\SchoolService;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

/**
 * « مسيّرو المكتبة » — les gestionnaires de la librairie (BOOKS_STORE.md §6ter).
 *
 * L'administrateur SEUL les crée : un nouveau compte `book_manager`, adresse
 * vérifiée (l'administrateur l'a saisie et remet les identifiants lui-même),
 * et un mot de passe rendu UNE fois — jamais journalisé, jamais relu.
 * Une adresse qui a déjà un compte est refusée : on ne transforme pas un
 * élève ou un enseignant en gestionnaire.
 *
 * Le gestionnaire n'ouvre ensuite que la porte `books` : commandes, fiches
 * livres, messages, et son propre compte.
 */
class AdminBookManagerController extends Controller
{
    public function __construct(
        private ActivityLogger $logger,
        private AccountStatusService $accounts,
    ) {}

    public function index()
    {
        $managers = User::where('role', User::ROLE_BOOK_MANAGER)
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (User $u) => $this->serialize($u));

        return response()->json(['success' => true, 'managers' => $managers]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'firstName' => ['required', 'string', 'max:80'],
            'lastName' => ['required', 'string', 'max:80'],
            'email' => ['required', 'email', 'max:190'],
        ]);

        $email = mb_strtolower(trim($data['email']));
        if (User::where('email', $email)->exists()) {
            return response()->json([
                'success' => false,
                'reason' => 'email_taken',
                'message' => 'هذا البريد الإلكتروني مرتبط بحساب موجود.',
            ], 422);
        }

        $password = SchoolService::generatePassword();

        $manager = DB::transaction(function () use ($request, $data, $email, $password) {
            $manager = new User([
                'first_name' => trim($data['firstName']),
                'last_name' => trim($data['lastName']),
                'email' => $email,
                'password' => $password,
                'role' => User::ROLE_BOOK_MANAGER,
            ]);
            $manager->email_verified_at = now();
            $manager->save();

            $this->logger->log($request->user(), ActivityLogger::BOOK_MANAGER_CREATED, 'user', $manager->id, null, [
                'firstName' => $manager->first_name,
                'lastName' => $manager->last_name,
            ]);

            return $manager;
        });

        return response()->json([
            'success' => true,
            'manager' => $this->serialize($manager),
            // Rendu UNE fois : l'administrateur le remet au gestionnaire.
            'password' => $password,
        ], 201);
    }

    public function updateStatus(Request $request, int $id)
    {
        $data = $request->validate([
            'status' => ['required', Rule::in([User::STATUS_ACTIVE, User::STATUS_SUSPENDED])],
        ]);

        $manager = $this->find($id);
        $this->accounts->change($request->user(), $manager, $data['status'], ActivityLogger::BOOK_MANAGER_STATUS, 'user');
        // Suspendu : la porte `account.active` le refuse déjà ; on ferme aussi ses sessions.
        if ($data['status'] === User::STATUS_SUSPENDED) {
            $manager->tokens()->delete();
        }

        return response()->json(['success' => true, 'manager' => $this->serialize($manager->fresh())]);
    }

    public function resetPassword(Request $request, int $id)
    {
        $manager = $this->find($id);
        $password = SchoolService::generatePassword();

        DB::transaction(function () use ($request, $manager, $password) {
            $manager->password = $password;
            $manager->save();
            $manager->tokens()->delete();
            $this->logger->log($request->user(), ActivityLogger::BOOK_MANAGER_PASSWORD_RESET, 'user', $manager->id);
        });

        return response()->json(['success' => true, 'password' => $password]);
    }

    private function find(int $id): User
    {
        return User::where('role', User::ROLE_BOOK_MANAGER)->findOrFail($id);
    }

    /** @return array<string, mixed> */
    private function serialize(User $u): array
    {
        return [
            'id' => $u->id,
            'firstName' => $u->first_name,
            'lastName' => $u->last_name,
            'email' => $u->email,
            'status' => $u->account_status,
            'createdAt' => $u->created_at,
            'lastActivityAt' => $u->last_activity_at,
        ];
    }
}
