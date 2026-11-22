<?php

namespace App\Http\Controllers;

use App\Domain\Push\AdminPush;
use App\Domain\Registration\RegistrationGate;
use App\Models\Contact;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * LA LISTE D'ATTENTE pendant que les inscriptions sont fermées (config/registration.php).
 *
 * `GET /registration` dit au site si l'on s'inscrit ; `POST /waitlist` garde une adresse e-mail (et, s'ils sont
 * donnés, un nom, un rôle et un numéro de téléphone français) dans `contacts` avec `objectif = waitlist` :
 * l'administrateur la lit dans les messages de contact, avec les autres, et reçoit la même notification. Une adresse
 * déjà inscrite ne l'est pas deux fois. On prévient par e-mail : c'est ce qu'un parent ou un professeur en France
 * attend, et ce que la plateforme sait envoyer.
 */
class WaitlistController extends Controller
{
    public const OBJECTIF = 'waitlist';

    /**
     * Un numéro français, fixe ou mobile : 0X ou +33 X (ou 0033 X), puis huit chiffres, groupés ou non par des
     * espaces, des points ou des tirets (« 06 12 34 56 78 », « +33 6 12 34 56 78 »).
     */
    public const FRENCH_PHONE = '/^(?:0|\+33 ?|0033 ?)[1-9](?:[ .\-]?[0-9]{2}){4}$/';

    public function status(RegistrationGate $gate): JsonResponse
    {
        return response()->json([
            'success' => true,
            ...$gate->settings(),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $request->merge(['email' => mb_strtolower(trim((string) $request->input('email', '')))]);
        $validated = $request->validate([
            'email' => ['required', 'string', 'email', 'max:255'],
            'name' => 'nullable|string|max:100',
            'role' => 'nullable|string|in:student,teacher,parent',
            'phone' => ['nullable', 'string', 'max:30', 'regex:'.self::FRENCH_PHONE],
        ], [
            'email.required' => 'Indiquez votre adresse e-mail.',
            'email.email' => 'Cette adresse e-mail n’est pas valide.',
            'phone.regex' => 'Ce numéro de téléphone n’est pas un numéro français valide.',
        ]);

        $email = $validated['email'];
        $phone = isset($validated['phone']) ? preg_replace('/[ .\-]/', '', $validated['phone']) : null;
        $known = Contact::where('objectif', self::OBJECTIF)->where('email', $email)->exists();
        if (! $known) {
            $contact = Contact::create([
                'name' => trim((string) ($validated['name'] ?? '')) ?: 'Liste d’attente',
                'email' => $email,
                'message' => 'À prévenir à l’ouverture de la plateforme.',
                'classe' => $validated['role'] ?? null,
                'objectif' => self::OBJECTIF,
                'phone' => $phone,
            ]);
            AdminPush::later('contact_message', $contact->id);
        }

        return response()->json([
            'success' => true,
            'message' => 'C’est noté : nous vous écrirons à l’ouverture de la plateforme.',
        ], $known ? 200 : 201);
    }
}
