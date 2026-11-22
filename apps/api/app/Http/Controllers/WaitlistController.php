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
 * `GET /registration` dit au site si l'on s'inscrit ; `POST /waitlist` garde un numéro de téléphone (et un nom, s'il
 * est donné) dans `contacts` avec `objectif = waitlist` : l'administrateur le lit dans « رسائل التواصل », avec les
 * autres messages, et reçoit la même notification. Un numéro déjà inscrit n'est pas inscrit deux fois.
 */
class WaitlistController extends Controller
{
    public const OBJECTIF = 'waitlist';

    public function status(RegistrationGate $gate): JsonResponse
    {
        return response()->json([
            'success' => true,
            ...$gate->settings(),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            // un numéro algérien ou international : des chiffres, un + éventuel, des espaces ou tirets tolérés
            'phone' => ['required', 'string', 'max:30', 'regex:/^\+?[0-9][0-9 .\-]{7,24}$/'],
            'name' => 'nullable|string|max:100',
            'role' => 'nullable|string|in:student,teacher,parent',
        ], [
            'phone.required' => 'اكتب رقم هاتفك.',
            'phone.regex' => 'رقم الهاتف غير صحيح.',
        ]);

        $phone = preg_replace('/[ .\-]/', '', $validated['phone']);
        $known = Contact::where('objectif', self::OBJECTIF)->where('phone', $phone)->exists();
        if (! $known) {
            $contact = Contact::create([
                'name' => trim((string) ($validated['name'] ?? '')) ?: 'قائمة الانتظار',
                // `contacts.email` est obligatoire : une adresse qui dit d'où vient la ligne, jamais celle d'une personne
                'email' => 'waitlist@smarter-academy.com',
                'message' => 'يريد أن نتّصل به عند فتح المنصّة.',
                'classe' => $validated['role'] ?? null,
                'objectif' => self::OBJECTIF,
                'phone' => $phone,
            ]);
            AdminPush::later('contact_message', $contact->id);
        }

        return response()->json(['success' => true, 'message' => 'سجّلنا رقمك. سنتّصل بك عند فتح المنصّة.'], $known ? 200 : 201);
    }
}
