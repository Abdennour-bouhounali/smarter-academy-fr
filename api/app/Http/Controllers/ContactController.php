<?php

namespace App\Http\Controllers;

use App\Models\Contact;
use Illuminate\Http\Request;

class ContactController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|min:2|max:100',
            'email' => 'required|email|max:255',
            'message' => 'required|string|min:10|max:5000',
            'classe' => 'nullable|string|max:150',
            'ville' => 'nullable|string|max:150',
            'objectif' => 'nullable|string|max:150',
            'phone' => 'nullable|string|max:50',
        ], [
            'name.min' => 'Le nom doit faire au moins 2 caractères',
            'email.email' => 'Format email invalide',
            'message.min' => 'Le message est trop court',
        ]);

        Contact::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Votre message a bien été envoyé.'
        ], 201);
    }

    public function index()
    {
        $contacts = Contact::orderBy('created_at', 'desc')->get();

        return response()->json([
            'success' => true,
            'contacts' => $contacts,
        ]);
    }
}
