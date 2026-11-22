<?php

namespace App\Domain\Identity;

use Illuminate\Http\Request;
use Normalizer;

/**
 * Prénom et nom — LA règle d'un nom de personne, pour tous les rôles.
 *
 * Trois portes écrivent un nom (inscription, fin d'inscription Google, profil)
 * et elles doivent refuser et normaliser exactement la même chose : un élève
 * ne doit pas pouvoir s'appeler différemment selon la porte empruntée.
 * Le miroir côté navigateur est apps/web/src/utils/personName.js — il ne sert
 * qu'à afficher un message avant l'aller-retour ; c'est ici qui fait foi.
 *
 * Ce qui est accepté : les lettres de l'alphabet français (a–z, A–Z et leurs
 * accents à â æ ç é è ê ë î ï ô œ ö ù û ü ÿ), et entre deux lettres une espace,
 * un trait d'union ou une apostrophe droite ou typographique (« Jean-Pierre »,
 * « O’Neil », « D'Almeida »). Refusés : les chiffres, les autres écritures
 * (arabe compris), la ponctuation, les emoji, les balises.
 */
final class PersonName
{
    public const MIN = 1;

    public const MAX = 50;

    /**
     * Une lettre, puis des lettres, ou un séparateur (espace, trait d'union,
     * apostrophe ' ou ’) suivi d'une lettre : jamais deux séparateurs de
     * suite, jamais en tête ni en queue. Miroir : utils/personName.js.
     */
    public const PATTERN = "/^[A-Za-zÀÂÆÇÉÈÊËÎÏÔŒÖÙÛÜŸàâæçéèêëîïôœöùûüÿ](?:[A-Za-zÀÂÆÇÉÈÊËÎÏÔŒÖÙÛÜŸàâæçéèêëîïôœöùûüÿ]|[ \\-'’](?=[A-Za-zÀÂÆÇÉÈÊËÎÏÔŒÖÙÛÜŸàâæçéèêëîïôœöùûüÿ]))*$/u";

    /** Les champs tels que le client les envoie. */
    public const FIELDS = ['firstName', 'lastName'];

    /**
     * Espaces de tête/queue retirés, espaces internes réduits à une seule ;
     * forme composée (NFC) quand l'extension intl est là, pour qu'un « é »
     * tapé en deux caractères (e + accent) soit la même lettre.
     */
    public static function normalize(mixed $value): mixed
    {
        if (! is_string($value)) {
            return $value;
        }

        if (class_exists(Normalizer::class)) {
            $value = Normalizer::normalize($value, Normalizer::FORM_C) ?: $value;
        }

        return trim((string) preg_replace('/\s+/u', ' ', $value));
    }

    /** Normalise, DANS la requête, les champs de nom qu'elle porte. */
    public static function normalizeRequest(Request $request): void
    {
        $present = array_intersect_key($request->all(), array_flip(self::FIELDS));
        $request->merge(array_map(self::normalize(...), $present));
    }

    /** @return array<string, array<int, string>> */
    public static function rules(): array
    {
        $rule = ['required', 'string', 'min:'.self::MIN, 'max:'.self::MAX, 'regex:'.self::PATTERN];

        return ['firstName' => $rule, 'lastName' => $rule];
    }

    /** Les messages que la personne lit. */
    public static function messages(): array
    {
        return [
            'firstName.required' => 'Le prénom est obligatoire.',
            'lastName.required' => 'Le nom est obligatoire.',
            'firstName.max' => 'Le prénom ne doit pas dépasser '.self::MAX.' caractères.',
            'lastName.max' => 'Le nom ne doit pas dépasser '.self::MAX.' caractères.',
            'firstName.regex' => 'Le prénom ne peut contenir que des lettres, des espaces, des traits d’union et des apostrophes.',
            'lastName.regex' => 'Le nom ne peut contenir que des lettres, des espaces, des traits d’union et des apostrophes.',
        ];
    }

    /** Un nom qui passerait la règle d'aujourd'hui (après normalisation). */
    public static function isValid(?string $value): bool
    {
        $name = (string) self::normalize($value ?? '');
        $length = mb_strlen($name);

        return $length >= self::MIN && $length <= self::MAX && preg_match(self::PATTERN, $name) === 1;
    }

    /**
     * Un compte « a un nom » quand les DEUX parties passent la règle. Un nom
     * qui ne la passe pas ne compte donc pas : le compte repasse une fois par
     * l'étape où il se présente.
     */
    public static function isComplete(?string $first, ?string $last): bool
    {
        return self::isValid($first) && self::isValid($last);
    }
}
