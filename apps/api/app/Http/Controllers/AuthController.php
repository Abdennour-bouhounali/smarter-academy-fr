<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rules\Password;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => ['required', 'confirmed', Password::min(8)->letters()->numbers()],
            'grade' => 'required|string|max:50',
        ], [
            'email.unique' => 'Un compte existe déjà avec cet email.',
            'email.email' => 'Format email invalide.',
            'password.confirmed' => 'Les mots de passe ne correspondent pas.',
            'password.min' => 'Le mot de passe doit faire au moins 8 caractères.',
            'password.letters' => 'Le mot de passe doit contenir au moins une lettre.',
            'password.numbers' => 'Le mot de passe doit contenir au moins un chiffre.',
            'grade.required' => 'Merci de sélectionner votre classe.',
        ]);

        // role is never taken from client input: every self-registration is a student.
        // The only way to provision an admin is the CreateAdmin CLI command.
        $user = User::create([
            'first_name' => $validated['first_name'],
            'last_name' => $validated['last_name'],
            'email' => $validated['email'],
            'password' => $validated['password'],
            'role' => 'student',
            'grade' => $validated['grade'],
        ]);

        $token = $user->createToken('student-token')->plainTextToken;

        return response()->json([
            'success' => true,
            'token' => $token,
            'user' => $this->formatUser($user),
        ], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if (Auth::attempt($request->only('email', 'password'))) {
            $user = Auth::user();

            $token = $user->createToken($user->role.'-token')->plainTextToken;

            return response()->json([
                'success' => true,
                'token' => $token,
                'user' => $this->formatUser($user),
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Email ou mot de passe incorrect.',
        ], 401);
    }

    public function me(Request $request)
    {
        return response()->json([
            'success' => true,
            'user' => $this->formatUser($request->user()),
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Déconnecté.',
        ]);
    }

    /**
     * Updates the current user's grade — the one way a student's default
     * learning context changes after registration. Never touches progress
     * data (which lives client-side, keyed by lesson id, not grade).
     */
    public function updateGrade(Request $request)
    {
        $validated = $request->validate([
            'grade' => 'required|string|max:50',
        ], [
            'grade.required' => 'Merci de sélectionner une classe.',
        ]);

        $user = $request->user();
        $user->update(['grade' => $validated['grade']]);

        return response()->json([
            'success' => true,
            'user' => $this->formatUser($user),
        ]);
    }

    private function formatUser(User $user): array
    {
        return [
            'id' => $user->id,
            'firstName' => $user->first_name,
            'lastName' => $user->last_name,
            'email' => $user->email,
            'role' => $user->role,
            'grade' => $user->grade,
        ];
    }
}
