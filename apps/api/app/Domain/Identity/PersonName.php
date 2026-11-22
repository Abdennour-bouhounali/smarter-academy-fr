<?php

namespace App\Domain\Identity;

use Illuminate\Http\Request;

/**
 * « الاسم و اللقب » — LA règle d'un nom de personne, pour tous les rôles.
 *
 * Trois portes écrivent un nom (inscription, fin d'inscription Google, profil)
 * et elles doivent refuser et normaliser exactement la même chose : un élève
 * ne doit pas pouvoir s'appeler différemment selon la porte empruntée.
 * Le miroir côté navigateur est apps/web/src/utils/personName.js — il ne sert
 * qu'à afficher un message arabe avant l'aller-retour ; c'est ici qui fait foi.
 *
 * Ce qui est accepté : des lettres ARABES (depuis 2026-09-29, décision du
 * propriétaire — l'enseignant lit ses élèves dans l'écriture de l'interface),
 * leurs harakat, la tatweel, et entre deux lettres une espace ou un trait
 * d'union (« بن علي », « آيت-يحيى »). Refusés : les lettres latines (« Amine »),
 * les chiffres (y compris ٠-٩), la ponctuation, les emoji, les balises.
 */
final class PersonName
{
    public const MIN = 2;

    public const MAX = 50;

    /**
     * Une LETTRE arabe (`(?=\p{L})\p{Arabic}` : lettre ET écriture arabe, ce
     * qui écarte les chiffres ٠-٩ et la ponctuation arabes), puis des lettres
     * arabes, des harakat (\p{M}), la tatweel (U+0640), ou une espace / un
     * trait d'union suivis d'une lettre arabe. Miroir : utils/personName.js.
     */
    public const PATTERN = '/^(?=\p{L})\p{Arabic}(?:(?=\p{L})\p{Arabic}|\p{M}|\x{0640}|[ \-](?=\p{L})(?=\p{Arabic}))*$/u';

    /** Les champs tels que le client les envoie. */
    public const FIELDS = ['firstName', 'lastName'];

    /** Espaces de tête/queue retirés, espaces internes réduits à une seule. */
    public static function normalize(mixed $value): mixed
    {
        if (! is_string($value)) {
            return $value;
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

    /** Messages de débogage — le client n'affiche jamais le texte du serveur (apiMessage.js). */
    public static function messages(): array
    {
        return [
            'firstName.required' => 'Le prénom est obligatoire.',
            'lastName.required' => 'Le nom est obligatoire.',
            'firstName.regex' => 'Le prénom doit être écrit en lettres arabes.',
            'lastName.regex' => 'Le nom doit être écrit en lettres arabes.',
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
     * latin enregistré avant la règle arabe ne compte donc pas : le compte
     * repasse une fois par l'étape « عرّفنا بنفسك » pour l'écrire en arabe.
     */
    public static function isComplete(?string $first, ?string $last): bool
    {
        return self::isValid($first) && self::isValid($last);
    }
}
